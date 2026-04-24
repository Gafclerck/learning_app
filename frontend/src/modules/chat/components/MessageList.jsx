/**
 * MessageList Component
 * Displays all messages in a room with auto-scroll to bottom
 */

import React, { useEffect, useRef } from "react"
import { Message } from "./Message"
import useAuthStore from "../../../store/authStore"

export const MessageList = React.memo(({
  messages = [],
  is_loading = false,
  is_group_chat = false,
  room_id
}) => {
  const auth = useAuthStore()
  const messages_end_ref = useRef(null)
  const container_ref = useRef(null)
  const last_message_count = useRef(0)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > last_message_count.current) {
      setTimeout(() => {
        messages_end_ref.current?.scrollIntoView({ behavior: "smooth" })
      }, 0)
      last_message_count.current = messages.length
    }
  }, [messages])

  if (is_loading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="animate-pulse">Loading messages...</div>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-600">
        <div className="text-center">
          <p className="text-lg font-medium mb-1">No messages yet</p>
          <p className="text-sm">Start a conversation by sending a message</p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={container_ref}
      className="flex-1 overflow-y-auto px-4 py-4 space-y-2 scroll-smooth"
    >
      {messages.map((message) => (
        <Message
          key={message.id}
          message={message}
          is_sent={message.sender_id === auth.user?.id}
          sender_name={message.sender_name}
          show_sender={is_group_chat && message.sender_id !== auth.user?.id}
        />
      ))}
      <div ref={messages_end_ref} />
    </div>
  )
})

MessageList.displayName = "MessageList"
