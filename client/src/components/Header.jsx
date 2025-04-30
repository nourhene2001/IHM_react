import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import Notifications from './notification.jsx';

function Header() {
  const context = useContext(AuthContext);
  const { user, logout } = context || { user: null, logout: () => {} };
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-blue-600 text-white p-4">
      <nav className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          CareerConnect
        </Link>
        <div className="flex items-center space-x-4">
          <Link to="/jobs" className="hover:underline">
            Jobs
          </Link>
          {user ? (
            <>
              {user.role === 'recruiter' && (
                <>
                  <Link to="/post-job" className="hover:underline">
                    Post Job
                  </Link>
                  <Link to="/jobs/my-jobs" className="hover:underline">
                    My Posted Jobs
                  </Link>
                </>
              )}
              {user.role === 'candidate' && (
                <Link to="/jobs/my-applications" className="hover:underline">
                  My Applications
                </Link>
              )}
              {user.role === 'admin' && (
                <Link to="/admin/dashboard" className="hover:underline">
                  Admin Dashboard
                </Link>
              )}
              <Link to="/profile" className="hover:underline">
                Profile
              </Link>
              {/* Add Notifications Component */}
              <Notifications />
              <button
                onClick={handleLogout}
                className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:underline">
                Login
              </Link>
              <Link to="/register" className="hover:underline">
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Header;