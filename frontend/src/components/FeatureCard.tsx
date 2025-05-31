import { ReactNode } from 'react';
import { motion } from 'framer-motion';

type FeatureCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
  color: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';
};

const FeatureCard = ({ icon, title, description, color }: FeatureCardProps) => {
  const colorMap = {
    primary: {
      bgLight: 'bg-primary-50 dark:bg-primary-900/20',
      iconColor: 'text-primary-600 dark:text-primary-400',
      borderColor: 'border-primary-100 dark:border-primary-800',
      hoverBorder: 'group-hover:border-primary-300 dark:group-hover:border-primary-700',
    },
    secondary: {
      bgLight: 'bg-secondary-50 dark:bg-secondary-900/20',
      iconColor: 'text-secondary-600 dark:text-secondary-400',
      borderColor: 'border-secondary-100 dark:border-secondary-800',
      hoverBorder: 'group-hover:border-secondary-300 dark:group-hover:border-secondary-700',
    },
    accent: {
      bgLight: 'bg-accent-50 dark:bg-accent-900/20',
      iconColor: 'text-accent-600 dark:text-accent-400',
      borderColor: 'border-accent-100 dark:border-accent-800',
      hoverBorder: 'group-hover:border-accent-300 dark:group-hover:border-accent-700',
    },
    success: {
      bgLight: 'bg-success-50 dark:bg-success-900/20',
      iconColor: 'text-success-600 dark:text-success-400',
      borderColor: 'border-success-100 dark:border-success-800',
      hoverBorder: 'group-hover:border-success-300 dark:group-hover:border-success-700',
    },
    warning: {
      bgLight: 'bg-warning-50 dark:bg-warning-900/20',
      iconColor: 'text-warning-600 dark:text-warning-400',
      borderColor: 'border-warning-100 dark:border-warning-800',
      hoverBorder: 'group-hover:border-warning-300 dark:group-hover:border-warning-700',
    },
    error: {
      bgLight: 'bg-error-50 dark:bg-error-900/20',
      iconColor: 'text-error-600 dark:text-error-400',
      borderColor: 'border-error-100 dark:border-error-800',
      hoverBorder: 'group-hover:border-error-300 dark:group-hover:border-error-700',
    },
  };

  const { bgLight, iconColor, borderColor, hoverBorder } = colorMap[color];

  return (
    <motion.div
      className={`group p-6 rounded-xl bg-white dark:bg-gray-800 border ${borderColor} ${hoverBorder} shadow-sm hover:shadow-md transition-all duration-300`}
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className={`w-12 h-12 ${bgLight} rounded-lg flex items-center justify-center mb-4`}>
        <div className={iconColor}>{icon}</div>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </motion.div>
  );
};

export default FeatureCard;