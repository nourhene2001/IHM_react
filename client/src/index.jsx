import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import '../src/';
import { AuthProvider } from './context/AuthContext.jsx';
import './App.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <AuthProvider>
    <App />
  </AuthProvider>
);