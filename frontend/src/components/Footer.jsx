import React from 'react';

export default function Footer({ onNavigate }) {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-inner">
          <div>
            <strong>PhishShift</strong> — College Mini Project 2 • Message Risk Scanner
          </div>
          <div>
            <span>Disclaimer: Automated educational analysis. Do not rely exclusively on this tool for security decisions.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
