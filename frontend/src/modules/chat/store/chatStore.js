/**
 * Chat Store (Zustand)
 * Centralized state management for chat system
 */

import { create } from "zustand";
import { ConnectionStatus, ConversationType } from "../types";


export const useChatStore = create((set, get) => ({
  // ============ INITIAL STATE ============
  conversations: [],
  active_room_id: null,
  messages: {},
  connection_status: ConnectionStatus.DISCONNECTED,
  connection_error: null,
  is_loading_conversations: false,
  is_loading_history: false,
  is_sending_message: false,
  history_loaded: {},

  // ============ CONVERSATION ACTIONS ============

  setConversations: (conversations) => set({ conversations }),

  addConversation: (conversation) =>
    set((state) => {
      // Check if already exists
      const exists = state.conversations.some(
        (c) => c.room_id === conversation.room_id,
      );
      if (exists) return state;
      return { conversations: [conversation, ...state.conversations] };
    }),

  updateConversation: (room_id, updates) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.room_id === room_id ? { ...c, ...updates } : c,
      ),
    })),

  removeConversation: (room_id) =>
    set((state) => ({
      conversations: state.conversations.filter((c) => c.room_id !== room_id),
    })),

  // ============ ACTIVE ROOM ACTIONS ============

  setActiveRoom: (room_id) => set({ active_room_id: room_id }),

  // ============ MESSAGE ACTIONS ============

  setMessages: (room_id, messages) =>
    set((state) => ({
      messages: { ...state.messages, [room_id]: messages },
    })),

  addMessage: (room_id, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [room_id]: [...(state.messages[room_id] || []), message],
      },
    })),

  prependMessages: (room_id, messages) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [room_id]: [...messages, ...(state.messages[room_id] || [])],
      },
    })),

  replaceOptimisticMessage: (room_id, temp_id, actual_message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [room_id]: (state.messages[room_id] || []).map((m) =>
          m.id === temp_id ? actual_message : m,
        ),
      },
    })),

  clearMessages: (room_id) =>
    set((state) => {
      const { [room_id]: _, ...remaining } = state.messages;
      return { messages: remaining };
    }),

  clearAllMessages: () => set({ messages: {} }),

  // ============ CONNECTION ACTIONS ============

  setConnectionStatus: (status) => set({ connection_status: status }),

  setConnectionError: (error) => set({ connection_error: error }),

  // ============ LOADING ACTIONS ============

  setLoadingConversations: (loading) =>
    set({ is_loading_conversations: loading }),

  setLoadingHistory: (loading) => set({ is_loading_history: loading }),

  setLoadingSendMessage: (loading) => set({ is_sending_message: loading }),

  // ============ HISTORY TRACKING ============

  markHistoryLoaded: (room_id) =>
    set((state) => ({
      history_loaded: { ...state.history_loaded, [room_id]: true },
    })),

  isHistoryLoaded: (room_id) => get().history_loaded[room_id] === true,

  // ============ SELECTORS ============

  getConversationByRoomId: (room_id) =>
    get().conversations.find((c) => c.room_id === room_id),

  getMessagesByRoomId: (room_id) => get().messages[room_id] || [],

  getGroupConversations: () =>
    get().conversations.filter((c) => c.type === ConversationType.GROUP),

  getPrivateConversations: () =>
    get().conversations.filter((c) => c.type === ConversationType.PRIVATE),

  // ============ SORTING & SEARCHING ============

  getSortedConversations: () => {
    const conversations = get().conversations;
    return [...conversations].sort((a, b) => {
      const timeA = new Date(a.last_message_time || 0).getTime();
      const timeB = new Date(b.last_message_time || 0).getTime();
      return timeB - timeA;
    });
  },

  searchConversations: (query) => {
    if (!query.trim()) return get().conversations;

    const lower = query.toLowerCase();
    return get().conversations.filter((c) => {
      if (c.type === ConversationType.PRIVATE) {
        return c.other_user_name.toLowerCase().includes(lower);
      } else {
        return c.course_name.toLowerCase().includes(lower);
      }
    });
  },

  // ============ RESET ============

  reset: () =>
    set({
      conversations: [],
      active_room_id: null,
      messages: {},
      connection_status: ConnectionStatus.DISCONNECTED,
      connection_error: null,
      is_loading_conversations: false,
      is_loading_history: false,
      is_sending_message: false,
      history_loaded: {},
    }),
}));

export default useChatStore;
