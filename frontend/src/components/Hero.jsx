import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Link2, 
  Search, 
  HelpCircle, 
  ArrowRight, 
  CheckCircle2, 
  TrendingUp, 
  Zap, 
  Lock,
  Eye
} from 'lucide-react';
import { api } from '../services/api';

export default function Hero({ onStartScan, onSelectSample }) {
  const [stats, setStats] = useState({
    total_scans: 0,
    high_risk_count: 0,
    suspicious_count: 0,
    low_risk_count: 0
  });

  useEffect(() => {
    api.getStats()
      .then(res => {
        if (res && res.stats) setStats(res.stats);
      })
      .catch(() => {
        // Fallback or offline graceful handling
      });
  }, []);

  const testSamples = [
    {
      title: "Urgent Bank Freeze",
      type: "SMS",
      text: "URGENT: Your Chase bank account is suspended due to unauthorized access. Verify your password and OTP immediately at http://192.168.1.100/login"
    },
    {
      title: "Package Redelivery",
      type: "SMS",
      text: "USPS: Package tracking #US94821 is withheld due to missing address details. Please update delivery fee: http://bit.ly/usps-redelivery-fee"
    },
    {
      title: "Lottery Reward",
      type: "Other",
      text: "Congratulations! You have been selected as the lucky winner of $25,000. Claim your prize by sending $50 processing fee via Western Union."
    },
    {
      title: "Safe Team Note",
      type: "Email",
      text: "Hi David, please find the project slide deck for tomorrow's 10 AM design review attached. Let me know if you need any adjustments beforehand."
    }
  ];

  return (
    <section className="hero-section" aria-label="Overview & Dashboard">
      <div className="container">
        {/* Pill Tagline */}
        <div className="hero-pill">
          <Zap size={14} />
          <span>College Mini Project 2 • Cyber Threat Intelligence</span>
        </div>

        {/* Main Heading */}
        <h1 className="hero-title">
          Detect Message Threats Before They Reach You.
        </h1>

        {/* Subtitle */}
        <p className="hero-subtitle">
          PhishShift empowers individuals and security teams to instantly evaluate suspicious SMS,
          emails, and direct messages for social engineering lures, credential theft, and deceptive URLs
          with transparent, explainable heuristic scoring.
        </p>

        {/* Action Buttons */}
        <div className="hero-actions">
          <button
            className="btn btn-primary"
            onClick={onStartScan}
            id="hero-scan-button"
          >
            <span>Scan a Message</span>
            <ArrowRight size={18} />
          </button>

          <a
            href="#how-it-works"
            className="btn btn-secondary"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <HelpCircle size={18} />
            <span>How Scanner Works</span>
          </a>
        </div>

        {/* Live Aggregated Statistics */}
        <div className="stats-grid" aria-label="System Metrics">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(6, 182, 212, 0.12)', color: 'var(--cyan-400)' }}>
              <TrendingUp size={22} />
            </div>
            <div>
              <div className="stat-value">{stats.total_scans}</div>
              <div className="stat-label">Messages Evaluated</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--risk-high-bg)', color: 'var(--risk-high)' }}>
              <AlertTriangle size={22} />
            </div>
            <div>
              <div className="stat-value" style={{ color: 'var(--risk-high)' }}>{stats.high_risk_count}</div>
              <div className="stat-label">High-Risk Threats</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--risk-suspicious-bg)', color: 'var(--risk-suspicious)' }}>
              <Eye size={22} />
            </div>
            <div>
              <div className="stat-value" style={{ color: 'var(--risk-suspicious)' }}>{stats.suspicious_count}</div>
              <div className="stat-label">Suspicious Lures</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--risk-low-bg)', color: 'var(--risk-low)' }}>
              <CheckCircle2 size={22} />
            </div>
            <div>
              <div className="stat-value" style={{ color: 'var(--risk-low)' }}>{stats.low_risk_count}</div>
              <div className="stat-label">Low Risk Safe</div>
            </div>
          </div>
        </div>

        {/* Interactive Quick-Test Scenarios */}
        <div className="card" style={{ marginTop: '2rem', textAlign: 'left', background: 'rgba(11, 19, 36, 0.7)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Interactive Testing Scenarios
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Click any real-world attack pattern below to populate the scanner and inspect explainable indicators:
              </p>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--cyan-400)', fontFamily: 'var(--font-mono)' }}>
              4 Verified Presets
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
            {testSamples.map((sample, idx) => (
              <button
                key={idx}
                className="sample-chip"
                style={{
                  padding: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                  textAlign: 'left',
                  borderRadius: 'var(--radius-md)'
                }}
                onClick={() => onSelectSample(sample.text, sample.type)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem' }}>{sample.title}</span>
                  <span style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'rgba(255,255,255,0.06)' }}>
                    {sample.type}
                  </span>
                </div>
                <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  "{sample.text}"
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Core Feature Cards */}
        <div className="features-grid" aria-label="Core Security Capabilities">
          <div className="feature-card">
            <div className="feature-icon-box">
              <ShieldCheck size={22} />
            </div>
            <h3 className="feature-title">Phishing & Smishing Detection</h3>
            <p className="feature-desc">
              Identifies credential harvesting lures, deceptive sender impersonation, and unauthorized account lockout scare tactics.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box">
              <Link2 size={22} />
            </div>
            <h3 className="feature-title">Suspicious Link Analysis</h3>
            <p className="feature-desc">
              Performs safe, static inspection of raw IP addresses, public URL shorteners, and high-abuse throwaway TLDs without executing links.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box">
              <AlertTriangle size={22} />
            </div>
            <h3 className="feature-title">Scam & Pressure Indicators</h3>
            <p className="feature-desc">
              Flags artificial urgency, lottery rewards, advance-fee solicitations, and fake courier delivery exception notices.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box">
              <Lock size={22} />
            </div>
            <h3 className="feature-title">Transparent Explainability</h3>
            <p className="feature-desc">
              Zero black-box mystery. Every classification provides an auditable severity score, highlighted indicator evidence, and actionable safety guidance.
            </p>
          </div>
        </div>

        {/* How It Works Section */}
        <div id="how-it-works" style={{ paddingTop: '3rem', textAlign: 'left' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
              How PhishShift Analyzes Messages
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              A 4-stage deterministic and privacy-first threat evaluation pipeline
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            <div className="card" style={{ position: 'relative' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'rgba(6, 182, 212, 0.25)', position: 'absolute', top: '1rem', right: '1.25rem' }}>
                01
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--cyan-300)' }}>
                1. Safe Ingestion & Tokenizing
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Untrusted text is normalized and parsed locally. Strict sandboxing ensures enclosed hyperlinks are never executed or visited over the network.
              </p>
            </div>

            <div className="card" style={{ position: 'relative' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'rgba(6, 182, 212, 0.25)', position: 'absolute', top: '1rem', right: '1.25rem' }}>
                02
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--cyan-300)' }}>
                2. Static URL Inspection
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Extracted URLs are examined for host anomalies: raw IPv4/IPv6 hosts, brand name typosquatting, URL shorteners, and risky TLDs.
              </p>
            </div>

            <div className="card" style={{ position: 'relative' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'rgba(6, 182, 212, 0.25)', position: 'absolute', top: '1rem', right: '1.25rem' }}>
                03
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--cyan-300)' }}>
                3. Cognitive Lure Matching
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Heuristic pattern matchers detect social engineering techniques: coercive deadlines, password/OTP harvesting, and fake prize rewards.
              </p>
            </div>

            <div className="card" style={{ position: 'relative' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'rgba(6, 182, 212, 0.25)', position: 'absolute', top: '1rem', right: '1.25rem' }}>
                04
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--cyan-300)' }}>
                4. Auditable Severity Score
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                A calibrated 0–100 severity score is synthesized with classified tier (Low, Suspicious, High), accompanied by clear protective guidance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
