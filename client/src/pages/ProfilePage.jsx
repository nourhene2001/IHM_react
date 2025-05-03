import React, { useContext } from 'react';
import { motion } from 'framer-motion'; // Added for animations
import { AuthContext } from '../context/AuthContext.jsx';
import Profile from '../components/Profile.jsx';
import { Navigate } from 'react-router-dom';

function ProfilePage() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="container text-center py-8">
        <svg className="spinner h-8 w-8 mx-auto text-[var(--cta-primary)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-2">Loading your profile... ✨</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="container py-8"
    >
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2>Your Profile</h2>
          <p>Manage your personal information 🌈</p>
        </div>
        <Profile />
      </div>
    </motion.div>
  );
}

export default ProfilePage;