import React from 'react';
import { motion } from 'framer-motion';
import LoginForm from '../components/LoginForm.jsx';

function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center ">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md "
      >
        <LoginForm />
      </motion.div>
    </div>
  );
}

export default LoginPage;