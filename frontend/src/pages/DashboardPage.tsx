import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, Clipboard, Plus, Github, Linkedin, CheckCircle, File, Award, AlertCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import LinkedInAuthModal from '../components/LinkedInAuthModal';
import { api } from '../services/api';

const DashboardPage = () => {
  const { user } = useAuth();
  const [showLinkedInModal, setShowLinkedInModal] = useState(false);
  const [linkedInData, setLinkedInData] = useState<any>(null);
  const [linkedInError, setLinkedInError] = useState('');
  const [loadingLinkedIn, setLoadingLinkedIn] = useState(false);
  const resumes = [
    {
      id: 1,
      title: 'Software Engineer Resume',
      lastUpdated: '2 days ago',
      atsScore: 87,
      views: 12,
      template: 'Modern',
    },
    {
      id: 2,
      title: 'Frontend Developer Resume',
      lastUpdated: '1 week ago',
      atsScore: 92,
      views: 34,
      template: 'Professional',
    },
  ];

  useEffect(() => {
    // Check if user has LinkedIn connected
    const checkLinkedInConnection = async () => {
      try {
        const { data, error } = await api.getLinkedInProfile();
        if (error) {
          if (error !== 'LinkedIn not connected') {
            setLinkedInError(error);
          }
          return;
        }
        setLinkedInData(data);
      } catch (err) {
        console.error('Error checking LinkedIn connection:', err);
      }
    };

    checkLinkedInConnection();
  }, []);

  const handleLinkedInSuccess = async (data: any) => {
    setLinkedInData(data);
    // You might want to update the user's profile or show a success message
  };

  const handleDisconnectLinkedIn = async () => {
    setLoadingLinkedIn(true);
    try {
      const { error } = await api.disconnectLinkedIn();
      if (error) {
        setLinkedInError(error);
        return;
      }
      setLinkedInData(null);
    } catch (err) {
      setLinkedInError('Failed to disconnect LinkedIn account');
      console.error('LinkedIn disconnect error:', err);
    } finally {
      setLoadingLinkedIn(false);
    }
  };

  return (
    <div className="pt-20 pb-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-64 shrink-0">
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden sticky top-24"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                    <span className="text-primary-600 dark:text-primary-400 font-medium">
                      {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{user?.name || 'User'}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Free Plan</p>
                  </div>
                </div>

                <nav className="space-y-1">
                  <a
                    href="#"
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                  >
                    <FileText className="w-5 h-5" />
                    <span>My Resumes</span>
                  </a>
                  <a
                    href="#"
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Github className="w-5 h-5" />
                    <span>GitHub Integration</span>
                  </a>
                  <button
                    onClick={() => setShowLinkedInModal(true)}
                    className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Linkedin className="w-5 h-5" />
                    <span>LinkedIn Integration</span>
                    {linkedInData && (
                      <CheckCircle className="w-4 h-4 text-success-500 ml-auto" />
                    )}
                  </button>
                  <a
                    href="#"
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Award className="w-5 h-5" />
                    <span>ATS Score History</span>
                  </a>
                  <a
                    href="#"
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Clipboard className="w-5 h-5" />
                    <span>Templates</span>
                  </a>
                </nav>
              </div>

              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700">
                <Button
                  variant="primary"
                  fullWidth
                  className="mb-3"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Resume
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="flex-grow">
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome back, {user?.name || 'User'}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Manage your resumes and optimize them for your dream job
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Resumes</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">2</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Resume Views</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">46</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-secondary-100 dark:bg-secondary-900 flex items-center justify-center">
                    <File className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Average ATS Score</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">89.5</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-success-100 dark:bg-success-900 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-success-600 dark:text-success-400" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Action Cards */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="bg-gradient-to-br from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-800 rounded-xl shadow-md p-6 text-white">
                <h3 className="text-xl font-semibold mb-2">Connect your GitHub</h3>
                <p className="mb-4 text-primary-100">
                  Link your GitHub profile to automatically extract projects and skills for your resume.
                </p>
                <Button variant="light" size="sm">
                  <Github className="w-4 h-4 mr-2" />
                  Connect GitHub
                </Button>
              </div>

              <div className="bg-gradient-to-br from-secondary-500 to-secondary-600 dark:from-secondary-600 dark:to-secondary-800 rounded-xl shadow-md p-6 text-white">
                <h3 className="text-xl font-semibold mb-2">Sync with LinkedIn</h3>
                <p className="mb-4 text-secondary-100">
                  {linkedInData
                    ? 'Your LinkedIn profile is connected. Import your professional experience and skills.'
                    : 'Import your professional experience and skills from your LinkedIn profile.'}
                </p>
                {linkedInError && (
                  <div className="mb-4 p-3 bg-error-500/20 rounded-lg flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    <span className="text-sm">{linkedInError}</span>
                  </div>
                )}
                {linkedInData ? (
                  <div className="flex space-x-3">
                    <Button
                      variant="light"
                      size="sm"
                      onClick={() => setShowLinkedInModal(true)}
                    >
                      <Linkedin className="w-4 h-4 mr-2" />
                      Update Profile
                    </Button>
                    <Button
                      variant="light"
                      size="sm"
                      onClick={handleDisconnectLinkedIn}
                      disabled={loadingLinkedIn}
                    >
                      {loadingLinkedIn ? 'Disconnecting...' : 'Disconnect'}
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="light"
                    size="sm"
                    onClick={() => setShowLinkedInModal(true)}
                  >
                    <Linkedin className="w-4 h-4 mr-2" />
                    Connect LinkedIn
                  </Button>
                )}
              </div>
            </motion.div>

            {/* Resumes */}
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Resumes</h2>
                  <Button variant="ghost" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    New Resume
                  </Button>
                </div>
              </div>

              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {resumes.map((resume) => (
                  <div key={resume.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{resume.title}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {resume.template} · Updated {resume.lastUpdated}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="flex items-center space-x-1">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">ATS Score:</span>
                            <span className={`text-sm font-bold ${
                              resume.atsScore >= 90 ? 'text-success-600 dark:text-success-400' : 
                              resume.atsScore >= 80 ? 'text-warning-600 dark:text-warning-400' : 
                              'text-error-600 dark:text-error-400'
                            }`}>{resume.atsScore}</span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {resume.views} views
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <LinkedInAuthModal
        isOpen={showLinkedInModal}
        onClose={() => setShowLinkedInModal(false)}
        onSuccess={handleLinkedInSuccess}
      />
    </div>
  );
};

export default DashboardPage;