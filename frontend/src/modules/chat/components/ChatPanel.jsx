import React, { useState, useMemo } from "react"
import { MessageList } from "./MessageList"
import { MessageInput } from "./MessageInput"
import { useChatHistory } from "../hooks/useChatHistory"
import { useSendMessage } from "../hooks/useSendMessage"
import { useChatStore } from "../store"
import { ConnectionStatus } from "../types"

// Indicateur de statut de connexion animé
function StatusDot({ status }) {
  const config = {
    [ConnectionStatus.CONNECTED]:    { color: "bg-green-500", label: "Connected" },
    [ConnectionStatus.CONNECTING]:   { color: "bg-yellow-400 animate-pulse", label: "Connecting..." },
    [ConnectionStatus.DISCONNECTED]: { color: "bg-gray-400", label: "Disconnected" },
    [ConnectionStatus.ERROR]:        { color: "bg-red-500", label: "Connection error" },
  }
  const c = config[status] || config[ConnectionStatus.DISCONNECTED]
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-2 h-2 rounded-full ${c.color}`} />
      <span className="text-xs text-gray-500">{c.label}</span>
    </div>
  )
}

function getInitials(name) {
  if (!name) return "?"
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
}

export const ChatPanel = React.memo(({ room_id, onBack }) => {
  const [input_value, setInputValue] = useState("")

  const conversations     = useChatStore((s) => s.conversations)
  const connection_status = useChatStore((s) => s.connection_status)

  const conversation = useMemo(
    () => conversations.find((c) => c.room_id === room_id),
    [conversations, room_id]
  )

  const { messages, is_loading } = useChatHistory(room_id)
  const { send, is_sending }     = useSendMessage(room_id)

  const is_group_chat = room_id?.startsWith("course_")

  // État vide — aucune conversation sélectionnée
  if (!room_id) {
    return (
      <div className="flex-1 hidden md:flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <p className="text-gray-600 font-semibold text-lg">Select a conversation</p>
          <p className="text-gray-400 text-sm mt-1">
            Choose from your conversations on the left
          </p>
        </div>
      </div>
    )
  }

  if (!conversation) {
    return (
      <div className="flex-1 hidden md:flex items-center justify-center bg-gray-50">
        <p className="text-gray-400">Conversation not found</p>
      </div>
    )
  }

  const handleSend = async (content) => {
    try {
      await send(content)
      setInputValue("")
    } catch (error) {
      console.error("Failed to send message:", error)
    }
  }

  const title    = conversation.type === "private"
    ? conversation.other_user_name
    : conversation.course_name

  const subtitle = conversation.type === "group"
    ? `Group chat · ${conversation.teacher_name}`
    : "Private message"

  return (
    <div className="flex-1 flex flex-col bg-white min-w-0">

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-200 bg-white">

        {/* Bouton retour — visible seulement sur mobile */}
        <button
          onClick={onBack}
          className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 flex-shrink-0"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Avatar de la conversation */}
        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 text-sm font-bold flex items-center justify-center flex-shrink-0">
          {is_group_chat ? "📚" : getInitials(title)}
        </div>

        {/* Titre + sous-titre */}
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-gray-900 truncate">{title}</h2>
          <p className="text-xs text-gray-500 truncate">{subtitle}</p>
        </div>

        {/* Statut connexion */}
        <StatusDot status={connection_status} />
      </div>

      {/* Messages */}
      <MessageList
        messages={messages}
        is_loading={is_loading}
        is_group_chat={is_group_chat}
        room_id={room_id}
      />

      {/* Input */}
      <MessageInput
        value={input_value}
        onChange={setInputValue}
        onSend={handleSend}
        is_sending={is_sending}
        disabled={connection_status !== ConnectionStatus.CONNECTED}
        placeholder="Type a message..."
      />
    </div>
  )
})

ChatPanel.displayName = "ChatPanel"
