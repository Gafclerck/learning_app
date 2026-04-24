/**
 * useSendMessage Hook
 * Sends messages with optimistic UI updates
 */

import { useCallback } from "react"
import { useChatStore } from "../store"
import { useChatConnection } from "./useChatConnection"
import useAuthStore from "../../../store/authStore"

export const useSendMessage = (room_id, options = {}) => {
  const { optimistic_ui = true, on_error = null } = options

  // ✅ Sélectionner uniquement les données scalaires brutes
  const userId = useAuthStore((s) => s.user?.id)
  const userName = useAuthStore((s) => s.user?.name)
  const is_sending = useChatStore((s) => s.is_sending_message)

  const { send: ws_send } = useChatConnection(room_id)

  const send = useCallback(
    async (content) => {
      if (!content.trim()) {
        console.warn("[Send] Empty message content")
        return
      }

      const temp_id = `temp_${Date.now()}_${Math.random()}`

      if (optimistic_ui) {
        // ✅ Appel ponctuel via getState() — pas de hook = pas de re-render
        useChatStore.getState().addMessage(room_id, {
          id: temp_id,
          content,
          sender_id: userId,
          sender_name: userName,
          created_at: new Date().toISOString(),
          room_id,
          type: "message",
        })
      }

      try {
        useChatStore.getState().setLoadingSendMessage(true)
        ws_send(content)
      } catch (error) {
        console.error(`[Send Error] ${room_id}:`, error)

        // ✅ Retirer le message optimiste sans vider tout le store
        if (optimistic_ui) {
          const current = useChatStore.getState().messages[room_id] || []
          useChatStore.getState().setMessages(room_id, current.filter((m) => m.id !== temp_id))
        }

        on_error?.(error.message)
        throw error
      } finally {
        useChatStore.getState().setLoadingSendMessage(false)
      }
    },
    [room_id, ws_send, userId, userName, optimistic_ui, on_error],
  )

  return {
    send,
    is_sending,
  }
}
