/**
 * useChatConnection Hook
 * Manages WebSocket connection lifecycle for a chat room
 */

import { useEffect, useCallback, useRef } from "react"
import { useChatStore } from "../store"
import { wsManager, chatService } from "../services"
import { ConnectionStatus } from "../types"
import useAuthStore from "../../../store/authStore"

export const useChatConnection = (room_id, options = {}) => {
  const { onError = null, auto_reconnect = true, max_retries = 5 } = options

  const token = useAuthStore((s) => s.token)
  const userId = useAuthStore((s) => s.user?.id)

  const connection_status = useChatStore((s) => s.connection_status)
  const connection_error = useChatStore((s) => s.connection_error)

  // ✅ useRef — persiste entre les renders sans provoquer de re-render
  // Un objet normal { current: 0 } se réinitialise à chaque render
  const retryCount = useRef(0)
  const retryTimeout = useRef(null)

  const connect = useCallback(async () => {
    if (!room_id || !token) {
      console.warn("[Chat] Missing room_id or token")
      return
    }

    if (wsManager.isConnected(room_id)) return

    useChatStore.getState().setConnectionStatus(ConnectionStatus.CONNECTING)

    try {
      let endpoint
      if (room_id.startsWith("course_")) {
        const courseId = room_id.split("_")[1]
        endpoint = `ws/course/${courseId}`
      } else if (room_id.startsWith("private_")) {
        const parts = room_id.split("_")
        const userId1 = parseInt(parts[1])
        const userId2 = parseInt(parts[2])
        const otherUserId = userId === userId1 ? userId2 : userId1
        endpoint = `ws/private/${otherUserId}`
      } else {
        throw new Error(`Invalid room_id format: ${room_id}`)
      }

      const ws_url = chatService.getWebSocketUrl(endpoint, token)

      await wsManager.connect(
        room_id,
        ws_url,
        // onMessage
        (message) => {
          if (message.type === "message") {
            useChatStore.getState().addMessage(room_id, {
              id: message.id,
              content: message.content,
              sender_id: message.sender_id,
              sender_name: message.sender_name,
              created_at: message.created_at,
              room_id: message.room_id,
            })
            useChatStore.getState().updateConversation(room_id, {
              last_message: message.content,
              last_message_time: message.created_at,
            })
          } else if (message.type === "system") {
            console.log(`[System] ${message.content}`)
          }
        },
        // onError
        (error) => {
          console.error(`[WS Error] ${room_id}:`, error)
          useChatStore.getState().setConnectionStatus(ConnectionStatus.ERROR)
          useChatStore.getState().setConnectionError(error?.message || "Connection error")
          onError?.(error?.message || "Connection error")

          if (auto_reconnect && retryCount.current < max_retries) {
            const delay = Math.pow(2, retryCount.current) * 1000
            retryCount.current++
            if (retryTimeout.current) clearTimeout(retryTimeout.current)
            retryTimeout.current = setTimeout(connect, delay)
          }
        },
        // onClose
        () => {
          if (!wsManager.isConnected(room_id)) {
            useChatStore.getState().setConnectionStatus(ConnectionStatus.DISCONNECTED)
          }
        },
      )

      useChatStore.getState().setConnectionStatus(ConnectionStatus.CONNECTED)
      useChatStore.getState().setConnectionError(null)
      retryCount.current = 0
    } catch (error) {
      console.error(`[Connection Error] ${room_id}:`, error)
      useChatStore.getState().setConnectionStatus(ConnectionStatus.ERROR)
      useChatStore.getState().setConnectionError(error.message)
      onError?.(error.message)
    }
  }, [room_id, token, userId, onError, auto_reconnect, max_retries])

  const disconnect = useCallback(() => {
    if (retryTimeout.current) clearTimeout(retryTimeout.current)
    wsManager.disconnect(room_id)
    useChatStore.getState().setConnectionStatus(ConnectionStatus.DISCONNECTED)
  }, [room_id])

  const send = useCallback(
    (content) => {
      try {
        wsManager.send(room_id, { content })
      } catch (error) {
        console.error(`[Send Error] ${room_id}:`, error)
        throw error
      }
    },
    [room_id],
  )

  useEffect(() => {
    if (!room_id) return
    connect()
    return () => {
      disconnect()
    }
  }, [room_id, connect, disconnect])

  return {
    is_connected: wsManager.isConnected(room_id),
    status: connection_status,
    error: connection_error,
    send,
    disconnect,
    reconnect: connect,
  }
}
