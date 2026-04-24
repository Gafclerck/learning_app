/**
 * MessageInput Component
 * Input field for composing messages with auto-expand
 */

import React, { useRef, useEffect } from "react"

export const MessageInput = React.memo(({
  value,
  onChange,
  onSend,
  is_sending = false,
  placeholder = "Type a message...",
  disabled = false
}) => {
  const textarea_ref = useRef(null)

  // Auto-expand textarea height
  const handleInput = (e) => {
    onChange(e.target.value)
    
    // Reset height to calculate scroll height
    e.target.style.height = "auto"
    const scroll_height = Math.min(e.target.scrollHeight, 120) // Max 120px (5 lines)
    e.target.style.height = scroll_height + "px"
  }

  const handleKeyDown = (e) => {
    // Send on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSend = () => {
    if (value.trim() && !is_sending && !disabled) {
      onSend(value)
      // Clear input
      onChange("")
      // Reset textarea height
      if (textarea_ref.current) {
        textarea_ref.current.style.height = "auto"
      }
    }
  }

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 p-4">
      <div className="flex gap-2">
        <textarea
          ref={textarea_ref}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || is_sending}
          className="flex-1 resize-none rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          rows="1"
          style={{ maxHeight: "120px" }}
        />
        <button
          onClick={handleSend}
          disabled={!value.trim() || is_sending || disabled}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {is_sending ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </>
          ) : (
            <>Send</>
          )}
        </button>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        Ctrl+Enter to send
      </p>
    </div>
  )
})

MessageInput.displayName = "MessageInput"
