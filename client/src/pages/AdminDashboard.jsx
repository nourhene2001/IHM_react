import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalJobs: 0,
    totalCompanies: 0,
    totalApplications: 0,
    recentUsers: [],
    recentJobs: []
  });
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [processingJobs, setProcessingJobs] = useState({});

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/login');
      } else if (user.role !== 'admin') {
        navigate('/');
      }
    }
  }, [user, authLoading, navigate]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    filterData(e.target.value, filter);
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    filterData(searchTerm, e.target.value);
  };

  const filterData = (searchTerm, filter) => {
    let filteredUsers = users;
    if (searchTerm) {
      filteredUsers = filteredUsers.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filter !== 'all') {
      filteredUsers = filteredUsers.filter(user => 
        filter === 'active' ? !user.isBanned :
        filter === 'banned' ? user.isBanned :
        user.role === filter
      );
    }
    setFilteredUsers(filteredUsers);

    let filteredJobs = jobs;
    if (searchTerm) {
      filteredJobs = filteredJobs.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        job.company.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filter !== 'all') {
      filteredJobs = filteredJobs.filter(job => 
        filter === 'active' ? job.status === 'active' :
        filter === 'pending' ? job.status === 'pending' :
        true
      );
    }
    setFilteredJobs(filteredJobs);
  };

  const handleBanUser = async (userId) => {
    try {
      const targetUser = users.find(u => u.id === userId);
      if (targetUser.role === 'admin') {
        setError('Cannot ban an admin user.');
        return;
      }
      await axios.patch(
        `http://localhost:5000/api/admin/users/${userId}/ban`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to ban user');
    }
  };

  const handleUnbanUser = async (userId) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/admin/users/${userId}/unban`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to unban user');
    }
  };

  const handleApproveJob = async (jobId) => {
    try {
      setProcessingJobs(prev => ({ ...prev, [jobId]: 'approving' }));
      
      // Optimistic update
      const updatedJobs = jobs.map(job => 
        job.id === jobId ? { ...job, status: 'active', isApproved: true } : job
      );
      setJobs(updatedJobs);
      setFilteredJobs(updatedJobs.filter(job => 
        filter === 'all' || 
        (filter === 'active' && job.status === 'active') ||
        (filter === 'pending' && job.status === 'pending')
      ));

      const response = await axios.patch(
        `http://localhost:5000/api/admin/jobs/${jobId}/approve`,
        {},
        { 
          headers: { Authorization: `Bearer ${user.token}` },
          timeout: 10000
        }
      );
      
      if (!response.data.success) {
        // Revert if failed
        setJobs(jobs);
        setFilteredJobs(filteredJobs);
        setError(response.data.message || 'Failed to approve job');
      }
    } catch (err) {
      console.error('Approval error:', err);
      // Revert on error
      setJobs(jobs);
      setFilteredJobs(filteredJobs);
      setError(err.response?.data?.message || 'Failed to approve job');
    } finally {
      setProcessingJobs(prev => ({ ...prev, [jobId]: undefined }));
    }
  };

  const handleRejectJob = async (jobId) => {
    try {
      setProcessingJobs(prev => ({ ...prev, [jobId]: 'rejecting' }));
      
      // Optimistic update
      const updatedJobs = jobs.map(job => 
        job.id === jobId ? { ...job, status: 'rejected', isApproved: false } : job
      );
      setJobs(updatedJobs);
      setFilteredJobs(updatedJobs.filter(job => 
        filter === 'all' || 
        (filter === 'active' && job.status === 'active') ||
        (filter === 'pending' && job.status === 'pending')
      ));

      const response = await axios.patch(
        `http://localhost:5000/api/admin/jobs/${jobId}/reject`,
        {},
        { 
          headers: { Authorization: `Bearer ${user.token}` },
          timeout: 10000
        }
      );
      
      if (!response.data.success) {
        // Revert if failed
        setJobs(jobs);
        setFilteredJobs(filteredJobs);
        setError(response.data.message || 'Failed to reject job');
      }
    } catch (err) {
      console.error('Rejection error:', err);
      // Revert on error
      setJobs(jobs);
      setFilteredJobs(filteredJobs);
      setError(err.response?.data?.message || 'Failed to reject job');
    } finally {
      setProcessingJobs(prev => ({ ...prev, [jobId]: undefined }));
    }
  };

  const handleDeleteJob = async (jobId) => {
    try {
      setProcessingJobs(prev => ({ ...prev, [jobId]: 'deleting' }));
      
      await axios.delete(
        `http://localhost:5000/api/admin/jobs/${jobId}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      
      // Remove from state
      const updatedJobs = jobs.filter(job => job.id !== jobId);
      setJobs(updatedJobs);
      setFilteredJobs(updatedJobs.filter(job => 
        filter === 'all' || 
        (filter === 'active' && job.status === 'active') ||
        (filter === 'pending' && job.status === 'pending')
      ));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete job');
    } finally {
      setProcessingJobs(prev => ({ ...prev, [jobId]: undefined }));
    }
  };

  const fetchData = async () => {
    if (!user || !user.token) {
      setError('No authentication token found. Please log in.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const api = axios.create({
        baseURL: 'http://localhost:5000/api/admin',
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      const [usersResponse, jobsResponse] = await Promise.all([
        api.get('/users').catch(err => {
          console.error('Users endpoint error:', err.response?.data || err.message);
          throw new Error('Failed to fetch users: ' + (err.response?.data?.message || err.message));
        }),
        api.get('/jobs').catch(err => {
          console.error('Jobs endpoint error:', err.response?.data || err.message);
          throw new Error('Failed to fetch jobs: ' + (err.response?.data?.message || err.message));
        })
      ]);

      const fetchedUsers = usersResponse.data.data || [];
      const fetchedJobs = jobsResponse.data.data || [];

      const nonAdminUsers = fetchedUsers.filter(u => u.role !== 'admin');
      const processedJobs = fetchedJobs.map(job => ({
        ...job,
        status: job.isApproved ? 'active' : (job.status === 'rejected' ? 'rejected' : 'pending')
      }));

      setUsers(nonAdminUsers.map(user => ({
        ...user,
        status: user.isBanned ? 'banned' : 'active'
      })));
      setJobs(processedJobs);
      setFilteredUsers(nonAdminUsers.map(user => ({
        ...user,
        status: user.isBanned ? 'banned' : 'active'
      })));
      setFilteredJobs(processedJobs);

      const uniqueCompanies = new Set(fetchedJobs.map(job => job.company)).size;
      const totalApplications = fetchedJobs.reduce(
        (sum, job) => sum + (job.applications || 0),
        0
      );

      setStats({
        totalUsers: nonAdminUsers.length,
        totalJobs: fetchedJobs.length,
        totalCompanies: uniqueCompanies,
        totalApplications,
        recentUsers: fetchedUsers.slice(0, 5).map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          joinedAt: user.createdAt,
          isBanned: user.isBanned,
          status: user.isBanned ? 'banned' : 'active'
        })),
        recentJobs: fetchedJobs.slice(0, 5).map(job => ({
          id: job.id,
          title: job.title,
          company: job.company,
          postedAt: job.createdAt,
          status: job.isApproved ? 'active' : (job.status === 'rejected' ? 'rejected' : 'pending'),
          applications: job.applications || 0
        }))
      });
    } catch (err) {
      console.error('Dashboard error:', err);
      setError(
        err.response?.data?.message || 
        err.message || 
        'Failed to load dashboard data'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user && user.role === 'admin') {
      fetchData();
    }
  }, [authLoading, user]);

  const formatDate = (dateString) => {
    if (!dateString || isNaN(new Date(dateString))) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button
          onClick={fetchData}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.h1 
        className="text-3xl font-bold text-center mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Admin Dashboard
      </motion.h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
          {error}
          <button
            className="ml-4 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => setError(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="mb-10">
        <div className="flex flex-wrap gap-2">
          <button
            className={`px-4 py-2 rounded transition-colors ${
              activeTab === 'overview'
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            <i className="fas fa-chart-line mr-2"></i>
            Overview
          </button>
          <button
            className={`px-4 py-2 rounded transition-colors ${
              activeTab === 'users'
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setActiveTab('users')}
          >
            <i className="fas fa-users mr-2"></i>
            Users
          </button>
          <button
            className={`px-4 py-2 rounded transition-colors ${
              activeTab === 'jobs'
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setActiveTab('jobs')}
          >
            <i className="fas fa-briefcase mr-2"></i>
            Jobs
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <i className="fas fa-spinner animate-spin h-8 w-8 mx-auto text-blue-500"></i>
          <p className="mt-4">Loading dashboard data...</p>
        </div>
      ) : (
        <>
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                <div className="bg-white p-6 rounded-lg shadow-md bg-blue-50 border-l-4 border-blue-500">
                  <div className="flex items-center">
                    <div className="rounded-full bg-blue-100 p-3">
                      <i className="fas fa-users text-xl text-blue-700"></i>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold">Total Users</h3>
                      <p className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md bg-green-50 border-l-4 border-green-500">
                  <div className="flex items-center">
                    <div className="rounded-full bg-green-100 p-3">
                      <i className="fas fa-briefcase text-xl text-green-700"></i>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold">Total Jobs</h3>
                      <p className="text-2xl font-bold">{stats.totalJobs.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md bg-yellow-50 border-l-4 border-yellow-500">
                  <div className="flex items-center">
                    <div className="rounded-full bg-yellow-100 p-3">
                      <i className="fas fa-building text-xl text-yellow-700"></i>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold">Companies</h3>
                      <p className="text-2xl font-bold">{stats.totalCompanies.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md bg-purple-50 border-l-4 border-purple-500">
                  <div className="flex items-center">
                    <div className="rounded-full bg-purple-100 p-3">
                      <i className="fas fa-file-alt text-xl text-purple-700"></i>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold">Applications</h3>
                      <p className="text-2xl font-bold">{stats.totalApplications.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold mb-4">Recently Joined Users</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-2 text-left">Name</th>
                          <th className="p-2 text-left">Role</th>
                          <th className="p-2 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recentUsers.length === 0 ? (
                          <tr>
                            <td colSpan="3" className="text-center py-4">
                              No recent users
                            </td>
                          </tr>
                        ) : (
                          stats.recentUsers.map(user => (
                            <tr key={user.id} className="border-b py-6">
                              <td className="p-2">
                                <div className="font-medium">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </td>
                              <td className="p-2">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${
                                    user.role === 'candidate'
                                      ? 'bg-blue-100 text-blue-800'
                                      : user.role === 'recruiter'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}
                                >
                                  {user.role}
                                </span>
                              </td>
                              <td className="p-2">
                                <div className="flex space-x-2">
                                  {user.role !== 'admin' && (
                                    user.status === 'active' ? (
                                      <button
                                        className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 flex items-center gap-1"
                                        onClick={() => handleBanUser(user.id)}
                                        title="Ban User"
                                      >
                                        <i className="fas fa-user-times"></i>
                                        <span className="text-sm">Ban</span>
                                      </button>
                                    ) : (
                                      <button
                                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center gap-1"
                                        onClick={() => handleUnbanUser(user.id)}
                                        title="Unban User"
                                      >
                                        <i className="fas fa-user-check"></i>
                                        <span className="text-sm">Unban</span>
                                      </button>
                                    )
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold mb-4">Recently Posted Jobs</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-2 text-left">Job Title</th>
                          <th className="p-2 text-left">Company</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recentJobs.length === 0 ? (
                          <tr>
                            <td colSpan="3" className="text-center py-4">
                              No recent jobs
                            </td>
                          </tr>
                        ) : (
                          stats.recentJobs.map(job => (
                            <tr key={job.id} className="border-b py-6">
                              <td className="p-2 font-medium">{job.title}</td>
                              <td className="p-2">{job.company}</td>
                             
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    <input
                      type="text"
                      placeholder="Search users..."
                      className="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10"
                      value={searchTerm}
                      onChange={handleSearch}
                    />
                  </div>
                  <div className="w-full md:w-48">
                    <select
                      className="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={filter}
                      onChange={handleFilterChange}
                    >
                      <option value="all">All Users</option>
                      <option value="active">Active</option>
                      <option value="banned">Banned</option>
                      <option value="candidate">Candidates</option>
                      <option value="recruiter">Recruiters</option>
                    </select>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-2 text-left">Name</th>
                        <th className="p-2 text-left">Email</th>
                        <th className="p-2 text-left">Role</th>
                        <th className="p-2 text-left">Status</th>
                        <th className="p-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center py-4">
                            No users found
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map(user => (
                          <tr key={user.id} className="border-b py-6">
                            <td className="p-2 font-medium">{user.name}</td>
                            <td className="p-2">{user.email}</td>
                            <td className="p-2">
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  user.role === 'candidate'
                                    ? 'bg-blue-100 text-blue-800'
                                    : user.role === 'recruiter'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {user.role}
                              </span>
                            </td>
                            <td className="p-2">
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  user.status === 'active'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {user.status}
                              </span>
                            </td>
                            <td className="p-2">
                              <div className="flex space-x-2">
                                {user.status === 'active' ? (
                                  <button
                                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 flex items-center gap-1"
                                    onClick={() => handleBanUser(user.id)}
                                    title="Ban User"
                                  >
                                    <i className="fas fa-user-times"></i>
                                    <span className="text-sm">Ban</span>
                                  </button>
                                ) : (
                                  <button
                                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center gap-1"
                                    onClick={() => handleUnbanUser(user.id)}
                                    title="Unban User"
                                  >
                                    <i className="fas fa-user-check"></i>
                                    <span className="text-sm">Unban</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'jobs' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    <input
                      type="text"
                      placeholder="Search jobs..."
                      className="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10"
                      value={searchTerm}
                      onChange={handleSearch}
                    />
                  </div>
                  <div className="w-full md:w-48">
                    <select
                      className="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={filter}
                      onChange={handleFilterChange}
                    >
                      <option value="all">All Jobs</option>
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-2 text-left">Job Title</th>
                        <th className="p-2 text-left">Company</th>
                        <th className="p-2 text-left">Location</th>
                        <th className="p-2 text-left">Applications</th>
                        <th className="p-2 text-left">Status</th>
                        <th className="p-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredJobs.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center py-4">
                            No jobs found
                          </td>
                        </tr>
                      ) : (
                        filteredJobs.map(job => (
                          <tr key={job.id} className="border-b py-6">
                            <td className="p-2 font-medium">{job.title}</td>
                            <td className="p-2">{job.company}</td>
                            <td className="p-2">{job.location}</td>
                            <td className="p-2">{job.applications}</td>
                            <td className="p-2">
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  job.status === 'active' ? 'bg-green-100 text-green-800' :
                                  job.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}
                              >
                                {job.status}
                              </span>
                            </td>
                            <td className="p-2">
                              <div className="flex space-x-2">
                                {job.status === 'pending' ? (
                                  <>
                                    <button
                                      className={`bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center gap-1 ${
                                        processingJobs[job.id] === 'approving' ? 'opacity-50 cursor-not-allowed' : ''
                                      }`}
                                      onClick={() => handleApproveJob(job.id)}
                                      disabled={processingJobs[job.id] === 'approving'}
                                      title="Approve Job"
                                    >
                                      {processingJobs[job.id] === 'approving' ? (
                                        <i className="fas fa-spinner animate-spin"></i>
                                      ) : (
                                        <>
                                          <i className="fas fa-check"></i>
                                          <span className="text-sm">Approve</span>
                                        </>
                                      )}
                                    </button>
                                    <button
                                      className={`bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex items-center gap-1 ${
                                        processingJobs[job.id] === 'rejecting' ? 'opacity-50 cursor-not-allowed' : ''
                                      }`}
                                      onClick={() => handleRejectJob(job.id)}
                                      disabled={processingJobs[job.id] === 'rejecting'}
                                      title="Reject Job"
                                    >
                                      {processingJobs[job.id] === 'rejecting' ? (
                                        <i className="fas fa-spinner animate-spin"></i>
                                      ) : (
                                        <>
                                          <i className="fas fa-times"></i>
                                          <span className="text-sm">Reject</span>
                                        </>
                                      )}
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    className={`bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex items-center gap-1 ${
                                      processingJobs[job.id] === 'deleting' ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                    onClick={() => handleDeleteJob(job.id)}
                                    disabled={processingJobs[job.id] === 'deleting'}
                                    title="Delete Job"
                                  >
                                    {processingJobs[job.id] === 'deleting' ? (
                                      <i className="fas fa-spinner animate-spin"></i>
                                    ) : (
                                      <>
                                        <i className="fas fa-trash"></i>
                                        <span className="text-sm">Delete</span>
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}

export default AdminDashboard;