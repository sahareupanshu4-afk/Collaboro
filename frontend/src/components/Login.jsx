/**
 * ============================================================================
 * LOGIN COMPONENT
 * ============================================================================
 * Authentication interface using Supabase Auth UI
 * 
 * Features:
 * - Sign in and sign up views
 * - Google OAuth integration
 * - Custom styling with Tailwind CSS
 * - Animated transitions with Framer Motion
 * - Back navigation to landing page
 * 
 * Props:
 * - onBack (Function): Callback to return to landing page
 * ============================================================================
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Sparkles } from 'lucide-react';

/**
 * Login Component
 * Handles user authentication with Supabase Auth UI
 * 
 * @param {Object} props
 * @param {Function} props.onBack - Callback to navigate back to landing page
 */
const Login = ({ onBack }) => {
  // State for toggling between sign in and sign up views
  const [view, setView] = useState('sign_in'); // 'sign_in' or 'sign_up'
  const { user } = useAuth();

  /**
   * Custom theme configuration for Supabase Auth UI
   * Overrides default styling with brand colors and spacing
   */
  const customTheme = {
    default: {
      colors: {
        brand: '#0ea5e9',
        brandAccent: '#0284c7',
        brandButtonText: 'white',
        defaultButtonBackground: '#f3f4f6',
        defaultButtonBackgroundHover: '#e5e7eb',
        defaultButtonBorder: '#d1d5db',
        defaultButtonText: '#1f2937',
        dividerBackground: '#e5e7eb',
        inputBackground: 'white',
        inputBorder: '#d1d5db',
        inputBorderHover: '#0ea5e9',
        inputBorderFocus: '#0ea5e9',
        inputText: '#1f2937',
        inputLabelText: '#374151',
        inputPlaceholder: '#9ca3af',
        messageText: '#1f2937',
        messageTextDanger: '#dc2626',
        anchorTextColor: '#0ea5e9',
        anchorTextHoverColor: '#0284c7',
      },
      space: {
        spaceSmall: '4px',
        spaceMedium: '8px',
        spaceLarge: '16px',
        labelBottomMargin: '8px',
        anchorBottomMargin: '4px',
        emailInputSpacing: '4px',
        socialAuthSpacing: '4px',
        buttonPadding: '10px 15px',
        inputPadding: '10px 15px',
      },
      fontSizes: {
        baseBodySize: '14px',
        baseInputSize: '14px',
        baseLabelSize: '14px',
        baseButtonSize: '14px',
      },
      fonts: {
        bodyFontFamily: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif`,
        buttonFontFamily: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif`,
        inputFontFamily: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif`,
        labelFontFamily: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif`,
      },
      borderWidths: {
        buttonBorderWidth: '1px',
        inputBorderWidth: '1px',
      },
      radii: {
        borderRadiusButton: '0.5rem',
        buttonBorderRadius: '0.5rem',
        inputBorderRadius: '0.5rem',
      },
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 px-4">
      {/* Back Button */}
      {onBack && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={onBack}
          className="fixed top-6 left-6 flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm text-gray-700 rounded-full hover:bg-white transition-all shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </motion.button>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="inline-flex items-center justify-center mb-4"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </motion.div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Collaboro
            </h1>
            <p className="text-gray-600">
              {view === 'sign_up' ? 'Create your account' : 'Welcome back!'}
            </p>
          </div>

          {/* Supabase Auth UI */}
          <div className="supabase-auth-container">
            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: customTheme.default,
                className: {
                  anchor: 'text-primary-600 hover:text-primary-700 font-medium',
                  button: 'btn-primary w-full',
                  container: 'space-y-4',
                  divider: 'my-4',
                  input: 'input-field',
                  label: 'block text-sm font-medium text-gray-700 mb-1',
                  message: 'text-sm text-red-600 mt-1',
                },
              }}
              providers={['google']}
              redirectTo={window.location.origin}
              view={view}
              theme="light"
              showLinks={true}
              localization={{
                variables: {
                  sign_in: {
                    email_label: 'Email',
                    password_label: 'Password',
                    email_input_placeholder: 'Enter your email',
                    password_input_placeholder: 'Enter your password',
                    button_label: 'Sign In',
                    loading_button_label: 'Signing in...',
                    social_provider_text: 'Sign in with {{provider}}',
                    link_text: "Don't have an account? Sign up",
                  },
                  sign_up: {
                    email_label: 'Email',
                    password_label: 'Password',
                    email_input_placeholder: 'Enter your email',
                    password_input_placeholder: 'Create a password (min 6 characters)',
                    button_label: 'Sign Up',
                    loading_button_label: 'Signing up...',
                    social_provider_text: 'Sign up with {{provider}}',
                    link_text: 'Already have an account? Sign in',
                  },
                  forgotten_password: {
                    email_label: 'Email',
                    password_label: 'Password',
                    email_input_placeholder: 'Enter your email',
                    button_label: 'Send reset password instructions',
                    loading_button_label: 'Sending reset instructions...',
                    link_text: 'Forgot your password?',
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Footer Message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6 text-gray-400 text-sm"
        >
          🚀 Connect, collaborate, and work remotely with your team
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Login;
