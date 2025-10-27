/**
 * ============================================================================
 * INVITATION MANAGER COMPONENT
 * ============================================================================
 * Allows users to paste and join using invitation links
 * Handles both workspace and video call invitations
 * ============================================================================
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link as LinkIcon, ClipboardPaste, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const InvitationManager = ({ isOpen, onClose }) => {
  const [invitationLink, setInvitationLink] = useState('');
  const [status, setStatus] = useState('idle'); // idle, processing, success, error
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handlePasteInvitation = async () => {
    try {
      setStatus('processing');
      setMessage('Processing invitation link...');

      const link = invitationLink.trim();
      
      if (!link) {
        setStatus('error');
        setMessage('Please paste a valid invitation link');
        return;
      }

      // Validate URL format
      try {
        new URL(link);
      } catch {
        setStatus('error');
        setMessage('Invalid URL format');
        return;
      }

      // Check if it's a join-workspace or join-call link
      if (link.includes('/join-workspace')) {
        window.location.href = link;
      } else if (link.includes('/join-call')) {
        window.location.href = link;
      } else {
        setStatus('error');
        setMessage('This link is not a valid Collaboro invitation');
        return;
      }
    } catch (error) {
      setStatus('error');
      setMessage(error.message || 'Failed to process invitation');
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInvitationLink(text);
    } catch (error) {
      setStatus('error');
      setMessage('Could not read clipboard. Please paste manually.');
    }
  };

  const resetForm = () => {
    setInvitationLink('');
    setStatus('idle');
    setMessage('');
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
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-4">
            <div className="flex items-center gap-3">
              <LinkIcon className="w-6 h-6" />
              <div>
                <h2 className="text-xl font-bold">Join Using Invitation</h2>
                <p className="text-primary-100 text-sm">Paste an invitation link to join</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {status === 'idle' && (
              <>
                <p className="text-gray-600 text-sm">
                  Paste a workspace or video call invitation link below:
                </p>
                
                {/* Textarea for pasting */}
                <textarea
                  value={invitationLink}
                  onChange={(e) => setInvitationLink(e.target.value)}
                  placeholder="Paste invitation link here... e.g., https://collabro-sigma.vercel.app/join-workspace?code=..."
                  className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />

                {/* Action buttons */}
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePasteFromClipboard}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors font-medium"
                  >
                    <ClipboardPaste className="w-4 h-4" />
                    Paste from Clipboard
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePasteInvitation}
                    disabled={!invitationLink.trim()}
                    className="flex-1 py-2 px-4 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white rounded-lg transition-colors font-medium disabled:cursor-not-allowed"
                  >
                    Join
                  </motion.button>
                </div>

                {/* Info box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Tip:</strong> You can use this to join workspaces and video calls that others have invited you to.
                  </p>
                </div>
              </>
            )}

            {status === 'processing' && (
              <div className="flex flex-col items-center justify-center py-8 space-y-3">
                <Loader className="w-12 h-12 text-primary-600 animate-spin" />
                <p className="text-gray-600 font-medium">{message}</p>
              </div>
            )}

            {status === 'success' && (
              <div className="flex flex-col items-center justify-center py-8 space-y-3">
                <CheckCircle className="w-12 h-12 text-green-500" />
                <p className="text-gray-800 font-medium text-center">{message}</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    resetForm();
                    onClose();
                  }}
                  className="mt-4 py-2 px-6 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium"
                >
                  Done
                </motion.button>
              </div>
            )}

            {status === 'error' && (
              <div className="flex flex-col items-center justify-center py-8 space-y-3">
                <AlertCircle className="w-12 h-12 text-red-500" />
                <p className="text-gray-800 font-medium text-center">{message}</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetForm}
                  className="mt-4 py-2 px-6 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium"
                >
                  Try Again
                </motion.button>
              </div>
            )}
          </div>

          {/* Close button */}
          {status === 'idle' && (
            <div className="bg-gray-50 px-6 py-3 flex justify-end">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancel
              </motion.button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InvitationManager;