"""
Unit tests for PhishShift detection engine and SQLite database.
Run via: py test_backend.py
"""

import unittest
from detector import scan_message, baseline_detector
import db

class TestPhishShiftBackend(unittest.TestCase):

    def setUp(self):
        db.init_db()

    def test_high_risk_phishing_message(self):
        msg = "URGENT: Your Chase bank account is suspended due to unauthorized access. Verify your password and OTP immediately at http://192.168.1.100/login"
        result = scan_message(msg, "SMS")
        self.assertTrue(result["success"])
        self.assertEqual(result["classification"], "High Risk")
        self.assertGreaterEqual(result["risk_score"], 70)
        self.assertTrue(any(i["category"] == "credentials" for i in result["indicators"]))
        self.assertTrue(any(i["category"] == "urgency" for i in result["indicators"]))
        self.assertTrue(any(i["category"] == "url" for i in result["indicators"]))

    def test_suspicious_message(self):
        msg = "Your delivery package could not be completed. Please review details: http://bit.ly/track987"
        result = scan_message(msg, "SMS")
        self.assertTrue(result["success"])
        self.assertIn(result["classification"], ["Suspicious", "High Risk"])
        self.assertGreaterEqual(result["risk_score"], 30)
        self.assertTrue(any(u["is_shortener"] for u in result["urls_analyzed"]))

    def test_low_risk_safe_message(self):
        msg = "Hey Sarah, are we still meeting for lunch at 1 PM today? Let me know!"
        result = scan_message(msg, "Other")
        self.assertTrue(result["success"])
        self.assertEqual(result["classification"], "Low Risk")
        self.assertLess(result["risk_score"], 30)

    def test_db_persistence_and_privacy(self):
        long_message = "Your secret bank account number 1234567890 password is ABCD - this is very sensitive data."
        record_id = db.save_scan_record(
            message_preview=long_message,
            message_type="SMS",
            risk_score=85,
            classification="High Risk",
            indicators_count=2,
            summary="Suspicious credential indicators detected."
        )
        self.assertIsNotNone(record_id)

        history = db.get_recent_scans(limit=10)
        saved = next((h for h in history if h["id"] == record_id), None)
        self.assertIsNotNone(saved)
        # Verify privacy: raw message is truncated to preview, never storing entire long message
        self.assertTrue(len(saved["message_preview"]) <= 50)
        self.assertTrue(saved["message_preview"].endswith("..."))

        # Test delete
        deleted = db.delete_scan_record(record_id)
        self.assertTrue(deleted)

    def test_empty_message_handling(self):
        res = scan_message("", "Other")
        self.assertEqual(res["risk_score"], 0)
        self.assertEqual(res["classification"], "Low Risk")

if __name__ == "__main__":
    unittest.main()
