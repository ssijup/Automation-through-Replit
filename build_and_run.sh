#!/bin/bash

# Build frontend
echo "Building frontend..."
cd frontend && npx webpack --mode production
cd ..

# Start the application
echo "Starting application..."
gunicorn --bind 0.0.0.0:5000 --reuse-port --reload main:app