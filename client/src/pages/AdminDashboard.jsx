import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

function AdminDashboard() {
  const [jobs, setJobs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsResponse, usersResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/admin/jobs', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
          axios.get('http://localhost:5000/api/admin/users', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
        ]);
        setJobs(jobsResponse.data);
        setUsers(usersResponse.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleApproveJob = async (jobId) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/admin/jobs/${jobId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setJobs(jobs.map((job) => (job.id === jobId ? response.data : job)));
    } catch (err) {
      setError(err.response?.data?.message || 'Error approving job');
    }
  };

  const handleDeleteJob = async (jobId) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setJobs(jobs.filter((job) => job.id !== jobId));
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting job');
    }
  };

  const handleBanUser = async (userId) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/admin/users/${userId}/ban`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setUsers(users.map((user) => (user.id === userId ? response.data : user)));
    } catch (err) {
      setError(err.response?.data?.message || 'Error banning user');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="container p-6"
    >
      <h2>Admin Dashboard</h2>
      {loading ? (
        <div className="text-center py-4">
          <svg className="animate-spin h-8 w-8 mx-auto text-[var(--cta-primary)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : error ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="error animate-fadeIn"
          role="alert"
        >
          {error}
        </motion.p>
      ) : (
        <>
          <h3>Manage Jobs</h3>
          {jobs.length === 0 ? (
            <p className="text-center py-4">No jobs to review.</p>
          ) : (
            <div className="overflow-x-auto mb-8">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Company</th>
                    <th>Posted By</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job.id}>
                      <td>{job.title}</td>
                      <td>{job.company}</td>
                      <td>{job.recruiter?.name || 'Unknown'}</td>
                      <td>
                        {job.isApproved ? (
                          <span className="text-[var(--success)]">Approved</span>
                        ) : (
                          <span className="text-[var(--error)]">Pending</span>
                        )}
                      </td>
                      <td>
                        {!job.isApproved && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleApproveJob(job.id)}
                            className="btn-primary mr-2"
                            aria-label={`Approve job ${job.id}`}
                          >
                            Approve
                          </motion.button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDeleteJob(job.id)}
                          className="btn-secondary"
                          aria-label={`Delete job ${job.id}`}
                        >
                          Delete
                        </motion.button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <h3>Manage Users</h3>
          {users.length === 0 ? (
            <p className="text-center py-4">No users found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>
                        {user.isBanned ? (
                          <span className="text-[var(--error)]">Banned</span>
                        ) : (
                          <span className="text-[var(--success)]">Active</span>
                        )}
                      </td>
                      <td>
                        {!user.isBanned && user.role !== 'admin' && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleBanUser(user.id)}
                            className="btn-secondary"
                            aria-label={`Ban user ${user.id}`}
                          >
                            Ban
                          </motion.button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}

export default AdminDashboard;