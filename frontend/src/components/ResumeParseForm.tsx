import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Button from './ui/Button';

interface ParsedResumeData {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  summary?: string;
  experience: Array<{
    company: string;
    position: string;
    duration: string;
    description?: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    graduationYear: string;
    startYear?: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
    url?: string;
  }>;
  achievements: Array<{
    title: string;
    type: 'achievement' | 'competition' | 'hackathon';
    date: string;
    description: string;
    position?: string;
    organization?: string;
    url?: string;
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    duration?: string;
    url?: string;
  }>;
  skills: string[];
}

interface ResumeParseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: ParsedResumeData) => void;
  onReject: () => void;
  parsedData: ParsedResumeData | null;
  isParsing: boolean;
  parseError?: string;
}

const ResumeParseForm = ({
  isOpen,
  onClose,
  onConfirm,
  onReject,
  parsedData,
  isParsing,
  parseError,
}: ResumeParseFormProps) => {
  const [formData, setFormData] = useState<ParsedResumeData | null>(parsedData);

  useEffect(() => {
    setFormData(parsedData);
  }, [parsedData]);

  if (!isOpen || !formData) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Review Parsed Resume
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ×
            </button>
          </div>

          {isParsing ? (
            <div className="py-12 text-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary-600 dark:text-primary-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Parsing your resume...
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Please wait while we analyze your resume using AI
              </p>
              <div className="w-full max-w-md mx-auto mt-4 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <motion.div
                  className="bg-primary-600 dark:bg-primary-400 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                />
              </div>
            </div>
          ) : parseError ? (
            <div className="py-12 text-center">
              <AlertCircle className="w-12 h-12 text-error-600 dark:text-error-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Failed to Parse Resume
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {parseError}
              </p>
              <Button
                variant="outline"
                onClick={onReject}
                className="flex items-center mx-auto"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  {formData.phone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  )}
                  {formData.location && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Summary */}
              {formData.summary && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Professional Summary
                  </label>
                  <textarea
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              )}

              {/* Experience */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Work Experience
                </h3>
                {formData.experience.map((exp, index) => (
                  <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Company
                        </label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => {
                            const newExp = [...formData.experience];
                            newExp[index] = { ...exp, company: e.target.value };
                            setFormData({ ...formData, experience: newExp });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Position
                        </label>
                        <input
                          type="text"
                          value={exp.position}
                          onChange={(e) => {
                            const newExp = [...formData.experience];
                            newExp[index] = { ...exp, position: e.target.value };
                            setFormData({ ...formData, experience: newExp });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Education */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Education
                </h3>
                {formData.education.map((edu, index) => (
                  <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Institution
                        </label>
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) => {
                            const newEducation = [...formData.education];
                            newEducation[index] = { ...edu, institution: e.target.value };
                            setFormData({ ...formData, education: newEducation });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Degree
                          </label>
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => {
                              const newEducation = [...formData.education];
                              newEducation[index] = { ...edu, degree: e.target.value };
                              setFormData({ ...formData, education: newEducation });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Field of Study
                          </label>
                          <input
                            type="text"
                            value={edu.field}
                            onChange={(e) => {
                              const newEducation = [...formData.education];
                              newEducation[index] = { ...edu, field: e.target.value };
                              setFormData({ ...formData, education: newEducation });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Start Year (Optional)
                          </label>
                          <input
                            type="text"
                            value={edu.startYear || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              // Only allow 4-digit years
                              if (value === '' || /^\d{4}$/.test(value)) {
                                const newEducation = [...formData.education];
                                newEducation[index] = { 
                                  ...edu, 
                                  startYear: value || undefined 
                                };
                                setFormData({ ...formData, education: newEducation });
                              }
                            }}
                            placeholder="e.g., 2021"
                            pattern="\d{4}"
                            maxLength={4}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Graduation Year
                          </label>
                          <input
                            type="text"
                            value={edu.graduationYear}
                            onChange={(e) => {
                              const value = e.target.value;
                              // Only allow 4-digit years
                              if (/^\d{4}$/.test(value)) {
                                const newEducation = [...formData.education];
                                newEducation[index] = { ...edu, graduationYear: value };
                                setFormData({ ...formData, education: newEducation });
                              }
                            }}
                            placeholder="e.g., 2025"
                            pattern="\d{4}"
                            maxLength={4}
                            required
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const newEducation = [...formData.education, {
                      institution: '',
                      degree: '',
                      field: '',
                      graduationYear: '',
                      startYear: undefined
                    }];
                    setFormData({ ...formData, education: newEducation });
                  }}
                  className="w-full px-4 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  + Add Education
                </button>
              </div>

              {/* Certifications */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Certifications
                </h3>
                {formData.certifications.map((cert, index) => (
                  <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Certification Name
                        </label>
                        <input
                          type="text"
                          value={cert.name}
                          onChange={(e) => {
                            const newCerts = [...formData.certifications];
                            newCerts[index] = { ...cert, name: e.target.value };
                            setFormData({ ...formData, certifications: newCerts });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Issuing Organization
                        </label>
                        <input
                          type="text"
                          value={cert.issuer}
                          onChange={(e) => {
                            const newCerts = [...formData.certifications];
                            newCerts[index] = { ...cert, issuer: e.target.value };
                            setFormData({ ...formData, certifications: newCerts });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Date Earned
                        </label>
                        <input
                          type="text"
                          value={cert.date}
                          onChange={(e) => {
                            const newCerts = [...formData.certifications];
                            newCerts[index] = { ...cert, date: e.target.value };
                            setFormData({ ...formData, certifications: newCerts });
                          }}
                          placeholder="e.g., January 2023"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Certificate URL (Optional)
                        </label>
                        <input
                          type="url"
                          value={cert.url || ''}
                          onChange={(e) => {
                            const newCerts = [...formData.certifications];
                            newCerts[index] = { ...cert, url: e.target.value };
                            setFormData({ ...formData, certifications: newCerts });
                          }}
                          placeholder="e.g., https://certificate-url.com"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const newCerts = [...formData.certifications, {
                      name: '',
                      issuer: '',
                      date: '',
                      url: ''
                    }];
                    setFormData({ ...formData, certifications: newCerts });
                  }}
                  className="w-full px-4 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  + Add Certification
                </button>
              </div>

              {/* Achievements */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Achievements & Competitions
                </h3>
                {formData.achievements.map((achievement, index) => (
                  <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Title
                          </label>
                          <input
                            type="text"
                            value={achievement.title}
                            onChange={(e) => {
                              const newAchievements = [...formData.achievements];
                              newAchievements[index] = { ...achievement, title: e.target.value };
                              setFormData({ ...formData, achievements: newAchievements });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Type
                          </label>
                          <select
                            value={achievement.type}
                            onChange={(e) => {
                              const newAchievements = [...formData.achievements];
                              newAchievements[index] = { 
                                ...achievement, 
                                type: e.target.value as 'achievement' | 'competition' | 'hackathon' 
                              };
                              setFormData({ ...formData, achievements: newAchievements });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          >
                            <option value="achievement">Achievement</option>
                            <option value="competition">Competition</option>
                            <option value="hackathon">Hackathon</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Date
                          </label>
                          <input
                            type="text"
                            value={achievement.date}
                            onChange={(e) => {
                              const newAchievements = [...formData.achievements];
                              newAchievements[index] = { ...achievement, date: e.target.value };
                              setFormData({ ...formData, achievements: newAchievements });
                            }}
                            placeholder="e.g., January 2023"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Position/Rank (Optional)
                          </label>
                          <input
                            type="text"
                            value={achievement.position || ''}
                            onChange={(e) => {
                              const newAchievements = [...formData.achievements];
                              newAchievements[index] = { ...achievement, position: e.target.value };
                              setFormData({ ...formData, achievements: newAchievements });
                            }}
                            placeholder="e.g., 1st Place, Runner Up"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Organization (Optional)
                        </label>
                        <input
                          type="text"
                          value={achievement.organization || ''}
                          onChange={(e) => {
                            const newAchievements = [...formData.achievements];
                            newAchievements[index] = { ...achievement, organization: e.target.value };
                            setFormData({ ...formData, achievements: newAchievements });
                          }}
                          placeholder="e.g., Google, Microsoft, University Name"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Description
                        </label>
                        <textarea
                          value={achievement.description}
                          onChange={(e) => {
                            const newAchievements = [...formData.achievements];
                            newAchievements[index] = { ...achievement, description: e.target.value };
                            setFormData({ ...formData, achievements: newAchievements });
                          }}
                          rows={3}
                          placeholder="Describe the achievement, competition, or hackathon"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          URL (Optional)
                        </label>
                        <input
                          type="url"
                          value={achievement.url || ''}
                          onChange={(e) => {
                            const newAchievements = [...formData.achievements];
                            newAchievements[index] = { ...achievement, url: e.target.value };
                            setFormData({ ...formData, achievements: newAchievements });
                          }}
                          placeholder="e.g., https://competition-website.com/results"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const newAchievements = [...formData.achievements, {
                      title: '',
                      type: 'achievement' as const,
                      date: '',
                      description: '',
                      position: '',
                      organization: '',
                      url: ''
                    }];
                    setFormData({ ...formData, achievements: newAchievements });
                  }}
                  className="w-full px-4 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  + Add Achievement
                </button>
              </div>

              {/* Projects */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Projects
                </h3>
                {formData.projects.map((project, index) => (
                  <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Project Name
                        </label>
                        <input
                          type="text"
                          value={project.name}
                          onChange={(e) => {
                            const newProjects = [...formData.projects];
                            newProjects[index] = { ...project, name: e.target.value };
                            setFormData({ ...formData, projects: newProjects });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Description
                        </label>
                        <textarea
                          value={project.description}
                          onChange={(e) => {
                            const newProjects = [...formData.projects];
                            newProjects[index] = { ...project, description: e.target.value };
                            setFormData({ ...formData, projects: newProjects });
                          }}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Duration
                          </label>
                          <input
                            type="text"
                            value={project.duration || ''}
                            onChange={(e) => {
                              const newProjects = [...formData.projects];
                              newProjects[index] = { ...project, duration: e.target.value };
                              setFormData({ ...formData, projects: newProjects });
                            }}
                            placeholder="e.g., 2022-2023"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Project URL
                          </label>
                          <input
                            type="url"
                            value={project.url || ''}
                            onChange={(e) => {
                              const newProjects = [...formData.projects];
                              newProjects[index] = { ...project, url: e.target.value };
                              setFormData({ ...formData, projects: newProjects });
                            }}
                            placeholder="e.g., https://github.com/username/project"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Technologies
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {project.technologies.map((tech, techIndex) => (
                            <div
                              key={techIndex}
                              className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm flex items-center"
                            >
                              <input
                                type="text"
                                value={tech}
                                onChange={(e) => {
                                  const newProjects = [...formData.projects];
                                  const newTechs = [...project.technologies];
                                  newTechs[techIndex] = e.target.value;
                                  newProjects[index] = { ...project, technologies: newTechs };
                                  setFormData({ ...formData, projects: newProjects });
                                }}
                                className="bg-transparent border-none focus:ring-0 p-0 w-24"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newProjects = [...formData.projects];
                                  const newTechs = project.technologies.filter((_, i) => i !== techIndex);
                                  newProjects[index] = { ...project, technologies: newTechs };
                                  setFormData({ ...formData, projects: newProjects });
                                }}
                                className="ml-2 text-primary-500 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              const newProjects = [...formData.projects];
                              const newTechs = [...project.technologies, ''];
                              newProjects[index] = { ...project, technologies: newTechs };
                              setFormData({ ...formData, projects: newProjects });
                            }}
                            className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600"
                          >
                            + Add Technology
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const newProjects = [...formData.projects, {
                      name: '',
                      description: '',
                      technologies: [],
                      duration: '',
                      url: ''
                    }];
                    setFormData({ ...formData, projects: newProjects });
                  }}
                  className="w-full px-4 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  + Add Project
                </button>
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Skills
                </label>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill, index) => (
                    <div
                      key={index}
                      className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm"
                    >
                      {skill}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  onClick={onReject}
                  className="flex items-center"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Incorrect Details
                </Button>
                <Button
                  variant="primary"
                  onClick={() => onConfirm(formData)}
                  className="flex items-center"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Details are Correct
                </Button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ResumeParseForm; 