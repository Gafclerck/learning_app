/**
 * Chat Formatters
 * Utility functions for formatting chat data
 */

/**
 * Format a datetime to relative time (e.g., "2 hours ago")
 */
export const formatDistanceToNow = (dateString) => {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    // Fallback to date
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (err) {
    console.error("formatDistanceToNow error:", err);
    return "";
  }
};

/**
 * Truncate text to a max length
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

/**
 * Format conversation title based on type
 */
export const getConversationTitle = (conversation) => {
  if (conversation.type === "private") {
    return conversation.other_user_name;
  }
  return conversation.course_name;
};

/**
 * Format conversation subtitle (last message preview)
 */
export const getConversationSubtitle = (conversation) => {
  if (!conversation.last_message) {
    return "No messages yet";
  }
  return truncateText(conversation.last_message, 40);
};
