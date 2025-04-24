#!/bin/bash

echo "Building React frontend..."

# Create necessary directories
mkdir -p frontend/dist
mkdir -p staticfiles
mkdir -p media
mkdir -p templates

# Install required npm dependencies
echo "Installing npm dependencies..."
npm install

# Create a simple script to run webpack build
cat > webpack_build.js << 'EOL'
const webpack = require('webpack');
const config = require('./frontend/webpack.config.js');

webpack(config, (err, stats) => {
  if (err || stats.hasErrors()) {
    console.error('Build failed:', err || stats.toString({
      chunks: false,
      colors: true
    }));
    process.exit(1);
  }
  console.log(stats.toString({
    chunks: false,
    colors: true
  }));
  console.log('Build completed successfully!');
});
EOL

# Run the webpack build
echo "Running webpack build..."
node webpack_build.js

# Copy the built files to the templates directory
echo "Copying built files..."
cp -R frontend/dist/* templates/

echo "Frontend build complete!"