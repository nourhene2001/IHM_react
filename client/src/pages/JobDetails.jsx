import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext.jsx';
import ApplyForm from '../components/ApplyForm.jsx';

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
        setJob(response.data); // Direct response, not response.data.data
      } catch (err) {
        console.error('Error fetching job:', {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message,
        });
        setError(
          err.response?.data?.message === 'Job not found or not approved'
            ? 'This job is not available or is pending approval.'
            : err.response?.data?.message || 'Unable to fetch job details. Please try again later.'
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
      <div className="container text-center py-12">
        <svg
          className="animate-spin h-12 w-12 mx-auto text-[var(--primary)]"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <p className="mt-4 text-lg text-gray-600">Loading job details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container text-center py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-50 text-[var(--error)] p-6 rounded-lg text-center flex items-start justify-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 mr-2 mt-0.5"
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
            <h4 className="font-bold">Error</h4>
            <p>{error}</p>
            <div className="mt-4 space-x-4">
              <button
                className="btn btn-primary"
                onClick={() => window.location.reload()}
                aria-label="Retry fetching job details"
              >
                Retry
              </button>
              <Link to="/jobs" className="btn btn-secondary" aria-label="Back to job listings">
                Back to Jobs
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container text-center py-12">
        <p className="text-xl text-gray-600">Job not found.</p>
        <Link to="/jobs" className="btn btn-primary mt-4" aria-label="Back to job listings">
          Back to Jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="job-details">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="card"
        role="article"
        aria-labelledby={`job-title-${job.id}`}
      >
        <h2 id={`job-title-${job.id}`} className="text-2xl font-bold mb-4">
          {job.title}
        </h2>
        <p className="text-gray-600 mb-2 text-lg">{job.company}</p>
        <p className="text-gray-600 mb-4">{job.location}</p>
        <p className="text-sm text-gray-500 mb-6">
          {job.contract.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
        </p>
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Job Description</h3>
          <p className="whitespace-pre-wrap text-gray-700">{job.description}</p>
        </div>
        {job.requirements && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Requirements</h3>
            <ul className="list-disc pl-5 text-gray-700">
              {job.requirements.split('\n').map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </div>
        )}
        {job.salary && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Salary</h3>
            <p className="text-gray-700">{job.salary}</p>
          </div>
        )}
        {user && user.role === 'candidate' && (
          <motion.button
            className="btn btn-primary"
            onClick={handleApplyClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={`Apply for ${job.title}`}
          >
            Apply Now
          </motion.button>
        )}
      </motion.div>

      {showApplyForm && (
        <div className="apply-modal">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="apply-modal-content"
            role="dialog"
            aria-label="Job application form"
          >
            <button
              className="apply-modal-close"
              onClick={handleCloseForm}
              aria-label="Close application form"
            >
              ×
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