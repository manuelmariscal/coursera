# Scripts Directory

This directory contains all the scripts needed for setting up, deploying, backing up, and testing the application.

## Directory Structure

```bash
scripts/
├── backup/             # Backup and restore scripts
│   ├── backup.sh       # Script for creating backups
│   └── restore.sh      # Script for restoring from backups
├── deployment/         # Deployment scripts
│   ├── deploy.sh       # Standard deployment script
│   └── deploy-raspberry.sh  # Raspberry Pi deployment script
├── setup/              # Setup scripts
│   ├── setup-backend.sh     # Backend setup
│   ├── setup-frontend.sh    # Frontend setup
│   ├── setup-ngrok.sh       # Ngrok setup for external access
│   └── setup-persistence.sh # Database setup
├── test/               # Test scripts
│   └── test-mobile-access.sh  # Test for mobile device API access
├── backup-manager.sh   # Main backup management script
├── deploy.sh           # Main deployment script
├── setup.sh            # Main setup script
└── test-app.sh         # Main testing script
```

## Main Scripts

### Setup Script (`setup.sh`)

The main setup script orchestrates the installation and configuration of all application components:

1. Sets up the persistence layer (database)
2. Sets up the backend
3. Sets up the frontend
4. Optionally sets up ngrok for external access

Usage:
```bash
./scripts/setup.sh
```

### Deployment Script (`deploy.sh`)

The deployment script provides options for deploying the application to different environments:

1. Standard deployment (server/cloud)
2. Raspberry Pi deployment

Usage:
```bash
./scripts/deploy.sh
```

### Backup Management Script (`backup-manager.sh`)

The backup management tool handles creating and restoring backups:

1. Create a new backup
2. Restore from a backup

Usage:
```bash
./scripts/backup-manager.sh
```

### Testing Script (`test-app.sh`)

The testing script runs various tests to verify application functionality:

1. Mobile Access Test (tests API connectivity from mobile devices)
2. Option to run all tests

Usage:
```bash
./scripts/test-app.sh
```

## Individual Scripts

Each directory contains specialized scripts that can also be run individually if needed:

- **Backup Scripts**: For creating and restoring backups
- **Deployment Scripts**: For deploying to different environments
- **Setup Scripts**: For setting up individual components
- **Test Scripts**: For running specific tests

## Development

When adding new functionality:

1. Place specialized scripts in the appropriate subdirectory
2. Update the main scripts to include the new functionality
3. Update this README to document the changes 