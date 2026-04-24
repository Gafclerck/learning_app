/**
 * ConversationList Component
 * Left panel showing all conversations with search
 */

import React, { useState, useCallback, useMemo } from "react"
import { ConversationListItem } from "./ConversationListItem"
import { useChatStore } from "../store"

export const ConversationList = React.memo(({
  active_room_id,
  on_select,
  is_loading = false
}) => {
  // ✅ Sélectionner la donnée BRUTE — pas une fonction qui retourne un nouveau tableau
  const conversations = useChatStore((s) => s.conversations)
  const [search_query, setSearchQuery] = useState("")

  // ✅ Tri et filtrage dans useMemo — stable, ne crée pas de nouvelle ref à chaque render
  const filtered_conversations = useMemo(() => {
    const lower = search_query.toLowerCase().trim()

    const filtered = lower
      ? conversations.filter((c) => {
          if (c.type === "private") return c.other_user_name?.toLowerCase().includes(lower)
          return c.course_name?.toLowerCase().includes(lower)
        })
      : conversations

    return [...filtered].sort((a, b) => {
      const timeA = new Date(a.last_message_time || 0).getTime()
      const timeB = new Date(b.last_message_time || 0).getTime()
      return timeB - timeA
    })
  }, [conversations, search_query])

  const handleSelect = useCallback(
    (conversation) => {
      on_select(conversation.room_id)
    },
    [on_select]
  )

  if (is_loading && conversations.length === 0) {
    return (
      <div className="w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-full">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Messages
          </h2>
          <div className="bg-gray-200 dark:bg-gray-700 h-10 rounded-lg animate-pulse" />
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <div className="animate-pulse">Loading conversations...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Messages
        </h2>
        <input
          type="text"
          placeholder="Search conversations..."
          value={search_query}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* List */}
      {filtered_conversations.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-600">
          <div className="text-center">
            <p className="text-sm">
              {search_query ? "No conversations found" : "No conversations yet"}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {filtered_conversations.map((conversation) => (
            <ConversationListItem
              key={conversation.room_id}
              conversation={conversation}
              is_active={conversation.room_id === active_room_id}
              onClick={() => handleSelect(conversation)}
              unread_indicator={true}
            />
          ))}
        </div>
      )}
    </div>
  )
})

ConversationList.displayName = "ConversationList"
