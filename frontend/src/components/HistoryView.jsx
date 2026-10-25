import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function HistoryView() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getHistory(50);
      if (res && res.success) {
        setHistory(res.history || []);
      }
    } catch (err) {
      setError(err.message || "Failed to load history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete scan record #${id}?`)) return;
    try {
      await api.deleteHistoryItem(id);
      setHistory(prev => prev.filter(item => item.id !== id));
      if (selectedItem && selectedItem.id === id) {
        setSelectedItem(null);
      }
    } catch (err) {
      alert("Failed to delete record: " + err.message);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to clear all scan history from the database?")) return;
    try {
      await api.clearAllHistory();
      setHistory([]);
      setSelectedItem(null);
    } catch (err) {
      alert("Failed to clear history: " + err.message);
    }
  };

  const getBadgeClass = (classification) => {
    if (classification === 'High Risk') return 'badge-high';
    if (classification === 'Suspicious') return 'badge-medium';
    return 'badge-low';
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Scan History</h1>
        <p className="page-desc">
          Audit log of scans saved in your local SQLite database (<code>phishshift.db</code>).
          For privacy, only a short preview is stored.
        </p>
      </div>

      <div className="panel">
        <div className="history-actions">
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Showing <strong>{history.length}</strong> recorded scan{history.length === 1 ? '' : 's'}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={loadHistory}
              disabled={loading}
            >
              Refresh
            </button>
            {history.length > 0 && (
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={handleClearAll}
              >
                Clear History
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="loading-box">Loading scan history...</div>
        ) : error ? (
          <div className="alert alert-error">{error}</div>
        ) : history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
            <p>No scan records found in the database.</p>
            <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
              Scans analyzed with the "Save a short preview" checkbox enabled will appear here.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="clean-table">
              <thead>
                <tr>
                  <th style={{ width: '150px' }}>Date & Time</th>
                  <th style={{ width: '80px' }}>Type</th>
                  <th>Message Preview</th>
                  <th style={{ width: '110px' }}>Risk Level</th>
                  <th style={{ width: '80px' }}>Score</th>
                  <th style={{ width: '120px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {item.timestamp}
                    </td>
                    <td>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {item.message_type}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: '#0f172a' }}>"{item.message_preview}"</span>
                    </td>
                    <td>
                      <span className={`badge ${getBadgeClass(item.classification)}`}>
                        {item.classification}
                      </span>
                    </td>
                    <td>
                      <strong>{item.risk_score}</strong>/100
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.2rem 0.45rem', marginRight: '0.25rem' }}
                        onClick={() => setSelectedItem(item)}
                      >
                        View
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        style={{ padding: '0.2rem 0.45rem' }}
                        onClick={(e) => handleDelete(item.id, e)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Simple Record Details Modal */}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Scan Record #{selectedItem.id}</h3>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
              <div>
                <strong>Timestamp:</strong> {selectedItem.timestamp}
              </div>
              <div>
                <strong>Message Type:</strong> {selectedItem.message_type}
              </div>
              <div>
                <strong>Classification:</strong>{' '}
                <span className={`badge ${getBadgeClass(selectedItem.classification)}`}>
                  {selectedItem.classification}
                </span>{' '}
                (Score: {selectedItem.risk_score} / 100)
              </div>
              <div>
                <strong>Indicators Found:</strong> {selectedItem.indicators_count}
              </div>
              <div>
                <strong>Stored Preview:</strong>
                <div style={{
                  padding: '0.5rem',
                  background: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  marginTop: '0.25rem',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem'
                }}>
                  "{selectedItem.message_preview}"
                </div>
              </div>
              {selectedItem.summary && (
                <div>
                  <strong>Summary:</strong>
                  <p style={{ marginTop: '0.25rem', color: 'var(--text-muted)' }}>
                    {selectedItem.summary}
                  </p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedItem(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
