import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

if (import.meta.env.PROD) {
  // Disable noisy logs in production to reduce main-thread overhead.
  console.log = () => {};
  console.debug = () => {};
  console.info = () => {};
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);