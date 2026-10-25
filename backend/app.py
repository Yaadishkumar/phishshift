"""
PhishShift - Message Risk Scanner
Flask REST API Backend

Features:
- POST /api/scan: Analyze message for threats, phishing lures, and malicious URLs
- GET /api/health: Operational health-check with engine status
- GET /api/history: Retrieve stored privacy-compliant scan summaries
- DELETE /api/history/<id>: Remove individual scan record
- DELETE /api/history: Purge all stored records
- GET /api/stats: Aggregate threat statistics
- GET /api/model-info: Detection engine specifications and ML pipeline status
"""

import os
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from detector import scan_message, baseline_detector, ml_detector
import db

# Setup safe structured logging (DO NOT log raw sensitive message text)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("PhishShiftAPI")

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "phishshift-default-dev-secret")

# Enable CORS for local Vite dev server and deployed frontend origins
allowed_origins = os.environ.get("ALLOWED_ORIGINS", "*")
if allowed_origins != "*":
    allowed_origins = [o.strip() for o in allowed_origins.split(",") if o.strip()]
CORS(app, resources={r"/*": {"origins": allowed_origins}})

# Initialize SQLite database on startup
db.init_db()


@app.route("/", methods=["GET"])
def index_root():
    """Service status check at root."""
    return jsonify({
        "service": "PhishShift Message Risk Scanner API",
        "status": "online",
        "documentation": "/api/model-info",
        "health_check": "/api/health"
    }), 200


@app.route("/api/health", methods=["GET"])
def health_check():
    """System health-check endpoint."""
    return jsonify({
        "status": "healthy",
        "service": "PhishShift Message Risk Scanner API",
        "version": "1.0.0",
        "engine": {
            "name": "Rule-Based Baseline Detector v1.2",
            "type": "Deterministic Cybersecurity Expert System",
            "ml_model_loaded": ml_detector.is_loaded
        }
    }), 200


@app.route("/api/model-info", methods=["GET"])
def model_info():
    """Information regarding the detection methodology and ML pluggable status."""
    return jsonify({
        "active_engine": "Rule-Based Heuristic Baseline",
        "version": "1.2.0",
        "academic_disclosure": (
            "Baseline detector utilizes transparent, explainable heuristic pattern matching and "
            "URL structure parsing without external network calls. No artificial or fabricated "
            "AI weights are used."
        ),
        "ml_plugin_status": {
            "configured": ml_detector.is_loaded,
            "artifact_expected_path": "backend/models/phishing_model.joblib",
            "instructions": "Place a trained scikit-learn pipeline (.joblib) with predict_proba support in backend/models/"
        },
        "capabilities": [
            "URL Shortener Detection",
            "Raw IP Host Identification",
            "Abusive / Suspicious TLD Flagging",
            "Deceptive Brand Lookalike Matching",
            "Credential & Identity Harvesting Checks",
            "Coercive Urgency & Pressure Language Evaluation",
            "Advance-Fee & Lottery Scam Detection",
            "Smishing Delivery & Toll Exception Heuristics"
        ]
    }), 200


@app.route("/api/scan", methods=["POST"])
def scan():
    """
    Main endpoint for scanning an untrusted message.
    Payload:
      - message (str): Message text to analyze (required)
      - message_type (str): SMS, Email, or Other (optional, default: Other)
      - save_history (bool): Whether to persist sanitized snippet (optional, default: False)
    """
    data = request.get_json(silent=True)
    if not data or not isinstance(data, dict):
        return jsonify({
            "success": False,
            "error": "Invalid request. Please provide JSON body with a 'message' field."
        }), 400

    raw_message = data.get("message")
    if not raw_message or not isinstance(raw_message, str):
        return jsonify({
            "success": False,
            "error": "The message field cannot be empty."
        }), 400

    message = raw_message.strip()
    if len(message) < 2:
        return jsonify({
            "success": False,
            "error": "Please provide a valid message with at least 2 characters to analyze."
        }), 400

    if len(message) > 15000:
        return jsonify({
            "success": False,
            "error": "Message exceeds maximum allowed character length (15,000 characters)."
        }), 400

    message_type = data.get("message_type", "Other")
    if message_type not in ["SMS", "Email", "Other"]:
        message_type = "Other"

    save_history = bool(data.get("save_history", False))

    try:
        # Run detection analysis
        result = scan_message(message, message_type)

        # Safe logging: Length, type, risk score, classification (NEVER raw sensitive text)
        logger.info(
            "Scan performed: type=%s, length=%d, score=%d, classification=%s, indicators=%d",
            message_type, len(message), result["risk_score"], result["classification"], len(result["indicators"])
        )

        # Optional history persistence (sanitized snippet only)
        record_id = None
        if save_history:
            record_id = db.save_scan_record(
                message_preview=message,
                message_type=message_type,
                risk_score=result["risk_score"],
                classification=result["classification"],
                indicators_count=len(result["indicators"]),
                summary=result["explanation"][:200]
            )

        result["record_id"] = record_id
        result["message_type"] = message_type
        result["timestamp"] = data.get("client_timestamp")
        return jsonify(result), 200

    except Exception as e:
        logger.exception("Unexpected error during scan processing")
        return jsonify({
            "success": False,
            "error": "An internal error occurred while processing the message. Please try again."
        }), 500


@app.route("/api/history", methods=["GET"])
def get_history():
    """Retrieves recent scan metadata."""
    try:
        limit = request.args.get("limit", default=50, type=int)
        limit = min(max(1, limit), 100)
        history = db.get_recent_scans(limit=limit)
        return jsonify({
            "success": True,
            "count": len(history),
            "history": history
        }), 200
    except Exception as e:
        logger.exception("Error reading scan history")
        return jsonify({"success": False, "error": "Unable to fetch history."}), 500


@app.route("/api/history/<int:scan_id>", methods=["DELETE"])
def delete_history_item(scan_id):
    """Deletes a specific history record."""
    try:
        deleted = db.delete_scan_record(scan_id)
        if deleted:
            return jsonify({"success": True, "message": f"Scan #{scan_id} deleted."}), 200
        return jsonify({"success": False, "error": f"Scan #{scan_id} not found."}), 404
    except Exception as e:
        logger.exception("Error deleting scan history record")
        return jsonify({"success": False, "error": "Failed to delete record."}), 500


@app.route("/api/history", methods=["DELETE"])
def clear_history():
    """Clears all stored scan records."""
    try:
        count = db.clear_all_history()
        return jsonify({"success": True, "message": f"Cleared {count} history records."}), 200
    except Exception as e:
        logger.exception("Error clearing scan history")
        return jsonify({"success": False, "error": "Failed to clear history."}), 500


@app.route("/api/stats", methods=["GET"])
def get_stats():
    """Returns aggregated scanner usage metrics."""
    try:
        stats = db.get_scan_statistics()
        return jsonify({
            "success": True,
            "stats": stats
        }), 200
    except Exception as e:
        logger.exception("Error fetching stats")
        return jsonify({"success": False, "error": "Failed to retrieve statistics."}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    host = os.environ.get("HOST", "0.0.0.0")
    debug_mode = os.environ.get("FLASK_DEBUG", "0") == "1"
    logger.info("Starting PhishShift Backend API on http://%s:%d", host, port)
    app.run(host=host, port=port, debug=debug_mode)
