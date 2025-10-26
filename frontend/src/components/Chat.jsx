import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Users, X } from 'lucide-react';
import { socketService } from '../services/socketService';
import { useAuth } from '../contexts/AuthContext';

const Chat = ({ workspaceId, isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const { user, profile } = useAuth();

  useEffect(() => {
    if (isOpen && workspaceId) {
      // Join chat room
      socketService.joinChatRoom(workspaceId);

      // Listen for messages
      const handleMessage = (data) => {
        setMessages((prev) => [...prev, data]);
      };

      const handleUserJoined = (data) => {
        setMessages((prev) => [
          ...prev,
          {
            id: `system-${Date.now()}`,
            type: 'system',
            message: `${data.username} joined the chat`,
            timestamp: data.timestamp
          }
        ]);
      };

      const handleUserLeft = (data) => {
        setMessages((prev) => [
          ...prev,
          {
            id: `system-${Date.now()}`,
            type: 'system',
            message: `${data.username} left the chat`,
            timestamp: data.timestamp
          }
        ]);
      };

      socketService.onChatMessage(handleMessage);
      socketService.onUserJoined(handleUserJoined);
      socketService.onUserLeft(handleUserLeft);

      return () => {
        socketService.leaveChatRoom(workspaceId);
        socketService.off('chat:receive-message', handleMessage);
        socketService.off('chat:user-joined', handleUserJoined);
        socketService.off('chat:user-left', handleUserLeft);
      };
    }
  }, [isOpen, workspaceId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !workspaceId) return;

    const username = profile?.username || user?.user_metadata?.username || user?.email?.split('@')[0] || 'User';
    
    socketService.sendMessage(
      workspaceId,
      newMessage.trim(),
      user?.id,
      username
    );
    
    setNewMessage('');
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[600px] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Workspace Chat</h2>
                <p className="text-primary-100 text-sm">Real-time messaging</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </motion.button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={msg.type === 'system' ? 'text-center' : ''}
                >
                  {msg.type === 'system' ? (
                    <span className="text-gray-500 text-sm italic">{msg.message}</span>
                  ) : (
                    <div
                      className={`flex ${
                        msg.userId === user?.id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-md px-4 py-3 rounded-2xl ${
                          msg.userId === user?.id
                            ? 'bg-primary-600 text-white rounded-br-none'
                            : 'bg-white text-gray-900 rounded-bl-none shadow-md'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">
                            {msg.username || 'Anonymous'}
                          </span>
                          <span
                            className={`text-xs ${
                              msg.userId === user?.id ? 'text-primary-200' : 'text-gray-500'
                            }`}
                          >
                            {formatTime(msg.timestamp)}
                          </span>
                        </div>
                        <p className="break-words">{msg.message}</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="bg-white border-t border-gray-200 p-4">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="input-field flex-1"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={!newMessage.trim()}
                className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send className="w-5 h-5" />
                Send
              </motion.button>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Chat;
