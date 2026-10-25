import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Scanner from './components/Scanner';
import HistoryView from './components/HistoryView';
import AboutView from './components/AboutView';
import Footer from './components/Footer';

export default function App() {
  const [activeTab, setActiveTab] = useState('scanner'); // 'scanner' | 'history' | 'about'

  return (
    <div className="app-layout">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="main-content" role="main">
        <div className="container">
          {activeTab === 'scanner' && <Scanner />}
          {activeTab === 'history' && <HistoryView />}
          {activeTab === 'about' && <AboutView />}
        </div>
      </main>

      <Footer onNavigate={setActiveTab} />
    </div>
  );
}
