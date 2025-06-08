import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Upload, Clipboard, Plus, Github, Linkedin, CheckCircle, File, Award, AlertCircle, Loader2, Check, LogOut } from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import ResumeParseForm from '../components/ResumeParseForm';
import GitHubConnectModal from '../components/GitHubConnectModal';
import LinkedInConnectModal from '../components/LinkedInConnectModal';
import TemplateSelectionModal from '../components/TemplateSelectionModal';
import { LaTeXTemplate } from '../templates/latex/templates';
import { api } from '../services/api';
import { parseResumeWithGemini, ParsedResumeData } from '../services/gemini';
import { normalizeMongoData } from '../utils/resumeDataTransformer';

// Add these interfaces at the top of the file, after imports
interface GitHubProfile {
  username: string;
  url: string;
  connectedAt: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  githubProfile?: GitHubProfile;
  githubConnected: boolean;
  linkedInProfile?: string;
  linkedInConnected: boolean;
}

interface ProfileResponse {
  data: {
    user: UserProfile;
  };
}

const DashboardPage = () => {
  const { user } = useAuth();
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState('');
  const [showParseForm, setShowParseForm] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedResumeData | null>(null);
  const [parseError, setParseError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showGitHubModal, setShowGitHubModal] = useState(false);
  const [showLinkedInModal, setShowLinkedInModal] = useState(false);
  const [loadingGitHub, setLoadingGitHub] = useState(false);
  const [loadingLinkedIn, setLoadingLinkedIn] = useState(false);
  const [githubConnected, setGithubConnected] = useState(false);
  const [linkedInError, setLinkedInError] = useState<string | null>(null);
  const [linkedInConnected, setLinkedInConnected] = useState(false);
  const [isLinkedInModalOpen, setIsLinkedInModalOpen] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
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

  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Please upload a PDF or Word document');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size must be less than 5MB');
      return;
    }

    setUploadingResume(true);
    setUploadError('');
    setUploadSuccess(false);
    setParseError('');
    setParsedData(null);

    try {
      // First, upload the file to the server
      const { error } = await api.uploadResume(file);
      if (error) {
        setUploadError(error);
        return;
      }

      // Show success message for upload
      setUploadSuccessMessage(`Resume "${file.name}" uploaded successfully!`);
      setUploadSuccess(true);

      // Start parsing the resume
      setIsParsing(true);
      setShowParseForm(true);

      try {
        // Parse the resume using Gemini API
        const parsedResumeData = await parseResumeWithGemini(file);
        setParsedData(parsedResumeData);
        setParseError('');
      } catch (parseErr) {
        console.error('Resume parsing error:', parseErr);
        setParseError(parseErr instanceof Error ? parseErr.message : 'Failed to parse resume. Please try again.');
        setParsedData(null);
      } finally {
        setIsParsing(false);
      }

      // Hide success message after 5 seconds
      setTimeout(() => {
        setUploadSuccess(false);
        setUploadSuccessMessage('');
      }, 5000);

    } catch (err) {
      setUploadError('Failed to upload resume. Please try again.');
      setShowParseForm(false);
    } finally {
      setUploadingResume(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleParseConfirm = async (data: ParsedResumeData) => {
    try {
      const { error } = await api.saveParsedResume(data);
      if (error) {
        throw new Error(error);
      }
      setShowParseForm(false);
      setParsedData(null);
      // Show success message
      setUploadSuccessMessage('Resume details saved successfully!');
      setUploadSuccess(true);
      // Hide success message after 5 seconds
      setTimeout(() => {
        setUploadSuccess(false);
        setUploadSuccessMessage('');
      }, 5000);
    } catch (error) {
      console.error('Error saving parsed data:', error);
      setParseError('Failed to save resume details. Please try again.');
    }
  };

  const handleGitHubConnect = () => {
    setShowGitHubModal(true);
  };

  const handleLinkedInConnect = async (profileUrl: string) => {
    try {
      setLoadingLinkedIn(true);
      setLinkedInError(null);

      const { data } = await api.parseLinkedInProfile(profileUrl);
      
      // Update connection state
      setLinkedInConnected(true);
      
      // Show success message
      setUploadSuccessMessage('LinkedIn profile connected successfully!');
      setUploadSuccess(true);
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setUploadSuccess(false);
        setUploadSuccessMessage('');
      }, 5000);

      // Close the modal
      setIsLinkedInModalOpen(false);

    } catch (error) {
      console.error('Error connecting LinkedIn:', error);
      setLinkedInError(error instanceof Error ? error.message : 'Failed to connect LinkedIn profile');
    } finally {
      setLoadingLinkedIn(false);
    }
  };

  const checkGitHubStatus = async () => {
    try {
      const response = await api.getProfile(localStorage.getItem('token') || '') as ProfileResponse;
      // Check both githubConnected flag and githubProfile existence
      const isConnected = Boolean(response.data?.user?.githubConnected && 
                                response.data?.user?.githubProfile?.url);
      setGithubConnected(isConnected);
    } catch (error) {
      console.error('Error checking GitHub status:', error);
      setGithubConnected(false);
    }
  };

  const checkLinkedInStatus = async () => {
    try {
      const response = await api.getProfile(localStorage.getItem('token') || '') as ProfileResponse;
      // Check both linkedInConnected flag and linkedInProfile existence
      const isConnected = Boolean(response.data?.user?.linkedInConnected && 
                                response.data?.user?.linkedInProfile);
      setLinkedInConnected(isConnected);
    } catch (error) {
      console.error('Error checking LinkedIn status:', error);
      setLinkedInConnected(false);
    }
  };

  useEffect(() => {
    checkGitHubStatus();
    checkLinkedInStatus();
  }, []);

  const handleGitHubSubmit = async (githubUrl: string) => {
    setLoadingGitHub(true);
    try {
      const response = await api.connectGitHubProfile(githubUrl);
      if (response.data?.success) {
        setGithubConnected(true);
      }
    } catch (error) {
      console.error('Error connecting GitHub:', error);
    } finally {
      setLoadingGitHub(false);
    }
  };

  const handleGitHubDisconnect = async () => {
    setLoadingGitHub(true);
    try {
      // TODO: Add API endpoint for disconnecting GitHub
      const response = await api.disconnectGitHubProfile();
      if (response.data?.success) {
        setGithubConnected(false);
      }
    } catch (error) {
      console.error('Error disconnecting GitHub:', error);
    } finally {
      setLoadingGitHub(false);
    }
  };

  const handleLinkedInDisconnect = async () => {
    setLoadingLinkedIn(true);
    try {
      const response = await api.disconnectLinkedInProfile();
      if (response.data?.success) {
        setLinkedInConnected(false);
        setUploadSuccessMessage('LinkedIn profile disconnected successfully!');
        setUploadSuccess(true);
        setTimeout(() => {
          setUploadSuccess(false);
          setUploadSuccessMessage('');
        }, 5000);
      }
    } catch (error) {
      console.error('Error disconnecting LinkedIn:', error);
      setLinkedInError(error instanceof Error ? error.message : 'Failed to disconnect LinkedIn profile');
    } finally {
      setLoadingLinkedIn(false);
    }
  };

  const handleTemplateSelect = async (template: LaTeXTemplate) => {
    try {
      // Fetch user data from MongoDB
      const response = await api.getProfile(localStorage.getItem('token') || '');
      if (response.error) {
        throw new Error(response.error);
      }
      const userData = response.data?.user;

      if (!userData) {
        throw new Error('Failed to fetch user data');
      }

      // Transform the data using our existing function
      const transformedData = normalizeMongoData(userData);

      // Add template information to the transformed data
      const templateData = {
        ...transformedData,
        template: {
          id: template.id,
          name: template.name,
          filePath: template.filePath
        }
      };

      // Save the template selection and transformed data
      const saveResponse = await api.saveTemplate(templateData);
      if (saveResponse.error) {
        throw new Error(saveResponse.error);
      }

      // Show success message
      setUploadSuccessMessage('Template applied successfully!');
      setUploadSuccess(true);
      setTimeout(() => {
        setUploadSuccess(false);
        setUploadSuccessMessage('');
      }, 5000);

      // Close the template modal
      setShowTemplateModal(false);
    } catch (error) {
      console.error('Error applying template:', error);
      setUploadError('Failed to apply template. Please try again.');
      setTimeout(() => {
        setUploadError('');
      }, 5000);
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
                  <button
                    onClick={handleGitHubConnect}
                    disabled={loadingGitHub}
                    className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingGitHub ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : githubConnected ? (
                      <>
                        <Check className="w-5 h-5 text-success-600 dark:text-success-400" />
                        <span>GitHub Connected</span>
                        <LogOut className="w-4 h-4 ml-auto text-gray-400 hover:text-gray-600" />
                      </>
                    ) : (
                      <>
                    <Github className="w-5 h-5" />
                    <span>GitHub Integration</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => linkedInConnected ? handleLinkedInDisconnect() : setIsLinkedInModalOpen(true)}
                    disabled={loadingLinkedIn}
                    className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingLinkedIn ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : linkedInConnected ? (
                      <>
                        <Check className="w-5 h-5 text-success-600 dark:text-success-400" />
                        <span>LinkedIn Connected</span>
                        <LogOut className="w-4 h-4 ml-auto text-gray-400 hover:text-gray-600" />
                      </>
                    ) : (
                      <>
                        <Linkedin className="w-5 h-5" />
                        <span>LinkedIn Integration</span>
                      </>
                    )}
                  </button>
                  <a
                    href="#"
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Award className="w-5 h-5" />
                    <span>ATS Score History</span>
                  </a>
                  <button
                    onClick={() => setShowTemplateModal(true)}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Clipboard className="w-5 h-5" />
                    <span>Templates</span>
                  </button>
                </nav>
              </div>

              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleResumeUpload}
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                />
                <Button
                  variant="primary"
                  fullWidth
                  className="mb-3"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingResume}
                >
                  {uploadingResume ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Resume
                    </>
                  )}
                </Button>
                <AnimatePresence>
                  {uploadError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mb-3 p-2 bg-error-50 dark:bg-error-900/30 border border-error-200 dark:border-error-800 rounded-lg text-error-600 dark:text-error-400 text-sm"
                    >
                      {uploadError}
                    </motion.div>
                  )}
                  {uploadSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mb-3 p-2 bg-success-50 dark:bg-success-900/30 border border-success-200 dark:border-success-800 rounded-lg text-success-600 dark:text-success-400 text-sm flex items-center"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {uploadSuccessMessage}
                    </motion.div>
                  )}
                </AnimatePresence>
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
                <h3 className="text-xl font-semibold mb-2">
                  {githubConnected ? 'GitHub Connected' : 'Connect your GitHub'}
                </h3>
                <p className="mb-4 text-primary-100">
                  {githubConnected 
                    ? 'Your GitHub profile is connected. Click to disconnect.'
                    : 'Link your GitHub profile to automatically extract projects and skills for your resume.'}
                </p>
                <Button 
                  variant={githubConnected ? "light" : "light"}
                  size="sm"
                  onClick={githubConnected ? handleGitHubDisconnect : handleGitHubConnect}
                  disabled={loadingGitHub}
                  isLoading={loadingGitHub}
                >
                  {githubConnected ? (
                    <>
                      <LogOut className="w-4 h-4 mr-2" />
                      Disconnect GitHub
                    </>
                  ) : (
                    <>
                  <Github className="w-4 h-4 mr-2" />
                  Connect GitHub
                    </>
                  )}
                </Button>
              </div>

              <div className="bg-gradient-to-br from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-800 rounded-xl shadow-md p-6 text-white">
                <h3 className="text-xl font-semibold mb-2">
                  {linkedInConnected ? 'LinkedIn Connected' : 'Connect your LinkedIn'}
                </h3>
                <p className="mb-4 text-primary-100">
                  {linkedInConnected 
                    ? 'Your LinkedIn profile is connected. Click to disconnect.'
                    : 'Link your LinkedIn profile to automatically extract details for your resume.'}
                </p>
                <Button
                  variant="light"
                  size="sm"
                  onClick={() => linkedInConnected ? handleLinkedInDisconnect() : setIsLinkedInModalOpen(true)}
                  disabled={loadingLinkedIn}
                  isLoading={loadingLinkedIn}
                >
                  {linkedInConnected ? (
                    <>
                      <LogOut className="w-4 h-4 mr-2" />
                      Disconnect LinkedIn
                    </>
                  ) : (
                    <>
                      <Linkedin className="w-4 h-4 mr-2" />
                      Connect LinkedIn
                    </>
                  )}
                </Button>
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

      <ResumeParseForm
        isOpen={showParseForm}
        onClose={() => {
          setShowParseForm(false);
          setParseError('');
          setParsedData(null);
        }}
        onConfirm={handleParseConfirm}
        onReject={() => {
          setShowParseForm(false);
          setParseError('');
          setParsedData(null);
        }}
        parsedData={parsedData}
        isParsing={isParsing}
        parseError={parseError}
      />

      <AnimatePresence>
        {parseError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-4 right-4 p-4 bg-error-50 dark:bg-error-900/30 border border-error-200 dark:border-error-800 rounded-lg text-error-600 dark:text-error-400 text-sm flex items-center"
          >
            <AlertCircle className="w-4 h-4 mr-2" />
            {parseError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* GitHub Connect Modal */}
      <GitHubConnectModal
        isOpen={showGitHubModal}
        onClose={() => {
          setShowGitHubModal(false);
          // Reset loading state when modal is closed
          setLoadingGitHub(false);
        }}
        onSubmit={async (githubUrl) => {
          setLoadingGitHub(true);
          try {
            const response = await api.connectGitHubProfile(githubUrl);
            if (response.error) {
              throw new Error(response.error);
            }
            // Note: We don't set githubConnected here anymore
            // It will be set by the onSuccess callback
          } catch (error) {
            console.error('Error connecting GitHub:', error);
            throw error;
          } finally {
            setLoadingGitHub(false);
          }
        }}
        onSuccess={() => {
          setGithubConnected(true);
          setShowGitHubModal(false);
        }}
      />

      <LinkedInConnectModal
        isOpen={isLinkedInModalOpen}
        onClose={() => setIsLinkedInModalOpen(false)}
        onSubmit={handleLinkedInConnect}
      />

      <TemplateSelectionModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onSelect={handleTemplateSelect}
      />
    </div>
  );
};

export default DashboardPage;