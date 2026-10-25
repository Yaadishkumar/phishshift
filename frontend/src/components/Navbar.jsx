import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function Navbar({ activeTab, setActiveTab }) {
  const [backendOnline, setBackendOnline] = useState(false);

  const checkStatus = async () => {
    try {
      const res = await api.checkHealth();
      setBackendOnline(res && res.status === 'healthy');
    } catch {
      setBackendOnline(false);
    }
  };

  useEffect(() => {
    checkStatus();
    const timer = setInterval(checkStatus, 20000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="site-navbar">
      <div className="container">
        <div className="navbar-inner">
          {/* Brand */}
          <button
            className="navbar-brand"
            onClick={() => setActiveTab('scanner')}
            title="PhishShift - Message Risk Scanner"
          >
            <span className="brand-title">PhishShift</span>
            <span className="brand-tag">Message Risk Scanner</span>
          </button>

          {/* Nav links and server status */}
          <div className="navbar-right">
            <nav className="nav-links">
              <button
                className={`nav-link ${activeTab === 'scanner' ? 'active' : ''}`}
                onClick={() => setActiveTab('scanner')}
              >
                Scanner
              </button>
              <button
                className={`nav-link ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
              >
                Scan History
              </button>
              <button
                className={`nav-link ${activeTab === 'about' ? 'active' : ''}`}
                onClick={() => setActiveTab('about')}
              >
                About
              </button>
            </nav>

            <div className="server-status" title={backendOnline ? "Flask API is running" : "Flask API is offline"}>
              <span className={`status-dot ${backendOnline ? 'online' : 'offline'}`} />
              <span>{backendOnline ? 'Server Online' : 'Server Offline'}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
