import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';

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
        <Link to="/" className="text-2xl font-bold">CareerConnect</Link>
        <div className="space-x-4">
          <Link to="/jobs">Jobs</Link>
          {user ? (
            <>
              {/* Only for recruiters */}
              {user.role === 'recruiter' && (
                <>
                  <Link to="/post-job">Post Job</Link>
                  <Link to="/jobs/my-jobs" className="text-white hover:underline">My Job Applications</Link> 
                </>
              )}
              <Link to="/profile">Profile</Link>
              <button onClick={handleLogout} className="bg-red-500 px-3 py-1 rounded">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Header;
