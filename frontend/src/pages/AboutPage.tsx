import { motion } from 'framer-motion';
import { Award, Users, Rocket, CheckCircle } from 'lucide-react';

const AboutPage = () => {
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
    <div className="pt-20">
      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1
              className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              About Resumic<span className="text-primary-600 dark:text-primary-400">.ai</span>
            </motion.h1>
            <motion.p
              className="text-xl text-gray-600 dark:text-gray-300 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              We're on a mission to help job seekers create exceptional resumes that get past ATS systems and land interviews.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <motion.div
              className="md:w-1/2"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Our Story</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Resumic.ai was founded in 2025 by a tech professional Sparsh Singhal, who experienced the frustration of the job application process firsthand. After submitting countless resumes with little response, we discovered that many qualified candidates never make it past the initial ATS screening.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Leveraging our expertise in AI and machine learning, we built a tool that not only helps job seekers optimize their resumes for ATS systems but also showcases their true potential through automatic extraction of skills and achievements from platforms like GitHub and LinkedIn.
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                Today, Resumic.ai has helped thousands of professionals land interviews at top companies worldwide, and we're just getting started.
              </p>
            </motion.div>
            <motion.div
              className="md:w-1/2"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <img
                src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="The Resumic.ai team collaborating"
                className="rounded-xl shadow-lg w-full h-auto"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h2
              className="text-3xl font-bold text-gray-900 dark:text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Our Mission
            </motion.h2>
            <motion.p
              className="text-xl text-gray-600 dark:text-gray-300 mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              We believe everyone deserves a fair chance to showcase their skills and experience to potential employers.
            </motion.p>
          </div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12"
            variants={containerAnimation}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={itemAnimation} className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Overcome ATS Barriers</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Help job seekers navigate the complex world of Applicant Tracking Systems to ensure their qualifications are properly recognized.
              </p>
            </motion.div>

            <motion.div variants={itemAnimation} className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-secondary-100 dark:bg-secondary-900 rounded-full flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-secondary-600 dark:text-secondary-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Democratize Opportunities</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Level the playing field by giving everyone access to advanced resume optimization technology regardless of their background.
              </p>
            </motion.div>

            <motion.div variants={itemAnimation} className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-accent-100 dark:bg-accent-900 rounded-full flex items-center justify-center mb-4">
                <Rocket className="w-6 h-6 text-accent-600 dark:text-accent-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Showcase True Potential</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Help professionals highlight their actual skills and achievements rather than just keywords, creating more meaningful matches.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <motion.h2
              className="text-3xl font-bold text-gray-900 dark:text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Meet Our Team
            </motion.h2>
            <motion.p
              className="text-xl text-gray-600 dark:text-gray-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              A passionate group of professionals dedicated to transforming the job search experience
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: 'Sparsh Singhal',
                title: 'Founder & CEO',
                bio: 'Former tech recruiter with a passion for helping candidates showcase their true potential.',
                avatar: 'https://res.cloudinary.com/do5w3vlu0/image/upload/v1743621307/me_wftz8b.jpg',
              },
              {
                name: 'Sparsh Singhal',
                title: 'CTO',
                bio: 'AI specialist with extensive experience in natural language processing and machine learning.',
                avatar: 'https://res.cloudinary.com/do5w3vlu0/image/upload/v1743621307/me_wftz8b.jpg',
              },
              {
                name: 'Sparsh Singhal',
                title: 'Head of Product',
                bio: 'UX designer and product strategist focused on creating intuitive, user-friendly experiences.',
                avatar: 'https://res.cloudinary.com/do5w3vlu0/image/upload/v1743621307/me_wftz8b.jpg',
              },
            ].map((member, index) => (
              <motion.div
                key={index}
                className="bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden shadow-md"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{member.name}</h3>
                  <p className="text-primary-600 dark:text-primary-400 mb-2">{member.title}</p>
                  <p className="text-gray-600 dark:text-gray-400">{member.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <motion.h2
              className="text-3xl font-bold text-gray-900 dark:text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Our Values
            </motion.h2>
            <motion.p
              className="text-xl text-gray-600 dark:text-gray-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              The principles that guide everything we do
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: 'Innovation',
                description: 'We constantly push the boundaries of what\'s possible with AI and resume optimization technology.',
                icon: <Rocket className="w-6 h-6" />,
                color: 'primary',
              },
              {
                title: 'Accessibility',
                description: 'We believe career advancement tools should be available to everyone, regardless of background or resources.',
                icon: <Users className="w-6 h-6" />,
                color: 'secondary',
              },
              {
                title: 'Integrity',
                description: 'We\'re committed to honest business practices and protecting our users\' data and privacy.',
                icon: <CheckCircle className="w-6 h-6" />,
                color: 'accent',
              },
              {
                title: 'Excellence',
                description: 'We strive for the highest quality in everything we do, from our AI algorithms to our user experience.',
                icon: <Award className="w-6 h-6" />,
                color: 'success',
              },
            ].map((value, index) => (
              <motion.div
                key={index}
                className="flex bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className={`w-12 h-12 bg-${value.color}-100 dark:bg-${value.color}-900 rounded-full flex items-center justify-center mr-4 shrink-0`}>
                  <div className={`text-${value.color}-600 dark:text-${value.color}-400`}>{value.icon}</div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{value.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{value.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
