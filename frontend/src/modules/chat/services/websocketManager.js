/**
 * WebSocket Manager
 * Manages WebSocket connections for real-time chat
 */


export class WebSocketManager {
  constructor() {
    this.connections = {}; // { room_id: WebSocket }
    this.listeners = {}; // { room_id: [callbacks] }
    this.retry_counts = {}; // { room_id: count }
    this.max_retries = 5;
    this.retry_delay = 1000; // ms
  }

  /**
   * Connect to a chat room WebSocket
   */
  connect(room_id, ws_url, onMessage, onError, onClose) {
    return new Promise((resolve, reject) => {
      try {
        const ws = new WebSocket(ws_url);

        ws.onopen = () => {
          console.log(`[WS] Connected to room: ${room_id}`);
          this.connections[room_id] = ws;
          this.listeners[room_id] = [onMessage];
          this.retry_counts[room_id] = 0;
          resolve(ws);
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this._notifyListeners(room_id, message);
          } catch (err) {
            console.error(`[WS] Failed to parse message:`, err);
          }
        };

        ws.onerror = (error) => {
          console.error(`[WS] Error in room ${room_id}:`, error);
          onError?.(error);
        };

        ws.onclose = () => {
          console.log(`[WS] Disconnected from room: ${room_id}`);
          delete this.connections[room_id];
          onClose?.();
        };
      } catch (error) {
        console.error(`[WS] Connection failed:`, error);
        reject(error);
      }
    });
  }

  /**
   * Send a message through WebSocket
   */
  send(room_id, message) {
    const ws = this.connections[room_id];
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      throw new Error(`WebSocket not connected for room: ${room_id}`);
    }
    ws.send(JSON.stringify(message));
  }

  /**
   * Subscribe to messages in a room
   */
  subscribe(room_id, callback) {
    if (!this.listeners[room_id]) {
      this.listeners[room_id] = [];
    }
    this.listeners[room_id].push(callback);

    // Return unsubscribe function
    return () => {
      this.listeners[room_id] = this.listeners[room_id].filter(
        (cb) => cb !== callback,
      );
    };
  }

  /**
   * Disconnect from a room
   */
  disconnect(room_id) {
    const ws = this.connections[room_id];
    if (ws) {
      ws.close();
      delete this.connections[room_id];
      delete this.listeners[room_id];
    }
  }

  /**
   * Check if connected to a room
   */
  isConnected(room_id) {
    const ws = this.connections[room_id];
    return ws && ws.readyState === WebSocket.OPEN;
  }

  /**
   * Get all connected room IDs
   */
  getConnectedRooms() {
    return Object.keys(this.connections).filter((room_id) =>
      this.isConnected(room_id),
    );
  }

  /**
   * Disconnect all rooms
   */
  disconnectAll() {
    Object.keys(this.connections).forEach((room_id) => {
      this.disconnect(room_id);
    });
  }

  // ============ PRIVATE METHODS ============

  _notifyListeners(room_id, message) {
    const callbacks = this.listeners[room_id] || [];
    callbacks.forEach((callback) => {
      try {
        callback(message);
      } catch (err) {
        console.error(`[WS] Listener error:`, err);
      }
    });
  }
}

export const wsManager = new WebSocketManager();
