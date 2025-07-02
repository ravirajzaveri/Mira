from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from datetime import datetime

Base = declarative_base()

class Karigar(Base):
    __tablename__ = 'karigars'
    
    id = Column(Integer, primary_key=True)
    code = Column(String(20), unique=True, nullable=False)
    name = Column(String(100), nullable=False)
    contact = Column(String(20))
    address = Column(Text)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    issues = relationship("Issue", back_populates="karigar")
    receipts = relationship("Receipt", back_populates="karigar")

class Process(Base):
    __tablename__ = 'processes'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(Text)
    active = Column(Boolean, default=True)

class Design(Base):
    __tablename__ = 'designs'
    
    id = Column(Integer, primary_key=True)
    code = Column(String(50), unique=True, nullable=False)
    name = Column(String(100), nullable=False)
    category = Column(String(50))
    description = Column(Text)
    active = Column(Boolean, default=True)

class Issue(Base):
    __tablename__ = 'issues'
    
    id = Column(Integer, primary_key=True)
    issue_no = Column(String(50), unique=True, nullable=False)
    issue_date = Column(DateTime, default=datetime.utcnow)
    karigar_id = Column(Integer, ForeignKey('karigars.id'), nullable=False)
    process_id = Column(Integer, ForeignKey('processes.id'), nullable=False)
    design_id = Column(Integer, ForeignKey('designs.id'))
    
    # Weight fields
    gross_weight = Column(Float, default=0.0)
    net_weight = Column(Float, default=0.0)
    stone_weight = Column(Float, default=0.0)
    
    # Quantity
    pieces = Column(Integer, default=0)
    
    # Additional info
    remarks = Column(Text)
    status = Column(String(20), default='Pending')  # Pending, Partial, Completed
    
    karigar = relationship("Karigar", back_populates="issues")
    process = relationship("Process")
    design = relationship("Design")
    receipts = relationship("Receipt", back_populates="issue")

class Receipt(Base):
    __tablename__ = 'receipts'
    
    id = Column(Integer, primary_key=True)
    receipt_no = Column(String(50), unique=True, nullable=False)
    receipt_date = Column(DateTime, default=datetime.utcnow)
    issue_id = Column(Integer, ForeignKey('issues.id'), nullable=False)
    karigar_id = Column(Integer, ForeignKey('karigars.id'), nullable=False)
    
    # Weight fields
    gross_weight = Column(Float, default=0.0)
    net_weight = Column(Float, default=0.0)
    stone_weight = Column(Float, default=0.0)
    wastage_weight = Column(Float, default=0.0)
    
    # Quantity
    pieces = Column(Integer, default=0)
    
    # Additional info
    remarks = Column(Text)
    
    issue = relationship("Issue", back_populates="receipts")
    karigar = relationship("Karigar", back_populates="receipts")

class StockRegister(Base):
    __tablename__ = 'stock_register'
    
    id = Column(Integer, primary_key=True)
    transaction_type = Column(String(20))  # Issue, Receipt
    transaction_id = Column(Integer)
    transaction_date = Column(DateTime, default=datetime.utcnow)
    
    # Weight movements
    gross_weight_in = Column(Float, default=0.0)
    gross_weight_out = Column(Float, default=0.0)
    net_weight_in = Column(Float, default=0.0)
    net_weight_out = Column(Float, default=0.0)
    
    # Running balance
    balance_gross = Column(Float, default=0.0)
    balance_net = Column(Float, default=0.0)