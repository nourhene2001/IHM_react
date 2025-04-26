import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to CareerConnect</h1>
      <p className="text-lg mb-6">Find your dream job or post opportunities for top talent.</p>
      <div className="space-x-4">
        <Link to="/jobs" className="bg-blue-500 text-white px-6 py-2 rounded">
          Browse Jobs
        </Link>
        <Link to="/register" className="bg-green-500 text-white px-6 py-2 rounded">
          Get Started
        </Link>
      </div>
    </div>
  );
}

export default Home;
