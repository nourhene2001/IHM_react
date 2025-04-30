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
  faPhoneAlt
} from '@fortawesome/free-solid-svg-icons';
import '../styles/global.css';

const JobApplicationForm = () => {
  const [formData, setFormData] = useState({
    cv: '',
    motivationLetter: '',
    contact: '',
    note: '',
    files: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      files: e.target.files
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.cv.trim() || !formData.motivationLetter.trim() || !formData.contact.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate contact format
    const isEmail = formData.contact.includes('@');
    const isPhone = /^[0-9+\- ]+$/.test(formData.contact);
    if (!isEmail && !isPhone) {
      setError('Please enter a valid email or phone number');
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    // Simulate API call
    setTimeout(() => {
      const isSuccess = Math.random() > 0.2; // 80% success rate for demo
      
      if (isSuccess) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          // Reset form
          setFormData({
            cv: '',
            motivationLetter: '',
            contact: '',
            note: '',
            files: null
          });
        }, 3000);
      } else {
        setError('Submission failed. Please try again later.');
      }
      setIsSubmitting(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100 font-sans">
      <div className="max-w-4xl w-full bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Apply for Position</h1>
              <p className="text-blue-100 mt-1">Join our amazing team</p>
            </div>
            <button className="text-white hover:text-blue-200 transition-colors">
              <FontAwesomeIcon icon={faTimes} className="text-xl" />
            </button>
          </div>
        </div>
        
        {/* Form Container */}
        <div className="p-6 md:p-8">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded animate-fadeIn">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faExclamationCircle} className="mr-2" />
                <span>{error}</span>
              </div>
            </div>
          )}
          
          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded animate-fadeIn">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                <span>Application submitted successfully!</span>
              </div>
            </div>
          )}
          
          {/* Application Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* CV Section */}
            <div className="animate-slideUp">
              <label htmlFor="cv" className="block text-gray-700 font-medium mb-2 flex items-center">
                <FontAwesomeIcon icon={faFileAlt} className="text-blue-500 mr-2" />
                CV (Link or Text)
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <textarea 
                  id="cv" 
                  name="cv" 
                  value={formData.cv}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
                  rows="3" 
                  placeholder="Paste your CV text or a link to your CV"
                  required
                />
                <div className="absolute right-3 top-3 text-gray-400">
                  <FontAwesomeIcon 
                    icon={faInfoCircle} 
                    title="You can paste your CV text or provide a link to your CV (e.g., LinkedIn, personal website)" 
                  />
                </div>
              </div>
              <div className="text-right text-xs text-gray-400 mt-1">
                {formData.cv.length}/2000
              </div>
            </div>
            
            {/* Motivation Letter */}
            <div className="animate-slideUp">
              <label htmlFor="motivationLetter" className="block text-gray-700 font-medium mb-2 flex items-center">
                <FontAwesomeIcon icon={faEnvelopeOpenText} className="text-blue-500 mr-2" />
                Letter of Motivation
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <textarea 
                  id="motivationLetter" 
                  name="motivationLetter" 
                  value={formData.motivationLetter}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
                  rows="5" 
                  placeholder="Explain why you're the perfect candidate for this position"
                  required
                />
                <div className="absolute right-3 top-3 text-gray-400">
                  <FontAwesomeIcon 
                    icon={faQuestionCircle} 
                    title="Tell us why you're interested in this position and what makes you a great fit" 
                  />
                </div>
              </div>
              <div className="text-right text-xs text-gray-400 mt-1">
                {formData.motivationLetter.length}/2000
              </div>
            </div>
            
            {/* Contact Information */}
            <div className="animate-slideUp">
              <label htmlFor="contact" className="block text-gray-700 font-medium mb-2 flex items-center">
                <FontAwesomeIcon icon={faAddressBook} className="text-blue-500 mr-2" />
                Contact Information
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  id="contact" 
                  name="contact" 
                  value={formData.contact}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
                  placeholder="Your email or phone number"
                  required
                />
                <div className="absolute right-3 top-3 text-gray-400">
                  <FontAwesomeIcon 
                    icon={faPhoneAlt} 
                    title="We'll use this to contact you about your application" 
                  />
                </div>
              </div>
            </div>
            
            {/* Additional Notes */}
            <div className="animate-slideUp">
              <label htmlFor="note" className="block text-gray-700 font-medium mb-2 flex items-center">
                <FontAwesomeIcon icon={faStickyNote} className="text-blue-500 mr-2" />
                Additional Notes (Optional)
              </label>
              <textarea 
                id="note" 
                name="note" 
                value={formData.note}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
                rows="3" 
                placeholder="Any additional information you'd like to share"
              />
              <div className="text-right text-xs text-gray-400 mt-1">
                {formData.note.length}/500
              </div>
            </div>
            
            {/* File Upload */}
            <div className="animate-slideUp">
              <label className="block text-gray-700 font-medium mb-2 flex items-center">
                <FontAwesomeIcon icon={faPaperclip} className="text-blue-500 mr-2" />
                Attachments (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <div className="flex flex-col items-center justify-center">
                  <FontAwesomeIcon icon={faCloudUploadAlt} className="text-3xl text-blue-500 mb-2" />
                  <p className="text-gray-500 mb-2">Drag & drop files here or</p>
                  <label className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer">
                    Browse Files
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={handleFileChange}
                      multiple
                      accept=".pdf,.doc,.docx"
                    />
                  </label>
                  <p className="text-xs text-gray-400 mt-2">Supports: PDF, DOC, DOCX (Max 5MB each)</p>
                </div>
              </div>
              {formData.files && (
                <div className="mt-2 text-sm text-gray-600">
                  Selected files: {formData.files.length}
                </div>
              )}
            </div>
            
            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className={`flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center ${!isSubmitting && 'animate-pulse'}`}
              >
                <span>{isSubmitting ? 'Submitting...' : 'Submit Application'}</span>
                {isSubmitting ? (
                  <FontAwesomeIcon icon={faSpinner} className="ml-2 animate-spin" />
                ) : (
                  <FontAwesomeIcon icon={faPaperPlane} className="ml-2" />
                )}
              </button>
              
              <button 
                type="button"
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
              >
                <FontAwesomeIcon icon={faTimes} className="mr-2" />
                Cancel
              </button>
            </div>
          </form>
        </div>
        
        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <div className="mb-2 md:mb-0">
              <FontAwesomeIcon icon={faLock} className="mr-1" />
              <span>Your information is secure</span>
            </div>
            <div>
              <FontAwesomeIcon icon={faHeadset} className="mr-1" />
              <span>Need help? <a href="#" className="text-blue-500 hover:underline">Contact support</a></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobApplicationForm;