import React from 'react';
import { motion } from 'framer-motion'; // Added for animations
import RegisterForm from '../components/RegisterForm.jsx';

function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center ">

    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md "
    >
      <RegisterForm />
    </motion.div>

    </div>
  );
}

export default RegisterPage;