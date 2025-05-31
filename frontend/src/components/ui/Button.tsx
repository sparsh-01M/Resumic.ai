import React, { forwardRef, ButtonHTMLAttributes, ElementType } from 'react';
import { motion } from 'framer-motion';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'light' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  as?: ElementType;
  href?: string;
  fullWidth?: boolean;
  isLoading?: boolean;
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      as: Component = 'button',
      children,
      className = '',
      fullWidth = false,
      isLoading = false,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };
    
    const variantClasses = {
      primary: 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-500',
      secondary: 'bg-secondary-600 hover:bg-secondary-700 text-white focus:ring-secondary-500 dark:bg-secondary-600 dark:hover:bg-secondary-700 dark:focus:ring-secondary-500',
      outline: 'border border-gray-300 bg-transparent hover:bg-gray-50 text-gray-700 focus:ring-primary-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:focus:ring-primary-500',
      ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-500 dark:text-gray-300 dark:hover:bg-gray-800 dark:focus:ring-gray-500',
      light: 'bg-white hover:bg-gray-100 text-gray-900 focus:ring-primary-500 border border-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white dark:border-gray-600 dark:focus:ring-primary-500',
      danger: 'bg-error-600 hover:bg-error-700 text-white focus:ring-error-500 dark:bg-error-600 dark:hover:bg-error-700 dark:focus:ring-error-500',
    };
    
    const disabledClasses = 'opacity-60 cursor-not-allowed';
    const widthClasses = fullWidth ? 'w-full' : '';

    const classes = [
      baseClasses,
      sizeClasses[size],
      variantClasses[variant],
      disabled || isLoading ? disabledClasses : '',
      widthClasses,
      className,
    ].join(' ');

    const content = (
      <>
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {children}
      </>
    );

    // Use motion.button for animation capabilities
    if (Component === 'button') {
      return (
        <motion.button
          ref={ref}
          className={classes}
          disabled={disabled || isLoading}
          whileTap={{ scale: 0.98 }}
          {...props}
        >
          {content}
        </motion.button>
      );
    }

    // For other components like Link
    return (
      <Component className={classes} {...props}>
        {content}
      </Component>
    );
  }
);

Button.displayName = 'Button';
export default Button;