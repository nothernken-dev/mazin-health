from flask import Flask, request, jsonify, g
from flask_cors import CORS
from flask_migrate import Migrate
from datetime import datetime, timezone
import json
from functools import wraps
from models import db, User, Patient, Appointment, Consultation, Medicine, Hospital
from config import Config

app = Flask(__name__)
app.config.from_object(Config)

# CORS configuration
CORS(app, origins=["http://localhost:5173", "http://localhost:3000"], supports_credentials=True)

db.init_app(app)
migrate = Migrate(app, db)

with app.app_context():
    db.create_all()
    print("✅ Database tables created successfully!")

# ============= HELPER FUNCTIONS =============
def get_current_time():
    return datetime.now(timezone.utc)

def get_current_user():
    """Extract current user from request headers"""
    user_id = request.headers.get('X-User-ID')
    if user_id:
        try:
            return User.query.get(int(user_id))
        except (ValueError, TypeError):
            return None
    return None

def hospital_required(f):
    """Decorator to ensure all queries are filtered by hospital_id"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if request.method == 'OPTIONS':
            return '', 200
            
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Authentication required'}), 401
        
        if not user.is_active:
            return jsonify({'error': 'Account is deactivated'}), 403
        
        g.current_user = user
        
        # Super admin has access to all hospitals
        if user.is_super_admin:
            g.current_hospital_id = None
            g.is_super_admin = True
        else:
            if not user.hospital_id:
                return jsonify({'error': 'User not assigned to any hospital'}), 403
            
            hospital = Hospital.query.get(user.hospital_id)
            if not hospital or not hospital.is_active:
                return jsonify({'error': 'Hospital is inactive'}), 403
            
            g.current_hospital_id = user.hospital_id
            g.is_super_admin = False
            
        return f(*args, **kwargs)
    return decorated_function

def super_admin_required(f):
    """Decorator to ensure only super admin can access"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if request.method == 'OPTIONS':
            return '', 200
            
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Authentication required'}), 401
            
        if not user.is_super_admin:
            return jsonify({'error': 'Super admin access required'}), 403
            
        g.current_user = user
        return f(*args, **kwargs)
    return decorated_function

# ============= AUTHENTICATION =============
@app.route('/api/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'error': 'Username and password required'}), 400
        
        user = User.query.filter_by(username=username).first()
        
        if user and user.password == password:
            if not user.is_active:
                return jsonify({'error': 'Account is deactivated'}), 403
            
            response_data = {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role,
                'full_name': user.full_name,
                'hospital_id': user.hospital_id,
                'hospital_name': user.hospital.name if user.hospital else None,
                'is_super_admin': user.is_super_admin,
                'is_active': user.is_active
            }
            
            print(f"✅ Login successful: {username} (Role: {user.role}, Super Admin: {user.is_super_admin})")
            return jsonify(response_data), 200
        else:
            print(f"❌ Login failed: {username}")
            return jsonify({'error': 'Invalid credentials'}), 401
            
    except Exception as e:
        print(f"❌ Login error: {str(e)}")
        return jsonify({'error': 'Server error'}), 500

# ============= HOSPITAL ROUTES =============
@app.route('/api/hospitals', methods=['GET', 'OPTIONS'])
def get_hospitals():
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        hospitals = Hospital.query.all()
        return jsonify([h.to_dict() for h in hospitals]), 200
    except Exception as e:
        print(f"❌ Error getting hospitals: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/hospitals/<int:hospital_id>', methods=['GET', 'OPTIONS'])
def get_hospital(hospital_id):
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        hospital = Hospital.query.get_or_404(hospital_id)
        return jsonify(hospital.to_dict()), 200
    except Exception as e:
        print(f"❌ Error getting hospital: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/hospitals', methods=['POST', 'OPTIONS'])
def create_hospital():
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        data = request.json
        print("📝 Creating hospital:", data)
        
        required = ['name', 'code']
        for field in required:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        existing = Hospital.query.filter_by(code=data['code']).first()
        if existing:
            return jsonify({'error': 'Hospital code already exists'}), 400
        
        new_hospital = Hospital(
            name=data['name'],
            code=data['code'],
            address=data.get('address', ''),
            phone=data.get('phone', ''),
            email=data.get('email', ''),
            is_active=data.get('is_active', True)
        )
        
        db.session.add(new_hospital)
        db.session.commit()
        
        print(f"✅ Hospital created: {new_hospital.code} (ID: {new_hospital.id})")
        
        return jsonify({
            'message': 'Hospital created successfully',
            'hospital': new_hospital.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error creating hospital: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/hospitals/<int:hospital_id>', methods=['PUT', 'OPTIONS'])
def update_hospital(hospital_id):
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        hospital = Hospital.query.get_or_404(hospital_id)
        data = request.json
        
        if 'name' in data:
            hospital.name = data['name']
        if 'code' in data:
            existing = Hospital.query.filter_by(code=data['code']).first()
            if existing and existing.id != hospital_id:
                return jsonify({'error': 'Hospital code already exists'}), 400
            hospital.code = data['code']
        if 'address' in data:
            hospital.address = data['address']
        if 'phone' in data:
            hospital.phone = data['phone']
        if 'email' in data:
            hospital.email = data['email']
        if 'is_active' in data:
            hospital.is_active = data['is_active']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Hospital updated successfully',
            'hospital': hospital.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error updating hospital: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/hospitals/<int:hospital_id>', methods=['DELETE', 'OPTIONS'])
def delete_hospital(hospital_id):
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        hospital = Hospital.query.get_or_404(hospital_id)
        
        user_count = User.query.filter_by(hospital_id=hospital_id).count()
        if user_count > 0:
            return jsonify({'error': 'Cannot delete hospital with associated users'}), 400
        
        db.session.delete(hospital)
        db.session.commit()
        
        return jsonify({'message': 'Hospital deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error deleting hospital: {str(e)}")
        return jsonify({'error': str(e)}), 500

# ============= SUPER ADMIN ROUTES =============
@app.route('/api/super-admin/hospitals', methods=['GET', 'OPTIONS'])
@super_admin_required
def super_admin_get_hospitals():
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        hospitals = Hospital.query.all()
        return jsonify([h.to_dict() for h in hospitals]), 200
    except Exception as e:
        print(f"❌ Error getting hospitals: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/super-admin/hospitals/<int:hospital_id>/toggle', methods=['PUT', 'OPTIONS'])
@super_admin_required
def super_admin_toggle_hospital(hospital_id):
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        hospital = Hospital.query.get_or_404(hospital_id)
        hospital.is_active = not hospital.is_active
        db.session.commit()
        
        return jsonify({
            'message': f'Hospital {"activated" if hospital.is_active else "deactivated"} successfully',
            'hospital': hospital.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error toggling hospital: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/super-admin/users/<int:user_id>/toggle', methods=['PUT', 'OPTIONS'])
@super_admin_required
def super_admin_toggle_user(user_id):
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        user = User.query.get_or_404(user_id)
        
        if user.is_super_admin:
            super_admin_count = User.query.filter_by(is_super_admin=True, is_active=True).count()
            if super_admin_count <= 1 and user.is_active:
                return jsonify({'error': 'Cannot deactivate the last super admin'}), 400
        
        user.is_active = not user.is_active
        db.session.commit()
        
        return jsonify({
            'message': f'User {"activated" if user.is_active else "deactivated"} successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error toggling user: {str(e)}")
        return jsonify({'error': str(e)}), 500

# ============= PATIENT ROUTES =============
@app.route('/api/patients', methods=['GET', 'OPTIONS'])
@hospital_required
def get_patients():
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        query = Patient.query
        if not g.is_super_admin:
            query = query.filter_by(hospital_id=g.current_hospital_id)
        patients = query.all()
        return jsonify([p.to_dict() for p in patients]), 200
    except Exception as e:
        print(f"❌ Error getting patients: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/patients/<int:patient_id>', methods=['GET', 'OPTIONS'])
@hospital_required
def get_patient(patient_id):
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        query = Patient.query.filter_by(id=patient_id)
        if not g.is_super_admin:
            query = query.filter_by(hospital_id=g.current_hospital_id)
        patient = query.first_or_404()
        return jsonify(patient.to_dict()), 200
    except Exception as e:
        print(f"❌ Error getting patient {patient_id}: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/patients', methods=['POST', 'OPTIONS'])
@hospital_required
def create_patient():
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        data = request.json
        print("📝 Creating patient:", data)
        
        required_fields = ['first_name', 'last_name', 'phone', 'date_of_birth']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        doctor_id = None
        if data.get('doctor_id'):
            try:
                doctor_id = int(data['doctor_id'])
            except (ValueError, TypeError):
                doctor_id = None
        
        hospital_id = g.current_hospital_id if not g.is_super_admin else data.get('hospital_id')
        
        new_patient = Patient(
            first_name=data['first_name'],
            last_name=data['last_name'],
            email=data.get('email'),
            phone=data['phone'],
            date_of_birth=datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date(),
            gender=data.get('gender'),
            blood_group=data.get('blood_group'),
            address=data.get('address'),
            emergency_contact=data.get('emergency_contact'),
            doctor_id=doctor_id,
            hospital_id=hospital_id
        )
        
        db.session.add(new_patient)
        db.session.commit()
        
        return jsonify({
            'message': 'Patient created successfully',
            'patient': new_patient.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error creating patient: {str(e)}")
        return jsonify({'error': str(e)}), 500

# ============= DOCTOR ROUTES =============
@app.route('/api/doctors', methods=['GET', 'OPTIONS'])
@hospital_required
def get_doctors():
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        query = User.query.filter_by(role='doctor')
        if not g.is_super_admin:
            query = query.filter_by(hospital_id=g.current_hospital_id)
        doctors = query.all()
        return jsonify([d.to_dict() for d in doctors]), 200
    except Exception as e:
        print(f"❌ Error getting doctors: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/doctors/<int:doctor_id>/patients', methods=['GET', 'OPTIONS'])
@hospital_required
def get_doctor_patients(doctor_id):
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        query = Patient.query.filter_by(doctor_id=doctor_id)
        if not g.is_super_admin:
            query = query.filter_by(hospital_id=g.current_hospital_id)
        patients = query.all()
        return jsonify([{
            'id': p.id,
            'first_name': p.first_name,
            'last_name': p.last_name,
            'full_name': f"{p.first_name} {p.last_name}",
            'phone': p.phone,
            'email': p.email,
            'total_visits': p.total_visits,
            'is_returning': p.is_returning,
            'last_visit': p.last_visit_date.isoformat() if p.last_visit_date else None,
            'next_visit_number': p.next_visit_number
        } for p in patients]), 200
    except Exception as e:
        print(f"❌ Error getting doctor patients: {str(e)}")
        return jsonify({'error': str(e)}), 500

# ============= APPOINTMENT ROUTES =============
@app.route('/api/appointments', methods=['GET', 'OPTIONS'])
@hospital_required
def get_appointments():
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        query = Appointment.query
        if not g.is_super_admin:
            query = query.filter_by(hospital_id=g.current_hospital_id)
        appointments = query.order_by(Appointment.appointment_date.desc()).all()
        return jsonify([a.to_dict() for a in appointments]), 200
    except Exception as e:
        print(f"❌ Error getting appointments: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/appointments', methods=['POST', 'OPTIONS'])
@hospital_required
def create_appointment():
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        data = request.json
        print("\n📅 CREATING APPOINTMENT")
        
        if 'doctor_id' not in data or 'appointment_date' not in data:
            return jsonify({'error': 'Doctor ID and appointment date are required'}), 400
        
        doctor_id = int(data['doctor_id'])
        patient_id = None
        
        if data.get('is_new_patient'):
            required_fields = ['first_name', 'last_name', 'phone', 'date_of_birth']
            for field in required_fields:
                if field not in data:
                    return jsonify({'error': f'Missing required patient field: {field}'}), 400
            
            hospital_id = g.current_hospital_id if not g.is_super_admin else data.get('hospital_id')
            
            patient = Patient(
                first_name=data['first_name'],
                last_name=data['last_name'],
                phone=data['phone'],
                email=data.get('email'),
                date_of_birth=datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date(),
                doctor_id=doctor_id,
                hospital_id=hospital_id
            )
            db.session.add(patient)
            db.session.flush()
            patient_id = patient.id
        else:
            if 'patient_id' not in data:
                return jsonify({'error': 'Patient ID is required'}), 400
            patient_id = data['patient_id']
            
            query = Patient.query.filter_by(id=patient_id)
            if not g.is_super_admin:
                query = query.filter_by(hospital_id=g.current_hospital_id)
            patient = query.first()
            if not patient:
                return jsonify({'error': 'Patient not found'}), 404
            
            if patient.doctor_id != doctor_id:
                patient.doctor_id = doctor_id
                db.session.flush()
        
        hospital_id = g.current_hospital_id if not g.is_super_admin else data.get('hospital_id')
        
        appointment = Appointment(
            patient_id=patient_id,
            doctor_id=doctor_id,
            receptionist_id=data.get('receptionist_id'),
            hospital_id=hospital_id,
            appointment_date=datetime.strptime(data['appointment_date'], '%Y-%m-%dT%H:%M'),
            reason=data.get('reason'),
            status='scheduled'
        )
        
        db.session.add(appointment)
        db.session.commit()
        
        return jsonify({
            'message': 'Appointment created successfully',
            'appointment': appointment.to_dict(),
            'patient': patient.to_dict() if patient else None
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error creating appointment: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/appointments/<int:appointment_id>/status', methods=['PUT', 'OPTIONS'])
@hospital_required
def update_appointment_status(appointment_id):
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        query = Appointment.query.filter_by(id=appointment_id)
        if not g.is_super_admin:
            query = query.filter_by(hospital_id=g.current_hospital_id)
        appointment = query.first_or_404()
        
        data = request.json
        if 'status' not in data:
            return jsonify({'error': 'Status field required'}), 400
            
        appointment.status = data['status']
        db.session.commit()
        
        return jsonify({
            'message': 'Appointment status updated successfully',
            'appointment': appointment.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error updating appointment status: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/appointments/patient/<int:patient_id>', methods=['GET', 'OPTIONS'])
@hospital_required
def get_patient_appointments(patient_id):
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        query = Appointment.query.filter_by(patient_id=patient_id)
        if not g.is_super_admin:
            query = query.filter_by(hospital_id=g.current_hospital_id)
        appointments = query.order_by(Appointment.appointment_date.desc()).all()
        return jsonify([a.to_dict() for a in appointments]), 200
    except Exception as e:
        print(f"❌ Error getting patient appointments: {str(e)}")
        return jsonify({'error': str(e)}), 500

# ============= CONSULTATION ROUTES =============
@app.route('/api/consultations', methods=['POST', 'OPTIONS'])
@hospital_required
def create_consultation():
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        data = request.json
        print("\n📋 CREATING CONSULTATION")
        
        required_fields = ['patient_id', 'doctor_id', 'diagnosis', 'prescription']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        query = Patient.query.filter_by(id=data['patient_id'])
        if not g.is_super_admin:
            query = query.filter_by(hospital_id=g.current_hospital_id)
        patient = query.first()
        if not patient:
            return jsonify({'error': 'Patient not found'}), 404
        
        hospital_id = g.current_hospital_id if not g.is_super_admin else patient.hospital_id
        
        new_consultation = Consultation(
            patient_id=data['patient_id'],
            doctor_id=data['doctor_id'],
            appointment_id=data.get('appointment_id'),
            hospital_id=hospital_id,
            complaint=data.get('complaint', ''),
            examination=data.get('examination', ''),
            diagnosis=data['diagnosis'],
            prescription=data['prescription'],
            notes=data.get('notes', ''),
            consultation_date=get_current_time()
        )
        
        if data.get('images'):
            images_to_store = []
            for img in data['images']:
                if img.get('data'):
                    images_to_store.append({
                        'id': img.get('id', int(get_current_time().timestamp() * 1000)),
                        'data': img['data'],
                        'name': img.get('name', 'Image'),
                        'timestamp': img.get('timestamp', get_current_time().isoformat())
                    })
            if images_to_store:
                new_consultation.set_images(images_to_store)
        
        db.session.add(new_consultation)
        db.session.flush()
        
        for med in data.get('medicines', []):
            if med.get('name') and med.get('dosage') and med.get('frequency'):
                medicine = Medicine(
                    consultation_id=new_consultation.id,
                    name=med['name'],
                    dosage=med['dosage'],
                    frequency=med['frequency'],
                    duration=med.get('duration', ''),
                    instructions=med.get('instructions', '')
                )
                db.session.add(medicine)
        
        if data.get('appointment_id'):
            apt_query = Appointment.query.filter_by(id=data['appointment_id'])
            if not g.is_super_admin:
                apt_query = apt_query.filter_by(hospital_id=g.current_hospital_id)
            appointment = apt_query.first()
            if appointment:
                appointment.status = 'completed'
        
        db.session.commit()
        
        return jsonify({
            'message': 'Consultation created successfully',
            'consultation': new_consultation.to_dict(),
            'patient': {
                'id': patient.id,
                'total_visits': patient.total_visits,
                'is_returning': patient.is_returning
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error creating consultation: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

# ============= USER ROUTES =============
@app.route('/api/users', methods=['GET', 'OPTIONS'])
@hospital_required
def get_users():
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        if g.is_super_admin:
            users = User.query.all()
        else:
            users = User.query.filter_by(hospital_id=g.current_hospital_id).all()
        return jsonify([u.to_dict() for u in users]), 200
    except Exception as e:
        print(f"❌ Error getting users: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/users/<int:user_id>', methods=['GET', 'OPTIONS'])
@hospital_required
def get_user(user_id):
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        if g.is_super_admin:
            user = User.query.get_or_404(user_id)
        else:
            user = User.query.filter_by(id=user_id, hospital_id=g.current_hospital_id).first_or_404()
        return jsonify(user.to_dict()), 200
    except Exception as e:
        print(f"❌ Error getting user: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/users', methods=['POST', 'OPTIONS'])
@hospital_required
def create_user():
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        data = request.json
        print("📝 Creating user:", data)
        
        required = ['username', 'email', 'password', 'role', 'full_name']
        for field in required:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        existing = User.query.filter_by(username=data['username']).first()
        if existing:
            return jsonify({'error': 'Username already exists'}), 400
        
        existing = User.query.filter_by(email=data['email']).first()
        if existing:
            return jsonify({'error': 'Email already exists'}), 400
        
        hospital_id = g.current_hospital_id if not g.is_super_admin else data.get('hospital_id')
        
        new_user = User(
            username=data['username'],
            email=data['email'],
            password=data['password'],
            role=data['role'],
            full_name=data['full_name'],
            hospital_id=hospital_id,
            is_super_admin=False,
            is_active=True
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({
            'message': 'User created successfully',
            'user': new_user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error creating user: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/users/<int:user_id>', methods=['PUT', 'OPTIONS'])
@hospital_required
def update_user(user_id):
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        if g.is_super_admin:
            user = User.query.get_or_404(user_id)
        else:
            user = User.query.filter_by(id=user_id, hospital_id=g.current_hospital_id).first_or_404()
        
        data = request.json
        
        if 'username' in data:
            existing = User.query.filter_by(username=data['username']).first()
            if existing and existing.id != user_id:
                return jsonify({'error': 'Username already exists'}), 400
            user.username = data['username']
        
        if 'email' in data:
            existing = User.query.filter_by(email=data['email']).first()
            if existing and existing.id != user_id:
                return jsonify({'error': 'Email already exists'}), 400
            user.email = data['email']
        
        if 'full_name' in data:
            user.full_name = data['full_name']
        
        if 'role' in data:
            user.role = data['role']
        
        if 'hospital_id' in data and g.is_super_admin:
            user.hospital_id = data['hospital_id']
        
        if data.get('password'):
            user.password = data['password']
        
        db.session.commit()
        
        return jsonify({
            'message': 'User updated successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error updating user: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/users/<int:user_id>', methods=['DELETE', 'OPTIONS'])
@hospital_required
def delete_user(user_id):
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        if g.is_super_admin:
            user = User.query.get_or_404(user_id)
        else:
            user = User.query.filter_by(id=user_id, hospital_id=g.current_hospital_id).first_or_404()
        
        if user.is_super_admin:
            super_admin_count = User.query.filter_by(is_super_admin=True).count()
            if super_admin_count <= 1:
                return jsonify({'error': 'Cannot delete the last super admin'}), 400
        
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({'message': 'User deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error deleting user: {str(e)}")
        return jsonify({'error': str(e)}), 500

# ============= STATS ROUTE =============
@app.route('/api/stats', methods=['GET', 'OPTIONS'])
@hospital_required
def get_stats():
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        if g.is_super_admin:
            total_patients = Patient.query.count()
            total_doctors = User.query.filter_by(role='doctor').count()
            total_appointments = Appointment.query.count()
            today = get_current_time().date()
            today_appointments = Appointment.query.filter(
                db.func.date(Appointment.appointment_date) == today
            ).count()
        else:
            total_patients = Patient.query.filter_by(hospital_id=g.current_hospital_id).count()
            total_doctors = User.query.filter_by(role='doctor', hospital_id=g.current_hospital_id).count()
            total_appointments = Appointment.query.filter_by(hospital_id=g.current_hospital_id).count()
            today = get_current_time().date()
            today_appointments = Appointment.query.filter(
                db.func.date(Appointment.appointment_date) == today,
                Appointment.hospital_id == g.current_hospital_id
            ).count()
        
        return jsonify({
            'total_patients': total_patients,
            'total_doctors': total_doctors,
            'total_appointments': total_appointments,
            'today_appointments': today_appointments
        }), 200
    except Exception as e:
        print(f"❌ Error getting stats: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🏥 MULTI-TENANT HOSPITAL SYSTEM")
    print("="*60)
    print("\n📋 Available Routes:")
    print("  🔐 POST /api/login - Login")
    print("  🏥 GET  /api/hospitals - Get all hospitals")
    print("  🏥 POST /api/hospitals - Create hospital")
    print("  🏥 PUT  /api/hospitals/<id> - Update hospital")
    print("  🏥 DELETE /api/hospitals/<id> - Delete hospital")
    print("  👥 GET  /api/users - Get all users")
    print("  👤 POST /api/users - Create user")
    print("  👤 GET  /api/users/<id> - Get user by ID")
    print("  ✏️ PUT  /api/users/<id> - Update user")
    print("  ❌ DELETE /api/users/<id> - Delete user")
    print("  👥 GET  /api/patients - Get all patients")
    print("  👤 POST /api/patients - Create patient")
    print("  👨‍⚕️ GET  /api/doctors - Get all doctors")
    print("  📅 GET  /api/appointments - Get all appointments")
    print("  📅 POST /api/appointments - Create appointment")
    print("  📅 PUT  /api/appointments/<id>/status - Update appointment status")
    print("  📊 GET  /api/stats - Get statistics")
    print("\n👑 SUPER ADMIN ROUTES:")
    print("  🔄 PUT  /api/super-admin/hospitals/<id>/toggle - Toggle hospital status")
    print("  🔄 PUT  /api/super-admin/users/<id>/toggle - Toggle user status")
    print("\n" + "="*60)
    print("🚀 Server starting on http://localhost:5000")
    print("="*60 + "\n")
    
    app.run(debug=True, port=5000, host='0.0.0.0')