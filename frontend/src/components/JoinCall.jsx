/**
 * ============================================================================
 * JOIN CALL COMPONENT
 * ============================================================================
 * Allows users to join a video call using an invitation link
 * Handles video call room parameters from URL
 * ============================================================================
 */

import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Video, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import VideoConference from './VideoConference';

const JoinCall = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isJoining, setIsJoining] = useState(true);
  const [error, setError] = useState('');
  const [roomData, setRoomData] = useState(null);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    handleJoinCall();
  }, []);

  const handleJoinCall = async () => {
    try {
      const roomId = searchParams.get('room');
      const mode = searchParams.get('mode') || 'conference';

      if (!roomId) {
        setError('Invalid call link. Missing room ID.');
        setIsJoining(false);
        return;
      }

      if (!user) {
        // Redirect to login
        localStorage.setItem('pendingCallRoom', roomId);
        localStorage.setItem('pendingCallMode', mode);
        navigate('/');
        return;
      }

      setRoomData({ roomId, mode });
      setShowVideo(true);
      setIsJoining(false);
    } catch (error) {
      console.error('Error joining call:', error);
      setError(error.message || 'Failed to join call.');
      setIsJoining(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4"
        >
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-center mb-2">Sign In Required</h2>
          <p className="text-gray-600 text-center">
            Please sign in to join this video call.
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-6 w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            Go to Sign In
          </button>
        </motion.div>
      </div>
    );
  }

  if (isJoining) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader className="w-16 h-16 text-primary-600 mx-auto mb-4 animate-spin" />
          <h2 className="text-2xl font-bold text-white mb-2">Joining Video Call</h2>
          <p className="text-gray-300">Preparing your connection...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4"
        >
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-center mb-2 text-red-600">Error Joining Call</h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            Return to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  if (roomData && showVideo) {
    return (
      <VideoConference
        workspaceId={roomData.roomId}
        isOpen={true}
        onClose={() => navigate('/')}
        callMode={roomData.mode}
      />
    );
  }

  return null;
};

export default JoinCall;