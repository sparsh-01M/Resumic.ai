import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Linkedin, X, Loader2 } from 'lucide-react';
import Button from './ui/Button';

interface LinkedInConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (linkedinUrl: string) => Promise<void>;
}

const LinkedInConnectModal = ({ isOpen, onClose, onSubmit }: LinkedInConnectModalProps) => {
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Basic URL validation
    if (!linkedinUrl.trim()) {
      setError('Please enter your LinkedIn profile URL');
      return;
    }

    // Clean the URL by removing trailing slash and any @ symbol
    const cleanUrl = linkedinUrl.trim().replace(/\/$/, '').replace(/^@/, '');

    // Validate LinkedIn URL format - now handles URLs with or without trailing slash
    const linkedinUrlPattern = /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+(?:\/)?$/;
    if (!linkedinUrlPattern.test(cleanUrl)) {
      setError('Please enter a valid LinkedIn profile URL (e.g., https://linkedin.com/in/username)');
      return;
    }

    setLoading(true);
    try {
      // Pass the cleaned URL to the submit handler
      await onSubmit(cleanUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect LinkedIn profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <Linkedin className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Connect LinkedIn Profile
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-4">
                <label
                  htmlFor="linkedinUrl"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  LinkedIn Profile URL
                </label>
                <input
                  id="linkedinUrl"
                  type="url"
                  placeholder="https://linkedin.com/in/username"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  disabled={loading}
                />
                {error && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                )}
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Enter your public LinkedIn profile URL to connect your account
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  isLoading={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Linkedin className="w-4 h-4 mr-2" />
                      Connect Profile
                    </>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LinkedInConnectModal; 