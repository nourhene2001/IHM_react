import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import Notifications from './notification.jsx';

function Header() {
  const context = useContext(AuthContext);
  const { user, logout } = context || { user: null, logout: () => {} };
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
      navigate('/');
    }
  };

  return (
    <header>
      <nav className="container" role="navigation" aria-label="Main navigation">
        <Link to="/" className="header-title">
          CareerConnect
        </Link>
        <div className="btn-group">
          <Link to="/jobs" className="btn btn-neutral">Jobs</Link>
          {user ? (
            <>
              {user.role === 'recruiter' && (
                <>
                  <Link to="/post-job" className="btn btn-neutral">Post Job</Link>
                  <Link to="/jobs/my-jobs" className="btn btn-neutral">My Posted Jobs</Link>
                </>
              )}
              {user.role === 'candidate' && (
                <Link to="/jobs/my-applications" className="btn btn-neutral">My Applications</Link>
              )}
              {user.role === 'admin' && (
                <Link to="/admin/dashboard" className="btn btn-neutral">Admin Dashboard</Link>
              )}
              <Link to="/profile" className="btn btn-neutral">Profile</Link>
              <Notifications />
              <button
                className="btn btn-secondary"
                onClick={handleLogout}
                aria-label="Logout"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-neutral">Login</Link>
              <Link to="/register" className="btn btn-neutral">Register</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Header;