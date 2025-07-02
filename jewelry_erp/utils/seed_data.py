from datetime import datetime
from ..database.database import db, init_database
from ..database.models import Karigar, Process, Design

def seed_master_data():
    """Seed initial master data for testing"""
    init_database()
    session = db.get_session()
    
    try:
        # Add Karigars
        karigars = [
            Karigar(code="K001", name="Ramesh Kumar", contact="9876543210"),
            Karigar(code="K002", name="Suresh Patel", contact="9876543211"),
            Karigar(code="K003", name="Mahesh Shah", contact="9876543212"),
            Karigar(code="K004", name="Dinesh Verma", contact="9876543213"),
        ]
        
        for karigar in karigars:
            existing = session.query(Karigar).filter_by(code=karigar.code).first()
            if not existing:
                session.add(karigar)
        
        # Add Processes
        processes = [
            Process(name="Casting", description="Metal casting process"),
            Process(name="Filing", description="Filing and smoothing"),
            Process(name="Polishing", description="Final polishing"),
            Process(name="Stone Setting", description="Setting stones/diamonds"),
            Process(name="Wax Model", description="Creating wax models"),
        ]
        
        for process in processes:
            existing = session.query(Process).filter_by(name=process.name).first()
            if not existing:
                session.add(process)
        
        # Add Designs
        designs = [
            Design(code="D001", name="Traditional Ring", category="Ring"),
            Design(code="D002", name="Modern Pendant", category="Pendant"),
            Design(code="D003", name="Classic Earrings", category="Earrings"),
            Design(code="D004", name="Designer Bracelet", category="Bracelet"),
            Design(code="D005", name="Custom Necklace", category="Necklace"),
        ]
        
        for design in designs:
            existing = session.query(Design).filter_by(code=design.code).first()
            if not existing:
                session.add(design)
        
        session.commit()
        print("Master data seeded successfully!")
        
    except Exception as e:
        session.rollback()
        print(f"Error seeding data: {e}")
    finally:
        session.close()

if __name__ == "__main__":
    seed_master_data()