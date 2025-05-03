import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext.jsx';
import ApplyForm from '../components/ApplyForm.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

function JobDetails() {
  const { jobId } = useParams();
  const { user } = useContext(AuthContext);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showApplyForm, setShowApplyForm] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/jobs/${jobId}`);
        setJob(response.data);
      } catch (err) {
        console.error('Error fetching job:', {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message,
        });
        setError(
          err.response?.data?.message === 'Job not found or not approved'
            ? 'This job is not available or is pending approval. 😔'
            : err.response?.data?.message || 'Unable to fetch job details. Please try again later. 😢'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [jobId]);

  const handleApplyClick = () => {
    setShowApplyForm(true);
  };

  const handleCloseForm = () => {
    setShowApplyForm(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="inline-block"
        >
          <svg
            className="h-12 w-12 text-green-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </motion.div>
        <p className="mt-4 text-lg font-light text-neutral-600 tracking-wide">
          Loading job details... ⏳
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-red-50 text-red-600 p-6 rounded-lg shadow-md max-w-lg mx-auto"
        >
          <div className="flex items-start justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-2 mt-1 flex-shrink-0"
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
              <h4 className="text-lg font-semibold tracking-tight">Oops! 😿</h4>
              <p className="font-light tracking-wide">{error}</p>
              <div className="mt-4 space-x-4">
                <button
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium focus:outline-none focus:ring-2 focus:ring-green-500"
                  onClick={() => window.location.reload()}
                  aria-label="Retry fetching job details"
                >
                  Retry 🔄
                </button>
                <Link
                  to="/jobs"
                  className="bg-neutral-100 text-neutral-900 px-4 py-2 rounded-lg hover:bg-neutral-200 transition font-medium focus:outline-none focus:ring-2 focus:ring-green-500"
                  aria-label="Back to job listings"
                >
                  Back to Jobs 📋
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-xl font-light text-neutral-600 tracking-wide">
          Job not found. 😕
        </p>
        <Link
          to="/jobs"
          className="mt-4 inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium focus:outline-none focus:ring-2 focus:ring-green-500"
          aria-label="Back to job listings"
        >
          Back to Jobs 📋
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white p-8 rounded-lg shadow-md max-w-3xl mx-auto"
        role="article"
        aria-labelledby={`job-title-${job.id}`}
      >
        <h2
          id={`job-title-${job.id}`}
          className="text-3xl font-extrabold text-neutral-900 mb-4 tracking-tight"
        >
          💼 {job.title}
        </h2>
        <p className="text-sm font-medium text-green-600 mb-6 tracking-wide">
          {job.contract.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())} 🌟
        </p>
        <p className="text-lg font-light text-neutral-600 mb-2 tracking-wide">
          🏢 {job.company}
        </p>
        <p className="text-lg font-light text-neutral-600 mb-4 tracking-wide">
          📍 {job.location}
        </p>
      

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-2 tracking-tight">
            📋 Job Description
          </h3>
          <p className="text-neutral-700 font-light whitespace-pre-wrap leading-relaxed tracking-wide">
            {job.description}
          </p>
        </div>

        {job.requirements && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-2 tracking-tight">
              ✅ Requirements
            </h3>
            <ul className="list-disc pl-6 text-neutral-700 font-light leading-relaxed tracking-wide">
              {job.requirements.split('\n').map((req, index) => (
                <li key={index}>{req || 'No specific requirements listed.'}</li>
              ))}
            </ul>
          </div>
        )}

        {job.salary && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-2 tracking-tight">
              💰 Salary
            </h3>
            <p className="text-neutral-700 font-light tracking-wide">{job.salary}</p>
          </div>
        )}

        {user && user.role === 'candidate' && (
           <motion.button
           className="btn btn-primary text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-medium focus:outline-none focus:ring-2 focus:ring-green-500"
           onClick={handleApplyClick}
           whileHover={{ scale: 1.05 }}
           whileTap={{ scale: 0.95 }}
           aria-label={`Apply for ${job.title}`}
         >
            Apply Now 🚀
          </motion.button>
        )}
      </motion.div>

      {showApplyForm && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full relative"
            role="dialog"
            aria-label="Job application form"
          >
            <button
              className="btn btn-primary  "
              onClick={handleCloseForm}
              aria-label="Close application form"
            >
              <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
            </button>
            <ApplyForm
              isOpen={showApplyForm}
              onClose={handleCloseForm}
              jobTitle={job.title}
              jobId={job.id}
            />
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default JobDetails;