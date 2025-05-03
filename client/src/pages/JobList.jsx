import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import JobCard from '../components/JobCard.jsx';
import JobFilter from '../components/JobFilter.jsx';

function JobList() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    title: '',
    location: '',
    contract: ''
  });

  const fetchJobs = async (filters = {}) => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:5000/api/jobs', { params: filters });
      setJobs(response.data);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Unable to fetch jobs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleFilter = (newFilters) => {
    setFilters(newFilters);
    fetchJobs(newFilters);
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <br></br>
      {/* Hero Section */}
      <section className="mb-16" aria-label="Job search introduction">
        <div className="flex flex items lg:flex-row gap-12 items-center">
          {/* Left Side - Text Content */}
          <div className="lg:w-1/2">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold mb-6 text-neutral-900 leading-tight"
            >
              Find Your <span className="text-primary-600">Dream Job</span> Today <span role="img" aria-label="rocket">🚀</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-neutral-600 mb-8 leading-relaxed"
            >
              CareerConnect helps you discover the perfect opportunity tailored to your skills and aspirations. 
              Whether you're starting fresh or taking the next step in your career, we've got you covered. <span role="img" aria-label="handshake">🤝</span>
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-start gap-4">
                <div className="bg-primary-100 p-2 rounded-full">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <p className="text-neutral-700">Browse thousands of opportunities from top companies <span role="img" aria-label="briefcase">💼</span></p>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-primary-100 p-2 rounded-full">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <p className="text-neutral-700">Get matched with roles that fit your skills and experience <span role="img" aria-label="lightbulb">💡</span></p>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-primary-100 p-2 rounded-full">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <p className="text-neutral-700">Apply directly or save jobs for later <span role="img" aria-label="bookmark">🔖</span></p>
              </div>
            </motion.div>
          </div>
          
          {/* Right Side - Filter Card */}
          <div className="lg:w-1/2 w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card p-6 border border-neutral-100 shadow-lg"
            >
              <h2 className="text-2xl font-bold text-neutral-800 mb-6">Find Your Perfect Job <span role="img" aria-label="search">🔍</span></h2>
              <JobFilter onFilter={handleFilter} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Job List Section */}
      <section role="region" aria-label="Job listings">
        {loading ? (
          <div className="text-center py-8">
            <svg className="animate-spin h-10 w-10 mx-auto text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 text-lg text-neutral-600">Loading opportunities... <span role="img" aria-label="hourglass">⏳</span></p>
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="toast error text-center"
          >
            <div className="flex items-start justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="font-bold">Error</h4>
                <p>{error}</p>
                <button
                  className="btn btn-primary mt-2"
                  onClick={() => fetchJobs(filters)}
                  aria-label="Retry fetching jobs"
                >
                  Retry <span role="img" aria-label="refresh">🔄</span>
                </button>
              </div>
            </div>
          </motion.div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-neutral-600">No jobs found. Try adjusting your filters! <span role="img" aria-label="question">❓</span></p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </motion.div>
        )}
      </section>
    </main>
  );
}

export default JobList;
