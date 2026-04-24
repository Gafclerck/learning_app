/**
 * Chat System Types — JavaScript runtime constants
 * Replaces the TypeScript index.ts for Vite/JS projects
 */

// ============ CONVERSATION TYPE ============
export const ConversationType = Object.freeze({
  PRIVATE: "private",
  GROUP: "group",
})

// ============ CONNECTION STATUS ============
export const ConnectionStatus = Object.freeze({
  DISCONNECTED: "disconnected",
  CONNECTING: "connecting",
  CONNECTED: "connected",
  ERROR: "error",
})
