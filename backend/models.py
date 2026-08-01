from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timezone
import json

db = SQLAlchemy()

class Hospital(db.Model):
    __tablename__ = 'hospitals'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    code = db.Column(db.String(50), unique=True, nullable=False)
    address = db.Column(db.Text)
    phone = db.Column(db.String(50))
    email = db.Column(db.String(120))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    is_active = db.Column(db.Boolean, default=True)
    
    # Relationships
    users = db.relationship('User', backref='hospital', lazy=True)
    patients = db.relationship('Patient', backref='hospital', lazy=True)
    appointments = db.relationship('Appointment', backref='hospital', lazy=True)
    consultations = db.relationship('Consultation', backref='hospital', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'code': self.code,
            'address': self.address,
            'phone': self.phone,
            'email': self.email,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'is_active': self.is_active,
            'user_count': len(self.users),
            'patient_count': len(self.patients)
        }

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    hospital_id = db.Column(db.Integer, db.ForeignKey('hospitals.id'), nullable=True)
    is_super_admin = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    patients = db.relationship('Patient', foreign_keys='Patient.doctor_id', backref='doctor', lazy=True)
    doctor_appointments = db.relationship('Appointment', foreign_keys='Appointment.doctor_id', backref='doctor', lazy=True)
    receptionist_appointments = db.relationship('Appointment', foreign_keys='Appointment.receptionist_id', backref='receptionist', lazy=True)
    consultations = db.relationship('Consultation', foreign_keys='Consultation.doctor_id', backref='doctor', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'full_name': self.full_name,
            'hospital_id': self.hospital_id,
            'hospital_name': self.hospital.name if self.hospital else None,
            'is_super_admin': self.is_super_admin,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Patient(db.Model):
    __tablename__ = 'patients'
    
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120))
    phone = db.Column(db.String(20), nullable=False)
    date_of_birth = db.Column(db.Date, nullable=False)
    address = db.Column(db.Text)
    gender = db.Column(db.String(10))
    blood_group = db.Column(db.String(5))
    emergency_contact = db.Column(db.String(20))
    registration_date = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    doctor_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    hospital_id = db.Column(db.Integer, db.ForeignKey('hospitals.id'), nullable=False)
    
    # Relationships
    consultations = db.relationship('Consultation', backref='patient', lazy='dynamic', cascade='all, delete-orphan')
    appointments = db.relationship('Appointment', backref='patient', lazy='dynamic')
    
    @property
    def total_visits(self):
        return self.consultations.count()
    
    @property
    def is_returning(self):
        return self.total_visits > 0
    
    @property
    def last_visit_date(self):
        last = self.consultations.order_by(Consultation.consultation_date.desc()).first()
        return last.consultation_date if last else None
    
    @property
    def next_visit_number(self):
        return self.total_visits + 1
    
    def to_dict(self):
        return {
            'id': self.id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'full_name': f"{self.first_name} {self.last_name}",
            'email': self.email,
            'phone': self.phone,
            'date_of_birth': self.date_of_birth.isoformat() if self.date_of_birth else None,
            'gender': self.gender,
            'blood_group': self.blood_group,
            'address': self.address,
            'emergency_contact': self.emergency_contact,
            'doctor_id': self.doctor_id,
            'doctor_name': self.doctor.full_name if self.doctor else None,
            'hospital_id': self.hospital_id,
            'hospital_name': self.hospital.name if self.hospital else None,
            'registration_date': self.registration_date.isoformat() if self.registration_date else None,
            'total_visits': self.total_visits,
            'is_returning': self.is_returning,
            'last_visit': self.last_visit_date.isoformat() if self.last_visit_date else None,
            'next_visit_number': self.next_visit_number,
            'visit_history': [c.to_dict() for c in self.consultations.order_by(Consultation.consultation_date.desc()).all()]
        }

class Appointment(db.Model):
    __tablename__ = 'appointments'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    receptionist_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    hospital_id = db.Column(db.Integer, db.ForeignKey('hospitals.id'), nullable=False)
    appointment_date = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(20), default='scheduled')
    reason = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    consultation = db.relationship('Consultation', backref='appointment', uselist=False, lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'patient_name': f"{self.patient.first_name} {self.patient.last_name}" if self.patient else None,
            'doctor_id': self.doctor_id,
            'doctor_name': self.doctor.full_name if self.doctor else None,
            'receptionist_id': self.receptionist_id,
            'hospital_id': self.hospital_id,
            'hospital_name': self.hospital.name if self.hospital else None,
            'appointment_date': self.appointment_date.isoformat(),
            'status': self.status,
            'reason': self.reason,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Consultation(db.Model):
    __tablename__ = 'consultations'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    appointment_id = db.Column(db.Integer, db.ForeignKey('appointments.id'))
    hospital_id = db.Column(db.Integer, db.ForeignKey('hospitals.id'), nullable=False)
    complaint = db.Column(db.Text)
    examination = db.Column(db.Text)
    diagnosis = db.Column(db.Text, nullable=False)
    prescription = db.Column(db.Text, nullable=False)
    notes = db.Column(db.Text)
    consultation_date = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    follow_up_date = db.Column(db.Date)
    images = db.Column(db.Text)
    
    # Relationships
    prescribed_medicines = db.relationship('Medicine', backref='consultation', lazy=True, cascade='all, delete-orphan')
    
    def set_images(self, images_data):
        self.images = json.dumps(images_data) if images_data else None
    
    def get_images(self):
        if self.images:
            return json.loads(self.images)
        return []
    
    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'doctor_id': self.doctor_id,
            'doctor_name': self.doctor.full_name if self.doctor else None,
            'hospital_id': self.hospital_id,
            'hospital_name': self.hospital.name if self.hospital else None,
            'complaint': self.complaint,
            'examination': self.examination,
            'diagnosis': self.diagnosis,
            'prescription': self.prescription,
            'notes': self.notes,
            'consultation_date': self.consultation_date.isoformat() if self.consultation_date else None,
            'medicines': [m.to_dict() for m in self.prescribed_medicines],
            'images': self.get_images()
        }

class Medicine(db.Model):
    __tablename__ = 'medicines'
    
    id = db.Column(db.Integer, primary_key=True)
    consultation_id = db.Column(db.Integer, db.ForeignKey('consultations.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    dosage = db.Column(db.String(50), nullable=False)
    frequency = db.Column(db.String(50), nullable=False)
    duration = db.Column(db.String(50))
    instructions = db.Column(db.Text)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'dosage': self.dosage,
            'frequency': self.frequency,
            'duration': self.duration,
            'instructions': self.instructions
        }