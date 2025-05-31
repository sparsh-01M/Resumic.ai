import { motion } from 'framer-motion';
import { Star, StarHalf } from 'lucide-react';

type TestimonialCardProps = {
  quote: string;
  name: string;
  title: string;
  avatar: string;
  rating: number;
};

const TestimonialCard = ({ quote, name, title, avatar, rating }: TestimonialCardProps) => {
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star
          key={`star-${i}`}
          className="w-4 h-4 text-warning-500 dark:text-warning-400 fill-warning-500 dark:fill-warning-400"
        />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <StarHalf
          key="half-star"
          className="w-4 h-4 text-warning-500 dark:text-warning-400 fill-warning-500 dark:fill-warning-400"
        />
      );
    }

    const remainingStars = 5 - stars.length;
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <Star
          key={`empty-star-${i}`}
          className="w-4 h-4 text-gray-300 dark:text-gray-700"
        />
      );
    }

    return stars;
  };

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex mb-4">
        {renderStars()}
      </div>
      <p className="text-gray-700 dark:text-gray-300 mb-6 italic">"{quote}"</p>
      <div className="flex items-center">
        <img
          src={avatar}
          alt={name}
          className="w-12 h-12 rounded-full object-cover mr-4"
        />
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white">{name}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default TestimonialCard;