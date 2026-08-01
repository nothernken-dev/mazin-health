from app import app
from models import db, User, Hospital
from datetime import datetime

def seed_data():
    with app.app_context():
        print("🗑️  Clearing existing data...")
        db.drop_all()
        db.create_all()
        print("✅ Database tables created")
        
        print("\n🏥 Creating hospitals...")
        
        hospital1 = Hospital(
            name='City General Hospital',
            code='CGH001',
            address='123 Healthcare Avenue, Medical District',
            phone='(555) 123-4567',
            email='info@citygeneral.com',
            is_active=True
        )
        
        hospital2 = Hospital(
            name="St. Mary's Medical Center",
            code='SMMC002',
            address='456 Wellness Blvd, Health Park',
            phone='(555) 987-6543',
            email='info@stmarys.com',
            is_active=True
        )
        
        db.session.add_all([hospital1, hospital2])
        db.session.commit()
        print(f"✅ Created hospitals: {hospital1.name}, {hospital2.name}")
        
        print("\n👥 Creating users...")
        
        super_admin = User(
            username='superadmin',
            email='superadmin@system.com',
            password='super123',
            role='super_admin',
            full_name='Super Administrator',
            hospital_id=None,
            is_super_admin=True,
            is_active=True
        )
        
        admin1 = User(
            username='admin',
            email='admin@citygeneral.com',
            password='admin123',
            role='admin',
            full_name='System Administrator',
            hospital_id=hospital1.id,
            is_super_admin=False,
            is_active=True
        )
        
        doctor1 = User(
            username='dr.smith',
            email='dr.smith@citygeneral.com',
            password='doctor123',
            role='doctor',
            full_name='John Smith',
            hospital_id=hospital1.id,
            is_super_admin=False,
            is_active=True
        )
        
        doctor2 = User(
            username='dr.jones',
            email='dr.jones@citygeneral.com',
            password='doctor123',
            role='doctor',
            full_name='Sarah Jones',
            hospital_id=hospital1.id,
            is_super_admin=False,
            is_active=True
        )
        
        receptionist1 = User(
            username='reception',
            email='reception@citygeneral.com',
            password='reception123',
            role='receptionist',
            full_name='Jane Doe',
            hospital_id=hospital1.id,
            is_super_admin=False,
            is_active=True
        )
        
        admin2 = User(
            username='admin2',
            email='admin@stmarys.com',
            password='admin123',
            role='admin',
            full_name='Mary Johnson',
            hospital_id=hospital2.id,
            is_super_admin=False,
            is_active=True
        )
        
        doctor3 = User(
            username='dr.wilson',
            email='dr.wilson@stmarys.com',
            password='doctor123',
            role='doctor',
            full_name='Michael Wilson',
            hospital_id=hospital2.id,
            is_super_admin=False,
            is_active=True
        )
        
        receptionist2 = User(
            username='reception2',
            email='reception@stmarys.com',
            password='reception123',
            role='receptionist',
            full_name='Emily Brown',
            hospital_id=hospital2.id,
            is_super_admin=False,
            is_active=True
        )
        
        db.session.add_all([
            super_admin,
            admin1, doctor1, doctor2, receptionist1,
            admin2, doctor3, receptionist2
        ])
        db.session.commit()
        
        print("\n" + "="*60)
        print("✅ DATABASE SEEDED SUCCESSFULLY!")
        print("="*60)
        print("\n📋 LOGIN CREDENTIALS:")
        print("-"*40)
        print("\n👑 SUPER ADMIN:")
        print("  Username: superadmin")
        print("  Password: super123")
        print("\n🏥 City General Hospital:")
        print("  ADMIN: admin / admin123")
        print("  DOCTORS: dr.smith / doctor123, dr.jones / doctor123")
        print("  RECEPTIONIST: reception / reception123")
        print("\n🏥 St. Mary's Medical Center:")
        print("  ADMIN: admin2 / admin123")
        print("  DOCTOR: dr.wilson / doctor123")
        print("  RECEPTIONIST: reception2 / reception123")
        print("-"*40)

if __name__ == '__main__':
    seed_data()