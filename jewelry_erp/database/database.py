import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .models import Base

class Database:
    def __init__(self, db_path="jewelry_erp.db"):
        self.db_path = db_path
        self.engine = create_engine(f'sqlite:///{db_path}', echo=False)
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        
    def create_tables(self):
        """Create all tables in the database"""
        Base.metadata.create_all(bind=self.engine)
        
    def get_session(self):
        """Get a new database session"""
        return self.SessionLocal()
        
    def close_session(self, session):
        """Close a database session"""
        session.close()

# Global database instance
db = Database()

def init_database():
    """Initialize the database with tables"""
    db.create_tables()
    
def get_db():
    """Dependency to get database session"""
    session = db.get_session()
    try:
        yield session
    finally:
        session.close()