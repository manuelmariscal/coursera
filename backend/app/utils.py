import qrcode
import os
from io import BytesIO
import base64
from functools import wraps
from flask import request, jsonify, current_app
import re
from werkzeug.utils import secure_filename
from PIL import Image
import hashlib
import shutil

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

def get_persistent_upload_folder():
    """Get the persistent upload folder, creating it if it doesn't exist"""
    # Usar un directorio fuera de la aplicación para persistencia
    persistent_folder = os.getenv('PERSISTENT_UPLOAD_FOLDER', '/data/motosegura/uploads')
    
    # Crear el directorio si no existe
    os.makedirs(persistent_folder, exist_ok=True)
    
    return persistent_folder

def save_profile_image(file, record_id):
    """Save profile image and return the filename"""
    if not file:
        return 'default_profile.png'
    
    try:
        if not allowed_file(file.filename):
            current_app.logger.warning(f"Invalid file type: {file.filename}")
            return 'default_profile.png'
        
        # Asegurar que el nombre del archivo sea seguro
        original_filename = secure_filename(file.filename)
        extension = original_filename.rsplit('.', 1)[1].lower() if '.' in original_filename else 'jpg'
        
        # Crear un hash del contenido del archivo para identificar duplicados
        file_hash = hashlib.md5(file.read()).hexdigest()
        file.seek(0)  # Reiniciar el puntero del archivo después de leer
        
        # Crear nombre único usando el ID del registro y el hash
        filename = f"{record_id}_{file_hash}.{extension}"
        
        # Obtener el directorio persistente para uploads
        persistent_folder = get_persistent_upload_folder()
        
        # Ruta completa al archivo
        file_path = os.path.join(persistent_folder, filename)
        
        # Verificar si el archivo ya existe (evitar duplicados)
        if os.path.exists(file_path):
            current_app.logger.info(f"File already exists, reusing: {filename}")
        else:
            # Validar que sea una imagen
            try:
                img = Image.open(file)
                img.verify()  # Verificar que es una imagen válida
                
                # Guardar la imagen
                file.seek(0)
                file.save(file_path)
                
                current_app.logger.info(f"Saved profile image: {filename}")
            except Exception as e:
                current_app.logger.error(f"Invalid image file: {str(e)}")
                return 'default_profile.png'
        
        # Asegurar que la imagen esté disponible en el directorio de uploads de la aplicación
        app_upload_folder = current_app.config['UPLOAD_FOLDER']
        
        # Verificar si necesitamos crear un enlace simbólico o copiar el archivo al directorio de la aplicación
        app_file_path = os.path.join(app_upload_folder, filename)
        if not os.path.exists(app_file_path):
            try:
                # Intentar crear un enlace simbólico primero (más eficiente)
                if hasattr(os, 'symlink'):
                    os.symlink(file_path, app_file_path)
                    current_app.logger.info(f"Created symlink to persistent image: {filename}")
                else:
                    # En sistemas que no soportan symlinks (como Windows), copiar el archivo
                    shutil.copy2(file_path, app_file_path)
                    current_app.logger.info(f"Copied persistent image to app directory: {filename}")
            except Exception as e:
                current_app.logger.error(f"Error linking/copying image to app directory: {str(e)}")
                # Si falla la creación del enlace/copia, aún podemos usar la ruta directa
        
        return filename
    except Exception as e:
        current_app.logger.error(f"Error saving profile image: {str(e)}")
        return 'default_profile.png' 