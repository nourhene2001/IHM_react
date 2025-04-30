import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import Profile from '../components/Profile.jsx';
import { Navigate } from 'react-router-dom';

function ProfilePage() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
        <p className="mt-2 text-gray-600">Loading your profile...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Your Profile</h2>
          <p className="text-gray-600 mt-2">Manage your personal information</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md">
          <Profile />
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;