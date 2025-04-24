# Import Flask app for Replit to serve it
from flask_app import app

# This is the entry point for gunicorn

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)