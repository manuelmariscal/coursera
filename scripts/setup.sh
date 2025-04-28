#!/bin/bash

# Main setup script for the application
# This script orchestrates the execution of all setup scripts in the correct order

echo "=== Starting application setup ==="
echo

# Set the base directory to the script's location
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$BASE_DIR/.."

# Ensure the scripts are executable
chmod +x "$BASE_DIR/setup/setup-backend.sh"
chmod +x "$BASE_DIR/setup/setup-frontend.sh"
chmod +x "$BASE_DIR/setup/setup-persistence.sh"
chmod +x "$BASE_DIR/setup/setup-ngrok.sh"

# Step 1: Set up persistence (database)
echo "Step 1: Setting up persistence layer..."
"$BASE_DIR/setup/setup-persistence.sh"
if [ $? -ne 0 ]; then
    echo "Error setting up persistence layer. Aborting."
    exit 1
fi
echo "Persistence layer setup completed successfully."
echo

# Step 2: Set up backend
echo "Step 2: Setting up backend..."
"$BASE_DIR/setup/setup-backend.sh"
if [ $? -ne 0 ]; then
    echo "Error setting up backend. Aborting."
    exit 1
fi
echo "Backend setup completed successfully."
echo

# Step 3: Set up frontend
echo "Step 3: Setting up frontend..."
"$BASE_DIR/setup/setup-frontend.sh"
if [ $? -ne 0 ]; then
    echo "Error setting up frontend. Aborting."
    exit 1
fi
echo "Frontend setup completed successfully."
echo

# Step 4: Set up ngrok (optional)
read -p "Do you want to set up ngrok for external access? (y/n): " setup_ngrok
if [[ "$setup_ngrok" == "y" || "$setup_ngrok" == "Y" ]]; then
    echo "Step 4: Setting up ngrok..."
    "$BASE_DIR/setup/setup-ngrok.sh"
    if [ $? -ne 0 ]; then
        echo "Warning: Ngrok setup had issues, but the application should still work locally."
    else
        echo "Ngrok setup completed successfully."
    fi
    echo
fi

echo "=== Application setup completed ==="
echo
echo "You can now run the application:"
echo "1. Start the backend: cd backend && source venv/bin/activate && python debug_app.py"
echo "2. Start the frontend: cd frontend && npm start"
echo
echo "For deployment options, check the deployment scripts in scripts/deployment/" 