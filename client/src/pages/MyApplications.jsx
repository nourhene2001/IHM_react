import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Messages from '../components/messages.jsx';

function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState('');
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/jobs/my-applications', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setApplications(response.data);
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError(err.response?.data?.message || 'Error fetching applications');
      }
    };
    fetchApplications();
  }, []);

  const handleWithdraw = async (applicationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/jobs/applications/${applicationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApplications(applications.filter((app) => app.id !== applicationId));
    } catch (err) {
      console.error('Error withdrawing application:', err);
      setError(err.response?.data?.message || 'Error withdrawing application');
    }
  };

  const toggleMessages = (applicationId) => {
    setSelectedApplicationId(
      selectedApplicationId === applicationId ? null : applicationId
    );
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">My Applications</h2>
      {error && (
        <p className="text-red-500 mb-4 bg-red-100 p-2 rounded">{error}</p>
      )}
      {applications.length === 0 ? (
        <p className="text-gray-600">You haven't applied to any jobs yet.</p>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <div key={application.id} className="p-4 bg-white rounded-lg shadow-md">
              <h3 className="text-lg font-semibold">
                {application.job.title} at {application.job.company}
              </h3>
              <p className="text-gray-600">Location: {application.job.location}</p>
              <p className="text-gray-600">
                Status: <span className="capitalize">{application.status}</span>
              </p>
              <p className="text-gray-600">
                Applied on: {new Date(application.appliedAt).toLocaleDateString()}
              </p>
              <p className="text-gray-600">
                Recruiter: {application.job.recruiter.name}
              </p>
              <div className="mt-2 space-x-2">
                <button
                  onClick={() => toggleMessages(application.id)}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  {selectedApplicationId === application.id ? 'Hide Messages' : 'View Messages'}
                </button>
                {application.status === 'pending' && (
                  <button
                    onClick={() => handleWithdraw(application.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Withdraw Application
                  </button>
                )}
              </div>
              {selectedApplicationId === application.id && (
                <Messages
                  applicationId={application.id}
                  userRole="candidate"
                  candidateId={application.candidateId}
                  recruiterId={application.job.recruiterId}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyApplications;