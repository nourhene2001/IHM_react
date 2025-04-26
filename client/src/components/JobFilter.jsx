import React, { useState } from 'react';

function JobFilter({ onFilter }) {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [contract, setContract] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilter({ title, location, contract });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Job Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="border p-2 rounded"
        />
        <select
          value={contract}
          onChange={(e) => setContract(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Contracts</option>
          <option value="full-time">Full-Time</option>
          <option value="part-time">Part-Time</option>
          <option value="contract">Contract</option>
        </select>
      </div>
      <button type="submit" className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
        Filter
      </button>
    </form>
  );
}

export default JobFilter;
