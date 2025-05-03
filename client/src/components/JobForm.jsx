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
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

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
      setError(err.response?.data?.message || 'Something went wrong. Please try again 🥲');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <h2 className="text-xl font-semibold text-center text-pink-600">✨ Job Details ✨</h2>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-100 text-red-700 p-3 rounded-md text-sm"
        >
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {[
          { id: 'title', label: 'Job Title', value: title, setValue: setTitle, type: 'text', required: true },
          { id: 'company', label: 'Company Name', value: company, setValue: setCompany, type: 'text', required: true },
          { id: 'location', label: 'Location', value: location, setValue: setLocation, type: 'text', required: true },
          { id: 'salary', label: 'Salary (optional)', value: salary, setValue: setSalary, type: 'text' },
        ].map(({ id, label, value, setValue, type, required }) => (
          <div key={id} className="form-group">
            <label htmlFor={id} className="form-label block mb-1 text-sm font-medium text-pink-600">
              {label}
            </label>
            <input
              id={id}
              type={type}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="form-input w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-300 outline-none"
              required={required}
              placeholder={`Enter ${label.toLowerCase()}`}
            />
          </div>
        ))}

        <div className="form-group">
          <label htmlFor="description" className="form-label block mb-1 text-sm font-medium text-pink-600">
            Job Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="form-input w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-300 outline-none min-h-[100px]"
            placeholder="Tell candidates what this role is about..."
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="requirements" className="form-label block mb-1 text-sm font-medium text-pink-600">
            Requirements (optional)
          </label>
          <textarea
            id="requirements"
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            className="form-input w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-300 outline-none min-h-[80px]"
            placeholder="e.g., 2+ years experience, React knowledge..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="contract" className="form-label block mb-1 text-sm font-medium text-pink-600">
            Contract Type
          </label>
          <select
            id="contract"
            value={contract}
            onChange={(e) => setContract(e.target.value)}
            className="form-input w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-300 outline-none"
          >
            <option value="full-time">Full-Time</option>
            <option value="part-time">Part-Time</option>
            <option value="contract">Contract</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-pink-500 text-white font-semibold rounded-lg hover:bg-pink-600 transition duration-300 disabled:opacity-50"
          disabled={submitting}
        >
          {submitting ? 'Posting...' : 'Post Job'}
        </button>
      </form>
    </motion.div>
  );
}

export default JobForm;
