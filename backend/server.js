/**
 * ============================================================================
 * COLLABORO - BACKEND SERVER
 * ============================================================================
 * Main server file handling WebSocket connections and real-time communication
 * 
 * Features:
 * - Real-time chat messaging via Socket.io
 * - WebRTC video conferencing signaling
 * - User presence tracking
 * - Room management for chat and video
 * 
 * @requires express - Web framework
 * @requires socket.io - Real-time bidirectional communication
 * @requires cors - Cross-origin resource sharing
 * ============================================================================
 */

const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

// Initialize Express app and HTTP server
const app = express();
const httpServer = createServer(app);

// ==================== MIDDLEWARE CONFIGURATION ====================

// Enable CORS for frontend communication
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Parse JSON request bodies
app.use(express.json());

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} from ${req.get('origin') || 'unknown'}`);
  console.log('Headers:', JSON.stringify(req.headers));
  next();
});

// ==================== SOCKET.IO INITIALIZATION ====================

/**
 * Socket.io server instance for real-time communication
 * Configured with CORS to allow frontend connections
 * Optimized for production with multiple transport options
 */
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
    allowEIO3: true
  },
  transports: ['websocket', 'polling'],
  allowUpgrades: true,
  pingInterval: 25000,
  pingTimeout: 60000,
  maxHttpBufferSize: 1e6,
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000,
    skipMiddlewares: true,
  },
  // Enhanced polling configuration for better compatibility
  httpCompression: {
    threshold: 1024
  },
  // Increase buffer sizes for long-polling
  perMessageDeflate: {
    threshold: 1024
  },
  // Additional options for production stability
  cookie: false,
  maxHttpBufferSize: 1e7
});

// ==================== IN-MEMORY DATA STORES ====================

/**
 * Active users storage
 * Map structure: socketId -> { id, userId, username, email }
 */
const activeUsers = new Map();

/**
 * Chat rooms storage
 * Map structure: roomId -> Set of socket IDs
 */
const chatRooms = new Map();

/**
 * Video conference rooms storage
 * Map structure: roomId -> Set of socket IDs
 */
const videoRooms = new Map();

// ==================== SOCKET CONNECTION ERROR HANDLER ====================

/**
 * Handle Socket.io errors before connection
 * Logs authentication and connection issues
 */
io.on('connect_error', (error) => {
  console.error('❌ Socket.io connection error:', error.message);
});

// ==================== SOCKET CONNECTION HANDLER ====================

/**
 * Main socket connection event handler
 * Fired when a new client connects to the server
 * 
 * @param {Socket} socket - Socket.io socket instance for this connection
 */
io.on('connection', (socket) => {
  const transport = socket.conn.transport.name;
  console.log('✅ Client connected:', socket.id, `(transport: ${transport})`);
  console.log('Connection origin:', socket.handshake.headers.origin);
  console.log('User agent:', socket.handshake.headers['user-agent']);

  /**
   * Handle user authentication and registration
   * Store user data in activeUsers map for presence tracking
   * 
   * @event user:join
   * @param {Object} userData - User information from authentication
   * @param {string} userData.userId - Unique user ID from Supabase
   * @param {string} userData.username - Display name
   * @param {string} userData.email - User email
   */
  socket.on('user:join', (userData) => {
    activeUsers.set(socket.id, {
      id: socket.id,
      userId: userData.userId,
      username: userData.username,
      email: userData.email
    });
    console.log(`👤 User joined: ${userData.username}`);
  });

  // ==================== CHAT FUNCTIONALITY ====================
  
  /**
   * Handle user joining a chat room (workspace)
   * Creates room if it doesn't exist and notifies other participants
   * 
   * @event chat:join-room
   * @param {string} roomId - Workspace/chat room identifier
   * @emits chat:user-joined - To other users in room
   * @emits chat:room-joined - To joining user
   */
  socket.on('chat:join-room', (roomId) => {
    socket.join(roomId);
    
    if (!chatRooms.has(roomId)) {
      chatRooms.set(roomId, new Set());
    }
    chatRooms.get(roomId).add(socket.id);
    
    const user = activeUsers.get(socket.id);
    console.log(`💬 ${user?.username || socket.id} joined chat room: ${roomId}`);
    
    // Notify others in the room
    socket.to(roomId).emit('chat:user-joined', {
      userId: user?.userId,
      username: user?.username,
      timestamp: new Date().toISOString()
    });
    
    // Send room info to the user
    io.to(socket.id).emit('chat:room-joined', {
      roomId,
      userCount: chatRooms.get(roomId).size
    });
  });

  /**
   * Handle incoming chat messages
   * Broadcasts message to all users in the room including sender
   * 
   * @event chat:send-message
   * @param {Object} data - Message data
   * @param {string} data.roomId - Target room ID
   * @param {string} data.message - Message content
   * @param {string} data.userId - Sender's user ID
   * @param {string} data.username - Sender's display name
   * @emits chat:receive-message - To all users in room
   */
  socket.on('chat:send-message', (data) => {
    const { roomId, message, userId, username } = data;
    const user = activeUsers.get(socket.id);
    
    const messageData = {
      id: `msg-${Date.now()}-${socket.id}`,
      roomId,
      message,
      userId: userId || user?.userId,
      username: username || user?.username,
      timestamp: new Date().toISOString()
    };
    
    console.log(`📨 Message in ${roomId} from ${messageData.username}: ${message}`);
    
    // Broadcast to all users in the room including sender
    io.to(roomId).emit('chat:receive-message', messageData);
  });

  /**
   * Handle user leaving a chat room
   * Cleans up room data and notifies remaining participants
   * 
   * @event chat:leave-room
   * @param {string} roomId - Room to leave
   * @emits chat:user-left - To remaining users in room
   */
  socket.on('chat:leave-room', (roomId) => {
    socket.leave(roomId);
    
    if (chatRooms.has(roomId)) {
      chatRooms.get(roomId).delete(socket.id);
      if (chatRooms.get(roomId).size === 0) {
        chatRooms.delete(roomId);
      }
    }
    
    const user = activeUsers.get(socket.id);
    console.log(`💬 ${user?.username || socket.id} left chat room: ${roomId}`);
    
    socket.to(roomId).emit('chat:user-left', {
      userId: user?.userId,
      username: user?.username,
      timestamp: new Date().toISOString()
    });
  });

  // ==================== VIDEO CONFERENCING FUNCTIONALITY ====================
  
  /**
   * Handle user joining a video conference room
   * Implements WebRTC signaling for peer-to-peer connections
   * 
   * @event video:join-room
   * @param {string} roomId - Video room identifier
   * @emits video:all-users - List of existing users to new joiner
   * @emits video:user-joined - Notify existing users of new participant
   */
  socket.on('video:join-room', (roomId) => {
    socket.join(roomId);
    
    if (!videoRooms.has(roomId)) {
      videoRooms.set(roomId, new Set());
    }
    videoRooms.get(roomId).add(socket.id);
    
    const user = activeUsers.get(socket.id);
    console.log(`📹 ${user?.username || socket.id} joined video room: ${roomId}`);
    
    // Get all other users in the room
    const otherUsers = Array.from(videoRooms.get(roomId))
      .filter(id => id !== socket.id)
      .map(id => {
        const u = activeUsers.get(id);
        return {
          socketId: id,
          userId: u?.userId,
          username: u?.username
        };
      });
    
    // Send existing users to the new user
    io.to(socket.id).emit('video:all-users', otherUsers);
    
    // Notify others that a new user joined
    socket.to(roomId).emit('video:user-joined', {
      socketId: socket.id,
      userId: user?.userId,
      username: user?.username
    });
  });

  /**
   * WebRTC Signaling: Forward SDP offer to target peer
   * Part of WebRTC connection establishment process
   * 
   * @event video:send-offer
   * @param {Object} data
   * @param {RTCSessionDescription} data.offer - WebRTC offer SDP
   * @param {string} data.to - Target socket ID
   * @emits video:receive-offer - To target peer
   */
  socket.on('video:send-offer', ({ offer, to }) => {
    console.log(`📡 Sending offer from ${socket.id} to ${to}`);
    io.to(to).emit('video:receive-offer', {
      offer,
      from: socket.id,
      username: activeUsers.get(socket.id)?.username
    });
  });

  /**
   * WebRTC Signaling: Forward SDP answer to peer
   * Completes WebRTC connection setup
   * 
   * @event video:send-answer
   * @param {Object} data
   * @param {RTCSessionDescription} data.answer - WebRTC answer SDP
   * @param {string} data.to - Target socket ID
   * @emits video:receive-answer - To target peer
   */
  socket.on('video:send-answer', ({ answer, to }) => {
    console.log(`📡 Sending answer from ${socket.id} to ${to}`);
    io.to(to).emit('video:receive-answer', {
      answer,
      from: socket.id
    });
  });

  /**
   * WebRTC Signaling: Exchange ICE candidates for NAT traversal
   * Enables peer-to-peer connection through firewalls
   * 
   * @event video:ice-candidate
   * @param {Object} data
   * @param {RTCIceCandidate} data.candidate - ICE candidate
   * @param {string} data.to - Target socket ID
   * @emits video:ice-candidate - To target peer
   */
  socket.on('video:ice-candidate', ({ candidate, to }) => {
    io.to(to).emit('video:ice-candidate', {
      candidate,
      from: socket.id
    });
  });

  /**
   * Handle user leaving video conference
   * Notifies other participants to close peer connections
   * 
   * @event video:leave-room
   * @param {string} roomId - Video room to leave
   * @emits video:user-left - To remaining participants
   */
  socket.on('video:leave-room', (roomId) => {
    socket.leave(roomId);
    
    if (videoRooms.has(roomId)) {
      videoRooms.get(roomId).delete(socket.id);
      if (videoRooms.get(roomId).size === 0) {
        videoRooms.delete(roomId);
      }
    }
    
    const user = activeUsers.get(socket.id);
    console.log(`📹 ${user?.username || socket.id} left video room: ${roomId}`);
    
    socket.to(roomId).emit('video:user-left', {
      socketId: socket.id,
      userId: user?.userId,
      username: user?.username
    });
  });

  // ==================== DISCONNECTION HANDLER ====================
  
  /**
   * Handle client disconnection
   * Cleans up user from all rooms and notifies other participants
   * Automatically triggered when socket connection is lost
   * 
   * @event disconnect
   * @emits chat:user-left - To all chat rooms user was in
   * @emits video:user-left - To all video rooms user was in
   */
  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
    
    const user = activeUsers.get(socket.id);
    
    // Remove from all chat rooms
    chatRooms.forEach((users, roomId) => {
      if (users.has(socket.id)) {
        users.delete(socket.id);
        socket.to(roomId).emit('chat:user-left', {
          userId: user?.userId,
          username: user?.username,
          timestamp: new Date().toISOString()
        });
      }
    });
    
    // Remove from all video rooms
    videoRooms.forEach((users, roomId) => {
      if (users.has(socket.id)) {
        users.delete(socket.id);
        socket.to(roomId).emit('video:user-left', {
          socketId: socket.id,
          userId: user?.userId,
          username: user?.username
        });
      }
    });
    
    activeUsers.delete(socket.id);
  });

  /**
   * Handle socket errors
   * Logs errors for debugging purposes
   * 
   * @event error
   * @param {Error} error - Socket error object
   */
  socket.on('error', (error) => {
    console.error('❌ Socket error:', error);
  });
});

// ==================== HTTP API ROUTES ====================

/**
 * Root endpoint - Server status and statistics
 * @route GET /
 * @returns {Object} Server information and metrics
 */
app.get('/', (req, res) => {
  res.json({
    message: 'Remote Work Platform API',
    version: '1.0.0',
    status: 'running',
    activeUsers: activeUsers.size,
    chatRooms: chatRooms.size,
    videoRooms: videoRooms.size
  });
});

/**
 * Health check endpoint
 * Used for monitoring and load balancer health checks
 * @route GET /api/health
 * @returns {Object} Health status
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// ==================== SERVER STARTUP ====================

/**
 * Start HTTP server and Socket.io
 * Listens on configured PORT or default 8080
 * Binds to 0.0.0.0 for compatibility with deployment platforms like Render
 */
const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log('🖥️  Server started on port', PORT);
  console.log('📡 Socket.io server ready');
  console.log('🌐 Frontend URL:', process.env.CLIENT_URL || 'http://localhost:5173');
  console.log('Waiting for clients to connect...\n');
  console.log('Commands:');
  console.log('- Press Ctrl+C to stop the server\n');
});

// ==================== GRACEFUL SHUTDOWN ====================

/**
 * Handle graceful server shutdown
 * Closes all connections properly before exit
 * Triggered by Ctrl+C or process termination signal
 */
process.on('SIGINT', () => {
  console.log('\n👋 Server shutting down...');
  io.close();
  httpServer.close();
  process.exit(0);
});
