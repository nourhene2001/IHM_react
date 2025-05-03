import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCloudUploadAlt, 
  faDollarSign, 
  faMapMarkerAlt, 
  faBriefcase,
  faBuilding,
  faFileAlt,
  faListUl
} from '@fortawesome/free-solid-svg-icons';

function PostJob() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    company: user?.company || '',
    location: '',
    contract: 'full-time',
    salary: '',
    description: '',
    requirements: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Job title is required';
    }
    
    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Job description is required';
    }
    
    if (!formData.requirements.trim()) {
      newErrors.requirements = 'Job requirements are required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      setTimeout(() => {
        setSuccess(true);
        
        setTimeout(() => {
          navigate('/jobs/my-jobs');
        }, 2000);
      }, 1500);
    } catch (error) {
      setErrors({
        general: 'An error occurred while posting the job. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center container py-8 items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-center mb-8">Post a New Job</h1>
        
        {success ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="toast success"
          >
            Job posted successfully! Redirecting to your jobs...
          </motion.div>
        ) : (
          <div className="card max-w-3xl mx-auto">
            {errors.general && (
              <div className="toast error mb-6">
                {errors.general}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label htmlFor="title" className="form-label">
                    <FontAwesomeIcon icon={faBriefcase} className="mr-2 text-primary-500" />
                    Job Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    className={`form-input ${errors.title ? 'border-error-500' : ''}`}
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Senior Software Engineer"
                  />
                  {errors.title && (
                    <p className="text-error-500 text-sm mt-1">{errors.title}</p>
                  )}
                </div>
                
                <div className="form-group">
                  <label htmlFor="company" className="form-label">
                    <FontAwesomeIcon icon={faBuilding} className="mr-2 text-primary-500" />
                    Company Name *
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    className={`form-input ${errors.company ? 'border-error-500' : ''}`}
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="e.g. Acme Corporation"
                  />
                  {errors.company && (
                    <p className="text-error-500 text-sm mt-1">{errors.company}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="form-group">
                  <label htmlFor="location" className="form-label">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-primary-500" />
                    Location *
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    className={`form-input ${errors.location ? 'border-error-500' : ''}`}
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. San Francisco, CA or Remote"
                  />
                  {errors.location && (
                    <p className="text-error-500 text-sm mt-1">{errors.location}</p>
                  )}
                </div>
                
                <div className="form-group">
                  <label htmlFor="contract" className="form-label">
                    <FontAwesomeIcon icon={faBriefcase} className="mr-2 text-primary-500" />
                    Job Type *
                  </label>
                  <select
                    id="contract"
                    name="contract"
                    className="form-input"
                    value={formData.contract}
                    onChange={handleChange}
                  >
                    <option value="full-time">Full-Time</option>
                    <option value="part-time">Part-Time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="salary" className="form-label">
                    <FontAwesomeIcon icon={faDollarSign} className="mr-2 text-primary-500" />
                    Salary Range (Optional)
                  </label>
                  <input
                    type="text"
                    id="salary"
                    name="salary"
                    className="form-input"
                    value={formData.salary}
                    onChange={handleChange}
                    placeholder="e.g. $80,000 - $100,000"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="description" className="form-label">
                  <FontAwesomeIcon icon={faFileAlt} className="mr-2 text-primary-500" />
                  Job Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="6"
                  className={`form-input ${errors.description ? 'border-error-500' : ''}`}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Provide a detailed description of the job role, responsibilities, and what a typical day looks like..."
                ></textarea>
                {errors.description && (
                  <p className="text-error-500 text-sm mt-1">{errors.description}</p>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="requirements" className="form-label">
                  <FontAwesomeIcon icon={faListUl} className="mr-2 text-primary-500" />
                  Requirements and Qualifications *
                </label>
                <textarea
                  id="requirements"
                  name="requirements"
                  rows="6"
                  className={`form-input ${errors.requirements ? 'border-error-500' : ''}`}
                  value={formData.requirements}
                  onChange={handleChange}
                  placeholder="List the skills, experience, education, and any other requirements for the position..."
                ></textarea>
                {errors.requirements && (
                  <p className="text-error-500 text-sm mt-1">{errors.requirements}</p>
                )}
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  <FontAwesomeIcon icon={faCloudUploadAlt} className="mr-2 text-primary-500" />
                  Company Logo (Optional)
                </label>
                <div className="border-2 border-dashed border-neutral-300 rounded-lg p-4 text-center">
                  <FontAwesomeIcon icon={faCloudUploadAlt} className="text-2xl text-neutral-400 mb-2" />
                  <p className="text-neutral-600 mb-2">Drag & drop your logo here or click to browse</p>
                  <button
                    type="button"
                    className="btn btn-neutral inline-block"
                  >
                    Upload Logo
                  </button>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                  />
                  <p className="text-sm text-neutral-500 mt-2">Recommended size: 400x400px. Max size: 2MB.</p>
                </div>
              </div>
              
              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  className="btn btn-neutral mr-3"
                  onClick={() => navigate('/jobs')}
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Posting...' : 'Post Job'}
                </motion.button>
              </div>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default PostJob;