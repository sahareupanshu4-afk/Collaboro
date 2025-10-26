/**
 * ============================================================================
 * AUTHENTICATION CONTEXT
 * ============================================================================
 * Global authentication state management using React Context
 * 
 * Features:
 * - User authentication state (logged in/out)
 * - User profile data from database
 * - Sign up, sign in, sign out functions
 * - Automatic session persistence
 * - Socket.io connection on authentication
 * - Profile auto-creation for new users
 * 
 * Usage:
 * import { useAuth } from './contexts/AuthContext';
 * const { user, profile, signIn, signOut } = useAuth();
 * ============================================================================
 */

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../config/supabase';
import { socketService } from '../services/socketService';

// Create context with default empty object
const AuthContext = createContext({});

/**
 * Custom hook to access authentication context
 * @returns {Object} Authentication context value
 * @throws {Error} If used outside of AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

/**
 * Authentication Provider Component
 * Wraps the app to provide authentication state to all children
 * 
 * @param {Object} props
 * @param {ReactNode} props.children - Child components
 */
export const AuthProvider = ({ children }) => {
  // State management
  const [user, setUser] = useState(null);           // Supabase auth user object
  const [profile, setProfile] = useState(null);     // User profile from database
  const [loading, setLoading] = useState(true);     // Loading state during auth check

  /**
   * Effect: Initialize authentication and listen for auth state changes
   * Runs once on component mount
   */
  useEffect(() => {
    let mounted = true;
    
    // Timeout to prevent infinite loading state
    const loadTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.log('Auth loading timeout - setting to false');
        setLoading(false);
      }
    }, 5000);

    /**
     * Check for existing session on app load
     * Loads user profile if session exists
     */
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      if (session?.user) {
        loadOrCreateUserProfile(session.user);
        connectSocket(session.user);
      }
      setLoading(false);
      clearTimeout(loadTimeout);
    }).catch(error => {
      console.error('Session error:', error);
      if (mounted) setLoading(false);
    });

    /**
     * Listen for authentication state changes
     * Triggers on login, logout, token refresh, etc.
     */
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      if (session?.user) {
        await loadOrCreateUserProfile(session.user);
        connectSocket(session.user);
      } else {
        setProfile(null);
        socketService.disconnect();
      }
      setLoading(false);
    });

    // Cleanup function - runs when component unmounts
    return () => {
      mounted = false;
      clearTimeout(loadTimeout);
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Load existing user profile or create new one
   * Called after successful authentication
   * 
   * @param {Object} user - Supabase auth user object
   */
  const loadOrCreateUserProfile = async (user) => {
    try {
      // Attempt to load existing profile from database
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it automatically
        // Extract username from user metadata or email
        const username = user.user_metadata?.username || 
                        user.user_metadata?.full_name ||
                        user.email?.split('@')[0] || 
                        'User';
        
        const { data: newProfile, error: insertError } = await supabase
          .from('user_profiles')
          .insert([{
            id: user.id,
            username: username,
            full_name: user.user_metadata?.full_name || username,
            avatar_url: user.user_metadata?.avatar_url
          }])
          .select()
          .single();

        if (!insertError && newProfile) {
          setProfile(newProfile);
        } else {
          console.error('Error creating profile:', insertError);
        }
      } else if (data) {
        setProfile(data);
      } else if (error) {
        console.error('Error loading profile:', error);
      }
    } catch (error) {
      console.error('Error loading or creating profile:', error);
    }
  };

  /**
   * Establish Socket.io connection with user credentials
   * Called after successful authentication
   * 
   * @param {Object} user - Supabase auth user object
   */
  const connectSocket = (user) => {
    const userData = {
      userId: user.id,
      username: user.user_metadata?.username || user.email?.split('@')[0] || 'User',
      email: user.email
    };
    socketService.connect(userData);
  };

  /**
   * Sign up new user with email and password
   * Automatically creates user profile in database
   * 
   * @param {string} email - User email address
   * @param {string} password - User password
   * @param {string} username - Chosen username/display name
   * @returns {Object} { data, error }
   */
  const signUp = async (email, password, username) => {
    try {
      // Create auth user in Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username  // Store in user metadata
          }
        }
      });

      if (error) throw error;

      // Create corresponding user profile in database
      if (data.user) {
        await supabase.from('user_profiles').insert([
          {
            id: data.user.id,
            username: username,
            full_name: username
          }
        ]);
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  /**
   * Sign in existing user with email and password
   * 
   * @param {string} email - User email address
   * @param {string} password - User password
   * @returns {Object} { data, error }
   */
  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  /**
   * Sign out current user
   * Handles:
   * - Socket disconnection
   * - Supabase auth signout (with timeout)
   * - Local storage cleanup
   * - State reset
   * 
   * @returns {Object} { error } - Error object if signout failed
   */
  const signOut = async () => {
    try {
      console.log('🚪 Starting sign out process...');
      socketService.disconnect();
      
      // Force clear local state first
      setUser(null);
      setProfile(null);
      
      // Try to sign out from Supabase with timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Signout timeout')), 5000)
      );
      
      const signOutPromise = supabase.auth.signOut();
      
      try {
        const { error } = await Promise.race([signOutPromise, timeoutPromise]);
        if (error) {
          console.warn('Supabase signout error:', error);
        } else {
          console.log('✅ Signed out from Supabase');
        }
      } catch (timeoutError) {
        console.warn('⚠️ Supabase signout timed out, but local session cleared');
      }
      
      // Clear local storage as backup (ensures clean state)
      localStorage.clear();
      sessionStorage.clear();
      
      console.log('✅ Sign out complete');
      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      // Even if there's an error, clear local state
      setUser(null);
      setProfile(null);
      localStorage.clear();
      sessionStorage.clear();
      return { error };
    }
  };

  // Context value provided to all child components
  const value = {
    user,           // Current authenticated user
    profile,        // User profile from database
    setProfile,     // Function to update profile
    loading,        // Loading state
    signUp,         // Sign up function
    signIn,         // Sign in function
    signOut         // Sign out function
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
