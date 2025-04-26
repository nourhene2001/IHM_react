import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import JobForm from '../components/JobForm.jsx';
import { Navigate } from 'react-router-dom';

function JobPost() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <p>Loading...</p>;
  if (!user || user.role !== 'recruiter') return <Navigate to="/" />;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Post a New Job</h2>
      <JobForm />
    </div>
  );
}

export default JobPost;
