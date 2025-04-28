from flask import Blueprint, request, jsonify, send_from_directory, render_template, current_app
from .models import db, MedicalRecord
from .utils import generate_qr_code, require_api_key, save_profile_image
import os
from werkzeug.exceptions import BadRequest, NotFound

main = Blueprint('main', __name__)

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
        
        qr_code = generate_qr_code(f"http://localhost:5001/record/{record.id}")
        
        return jsonify({
            'message': 'Record created successfully',
            'record': record.to_dict(),
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
        
        return jsonify(record.to_dict())
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
        return jsonify(record.to_dict())
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

@main.route('/uploads/<filename>')
def uploaded_file(filename):
    try:
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