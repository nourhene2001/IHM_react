import React from 'react'; // Added React import

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header.jsx';
import Home from './pages/Home.jsx';
import JobList from './pages/JobList.jsx';
import JobPost from './pages/JobPost.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import MyApplications from './pages/MyApplications.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import JobApplications from './components/JobApplication.jsx';
import JobDetails from './pages/JobDetails.jsx';
import './index.css';
import './app.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Header />
        <main className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/jobs" element={<JobList />} />
            <Route path="/post-job" element={<JobPost />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/jobs/my-applications" element={<MyApplications />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/jobs/my-jobs" element={<JobApplications />} />
            <Route path="/jobs/:jobId" element={<JobDetails />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;