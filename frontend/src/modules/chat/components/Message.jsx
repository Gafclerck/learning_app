/**
 * Message Component
 * Displays a single message (sent or received)
 */

import React from "react"
import { formatDistanceToNow } from "../utils/formatters"

export const Message = React.memo(({ message, is_sent, sender_name, show_sender }) => {
  const isSent = is_sent

  return (
    <div
      className={`flex gap-2 mb-3 ${isSent ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-xs rounded-lg px-4 py-2 ${
          isSent
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
        }`}
      >
        {show_sender && !isSent && (
          <div className="text-xs font-semibold mb-1 opacity-75">{sender_name}</div>
        )}
        <p className="text-sm break-words">{message.content}</p>
        <div
          className={`text-xs mt-1 ${
            isSent ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
          }`}
        >
          {formatDistanceToNow(message.created_at)}
        </div>
      </div>
    </div>
  )
})

Message.displayName = "Message"
