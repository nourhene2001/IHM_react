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
      className="container mx-auto p-6"
    >
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h2>
      {loading ? (
        <div className="text-center py-4">
          <svg className="animate-spin h-8 w-8 mx-auto text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : error ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-error mb-4 p-3 bg-red-100 rounded"
          role="alert"
        >
          {error}
        </motion.p>
      ) : (
        <>
          <h3 className="text-2xl font-semibold mb-4">Manage Jobs</h3>
          {jobs.length === 0 ? (
            <p className="text-center py-4 text-gray-600">No jobs to review.</p>
          ) : (
            <div className="overflow-x-auto mb-8">
              <table className="min-w-full table-auto">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Title</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Company</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Posted By</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job.id} className="border-t hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-700">{job.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{job.company}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{job.recruiter?.name || 'Unknown'}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {job.isApproved ? (
                          <span className="text-secondary">Approved</span>
                        ) : (
                          <span className="text-error">Pending</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {!job.isApproved && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleApproveJob(job.id)}
                            className="bg-secondary text-white px-3 py-1 rounded mr-2 hover:bg-green-700"
                          >
                            Approve
                          </motion.button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDeleteJob(job.id)}
                          className="bg-error text-white px-3 py-1 rounded hover:bg-red-700"
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

          <h3 className="text-2xl font-semibold mb-4">Manage Users</h3>
          {users.length === 0 ? (
            <p className="text-center py-4 text-gray-600">No users found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Role</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-t hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-700">{user.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{user.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{user.role}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {user.isBanned ? (
                          <span className="text-error">Banned</span>
                        ) : (
                          <span className="text-secondary">Active</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {!user.isBanned && user.role !== 'admin' && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleBanUser(user.id)}
                            className="bg-error text-white px-3 py-1 rounded hover:bg-red-700"
                          >
                            Ban
                          </motion.button>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
  {user.isBanned ? (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => handleUnbanUser(user.id)}
      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-700"
    >
      Unban
    </motion.button>
  ) : user.role !== 'admin' ? (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => handleBanUser(user.id)}
      className="bg-error text-white px-3 py-1 rounded hover:bg-red-700"
    >
      Ban
    </motion.button>
  ) : null}
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