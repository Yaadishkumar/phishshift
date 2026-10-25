import React from 'react';

export default function AboutView() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">About PhishShift</h1>
        <p className="page-desc">
          College Mini Project 2 • Message Risk Scanner & Phishing Detection Tool
        </p>
      </div>

      <div className="panel">
        {/* Project Purpose */}
        <section className="article-section">
          <h2 className="article-heading">1. Project Purpose</h2>
          <p className="article-body">
            PhishShift is a message risk-scanning web application developed as a college mini-project.
            Its primary purpose is to help users determine whether an incoming text message, email, or
            social media communication might be a phishing attack, smishing attempt, or scam.
          </p>
          <p className="article-body" style={{ marginTop: '0.5rem' }}>
            Users paste an untrusted message into the scanner and receive an explainable assessment
            including a risk classification (Low Risk, Suspicious, or High Risk), a heuristic severity score
            from 0 to 100, specific detected indicators, and protective advice.
          </p>
        </section>

        {/* Why Phishing is Dangerous */}
        <section className="article-section">
          <h2 className="article-heading">2. Why Phishing and Scam Messages Are Dangerous</h2>
          <p className="article-body">
            Social engineering attacks have become increasingly common, particularly on mobile channels like SMS (smishing):
          </p>
          <ul className="article-list">
            <li>
              <strong>Cognitive pressure:</strong> Scammers frequently use fake deadlines ("within 24 hours", "account suspended") to create panic.
            </li>
            <li>
              <strong>Credential harvesting:</strong> Messages often prompt victims to enter passwords, PINs, or one-time verification codes on fake websites.
            </li>
            <li>
              <strong>Link obfuscation:</strong> Shortened links (like bit.ly) or raw IP addresses are used to hide fraudulent destinations.
            </li>
            <li>
              <strong>Financial scams:</strong> Unsolicited lottery notifications or fake delivery fee requests trick recipients into sending irreversible payments.
            </li>
          </ul>
        </section>

        {/* Detection Workflow */}
        <section className="article-section">
          <h2 className="article-heading">3. Detection Workflow</h2>
          <p className="article-body">
            The detection engine analyzes messages through an explainable, four-step heuristic evaluation process:
          </p>
          <ol className="article-list" style={{ listStyleType: 'decimal' }}>
            <li>
              <strong>Input sanitization:</strong> The message is received and validated safely as untrusted text.
            </li>
            <li>
              <strong>Static URL analysis:</strong> Links are extracted and inspected offline using regular expressions. The engine checks for raw IP addresses, known URL shorteners, and abnormal domain patterns without making network requests to unknown sites.
            </li>
            <li>
              <strong>Keyword & heuristic rules:</strong> The text is compared against security rule sets for credential harvesting lures, urgency keywords, account lockout threats, and financial solicitations.
            </li>
            <li>
              <strong>Scoring and explanation:</strong> Matched indicators are assigned deterministic weights, producing a 0–100 risk score, classification, and recommended user actions.
            </li>
          </ol>
        </section>

        {/* Technology Stack */}
        <section className="article-section">
          <h2 className="article-heading">4. Technology Stack</h2>
          <ul className="article-list">
            <li><strong>Frontend:</strong> React 19, Vite, clean CSS design.</li>
            <li><strong>Backend:</strong> Python 3 with Flask REST API.</li>
            <li><strong>Database:</strong> SQLite (<code>phishshift.db</code>) for storing optional, privacy-safe scan summaries.</li>
            <li><strong>Detection Engine:</strong> Rule-based baseline heuristic detector with a pluggable ML model interface in <code>backend/detector.py</code>.</li>
          </ul>
        </section>

        {/* Connecting an ML Model */}
        <section className="article-section">
          <h2 className="article-heading">5. Machine Learning Model Integration</h2>
          <p className="article-body">
            The backend is designed with a separated detection service. If you train a machine-learning model (such as a scikit-learn TF-IDF + Logistic Regression or Naive Bayes pipeline), export it to <code>backend/models/phishing_model.joblib</code>. The backend will automatically load it and provide model prediction probabilities alongside baseline heuristic rules.
          </p>
          <div className="code-block">
# Exporting a trained scikit-learn model:
import joblib
joblib.dump(pipeline, 'backend/models/phishing_model.joblib')
          </div>
        </section>

        {/* Limitations & Disclaimer */}
        <section className="article-section">
          <h2 className="article-heading">6. Limitations & Disclaimer</h2>
          <ul className="article-list">
            <li>
              <strong>Heuristic boundaries:</strong> Rule-based heuristics detect common attack patterns, but novel or unusually worded scams may not trigger known rules.
            </li>
            <li>
              <strong>Offline inspection:</strong> To protect user privacy and safety, the scanner does not crawl or visit external links.
            </li>
            <li>
              <strong>Academic use:</strong> This tool is developed for educational purposes as College Mini Project 2. It can produce false positives and false negatives, and users should always independently verify unexpected communications.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
