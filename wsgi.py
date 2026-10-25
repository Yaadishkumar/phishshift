"""
PhishShift - WSGI entrypoint for production servers using wsgi:app
"""

from app import app

if __name__ == "__main__":
    app.run()
