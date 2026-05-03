import React from "react"
import { ChatWindow } from "../modules/chat"

export default function ChatPage() {
  return (
    // On prend toute la hauteur disponible entre la navbar et le bas de l'écran
    // h-[calc(100vh-57px)] = hauteur viewport - hauteur navbar (57px)
    // overflow-hidden pour éviter le double scrollbar
    <div className="h-[calc(100vh-57px)] -mx-4 md:-mx-6 -my-8 overflow-hidden">
      <ChatWindow />
    </div>
  )
}
