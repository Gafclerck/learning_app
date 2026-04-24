/**
 * ChatPanel Component
 * Right panel displaying the active chat with messages and input
 */

import React, { useState, useMemo } from "react"
import { MessageList } from "./MessageList"
import { MessageInput } from "./MessageInput"
import { useChatHistory } from "../hooks/useChatHistory"
import { useSendMessage } from "../hooks/useSendMessage"
import { useChatStore } from "../store"
import { ConnectionStatus } from "../types"

export const ChatPanel = React.memo(({ room_id }) => {
  const [input_value, setInputValue] = useState("")

  // ✅ Sélectionner uniquement les données brutes
  const conversations = useChatStore((s) => s.conversations)
  const connection_status = useChatStore((s) => s.connection_status)

  // ✅ Trouver la conversation de manière stable
  const conversation = useMemo(() => 
    conversations.find((c) => c.room_id === room_id)
  , [conversations, room_id])

  const { messages, is_loading: is_loading_history } = useChatHistory(room_id)
  const { send, is_sending } = useSendMessage(room_id)

  const is_group_chat = room_id?.startsWith("course_")

  if (!room_id) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-950 text-gray-400">
        <div className="text-center">
          <p className="text-lg font-medium">Select a conversation to start</p>
        </div>
      </div>
    )
  }

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-950 text-gray-400">
        <div className="text-center">
          <p className="text-lg font-medium">Conversation not found</p>
        </div>
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

  const title =
    conversation.type === "private"
      ? conversation.other_user_name
      : conversation.course_name

  const subtitle =
    conversation.type === "group"
      ? `Group chat • ${conversation.teacher_name}`
      : ""

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-950">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              connection_status === ConnectionStatus.CONNECTED
                ? "bg-green-500"
                : connection_status === ConnectionStatus.CONNECTING
                ? "bg-yellow-500"
                : "bg-red-500"
            }`}
            title={`Status: ${connection_status}`}
          />
        </div>
      </div>

      {/* Messages */}
      <MessageList
        messages={messages}
        is_loading={is_loading_history}
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
        placeholder={
          connection_status !== ConnectionStatus.CONNECTED
            ? "Connecting..."
            : "Type a message..."
        }
      />
    </div>
  )
})

ChatPanel.displayName = "ChatPanel"
