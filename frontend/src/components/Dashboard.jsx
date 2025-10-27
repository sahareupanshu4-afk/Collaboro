/**
 * ============================================================================
 * DASHBOARD COMPONENT
 * ============================================================================
 * Main application dashboard with workspace management and collaboration tools
 * 
 * Features:
 * - Workspace creation and selection
 * - Real-time chat
 * - Video conferencing (1-on-1 and group)
 * - Collaborative whiteboard
 * - Document editor
 * - File upload
 * - User profile management
 * - Workspace invitation system
 * 
 * State Management:
 * - Workspaces and selection
 * - Tool visibility states
 * - Modal dialogs
 * - Loading and error states
 * ============================================================================
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle,
  Video, 
  LogOut, 
  Plus, 
  Users,
  Briefcase,
  Settings,
  FileText,
  PenTool,
  User as UserIcon,
  Upload,
  Link as LinkIcon,
  Copy,
  UserPlus,
  X,
  Trash2,
  Zap,
  Clock,
  TrendingUp,
  Activity,
  Award,
  Calendar,
  Bell,
  Star,
  Gift,
  Trophy,
  Target,
  BarChart3,
  Heart,
  Coffee,
  Check,
  Edit3,
  List
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Chat from './Chat';
import VideoConference from './VideoConference';
import Whiteboard from './Whiteboard';
import DocumentEditor from './DocumentEditor';
import UserProfile from './UserProfile';
import FileUpload from './FileUpload';
import InvitationManager from './InvitationManager';
import { supabase } from '../config/supabase';

/**
 * Dashboard Component
 * Main application interface with all collaboration tools
 */
const Dashboard = () => {
  // ==================== STATE MANAGEMENT ====================

  // Workspace management
  const [workspaces, setWorkspaces] = useState([]);                     // List of user workspaces
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);     // Currently selected workspace ID

  // Tool visibility states
  const [showChat, setShowChat] = useState(false);                     // Chat panel visibility
  const [showVideo, setShowVideo] = useState(false);                   // Video conference panel visibility
  const [callMode, setCallMode] = useState('conference');              // Video call type: 'conference' or 'one-on-one'
  const [showWhiteboard, setShowWhiteboard] = useState(false);         // Whiteboard editor visibility
  const [showDocumentEditor, setShowDocumentEditor] = useState(false); // Document editor visibility
  const [showUserProfile, setShowUserProfile] = useState(false);       // User profile modal visibility
  const [showFileUpload, setShowFileUpload] = useState(false);         // File upload modal visibility

  // Workspace creation form state
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false); // Create workspace modal visibility
  const [newWorkspaceName, setNewWorkspaceName] = useState('');          // New workspace name input
  const [newWorkspaceDesc, setNewWorkspaceDesc] = useState('');          // New workspace description input
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false); // Creation process loading state

  // Notification states
  const [successMessage, setSuccessMessage] = useState('');             // Success notification message
  const [errorMessage, setErrorMessage] = useState('');                 // Error notification message
  const [isLoading, setIsLoading] = useState(true);                     // Initial loading state

  // Workspace invitation states
  const [showWorkspaceInvite, setShowWorkspaceInvite] = useState(false); // Invite modal visibility
  const [workspaceInviteLink, setWorkspaceInviteLink] = useState('');    // Generated invitation link
  const [copiedInvite, setCopiedInvite] = useState(false);               // Invite link copied status
  const [showInvitationManager, setShowInvitationManager] = useState(false); // Join invitation modal

  // Saved content management
  const [showWhiteboardList, setShowWhiteboardList] = useState(false);   // Saved whiteboards list visibility
  const [savedWhiteboards, setSavedWhiteboards] = useState([]);          // List of saved whiteboards
  const [selectedWhiteboardId, setSelectedWhiteboardId] = useState(null); // Selected whiteboard for editing
  
  const [showDocumentList, setShowDocumentList] = useState(false);       // Saved documents list visibility
  const [savedDocuments, setSavedDocuments] = useState([]);              // List of saved documents
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);     // Selected document for editing

  // New engaging features
  const [showAchievements, setShowAchievements] = useState(false);       // Achievements modal visibility
  const [showDailyTip, setShowDailyTip] = useState(false);               // Daily tip modal visibility
  const [userStats, setUserStats] = useState({                           // User statistics
    workspaces: workspaces.length,
    messages: 0,
    documents: savedDocuments.length,
    meetings: 0
  });
  
  // Todo List feature
  const [showTodoList, setShowTodoList] = useState(false);               // Todo list visibility
  const [todos, setTodos] = useState([]);                                // Todo items
  const [newTodo, setNewTodo] = useState('');                            // New todo input
  const [editingTodoId, setEditingTodoId] = useState(null);              // Editing todo ID
  const [editingTodoText, setEditingTodoText] = useState('');            // Editing todo text

  // Authentication context
  const { user, profile, signOut } = useAuth();

  // ==================== EFFECTS ====================

  /**
   * Effect: Load user workspaces on component mount
   * Initializes the dashboard with user's workspaces
   */
  useEffect(() => {
    if (user) {
      loadWorkspaces();
    }
    // Set loading to false after a short delay for smooth UX
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [user]);

  /**
   * Effect: Update user statistics when data changes
   * Keeps user stats current with workspace and document counts
   */
  useEffect(() => {
    setUserStats({
      workspaces: workspaces.length,
      messages: 0, // Placeholder for future implementation
      documents: savedDocuments.length,
      meetings: 0  // Placeholder for future implementation
    });
  }, [workspaces.length, savedDocuments.length]);

  // ==================== TODO LIST FUNCTIONS ====================

  /**
   * Add a new todo item
   * Creates todo with unique ID and default properties
   */
  const addTodo = () => {
    if (newTodo.trim() !== '') {
      const todo = {
        id: Date.now(),
        text: newTodo,
        completed: false,
        createdAt: new Date().toISOString()
      };
      setTodos([...todos, todo]);
      setNewTodo('');
    }
  };

  /**
   * Toggle todo completion status
   * Marks todo as completed or uncompleted
   * 
   * @param {number} id - Todo item ID
   */
  const toggleTodo = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  /**
   * Delete a todo item
   * Removes todo from the list
   * 
   * @param {number} id - Todo item ID
   */
  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  /**
   * Start editing a todo item
   * Sets editing state with current todo text
   * 
   * @param {number} id - Todo item ID
   * @param {string} text - Current todo text
   */
  const startEditing = (id, text) => {
    setEditingTodoId(id);
    setEditingTodoText(text);
  };

  /**
   * Save edited todo item
   * Updates todo text and exits editing mode
   */
  const saveEdit = () => {
    if (editingTodoText.trim() !== '') {
      setTodos(todos.map(todo => 
        todo.id === editingTodoId ? { ...todo, text: editingTodoText } : todo
      ));
      setEditingTodoId(null);
      setEditingTodoText('');
    }
  };

  /**
   * Cancel editing mode
   * Exits editing without saving changes
   */
  const cancelEdit = () => {
    setEditingTodoId(null);
    setEditingTodoText('');
  };

  // ==================== WORKSPACE INVITATION FUNCTIONS ====================

  /**
   * Generate and display workspace invitation link
   * Creates a unique encoded link for joining workspaces
   * 
   * @param {Object} workspace - Workspace object to generate invite for
   */
  const generateWorkspaceInviteLink = (workspace) => {
    const inviteCode = btoa(`${workspace.id}-${Date.now()}`);
    const link = `${window.location.origin}/join-workspace?code=${inviteCode}&workspace=${workspace.id}`;
    setWorkspaceInviteLink(link);
    setShowWorkspaceInvite(true);
  };

  /**
   * Copy workspace invitation link to clipboard
   * Provides visual feedback when link is copied
   */
  const copyWorkspaceInvite = () => {
    navigator.clipboard.writeText(workspaceInviteLink);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
  };

  // ==================== SAVED CONTENT LOADING FUNCTIONS ====================

  /**
   * Load saved whiteboards for current workspace
   * Fetches whiteboard data from database and updates state
   */
  const loadSavedWhiteboards = async () => {
    if (!selectedWorkspace) return;
    
    try {
      const { data, error } = await supabase
        .from('whiteboards')
        .select('*')
        .eq('workspace_id', selectedWorkspace)
        .order('updated_at', { ascending: false });

      if (!error && data) {
        setSavedWhiteboards(data);
      }
    } catch (error) {
      console.error('Error loading whiteboards:', error);
    }
  };

  /**
   * Load saved documents for current workspace
   * Fetches document data from database and updates state
   */
  const loadSavedDocuments = async () => {
    if (!selectedWorkspace) return;
    
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('workspace_id', selectedWorkspace)
        .order('updated_at', { ascending: false });

      if (!error && data) {
        setSavedDocuments(data);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  // ==================== CONTENT OPENING FUNCTIONS ====================

  /**
   * Open whiteboard editor
   * Either creates new whiteboard or loads existing one
   * 
   * @param {string|null} whiteboardId - ID of whiteboard to load, or null for new
   */
  const openWhiteboard = (whiteboardId = null) => {
    setSelectedWhiteboardId(whiteboardId);
    setShowWhiteboard(true);
    setShowWhiteboardList(false);
  };

  /**
   * Open document editor
   * Either creates new document or loads existing one
   * 
   * @param {string|null} documentId - ID of document to load, or null for new
   */
  const openDocument = (documentId = null) => {
    setSelectedDocumentId(documentId);
    setShowDocumentEditor(true);
    setShowDocumentList(false);
  };

  // ==================== DELETE FUNCTIONS ====================

  /**
   * Delete a saved whiteboard
   * Removes whiteboard from database and updates UI
   * 
   * @param {string} whiteboardId - ID of whiteboard to delete
   * @param {Event} e - Click event (stopped from propagating)
   */
  const deleteWhiteboard = async (whiteboardId, e) => {
    e.stopPropagation(); // Prevent opening the whiteboard when clicking delete
    
    if (!window.confirm('Are you sure you want to delete this whiteboard?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('whiteboards')
        .delete()
        .eq('id', whiteboardId);

      if (error) throw error;
      
      // Refresh the list
      loadSavedWhiteboards();
      alert('✅ Whiteboard deleted successfully!');
    } catch (error) {
      console.error('Error deleting whiteboard:', error);
      alert('❌ Failed to delete whiteboard');
    }
  };

  /**
   * Delete a saved document
   * Removes document from database and updates UI
   * 
   * @param {string} documentId - ID of document to delete
   * @param {Event} e - Click event (stopped from propagating)
   */
  const deleteDocument = async (documentId, e) => {
    e.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;
      
      loadSavedDocuments();
      alert('✅ Document deleted successfully!');
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('❌ Failed to delete document');
    }
  };

  /**
   * Delete a workspace
   * Removes workspace and all associated data from database
   * 
   * @param {string} workspaceId - ID of workspace to delete
   * @param {Event} e - Click event (stopped from propagating)
   */
  const deleteWorkspace = async (workspaceId, e) => {
    e.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this workspace? All associated data will be lost.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', workspaceId);

      if (error) throw error;
      
      // Refresh workspaces list
      loadWorkspaces();
      
      // If deleted workspace was selected, clear selection
      if (selectedWorkspace === workspaceId) {
        setSelectedWorkspace(null);
      }
      
      setSuccessMessage('✅ Workspace deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting workspace:', error);
      setErrorMessage('❌ Failed to delete workspace');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const loadWorkspaces = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('workspace_members')
        .select(`
          workspace_id,
          workspaces (
            id,
            name,
            description,
            created_at
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error loading workspaces:', error);
        setWorkspaces([{
          id: 'demo-workspace',
          name: 'Demo Workspace',
          description: 'Your default workspace'
        }]);
        setSelectedWorkspace('demo-workspace');
      } else if (data && data.length > 0) {
        const workspaceList = data.map(item => item.workspaces).filter(Boolean);
        setWorkspaces(workspaceList);
        if (workspaceList.length > 0 && !selectedWorkspace) {
          setSelectedWorkspace(workspaceList[0].id);
        }
      } else {
        setWorkspaces([{
          id: 'demo-workspace',
          name: 'Demo Workspace',
          description: 'Your default workspace'
        }]);
        setSelectedWorkspace('demo-workspace');
      }
    } catch (error) {
      console.error('Error:', error);
      setWorkspaces([{
        id: 'demo-workspace',
        name: 'Demo Workspace',
        description: 'Your default workspace'
      }]);
      setSelectedWorkspace('demo-workspace');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    
    console.log('=== WORKSPACE CREATION STARTED ===');
    console.log('Form submitted');
    console.log('Workspace name:', newWorkspaceName);
    
    if (!newWorkspaceName.trim()) {
      console.log('ERROR: Empty workspace name');
      setErrorMessage('Workspace name is required');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    console.log('Setting loading state to true');
    setIsCreatingWorkspace(true);
    setErrorMessage('');
    setSuccessMessage('');

    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.error('TIMEOUT: Workspace creation taking too long (10s)');
      setErrorMessage('❌ Operation timed out. Tables might not exist in Supabase. Run the SQL script!');
      setIsCreatingWorkspace(false);
    }, 10000); // 10 second timeout

    try {
      console.log('Attempting to create workspace...');
      console.log('User object:', user);
      console.log('User ID:', user?.id);
      
      if (!user || !user.id) {
        clearTimeout(timeoutId);
        throw new Error('User not authenticated. Please refresh and try again.');
      }
      
      console.log('Calling Supabase insert...');
      console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
      console.log('About to insert:', {
        name: newWorkspaceName.trim(),
        description: newWorkspaceDesc.trim() || null,
        created_by: user.id
      });
      
      // Simplified insert without abort signal first
      const { data: workspace, error: workspaceError } = await supabase
        .from('workspaces')
        .insert({
          name: newWorkspaceName.trim(),
          description: newWorkspaceDesc.trim() || null,
          created_by: user.id
        })
        .select()
        .single();

      clearTimeout(timeoutId);

      if (workspaceError) {
        clearTimeout(timeoutId);
        console.error('Workspace creation error:', workspaceError);
        console.error('Error code:', workspaceError.code);
        console.error('Error details:', workspaceError.details);
        console.error('Error hint:', workspaceError.hint);
        throw new Error(workspaceError.message || 'Failed to create workspace');
      }

      console.log('Workspace created successfully!', workspace);
      console.log('Now adding member...');

      const { error: memberError } = await supabase
        .from('workspace_members')
        .insert([{
          workspace_id: workspace.id,
          user_id: user.id,
          role: 'admin'
        }]);

      console.log('Member addition response');
      console.log('Member error:', memberError);

      if (memberError) {
        console.error('Member addition error:', memberError);
        throw new Error('Workspace created but failed to add you as member');
      }

      console.log('Member added successfully!');

      console.log('Showing success message');
      setSuccessMessage(`✅ Workspace "${newWorkspaceName}" created successfully!`);
      setNewWorkspaceName('');
      setNewWorkspaceDesc('');
      setShowCreateWorkspace(false);
      
      console.log('Reloading workspaces...');
      await loadWorkspaces();
      setSelectedWorkspace(workspace.id);
      
      clearTimeout(timeoutId);
      setTimeout(() => setSuccessMessage(''), 3000);
      console.log('=== WORKSPACE CREATION COMPLETED SUCCESSFULLY ===');
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('=== WORKSPACE CREATION FAILED ===');
      console.error('Error details:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      setErrorMessage(`❌ ${error.message || 'Could not create workspace. Please try again.'}`);
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      console.log('Setting loading state to false');
      setIsCreatingWorkspace(false);
      console.log('=== WORKSPACE CREATION PROCESS ENDED ===');
    }
  };

  const handleLogout = async () => {
    console.log('Logout button clicked');
    try {
      console.log('Attempting to sign out...');
      const { error } = await signOut();
      if (error) {
        console.error('Logout error:', error);
        setErrorMessage(`Failed to logout: ${error.message}`);
        setTimeout(() => setErrorMessage(''), 3000);
      } else {
        console.log('Logout successful');
      }
    } catch (err) {
      console.error('Unexpected logout error:', err);
      setErrorMessage('An error occurred during logout');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const username = profile?.username || user?.user_metadata?.username || user?.email?.split('@')[0] || 'User';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-gray-900/80 backdrop-blur-lg border-b border-gray-800 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/50">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Collaboro</h1>
                <p className="text-gray-400 text-sm">Welcome, {username}!</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowUserProfile(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-cyan-400 rounded-lg hover:bg-gray-700 transition-colors border border-gray-700"
              >
                <UserIcon className="w-5 h-5" />
                Profile
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-900/50 text-red-400 rounded-lg hover:bg-red-900/70 transition-colors border border-red-800"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 right-4 z-50 max-w-md"
          >
            <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="font-medium">{successMessage}</p>
            </div>
          </motion.div>
        )}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 right-4 z-50 max-w-md"
          >
            <div className="bg-red-500 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="font-medium">{errorMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 100, 
              damping: 15, 
              delay: 0.1 
            }}
            className="lg:col-span-1"
          >
            <div className="card">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 150, 
                  damping: 20, 
                  delay: 0.2 
                }}
                className="flex items-center justify-between mb-4"
              >
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Users className="w-6 h-6 text-cyan-400" />
                  Workspaces
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowCreateWorkspace(!showCreateWorkspace)}
                  className="p-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors border border-cyan-500/30"
                >
                  <Plus className="w-5 h-5" />
                </motion.button>
              </motion.div>

              {showCreateWorkspace && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  onSubmit={handleCreateWorkspace}
                  className="mb-4 p-4 bg-gray-800 rounded-lg space-y-3 border border-gray-700"
                >
                  <input
                    type="text"
                    value={newWorkspaceName}
                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                    placeholder="Workspace name"
                    className="input-field text-sm"
                    required
                  />
                  <textarea
                    value={newWorkspaceDesc}
                    onChange={(e) => setNewWorkspaceDesc(e.target.value)}
                    placeholder="Description (optional)"
                    className="input-field text-sm resize-none"
                    rows="2"
                  />
                  <button 
                    type="submit" 
                    disabled={isCreatingWorkspace}
                    className="btn-primary w-full text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreatingWorkspace ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Create Workspace
                      </>
                    )}
                  </button>
                </motion.form>
              )}

              <div className="space-y-2">
                {workspaces.map((workspace) => (
                  <motion.div
                    key={workspace.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative group"
                  >
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedWorkspace(workspace.id)}
                      className={`w-full text-left p-4 rounded-lg transition-all ${
                        selectedWorkspace === workspace.id
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/50'
                          : 'bg-gray-800 text-gray-200 hover:bg-gray-700 border border-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">{workspace.name}</h3>
                          {workspace.description && (
                            <p className={`text-sm mt-1 ${
                              selectedWorkspace === workspace.id ? 'text-cyan-100' : 'text-gray-400'
                            }`}>
                              {workspace.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.button>
                    {selectedWorkspace === workspace.id && (
                      <div className="absolute top-3 right-3 flex items-center gap-2">
                        <motion.button
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => deleteWorkspace(workspace.id, e)}
                          className="p-2 bg-red-600/80 hover:bg-red-600 rounded-lg transition-all"
                          title="Delete workspace"
                        >
                          <Trash2 className="w-4 h-4 text-white" />
                        </motion.button>
                        <motion.button
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => generateWorkspaceInviteLink(workspace)}
                          className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all"
                          title="Invite to workspace"
                        >
                          <UserPlus className="w-4 h-4 text-white" />
                        </motion.button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Todo List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 150, 
                damping: 20, 
                delay: 0.3 
              }}
              className="card mt-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <List className="w-5 h-5 text-green-400" />
                  Your Todo List
                </h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowTodoList(true)}
                  className="text-sm text-cyan-400 hover:text-cyan-300 font-medium"
                >
                  View All
                </motion.button>
              </div>
              
              {/* Add new todo */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                  placeholder="Add a new task..."
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={addTodo}
                  className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </motion.button>
              </div>
              
              {/* Todo items preview */}
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {todos.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">No tasks yet. Add your first task above!</p>
                ) : (
                  todos.slice(0, 3).map((todo) => (
                    <motion.div
                      key={todo.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 p-2 bg-gray-700/50 rounded-lg"
                    >
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleTodo(todo.id)}
                        className={`p-1 rounded ${todo.completed ? 'bg-green-500' : 'border border-gray-500'}`}
                      >
                        {todo.completed && <Check className="w-3 h-3 text-white" />}
                      </motion.button>
                      <span className={`flex-1 text-sm ${todo.completed ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                        {todo.text}
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => deleteTodo(todo.id)}
                        className="p-1 text-red-500 hover:bg-red-500/20 rounded"
                      >
                        <Trash2 className="w-3 h-3" />
                      </motion.button>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>

            {/* User Achievements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 150, 
                damping: 20, 
                delay: 0.4 
              }}
              className="card mt-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-400" />
                  Your Achievements
                </h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAchievements(true)}
                  className="text-sm text-cyan-400 hover:text-cyan-300 font-medium"
                >
                  View All
                </motion.button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/30 text-center">
                  <Star className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-300">First Login</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg border border-blue-500/30 text-center">
                  <Users className="w-6 h-6 text-blue-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-300">Team Player</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30 text-center">
                  <PenTool className="w-6 h-6 text-purple-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-300">Creator</p>
                </div>
              </div>
            </motion.div>

            {/* Daily Inspiration */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 150, 
                damping: 20, 
                delay: 0.5 
              }}
              className="card mt-6"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Coffee className="w-5 h-5 text-amber-400" />
                Daily Inspiration
              </h3>
              <div className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-lg border border-amber-500/30">
                <p className="text-gray-300 italic">"Collaboration is the key to unlocking innovation and achieving extraordinary results together."</p>
                <p className="text-sm text-amber-400 mt-2">- Team Collaboro</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowDailyTip(true)}
                className="w-full mt-4 p-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium"
              >
                Get Productivity Tip
              </motion.button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 100, 
              damping: 15, 
              delay: 0.2 
            }}
            className="lg:col-span-2"
          >
            <div className="card">
              <h2 className="text-2xl font-bold text-white mb-6">
                Collaboration Tools
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 150, 
                    damping: 20, 
                    delay: 0.3 
                  }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowChat(true)}
                  disabled={!selectedWorkspace}
                  className="p-8 bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-2xl shadow-lg shadow-cyan-500/30 hover:shadow-2xl hover:shadow-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MessageCircle className="w-12 h-12 mb-4 mx-auto" />
                  <h3 className="text-xl font-bold mb-2">Real-time Chat</h3>
                  <p className="text-cyan-100 text-sm">
                    Instant messaging with your team
                  </p>
                </motion.button>

                <motion.div
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="relative group"
                >
                  <motion.button
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setCallMode('conference');
                      setShowVideo(true);
                    }}
                    disabled={!selectedWorkspace}
                    className="w-full p-8 bg-gradient-to-br from-purple-600 to-indigo-700 text-white rounded-2xl shadow-lg shadow-purple-600/30 hover:shadow-2xl hover:shadow-purple-600/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Video className="w-12 h-12 mb-4 mx-auto" />
                    <h3 className="text-xl font-bold mb-2">Video Conference</h3>
                    <p className="text-purple-100 text-sm">
                      Face-to-face collaboration
                    </p>
                  </motion.button>
                  {selectedWorkspace && (
                    <motion.button
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1, scale: 1.02 }}
                      onClick={() => {
                        setCallMode('one-on-one');
                        setShowVideo(true);
                      }}
                      className="absolute top-2 right-2 px-3 py-1 bg-purple-700 hover:bg-purple-800 rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      1-on-1 Call
                    </motion.button>
                  )}
                </motion.div>

                <motion.div
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="relative group"
                >
                  <motion.button
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      loadSavedWhiteboards();
                      setShowWhiteboardList(true);
                    }}
                    disabled={!selectedWorkspace}
                    className="w-full p-8 bg-gradient-to-br from-pink-600 to-rose-700 text-white rounded-2xl shadow-lg shadow-pink-600/30 hover:shadow-2xl hover:shadow-pink-600/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <PenTool className="w-12 h-12 mb-4 mx-auto" />
                    <h3 className="text-xl font-bold mb-2">Whiteboard</h3>
                    <p className="text-pink-100 text-sm">
                      Collaborative drawing and brainstorming
                    </p>
                  </motion.button>
                </motion.div>

                <motion.button
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    loadSavedDocuments();
                    setShowDocumentList(true);
                  }}
                  disabled={!selectedWorkspace}
                  className="p-8 bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl shadow-lg shadow-emerald-600/30 hover:shadow-2xl hover:shadow-emerald-600/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileText className="w-12 h-12 mb-4 mx-auto" />
                  <h3 className="text-xl font-bold mb-2">Document Editor</h3>
                  <p className="text-emerald-100 text-sm">
                    Create and edit rich text documents
                  </p>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowFileUpload(true)}
                  disabled={!selectedWorkspace}
                  className="p-8 bg-gradient-to-br from-orange-600 to-amber-700 text-white rounded-2xl shadow-lg shadow-orange-600/30 hover:shadow-2xl hover:shadow-orange-600/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload className="w-12 h-12 mb-4 mx-auto" />
                  <h3 className="text-xl font-bold mb-2">Upload Documents</h3>
                  <p className="text-orange-100 text-sm">
                    Upload and manage files
                  </p>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowInvitationManager(true)}
                  className="p-8 bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-2xl shadow-lg shadow-indigo-600/30 hover:shadow-2xl hover:shadow-indigo-600/50 transition-all"
                >
                  <LinkIcon className="w-12 h-12 mb-4 mx-auto" />
                  <h3 className="text-xl font-bold mb-2">Join with Invite</h3>
                  <p className="text-indigo-100 text-sm">
                    Paste an invitation link to join workspaces or calls
                  </p>
                </motion.button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
                <div className="p-4 bg-green-900/30 rounded-xl border border-green-800">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-400 font-medium">Connected</span>
                  </div>
                </div>
                <div className="p-4 bg-cyan-900/30 rounded-xl border border-cyan-800">
                  <p className="text-cyan-400 font-medium">
                    {workspaces.length} Workspace{workspaces.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="p-4 bg-purple-900/30 rounded-xl border border-purple-800">
                  <p className="text-purple-400 font-medium">5 Tools Available</p>
                </div>
                <div className="p-4 bg-pink-900/30 rounded-xl border border-pink-800">
                  <p className="text-pink-400 font-medium">Real-time Sync</p>
                </div>
                <div className="p-4 bg-orange-900/30 rounded-xl border border-orange-800">
                  <p className="text-orange-400 font-medium">File Upload</p>
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 150, 
                damping: 20, 
                delay: 0.5 
              }}
              className="card mt-6"
            >
              <h3 className="text-xl font-bold text-white mb-4">Features</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="p-2 bg-primary-100 rounded-lg mt-0.5">
                    <MessageCircle className="w-4 h-4 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Real-time Chat</h4>
                    <p className="text-gray-300 text-sm">Instant messaging with workspace members</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg mt-0.5">
                    <Video className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Video Conferencing</h4>
                    <p className="text-gray-300 text-sm">HD video calls with screen sharing</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="p-2 bg-pink-100 rounded-lg mt-0.5">
                    <PenTool className="w-4 h-4 text-pink-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Collaborative Whiteboard</h4>
                    <p className="text-gray-300 text-sm">Draw and brainstorm together in real-time</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg mt-0.5">
                    <FileText className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Document Editor</h4>
                    <p className="text-gray-300 text-sm">Create and edit rich text documents together</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 rounded-lg mt-0.5">
                    <Users className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Team Workspaces</h4>
                    <p className="text-gray-300 text-sm">Organize your team into dedicated spaces</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg mt-0.5">
                    <Upload className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">File Upload & Management</h4>
                    <p className="text-gray-300 text-sm">Upload, download, and manage workspace files</p>
                  </div>
                </li>
              </ul>
            </motion.div>

            {/* Quick Tips Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 150, 
                damping: 20, 
                delay: 0.6 
              }}
              className="card mt-6"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-cyan-400" />
                Quick Tips
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
                  <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-200 text-sm">Start a Conversation</h4>
                    <p className="text-gray-400 text-xs mt-1">Click the Chat button to instantly message your team members</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Video className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-200 text-sm">Host Video Calls</h4>
                    <p className="text-gray-400 text-xs mt-1">Choose between 1-on-1 or conference calls for team meetings</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-pink-500/10 rounded-lg border border-pink-500/30">
                  <div className="w-8 h-8 bg-pink-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <UserPlus className="w-4 h-4 text-pink-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-200 text-sm">Invite Team Members</h4>
                    <p className="text-gray-400 text-xs mt-1">Click the invite button on your workspace to share invite links</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Activity Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 150, 
                damping: 20, 
                delay: 0.7 
              }}
              className="card mt-6"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                Your Activity
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-200">Active Workspaces</p>
                      <p className="text-xs text-gray-400">Total workspaces you're in</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    {workspaces.length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-200">Session Time</p>
                      <p className="text-xs text-gray-400">Time spent today</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                    --
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-200">Productivity</p>
                      <p className="text-xs text-gray-400">This week's progress</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                    ✨
                  </span>
                </div>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </div>

      {showChat && (
        <Chat
          workspaceId={selectedWorkspace}
          isOpen={showChat}
          onClose={() => setShowChat(false)}
        />
      )}

      {showVideo && (
        <VideoConference
          workspaceId={selectedWorkspace}
          isOpen={showVideo}
          onClose={() => setShowVideo(false)}
          callMode={callMode}
        />
      )}

      {showWhiteboard && (
        <Whiteboard
          workspaceId={selectedWorkspace}
          whiteboardId={selectedWhiteboardId}
          isOpen={showWhiteboard}
          onClose={() => {
            setShowWhiteboard(false);
            setSelectedWhiteboardId(null);
          }}
        />
      )}

      {showDocumentEditor && (
        <DocumentEditor
          workspaceId={selectedWorkspace}
          documentId={selectedDocumentId}
          isOpen={showDocumentEditor}
          onClose={() => {
            setShowDocumentEditor(false);
            setSelectedDocumentId(null);
          }}
        />
      )}

      {showFileUpload && (
        <FileUpload
          workspaceId={selectedWorkspace}
          isOpen={showFileUpload}
          onClose={() => setShowFileUpload(false)}
        />
      )}

      {showUserProfile && (
        <UserProfile
          isOpen={showUserProfile}
          onClose={() => setShowUserProfile(false)}
        />
      )}

      {/* Whiteboard List Modal */}
      <AnimatePresence>
        {showWhiteboardList && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowWhiteboardList(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <PenTool className="w-7 h-7 text-pink-600" />
                  Your Whiteboards
                </h3>
                <button
                  onClick={() => setShowWhiteboardList(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => openWhiteboard(null)}
                className="w-full mb-4 p-4 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create New Whiteboard
              </motion.button>

              <div className="space-y-3">
                {savedWhiteboards.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <PenTool className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No saved whiteboards yet</p>
                    <p className="text-sm">Create your first whiteboard to get started!</p>
                  </div>
                ) : (
                  savedWhiteboards.map((whiteboard) => (
                    <motion.div
                      key={whiteboard.id}
                      whileHover={{ scale: 1.02 }}
                      className="p-4 border border-gray-200 rounded-xl hover:border-pink-500 hover:shadow-md transition-all cursor-pointer relative group"
                      onClick={() => openWhiteboard(whiteboard.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900">{whiteboard.name}</h4>
                          <p className="text-sm text-gray-500">
                            Last updated: {new Date(whiteboard.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => deleteWhiteboard(whiteboard.id, e)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete whiteboard"
                          >
                            <Trash2 className="w-5 h-5" />
                          </motion.button>
                          <div className="text-pink-600">
                            <PenTool className="w-5 h-5" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Workspace Invite Modal */}
      <AnimatePresence>
        {showWorkspaceInvite && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowWorkspaceInvite(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <UserPlus className="w-7 h-7 text-primary-600" />
                  Invite to Workspace
                </h3>
                <button
                  onClick={() => setShowWorkspaceInvite(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-600 mb-4">
                  Share this link to invite people to join this workspace:
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={workspaceInviteLink}
                    readOnly
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-sm font-mono"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={copyWorkspaceInvite}
                    className="px-6 py-3 bg-primary-600 hover:bg-primary-700 rounded-lg text-white font-medium flex items-center gap-2 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    {copiedInvite ? 'Copied!' : 'Copy'}
                  </motion.button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <LinkIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">How it works</h4>
                    <p className="text-blue-700 text-sm">
                      Anyone with this link can join your workspace. They'll need to create an account or sign in first.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowWorkspaceInvite(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition-colors"
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Document List Modal */}
      <AnimatePresence>
        {showDocumentList && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowDocumentList(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-7 h-7 text-emerald-600" />
                  Your Documents
                </h3>
                <button
                  onClick={() => setShowDocumentList(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => openDocument(null)}
                className="w-full mb-4 p-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create New Document
              </motion.button>

              <div className="space-y-3">
                {savedDocuments.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No saved documents yet</p>
                    <p className="text-sm">Create your first document to get started!</p>
                  </div>
                ) : (
                  savedDocuments.map((document) => (
                    <motion.div
                      key={document.id}
                      whileHover={{ scale: 1.02 }}
                      className="p-4 border border-gray-200 rounded-xl hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer relative group"
                      onClick={() => openDocument(document.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900">{document.name}</h4>
                          <p className="text-sm text-gray-500">
                            Last updated: {new Date(document.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => deleteDocument(document.id, e)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete document"
                          >
                            <Trash2 className="w-5 h-5" />
                          </motion.button>
                          <div className="text-emerald-600">
                            <FileText className="w-5 h-5" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Achievements Modal */}
      <AnimatePresence>
        {showAchievements && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowAchievements(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl max-h-[80vh] overflow-y-auto border border-gray-700"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Award className="w-7 h-7 text-yellow-400" />
                  Your Achievements
                </h3>
                <button
                  onClick={() => setShowAchievements(false)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-4 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-500/30 text-center"
                >
                  <div className="w-12 h-12 bg-yellow-500/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Star className="w-6 h-6 text-yellow-400" />
                  </div>
                  <h4 className="font-bold text-white mb-1">First Login</h4>
                  <p className="text-xs text-gray-300 mb-2">Completed</p>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full w-full"></div>
                  </div>
                  <p className="text-xs text-yellow-400 mt-1">100% Unlocked</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl border border-blue-500/30 text-center"
                >
                  <div className="w-12 h-12 bg-blue-500/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-blue-400" />
                  </div>
                  <h4 className="font-bold text-white mb-1">Team Player</h4>
                  <p className="text-xs text-gray-300 mb-2">Join a workspace</p>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full w-full"></div>
                  </div>
                  <p className="text-xs text-blue-400 mt-1">100% Unlocked</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30 text-center"
                >
                  <div className="w-12 h-12 bg-purple-500/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <PenTool className="w-6 h-6 text-purple-400" />
                  </div>
                  <h4 className="font-bold text-white mb-1">Creator</h4>
                  <p className="text-xs text-gray-300 mb-2">Create documents/whiteboards</p>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full" 
                      style={{ width: `${Math.min(100, (userStats.documents / 5) * 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-purple-400 mt-1">
                    {userStats.documents} of 5 completed
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20 text-center opacity-50"
                >
                  <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Gift className="w-6 h-6 text-gray-500" />
                  </div>
                  <h4 className="font-bold text-gray-500 mb-1">Streak Master</h4>
                  <p className="text-xs text-gray-500 mb-2">7 days active</p>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-gray-600 h-2 rounded-full w-0"></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Locked</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-4 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-500/20 text-center opacity-50"
                >
                  <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Trophy className="w-6 h-6 text-gray-500" />
                  </div>
                  <h4 className="font-bold text-gray-500 mb-1">Collaborator</h4>
                  <p className="text-xs text-gray-500 mb-2">Share 3 documents</p>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-gray-600 h-2 rounded-full w-0"></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Locked</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl border border-amber-500/20 text-center opacity-50"
                >
                  <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Target className="w-6 h-6 text-gray-500" />
                  </div>
                  <h4 className="font-bold text-gray-500 mb-1">Explorer</h4>
                  <p className="text-xs text-gray-500 mb-2">Try all tools</p>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-gray-600 h-2 rounded-full w-0"></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Locked</p>
                </motion.div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-700">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-cyan-400" />
                    <span className="text-sm text-gray-300">Overall Progress</span>
                  </div>
                  <span className="text-sm font-medium text-cyan-400">
                    {Math.round((3 / 6) * 100)}% Complete
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                  <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full" style={{ width: '50%' }}></div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Daily Tip Modal */}
      <AnimatePresence>
        {showDailyTip && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowDailyTip(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl border border-gray-700"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Zap className="w-7 h-7 text-amber-400" />
                  Productivity Tip of the Day
                </h3>
                <button
                  onClick={() => setShowDailyTip(false)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="p-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl border border-amber-500/30 mb-6">
                <Coffee className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                <h4 className="text-xl font-bold text-white text-center mb-3">Focus & Flow</h4>
                <p className="text-gray-300 text-center mb-4">
                  "Set a timer for 25 minutes and focus solely on one task. Take a 5-minute break, then repeat. 
                  This Pomodoro technique helps maintain concentration and prevents burnout."
                </p>
                <div className="flex items-center justify-center gap-2 text-amber-400">
                  <Target className="w-5 h-5" />
                  <span className="text-sm font-medium">Pro Tip: Use the chat feature to quickly share updates with your team!</span>
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDailyTip(false)}
                  className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors"
                >
                  Close
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowDailyTip(false);
                    setShowChat(true);
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg text-white font-medium transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Try It Now
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Todo List Modal */}
      <AnimatePresence>
        {showTodoList && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowTodoList(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl max-h-[80vh] overflow-y-auto border border-gray-700"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <List className="w-7 h-7 text-green-400" />
                  Your Todo List
                </h3>
                <button
                  onClick={() => setShowTodoList(false)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Add new todo */}
              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                  placeholder="Add a new task..."
                  className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={addTodo}
                  className="px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white flex items-center justify-center gap-2 font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Add
                </motion.button>
              </div>

              {/* Todo items */}
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                {todos.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <List className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">No tasks yet</p>
                    <p className="text-sm">Add your first task using the input above!</p>
                  </div>
                ) : (
                  todos.map((todo) => (
                    <motion.div
                      key={todo.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-gray-700/50 rounded-xl border border-gray-600"
                    >
                      {editingTodoId === todo.id ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={editingTodoText}
                            onChange={(e) => setEditingTodoText(e.target.value)}
                            className="flex-1 px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            autoFocus
                          />
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={saveEdit}
                            className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white"
                          >
                            <Check className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={cancelEdit}
                            className="px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-white"
                          >
                            <X className="w-4 h-4" />
                          </motion.button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => toggleTodo(todo.id)}
                            className={`p-2 rounded-full ${todo.completed ? 'bg-green-500' : 'border-2 border-gray-500'}`}
                          >
                            {todo.completed && <Check className="w-4 h-4 text-white" />}
                          </motion.button>
                          <div className="flex-1">
                            <p className={`${todo.completed ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                              {todo.text}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Added: {new Date(todo.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => startEditing(todo.id, todo.text)}
                              className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg"
                            >
                              <Edit3 className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => deleteTodo(todo.id)}
                              className="p-2 text-red-500 hover:bg-red-500/20 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </div>

              {/* Todo stats */}
              <div className="mt-6 pt-4 border-t border-gray-700 flex justify-between text-sm text-gray-400">
                <span>{todos.filter(t => t.completed).length} of {todos.length} completed</span>
                <span>{todos.length > 0 ? Math.round((todos.filter(t => t.completed).length / todos.length) * 100) : 0}% done</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invitation Manager Modal */}
      <InvitationManager 
        isOpen={showInvitationManager} 
        onClose={() => setShowInvitationManager(false)} 
      />
    </div>
  );
};

export default Dashboard;