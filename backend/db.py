"""
PhishShift - Message Risk Scanner
SQLite History and Metrics Storage

Privacy Compliance:
- Strictly adheres to data minimization.
- Only stores an anonymized snippet/preview (max 40 chars) to prevent retaining sensitive credentials.
- Full messages are NEVER persisted to database.
- Provides endpoints to inspect, delete individual scans, or purge all records.
"""

import sqlite3
import os
from datetime import datetime
from typing import List, Dict, Any, Optional

DB_FILE = os.path.join(os.path.dirname(__file__), "phishshift.db")

def get_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes the SQLite database tables if not existing."""
    conn = get_connection()
    try:
        with conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS scan_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT NOT NULL,
                    message_preview TEXT NOT NULL,
                    message_type TEXT NOT NULL,
                    risk_score INTEGER NOT NULL,
                    classification TEXT NOT NULL,
                    indicators_count INTEGER NOT NULL,
                    summary TEXT
                )
            """)
    finally:
        conn.close()

def save_scan_record(message_preview: str, message_type: str, risk_score: int, classification: str, indicators_count: int, summary: str = "") -> int:
    """Saves sanitized scan summary metadata."""
    clean_preview = (message_preview[:45].strip() + "...") if len(message_preview) > 45 else message_preview.strip()
    
    conn = get_connection()
    try:
        with conn:
            cursor = conn.cursor()
            now_iso = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            cursor.execute("""
                INSERT INTO scan_history (timestamp, message_preview, message_type, risk_score, classification, indicators_count, summary)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (now_iso, clean_preview, message_type, risk_score, classification, indicators_count, summary))
            return cursor.lastrowid
    finally:
        conn.close()

def get_recent_scans(limit: int = 50) -> List[Dict[str, Any]]:
    """Retrieves recent scans ordered by timestamp descending."""
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, timestamp, message_preview, message_type, risk_score, classification, indicators_count, summary
            FROM scan_history
            ORDER BY id DESC
            LIMIT ?
        """, (limit,))
        rows = cursor.fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()

def delete_scan_record(scan_id: int) -> bool:
    """Deletes a single scan record by ID."""
    conn = get_connection()
    try:
        with conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM scan_history WHERE id = ?", (scan_id,))
            return cursor.rowcount > 0
    finally:
        conn.close()

def clear_all_history() -> int:
    """Purges all stored scan records."""
    conn = get_connection()
    try:
        with conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM scan_history")
            return cursor.rowcount
    finally:
        conn.close()

def get_scan_statistics() -> Dict[str, Any]:
    """Calculates summary metrics for the security dashboard."""
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) as total FROM scan_history")
        total = cursor.fetchone()["total"]

        cursor.execute("SELECT COUNT(*) as high_risk FROM scan_history WHERE classification = 'High Risk'")
        high_risk = cursor.fetchone()["high_risk"]

        cursor.execute("SELECT COUNT(*) as suspicious FROM scan_history WHERE classification = 'Suspicious'")
        suspicious = cursor.fetchone()["suspicious"]

        cursor.execute("SELECT COUNT(*) as low_risk FROM scan_history WHERE classification = 'Low Risk'")
        low_risk = cursor.fetchone()["low_risk"]

        return {
            "total_scans": total,
            "high_risk_count": high_risk,
            "suspicious_count": suspicious,
            "low_risk_count": low_risk
        }
    finally:
        conn.close()
