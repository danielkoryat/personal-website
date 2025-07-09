#!/bin/bash

# Setup SSL certificates for local development
# This script generates self-signed certificates for testing purposes

set -e

echo "🔐 Setting up SSL certificates..."

# Create SSL directory
mkdir -p ssl

# Generate self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout ssl/key.pem \
    -out ssl/cert.pem \
    -subj "/C=CA/ST=Ontario/L=Toronto/O=Daniel Koryat/CN=localhost" \
    -addext "subjectAltName=DNS:localhost,IP:127.0.0.1,IP:192.168.0.165"

# Set proper permissions
chmod 600 ssl/key.pem
chmod 644 ssl/cert.pem

echo "✅ SSL certificates generated successfully!"
echo "📁 Certificates saved in ./ssl/"
echo "🔑 Key file: ssl/key.pem"
echo "📜 Cert file: ssl/cert.pem"
echo ""
echo "⚠️  Note: These are self-signed certificates for development only."
echo "   For production, use certificates from a trusted CA like Let's Encrypt." 