import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalJobs: 0,
    totalCompanies: 0,
    totalApplications: 0,
    recentUsers: [],
    recentJobs: [],
  });
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch users
        const usersResponse = await axios.get('/api/admin/users', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const fetchedUsers = usersResponse.data;

        // Fetch jobs
        const jobsResponse = await axios.get('/api/admin/jobs', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const fetchedJobs = jobsResponse.data;

        // Calculate stats
        const uniqueCompanies = new Set(fetchedJobs.map(job => job.company)).size;
        const totalApplications = fetchedJobs.reduce(
          (sum, job) => sum + (job.applications?.length || 0),
          0
        );

        setStats({
          totalUsers: fetchedUsers.length,
          totalJobs: fetchedJobs.length,
          totalCompanies: uniqueCompanies,
          totalApplications,
          recentUsers: fetchedUsers
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5)
            .map(user => ({
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              joinedAt: user.createdAt,
            })),
          recentJobs: fetchedJobs
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5)
            .map(job => ({
              id: job.id,
              title: job.title,
              company: job.company,
              postedAt: job.createdAt,
              status: job.isApproved ? 'active' : 'pending',
            })),
        });

        setUsers(
          fetchedUsers.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.isBanned ? 'banned' : 'active',
            joinedAt: user.createdAt,
          }))
        );

        setJobs(
          fetchedJobs.map(job => ({
            id: job.id,
            title: job.title,
            company: job.company,
            location: job.location,
            status: job.isApproved ? 'active' : 'pending',
            applications: job.applications?.length || 0,
            postedAt: job.createdAt,
          }))
        );

        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || 'Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleSearch = e => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = e => {
    setFilter(e.target.value);
  };

  const handleBanUser = async userId => {
    try {
      await axios.put(
        `/api/admin/users/${userId}/ban`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setUsers(users.map(user =>
        user.id === userId ? { ...user, status: 'banned' } : user
      ));
    } catch (err) {
      console.error('Error banning user:', err);
      setError(err.response?.data?.message || 'Failed to ban user');
    }
  };

  const handleUnbanUser = async userId => {
    try {
      await axios.put(
        `/api/admin/users/${userId}/unban`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setUsers(users.map(user =>
        user.id === userId ? { ...user, status: 'active' } : user
      ));
    } catch (err) {
      console.error('Error unbanning user:', err);
      setError(err.response?.data?.message || 'Failed to unban user');
    }
  };

  const handleApproveJob = async jobId => {
    try {
      await axios.put(
        `/api/admin/jobs/${jobId}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setJobs(jobs.map(job =>
        job.id === jobId ? { ...user, status: 'active' } : job
      ));
      setStats(prev => ({
        ...prev,
        recentJobs: prev.recentJobs.map(job =>
          job.id === jobId ? { ...job, status: 'active' } : job
        ),
      }));
    } catch (err) {
      console.error('Error approving job:', err);
      setError(err.response?.data?.message || 'Failed to approve job');
    }
  };

  const handleDeleteJob = async jobId => {
    try {
      await axios.delete(`/api/admin/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setJobs(jobs.filter(job => job.id !== jobId));
      setStats(prev => ({
        ...prev,
        totalJobs: prev.totalJobs - 1,
        recentJobs: prev.recentJobs.filter(job => job.id !== jobId),
      }));
    } catch (err) {
      console.error('Error deleting job:', err);
      setError(err.response?.data?.message || 'Failed to delete job');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    if (filter === 'all') return matchesSearch;
    if (filter === 'active') return matchesSearch && user.status === 'active';
    if (filter === 'banned') return matchesSearch && user.status === 'banned';
    if (filter === 'candidate') return matchesSearch && user.role === 'candidate';
    if (filter === 'recruiter') return matchesSearch && user.role === 'recruiter';
    if (filter === 'admin') return matchesSearch && user.role === 'admin';
    return matchesSearch;
  });

  const filteredJobs = jobs.filter(job => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase());
    if (filter === 'all') return matchesSearch;
    if (filter === 'active') return matchesSearch && job.status === 'active';
    if (filter === 'pending') return matchesSearch && job.status === 'pending';
    return matchesSearch;
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.h1
        className="text-3xl font-bold text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Admin Dashboard
      </motion.h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="mb-8">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold mb-4">Recently Joined Users</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-2 text-left">Name</th>
                          <th className="p-2 text-left">Role</th>
                          <th className="p-2 text-left">Joined</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recentUsers.map(user => (
                          <tr key={user.id} className="border-b">
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
                            <td className="p-2">{formatDate(user.joinedAt)}</td>
                          </tr>
                        ))}
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
                          <th className="p-2 text-left">Posted</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recentJobs.map(job => (
                          <tr key={job.id} className="border-b">
                            <td className="p-2 font-medium">{job.title}</td>
                            <td className="p-2">{job.company}</td>
                            <td className="p-2">{formatDate(job.postedAt)}</td>
                          </tr>
                        ))}
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
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <div className="flex flex-col md:flex-row gap-4 mb-4">
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
                      <option value="admin">Admins</option>
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
                        <th className="p-2 text-left">Joined</th>
                        <th className="p-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center py-4">
                            No users found
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map(user => (
                          <tr key={user.id} className="border-b">
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
                            <td className="p-2">{formatDate(user.joinedAt)}</td>
                            <td className="p-2">
                              <div className="flex space-x-2">
                                {user.status === 'active' ? (
                                  <button
                                    className="text-yellow-500 hover:text-yellow-700"
                                    onClick={() => handleBanUser(user.id)}
                                    title="Ban User"
                                  >
                                    <i className="fas fa-user-times"></i>
                                  </button>
                                ) : (
                                  <button
                                    className="text-green-500 hover:text-green-700"
                                    onClick={() => handleUnbanUser(user.id)}
                                    title="Unban User"
                                  >
                                    <i className="fas fa-user-check"></i>
                                  </button>
                                )}
                                {/* Delete user not supported by backend */}
                                {/* <button
                                  className="text-red-500 hover:text-red-700"
                                  onClick={() => handleDeleteUser(user.id)}
                                  title="Delete User"
                                >
                                  <i className="fas fa-trash"></i>
                                </button> */}
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
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <div className="flex flex-col md:flex-row gap-4 mb-4">
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
                        <th className="p-2 text-left">Posted</th>
                        <th className="p-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredJobs.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="text-center py-4">
                            No jobs found
                          </td>
                        </tr>
                      ) : (
                        filteredJobs.map(job => (
                          <tr key={job.id} className="border-b">
                            <td className="p-2 font-medium">{job.title}</td>
                            <td className="p-2">{job.company}</td>
                            <td className="p-2">{job.location}</td>
                            <td className="p-2">{job.applications}</td>
                            <td className="p-2">
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  job.status === 'active'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {job.status}
                              </span>
                            </td>
                            <td className="p-2">{formatDate(job.postedAt)}</td>
                            <td className="p-2">
                              <div className="flex space-x-2">
                                {job.status === 'pending' && (
                                  <button
                                    className="text-green-500 hover:text-green-700"
                                    onClick={() => handleApproveJob(job.id)}
                                    title="Approve Job"
                                  >
                                    <i className="fas fa-check"></i>
                                  </button>
                                )}
                                <button
                                  className="text-red-500 hover:text-red-700"
                                  onClick={() => handleDeleteJob(job.id)}
                                  title="Delete Job"
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
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