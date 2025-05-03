import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPaperPlane, faSpinner, faUpload } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext.jsx';

function JobApplicationForm({ isOpen, onClose, jobTitle, jobId }) {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    cv: '',
    motivationLetter: '',
    contact: '',
    note: '',
    files: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [charCounts, setCharCounts] = useState({
    cv: 0,
    motivationLetter: 0,
    note: 0,
  });

  const maxChars = {
    cv: 2000,
    motivationLetter: 2000,
    note: 500,
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setCharCounts((prev) => ({
      ...prev,
      [name]: value.length,
    }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, files: e.target.files }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.cv.trim() || !formData.motivationLetter.trim() || !formData.contact.trim()) {
      setError('Please fill out all required fields.');
      return;
    }
    if (charCounts.cv > maxChars.cv || charCounts.motivationLetter > maxChars.motivationLetter || charCounts.note > maxChars.note) {
      setError('Character limits exceeded.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      const data = new FormData();
      data.append('cv', formData.cv);
      data.append('motivationLetter', formData.motivationLetter);
      data.append('contact', formData.contact);
      data.append('note', formData.note || '');
      if (formData.files) {
        Array.from(formData.files).forEach((file) => data.append('files', file));
      }

      await axios.post(`http://localhost:5000/api/jobs/${jobId}/apply`, data, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setFormData({ cv: '', motivationLetter: '', contact: '', note: '', files: null });
        setCharCounts({ cv: 0, motivationLetter: 0, note: 0 });
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'There was an error submitting your application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCharCountClass = (count, max) => {
    if (count > max) return 'text-[var(--error)]';
    if (count > max * 0.9) return 'text-[var(--accent)]';
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
          className="apply-modal bg-black/60 backdrop-blur-sm"
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
            className="apply-modal-content bg-white/90 backdrop-blur-md border border-gray-100/50 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="apply-modal-close hover:text-[var(--primary)] transition"
              aria-label="Close application form"
              disabled={isSubmitting}
            >
              <FontAwesomeIcon icon={faTimes} size="lg" />
            </button>
            <div className="p-8">
              <div className="mb-6">
                <h2 id="apply-form-heading" className="text-3xl font-bold text-[var(--text)] tracking-tight">
                  Apply for {jobTitle} 🌟
                </h2>
                <p className="text-gray-500 mt-1">Your next adventure awaits!</p>
              </div>

              {error && (
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="bg-red-50/90 text-[var(--error)] p-4 rounded-xl mb-6 flex items-start gap-3 shadow-sm"
                  role="alert"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mt-0.5 flex-shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <p className="font-semibold">Oops!</p>
                    <p>{error}</p>
                  </div>
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="bg-green-50/90 text-[var(--success)] p-4 rounded-xl mb-6 flex items-start gap-3 shadow-sm"
                  role="alert"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mt-0.5 flex-shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <p className="font-semibold">Yay!</p>
                    <p>Your application is on its way! 🚀</p>
                  </div>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <input type="hidden" value={jobId} />
                <div className="form-group">
                  <label htmlFor="cv" className="form-label">
                    CV (Link or Text) <span className="text-[var(--error)]">*</span>
                  </label>
                  <textarea
                    id="cv"
                    name="cv"
                    value={formData.cv}
                    onChange={handleChange}
                    rows={4}
                    className="form-input bg-white/80 focus:ring-[var(--accent)] focus:border-[var(--accent)] transition-all duration-300"
                    placeholder="Paste your CV or a link (e.g., LinkedIn)"
                    required
                    aria-describedby="cv-count"
                    disabled={isSubmitting}
                  />
                  <p
                    id="cv-count"
                    className={`text-xs ${getCharCountClass(charCounts.cv, maxChars.cv)} mt-1`}
                  >
                    {charCounts.cv}/{maxChars.cv} characters
                  </p>
                </div>

                <div className="form-group">
                  <label htmlFor="motivationLetter" className="form-label">
                    Motivation Letter <span className="text-[var(--error)]">*</span>
                  </label>
                  <textarea
                    id="motivationLetter"
                    name="motivationLetter"
                    value={formData.motivationLetter}
                    onChange={handleChange}
                    rows={6}
                    className="form-input bg-white/80 focus:ring-[var(--accent)] focus:border-[var(--accent)] transition-all duration-300"
                    placeholder="Why are you the perfect fit? ✨"
                    required
                    aria-describedby="letter-count"
                    disabled={isSubmitting}
                  />
                  <p
                    id="letter-count"
                    className={`text-xs ${getCharCountClass(charCounts.motivationLetter, maxChars.motivationLetter)} mt-1`}
                  >
                    {charCounts.motivationLetter}/{maxChars.motivationLetter} characters
                  </p>
                </div>

                <div className="form-group">
                  <label htmlFor="contact" className="form-label">
                    Contact Information <span className="text-[var(--error)]">*</span>
                  </label>
                  <input
                    type="text"
                    id="contact"
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    className="form-input bg-white/80 focus:ring-[var(--accent)] focus:border-[var(--accent)] transition-all duration-300"
                    placeholder="Email or phone number"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="note" className="form-label">
                    Additional Notes
                  </label>
                  <textarea
                    id="note"
                    name="note"
                    value={formData.note}
                    onChange={handleChange}
                    rows={3}
                    className="form-input bg-white/80 focus:ring-[var(--accent)] focus:border-[var(--accent)] transition-all duration-300"
                    placeholder="Anything else to share? 😊"
                    aria-describedby="note-count"
                    disabled={isSubmitting}
                  />
                  <p
                    id="note-count"
                    className={`text-xs ${getCharCountClass(charCounts.note, maxChars.note)} mt-1`}
                  >
                    {charCounts.note}/{maxChars.note} characters
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--text)]">
                    Attachments
                  </label>
                  <motion.div
                    whileHover={{ scale: 1.02, borderColor: 'var(--primary)' }}
                    className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center bg-white/50 hover:bg-white/80 transition-all duration-300"
                  >
                    <div className="flex flex-col items-center justify-center gap-3">
                      <FontAwesomeIcon
                        icon={faUpload}
                        className="h-12 w-12 text-[var(--primary)]"
                      />
                      <p className="text-sm text-gray-600">Drag and drop files here or</p>
                      <label className="cursor-pointer bg-[var(--primary)]/10 text-[var(--primary)] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--primary)]/20 transition">
                        Browse Files
                        <input
                          type="file"
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
                  {formData.files && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-gray-500 mt-2"
                    >
                      Selected: {formData.files.length} file(s)
                    </motion.p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <motion.button
                    type="submit"
                    className={`btn btn-primary flex-1 flex items-center justify-center gap-3 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white py-3 rounded-xl shadow-lg ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.05, rotate: 1 }}
                    whileTap={{ scale: 0.95 }}
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
                    className="btn btn-neutral flex-1 py-3 rounded-xl bg-white/80 border-gray-200 text-[var(--text)] hover:bg-gray-100"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
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