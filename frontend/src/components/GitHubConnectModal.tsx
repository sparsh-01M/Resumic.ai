import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, X, Loader2, Check } from 'lucide-react';
import Button from './ui/Button';
import { parseGitHubProfile, displayProjects } from '../services/github';
import type { GitHubProject } from '../services/github';
import { api } from '../services/api';

interface GitHubConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (githubUrl: string) => Promise<void>;
  onSuccess?: () => void;
}

const GitHubConnectModal = ({ isOpen, onClose, onSubmit, onSuccess }: GitHubConnectModalProps) => {
  const [githubUrl, setGithubUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [connected, setConnected] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubUrl) return;

    setLoading(true);
    setError('');

    try {
      // Extract username from GitHub URL
      const username = githubUrl.match(/github\.com\/([^\/]+)/)?.[1];
      if (!username) {
        throw new Error('Invalid GitHub URL format');
      }

      // First connect the GitHub profile
      await onSubmit(githubUrl);
      
      // Then analyze the profile
      const profile = await parseGitHubProfile(username);
      displayProjects(profile);
      
      // Notify parent component of success
      onSuccess?.();
      
      // Close modal after a short delay to show success state
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect GitHub profile');
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
                  <Github className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Connect GitHub Profile
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
                  htmlFor="githubUrl"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  GitHub Profile URL
                </label>
                <input
                  id="githubUrl"
                  type="url"
                  placeholder="https://github.com/username"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  disabled={loading}
                />
                {error && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                )}
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Enter your public GitHub profile URL to connect your account and analyze your projects
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading || connected}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant={connected ? "success" : "primary"}
                  disabled={loading || connected}
                  isLoading={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {analyzing ? 'Analyzing Projects...' : 'Connecting...'}
                    </>
                  ) : connected ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      GitHub Connected
                    </>
                  ) : (
                    <>
                      <Github className="w-4 h-4 mr-2" />
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

export default GitHubConnectModal; 