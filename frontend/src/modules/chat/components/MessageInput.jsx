import React, { useRef } from "react"

// Icône envoyer
function SendIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  )
}

export const MessageInput = React.memo(({
  value,
  onChange,
  onSend,
  is_sending = false,
  placeholder = "Type a message...",
  disabled = false
}) => {
  const textarea_ref = useRef(null)

  const handleInput = (e) => {
    onChange(e.target.value)
    e.target.style.height = "auto"
    const scroll_height = Math.min(e.target.scrollHeight, 120)
    e.target.style.height = scroll_height + "px"
  }

  const handleKeyDown = (e) => {
    // Envoi avec Ctrl+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault()
      handleSend()
    }
    // Envoi simple avec Enter (sans Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSend = () => {
    if (value.trim() && !is_sending && !disabled) {
      onSend(value)
      onChange("")
      if (textarea_ref.current) {
        textarea_ref.current.style.height = "auto"
        textarea_ref.current.focus()
      }
    }
  }

  const canSend = value.trim() && !is_sending && !disabled

  return (
    <div className="border-t border-gray-200 bg-white px-4 py-3">
      <div className="flex items-end gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">

        <textarea
          ref={textarea_ref}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? "Connecting..." : placeholder}
          disabled={disabled || is_sending}
          rows={1}
          className="flex-1 resize-none bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed py-1"
          style={{ maxHeight: "120px" }}
        />

        {/* Bouton envoyer */}
        <button
          onClick={handleSend}
          disabled={!canSend}
          className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all mb-0.5 ${
            canSend
              ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          {is_sending ? (
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <SendIcon className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Hint discret */}
      <p className="text-[11px] text-gray-400 mt-1.5 text-center">
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  )
})

MessageInput.displayName = "MessageInput"
