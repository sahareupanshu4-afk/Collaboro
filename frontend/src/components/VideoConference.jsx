import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Users, X, Monitor, Copy, UserPlus, Link as LinkIcon } from 'lucide-react';
import { socketService } from '../services/socketService';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';

const VideoConference = ({ workspaceId, isOpen, onClose, callMode = 'conference' }) => {
  const [localStream, setLocalStream] = useState(null);
  const [peers, setPeers] = useState(new Map());
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [error, setError] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [workspaceMembers, setWorkspaceMembers] = useState([]);
  const [copiedLink, setCopiedLink] = useState(false);
  
  const localVideoRef = useRef(null);
  const peersRef = useRef(new Map());
  const { user, profile } = useAuth();

  useEffect(() => {
    if (isOpen && workspaceId) {
      startVideoCall();
      generateInviteLink();
      loadWorkspaceMembers();
    }

    return () => {
      cleanup();
    };
  }, [isOpen, workspaceId]);

  const generateInviteLink = () => {
    const roomId = `${workspaceId}-${Date.now()}`;
    const link = `${window.location.origin}/join-call?room=${roomId}&mode=${callMode}`;
    setInviteLink(link);
  };

  const loadWorkspaceMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('workspace_members')
        .select(`
          user_id,
          user_profiles (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('workspace_id', workspaceId);

      if (!error && data) {
        const members = data
          .map(item => item.user_profiles)
          .filter(profile => profile && profile.id !== user.id);
        setWorkspaceMembers(members);
      }
    } catch (error) {
      console.error('Error loading workspace members:', error);
    }
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const inviteUser = (userId) => {
    // Send invitation through socket
    socketService.emit('send-call-invite', {
      to: userId,
      from: user.id,
      fromName: profile?.username || user.email,
      roomId: workspaceId,
      callMode
    });
    setShowInviteModal(false);
  };

  const startVideoCall = async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Join video room
      socketService.joinVideoRoom(workspaceId);

      // Setup socket listeners
      setupSocketListeners();
    } catch (err) {
      console.error('Error accessing media devices:', err);
      setError('Could not access camera/microphone. Please check permissions.');
    }
  };

  const setupSocketListeners = () => {
    // Handle existing users in the room
    socketService.onVideoAllUsers((users) => {
      users.forEach((user) => {
        createPeerConnection(user.socketId, true, user.username);
      });
    });

    // Handle new user joining
    socketService.onVideoUserJoined((userData) => {
      createPeerConnection(userData.socketId, false, userData.username);
    });

    // Handle user leaving
    socketService.onVideoUserLeft((userData) => {
      const peer = peersRef.current.get(userData.socketId);
      if (peer) {
        peer.close();
        peersRef.current.delete(userData.socketId);
        setPeers(new Map(peersRef.current));
      }
    });

    // Handle receiving offer
    socketService.onReceiveOffer(async ({ offer, from, username }) => {
      const peer = createPeerConnection(from, false, username);
      await peer.setRemoteDescription(new RTCPeerDescription(offer));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      socketService.sendAnswer(answer, from);
    });

    // Handle receiving answer
    socketService.onReceiveAnswer(async ({ answer, from }) => {
      const peer = peersRef.current.get(from);
      if (peer) {
        await peer.setRemoteDescription(new RTCPeerDescription(answer));
      }
    });

    // Handle ICE candidates
    socketService.onIceCandidate(async ({ candidate, from }) => {
      const peer = peersRef.current.get(from);
      if (peer && candidate) {
        await peer.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });
  };

  const createPeerConnection = (socketId, isInitiator, username) => {
    if (peersRef.current.has(socketId)) {
      return peersRef.current.get(socketId);
    }

    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };

    const peer = new RTCPeerConnection(configuration);

    // Add local stream to peer
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        peer.addTrack(track, localStream);
      });
    }

    // Handle ICE candidates
    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socketService.sendIceCandidate(event.candidate, socketId);
      }
    };

    // Handle remote stream
    peer.ontrack = (event) => {
      setPeers((prev) => {
        const newPeers = new Map(prev);
        newPeers.set(socketId, {
          peer,
          stream: event.streams[0],
          username
        });
        return newPeers;
      });
    };

    peersRef.current.set(socketId, peer);

    // If initiator, create and send offer
    if (isInitiator) {
      peer.createOffer()
        .then((offer) => peer.setLocalDescription(offer))
        .then(() => {
          socketService.sendOffer(peer.localDescription, socketId);
        })
        .catch((err) => console.error('Error creating offer:', err));
    }

    return peer;
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const cleanup = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }

    peersRef.current.forEach((peer) => peer.close());
    peersRef.current.clear();
    setPeers(new Map());

    if (workspaceId) {
      socketService.leaveVideoRoom(workspaceId);
    }
  };

  const handleEndCall = () => {
    cleanup();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-gray-900 z-50"
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="bg-gray-800 text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-600 rounded-lg">
                <Video className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Video Conference</h2>
                <p className="text-gray-300 text-sm flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {peers.size + 1} participant{peers.size !== 0 ? 's' : ''}
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </motion.button>
          </div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500 text-white px-6 py-3 text-center"
            >
              {error}
            </motion.div>
          )}

          {/* Video Grid */}
          <div className="flex-1 p-6 overflow-auto">
            <div className={`grid gap-4 h-full ${
              peers.size === 0 ? 'grid-cols-1' :
              peers.size === 1 ? 'grid-cols-2' :
              peers.size <= 3 ? 'grid-cols-2' :
              'grid-cols-3'
            }`}>
              {/* Local Video */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative bg-gray-800 rounded-2xl overflow-hidden shadow-2xl"
              >
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-4 bg-black bg-opacity-60 px-3 py-2 rounded-lg text-white text-sm font-medium">
                  You {!isVideoEnabled && '(Video Off)'}
                </div>
                {!isVideoEnabled && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                    <div className="text-center">
                      <VideoOff className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-300">Camera Off</p>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Remote Videos */}
              {Array.from(peers.entries()).map(([socketId, peerData]) => (
                <motion.div
                  key={socketId}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="relative bg-gray-800 rounded-2xl overflow-hidden shadow-2xl"
                >
                  <video
                    autoPlay
                    playsInline
                    ref={(ref) => {
                      if (ref && peerData.stream) {
                        ref.srcObject = peerData.stream;
                      }
                    }}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-4 left-4 bg-black bg-opacity-60 px-3 py-2 rounded-lg text-white text-sm font-medium">
                    {peerData.username || 'User'}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="bg-gray-800 px-6 py-6">
            <div className="flex items-center justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleVideo}
                className={`p-4 rounded-full transition-colors ${
                  isVideoEnabled
                    ? 'bg-gray-700 hover:bg-gray-600'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isVideoEnabled ? (
                  <Video className="w-6 h-6 text-white" />
                ) : (
                  <VideoOff className="w-6 h-6 text-white" />
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleAudio}
                className={`p-4 rounded-full transition-colors ${
                  isAudioEnabled
                    ? 'bg-gray-700 hover:bg-gray-600'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isAudioEnabled ? (
                  <Mic className="w-6 h-6 text-white" />
                ) : (
                  <MicOff className="w-6 h-6 text-white" />
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowInviteModal(true)}
                className="p-4 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
                title="Invite to call"
              >
                <UserPlus className="w-6 h-6 text-white" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleEndCall}
                className="p-4 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
              >
                <PhoneOff className="w-6 h-6 text-white" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Invite Modal */}
        <AnimatePresence>
          {showInviteModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
              onClick={() => setShowInviteModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <UserPlus className="w-6 h-6" />
                    Invite to {callMode === 'one-on-one' ? '1-on-1' : 'Conference'} Call
                  </h3>
                  <button
                    onClick={() => setShowInviteModal(false)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Invite Link */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <LinkIcon className="w-4 h-4 inline mr-1" />
                    Share Invite Link
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inviteLink}
                      readOnly
                      className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={copyInviteLink}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      {copiedLink ? 'Copied!' : 'Copy'}
                    </motion.button>
                  </div>
                </div>

                {/* Workspace Members */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    <Users className="w-4 h-4 inline mr-1" />
                    Invite Workspace Members
                  </label>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {workspaceMembers.length === 0 ? (
                      <p className="text-gray-400 text-sm text-center py-4">
                        No other members in this workspace
                      </p>
                    ) : (
                      workspaceMembers.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-650 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                              {(member.username || member.full_name || 'U')[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="text-white font-medium">
                                {member.username || member.full_name || 'User'}
                              </p>
                              <p className="text-gray-400 text-xs">Online</p>
                            </div>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => inviteUser(member.id)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium"
                          >
                            Invite
                          </motion.button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};

export default VideoConference;
