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
  const last_message_count = useRef(0)

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
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading messages...</span>
        </div>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-5xl mb-4">💬</div>
          <p className="text-gray-600 font-medium">No messages yet</p>
          <p className="text-gray-400 text-sm mt-1">
            Be the first to say something!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50">
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
