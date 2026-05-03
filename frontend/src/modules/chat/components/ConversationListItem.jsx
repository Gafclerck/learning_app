import React from "react"
import { getConversationTitle, getConversationSubtitle } from "../utils/formatters"

function getInitials(name) {
  if (!name) return "?"
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
}

function getAvatarColor(name) {
  const colors = [
    "bg-blue-500", "bg-purple-500", "bg-green-500",
    "bg-orange-500", "bg-pink-500", "bg-teal-500",
  ]
  if (!name) return colors[0]
  return colors[name.charCodeAt(0) % colors.length]
}

export const ConversationListItem = React.memo(({
  conversation,
  is_active = false,
  onClick,
}) => {
  const title    = getConversationTitle(conversation)
  const subtitle = getConversationSubtitle(conversation)

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-colors border-b border-gray-100 ${
        is_active
          ? "bg-blue-50 border-l-2 border-l-blue-600"
          : "hover:bg-gray-50 border-l-2 border-l-transparent"
      }`}
    >
      {/* Avatar */}
      <div className={`w-10 h-10 rounded-full ${getAvatarColor(title)} text-white text-sm font-bold flex items-center justify-center flex-shrink-0`}>
        {conversation.type === "group" ? "📚" : getInitials(title)}
      </div>

      {/* Infos */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className={`text-sm font-semibold truncate ${is_active ? "text-blue-700" : "text-gray-900"}`}>
            {title}
          </h3>
          {conversation.unread_count > 0 && (
            <span className="bg-blue-600 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 flex-shrink-0 font-medium">
              {conversation.unread_count > 99 ? "99+" : conversation.unread_count}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 truncate mt-0.5">{subtitle}</p>
        {conversation.last_message && (
          <p className="text-xs text-gray-400 truncate mt-0.5">
            {conversation.last_message}
          </p>
        )}
      </div>
    </div>
  )
})

ConversationListItem.displayName = "ConversationListItem"
