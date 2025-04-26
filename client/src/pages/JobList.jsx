import React, { useState, useEffect } from 'react';
import axios from 'axios';
import JobCard from '../components/JobCard.jsx';
import JobFilter from '../components/JobFilter.jsx';

function JobList() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchJobs = async (filters = {}) => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:5000/api/jobs', { params: filters });
      setJobs(response.data);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Error fetching jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleFilter = (filters) => {
    fetchJobs(filters);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Job Listings</h2>
      <JobFilter onFilter={handleFilter} />
      {loading ? (
        <p>Loading...</p>
      ) : jobs.length === 0 ? (
        <p>No jobs found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map(job => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}

export default JobList;
