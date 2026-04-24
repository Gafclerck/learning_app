/**
 * Chat API Service
 * Handles all chat-related API calls (REST endpoints)
 */

import api from "../../../services/api";

class ChatService {
  /**
   * Get chat history for a group (course-based) chat
   */
  async getCourseHistory(courseId) {
    try {
      const response = await api.get(`/api/chat/history/course/${courseId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch course chat history:`, error);
      throw error;
    }
  }

  /**
   * Get chat history for a private chat
   */
  async getPrivateHistory(otherUserId) {
    try {
      const response = await api.get(
        `/api/chat/history/private/${otherUserId}`,
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch private chat history:`, error);
      throw error;
    }
  }

  /**
   * Construct WebSocket URL with JWT token
   */
  getWebSocketUrl(endpoint, token) {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const baseUrl = "localhost:8000"; // Fallback directly for local dev
    return `${protocol}//${baseUrl}/api/chat/${endpoint}?token=${token}`;
  }
}

export default new ChatService();
