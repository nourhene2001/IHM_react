import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { motion } from 'framer-motion';

function JobCard({ job }) {
  const { user } = useContext(AuthContext);

  return (
    <motion.div
      className="card p-6 hover:transform hover:-translate-y-2 transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      role="article"
      aria-labelledby={`job-title-${job.id}`}
    >
      <h3 id={`job-title-${job.id}`} className="text-xl font-bold mb-3">{job.title}</h3>
      <p className="text-neutral-600 mb-2">{job.company} - {job.location}</p>
      <p className="text-sm text-neutral-500 mb-4">
        {job.contract.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </p>
      <p className="mt-2 whitespace-pre-wrap text-neutral-700">{job.description}</p>
      
      {user && user.role === 'candidate' && (
        <Link
          to={`/jobs/${job.id}`}
          className="btn btn-primary mt-6"
          aria-label={`View details for ${job.title}`}
        >
          Check More About This Job
        </Link>
      )}
    </motion.div>
  );
}

export default JobCard;