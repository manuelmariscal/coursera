#!/bin/bash

# Backup Management Script
# This script handles backup and restore operations

echo "=== Backup Management Tool ==="
echo

# Set the base directory to the script's location
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$BASE_DIR/.."

# Ensure the backup scripts are executable
chmod +x "$BASE_DIR/backup/backup.sh"
chmod +x "$BASE_DIR/backup/restore.sh"

# Display options
echo "Please select an operation:"
echo "1) Create a new backup"
echo "2) Restore from a backup"
echo "3) Exit"
echo

# Get user selection
read -p "Enter your choice (1-3): " choice
echo

# Process the selection
case $choice in
    1)
        echo "Starting backup operation..."
        "$BASE_DIR/backup/backup.sh"
        ;;
    2)
        echo "Starting restore operation..."
        "$BASE_DIR/backup/restore.sh"
        ;;
    3)
        echo "Exiting backup management tool."
        exit 0
        ;;
    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac

# Check operation result
if [ $? -eq 0 ]; then
    echo
    echo "=== Operation completed successfully ==="
else
    echo
    echo "=== Operation encountered errors. Please check the logs. ==="
    exit 1
fi 