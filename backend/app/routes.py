from flask import Blueprint, request, jsonify, send_from_directory, render_template, current_app, url_for, after_this_request
from .models import db, MedicalRecord
from .utils import generate_qr_code, require_api_key, save_profile_image, get_persistent_upload_folder
import os
from werkzeug.exceptions import BadRequest, NotFound
import requests
from flask_cors import cross_origin

main = Blueprint('main', __name__)

# Añadir encabezados CORS a todas las respuestas
@main.after_request
def add_cors_headers(response):
    # Permitir solicitudes desde cualquier origen - siempre usar '*'
    response.headers.add('Access-Control-Allow-Origin', '*')
    # Permitir métodos específicos
    response.headers.add('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    # Permitir encabezados específicos 
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type, X-API-Key, X-Mobile-Device, Origin')
    # Permitir cookies (si es necesario)
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    # Configuración de caché para encabezados CORS
    response.headers.add('Access-Control-Max-Age', '3600')
    return response

# Determinar si la solicitud proviene de un dispositivo móvil
def is_mobile_device():
    return 'X-Mobile-Device' in request.headers

# Frontend routes
@main.route('/')
def index():
    return render_template('index.html')

@main.route('/record/<record_id>')
def view_record(record_id):
    record = MedicalRecord.query.get_or_404(record_id)
    return render_template('index.html')

# API routes
@main.route('/api/records', methods=['POST'])
def create_record():
    try:
        data = request.form
        
        # Validate required fields
        required_fields = ['first_name', 'last_name', 'blood_type', 'emergency_contact_name', 'emergency_contact_phone']
        for field in required_fields:
            if field not in data or not data[field].strip():
                return jsonify({'error': f'Field {field} is required'}), 400
        
        # Validate blood type format
        valid_blood_types = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
        if data['blood_type'] not in valid_blood_types:
            return jsonify({'error': 'Invalid blood type. Must be one of: ' + ', '.join(valid_blood_types)}), 400
        
        profile_image = request.files.get('profile_image')
        
        record = MedicalRecord(
            first_name=data['first_name'],
            last_name=data['last_name'],
            blood_type=data['blood_type'],
            emergency_contact_name=data['emergency_contact_name'],
            emergency_contact_phone=data['emergency_contact_phone'],
            allergies=data.get('allergies', ''),
            medications=data.get('medications', '')
        )
        
        db.session.add(record)
        db.session.commit()
        
        if profile_image:
            record.profile_image = save_profile_image(profile_image, record.id)
            db.session.commit()
        
        # Generar la URL para el QR basada en la configuración del backend
        qr_host = request.headers.get('X-Frontend-Host', request.host_url.rstrip('/'))
        qr_code_url = f"{qr_host}/record/{record.id}"
        qr_code = generate_qr_code(qr_code_url)
        
        # Crear URL absoluta para la imagen
        image_url = None
        if record.profile_image and record.profile_image != 'default_profile.png':
            image_url = f"{request.host_url.rstrip('/')}/uploads/{record.profile_image}"
        
        return jsonify({
            'message': 'Record created successfully',
            'record': record.to_dict(include_image_url=True),
            'qr_code': qr_code
        }), 201
    except Exception as e:
        current_app.logger.error(f"Error creating record: {str(e)}")
        return jsonify({'error': 'Failed to create record'}), 500

@main.route('/api/records/<record_id>', methods=['GET'])
def get_record(record_id):
    try:
        record = MedicalRecord.query.get(record_id)
        if not record:
            return jsonify({'error': 'Record not found'}), 404
        
        # Incluir URLs absolutas para las imágenes
        return jsonify(record.to_dict(include_image_url=True))
    except Exception as e:
        current_app.logger.error(f"Error getting record: {str(e)}")
        return jsonify({'error': 'Failed to get record'}), 500

@main.route('/api/records/<record_id>', methods=['PUT'])
@require_api_key
def update_record(record_id):
    try:
        record = MedicalRecord.query.get(record_id)
        if not record:
            return jsonify({'error': 'Record not found'}), 404
        
        data = request.form
        profile_image = request.files.get('profile_image')
        
        record.first_name = data.get('first_name', record.first_name)
        record.last_name = data.get('last_name', record.last_name)
        record.blood_type = data.get('blood_type', record.blood_type)
        record.emergency_contact_name = data.get('emergency_contact_name', record.emergency_contact_name)
        record.emergency_contact_phone = data.get('emergency_contact_phone', record.emergency_contact_phone)
        record.allergies = data.get('allergies', record.allergies)
        record.medications = data.get('medications', record.medications)
        
        if profile_image:
            record.profile_image = save_profile_image(profile_image, record.id)
        
        db.session.commit()
        return jsonify(record.to_dict(include_image_url=True))
    except Exception as e:
        current_app.logger.error(f"Error updating record: {str(e)}")
        return jsonify({'error': 'Failed to update record'}), 500

@main.route('/api/records/<record_id>', methods=['DELETE'])
@require_api_key
def delete_record(record_id):
    try:
        record = MedicalRecord.query.get(record_id)
        if not record:
            return jsonify({'error': 'Record not found'}), 404
        
        db.session.delete(record)
        db.session.commit()
        return jsonify({'message': 'Record deleted successfully'})
    except Exception as e:
        current_app.logger.error(f"Error deleting record: {str(e)}")
        return jsonify({'error': 'Failed to delete record'}), 500

@main.route('/api/fichas', methods=['GET', 'OPTIONS'])
@cross_origin()
def get_fichas():
    # Manejar solicitudes OPTIONS para CORS
    if request.method == 'OPTIONS':
        return '', 204
        
    try:
        # Registrar información sobre la solicitud
        current_app.logger.info(f"Solicitud de fichas desde: {request.remote_addr}, Agente: {request.user_agent}")
        current_app.logger.info(f"Headers: {request.headers}")
        
        # Obtener todos los registros médicos
        records = MedicalRecord.query.all()
        
        # Convertir a JSON incluyendo URLs absolutas para las imágenes
        fichas = [record.to_dict(include_image_url=True) for record in records]
        
        # Verificar si la solicitud proviene de un dispositivo móvil
        if is_mobile_device():
            current_app.logger.info(f"Solicitud desde dispositivo móvil, devolviendo {len(fichas)} fichas")
        
        response_data = {'status': 'success', 'fichas': fichas}
        current_app.logger.info(f"Enviando respuesta con {len(fichas)} fichas")
        
        return jsonify(response_data)
    except Exception as e:
        current_app.logger.error(f"Error getting fichas: {str(e)}")
        return jsonify({'error': 'Failed to get records', 'details': str(e)}), 500

@main.route('/api/fichas/<ficha_id>', methods=['GET'])
@cross_origin()
def get_ficha(ficha_id):
    try:
        record = MedicalRecord.query.get(ficha_id)
        if not record:
            return jsonify({'error': 'Record not found'}), 404
        
        # Incluir URL absoluta para la imagen
        ficha = record.to_dict(include_image_url=True)
        
        return jsonify({'status': 'success', 'ficha': ficha})
    except Exception as e:
        current_app.logger.error(f"Error getting ficha: {str(e)}")
        return jsonify({'error': 'Failed to get record', 'details': str(e)}), 500

@main.route('/uploads/<filename>')
def uploaded_file(filename):
    try:
        # Agregar encabezados para caché en dispositivos móviles
        @after_this_request
        def add_header(response):
            response.headers['Cache-Control'] = 'public, max-age=86400'  # 24 horas
            return response
            
        # Primero intentar desde el directorio persistente
        persistent_folder = get_persistent_upload_folder()
        persistent_path = os.path.join(persistent_folder, filename)
        
        if os.path.exists(persistent_path):
            return send_from_directory(persistent_folder, filename)
        
        # Si no existe en el persistente, intentar desde el directorio de la aplicación
        return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)
    except Exception as e:
        current_app.logger.error(f"Error serving file: {str(e)}")
        return jsonify({'error': 'Failed to serve file'}), 500

@main.route('/static/<path:filename>')
def static_files(filename):
    try:
        return send_from_directory('static', filename)
    except Exception as e:
        current_app.logger.error(f"Error serving static file: {str(e)}")
        return jsonify({'error': 'Failed to serve static file'}), 500

@main.route('/health')
@cross_origin()
def health_check():
    # Verificar si la solicitud proviene de un dispositivo móvil
    is_mobile = is_mobile_device()
    
    # URL desde la que se hace la solicitud
    referer = request.headers.get('Referer', 'Unknown')
    
    return jsonify({
        'status': 'ok', 
        'message': 'API running normally',
        'is_mobile': is_mobile,
        'referer': referer,
        'remote_addr': request.remote_addr,
        'host': request.host
    }) 