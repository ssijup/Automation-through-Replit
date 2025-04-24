from flask import Flask, render_template, send_from_directory, jsonify
import os
import json
from werkzeug.middleware.proxy_fix import ProxyFix

app = Flask(__name__, 
           static_folder='frontend/dist',
           template_folder='templates')
           
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

# Proxy configuration for Django API
@app.route('/api/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE'])
def proxy_api(path):
    # Just to validate it reached here during development
    return jsonify({
        "message": f"API endpoint /api/{path} was accessed. This is a placeholder - Django backend will handle this endpoint."
    })

# Serve the login page
@app.route('/')
def index():
    return send_from_directory('frontend/dist', 'index.html')

# Serve static files
@app.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory('frontend/dist', path)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)