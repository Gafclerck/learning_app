/**
 * Chat Page
 * Main page for the chat module
 */

import React from "react"
import { ChatWindow } from "../modules/chat"

export default function ChatPage() {
  return (
    <div style={{ height: "calc(100vh - 100px)" }} className="flex flex-col -mx-6 -my-8">
      <ChatWindow />
    </div>
  )
}
