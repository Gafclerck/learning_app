import React, { useState, useCallback, useMemo } from "react"
import { ConversationListItem } from "./ConversationListItem"
import { useChatStore } from "../store"

export const ConversationList = React.memo(({
  active_room_id,
  on_select,
  is_loading = false,
}) => {
  const conversations  = useChatStore((s) => s.conversations)
  const [search_query, setSearchQuery] = useState("")

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
    (conversation) => on_select(conversation.room_id),
    [on_select]
  )

  return (
    <div className="w-full md:w-80 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col h-full">

      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Messages</h2>
        <div className="relative">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search..."
            value={search_query}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Liste */}
      <div className="flex-1 overflow-y-auto">
        {is_loading && conversations.length === 0 ? (
          <div className="flex flex-col gap-3 p-4">
            {[1,2,3].map(i => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-2 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered_conversations.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-center px-4">
            <div>
              <div className="text-3xl mb-2">💬</div>
              <p className="text-sm text-gray-500 font-medium">
                {search_query ? "No results found" : "No conversations yet"}
              </p>
              {!search_query && (
                <p className="text-xs text-gray-400 mt-1">
                  Enroll in a course to start chatting
                </p>
              )}
            </div>
          </div>
        ) : (
          filtered_conversations.map((conversation) => (
            <ConversationListItem
              key={conversation.room_id}
              conversation={conversation}
              is_active={conversation.room_id === active_room_id}
              onClick={() => handleSelect(conversation)}
            />
          ))
        )}
      </div>
    </div>
  )
})

ConversationList.displayName = "ConversationList"
