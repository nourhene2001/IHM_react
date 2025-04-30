import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import ApplyForm from './ApplyForm.jsx';

function JobCard({ job }) {
  const { user } = useContext(AuthContext);
  const [showApplyForm, setShowApplyForm] = useState(false);

  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <h3 className="text-xl font-bold">{job.title}</h3>
      <p className="text-gray-600">{job.company} - {job.location}</p>
      <p className="text-gray-600">{job.contract}</p>
      <p className="mt-2">{job.description}</p>
      {user && user.role === 'candidate' && (
        <button
          onClick={() => setShowApplyForm(true)}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Apply
        </button>
      )}
      {showApplyForm && (
        <ApplyForm jobId={job.id} onClose={() => setShowApplyForm(false)} />
      )}
    </div>
  );
}

export default JobCard;