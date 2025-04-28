import qrcode
import os
from io import BytesIO
import base64
from functools import wraps
from flask import request, jsonify, current_app
import re
from werkzeug.utils import secure_filename
from PIL import Image

def sanitize_text(text):
    """Sanitize text input to prevent XSS attacks"""
    if not text:
        return ""
    # Remove potentially dangerous characters
    sanitized = re.sub(r'[<>\'\"&]', '', text)
    return sanitized

def generate_qr_code(data):
    """Generate QR code for the given data"""
    try:
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(data)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        buffered = BytesIO()
        img.save(buffered, format="PNG")
        return base64.b64encode(buffered.getvalue()).decode()
    except Exception as e:
        current_app.logger.error(f"Error generating QR code: {str(e)}")
        return None

def validate_api_key(api_key):
    """Validate the API key"""
    expected_api_key = os.getenv('API_KEY', 'motosegura-api-key')
    return api_key == expected_api_key

def require_api_key(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        api_key = request.headers.get('X-API-Key')
        if not api_key or not validate_api_key(api_key):
            return jsonify({'error': 'Invalid API key'}), 401
        return f(*args, **kwargs)
    return decorated_function

def allowed_file(filename):
    """Check if file type is allowed"""
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_profile_image(file, record_id):
    """Save profile image and return the filename"""
    if not file:
        return 'default_profile.png'
    
    try:
        if not allowed_file(file.filename):
            current_app.logger.warning(f"Invalid file type: {file.filename}")
            return 'default_profile.png'
        
        # Secure the filename
        filename = secure_filename(file.filename)
        filename = f"{record_id}_{filename}"
        
        # Ensure upload folder exists
        upload_folder = current_app.config['UPLOAD_FOLDER']
        os.makedirs(upload_folder, exist_ok=True)
        
        file_path = os.path.join(upload_folder, filename)
        
        # Validate it's actually an image
        try:
            img = Image.open(file)
            img.verify()  # Verify it's an image
            
            # Save the image
            file.seek(0)
            file.save(file_path)
            
            current_app.logger.info(f"Saved profile image: {filename}")
            return filename
        except Exception as e:
            current_app.logger.error(f"Invalid image file: {str(e)}")
            return 'default_profile.png'
    except Exception as e:
        current_app.logger.error(f"Error saving profile image: {str(e)}")
        return 'default_profile.png' 