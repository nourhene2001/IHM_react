import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion'; // Added for animations
import { AuthContext } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="card max-w-md mx-auto"
    >
      <h2>Login 🔐</h2>
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
        <div className="form-group email">
        <label htmlFor="email" className="form-label">Email 📧</label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-input"
            placeholder=" "
            required
            id="email"
          />
        </div>
        <div className="form-group password">
        <label htmlFor="password" className="form-label">Password 🔑</label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input"
            placeholder=" "
            required
            id="password"
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary w-full"
          aria-label="Login"
        >
          Login 🔓
        </button>
      </form>
    </motion.div>
  );
}

export default LoginForm;
