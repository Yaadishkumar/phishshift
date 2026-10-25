import React, { useState } from 'react';
import { api } from '../services/api';

export default function Scanner({ presetMessage = '', presetType = 'SMS' }) {
  const [message, setMessage] = useState(presetMessage);
  const [messageType, setMessageType] = useState(presetType);
  const [saveHistory, setSaveHistory] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  // Student test examples
  const sampleMessages = [
    {
      label: "Urgent Bank SMS",
      type: "SMS",
      text: "URGENT: Your Chase bank account is suspended due to unauthorized access. Verify your password and OTP immediately at http://192.168.1.100/login"
    },
    {
      label: "Package Delivery Notice",
      type: "SMS",
      text: "USPS: We attempted to deliver your package #9824 today but failed due to incorrect address. Confirm delivery details here: http://bit.ly/usps-package-update"
    },
    {
      label: "Lottery Scam",
      type: "Other",
      text: "Congratulations! You have won $10,000 in the customer lottery. To release the payout, please send a $50 processing fee via Western Union."
    },
    {
      label: "Normal Message",
      type: "Email",
      text: "Hi David, please find the project report for tomorrow's meeting attached. Let me know if you have any questions."
    }
  ];

  const handleApplySample = (sample) => {
    setMessage(sample.text);
    setMessageType(sample.type);
    setError(null);
    setResult(null);
  };

  const handleClear = () => {
    setMessage('');
    setError(null);
    setResult(null);
  };

  const handleAnalyze = async () => {
    const trimmed = message.trim();
    if (!trimmed) {
      setError("Please enter or paste a message to analyze.");
      return;
    }
    if (trimmed.length < 2) {
      setError("Message is too short. Please enter at least 2 characters.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await api.scanMessage({
        message: trimmed,
        messageType,
        saveHistory
      });

      if (response && response.success) {
        setResult(response);
      } else {
        setError(response.error || "Analysis failed. Please check the backend.");
      }
    } catch (err) {
      setError(err.message || "Could not connect to the backend server. Make sure py app.py is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyReport = () => {
    if (!result) return;
    const summaryText = `PhishShift Scan Report
Classification: ${result.classification}
Risk Score: ${result.risk_score} / 100
Channel: ${messageType}
Explanation: ${result.explanation}
Indicators: ${result.indicators.map(i => i.title).join(', ') || 'None'}`;

    navigator.clipboard.writeText(summaryText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const getTierClass = (classification) => {
    if (classification === 'High Risk') return 'high';
    if (classification === 'Suspicious') return 'suspicious';
    return 'low';
  };

  const getBadgeClass = (severity) => {
    if (severity === 'critical' || severity === 'high') return 'badge-high';
    if (severity === 'medium') return 'badge-medium';
    return 'badge-low';
  };

  const charCount = message.length;
  const wordCount = message.trim() ? message.trim().split(/\s+/).length : 0;

  return (
    <div className="scanner-page">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Message Risk Scanner</h1>
        <p className="page-desc">
          Paste an SMS, email body, or suspicious text message below to detect phishing attempts,
          urgency tactics, and dangerous links.
        </p>
      </div>

      {/* Main Input Panel */}
      <div className="panel">
        <div className="form-group">
          <label className="form-label">Message Channel / Type:</label>
          <div className="channel-selector">
            <button
              type="button"
              className={`channel-btn ${messageType === 'SMS' ? 'active' : ''}`}
              onClick={() => setMessageType('SMS')}
            >
              SMS / Text
            </button>
            <button
              type="button"
              className={`channel-btn ${messageType === 'Email' ? 'active' : ''}`}
              onClick={() => setMessageType('Email')}
            >
              Email
            </button>
            <button
              type="button"
              className={`channel-btn ${messageType === 'Other' ? 'active' : ''}`}
              onClick={() => setMessageType('Other')}
            >
              Other / Chat
            </button>
          </div>
        </div>

        {/* Textarea */}
        <div className="form-group">
          <label className="form-label" htmlFor="message-input">
            Suspicious Message Text:
          </label>
          <textarea
            id="message-input"
            className="scanner-textarea"
            placeholder="Paste message content here... (e.g., 'URGENT: Your account is locked. Verify details immediately at http://...')"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              if (error) setError(null);
            }}
            maxLength={15000}
            disabled={loading}
          />
          <div className="textarea-meta">
            <span>{charCount} characters • {wordCount} words</span>
            <span>Max 15,000 characters</span>
          </div>
        </div>

        {/* Preset Sample Prompts */}
        <div className="example-presets">
          <span className="example-title">Test examples:</span>
          {sampleMessages.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              className="example-btn"
              onClick={() => handleApplySample(sample)}
            >
              {sample.label}
            </button>
          ))}
        </div>

        {/* Controls Bar */}
        <div className="scanner-controls">
          <label className="save-toggle">
            <input
              type="checkbox"
              checked={saveHistory}
              onChange={(e) => setSaveHistory(e.target.checked)}
            />
            <span>Save a short preview to scan history</span>
          </label>

          <div className="action-buttons">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClear}
              disabled={!message && !result}
            >
              Clear
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAnalyze}
              disabled={loading || !message.trim()}
            >
              {loading ? "Analyzing..." : "Analyze Message"}
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="alert alert-error">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="loading-box">
            Scanning message for indicators, checking URL patterns, and calculating risk score...
          </div>
        )}
      </div>

      {/* ==========================================================================
          Results Section (Displayed below form after analysis)
          ========================================================================== */}
      {result && !loading && (
        <div className="results-container">
          {/* Verdict Banner */}
          <div className={`result-banner ${getTierClass(result.classification)}`}>
            <div>
              <div className="result-classification-title">
                <span>Result: {result.classification}</span>
              </div>
              <div className="result-submeta">
                Channel: {messageType} • Method: {result.detection_method}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="result-score-tag">
                Score: {result.risk_score} / 100
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleCopyReport}
              >
                {copied ? "Copied" : "Copy Report"}
              </button>
            </div>
          </div>

          {/* Explanation Panel */}
          <div className="panel">
            <div className="result-block">
              <h3 className="result-block-title">Explanation</h3>
              <p className="result-text">{result.explanation}</p>
            </div>

            {/* Detected Indicators Table */}
            <div className="result-block" style={{ marginTop: '1.25rem' }}>
              <h3 className="result-block-title">
                Detected Indicators ({result.indicators.length})
              </h3>

              {result.indicators.length === 0 ? (
                <p className="result-text" style={{ color: 'var(--risk-low-text)' }}>
                  ✓ No threat indicators were detected. The message does not match known phishing or scam patterns.
                </p>
              ) : (
                <table className="clean-table">
                  <thead>
                    <tr>
                      <th style={{ width: '100px' }}>Severity</th>
                      <th>Indicator</th>
                      <th>Details & Matched Evidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.indicators.map((ind, idx) => (
                      <tr key={idx}>
                        <td>
                          <span className={`badge ${getBadgeClass(ind.severity)}`}>
                            {ind.severity}
                          </span>
                        </td>
                        <td>
                          <strong>{ind.title}</strong>
                        </td>
                        <td>
                          <div>{ind.detail}</div>
                          {ind.evidence && ind.evidence.length > 0 && (
                            <div style={{ marginTop: '0.25rem' }}>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Matched: </span>
                              {ind.evidence.map((ev, ei) => (
                                <span key={ei} className="evidence-code" style={{ marginRight: '0.25rem' }}>
                                  {ev}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* URLs Analyzed (if any) */}
            {result.urls_analyzed && result.urls_analyzed.length > 0 && (
              <div className="result-block" style={{ marginTop: '1.25rem' }}>
                <h3 className="result-block-title">
                  Links Found in Message ({result.urls_analyzed.length})
                </h3>
                <table className="clean-table">
                  <thead>
                    <tr>
                      <th>Domain / Host</th>
                      <th style={{ width: '90px' }}>Shortener</th>
                      <th style={{ width: '90px' }}>IP Host</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.urls_analyzed.map((url, uidx) => (
                      <tr key={uidx}>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{url.hostname}</td>
                        <td>{url.is_shortener ? "Yes" : "No"}</td>
                        <td>{url.is_ip_address ? "Yes" : "No"}</td>
                        <td>{url.findings.join("; ") || "No abnormal hostname markers"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  * Links are parsed offline using string matching. PhishShift does not open or visit untrusted websites.
                </p>
              </div>
            )}

            {/* Recommendations */}
            <div className="result-block" style={{ marginTop: '1.25rem' }}>
              <h3 className="result-block-title">Recommended Actions</h3>
              <ul className="recommendations-list">
                {result.recommendations.map((rec, ridx) => (
                  <li key={ridx}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
