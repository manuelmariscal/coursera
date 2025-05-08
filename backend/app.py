import os
import sys
import json
import random
import string
import time
import datetime
from datetime import datetime, timedelta
import base64
import uuid
import qrcode
from io import BytesIO
from PIL import Image
from functools import wraps
import jwt
from flask import Flask, jsonify, request, abort, render_template, send_file
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
import requests

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URI', 'sqlite:///motosegura.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Función para obtener la IP real del cliente considerando proxies
def get_real_ip():
    # Primero intentamos obtener la IP de X-Forwarded-For
    forwarded_for = request.headers.get('X-Forwarded-For')
    if forwarded_for:
        # X-Forwarded-For puede contener múltiples IPs, tomamos la primera (cliente original)
        return forwarded_for.split(',')[0].strip()
    
    # Si no hay X-Forwarded-For, intentamos con X-Real-IP
    real_ip = request.headers.get('X-Real-IP')
    if real_ip:
        return real_ip
    
    # Si no hay headers de proxy, usamos la IP remota
    return request.remote_addr

# Configuración de rate limiter con límite global más estricto
limiter = Limiter(
    app=app,
    key_func=get_real_ip,  # Usar la función personalizada para obtener la IP real
    default_limits=["10 per minute"],  # Límite global de 10 solicitudes por minuto por IP
    storage_uri=os.environ.get('REDIS_URL', 'memory://'),  # Usar Redis si está disponible, memoria en caso contrario
    strategy="fixed-window"  # Estrategia de ventana fija para el conteo
)

# Secret key para JWT - from environment variables
JWT_SECRET = os.environ.get('JWT_SECRET', 'dev-jwt-secret')
JWT_EXPIRATION_HOURS = int(os.environ.get('JWT_EXPIRATION_HOURS', '24'))

# API Key para operaciones privilegiadas - from environment variables
API_KEY = os.environ.get('API_KEY', 'dev-api-key')

# Directorio para guardar fotos - usar una ubicación persistente
UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER', 'uploads')
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Function to download and save the default profile image if it doesn't exist
def ensure_default_profile_image():
    default_image_path = os.path.join(app.config['UPLOAD_FOLDER'], 'default.png')
    if not os.path.exists(default_image_path):
        print("Default profile image not found. Downloading...")
        url = 'https://via.placeholder.com/200?text=Default+Profile'
        response = requests.get(url, stream=True)
        if response.status_code == 200:
            with open(default_image_path, 'wb') as out_file:
                out_file.write(response.content)
            print("Default profile image downloaded and saved.")
        else:
            print("Failed to download default profile image.")

# Call the function to ensure the default profile image exists
ensure_default_profile_image()

# Database Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    role = db.Column(db.String(20), nullable=False, default='user')
    phone = db.Column(db.String(20), nullable=True)
    address = db.Column(db.String(200), nullable=True)
    
    def to_dict(self, exclude_password=True):
        data = {
            'id': self.id,
            'username': self.username,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'phone': self.phone,
            'address': self.address
        }
        if not exclude_password:
            data['password'] = self.password
        return data

class FichaMedica(db.Model):
    id = db.Column(db.String(10), primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    apellido = db.Column(db.String(100), nullable=False)
    tipo_sangre = db.Column(db.String(10), nullable=False)
    contacto_emergencia = db.Column(db.String(100), nullable=False)
    numero_contacto = db.Column(db.String(20), nullable=False)
    alergias = db.Column(db.String(200), nullable=True)
    medicaciones = db.Column(db.String(200), nullable=True)
    foto_url = db.Column(db.String(200), nullable=True, default='default.jpg')
    fecha_registro = db.Column(db.String(10), nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'apellido': self.apellido,
            'tipo_sangre': self.tipo_sangre,
            'contacto_emergencia': self.contacto_emergencia,
            'numero_contacto': self.numero_contacto,
            'alergias': self.alergias,
            'medicaciones': self.medicaciones,
            'foto_url': self.foto_url,
            'fecha_registro': self.fecha_registro
        }

class UserRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    record_id = db.Column(db.String(10), db.ForeignKey('ficha_medica.id'), nullable=False)
    status = db.Column(db.String(20), nullable=False, default='Active')
    created_at = db.Column(db.String(10), nullable=False)
    
    user = db.relationship('User', backref=db.backref('records', lazy=True))
    ficha = db.relationship('FichaMedica', backref=db.backref('user_records', lazy=True))
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'record_id': self.record_id,
            'status': self.status,
            'created_at': self.created_at
        }

# Initialize database
def init_db():
    with app.app_context():
        # Create all tables if they don't exist
        db.create_all()

# Decorador para verificar token JWT
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Verificar si el token está en el header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
        
        if not token:
            return jsonify({'message': 'Token no proporcionado'}), 401
        
        try:
            # Decodificar el token
            data = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            current_user = User.query.get(data["user_id"])
            
            if not current_user:
                return jsonify({'message': 'Usuario no válido'}), 401
                
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token expirado'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token inválido'}), 401
            
        return f(current_user, *args, **kwargs)
    
    return decorated

def generar_id_unico():
    """Genera un ID único alfanumérico de 6 caracteres"""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

def verificar_api_key():
    """Verifica si la solicitud contiene una API key válida"""
    api_key = request.headers.get('X-API-Key')
    if api_key != API_KEY:
        abort(403, description="API key inválida o faltante")
    return True

# Endpoints de autenticación
@app.route('/api/auth/login', methods=['POST'])
@limiter.limit("5 per minute")  # Más restrictivo para prevenir ataques de fuerza bruta
def login():
    """Endpoint para iniciar sesión"""
    data = request.json
    
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'message': 'Datos de inicio de sesión requeridos'}), 400
    
    username = data.get('username')
    password = data.get('password')
    
    user = User.query.filter_by(username=username).first()
    
    if not user or user.password != password:  # En una aplicación real, usar verificación de hash
        return jsonify({'message': 'Credenciales inválidas'}), 401
    
    # Generar token JWT
    token_payload = {
        'user_id': user.id,
        'exp': datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    
    token = jwt.encode(token_payload, JWT_SECRET, algorithm="HS256")
    
    return jsonify({
        'message': 'Inicio de sesión exitoso',
        'token': token,
        'user': user.to_dict()
    })

@app.route('/api/auth/me', methods=['GET'])
@token_required
def get_user_info(current_user):
    """Obtener información del usuario autenticado"""
    return jsonify(current_user.to_dict())

@app.route('/api/users/profile', methods=['GET'])
@token_required
def get_user_profile(current_user):
    """Obtener perfil completo del usuario"""
    return jsonify(current_user.to_dict())

@app.route('/api/users/profile', methods=['PUT'])
@token_required
def update_user_profile(current_user):
    """Actualizar perfil del usuario"""
    data = request.json
    
    # Campos que no se pueden actualizar
    restricted_fields = ['id', 'username', 'password', 'role']
    
    # Actualizar los campos permitidos
    for key, value in data.items():
        if key not in restricted_fields:
            setattr(current_user, key, value)
    
    db.session.commit()
    
    return jsonify({
        'message': 'Perfil actualizado con éxito',
        'user': current_user.to_dict()
    })

@app.route('/api/records/user', methods=['GET'])
@token_required
def get_user_records(current_user):
    """Obtener fichas médicas del usuario"""
    user_record_items = UserRecord.query.filter_by(user_id=current_user.id).all()
    
    records = []
    for user_record in user_record_items:
        ficha = FichaMedica.query.get(user_record.record_id)
        if ficha:
            record_data = {
                'id': ficha.id,
                'nombre': ficha.nombre,
                'apellido': ficha.apellido,
                'status': user_record.status,
                'created_at': user_record.created_at
            }
            records.append(record_data)
    
    return jsonify(records)

@app.route('/')
def hello():
    return jsonify({"status": "ok", "message": "MotoSegura API is running"})

@app.route('/health')
def health():
    """Health check endpoint."""
    return jsonify({"status": "healthy"})

@app.route('/api/fichas', methods=['GET'])
@limiter.limit("10 per minute")  # Límite estándar para consultas generales
def get_fichas():
    """Obtener todas las fichas médicas."""
    fichas = FichaMedica.query.all()
    return jsonify({"status": "success", "fichas": [ficha.to_dict() for ficha in fichas]})

@app.route('/api/fichas/<ficha_id>', methods=['GET'])
@limiter.limit("15 per minute")  # Un poco más permisivo para consultas individuales
def get_ficha(ficha_id):
    """Obtener una ficha médica por ID."""
    ficha = FichaMedica.query.get(ficha_id)
    if ficha:
        return jsonify({"status": "success", "ficha": ficha.to_dict()})
    else:
        abort(404, description="Ficha médica no encontrada")

@app.route('/api/fichas', methods=['POST'])
@limiter.limit("10 per minute")
def add_ficha():
    """Añadir una nueva ficha médica."""
    data = request.json
    
    # Validar datos mínimos requeridos
    required_fields = ['nombre', 'apellido', 'tipo_sangre', 'contacto_emergencia', 'numero_contacto']
    for field in required_fields:
        if field not in data:
            abort(400, description=f"Campo requerido: {field}")
    
    # Generar ID único
    nuevo_id = generar_id_unico()
    while FichaMedica.query.get(nuevo_id):
        nuevo_id = generar_id_unico()  # Regenerar si existe
    
    # Crear nueva ficha médica
    nueva_ficha = FichaMedica(
        id=nuevo_id,
        nombre=data.get('nombre'),
        apellido=data.get('apellido'),
        tipo_sangre=data.get('tipo_sangre'),
        contacto_emergencia=data.get('contacto_emergencia'),
        numero_contacto=data.get('numero_contacto'),
        alergias=data.get('alergias', 'Ninguna'),
        medicaciones=data.get('medicaciones', 'Ninguna'),
        foto_url="default.jpg",
        fecha_registro=time.strftime('%Y-%m-%d')
    )
    
    db.session.add(nueva_ficha)
    db.session.commit()
    
    return jsonify({
        "status": "success", 
        "message": "Ficha médica registrada con éxito", 
        "ficha": nueva_ficha.to_dict(),
        "qr_url": f"https://motosegura.online/fichas/{nuevo_id}"
    }), 201

@app.route('/api/fichas/<ficha_id>', methods=['PUT'])
@limiter.limit("5 per minute")  # Más restrictivo para actualizaciones
def update_ficha(ficha_id):
    """Actualizar una ficha médica existente (requiere API key)."""
    try:
        verificar_api_key()
    except:
        # Permitir actualización sólo de la foto sin API key
        if request.json and len(request.json) == 1 and 'foto_url' in request.json:
            pass
        else:
            abort(403, description="API key requerida para modificar la ficha médica")
    
    ficha = FichaMedica.query.get(ficha_id)
    
    if not ficha:
        abort(404, description="Ficha médica no encontrada")
    
    data = request.json
    
    # Actualizar campos
    for key, value in data.items():
        if key != 'id' and key != 'fecha_registro':  # No permitir cambiar ciertos campos
            setattr(ficha, key, value)
    
    db.session.commit()
    
    return jsonify({"status": "success", "message": "Ficha médica actualizada con éxito", "ficha": ficha.to_dict()})

@app.route('/api/fichas/<ficha_id>', methods=['DELETE'])
@limiter.limit("3 per minute")  # Muy restrictivo para eliminaciones
def delete_ficha(ficha_id):
    """Eliminar una ficha médica (requiere API key)."""
    verificar_api_key()
    
    ficha = FichaMedica.query.get(ficha_id)
    
    if not ficha:
        abort(404, description="Ficha médica no encontrada")
    
    ficha_data = ficha.to_dict()
    
    # Eliminar registros de usuario asociados
    UserRecord.query.filter_by(record_id=ficha_id).delete()
    
    db.session.delete(ficha)
    db.session.commit()
    
    return jsonify({"status": "success", "message": "Ficha médica eliminada con éxito", "ficha": ficha_data})

@app.route('/api/buscar/fichas', methods=['GET'])
@limiter.limit("10 per minute")  # Límite estándar para búsquedas
def search_fichas():
    """Buscar fichas médicas por nombre o apellido."""
    nombre = request.args.get('nombre', '')
    apellido = request.args.get('apellido', '')
    
    query = FichaMedica.query
    
    if nombre:
        query = query.filter(FichaMedica.nombre.ilike(f"%{nombre}%"))
    
    if apellido:
        query = query.filter(FichaMedica.apellido.ilike(f"%{apellido}%"))
    
    fichas = query.all()
    
    return jsonify({"status": "success", "fichas": [ficha.to_dict() for ficha in fichas]})

@app.route('/api/qr/<ficha_id>')
@limiter.limit("60 per minute")
def generate_qr(ficha_id):
    """Genera un código QR para la ficha médica."""
    ficha = FichaMedica.query.get(ficha_id)
    if not ficha:
        abort(404, description="Ficha médica no encontrada")

    # Crear la URL completa a la que apuntará el QR (frontend)
    qr_data = f"https://motosegura.online/fichas/{ficha_id}"

    # Generar el código QR
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(qr_data)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")

    # Convertir la imagen a bytes para enviarla
    img_io = BytesIO()
    img.save(img_io, 'PNG')
    img_io.seek(0)

    return send_file(img_io, mimetype='image/png')

@app.route('/api/upload_photo/<ficha_id>', methods=['POST'])
@limiter.limit("5 per minute")  # Restrictivo para subida de archivos
def upload_photo(ficha_id):
    """Subir foto de perfil para una ficha médica."""
    if 'file' not in request.files:
        return jsonify({"status": "error", "message": "No se envió ningún archivo"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"status": "error", "message": "No se seleccionó ningún archivo"}), 400
    
    ficha = FichaMedica.query.get(ficha_id)
    if not ficha:
        abort(404, description="Ficha médica no encontrada")
    
    # Guardar archivo con nombre persistente vinculado al ID de la ficha
    filename = f"{ficha_id}.jpg"
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)
    
    # Actualizar la ficha médica con la nueva foto
    ficha.foto_url = filename
    db.session.commit()
    
    return jsonify({
        "status": "success", 
        "message": "Foto subida con éxito", 
        "foto_url": filename,
        "ficha": ficha.to_dict()
    })

@app.route('/uploads/<filename>')
def get_uploaded_file(filename):
    """Obtener una foto subida."""
    return send_file(os.path.join(app.config['UPLOAD_FOLDER'], filename))

@app.errorhandler(404)
def resource_not_found(e):
    return jsonify(error=str(e)), 404

@app.errorhandler(400)
def bad_request(e):
    return jsonify(error=str(e)), 400

@app.errorhandler(403)
def forbidden(e):
    return jsonify(error=str(e)), 403

@app.errorhandler(429)
def ratelimit_handler(e):
    """Manejar excesos de rate limit con un mensaje claro"""
    ip = get_real_ip()
    endpoint = request.path
    return jsonify({
        "status": "error", 
        "message": f"Límite de solicitudes excedido. Por favor, espere antes de realizar más solicitudes.",
        "details": str(e),
        "endpoint": endpoint,
        "reset": getattr(e, 'reset_at', None)
    }), 429

if __name__ == '__main__':
    # Configuración para producción vs desarrollo
    DEBUG_MODE = os.environ.get('FLASK_DEBUG', 'False').lower() in ('true', '1', 't')
    HOST = os.environ.get('FLASK_HOST', '0.0.0.0')
    PORT = int(os.environ.get('FLASK_PORT', 5000))
    
    # Directorio de uploads basado en variable de entorno
    UPLOAD_DIR = os.environ.get('UPLOAD_DIR', 'uploads')
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)
    app.config['UPLOAD_FOLDER'] = UPLOAD_DIR
    
    # Inicializar la base de datos antes de ejecutar la aplicación
    init_db()
    
    app.run(host=HOST, port=PORT, debug=DEBUG_MODE)