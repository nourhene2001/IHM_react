import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion'; // Added for animations
import { AuthContext } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

function RegisterForm() {
  const authContext = useContext(AuthContext);

  if (authContext === undefined || authContext === null || !authContext.register) {
    console.error('AuthContext is undefined or null. Check AuthProvider setup in index.jsx.');
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="card max-w-md mx-auto"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="toast error animate-fadeIn"
        >
          Authentication service is unavailable. Please check AuthContext setup.
        </motion.div>
      </motion.div>
    );
  }

  const { register } = authContext;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'candidate'
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(
        formData.name,
        formData.email,
        formData.password,
        formData.role
      );
      navigate('/');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="card max-w-md mx-auto"
    >
      <h2>Register</h2>
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
        <div className="form-group name">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
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
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="form-input"
            placeholder=" "
            required
            id="email"
          />
          <label htmlFor="email" className="form-label">Email</label>
        </div>
        <div className="form-group password">
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="form-input"
            placeholder=" "
            required
            id="password"
          />
          <label htmlFor="password" className="form-label">Password</label>
        </div>
        <div className="form-group">
              <label className="form-label">I am a:</label>
              <div className="mt-2 space-y-2">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="candidate"
                    checked={formData.role === 'candidate'}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600 border-neutral-300"
                  />
                  <span className="ml-2 text-neutral-700">Job Seeker</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="recruiter"
                    checked={formData.role === 'recruiter'}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600 border-neutral-300"
                  />
                  <span className="ml-2 text-neutral-700">Employer / Recruiter</span>
                </label>
              </div>
            </div>
          
       
        <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="h-4 w-4 text-primary-600 border-neutral-300 rounded"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-neutral-700">
              I agree to the{' '}
              <a href="#" className="text-primary-600 hover:text-primary-500">
                Terms and Conditions
              </a>{' '}
              and{' '}
              <a href="#" className="text-primary-600 hover:text-primary-500">
                Privacy Policy
              </a>
            </label>
          </div>
          
        <button
          type="submit"
          className="btn btn-primary w-full"
          aria-label="Register"
        >
          Register
        </button>
      </form>
    </motion.div>
  );
}

export default RegisterForm;