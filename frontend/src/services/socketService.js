/**
 * ============================================================================
 * SOCKET.IO CLIENT SERVICE
 * ============================================================================
 * Centralized Socket.io client management for real-time communication
 * 
 * Features:
 * - Singleton pattern for single connection
 * - Automatic reconnection with exponential backoff
 * - Chat and video conferencing event handling
 * - WebRTC signaling for peer-to-peer connections
 * 
 * Usage:
 * import { socketService } from './services/socketService';
 * socketService.connect(userData);
 * socketService.sendMessage(roomId, message);
 * ============================================================================
 */

import { io } from 'socket.io-client';

// Server URL from environment or default to localhost
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:8080';

/**
 * SocketService class
 * Manages Socket.io client connection and event handling
 */
class SocketService {
  /**
   * Constructor - Initialize socket service properties
   */
  constructor() {
    this.socket = null;      // Socket.io instance
    this.connected = false;  // Connection status
  }

  /**
   * Establish connection to Socket.io server
   * Handles reconnection and authentication
   * 
   * @param {Object} userData - User authentication data
   * @param {string} userData.userId - User ID from Supabase
   * @param {string} userData.username - Display name
   * @param {string} userData.email - User email
   * @returns {Socket} Socket.io instance
   */
  connect(userData) {
    // Return existing connection if already connected
    if (this.socket?.connected) {
      return this.socket;
    }

    // Initialize new Socket.io connection with configuration
    console.log('🔌 Attempting to connect to:', SERVER_URL);
    
    this.socket = io(SERVER_URL, {
      reconnection: true,                    // Enable automatic reconnection
      reconnectionDelay: 1000,              // Initial delay between reconnection attempts
      reconnectionDelayMax: 5000,           // Max delay between reconnection attempts
      reconnectionAttempts: 15,             // Maximum reconnection attempts
      timeout: 20000,                       // Connection timeout in milliseconds
      transports: ['websocket', 'polling'], // Try WebSocket first, fallback to polling
      upgrade: true,                        // Allow upgrading from polling to websocket
      closeOnBeforeunload: true,            // Close connection when page unloads
      path: '/socket.io/'                   // Explicit socket.io path
    });

    /**
     * Connection established event handler
     * Sends user authentication data to server
     */
    this.socket.on('connect', () => {
      this.connected = true;
      const transport = this.socket.io.engine.transport.name;
      console.log('✅ Connected to server:', this.socket.id, `(${transport})`);
      
      if (userData) {
        this.socket.emit('user:join', userData);
      }
    });

    /**
     * Connection lost event handler
     * Updates connection status
     * 
     * @param {string} reason - Disconnection reason
     */
    this.socket.on('disconnect', (reason) => {
      this.connected = false;
      console.log('❌ Disconnected from server:', reason);
    });

    /**
     * Connection error event handler
     * Logs connection errors for debugging
     * 
     * @param {Error} error - Connection error object
     */
    this.socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
      console.error('Error message:', error.message);
      console.error('Error data:', error.data);
    });

    /**
     * Debug: Log transport upgrade attempts
     */
    this.socket.on('upgrade', (transport) => {
      console.log('🔄 Transport upgraded to:', transport.name);
    });

    return this.socket;
  }

  /**
   * Disconnect from Socket.io server
   * Cleans up connection and resets state
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  /**
   * Get current socket instance
   * @returns {Socket|null} Socket.io instance or null if not connected
   */
  getSocket() {
    return this.socket;
  }

  /**
   * Check if socket is currently connected
   * @returns {boolean} Connection status
   */
  isConnected() {
    return this.connected && this.socket?.connected;
  }

  // ==================== CHAT METHODS ====================

  /**
   * Join a chat room (workspace)
   * Notifies server to add user to room
   * 
   * @param {string} roomId - Chat room/workspace ID
   */
  joinChatRoom(roomId) {
    if (this.socket) {
      this.socket.emit('chat:join-room', roomId);
    }
  }

  /**
   * Leave a chat room
   * Notifies server to remove user from room
   * 
   * @param {string} roomId - Chat room/workspace ID
   */
  leaveChatRoom(roomId) {
    if (this.socket) {
      this.socket.emit('chat:leave-room', roomId);
    }
  }

  /**
   * Send a chat message to a room
   * Broadcasts to all users in the room
   * 
   * @param {string} roomId - Target room ID
   * @param {string} message - Message content
   * @param {string} userId - Sender's user ID
   * @param {string} username - Sender's display name
   */
  sendMessage(roomId, message, userId, username) {
    if (this.socket) {
      this.socket.emit('chat:send-message', {
        roomId,
        message,
        userId,
        username
      });
    }
  }

  /**
   * Register callback for receiving chat messages
   * 
   * @param {Function} callback - Function to call when message received
   * @callback callback
   * @param {Object} messageData - Message data
   */
  onChatMessage(callback) {
    if (this.socket) {
      this.socket.on('chat:receive-message', callback);
    }
  }

  /**
   * Register callback for user joining chat
   * 
   * @param {Function} callback - Function to call when user joins
   */
  onUserJoined(callback) {
    if (this.socket) {
      this.socket.on('chat:user-joined', callback);
    }
  }

  /**
   * Register callback for user leaving chat
   * 
   * @param {Function} callback - Function to call when user leaves
   */
  onUserLeft(callback) {
    if (this.socket) {
      this.socket.on('chat:user-left', callback);
    }
  }

  // ==================== VIDEO CONFERENCE METHODS ====================

  /**
   * Join a video conference room
   * Initiates WebRTC signaling process
   * 
   * @param {string} roomId - Video room ID
   */
  joinVideoRoom(roomId) {
    if (this.socket) {
      this.socket.emit('video:join-room', roomId);
    }
  }

  /**
   * Leave a video conference room
   * Notifies peers to close connections
   * 
   * @param {string} roomId - Video room ID
   */
  leaveVideoRoom(roomId) {
    if (this.socket) {
      this.socket.emit('video:leave-room', roomId);
    }
  }

  /**
   * Send WebRTC SDP offer to peer
   * Part of WebRTC connection establishment
   * 
   * @param {RTCSessionDescription} offer - WebRTC offer SDP
   * @param {string} to - Target peer socket ID
   */
  sendOffer(offer, to) {
    if (this.socket) {
      this.socket.emit('video:send-offer', { offer, to });
    }
  }

  /**
   * Send WebRTC SDP answer to peer
   * Completes WebRTC connection establishment
   * 
   * @param {RTCSessionDescription} answer - WebRTC answer SDP
   * @param {string} to - Target peer socket ID
   */
  sendAnswer(answer, to) {
    if (this.socket) {
      this.socket.emit('video:send-answer', { answer, to });
    }
  }

  /**
   * Send ICE candidate to peer
   * Enables NAT traversal for peer connection
   * 
   * @param {RTCIceCandidate} candidate - ICE candidate
   * @param {string} to - Target peer socket ID
   */
  sendIceCandidate(candidate, to) {
    if (this.socket) {
      this.socket.emit('video:ice-candidate', { candidate, to });
    }
  }

  /**
   * Register callback for receiving list of existing users in video room
   * Used when joining a room with existing participants
   * 
   * @param {Function} callback - Function to call with user list
   */
  onVideoAllUsers(callback) {
    if (this.socket) {
      this.socket.on('video:all-users', callback);
    }
  }

  /**
   * Register callback for user joining video room
   * 
   * @param {Function} callback - Function to call when user joins
   */
  onVideoUserJoined(callback) {
    if (this.socket) {
      this.socket.on('video:user-joined', callback);
    }
  }

  /**
   * Register callback for user leaving video room
   * 
   * @param {Function} callback - Function to call when user leaves
   */
  onVideoUserLeft(callback) {
    if (this.socket) {
      this.socket.on('video:user-left', callback);
    }
  }

  /**
   * Register callback for receiving WebRTC offer
   * 
   * @param {Function} callback - Function to call with offer
   */
  onReceiveOffer(callback) {
    if (this.socket) {
      this.socket.on('video:receive-offer', callback);
    }
  }

  /**
   * Register callback for receiving WebRTC answer
   * 
   * @param {Function} callback - Function to call with answer
   */
  onReceiveAnswer(callback) {
    if (this.socket) {
      this.socket.on('video:receive-answer', callback);
    }
  }

  /**
   * Register callback for receiving ICE candidate
   * 
   * @param {Function} callback - Function to call with candidate
   */
  onIceCandidate(callback) {
    if (this.socket) {
      this.socket.on('video:ice-candidate', callback);
    }
  }

  /**
   * Remove event listener
   * 
   * @param {string} event - Event name
   * @param {Function} callback - Callback function to remove
   */
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

export const socketService = new SocketService();
