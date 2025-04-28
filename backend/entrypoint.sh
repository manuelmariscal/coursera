#!/bin/bash

# Ensure directories exist
mkdir -p /app/static/uploads
mkdir -p /app/frontend/static/css
mkdir -p /app/frontend/static/js
mkdir -p /app/frontend/static/images
mkdir -p /app/frontend/templates

# Wait for database
echo "Waiting for PostgreSQL..."
while ! nc -z db 5432; do
  sleep 0.1
done
echo "PostgreSQL started"

# Initialize the application
python -c "
from app import create_app
app = create_app()
with app.app_context():
    from app.models import db
    db.create_all()
"

# Start the application
exec gunicorn --workers=2 --threads=4 --timeout=30 --bind=0.0.0.0:5000 "app:app" 