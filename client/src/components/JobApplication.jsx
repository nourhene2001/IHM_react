import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Messages from '../components/messages.jsx';

function JobApplications() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found in localStorage');

        const response = await axios.get('http://localhost:5000/api/jobs/my-jobs', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setJobs(response.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Error fetching jobs');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const getJobStatus = (job) => {
    if (job.banned) return { text: 'Banned', class: 'bg-red-100 text-red-800' };
    return job.isApproved 
      ? { text: 'Approved', class: 'bg-green-100 text-green-800' }
      : { text: 'Pending Approval', class: 'bg-yellow-100 text-yellow-800' };
  };

  const handleAccept = async (applicationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5000/api/jobs/applications/${applicationId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setJobs(jobs.map(job => ({
        ...job,
        applications: job.applications.map(app =>
          app.id === applicationId ? response.data : app
        ),
      })));
    } catch (err) {
      setError(err.response?.data?.message || 'Error accepting application');
    }
  };

  const handleReject = async (applicationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5000/api/jobs/applications/${applicationId}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setJobs(jobs.map(job => ({
        ...job,
        applications: job.applications.map(app =>
          app.id === applicationId ? response.data : app
        ),
      })));
    } catch (err) {
      setError(err.response?.data?.message || 'Error rejecting application');
    }
  };

  const toggleMessages = (applicationId) => {
    setSelectedApplicationId(
      selectedApplicationId === applicationId ? null : applicationId
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="container py-8"
    >
      <h2 className="text-center mb-8">My Posted Jobs 📋</h2>
      {loading ? (
        <div className="text-center py-4">
          <svg className="spinner h-8 w-8 mx-auto text-[var(--cta-primary)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-2">Loading your jobs... ✨</p>
        </div>
      ) : error ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="toast error animate-fadeIn"
        >
          {error}
        </motion.div>
      ) : (
        <div className="space-y-8">
          {jobs.length === 0 ? (
            <div className="text-center py-4">
              <p className="mb-4">You haven't posted any jobs yet. Let's get started! 🚀</p>
              <button
                onClick={() => navigate('/post-job')}
                className="btn btn-primary"
                aria-label="Post a new job"
              >
                Post a Job
              </button>
            </div>
          ) : (
            jobs.map(job => {
              const status = getJobStatus(job);
              return (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="card"
                >
                  <div className="mb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold">{job.title}</h3>
                        <p className="text-sm opacity-75">
                          {job.company} • {job.location} • {job.contract}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${status.class}`}>
                        {status.text}
                      </span>
                    </div>
                  </div>
                  <h4 className="mb-2">Applications</h4>
                  {job.applications.length === 0 ? (
                    <p>No applications yet. Keep waiting! 🌟</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table>
                        <thead>
                          <tr>
                            <th>Candidate</th>
                            <th>CV</th>
                            <th>Motivation Letter</th>
                            <th>Contact</th>
                            <th>Note</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {job.applications.map(app => (
                            <tr key={app.id}>
                              <td>
                                {app.candidate?.name} ({app.candidate?.email})
                              </td>
                              <td>
                                <a
                                  href={app.cv}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="link-primary"
                                >
                                  View CV
                                </a>
                              </td>
                              <td>
                                <button
                                  onClick={() => setSelectedLetter(app.motivationLetter)}
                                  className="link-primary"
                                >
                                  {app.motivationLetter.substring(0, 50)}...
                                </button>
                              </td>
                              <td>{app.contact}</td>
                              <td>{app.note || 'N/A'}</td>
                              <td>{app.status}</td>
                              <td>
                                <div className="btn-group">
                                  {app.status === 'pending' && !job.banned && (
                                    <>
                                      <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleAccept(app.id)}
                                        className="btn btn-neutral"
                                        aria-label={`Accept application ${app.id}`}
                                      >
                                        Accept
                                      </motion.button>
                                      <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleReject(app.id)}
                                        className="btn btn-secondary"
                                        aria-label={`Reject application ${app.id}`}
                                      >
                                        Reject
                                      </motion.button>
                                    </>
                                  )}
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => toggleMessages(app.id)}
                                    className="btn btn-neutral"
                                    aria-label={selectedApplicationId === app.id ? 'Hide messages' : 'View messages'}
                                  >
                                    {selectedApplicationId === app.id ? 'Hide Messages' : 'View Messages'}
                                  </motion.button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {job.applications.map(app => (
                        selectedApplicationId === app.id && (
                          <div key={app.id} className="mt-4">
                            <Messages
                              applicationId={app.id}
                              userRole="recruiter"
                              candidateId={app.candidateId}
                              recruiterId={job.recruiterId}
                            />
                          </div>
                        )
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </div>
      )}
      {selectedLetter && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setSelectedLetter(null)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="card max-w-lg w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Motivation Letter</h3>
            <p className="mb-6 whitespace-pre-wrap">{selectedLetter}</p>
            <button
              onClick={() => setSelectedLetter(null)}
              className="btn btn-neutral w-full"
              aria-label="Close motivation letter"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default JobApplications;