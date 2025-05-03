import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Messages from '../components/messages.jsx';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile, faEnvelope, faCircleCheck, faBan, faBuilding, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';

function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState('');
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
  const [selectedLetterIndex, setSelectedLetterIndex] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/jobs/my-applications', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setApplications(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching applications');
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const handleWithdraw = async (applicationId) => {
    if (window.confirm('Are you sure you want to withdraw this application?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.delete(
          `http://localhost:5000/api/jobs/applications/${applicationId}`, 
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (response.status === 200) {
          setApplications(applications.filter(app => app.id !== applicationId));
          setError('');
        }
      } catch (err) {
        console.error('Withdrawal error:', err);
        setError(
          err.response?.data?.message || 
          err.message || 
          'Error withdrawing application'
        );
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'text-green-600';
      case 'rejected':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return faCircleCheck;
      case 'rejected':
        return faBan;
      default:
        return null;
    }
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto px-4 py-12 bg-gradient-to-b from-gray-50 to-gray-100"
    >
      <h2 className="text-4xl font-bold mb-12 text-center text-gray-800 cute-heading">My Job Applications</h2>

      {loading ? (
        <div className="text-center py-12">
          <div className="spinner h-8 w-8 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your applications...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-lg text-center border border-gray-200">
          <p className="text-gray-600 text-lg">You haven't applied to any jobs yet.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {applications.map((application, index) => (
            <motion.div
              key={application.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex flex-col md:flex-row md:items-center mb-6">
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold text-teal-600 mb-2">{application.job.title}</h3>
                  <div className="flex items-center text-gray-600 space-x-4">
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={faBuilding} className="mr-2 text-gray-500" />
                      <span>{application.job.company}</span>
                    </div>
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-gray-500" />
                      <span>{application.job.location}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 md:mt-0 md:ml-4 flex items-center text-sm space-x-2">
                  {getStatusIcon(application.status) && (
                    <FontAwesomeIcon icon={getStatusIcon(application.status)} className={`mr-1 ${getStatusColor(application.status)}`} />
                  )}
                  <span className={`font-medium ${getStatusColor(application.status)}`}>
                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                  </span>
                  <span className="text-gray-500">• Applied on {formatDate(application.appliedAt)}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faFile} className="text-blue-600 mr-3" />
                  <span className="font-medium text-gray-800">CV:</span>
                  <a href={application.cv} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 hover:underline">
                    View CV
                  </a>
                </div>

                <div className="flex items-start">
                  <FontAwesomeIcon icon={faEnvelope} className="text-blue-600 mr-3 mt-1" />
                  <div className="flex-1">
                    <span className="font-medium text-gray-800">Motivation Letter:</span>
                    <button
                      onClick={() => setSelectedLetterIndex(selectedLetterIndex === index ? null : index)}
                      className="ml-2 text-blue-600 hover:underline"
                    >
                      {selectedLetterIndex === index ? 'Hide' : 'View'}
                    </button>
                    {selectedLetterIndex === index && (
                      <div className="mt-3 bg-gray-50 p-4 rounded-lg text-sm text-gray-800 border border-gray-200">
                        {application.motivationLetter || 'No letter provided.'}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 border-t pt-4 border-gray-200">
                <button
                  onClick={() => setSelectedApplicationId(selectedApplicationId === application.id ? null : application.id)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  {selectedApplicationId === application.id ? 'Hide Messages' : 'View Messages'}
                </button>
                {application.status === 'pending' && (
                  <button
                    onClick={() => handleWithdraw(application.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Withdraw Application
                  </button>
                )}
              </div>

              {selectedApplicationId === application.id && (
                <div className="mt-6">
                  <Messages
                    applicationId={application.id}
                    userRole="candidate"
                    candidateId={application.candidateId}
                    recruiterId={application.job.recruiterId}
                  />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default MyApplications;