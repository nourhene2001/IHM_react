import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Messages from './messages.jsx';

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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto p-6"
    >
      <h2 className="text-3xl font-bold text-gray-800 mb-6">My Posted Jobs</h2>
      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : error ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-500 mb-4 p-3 bg-red-100 rounded"
        >
          {error}
        </motion.p>
      ) : (
        <div>
          {jobs.length === 0 ? (
            <p className="text-center py-4 text-gray-600">No jobs posted.</p>
          ) : (
            jobs.map(job => (
              <div key={job.id} className="mb-8">
                <h3 className="text-2xl font-semibold mb-2">{job.title} at {job.company}</h3>
                <p className="text-gray-600 mb-4">{job.location} - {job.contract}</p>
                <h4 className="text-xl font-medium mb-2">Applications</h4>
                {job.applications.length === 0 ? (
                  <p className="text-gray-600">No applications yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full table-auto">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Candidate</th>
                          <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">CV</th>
                          <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Motivation Letter</th>
                          <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Contact</th>
                          <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Note</th>
                          <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                          <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {job.applications.map(app => (
                          <tr key={app.id} className="border-t hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm text-gray-700">
                              {app.candidate?.name} ({app.candidate?.email})
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700">
                              <a href={app.cv} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                                View CV
                              </a>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700">
                              <button
                                onClick={() => setSelectedLetter(app.motivationLetter)}
                                className="text-blue-500 underline"
                              >
                                {app.motivationLetter.substring(0, 50)}...
                              </button>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700">{app.contact}</td>
                            <td className="px-6 py-4 text-sm text-gray-700">{app.note || 'N/A'}</td>
                            <td className="px-6 py-4 text-sm text-gray-700">{app.status}</td>
                            <td className="px-6 py-4 text-sm">
                              {app.status === 'pending' && (
                                <>
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleAccept(app.id)}
                                    className="bg-green-500 text-white px-3 py-1 rounded mr-2 hover:bg-green-700"
                                  >
                                    Accept
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleReject(app.id)}
                                    className="bg-red-500 text-white px-3 py-1 rounded mr-2 hover:bg-red-700"
                                  >
                                    Reject
                                  </motion.button>
                                </>
                              )}
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => toggleMessages(app.id)}
                                className="bg-blue-500 text-white px-3 py-1 rounded mr-2 hover:bg-blue-700"
                              >
                                {selectedApplicationId === app.id ? 'Hide Messages' : 'View Messages'}
                              </motion.button>
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
              </div>
            ))
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
            className="bg-white p-6 rounded-lg max-w-lg w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-4">Motivation Letter</h3>
            <p className="text-gray-700 mb-6 whitespace-pre-wrap">{selectedLetter}</p>
            <button
              onClick={() => setSelectedLetter(null)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
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