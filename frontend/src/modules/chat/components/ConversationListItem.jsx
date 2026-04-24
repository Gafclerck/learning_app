/**
 * ConversationListItem Component
 * Single conversation in the left panel list
 */

import React from "react"
import { getConversationTitle, getConversationSubtitle } from "../utils/formatters"

export const ConversationListItem = React.memo(({
  conversation,
  is_active = false,
  onClick,
  unread_indicator = false
}) => {
  const title = getConversationTitle(conversation)
  const subtitle = getConversationSubtitle(conversation)

  return (
    <div
      onClick={onClick}
      className={`p-3 border-b border-gray-100 dark:border-gray-800 cursor-pointer transition-colors ${
        is_active
          ? "bg-blue-50 dark:bg-gray-800"
          : "hover:bg-gray-50 dark:hover:bg-gray-900"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {title}
            </h3>
            {conversation.type === "group" && (
              <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full flex-shrink-0">
                Group
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
            {subtitle}
          </p>
        </div>
        {unread_indicator && conversation.unread_count > 0 && (
          <div className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
            {conversation.unread_count > 99 ? "99+" : conversation.unread_count}
          </div>
        )}
      </div>
    </div>
  )
})

ConversationListItem.displayName = "ConversationListItem"
