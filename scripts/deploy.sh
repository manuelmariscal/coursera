#!/bin/bash

# Main deployment script
# This script provides a menu to deploy to different environments

echo "=== Application Deployment Tool ==="
echo

# Set the base directory to the script's location
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$BASE_DIR/.."

# Ensure the deployment scripts are executable
chmod +x "$BASE_DIR/deployment/deploy.sh"
chmod +x "$BASE_DIR/deployment/deploy-raspberry.sh"

# Display deployment options
echo "Please select a deployment target:"
echo "1) Standard deployment (server/cloud)"
echo "2) Raspberry Pi deployment"
echo "3) Exit"
echo

# Get user selection
read -p "Enter your choice (1-3): " choice
echo

# Process the selection
case $choice in
    1)
        echo "Starting standard deployment..."
        "$BASE_DIR/deployment/deploy.sh"
        ;;
    2)
        echo "Starting Raspberry Pi deployment..."
        "$BASE_DIR/deployment/deploy-raspberry.sh"
        ;;
    3)
        echo "Exiting deployment tool."
        exit 0
        ;;
    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac

# Check deployment result
if [ $? -eq 0 ]; then
    echo
    echo "=== Deployment completed successfully ==="
else
    echo
    echo "=== Deployment encountered errors. Please check the logs. ==="
    exit 1
fi 