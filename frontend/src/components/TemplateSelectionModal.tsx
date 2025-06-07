import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { LaTeXTemplate, latexTemplates } from '../templates/latex/templates';
import Button from './ui/Button';

interface TemplateSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: LaTeXTemplate) => void;
}

const TemplateSelectionModal = ({ isOpen, onClose, onSelect }: TemplateSelectionModalProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<LaTeXTemplate | null>(null);

  const handleSelect = (template: LaTeXTemplate) => {
    setSelectedTemplate(template);
  };

  const handleConfirm = () => {
    if (selectedTemplate) {
      onSelect(selectedTemplate);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Choose a Template
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {latexTemplates.map((template) => (
                  <motion.div
                    key={template.id}
                    whileHover={{ scale: 1.02 }}
                    className={`relative rounded-lg border-2 cursor-pointer transition-all ${
                      selectedTemplate?.id === template.id
                        ? 'border-primary-500 dark:border-primary-400'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                    onClick={() => handleSelect(template)}
                  >
                    <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-700 rounded-t-lg overflow-hidden">
                      <img
                        src={template.previewImage}
                        alt={template.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {template.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                        {template.description}
                      </p>
                      <div className="space-y-2">
                        {template.features.map((feature, index) => (
                          <div key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                            <Check className="w-4 h-4 mr-2 text-primary-500 dark:text-primary-400" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                    {selectedTemplate?.id === template.id && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-primary-500 dark:bg-primary-400 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <div className="flex justify-end space-x-4">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleConfirm}
                  disabled={!selectedTemplate}
                >
                  Use Template
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TemplateSelectionModal; 