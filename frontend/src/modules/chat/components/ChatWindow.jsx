/**
 * ChatWindow Component
 * Main chat orchestrator - combines ConversationList and ChatPanel
 */

import React, { useEffect, useRef, useState } from "react"
import { ConversationList } from "./ConversationList"
import { ChatPanel } from "./ChatPanel"
import { useChatStore } from "../store"
import { ConversationType } from "../types"
import useAuthStore from "../../../store/authStore"
import { getMyEnrollments } from "../../../services/enrollmentService"
import api from "../../../services/api"

export const ChatWindow = React.memo(() => {
  // ✅ Sélectionner uniquement les primitives (stables)
  const active_room_id = useChatStore((s) => s.active_room_id)
  
  const user = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)

  const [is_loading_conversations, setIsLoadingConversations] = useState(true)

  // Utiliser une ref pour éviter les appels multiples
  const loaded_ref = useRef(false)

  // Load conversations on mount
  useEffect(() => {
    if (!user || !token) return
    if (loaded_ref.current) return
    loaded_ref.current = true

    const loadConversations = async () => {
      setIsLoadingConversations(true)
      try {
        const enrollments = await getMyEnrollments()

        const group_conversations = enrollments.map((enrollment) => ({
          type: ConversationType.GROUP,
          room_id: `course_${enrollment.course_id}`,
          course_id: enrollment.course_id,
          course_name: enrollment.course?.title || `Course ${enrollment.course_id}`,
          teacher_name: enrollment.course?.teacher_name || "Teacher",
          is_teacher: false,
          is_enrolled: true,
          last_message: null,
          last_message_time: null,
          unread_count: 0,
        }))

        let teacher_conversations = []
        try {
          const my_courses = await api.get("/api/courses/my")
          teacher_conversations = my_courses.data.map((course) => ({
            type: ConversationType.GROUP,
            room_id: `course_${course.id}`,
            course_id: course.id,
            course_name: course.title,
            teacher_name: user.name,
            is_teacher: true,
            is_enrolled: false,
            last_message: null,
            last_message_time: null,
            unread_count: 0,
          }))
        } catch (err) {
          console.warn("User is not a teacher or error fetching teacher courses")
        }

        const all_group_convos = [...group_conversations, ...teacher_conversations]
        const unique_groups = Array.from(
          new Map(all_group_convos.map((conv) => [conv.room_id, conv])).values()
        )

        // ✅ Utiliser getState() pour les actions dans les effets
        useChatStore.getState().setConversations(unique_groups)
      } catch (error) {
        console.error("Failed to load conversations:", error)
        useChatStore.getState().setConnectionError(error.message)
      } finally {
        setIsLoadingConversations(false)
      }
    }

    loadConversations()
  }, [user, token]) // Dépendances minimales

  const handleSelectConversation = (room_id) => {
    useChatStore.getState().setActiveRoom(room_id)
  }

  return (
    <div className="flex h-full bg-white dark:bg-gray-950">
      <ConversationList
        active_room_id={active_room_id}
        on_select={handleSelectConversation}
        is_loading={is_loading_conversations}
      />
      <ChatPanel room_id={active_room_id} />
    </div>
  )
})

ChatWindow.displayName = "ChatWindow"
