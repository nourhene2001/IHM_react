import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="container text-center py-16 flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-gray-800">
        Welcome to <span className="text-[var(--accent)]">CareerConnect</span> 🚀
      </h1>
      <p className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto">
        Find your dream job 💼 or post opportunities for top talent 🌟 with ease.
      </p>
      <div className="btn-group justify-center gap-4">
        <Link
          to="/jobs"
          className="px-8 py-3 text-lg font-medium text-white bg-[var(--accent)] rounded-lg transition duration-300 hover:bg-[var(--accent-hover)]"
        >
          Browse Jobs 🔍
        </Link>
      </div>
    </div>
  );
}

export default Home;
