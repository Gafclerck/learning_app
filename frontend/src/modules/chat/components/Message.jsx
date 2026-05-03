import React from "react"
import { formatDistanceToNow } from "../utils/formatters"

function getInitials(name) {
  if (!name) return "?"
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
}

// Couleur d'avatar déterministe basée sur le nom
function getAvatarColor(name) {
  const colors = [
    "bg-blue-500", "bg-purple-500", "bg-green-500",
    "bg-orange-500", "bg-pink-500", "bg-teal-500",
  ]
  if (!name) return colors[0]
  const index = name.charCodeAt(0) % colors.length
  return colors[index]
}

export const Message = React.memo(({ message, is_sent, sender_name, show_sender }) => {
  return (
    <div className={`flex gap-2.5 mb-4 ${is_sent ? "justify-end" : "justify-start"}`}>

      {/* Avatar — seulement pour les messages reçus */}
      {!is_sent && (
        <div className={`w-8 h-8 rounded-full ${getAvatarColor(sender_name)} text-white text-xs font-bold flex items-center justify-center flex-shrink-0 self-end mb-1`}>
          {getInitials(sender_name)}
        </div>
      )}

      <div className={`flex flex-col ${is_sent ? "items-end" : "items-start"} max-w-[70%]`}>

        {/* Nom de l'expéditeur — groupe uniquement */}
        {show_sender && !is_sent && (
          <span className="text-xs font-semibold text-gray-500 mb-1 px-1">
            {sender_name}
          </span>
        )}

        {/* Bulle du message */}
        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
          is_sent
            ? "bg-blue-600 text-white rounded-br-sm"
            : "bg-white border border-gray-200 text-gray-900 rounded-bl-sm shadow-sm"
        }`}>
          {message.content}
        </div>

        {/* Timestamp */}
        <span className="text-[11px] text-gray-400 mt-1 px-1">
          {formatDistanceToNow(message.created_at)}
        </span>

      </div>

      {/* Avatar pour les messages envoyés — côté droit */}
      {is_sent && (
        <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 self-end mb-1">
          You
        </div>
      )}

    </div>
  )
})

Message.displayName = "Message"
