import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import Profile from '../components/Profile.jsx';
import { Navigate } from 'react-router-dom';

function ProfilePage() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <p>Loading...</p>;
  if (!user) return <Navigate to="/login" />;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Your Profile</h2>
      <Profile />
    </div>
  );
}

export default ProfilePage;

