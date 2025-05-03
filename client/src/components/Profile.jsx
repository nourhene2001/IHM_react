import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion'; // Added for animations
import axios from 'axios';
import { AuthContext } from '../context/AuthContext.jsx';

function Profile() {
  const { user } = useContext(AuthContext);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put('http://localhost:5000/api/users/me', { name, email }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setSuccess('Profile updated successfully 🌟');
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      setSuccess('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="card max-w-md mx-auto"
    >
      <h2>Profile</h2>
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="toast error animate-fadeIn"
        >
          {error}
        </motion.div>
      )}
      {success && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="toast success animate-fadeIn"
        >
          {success}
        </motion.div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-group name">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="form-input"
            placeholder=" "
            required
            id="name"
          />
          <label htmlFor="name" className="form-label">Name</label>
        </div>
        <div className="form-group email">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-input"
            placeholder=" "
            required
            id="email"
          />
          <label htmlFor="email" className="form-label">Email</label>
        </div>
        <button
          type="submit"
          className="btn btn-primary w-full"
          aria-label="Update profile"
        >
          Update Profile
        </button>
      </form>
    </motion.div>
  );
}

export default Profile;