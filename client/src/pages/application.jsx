import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Application() {
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMyJobs = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/jobs/my-jobs', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setMyJobs(response.data);
      } catch (err) {
        console.error('Error fetching your jobs:', err);
        setError('Error fetching your jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchMyJobs();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-semibold text-blue-600 mb-6">My Job Applications</h2>

      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-500 py-4">{error}</div>
      ) : myJobs.length === 0 ? (
        <div className="text-center py-4 text-gray-600">You haven't posted any jobs yet.</div>
      ) : (
        myJobs.map((job) => (
          <div key={job.id} className="bg-white shadow-lg rounded-lg mb-6 p-6">
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">{job.title}</h3>
            <p className="text-gray-600 mb-4">{job.company} - {job.location}</p>

            {job.applications.length === 0 ? (
              <div className="text-gray-500">No applicants yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Candidate Name</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Applied At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {job.applications.map((application) => (
                      <tr key={application.id} className="border-t hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-700">{application.candidate.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{application.candidate.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{new Date(application.appliedAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default Application;
