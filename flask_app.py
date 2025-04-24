from flask import Flask, render_template, send_from_directory, request, Response, jsonify
import os
import requests
import logging
from werkzeug.middleware.proxy_fix import ProxyFix

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Set up Flask app
app = Flask(__name__, 
           static_folder='frontend/dist',
           template_folder='templates')
           
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

# Django API server URL
DJANGO_API_URL = "http://127.0.0.1:8000"

# Proxy configuration for Django API
@app.route('/api/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'])
def proxy_api(path):
    try:
        # For development, we'll just handle it directly rather than proxying
        if request.method == 'OPTIONS':
            # Handle CORS preflight requests
            response = Response()
            response.headers.add('Access-Control-Allow-Origin', '*')
            response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
            response.headers.add('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS')
            return response
        
        # For now, let's just return successful JWT token for admin user
        if path == 'token/' and request.method == 'POST':
            data = request.get_json()
            username = data.get('username')
            password = data.get('password')
            
            # Check if credentials are valid (simple check for demo)
            if (username == 'admin' and password == 'admin123') or \
               (username == 'support' and password == 'support123') or \
               (username == 'warehouse' and password == 'warehouse123'):
                # Generate mock JWT tokens
                return jsonify({
                    "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNjg3MjIzMzYwLCJpYXQiOjE2ODcyMjMwNjAsImp0aSI6IjA1ZWFjMmNiOWFiMzRkZDA5MjI3ZTZhNDI0YmQyNTRhIiwidXNlcl9pZCI6MX0.example",
                    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTY4NzMwOTQ2MCwiaWF0IjoxNjg3MjIzMDYwLCJqdGkiOiJjMjNiNmNiMjM3ZmY0ODlhODM3MWY5MDNmMjc0MzU5YyIsInVzZXJfaWQiOjF9.example"
                })
            else:
                return jsonify({"detail": "No active account found with the given credentials"}), 401
        
        # For user data endpoints, return demo data
        if path == 'current-user/' and request.method == 'GET':
            # Return user based on the Authorization header
            if 'Authorization' in request.headers:
                # For simplicity, we'll recognize the user by their role in a real token
                user_data = {
                    "id": 1,
                    "username": "admin",
                    "email": "admin@example.com",
                    "first_name": "Admin",
                    "last_name": "User",
                    "role": "PLATFORM_ADMIN"
                }
                return jsonify(user_data)
            return jsonify({"detail": "Authentication credentials were not provided"}), 401
        
        # Users endpoint
        if path == 'users/' and request.method == 'GET':
            if 'Authorization' in request.headers:
                users_data = {
                    "count": 3,
                    "next": None,
                    "previous": None,
                    "results": [
                        {
                            "id": 1,
                            "username": "admin",
                            "email": "admin@example.com",
                            "first_name": "Admin",
                            "last_name": "User",
                            "role": "PLATFORM_ADMIN"
                        },
                        {
                            "id": 2,
                            "username": "support",
                            "email": "support@example.com",
                            "first_name": "Support",
                            "last_name": "Staff",
                            "role": "SUPPORT_STAFF"
                        },
                        {
                            "id": 3,
                            "username": "warehouse",
                            "email": "warehouse@example.com",
                            "first_name": "Warehouse",
                            "last_name": "Admin",
                            "role": "WAREHOUSE_ADMIN"
                        }
                    ]
                }
                return jsonify(users_data)
            return jsonify({"detail": "Authentication credentials were not provided"}), 401
        
        # For any other path, return a message
        return jsonify({
            "message": f"API endpoint /api/{path} was accessed. This is a placeholder - Django backend will handle this endpoint in production."
        })
        
    except Exception as e:
        logger.error(f"Error proxying request to /api/{path}: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Serve the main React app for most routes
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react(path):
    # Specific routes for static assets
    if path.startswith('static/'):
        return send_from_directory('frontend/dist', path)
    
    # Everything else should be handled by the React app
    return send_from_directory('templates', 'index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)