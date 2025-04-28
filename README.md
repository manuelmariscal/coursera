# 🏥 MotoSegura - Medical Records Management System

## 📋 Overview
MotoSegura is a secure medical records management system that allows users to store and access medical information through QR codes. The system is designed to be minimalist, secure, and user-friendly.

## 🚀 Features
- QR code generation for medical records
- Secure API with rate limiting
- User-friendly interface
- Containerized deployment
- PostgreSQL database
- API key authentication for admin operations

## 🛠️ Tech Stack
- Backend: Python Flask
- Frontend: HTML, CSS, JavaScript
- Database: PostgreSQL
- Containerization: Docker
- Deployment: Raspberry Pi

## 📦 Project Structure
```
motosegura/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── routes.py
│   │   └── utils.py
│   ├── config.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── static/
│   │   ├── css/
│   │   ├── js/
│   │   └── images/
│   └── templates/
├── docker-compose.yml
└── README.md
```

## 🔧 Setup Instructions
1. Clone the repository
2. Set up environment variables
3. Build and run Docker containers
4. Access the application at http://localhost:5001

## 🔒 Security Features
- Rate limiting to prevent DDoS attacks
- API key authentication for admin operations
- Secure data storage
- QR code-based access

## 📝 License
MIT License

