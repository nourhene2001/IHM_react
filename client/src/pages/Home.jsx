import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="container text-center py-16">
      <h1 className="text-4xl md:text-5xl font-bold mb-6 text-[var(--text)]">
        Welcome to <span className="text-[var(--accent)]">CareerConnect</span>
      </h1>
      <p className="text-lg mb-8 text-gray-600 max-w-2xl mx-auto">
        Find your dream job or post opportunities for top talent with ease.
      </p>
      <div className="btn-group justify-center gap-4">
        <Link to="/jobs" className="btn btn-primary">
          Browse Jobs
        </Link>

      </div>
    </div>
  );
}

export default Home;