import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  User, 
  Mail, 
  Camera, 
  Save,
  Bell,
  Globe
} from 'lucide-react';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';

const UserProfile = ({ isOpen, onClose }) => {
  const { user, profile, setProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile fields
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');
  
  // Preferences
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('UTC');
  
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  useEffect(() => {
    if (isOpen && profile) {
      loadUserData();
    }
  }, [isOpen, profile]);

  const loadUserData = async () => {
    // Load profile data
    setUsername(profile.username || '');
    setFullName(profile.full_name || '');
    setAvatarUrl(profile.avatar_url || '');
    setBio(profile.bio || '');

    // Load preferences
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        setNotificationEnabled(data.notification_enabled !== false);
        setLanguage(data.language || 'en');
        setTimezone(data.timezone || 'UTC');
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const saveProfile = async () => {
    setIsSaving(true);
    setMessage('');
    
    const timeoutId = setTimeout(() => {
      console.error('TIMEOUT: Profile save taking too long (10s)');
      setMessage('❌ Operation timed out. Please try again.');
      setIsSaving(false);
    }, 10000);
    
    try {
      console.log('Saving profile for user:', user.id);
      console.log('Profile data:', { username, fullName, bio });
      
      // Use upsert instead of update
      const { data, error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          username: username || user.email?.split('@')[0] || 'User',
          full_name: fullName || username || 'User',
          avatar_url: avatarUrl || null,
          bio: bio || ''
        }, {
          onConflict: 'id'
        })
        .select()
        .single();

      clearTimeout(timeoutId);

      if (profileError) {
        console.error('Profile update error:', profileError);
        console.error('Error code:', profileError.code);
        console.error('Error message:', profileError.message);
        throw profileError;
      }

      console.log('Profile updated successfully:', data);

      // Update local profile state
      setProfile(data);

      setMessage('✅ Profile updated successfully!');
      setMessageType('success');
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Error saving profile:', error);
      setMessage(`❌ Failed to update profile: ${error.message}`);
      setMessageType('error');
    } finally {
      console.log('Profile save process completed');
      setIsSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const savePreferences = async () => {
    setIsSaving(true);
    setMessage('');
    
    try {
      console.log('Saving preferences for user:', user.id);
      console.log('Preferences data:', { notificationEnabled, language, timezone });
      
      // Check if preferences exist
      const { data: existing } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('id', user.id)
        .single();

      if (existing) {
        console.log('Updating existing preferences');
        // Update existing preferences
        const { error } = await supabase
          .from('user_preferences')
          .update({
            notification_enabled: notificationEnabled,
            language,
            timezone
          })
          .eq('id', user.id);

        if (error) {
          console.error('Preferences update error:', error);
          throw error;
        }
      } else {
        console.log('Creating new preferences');
        // Insert new preferences
        const { error } = await supabase
          .from('user_preferences')
          .insert([{
            id: user.id,
            notification_enabled: notificationEnabled,
            language,
            timezone
          }]);

        if (error) {
          console.error('Preferences insert error:', error);
          throw error;
        }
      }

      console.log('Preferences saved successfully');
      setMessage('✅ Preferences updated successfully!');
      setMessageType('success');
    } catch (error) {
      console.error('Error saving preferences:', error);
      setMessage(`❌ Failed to update preferences: ${error.message}`);
      setMessageType('error');
    } finally {
      console.log('Preferences save process completed');
      setIsSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real app, you would upload to Supabase Storage
      // For now, we'll use a placeholder
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">User Profile</h2>
                  <p className="text-indigo-100 text-sm">Manage your account settings</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b bg-gray-50">
            <div className="flex gap-1 p-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'profile'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Profile Information
              </button>
              <button
                onClick={() => setActiveTab('preferences')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'preferences'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Preferences
              </button>
            </div>
          </div>

          {/* Message */}
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`mx-6 mt-4 p-4 rounded-lg ${
                  messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}
              >
                {message}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6 max-w-2xl mx-auto">
                {/* Avatar */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Avatar"
                        className="w-32 h-32 rounded-full object-cover border-4 border-indigo-200"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center border-4 border-indigo-200">
                        <User className="w-16 h-16 text-white" />
                      </div>
                    )}
                    <label className="absolute bottom-0 right-0 p-2 bg-indigo-600 text-white rounded-full cursor-pointer hover:bg-indigo-700 transition-colors shadow-lg">
                      <Camera className="w-5 h-5" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-sm text-gray-600">Click the camera icon to upload a new avatar</p>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      Username
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="input-field"
                      placeholder="Enter your username"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="input-field"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={user?.email}
                      disabled
                      className="input-field bg-gray-100 cursor-not-allowed"
                      placeholder="Email address"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="input-field resize-none"
                      rows="4"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={saveProfile}
                    disabled={isSaving}
                    className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Save Profile
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-6 max-w-2xl mx-auto">
                {/* Notifications */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-900">Enable Notifications</p>
                        <p className="text-sm text-gray-600">Receive notifications for messages and updates</p>
                      </div>
                    </div>
                    <div
                      onClick={() => setNotificationEnabled(!notificationEnabled)}
                      className={`relative w-14 h-8 rounded-full transition-colors ${
                        notificationEnabled ? 'bg-indigo-600' : 'bg-gray-300'
                      }`}
                    >
                      <motion.div
                        animate={{ x: notificationEnabled ? 24 : 2 }}
                        className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
                      />
                    </div>
                  </label>
                </div>

                {/* Language */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <Globe className="w-4 h-4 inline mr-2" />
                    Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="input-field"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="zh">Chinese</option>
                  </select>
                </div>

                {/* Timezone */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Timezone
                  </label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="input-field"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="Europe/London">London (GMT)</option>
                    <option value="Europe/Paris">Paris (CET)</option>
                    <option value="Asia/Tokyo">Tokyo (JST)</option>
                    <option value="Asia/Shanghai">Shanghai (CST)</option>
                  </select>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={savePreferences}
                  disabled={isSaving}
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Preferences
                    </>
                  )}
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UserProfile;
