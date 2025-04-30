import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import 'client/src/App.css';
import 'client/src/index.css';
import { AuthProvider } from './context/AuthContext.jsx';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
