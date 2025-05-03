import React from 'react';
import { motion } from 'framer-motion'; // Added for animations
import RegisterForm from '../components/RegisterForm.jsx';

function RegisterPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="container py-8"
    >
      <RegisterForm />
    </motion.div>
  );
}

export default RegisterPage;