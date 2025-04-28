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
try:
    import jwt
except ImportError:
    import PyJWT as jwt
from flask import Flask, jsonify, request, abort, render_template, send_file
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

app = Flask(__name__)
CORS(app)

# Configuración de rate limiter
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

# Secret key para JWT
JWT_SECRET = "motosegura-jwt-secret-2023"
JWT_EXPIRATION_HOURS = 24

# API Key para operaciones privilegiadas - en un sistema real, esto estaría en una base de datos
API_KEY = "motosegura-api-key-2023"

# Directorio para guardar fotos
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Base de datos en memoria para usuarios
users = [
    {
        "id": 1,
        "username": "admin",
        "password": "admin123",
        "name": "Administrador",
        "email": "admin@motosegura.com",
        "role": "admin",
        "phone": "+57 3123456789",
        "address": "Calle Principal #123, Bogotá"
    },
    {
        "id": 2,
        "username": "user",
        "password": "user123",
        "name": "Usuario Estándar",
        "email": "user@motosegura.com",
        "role": "user",
        "phone": "+57 3198765432",
        "address": "Avenida Central #456, Medellín"
    }
]

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
            current_user = next((user for user in users if user["id"] == data["user_id"]), None)
            
            if not current_user:
                return jsonify({'message': 'Usuario no válido'}), 401
                
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token expirado'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token inválido'}), 401
            
        return f(current_user, *args, **kwargs)
    
    return decorated

# Base de datos en memoria para almacenar fichas médicas
fichas_medicas = [
    {
        "id": "ABC123",
        "nombre": "Juan",
        "apellido": "Pérez",
        "tipo_sangre": "O+",
        "contacto_emergencia": "María Pérez",
        "numero_contacto": "+57 3123456789",
        "alergias": "Penicilina",
        "medicaciones": "Ninguna",
        "foto_url": "default.jpg",
        "fecha_registro": "2023-01-15"
    },
    {
        "id": "XYZ789",
        "nombre": "María",
        "apellido": "López",
        "tipo_sangre": "A-",
        "contacto_emergencia": "Carlos López",
        "numero_contacto": "+57 3198765432",
        "alergias": "Ninguna",
        "medicaciones": "Insulina",
        "foto_url": "default.jpg",
        "fecha_registro": "2023-02-20"
    }
]

# Base de datos en memoria para motos registradas por usuario
user_motorcycles = [
    {
        "id": 1,
        "user_id": 1,
        "marca": "Yamaha",
        "modelo": "MT-09",
        "anio": 2022,
        "matricula": "ABC123",
        "color": "Negro",
        "fecha_registro": "2023-01-10"
    },
    {
        "id": 2,
        "user_id": 2,
        "marca": "Honda",
        "modelo": "CBR 500",
        "anio": 2021,
        "matricula": "XYZ789",
        "color": "Rojo",
        "fecha_registro": "2023-02-15"
    },
    {
        "id": 3,
        "user_id": 1,
        "marca": "Suzuki",
        "modelo": "GSX-R750",
        "anio": 2023,
        "matricula": "DEF456",
        "color": "Azul",
        "fecha_registro": "2023-03-20"
    }
]

# Base de datos en memoria para fichas médicas asignadas a usuarios
user_records = [
    {
        "id": 1,
        "user_id": 1,
        "record_id": "ABC123",
        "status": "Active",
        "created_at": "2023-01-20"
    },
    {
        "id": 2,
        "user_id": 2,
        "record_id": "XYZ789",
        "status": "Active",
        "created_at": "2023-02-25"
    }
]

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
@limiter.limit("5 per minute")
def login():
    """Endpoint para iniciar sesión"""
    data = request.json
    
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'message': 'Datos de inicio de sesión requeridos'}), 400
    
    username = data.get('username')
    password = data.get('password')
    
    user = next((user for user in users if user["username"] == username and user["password"] == password), None)
    
    if not user:
        return jsonify({'message': 'Credenciales inválidas'}), 401
    
    # Generar token JWT
    token_payload = {
        'user_id': user['id'],
        'exp': datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    
    token = jwt.encode(token_payload, JWT_SECRET, algorithm="HS256")
    
    # Crear copia del usuario sin la contraseña
    user_data = {k: v for k, v in user.items() if k != 'password'}
    
    return jsonify({
        'message': 'Inicio de sesión exitoso',
        'token': token,
        'user': user_data
    })

@app.route('/api/auth/me', methods=['GET'])
@token_required
def get_user_info(current_user):
    """Obtener información del usuario autenticado"""
    # Crear copia del usuario sin la contraseña
    user_data = {k: v for k, v in current_user.items() if k != 'password'}
    
    return jsonify(user_data)

@app.route('/api/users/profile', methods=['GET'])
@token_required
def get_user_profile(current_user):
    """Obtener perfil completo del usuario"""
    # Crear copia del usuario sin la contraseña
    profile_data = {k: v for k, v in current_user.items() if k != 'password'}
    
    return jsonify(profile_data)

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
            current_user[key] = value
    
    # Crear copia del usuario sin la contraseña
    profile_data = {k: v for k, v in current_user.items() if k != 'password'}
    
    return jsonify({
        'message': 'Perfil actualizado con éxito',
        'user': profile_data
    })

@app.route('/api/motorcycles/user', methods=['GET'])
@token_required
def get_user_motorcycles(current_user):
    """Obtener motocicletas del usuario"""
    user_id = current_user['id']
    motorcycles = [moto for moto in user_motorcycles if moto['user_id'] == user_id]
    
    return jsonify(motorcycles)

@app.route('/api/records/user', methods=['GET'])
@token_required
def get_user_records(current_user):
    """Obtener fichas médicas del usuario"""
    user_id = current_user['id']
    records = []
    
    # Obtener IDs de fichas asignadas al usuario
    user_record_ids = [record for record in user_records if record['user_id'] == user_id]
    
    # Obtener detalles completos de cada ficha
    for user_record in user_record_ids:
        ficha = next((f for f in fichas_medicas if f['id'] == user_record['record_id']), None)
        if ficha:
            record_data = {
                'id': ficha['id'],
                'nombre': ficha['nombre'],
                'apellido': ficha['apellido'],
                'status': user_record['status'],
                'created_at': user_record['created_at']
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
@limiter.limit("30 per minute")
def get_fichas():
    """Obtener todas las fichas médicas."""
    return jsonify({"status": "success", "fichas": fichas_medicas})

@app.route('/api/fichas/<ficha_id>', methods=['GET'])
@limiter.limit("60 per minute")
def get_ficha(ficha_id):
    """Obtener una ficha médica por ID."""
    ficha = next((f for f in fichas_medicas if f["id"] == ficha_id), None)
    if ficha:
        return jsonify({"status": "success", "ficha": ficha})
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
    while next((f for f in fichas_medicas if f["id"] == nuevo_id), None):
        nuevo_id = generar_id_unico()  # Regenerar si existe
    
    # Crear nueva ficha médica
    nueva_ficha = {
        "id": nuevo_id,
        "nombre": data.get('nombre'),
        "apellido": data.get('apellido'),
        "tipo_sangre": data.get('tipo_sangre'),
        "contacto_emergencia": data.get('contacto_emergencia'),
        "numero_contacto": data.get('numero_contacto'),
        "alergias": data.get('alergias', 'Ninguna'),
        "medicaciones": data.get('medicaciones', 'Ninguna'),
        "foto_url": "default.jpg",
        "fecha_registro": time.strftime('%Y-%m-%d')
    }
    
    fichas_medicas.append(nueva_ficha)
    return jsonify({
        "status": "success", 
        "message": "Ficha médica registrada con éxito", 
        "ficha": nueva_ficha,
        "qr_url": f"/api/qr/{nuevo_id}"
    }), 201

@app.route('/api/fichas/<ficha_id>', methods=['PUT'])
@limiter.limit("10 per minute")
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
    
    ficha_index = next((i for i, f in enumerate(fichas_medicas) if f["id"] == ficha_id), None)
    
    if ficha_index is None:
        abort(404, description="Ficha médica no encontrada")
    
    data = request.json
    ficha = fichas_medicas[ficha_index]
    
    # Actualizar campos
    for key, value in data.items():
        if key in ficha and key != 'id' and key != 'fecha_registro':  # No permitir cambiar ciertos campos
            ficha[key] = value
    
    return jsonify({"status": "success", "message": "Ficha médica actualizada con éxito", "ficha": ficha})

@app.route('/api/fichas/<ficha_id>', methods=['DELETE'])
@limiter.limit("5 per minute")
def delete_ficha(ficha_id):
    """Eliminar una ficha médica (requiere API key)."""
    verificar_api_key()
    
    ficha_index = next((i for i, f in enumerate(fichas_medicas) if f["id"] == ficha_id), None)
    
    if ficha_index is None:
        abort(404, description="Ficha médica no encontrada")
    
    deleted_ficha = fichas_medicas.pop(ficha_index)
    return jsonify({"status": "success", "message": "Ficha médica eliminada con éxito", "ficha": deleted_ficha})

@app.route('/api/buscar/fichas', methods=['GET'])
@limiter.limit("30 per minute")
def search_fichas():
    """Buscar fichas médicas por nombre o apellido."""
    nombre = request.args.get('nombre', '')
    apellido = request.args.get('apellido', '')
    
    results = []
    
    if nombre:
        results.extend([f for f in fichas_medicas if nombre.lower() in f['nombre'].lower()])
    
    if apellido:
        results.extend([f for f in fichas_medicas if apellido.lower() in f['apellido'].lower()])
    
    # Eliminar duplicados
    unique_results = []
    unique_ids = set()
    for ficha in results:
        if ficha['id'] not in unique_ids:
            unique_ids.add(ficha['id'])
            unique_results.append(ficha)
    
    return jsonify({"status": "success", "fichas": unique_results})

@app.route('/api/qr/<ficha_id>')
@limiter.limit("60 per minute")
def generate_qr(ficha_id):
    """Genera un código QR para la ficha médica."""
    ficha = next((f for f in fichas_medicas if f["id"] == ficha_id), None)
    if not ficha:
        abort(404, description="Ficha médica no encontrada")
    
    # Crear la URL completa a la que apuntará el QR (frontend)
    qr_data = f"{request.host_url}ficha/{ficha_id}"
    
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
@limiter.limit("10 per minute")
def upload_photo(ficha_id):
    """Subir foto de perfil para una ficha médica."""
    if 'file' not in request.files:
        return jsonify({"status": "error", "message": "No se envió ningún archivo"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"status": "error", "message": "No se seleccionó ningún archivo"}), 400
    
    ficha = next((f for f in fichas_medicas if f["id"] == ficha_id), None)
    if not ficha:
        abort(404, description="Ficha médica no encontrada")
    
    # Guardar archivo
    filename = f"{ficha_id}_{int(time.time())}.jpg"
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)
    
    # Actualizar la ficha médica con la nueva foto
    ficha['foto_url'] = filename
    
    return jsonify({"status": "success", "message": "Foto subida con éxito", "foto_url": filename})

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
    return jsonify(error=f"Rate limit excedido: {str(e)}"), 429

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
    
    app.run(host=HOST, port=PORT, debug=DEBUG_MODE) 