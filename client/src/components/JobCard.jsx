import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import axios from 'axios';

function JobCard({ job }) {
  const { user } = useContext(AuthContext);

  const handleApply = async () => {
    try {
      await axios.post('http://localhost:5000/api/jobs/apply', { jobId: job.id }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      alert('Application submitted!');
    } catch (err) {
      alert(err.response.data.message || 'Error applying to job');
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <h3 className="text-xl font-bold">{job.title}</h3>
      <p className="text-gray-600">{job.company} - {job.location}</p>
      <p className="text-gray-600">{job.contract}</p>
      <p className="mt-2">{job.description}</p>
      {user && user.role === 'candidate' && (
        <button
          onClick={handleApply}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Apply
        </button>
      )}
    </div>
  );
}

export default JobCard;
