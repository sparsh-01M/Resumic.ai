import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, HelpCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const PricingPage = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const { user } = useAuth();
  
  // Get user's current plan (default to 'free' if not set)
  const currentPlan = user?.subscription?.plan || 'free';
  
  const plans = [
    {
      name: 'Free',
      description: 'Basic features for individuals',
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: [
        'Create up to 3 resumes',
        'Basic ATS optimization',
        'Standard templates',
        'Download as PDF',
        'GitHub integration (basic)',
      ],
      buttonText: currentPlan === 'free' ? 'Current Plan' : 'Get Started',
      buttonVariant: currentPlan === 'free' ? 'secondary' as const : 'outline' as const,
      popular: false,
      planId: 'free',
    },
    {
      name: 'Pro',
      description: 'Perfect for job seekers',
      monthlyPrice: 12,
      yearlyPrice: 108, // $9/month billed annually
      features: [
        'Unlimited resumes',
        'Advanced ATS optimization',
        'All premium templates',
        'LinkedIn integration',
        'Full GitHub project analysis',
        'Resume version history',
        'Multiple export formats',
      ],
      buttonText: currentPlan === 'pro' ? 'Current Plan' : 'Subscribe to Pro',
      buttonVariant: currentPlan === 'pro' ? 'secondary' as const : 'primary' as const,
      popular: true,
      planId: 'pro',
    },
    {
      name: 'Teams',
      description: 'For career coaches & teams',
      monthlyPrice: 29,
      yearlyPrice: 288, // $24/month billed annually
      features: [
        'All Pro features',
        'Team management dashboard',
        'Client resume management',
        'White-label options',
        'Analytics and insights',
        'Priority support',
        'API access',
      ],
      buttonText: currentPlan === 'teams' ? 'Current Plan' : 'Contact Sales',
      buttonVariant: currentPlan === 'teams' ? 'secondary' as const : 'outline' as const,
      popular: false,
      planId: 'teams',
    },
  ];

  const faqs = [
    {
      question: 'How does the GitHub integration work?',
      answer: 'Our platform analyzes your GitHub repositories to identify skills, projects, and technical achievements. It automatically extracts relevant information to create compelling bullet points for your resume that highlight your real-world coding experience.',
    },
    {
      question: 'What is ATS optimization and why is it important?',
      answer: 'Applicant Tracking Systems (ATS) are software used by companies to scan and filter resumes before they reach human recruiters. Our ATS optimization ensures your resume contains the right keywords and formatting to pass these automated systems, increasing your chances of getting an interview.',
    },
    {
      question: 'Can I cancel my subscription anytime?',
      answer: 'Yes, you can cancel your subscription at any time. For monthly plans, you\'ll maintain access until the end of your current billing period. For annual plans, you\'ll have access for the remainder of the year you\'ve paid for.',
    },
    {
      question: 'How many different templates can I use?',
      answer: 'The Free plan offers access to 5 standard templates. The Pro plan includes all 20+ premium templates with customization options. The Teams plan includes all premium templates plus the ability to create custom templates.',
    },
    {
      question: 'Do you offer refunds?',
      answer: 'We offer a 14-day money-back guarantee for all paid plans. If you\'re not satisfied with our service within the first 14 days, contact our support team for a full refund.',
    },
    {
      question: 'Can I switch between templates after creating my resume?',
      answer: 'Yes, you can switch between templates at any time without losing your content. This allows you to experiment with different layouts to find the one that best showcases your experience.',
    },
  ];

  const renderPlanButton = (plan: typeof plans[0]) => {
    if (plan.planId === currentPlan) {
      return (
        <Button
          variant="secondary"
          fullWidth
          disabled
          className="cursor-default"
        >
          Current Plan
        </Button>
      );
    }

    if (plan.planId === 'teams') {
      return (
        <Button
          as={Link}
          to="/contact"
          variant="outline"
          fullWidth
        >
          Contact Sales
        </Button>
      );
    }

    return (
      <Button
        as={Link}
        to={user ? '/dashboard' : '/register'}
        variant={plan.buttonVariant}
        fullWidth
      >
        {plan.buttonText}
      </Button>
    );
  };

  return (
    <div className="pt-20 pb-12">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <motion.h1
            className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Simple, Transparent Pricing
          </motion.h1>
          <motion.p
            className="text-xl text-gray-600 dark:text-gray-300 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Choose the perfect plan to help you create ATS-optimized resumes
          </motion.p>

          {/* Billing Toggle */}
          <div className="flex justify-center mb-12">
            <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg inline-flex">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingCycle === 'yearly'
                    ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Yearly
                <span className="ml-1 text-xs text-primary-600 dark:text-primary-400">Save 20%</span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden ${
                plan.popular ? 'ring-2 ring-primary-500 dark:ring-primary-400' : ''
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              {plan.popular && (
                <div className="bg-primary-500 dark:bg-primary-600 text-white text-center py-1 text-sm font-medium">
                  Most Popular
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    ${billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 ml-2">
                    /{billingCycle === 'monthly' ? 'month' : 'year'}
                  </span>
                </div>
                {renderPlanButton(plan)}
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="w-5 h-5 text-primary-600 dark:text-primary-400 shrink-0 mr-2" />
                      <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        {/* FAQs */}
        <div className="max-w-4xl mx-auto">
          <motion.h2
            className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Frequently Asked Questions
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.05 * index }}
              >
                <h3 className="flex items-center text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  <HelpCircle className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2 shrink-0" />
                  {faq.question}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Still have questions? We're here to help.
            </p>
            <Button as="a" href="/contact" variant="outline">
              Contact Support
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;