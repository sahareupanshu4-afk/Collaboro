/**
 * ============================================================================
 * JOIN WORKSPACE COMPONENT
 * ============================================================================
 * Allows users to join a workspace using an invitation link
 * Handles URL parameters and adds user to workspace
 * ============================================================================
 */

import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';

const JoinWorkspace = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState('joining'); // joining, success, error
  const [message, setMessage] = useState('Processing invitation...');
  const [workspaceData, setWorkspaceData] = useState(null);

  useEffect(() => {
    handleJoinWorkspace();
  }, []);

  const handleJoinWorkspace = async () => {
    try {
      const workspaceId = searchParams.get('workspace');
      const inviteCode = searchParams.get('code');

      if (!workspaceId || !inviteCode) {
        setStatus('error');
        setMessage('Invalid invitation link. Missing workspace or code.');
        return;
      }

      if (!user) {
        // Redirect to login with return URL
        localStorage.setItem('pendingWorkspaceId', workspaceId);
        navigate('/');
        return;
      }

      // Get workspace details
      const { data: workspace, error: wsError } = await supabase
        .from('workspaces')
        .select('*')
        .eq('id', workspaceId)
        .single();

      if (wsError) throw wsError;

      setWorkspaceData(workspace);

      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from('workspace_members')
        .select('*')
        .eq('workspace_id', workspaceId)
        .eq('user_id', user.id)
        .single();

      if (existingMember) {
        setStatus('success');
        setMessage(`You are already a member of "${workspace.name}"!`);
        setTimeout(() => navigate('/'), 2000);
        return;
      }

      // Add user to workspace
      const { error: addError } = await supabase
        .from('workspace_members')
        .insert([{
          workspace_id: workspaceId,
          user_id: user.id,
          role: 'member'
        }]);

      if (addError) throw addError;

      setStatus('success');
      setMessage(`✅ Successfully joined "${workspace.name}"!`);
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      console.error('Error joining workspace:', error);
      setStatus('error');
      setMessage(error.message || 'Failed to join workspace. Please try again.');
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
            Please sign in to join this workspace.
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4"
      >
        {status === 'joining' && (
          <>
            <Loader className="w-12 h-12 text-primary-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-center mb-2">Joining Workspace</h2>
            <p className="text-gray-600 text-center">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-center mb-2 text-green-600">Success!</h2>
            <p className="text-gray-600 text-center mb-4">{message}</p>
            {workspaceData && (
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600">Workspace:</p>
                <p className="text-lg font-semibold">{workspaceData.name}</p>
              </div>
            )}
            <p className="text-sm text-gray-500 text-center mt-4">Redirecting...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-center mb-2 text-red-600">Error</h2>
            <p className="text-gray-600 text-center mb-6">{message}</p>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              Return to Dashboard
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default JoinWorkspace;