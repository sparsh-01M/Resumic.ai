import { motion } from 'framer-motion';

const HeroImage = () => {
  return (
    <div className="relative">
      <motion.div
        className="w-full h-full rounded-2xl overflow-hidden shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <img
          src="https://images.pexels.com/photos/7108/notebook-computer-chill-relax.jpg?auto=compress&cs=tinysrgb&w=1200"
          alt="Resume creation process"
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* Floating Elements */}
      <motion.div
        className="absolute -top-5 -right-5 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex items-center space-x-3"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      >
        <div className="w-10 h-10 bg-success-100 dark:bg-success-900 rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success-600 dark:text-success-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">ATS Score</p>
          <p className="text-xl font-bold text-success-600 dark:text-success-400">92/100</p>
        </div>
      </motion.div>

      <motion.div
        className="absolute top-1/3 -left-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.7, duration: 0.3 }}
      >
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-600 dark:text-primary-400" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">Resume Views: <span className="text-primary-600 dark:text-primary-400">32</span></p>
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-10 -right-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.3 }}
      >
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-accent-100 dark:bg-accent-900 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-accent-600 dark:text-accent-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">Interviews: <span className="text-accent-600 dark:text-accent-400">5</span></p>
        </div>
      </motion.div>
    </div>
  );
};

export default HeroImage;