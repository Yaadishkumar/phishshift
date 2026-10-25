import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowLeft, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  FileText, 
  CheckCircle2, 
  Info,
  Clock,
  Layers,
  Link2,
  Lock,
  Smartphone,
  Mail,
  MessageSquare
} from 'lucide-react';

export default function ResultsDashboard({ result, rawMessage, messageType, onScanAnother }) {
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  const {
    risk_score = 0,
    score_type = "Heuristic Severity Score (0-100)",
    classification = "Low Risk",
    risk_level = "low",
    indicators = [],
    urls_analyzed = [],
    explanation = "",
    recommendations = [],
    detection_method = "Rule-Based Heuristic Baseline Engine",
    ml_status = {}
  } = result;

  const isHigh = classification === "High Risk";
  const isSuspicious = classification === "Suspicious";
  const isLow = classification === "Low Risk";

  const tierClass = isHigh ? 'high' : isSuspicious ? 'suspicious' : 'low';
  const tierColor = isHigh ? 'var(--risk-high)' : isSuspicious ? 'var(--risk-suspicious)' : 'var(--risk-low)';

  // Build markdown export report
  const handleCopyReport = () => {
    const reportText = `[PhishShift Security Assessment Report]
Risk Classification: ${classification}
Score: ${risk_score}/100 (${score_type})
Engine: ${detection_method}
Channel: ${messageType}
Evaluated Message: "${rawMessage.substring(0, 100)}..."

Summary:
${explanation}

Detected Indicators (${indicators.length}):
${indicators.map(i => `- [${i.severity.toUpperCase()}] ${i.title}: ${i.detail}`).join('\n') || 'None'}

URLs Analyzed (${urls_analyzed.length}):
${urls_analyzed.map(u => `- ${u.raw_url} (Host: ${u.hostname})`).join('\n') || 'None'}

Recommendations:
${recommendations.map(r => `* ${r}`).join('\n')}

Disclaimer: Automated heuristic analysis for college mini project 2. Does not guarantee safety.`;

    navigator.clipboard.writeText(reportText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `phishshift-scan-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="results-wrapper" style={{ maxWidth: '1040px', margin: '0 auto' }}>
      {/* Top Action Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <button
          className="btn btn-secondary btn-sm"
          onClick={onScanAnother}
          id="btn-scan-another-top"
        >
          <ArrowLeft size={16} />
          <span>Scan Another Message</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleCopyReport}
            title="Copy structured security report"
          >
            {copied ? <Check size={14} style={{ color: 'var(--risk-low)' }} /> : <Copy size={14} />}
            <span>{copied ? 'Report Copied!' : 'Copy Summary'}</span>
          </button>

          <button
            className="btn btn-secondary btn-sm"
            onClick={handleDownloadJSON}
            title="Export raw JSON analysis payload"
          >
            <Download size={14} />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Primary Verdict Banner */}
      <div className={`verdict-banner ${tierClass}`}>
        <div className="verdict-info">
          <div className={`verdict-icon-box ${tierClass}`}>
            {isHigh ? <ShieldAlert size={32} /> : isSuspicious ? <AlertTriangle size={32} /> : <ShieldCheck size={32} />}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h2 className="verdict-classification" style={{ color: tierColor }}>
                {classification}
              </h2>
              <span className={`severity-pill ${tierClass}`}>
                {isHigh ? 'Threat Level: Critical' : isSuspicious ? 'Threat Level: Moderate' : 'Threat Level: Clean'}
              </span>
            </div>
            <div className="verdict-meta">
              <span>Channel: <strong>{messageType}</strong></span>
              <span>•</span>
              <span>Indicators Flagged: <strong>{indicators.length}</strong></span>
              <span>•</span>
              <span>Method: <strong>{detection_method}</strong></span>
            </div>
          </div>
        </div>

        {/* Visual Risk Meter Score Gauge */}
        <div className="score-gauge-box">
          <div className="score-number-row">
            <span className="score-number" style={{ color: tierColor }}>
              {risk_score}
            </span>
            <span className="score-max">/ 100</span>
          </div>
          <div className="score-label">{score_type}</div>
          <div className="score-progress-bar">
            <div
              className="score-progress-fill"
              style={{
                width: `${risk_score}%`,
                backgroundColor: tierColor
              }}
            />
          </div>
        </div>
      </div>

      {/* Executive Explanation Card */}
      <div className="card">
        <div className="card-header" style={{ marginBottom: '0.75rem' }}>
          <div className="card-title-group">
            <div className="card-icon" style={{ background: 'rgba(56, 189, 248, 0.1)', color: 'var(--cyan-400)' }}>
              <FileText size={18} />
            </div>
            <div>
              <h3 className="card-title" style={{ fontSize: '1.05rem' }}>Analysis Executive Summary</h3>
              <p className="card-subtitle">Transparent justification derived from verified threat indicators</p>
            </div>
          </div>
        </div>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.65 }}>
          {explanation}
        </p>

        {/* Scanned Input Snippet Quote */}
        <div style={{
          marginTop: '1rem',
          padding: '0.85rem 1rem',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(4, 8, 17, 0.7)',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.85rem'
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Scanned Input Preview:
          </div>
          <div style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>
            "{rawMessage}"
          </div>
        </div>
      </div>

      {/* Grid: Detected Indicators & Actionable Recommendations */}
      <div className="results-grid">
        {/* Left Column: Detected Threat Indicators */}
        <div className="card">
          <div className="card-header">
            <div className="card-title-group">
              <div className="card-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--risk-high)' }}>
                <ShieldAlert size={18} />
              </div>
              <div>
                <h3 className="card-title" style={{ fontSize: '1.05rem' }}>
                  Detected Threat Indicators ({indicators.length})
                </h3>
                <p className="card-subtitle">Specific heuristics triggered during inspection</p>
              </div>
            </div>
          </div>

          {indicators.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '2.5rem 1rem',
              color: 'var(--text-muted)',
              fontSize: '0.9rem',
              background: 'rgba(4, 8, 17, 0.4)',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--border-subtle)'
            }}>
              <CheckCircle2 size={36} style={{ color: 'var(--risk-low)', margin: '0 auto 0.75rem', opacity: 0.9 }} />
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                No Malicious Indicators Detected
              </div>
              <div>
                Message did not trigger known credential lures, urgency traps, or high-risk URL patterns.
              </div>
            </div>
          ) : (
            <div className="indicators-list">
              {indicators.map((ind, i) => (
                <div key={ind.id || i} className={`indicator-card ${ind.severity}`}>
                  <div className="indicator-header">
                    <span className="indicator-title">
                      {ind.title}
                    </span>
                    <span className={`severity-pill ${ind.severity}`}>
                      {ind.severity}
                    </span>
                  </div>
                  <p className="indicator-detail">
                    {ind.detail}
                  </p>
                  {ind.evidence && ind.evidence.length > 0 && (
                    <div className="indicator-evidence">
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Evidence matched:</span>
                      {ind.evidence.map((ev, ei) => (
                        <span key={ei} className="evidence-tag">
                          {typeof ev === 'string' ? ev : JSON.stringify(ev)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* URL Static Architecture Findings Table */}
          {urls_analyzed && urls_analyzed.length > 0 && (
            <div style={{ marginTop: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Link2 size={16} style={{ color: 'var(--cyan-400)' }} />
                <h4 style={{ fontSize: '0.925rem', fontWeight: 600 }}>
                  Enclosed URL Static Inspection ({urls_analyzed.length})
                </h4>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Evaluated safely offline via string parsing. PhishShift never executes, pings, or resolves unknown links.
              </p>

              <div style={{ overflowX: 'auto' }}>
                <table className="urls-table">
                  <thead>
                    <tr>
                      <th>Host / Domain</th>
                      <th>Shortener</th>
                      <th>IP Host</th>
                      <th>Findings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {urls_analyzed.map((u, ui) => (
                      <tr key={ui}>
                        <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                          {u.hostname}
                        </td>
                        <td>
                          {u.is_shortener ? (
                            <span style={{ color: 'var(--risk-suspicious)', fontWeight: 600 }}>Yes (Obfuscated)</span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>No</span>
                          )}
                        </td>
                        <td>
                          {u.is_ip_address ? (
                            <span style={{ color: 'var(--risk-high)', fontWeight: 600 }}>Yes (Raw IP)</span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>No</span>
                          )}
                        </td>
                        <td style={{ fontSize: '0.8rem', color: u.findings.length > 0 ? 'var(--risk-suspicious)' : 'var(--risk-low)' }}>
                          {u.findings.join(' • ') || 'Standard domain structure'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Recommendations & Method Disclosure */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Actionable Recommendations */}
          <div className="card">
            <div className="card-header">
              <div className="card-title-group">
                <div className="card-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--risk-low)' }}>
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <h3 className="card-title" style={{ fontSize: '1.05rem' }}>Safety Recommendations</h3>
                  <p className="card-subtitle">Recommended protective measures</p>
                </div>
              </div>
            </div>

            <div className="recommendations-list">
              {recommendations.map((rec, ri) => (
                <div key={ri} className="recommendation-item">
                  <div className="recommendation-bullet">▪</div>
                  <div>{rec}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
              <button
                className="btn btn-primary"
                style={{ width: '100%' }}
                onClick={onScanAnother}
                id="btn-scan-another-bottom"
              >
                <span>Scan Another Message</span>
              </button>
            </div>
          </div>

          {/* Engine Methodology Badge */}
          <div className="card" style={{ background: 'rgba(11, 19, 36, 0.6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Info size={16} style={{ color: 'var(--cyan-400)' }} />
              <h4 style={{ fontSize: '0.875rem', fontWeight: 600 }}>Model & Methodology Disclosure</h4>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              This risk rating was produced by PhishShift's <strong>Rule-Based Heuristic Baseline Engine v1.2</strong>.
              All indicators are calculated from auditable weights. No fake AI confidences were generated.
            </p>
            <div style={{
              marginTop: '0.75rem',
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(255,255,255,0.03)',
              fontSize: '0.75rem',
              color: 'var(--text-muted)'
            }}>
              ML Model Status: <em>Pluggable Interface Ready ({ml_status.model_loaded ? 'Custom Model Active' : 'Baseline Active'})</em>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
