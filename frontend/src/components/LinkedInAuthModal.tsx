import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Linkedin, X, AlertCircle } from 'lucide-react';
import Button from './ui/Button';
import { api } from '../services/api';

interface LinkedInAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: any) => void;
}

const LinkedInAuthModal = ({ isOpen, onClose, onSuccess }: LinkedInAuthModalProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLinkedInAuth = async () => {
    setLoading(true);
    setError('');

    try {
      // Get LinkedIn OAuth URL from backend
      const { data, error } = await api.getLinkedInAuthUrl();
      
      if (error) {
        setError(error);
        return;
      }

      if (!data?.url) {
        setError('Failed to get LinkedIn authorization URL');
        return;
      }

      // Open LinkedIn authorization in a popup window
      const width = 600;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        data.url,
        'LinkedIn Authorization',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      // Listen for the OAuth callback
      const handleMessage = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        if (event.data.type === 'linkedin-auth-success') {
          const { code } = event.data;
          
          // Exchange code for access token and user data
          const { data: userData, error: tokenError } = await api.handleLinkedInCallback(code);
          
          if (tokenError) {
            setError(tokenError);
            return;
          }

          onSuccess(userData);
          onClose();
        }
      };

      window.addEventListener('message', handleMessage);
      
      // Clean up event listener when popup is closed
      const checkPopup = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkPopup);
          window.removeEventListener('message', handleMessage);
          if (!error) onClose();
        }
      }, 1000);

    } catch (err) {
      setError('Failed to connect with LinkedIn. Please try again.');
      console.error('LinkedIn auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 relative"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Linkedin className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Connect with LinkedIn
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                We'll import your professional experience, skills, and certifications to enhance your resume.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-error-50 dark:bg-error-900/20 text-error-600 dark:text-error-400 rounded-lg flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  We'll access:
                </h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2" />
                    Your basic profile information
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2" />
                    Work experience and education
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2" />
                    Skills and certifications
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2" />
                    Profile picture (optional)
                  </li>
                </ul>
              </div>

              <Button
                onClick={handleLinkedInAuth}
                variant="primary"
                fullWidth
                disabled={loading}
                className="flex items-center justify-center"
              >
                <Linkedin className="w-5 h-5 mr-2" />
                {loading ? 'Connecting...' : 'Continue with LinkedIn'}
              </Button>

              <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                By connecting, you agree to our{' '}
                <a href="/privacy" className="text-primary-600 dark:text-primary-400 hover:underline">
                  Privacy Policy
                </a>
                {' '}and{' '}
                <a href="/terms" className="text-primary-600 dark:text-primary-400 hover:underline">
                  Terms of Service
                </a>
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LinkedInAuthModal; 