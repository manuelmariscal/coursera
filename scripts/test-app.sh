#!/bin/bash

# Application Testing Script
# This script runs various tests for the application

echo "=== Application Testing Tool ==="
echo

# Set the base directory to the script's location
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$BASE_DIR/.."

# Ensure the test scripts are executable
chmod +x "$BASE_DIR/test/test-mobile-access.sh"

# Display testing options
echo "Please select a test to run:"
echo "1) Mobile Access Test (tests API connectivity from mobile devices)"
echo "2) Run All Tests"
echo "3) Exit"
echo

# Get user selection
read -p "Enter your choice (1-3): " choice
echo

# Process the selection
case $choice in
    1)
        echo "Starting Mobile Access Test..."
        "$BASE_DIR/test/test-mobile-access.sh"
        ;;
    2)
        echo "Running all tests..."
        
        echo "1. Mobile Access Test:"
        "$BASE_DIR/test/test-mobile-access.sh"
        MOBILE_TEST_RESULT=$?
        
        # Add more tests here as they are developed
        
        # Report overall results
        if [ $MOBILE_TEST_RESULT -eq 0 ]; then
            echo "All tests passed successfully!"
        else
            echo "Some tests failed. Please review the output above."
            exit 1
        fi
        ;;
    3)
        echo "Exiting testing tool."
        exit 0
        ;;
    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac

# Check test result
if [ $? -eq 0 ]; then
    echo
    echo "=== Testing completed successfully ==="
else
    echo
    echo "=== Testing encountered errors. Please check the logs. ==="
    exit 1
fi 