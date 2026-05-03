import React, { useEffect, useRef, useState } from "react"
import { ConversationList } from "./ConversationList"
import { ChatPanel } from "./ChatPanel"
import { useChatStore } from "../store"
import { ConversationType } from "../types"
import useAuthStore from "../../../store/authStore"
import { getMyEnrollments } from "../../../services/enrollmentService"
import api from "../../../services/api"

export const ChatWindow = React.memo(() => {
  const active_room_id = useChatStore((s) => s.active_room_id)
  const user  = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)

  const [is_loading_conversations, setIsLoadingConversations] = useState(true)

  // Sur mobile, on affiche soit la liste, soit le panel — pas les deux
  // showPanel = true → on affiche le ChatPanel (après avoir cliqué une conversation)
  // showPanel = false → on affiche la ConversationList
  const [showPanel, setShowPanel] = useState(false)

  const loaded_ref = useRef(false)

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
          room_id: `course_${enrollment.course?.id || enrollment.course_id}`,
          course_id: enrollment.course?.id || enrollment.course_id,
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
        } catch {
          // Pas un teacher — normal
        }

        const all_convos = [...group_conversations, ...teacher_conversations]
        const unique = Array.from(
          new Map(all_convos.map((c) => [c.room_id, c])).values()
        )

        useChatStore.getState().setConversations(unique)
      } catch (error) {
        console.error("Failed to load conversations:", error)
      } finally {
        setIsLoadingConversations(false)
      }
    }

    loadConversations()
  }, [user, token])

  const handleSelectConversation = (room_id) => {
    useChatStore.getState().setActiveRoom(room_id)
    // Sur mobile → on passe à la vue panel
    setShowPanel(true)
  }

  const handleBack = () => {
    // Sur mobile → retour à la liste
    setShowPanel(false)
  }

  return (
    <div className="flex h-full bg-white">

      {/* 
        LOGIQUE RESPONSIVE :
        - Desktop (md+) : liste ET panel côte à côte → toujours visibles
        - Mobile        : soit la liste, soit le panel → jamais les deux

        Sur mobile :
          showPanel = false → ConversationList visible, ChatPanel caché
          showPanel = true  → ConversationList cachée, ChatPanel visible

        Les classes Tailwind utilisées :
          "hidden md:flex"   = caché sur mobile, flex sur desktop
          "flex md:hidden"   = flex sur mobile uniquement
          On contrôle aussi avec showPanel pour le mobile
      */}

      {/* ConversationList */}
      <div className={`
        ${showPanel ? "hidden" : "flex"}
        md:flex
        w-full md:w-80 flex-shrink-0 h-full
      `}>
        <ConversationList
          active_room_id={active_room_id}
          on_select={handleSelectConversation}
          is_loading={is_loading_conversations}
        />
      </div>

      {/* ChatPanel */}
      <div className={`
        ${showPanel ? "flex" : "hidden"}
        md:flex
        flex-1 min-w-0 h-full
      `}>
        <ChatPanel
          room_id={active_room_id}
          onBack={handleBack}
        />
      </div>

    </div>
  )
})

ChatWindow.displayName = "ChatWindow"
