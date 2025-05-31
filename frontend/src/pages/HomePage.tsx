import { motion } from 'framer-motion';
import { Github, Linkedin, FileText, Upload, CheckCircle, Award } from 'lucide-react';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import HeroImage from '../components/HeroImage';
import FeatureCard from '../components/FeatureCard';
import TestimonialCard from '../components/TestimonialCard';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const containerAnimation = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemAnimation = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div
              className="lg:w-1/2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Create ATS-Optimized Resumes with{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-accent-500 dark:from-primary-400 dark:to-accent-400">
                  AI
                </span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                Create professional, ATS-optimized resumes in minutes using AI. Get past applicant tracking systems and land more interviews.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button as={Link} to={isAuthenticated ? "/dashboard" : "/register"} variant="primary" size="lg">
                  {isAuthenticated ? "Go to Dashboard" : "Get Started for Free"}
                </Button>
                <Button as={Link} to="/about" variant="outline" size="lg">
                  Learn More
                </Button>
              </div>
              <div className="mt-8 flex items-center">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`w-8 h-8 rounded-full border-2 border-white dark:border-gray-900 bg-gray-${i * 100} dark:bg-gray-${900 - i * 100}`}></div>
                  ))}
                </div>
                <p className="ml-4 text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-semibold text-gray-900 dark:text-white">4,000+</span> professionals improved their resumes today
                </p>
              </div>
            </motion.div>

            <motion.div
              className="lg:w-1/2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <HeroImage />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Logos Section */}
      <section className="py-12 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 md:px-6">
          <p className="text-center text-sm font-medium text-gray-600 dark:text-gray-400 mb-8">
            TRUSTED BY PROFESSIONALS FROM
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8">
            {['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple'].map((company) => (
              <motion.div
                key={company}
                className="text-xl md:text-2xl font-bold text-gray-400 dark:text-gray-600"
                whileHover={{ scale: 1.05, color: '#3B82F6' }}
                transition={{ duration: 0.2 }}
              >
                {company}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <motion.h2
              className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              How Resumic.ai Works
            </motion.h2>
            <motion.p
              className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Three simple steps to create an ATS-optimized resume that helps you land interviews
            </motion.p>
          </div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={containerAnimation}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={itemAnimation} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 relative">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mb-4">
                <Icon icon={Upload} className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Upload Your Resume</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Upload your existing resume or connect your LinkedIn profile to get started quickly.
              </p>
              <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 hidden md:block">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 dark:text-gray-700" />
                </svg>
              </div>
            </motion.div>

            <motion.div variants={itemAnimation} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 relative">
              <div className="w-12 h-12 bg-secondary-100 dark:bg-secondary-900 rounded-full flex items-center justify-center mb-4">
                <Github className="w-6 h-6 text-secondary-600 dark:text-secondary-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Connect GitHub</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Link your GitHub profile to automatically extract projects, skills, and contributions.
              </p>
              <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 hidden md:block">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 dark:text-gray-700" />
                </svg>
              </div>
            </motion.div>

            <motion.div variants={itemAnimation} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <div className="w-12 h-12 bg-accent-100 dark:bg-accent-900 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-accent-600 dark:text-accent-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Download ATS-Optimized Resume</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Review your enhanced resume with 80+ ATS score and download it in multiple formats.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <motion.h2
              className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Key Features
            </motion.h2>
            <motion.p
              className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Everything you need to create the perfect resume for your dream job
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<FileText className="w-6 h-6" />}
              title="Resume Parsing"
              description="Upload your existing resume and our AI will analyze and enhance it automatically."
              color="primary"
            />
            <FeatureCard
              icon={<Github className="w-6 h-6" />}
              title="GitHub Integration"
              description="Connect your GitHub to extract projects, contributions, and technical skills."
              color="secondary"
            />
            <FeatureCard
              icon={<Linkedin className="w-6 h-6" />}
              title="LinkedIn Sync"
              description="Sync with LinkedIn to include your work experience, skills, and certifications."
              color="accent"
            />
            <FeatureCard
              icon={<Award className="w-6 h-6" />}
              title="ATS Optimization"
              description="Get an 80+ ATS score with AI-powered suggestions to pass any applicant tracking system."
              color="success"
            />
            <FeatureCard
              icon={<CheckCircle className="w-6 h-6" />}
              title="Multiple Templates"
              description="Choose from professionally designed templates tailored for different industries."
              color="warning"
            />
            <FeatureCard
              icon={<CheckCircle className="w-6 h-6" />}
              title="Job Matching"
              description="Target specific job roles and get tailored suggestions to match requirements."
              color="error"
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <motion.h2
              className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              What Our Users Say
            </motion.h2>
            <motion.p
              className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Success stories from professionals who landed their dream jobs
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard
              quote="Resumic.ai transformed my resume in minutes. I went from zero callbacks to five interview requests in a week!"
              name="Sarah Johnson"
              title="Software Engineer"
              avatar="https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150"
              rating={5}
            />
            <TestimonialCard
              quote="The GitHub integration is brilliant. It pulled all my relevant projects and formatted them perfectly for my resume."
              name="David Chen"
              title="Full Stack Developer"
              avatar="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150"
              rating={5}
            />
            <TestimonialCard
              quote="I landed a job at a Fortune 500 company after using Resumic.ai. The ATS optimization feature was a game-changer."
              name="Emily Rodriguez"
              title="UX Designer"
              avatar="https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=150"
              rating={5}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary-600 dark:bg-primary-900">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h2
              className="text-3xl md:text-4xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Ready to Create Your Perfect Resume?
            </motion.h2>
            <motion.p
              className="text-xl text-primary-100 mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Join thousands of professionals who've landed their dream jobs with Resumic.ai
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Button as={Link} to={isAuthenticated ? "/dashboard" : "/register"} variant="light" size="lg">
                {isAuthenticated ? "Go to Dashboard" : "Get Started for Free"}
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;