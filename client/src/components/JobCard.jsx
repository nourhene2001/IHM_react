import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { motion } from 'framer-motion';

function JobCard({ job }) {
  const { user } = useContext(AuthContext);

  return (
    <motion.div
      className="hover:cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link
        to={`/jobs/${job.id}`}
        className="block card bg-white p-6 rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-2 transition-all duration-300 border border-gray-100"
        role="article"
        aria-labelledby={`job-title-${job.id}`}
      >
        <h3 id={`job-title-${job.id}`} className="text-2xl font-semibold mb-3 text-blue-700">
          💼 {job.title}
        </h3>
        <p className="text-neutral-600 mb-1">
          🏢 <strong>{job.company}</strong>
        </p>
        <p className="text-neutral-600 mb-2">
          📍 {job.location}
        </p>
        <p className="text-sm text-neutral-500 italic mb-4">
          {job.contract.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </p>
        <p className="mt-2 whitespace-pre-wrap text-neutral-700">
          💬 {job.description}
        </p>
        {user && user.role === 'candidate' && (
          <p className="mt-4 text-primary-600 font-medium">👀 Tap to view more!</p>
        )}
      </Link>
    </motion.div>
  );
}

export default JobCard;
