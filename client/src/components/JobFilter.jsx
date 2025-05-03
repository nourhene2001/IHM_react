import React, { useState } from 'react';
import { motion } from 'framer-motion';

function JobFilter({ onFilter }) {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [contract, setContract] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() && !location.trim() && !contract) {
      setError('Please provide at least one filter criterion');
      return;
    }
    setError('');
    onFilter({ title, location, contract });
    setSuccess('Filters applied successfully');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <form onSubmit={handleSubmit} aria-label="Job search filters">
        <div className="flex flex-col ">
        <label htmlFor="title" className="form-label">Job Title</label>

          {/* Job Title Field */}
          <div className="form-group">
            <input
              type="text"
              id="title"
              className="form-input"
              placeholder=" e.g : Tester "
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          {/* Location Field */}
          <div className="form-group">
          <label htmlFor="location" className="form-label">Location</label>

            <input
              type="text"
              id="location"
              className="form-input"
              placeholder=" e.g : Sfax "
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          
          {/* Contract Type Field */}
          <div className="form-group">
          <label htmlFor="contract" className="form-label">Contract Type</label>

            <select
              id="contract"
              className="form-input"
              value={contract}
              onChange={(e) => setContract(e.target.value)}
            >
              <option value="">All Contracts</option>
              <option value="full-time">Full-Time</option>
              <option value="part-time">Part-Time</option>
              <option value="contract">Contract</option>
            </select>
          </div>
          
          {/* Filter Button */}
          <button
            type="submit"
            className="btn btn-primary"
            aria-label="Apply filters"
          >
            Filter
          </button>
        </div>
        
        {/* Messages */}
        <div className="mt-2">
          {success && <p className="text-success-500 text-sm animate-fadeIn">{success}</p>}
          {error && <p className="text-error-500 text-sm animate-fadeIn">{error}</p>}
        </div>
      </form>
    </motion.div>
  );
}

export default JobFilter;