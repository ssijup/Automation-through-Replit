#!/bin/bash

echo "Building React frontend..."

# Create necessary directories
mkdir -p frontend/dist
mkdir -p staticfiles
mkdir -p media
mkdir -p templates

# Copy the static login page to dist directory
cp frontend/dist/index.html templates/index.html

# Build the React application
cd frontend && npx webpack --mode production

echo "Collecting static files..."
cd ..
cd backend && python manage.py collectstatic --noinput

echo "Frontend build complete!"