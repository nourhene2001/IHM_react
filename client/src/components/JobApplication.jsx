import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faFileAlt,
  faEnvelopeOpenText,
  faAddressBook,
  faStickyNote,
  faPaperclip,
  faCloudUploadAlt,
  faPaperPlane,
  faSpinner,
  faLock,
  faHeadset,
  faExclamationCircle,
  faCheckCircle,
  faInfoCircle,
  faQuestionCircle,
  faPhoneAlt,
} from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

const JobApplicationForm = ({ isOpen, onClose, jobTitle, jobId }) => {
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, files: e.target.files });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.cv.trim() || !formData.motivationLetter.trim() || !formData.contact.trim()) {
      setError('Please fill in all required fields');
      return;
    }
    const isEmail = formData.contact.includes('@');
    const isPhone = /^[0-9+\- ]+$/.test(formData.contact);
    if (!isEmail && !isPhone) {
      setError('Please enter a valid email or phone number');
      return;
    }
    setIsSubmitting(true);
    setError('');
    setTimeout(() => {
      const isSuccess = Math.random() > 0.2;
      if (isSuccess) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setFormData({ cv: '', motivationLetter: '', contact: '', note: '', files: null });
          onClose();
        }, 2000);
      } else {
        setError('Submission failed. Please try again later.');
      }
      setIsSubmitting(false);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="modal"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Apply for {jobTitle}</h2>
              <p className="text-gray-600">Take a step toward your dream job!</p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close application form"
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <FontAwesomeIcon icon={faTimes} className="text-xl" />
            </button>
          </div>
        </header>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 flex items-center"
          >
            <FontAwesomeIcon icon={faExclamationCircle} className="mr-2" />
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-green-100 text-green-700 p-3 rounded-lg mb-4 flex items-center"
          >
            <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
            Application submitted successfully!
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-group">
            <label htmlFor="cv" className="flex items-center font-medium mb-1">
              <FontAwesomeIcon icon={faFileAlt} className="mr-2 text-[var(--cta-primary)]" />
              CV (Link or Text) <span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              id="cv"
              name="cv"
              value={formData.cv}
              onChange={handleChange}
              rows="4"
              placeholder="Paste your CV text or a link (e.g., LinkedIn)"
              required
              className="form-input"
            />
            <p className="text-sm text-gray-500 mt-1">{formData.cv.length}/2000 characters</p>
          </div>

          <div className="form-group">
            <label htmlFor="motivationLetter" className="flex items-center font-medium mb-1">
              <FontAwesomeIcon icon={faEnvelopeOpenText} className="mr-2 text-[var(--cta-primary)]" />
              Motivation Letter <span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              id="motivationLetter"
              name="motivationLetter"
              value={formData.motivationLetter}
              onChange={handleChange}
              rows="6"
              placeholder="Tell us why you're the perfect fit for this role"
              required
              className="form-input"
            />
            <p className="text-sm text-gray-500 mt-1">{formData.motivationLetter.length}/2000 characters</p>
          </div>

          <div className="form-group">
            <label htmlFor="contact" className="flex items-center font-medium mb-1">
              <FontAwesomeIcon icon={faAddressBook} className="mr-2 text-[var(--cta-primary)]" />
              Contact Information <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              id="contact"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              placeholder="Email or phone number"
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="note" className="flex items-center font-medium mb-1">
              <FontAwesomeIcon icon={faStickyNote} className="mr-2 text-[var(--cta-primary)]" />
              Additional Notes (Optional)
            </label>
            <textarea
              id="note"
              name="note"
              value={formData.note}
              onChange={handleChange}
              rows="3"
              placeholder="Anything else you'd like to share?"
              className="form-input"
            />
            <p className="text-sm text-gray-500 mt-1">{formData.note.length}/500 characters</p>
          </div>

          <div className="form-group">
            <label className="flex items-center font-medium mb-1">
              <FontAwesomeIcon icon={faPaperclip} className="mr-2 text-[var(--cta-primary)]" />
              Attachments (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
              <FontAwesomeIcon icon={faCloudUploadAlt} className="text-4xl text-[var(--cta-primary)] mb-3" />
              <p className="mb-3 text-gray-600">Drag & drop files or</p>
              <label className="btn btn-primary cursor-pointer">
                Browse Files
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  multiple
                  accept=".pdf,.doc,.docx"
                />
              </label>
              <p className="text-sm text-gray-500 mt-3">Supports: PDF, DOC, DOCX (Max 5MB each)</p>
            </div>
            {formData.files && (
              <p className="text-sm text-gray-600 mt-2">
                Selected files: {formData.files.length}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={isSubmitting}
              aria-label="Submit application"
            >
              {isSubmitting ? (
                <>
                  Submitting
                  <FontAwesomeIcon icon={faSpinner} className="ml-2 animate-spin" />
                </>
              ) : (
                <>
                  Submit Application
                  <FontAwesomeIcon icon={faPaperPlane} className="ml-2" />
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-neutral flex-1"
              aria-label="Cancel application"
            >
              <FontAwesomeIcon icon={faTimes} className="mr-2" />
              Cancel
            </button>
          </div>
        </form>

        <footer className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faLock} className="mr-1" />
              Your information is secure
            </div>
            <div className="flex items-center mt-2 sm:mt-0">
              <FontAwesomeIcon icon={faHeadset} className="mr-1" />
              <span>
                Need help?{' '}
                <a href="#" className="text-[var(--cta-primary)] hover:underline">
                  Contact support
                </a>
              </span>
            </div>
          </div>
        </footer>
      </motion.div>
    </motion.div>
  );
};

export default JobApplicationForm;