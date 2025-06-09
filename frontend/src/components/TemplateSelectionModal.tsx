import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Code, Copy, CheckCircle } from 'lucide-react';
import { LaTeXTemplate, latexTemplates } from '../templates/latex/templates';
import Button from './ui/Button';

interface TemplateSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: LaTeXTemplate) => void;
  userData?: any;
}

const TemplateSelectionModal = ({ isOpen, onClose, onSelect, userData }: TemplateSelectionModalProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<LaTeXTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [generatedLatex, setGeneratedLatex] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const handleSelect = (template: LaTeXTemplate) => {
    setSelectedTemplate(template);
    if (userData) {
      generateLatexPreview(template, userData);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(generatedLatex);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const generateLatexPreview = async (template: LaTeXTemplate, data: any) => {
    try {
      // Import the template file dynamically
      const templateModule = await import(`@/templates/latex/${template.id}.tex`);
      let latexCode = templateModule.default;

      if (data.transformedResume) {
        const { transformedResume } = data;
        
        // Replace basic info
        latexCode = latexCode
          .replace(/\${name}/g, data.name || '')
          .replace(/\${email}/g, data.email || '')
          .replace(/\${phone}/g, data.phone || '')
          .replace(/\${location}/g, data.location || '')
          .replace(/\${website}/g, data.website || '')
          .replace(/\${linkedin}/g, data.linkedInProfile || transformedResume?.linkedin || '')
          .replace(/\${github}/g, data.githubProfile?.url || transformedResume?.github || '');
        
        // Use LinkedIn and GitHub profile URLs from user data
        const linkedinUrl = data.linkedInProfile?.url || transformedResume.linkedin || '';
        const githubUrl = data.githubProfile?.url || transformedResume.github || '';
        
        latexCode = latexCode.replace(/\${linkedin}/g, linkedinUrl);
        latexCode = latexCode.replace(/\${github}/g, githubUrl);

        // Replace education section
        if (transformedResume.education && transformedResume.education.length > 0) {
          const educationSection = transformedResume.education.map((edu: any) => {
            return [
              '\\begin{twocolentry}{',
              `    ${edu.startDate} – ${edu.endDate}`,
              '}',
              `    \\textbf{${edu.institution}}, ${edu.degree}`,
              '\\end{twocolentry}',
              '',
              '\\vspace{0.10cm}',
              '\\begin{onecolentry}',
              '    \\begin{highlights}',
              edu.gpa ? `    \\item GPA: ${edu.gpa}` : '',
              edu.coursework ? `    \\item \\textbf{Coursework:} ${edu.coursework}` : '',
              '    \\end{highlights}',
              '\\end{onecolentry}'
            ].filter(Boolean).join('\n');
          }).join('\n\n');
          const educationRegex = new RegExp('\\${#each education}[\\s\\S]*?\\${/each}', 'g');
          latexCode = latexCode.replace(educationRegex, educationSection);
        } else {
          const educationRegex = new RegExp('\\${#each education}[\\s\\S]*?\\${/each}', 'g');
          latexCode = latexCode.replace(educationRegex, '');
        }

        // Replace experience section
        if (transformedResume.experience && transformedResume.experience.length > 0) {
          const experienceSection = transformedResume.experience.map((exp: any) => {
            return [
              '\\begin{twocolentry}{',
              `    ${exp.startDate} – ${exp.endDate}`,
              '}',
              `    \\textbf{${exp.title}}, ${exp.company} -- ${exp.location}`,
              '\\end{twocolentry}',
              '',
              '\\vspace{0.10cm}',
              '\\begin{onecolentry}',
              '    \\begin{highlights}',
              ...exp.highlights.map((highlight: string) => `    \\item ${highlight}`),
              '    \\end{highlights}',
              '\\end{onecolentry}'
            ].join('\n');
          }).join('\n\n');
          const experienceRegex = new RegExp('\\${#each experience}[\\s\\S]*?\\${/each}', 'g');
          latexCode = latexCode.replace(experienceRegex, experienceSection);
        } else {
          const experienceRegex = new RegExp('\\${#each experience}[\\s\\S]*?\\${/each}', 'g');
          latexCode = latexCode.replace(experienceRegex, '');
        }

        // Replace projects section
        if (transformedResume.projects && transformedResume.projects.length > 0) {
          const projectsSection = transformedResume.projects.map((project: {
            name: string;
            date?: string;
            description: string[];
            technologies?: string;
          }) => `
\\begin{twocolentry}{
    ${project.date || ''}
}
    \\textbf{${project.name}}
\\end{twocolentry}
\\vspace{0.10cm}
\\begin{onecolentry}
    \\begin{highlights}
    ${project.description.map((desc: string) => `\\item ${desc}`).join('\n    ')}
    ${project.technologies ? `\\item Tools Used: ${project.technologies}` : ''}
    \\end{highlights}
\\end{onecolentry}`).join('\n\n');
          // Remove the entire Projects section including the template structure
          const projectsSectionRegex = new RegExp('\\\\section\\{Projects\\}[\\s\\S]*?\\\\section\\{Technologies\\}', 's');
          latexCode = latexCode.replace(projectsSectionRegex, `\\section{Projects}\n${projectsSection}\n\n\\section{Technologies}`);
        } else {
          // Remove the entire projects section if no projects
          const projectsSectionRegex = new RegExp('\\\\section\\{Projects\\}[\\s\\S]*?\\\\section\\{Technologies\\}', 's');
          latexCode = latexCode.replace(projectsSectionRegex, '\\section{Technologies}');
        }

        // Replace skills section
        if (transformedResume.skills && transformedResume.skills.length > 0) {
          const skillsSection = transformedResume.skills.map((skill: any) => {
            return [
              '\\begin{onecolentry}',
              `    \\textbf{${skill.category}:} ${skill.items}`,
              '\\end{onecolentry}'
            ].join('\n');
          }).join('\n\n');
          const skillsRegex = new RegExp('\\${#each skills}[\\s\\S]*?\\${/each}', 'g');
          latexCode = latexCode.replace(skillsRegex, skillsSection);
        } else {
          const skillsRegex = new RegExp('\\${#each skills}[\\s\\S]*?\\${/each}', 'g');
          latexCode = latexCode.replace(skillsRegex, '');
        }

        // Replace conditional statements
        const ifRegex = new RegExp('\\${#if ([^}]+)}([\\s\\S]*?)\\${/if}', 'g');
        latexCode = latexCode.replace(ifRegex, (match: string, condition: string, content: string) => {
          const [field, value] = condition.split(' ');
          if (value) {
            return content;
          }
          return '';
        });
      }

      setGeneratedLatex(latexCode);
    } catch (error) {
      console.error('Error generating LaTeX preview:', error);
    }
  };

  const handleConfirm = () => {
    if (selectedTemplate) {
      setShowPreview(true);
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
                <div className="flex items-center space-x-4">
                  {selectedTemplate && (
                    <Button
                      variant="outline"
                      onClick={() => setShowPreview(!showPreview)}
                      className="flex items-center space-x-2"
                    >
                      <Code className="w-4 h-4" />
                      <span>{showPreview ? 'Hide Preview' : 'Show Preview'}</span>
                    </Button>
                  )}
                  <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {showPreview ? (
                <div className="relative">
                  <div className="absolute top-2 right-2 z-10">
                    <Button
                      variant="outline"
                      onClick={handleCopyCode}
                      className="flex items-center space-x-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
                    >
                      {copied ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy Code</span>
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                    <pre className="whitespace-pre-wrap text-gray-900 dark:text-gray-100">{generatedLatex}</pre>
                  </div>
                </div>
              ) : (
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
              )}
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
                  Preview Template
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