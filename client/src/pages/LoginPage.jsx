import React from 'react';
import { motion } from 'framer-motion'; // Added for animations
import LoginForm from '../components/LoginForm.jsx';

function LoginPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="container py-8"
    >
      <LoginForm />
    </motion.div>
  );
}

export default LoginPage;