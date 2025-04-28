from flask_sqlalchemy import SQLAlchemy
from flask import request
import datetime

db = SQLAlchemy()

class MedicalRecord(db.Model):
    __tablename__ = 'medical_records'
    
    id = db.Column(db.String(10), primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    blood_type = db.Column(db.String(5), nullable=False)
    emergency_contact_name = db.Column(db.String(100), nullable=False)
    emergency_contact_phone = db.Column(db.String(20), nullable=False)
    allergies = db.Column(db.Text, nullable=True)
    medications = db.Column(db.Text, nullable=True)
    profile_image = db.Column(db.String(255), default='default_profile.png')
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    def to_dict(self, include_image_url=False):
        """
        Convierte el registro médico a un diccionario.
        
        Args:
            include_image_url (bool): Si es True, incluye la URL absoluta de la imagen.
        
        Returns:
            dict: Diccionario con los datos del registro médico.
        """
        record_dict = {
            'id': self.id,
            'nombre': self.first_name,
            'apellido': self.last_name,
            'tipo_sangre': self.blood_type,
            'contacto_emergencia': self.emergency_contact_name,
            'numero_contacto': self.emergency_contact_phone,
            'alergias': self.allergies or '',
            'medicaciones': self.medications or '',
            'foto_url': self.profile_image,
            'fecha_registro': self.created_at.strftime('%Y-%m-%d')
        }
        
        # Incluir URLs absolutas para las imágenes cuando sea solicitado
        if include_image_url and self.profile_image:
            # Obtener host base desde el request actual
            if request:
                host_url = request.host_url.rstrip('/')
                record_dict['foto_url_completa'] = f"{host_url}/uploads/{self.profile_image}"
        
        return record_dict 