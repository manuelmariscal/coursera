from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_cors import CORS
import os
import logging
from .models import db

def create_app():
    app = Flask(__name__, 
                static_folder='../frontend/static', 
                template_folder='../frontend/templates')
    
    # Configure logging
    app.logger.setLevel(logging.INFO)
    
    # Load configuration from environment variables
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'postgresql://postgres:postgres@db:5432/motosegura')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'default-secret-key')
    app.config['UPLOAD_FOLDER'] = os.getenv('UPLOAD_FOLDER', '/app/static/uploads')
    app.config['MAX_CONTENT_LENGTH'] = int(os.getenv('MAX_CONTENT_LENGTH', 16 * 1024 * 1024))  # 16MB
    
    # Initialize extensions
    db.init_app(app)
    migrate = Migrate(app, db)
    CORS(app)
    
    # Initialize rate limiter
    limiter = Limiter(
        app=app,
        key_func=get_remote_address,
        default_limits=[os.getenv('RATELIMIT_DEFAULT', "200 per day"), "50 per hour"]
    )
    
    # Create upload folder if it doesn't exist
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Create default profile image if it doesn't exist
    default_profile_path = os.path.join(app.config['UPLOAD_FOLDER'], 'default_profile.png')
    if not os.path.exists(default_profile_path):
        # Create a simple default image or copy from assets
        try:
            from PIL import Image
            img = Image.new('RGB', (200, 200), color='gray')
            os.makedirs(os.path.dirname(default_profile_path), exist_ok=True)
            img.save(default_profile_path)
            app.logger.info(f"Created default profile image at {default_profile_path}")
        except Exception as e:
            app.logger.warning(f"Could not create default profile image: {str(e)}")
    
    # Register blueprints
    from .routes import main
    app.register_blueprint(main)
    
    # Register error handlers
    @app.errorhandler(404)
    def not_found(error):
        return {'error': 'Not found'}, 404
    
    @app.errorhandler(500)
    def server_error(error):
        return {'error': 'Internal server error'}, 500
    
    # Create tables if they don't exist
    with app.app_context():
        try:
            db.create_all()
            app.logger.info("Database tables created successfully")
        except Exception as e:
            app.logger.error(f"Error creating database tables: {str(e)}")
    
    return app 