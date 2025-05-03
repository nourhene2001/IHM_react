import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function JobForm() {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [contract, setContract] = useState('full-time');
  const [requirements, setRequirements] = useState('');
  const [salary, setSalary] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/jobs', {
        title,
        company,
        location,
        description,
        contract,
        requirements: requirements || null,
        salary: salary || null,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      navigate('/jobs');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post job');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="card max-w-lg mx-auto"
    >
      <h2>Post a Job</h2>
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="toast error animate-fadeIn"
        >
          {error}
        </motion.div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="form-input"
            placeholder=" "
            required
            id="title"
          />
          <label htmlFor="title" className="form-label">Title</label>
        </div>
        <div className="form-group">
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="form-input"
            placeholder=" "
            required
            id="company"
          />
          <label htmlFor="company" className="form-label">Company</label>
        </div>
        <div className="form-group">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="form-input"
            placeholder=" "
            required
            id="location"
          />
          <label htmlFor="location" className="form-label">Location</label>
        </div>
        <div className="form-group">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="form-input min-h-[150px]"
            placeholder=" "
            required
            id="description"
          ></textarea>
          <label htmlFor="description" className="form-label">Description</label>
        </div>
        <div className="form-group">
          <textarea
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            className="form-input min-h-[100px]"
            placeholder=" "
            id="requirements"
          ></textarea>
          <label htmlFor="requirements" className="form-label">Requirements (optional)</label>
        </div>
        <div className="form-group">
          <input
            type="text"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            className="form-input"
            placeholder=" "
            id="salary"
          />
          <label htmlFor="salary" className="form-label">Salary (optional)</label>
        </div>
        <div className="form-group">
          <label htmlFor="contract" className="block mb-1 text-sm">Contract</label>
          <select
            value={contract}
            onChange={(e) => setContract(e.target.value)}
            className="form-input"
            id="contract"
          >
            <option value="full-time">Full-Time</option>
            <option value="part-time">Part-Time</option>
            <option value="contract">Contract</option>
          </select>
        </div>
        <button
          type="submit"
          className="btn btn-primary w-full"
          aria-label="Post job"
        >
          Post Job
        </button>
      </form>
    </motion.div>
  );
}

export default JobForm;