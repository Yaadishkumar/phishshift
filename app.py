"""
PhishShift - Root WSGI Entrypoint for Render / Production Deployments.
This file ensures that running `gunicorn app:app` directly from the repository
root works seamlessly without requiring the Root Directory setting to be changed.
"""

import sys
import os

# Add backend directory and root directory to Python search path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(current_dir, "backend")

if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

import backend.app
app = backend.app.app

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    host = os.environ.get("HOST", "0.0.0.0")
    debug_mode = os.environ.get("FLASK_DEBUG", "0") == "1"
    app.run(host=host, port=port, debug=debug_mode)
