import React, { useState, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faPaperPlane,
  faSpinner,
  faUpload,
  faTrash,
  faExclamationCircle,
  faCheckCircle,
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext.jsx';

function JobApplicationForm({ isOpen, onClose, jobTitle, jobId }) {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    cv: '',
    motivationLetter: '',
    contact: '',
    note: '',
    files: [],
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [charCounts, setCharCounts] = useState({
    cv: 0,
    motivationLetter: 0,
    note: 0,
  });
  const fileInputRef = useRef(null);

  const maxChars = {
    cv: 2000,
    motivationLetter: 2000,
    note: 500,
  };
  const maxFileSize = 5 * 1024 * 1024; // 5MB
  const allowedFileTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ];

  const validateField = (name, value) => {
    if (['cv', 'motivationLetter', 'contact'].includes(name) && !value.trim()) {
      return 'This field is required.';
    }
    if (charCounts[name] > maxChars[name]) {
      return `Maximum ${maxChars[name]} characters allowed.`;
    }
    if (name === 'contact') {
      const phoneRegex = /^\+?[\d\s-]{10,}$/;
      if (!phoneRegex.test(value)) {
        return 'Please enter a valid phone number (minimum 10 digits, may include +, spaces, or dashes).';
      }
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setCharCounts((prev) => ({ ...prev, [name]: value.length }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files).filter((file) => {
      if (file.size > maxFileSize) {
        setErrors((prev) => ({ ...prev, files: `File "${file.name}" exceeds 5MB.` }));
        return false;
      }
      if (!allowedFileTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          files: `File "${file.name}" is not a valid type (PDF, DOC, DOCX, TXT).`,
        }));
        return false;
      }
      return true;
    });
    setFormData((prev) => ({ ...prev, files: [...prev.files, ...newFiles] }));
    setErrors((prev) => ({ ...prev, files: '' }));
    e.target.value = null; // Reset input
  };

  const removeFile = (index) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || !user?.token) {
      setErrors({
        ...prev,
        form: !user?.token ? 'Please log in to submit an application.' : 'Submission in progress.',
      });
      return;
    }
  
    const fieldErrors = {
      cv: validateField('cv', formData.cv),
      motivationLetter: validateField('motivationLetter', formData.motivationLetter),
      contact: validateField('contact', formData.contact),
      note: validateField('note', formData.note),
    };
  
    if (Object.values(fieldErrors).some((error) => error)) {
      setErrors(fieldErrors);
      return;
    }
  
    setIsSubmitting(true);
    setErrors({});
    setSuccess(false);
  
    try {
      const data = new FormData();
      data.append('cv', formData.cv);
      data.append('motivationLetter', formData.motivationLetter);
      data.append('contact', formData.contact);
      if (formData.note) data.append('note', formData.note);
      formData.files.forEach((file) => data.append('files', file));
  
      await axios.post(`http://localhost:5000/api/jobs/${jobId}/apply`, data, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
  
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setFormData({ cv: '', motivationLetter: '', contact: '', note: '', files: [] });
        setCharCounts({ cv: 0, motivationLetter: 0, note: 0 });
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setErrors({
        form:
          err.response?.status === 401
            ? 'Unauthorized: Please log in again.'
            : err.response?.data?.message || 'Failed to submit application.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  

  const getCharCountClass = (count, max) => {
    if (count > max) return 'text-red-600';
    if (count > max * 0.9) return 'text-yellow-600';
    return 'text-gray-400';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="apply-form-heading"
        >
          <motion.div
            initial={{ scale: 0.85, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.85, y: 50, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-green-600 transition"
              aria-label="Close application form"
              disabled={isSubmitting}
            >
              <FontAwesomeIcon icon={faTimes} size="lg" />
            </button>
            <div className="p-8">
              <div className="mb-6">
                <h2 id="apply-form-heading" className="text-2xl font-bold text-gray-800">
                  Apply for {jobTitle}
                </h2>
                <p className="text-gray-500 text-sm mt-1">Submit your application to start your journey!</p>
              </div>

              {errors.form && (
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-start gap-3"
                  role="alert"
                >
                  <FontAwesomeIcon icon={faExclamationCircle} className="h-5 w-5 mt-0.5" />
                  <div>
                    <p className="font-semibold">Error</p>
                    <p>{errors.form}</p>
                  </div>
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="bg-green-50 text-green-700 p-4 rounded-lg mb-6 flex items-start gap-3"
                  role="alert"
                >
                  <FontAwesomeIcon icon={faCheckCircle} className="h-5 w-5 mt-0.5" />


                  <div>
                    <p className="font-semibold">Success</p>
                    <p>Your application has been submitted!</p>
                  </div>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <input type="hidden" value={jobId} />
                <div>
                  <label htmlFor="cv" className="block text-sm font-medium text-gray-700 mb-1">
                    CV (Link or Text) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="cv"
                    name="cv"
                    value={formData.cv}
                    onChange={handleChange}
                    rows={4}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all ${
                      errors.cv ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Paste your CV or a link (e.g., LinkedIn) ; You can also attach it below ! "
                    required
                    aria-describedby="cv-error cv-count"
                    disabled={isSubmitting}
                  />
                  {errors.cv && (
                    <p id="cv-error" className="text-red-600 text-xs mt-1">
                      {errors.cv}
                    </p>
                  )}
                  <p
                    id="cv-count"
                    className={`text-xs ${getCharCountClass(charCounts.cv, maxChars.cv)} mt-1`}
                  >
                    {charCounts.cv}/{maxChars.cv} characters
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="motivationLetter"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Motivation Letter <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="motivationLetter"
                    name="motivationLetter"
                    value={formData.motivationLetter}
                    onChange={handleChange}
                    rows={6}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all ${
                      errors.motivationLetter ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Why are you the perfect fit?"
                    required
                    aria-describedby="letter-error letter-count"
                    disabled={isSubmitting}
                  />
                  {errors.motivationLetter && (
                    <p id="letter-error" className="text-red-600 text-xs mt-1">
                      {errors.motivationLetter}
                    </p>
                  )}
                  <p
                    id="letter-count"
                    className={`text-xs ${getCharCountClass(
                      charCounts.motivationLetter,
                      maxChars.motivationLetter
                    )} mt-1`}
                  >
                    {charCounts.motivationLetter}/{maxChars.motivationLetter} characters
                  </p>
                </div>

                <div>
                  <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="contact"
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all ${
                      errors.contact ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Phone number (e.g., +1234567890)"
                    required
                    aria-describedby="contact-error"
                    disabled={isSubmitting}
                  />
                  {errors.contact && (
                    <p id="contact-error" className="text-red-600 text-xs mt-1">
                      {errors.contact}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Notes
                  </label>
                  <textarea
                    id="note"
                    name="note"
                    value={formData.note}
                    onChange={handleChange}
                    rows={3}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all ${
                      errors.note ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Anything else to share?"
                    aria-describedby="note-error note-count"
                    disabled={isSubmitting}
                  />
                  {errors.note && (
                    <p id="note-error" className="text-red-600 text-xs mt-1">
                      {errors.note}
                    </p>
                  )}
                  <p
                    id="note-count"
                    className={`text-xs ${getCharCountClass(charCounts.note, maxChars.note)} mt-1`}
                  >
                    {charCounts.note}/{maxChars.note} characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attachments
                  </label>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50 hover:bg-gray-100 transition-all"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <FontAwesomeIcon icon={faUpload} className="h-10 w-10 text-green-500" />
                      <p className="text-sm text-gray-600">Drag and drop files here or</p>
                      <label className="cursor-pointer bg-green-100 text-green-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-200 transition">
                        Browse Files
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          onChange={handleFileChange}
                          multiple
                          accept=".pdf,.doc,.docx,.txt"
                          disabled={isSubmitting}
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-2">
                        PDF, DOC, DOCX, TXT (Max 5MB each)
                      </p>
                    </div>
                  </motion.div>
                  {errors.files && (
                    <p className="text-red-600 text-xs mt-2">{errors.files}</p>
                  )}
                  {formData.files.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700">Selected Files:</p>
                      <ul className="mt-2 space-y-2">
                        {formData.files.map((file, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center justify-between bg-gray-100 p-2 rounded-lg text-sm"
                          >
                            <span className="text-gray-700 truncate max-w-xs">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="text-red-500 hover:text-red-700"
                              aria-label={`Remove ${file.name}`}
                              disabled={isSubmitting}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <motion.button
                    type="submit"
                    className={`btn btn-primary flex-1 flex items-center justify-center gap-3 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition ${
                      isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                    disabled={isSubmitting}
                    whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
                    whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
                    aria-label={isSubmitting ? 'Submitting application...' : 'Submit application'}
                  >
                    {isSubmitting ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} spin />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faPaperPlane} />
                        Send Application
                      </>
                    )}
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={onClose}
                    className="btn flex-1 py-3 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition"
                    disabled={isSubmitting}
                    whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
                    whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
                    aria-label="Cancel application"
                  >
                    Cancel
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default JobApplicationForm;