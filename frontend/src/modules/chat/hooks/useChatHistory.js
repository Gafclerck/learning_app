/**
 * useChatHistory Hook
 * Loads chat history from REST API for a room
 */

import { useEffect, useCallback } from "react"
import { useChatStore } from "../store"
import { chatService } from "../services"
import useAuthStore from "../../../store/authStore"

// ✅ Référence stable — évite la création d'un nouveau [] à chaque render
const EMPTY_MESSAGES = []

export const useChatHistory = (room_id) => {
  const userId = useAuthStore((s) => s.user?.id)

  // ✅ Sélectionner uniquement les données scalaires/tableaux bruts — pas des fonctions
  const messages = useChatStore((s) => s.messages[room_id] ?? EMPTY_MESSAGES)
  const is_loading = useChatStore((s) => s.is_loading_history)

  const loadHistory = useCallback(async () => {
    if (!room_id) return

    // ✅ Appel ponctuel via getState() — pas de hook, pas de re-render
    const state = useChatStore.getState()
    if (state.history_loaded[room_id]) return

    state.setLoadingHistory(true)

    try {
      let result

      if (room_id.startsWith("course_")) {
        const courseId = room_id.split("_")[1]
        result = await chatService.getCourseHistory(parseInt(courseId))
      } else if (room_id.startsWith("private_")) {
        const parts = room_id.split("_")
        const userId1 = parseInt(parts[1])
        const userId2 = parseInt(parts[2])
        const otherUserId = userId === userId1 ? userId2 : userId1
        result = await chatService.getPrivateHistory(otherUserId)
      } else {
        throw new Error(`Invalid room_id format: ${room_id}`)
      }

      useChatStore.getState().setMessages(room_id, result)
      useChatStore.getState().markHistoryLoaded(room_id)
    } catch (error) {
      console.error(`Failed to load history for ${room_id}:`, error)
      useChatStore.getState().setConnectionError(error.message)
    } finally {
      useChatStore.getState().setLoadingHistory(false)
    }
  }, [room_id, userId])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  return {
    messages,
    is_loading,
    error: null,
    reload: loadHistory,
  }
}
