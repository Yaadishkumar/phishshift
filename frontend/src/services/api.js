/**
 * PhishShift - Centralized API Service
 * Handles communication between React Frontend and Flask REST Backend
 */

// Resolves API base URL:
// In production on Render (or other hosts), set VITE_API_URL (e.g. 'https://phishshift-backend.onrender.com')
// In local development, defaults to '/api' (handled by Vite proxy in vite.config.js)
function resolveApiBase() {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim()) {
    let clean = envUrl.trim().replace(/\/+$/, '');
    if (!clean.endsWith('/api')) {
      clean += '/api';
    }
    return clean;
  }
  return '/api';
}

const API_BASE = resolveApiBase();
// Only fallback to localhost:5000 in local development mode
const LOCAL_DEV_FALLBACK = import.meta.env.DEV && API_BASE === '/api' ? 'http://127.0.0.1:5000/api' : null;

async function fetchWithFallback(endpoint, options = {}) {
  const primaryUrl = `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(primaryUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Server responded with status ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    // If running in local dev and the relative '/api' proxy fails, try local direct port 5000
    if (LOCAL_DEV_FALLBACK && (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')))) {
      try {
        const directRes = await fetch(`${LOCAL_DEV_FALLBACK}${endpoint}`, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {})
          }
        });
        if (!directRes.ok) {
          const directErr = await directRes.json().catch(() => ({}));
          throw new Error(directErr.error || `Server responded with status ${directRes.status}`);
        }
        return await directRes.json();
      } catch (fallbackErr) {
        throw new Error(
          'Unable to connect to PhishShift Backend API (http://127.0.0.1:5000). Please ensure Flask server is running.'
        );
      }
    }
    throw new Error(err.message || 'Unable to connect to PhishShift Backend API.');
  }
}

export const api = {
  // Check health and backend operational status
  async checkHealth() {
    return await fetchWithFallback('/health');
  },

  // Perform message threat scanning
  async scanMessage({ message, messageType = 'Other', saveHistory = false }) {
    return await fetchWithFallback('/scan', {
      method: 'POST',
      body: JSON.stringify({
        message,
        message_type: messageType,
        save_history: saveHistory,
        client_timestamp: new Date().toISOString()
      })
    });
  },

  // Retrieve stored history records
  async getHistory(limit = 50) {
    return await fetchWithFallback(`/history?limit=${limit}`);
  },

  // Delete a specific scan record
  async deleteHistoryItem(id) {
    return await fetchWithFallback(`/history/${id}`, {
      method: 'DELETE'
    });
  },

  // Purge all stored history
  async clearAllHistory() {
    return await fetchWithFallback('/history', {
      method: 'DELETE'
    });
  },

  // Fetch threat statistics
  async getStats() {
    return await fetchWithFallback('/stats');
  },

  // Fetch model and engine specifications
  async getModelInfo() {
    return await fetchWithFallback('/model-info');
  }
};
