from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database.database import get_db
from ..database.models import Receipt, Issue, Karigar, StockRegister

class ReceiveController:
    def __init__(self):
        self.db = next(get_db())
    
    def get_all_karigars(self):
        return self.db.query(Karigar).filter(Karigar.active == True).all()
    
    def get_pending_issues(self):
        return self.db.query(Issue).filter(
            Issue.status.in_(['Pending', 'Partial'])
        ).order_by(Issue.issue_date.desc()).all()
    
    def get_pending_issues_by_karigar(self, karigar_code):
        karigar = self.db.query(Karigar).filter(
            Karigar.code == karigar_code
        ).first()
        
        if karigar:
            return self.db.query(Issue).filter(
                Issue.karigar_id == karigar.id,
                Issue.status.in_(['Pending', 'Partial'])
            ).order_by(Issue.issue_date.desc()).all()
        return []
    
    def get_issue_by_no(self, issue_no):
        return self.db.query(Issue).filter(
            Issue.issue_no == issue_no
        ).first()
    
    def get_receipts_for_issue(self, issue_id):
        return self.db.query(Receipt).filter(
            Receipt.issue_id == issue_id
        ).all()
    
    def get_total_receipts_for_issue(self, issue_id):
        result = self.db.query(
            func.sum(Receipt.gross_weight).label('gross_weight'),
            func.sum(Receipt.net_weight).label('net_weight'),
            func.sum(Receipt.pieces).label('pieces')
        ).filter(Receipt.issue_id == issue_id).first()
        
        return {
            'gross_weight': result.gross_weight or 0,
            'net_weight': result.net_weight or 0,
            'pieces': result.pieces or 0
        }
    
    def get_recent_receipts(self, limit=50):
        return self.db.query(Receipt).order_by(
            Receipt.receipt_date.desc()
        ).limit(limit).all()
    
    def generate_receipt_number(self):
        # Format: RCP-YYYYMMDD-XXX
        today = datetime.now()
        prefix = f"RCP-{today.strftime('%Y%m%d')}-"
        
        # Get last receipt number for today
        last_receipt = self.db.query(Receipt).filter(
            Receipt.receipt_no.like(f"{prefix}%")
        ).order_by(Receipt.receipt_no.desc()).first()
        
        if last_receipt:
            last_num = int(last_receipt.receipt_no.split("-")[-1])
            new_num = last_num + 1
        else:
            new_num = 1
        
        return f"{prefix}{new_num:03d}"
    
    def create_receipt(self, data):
        try:
            # Get issue
            issue = self.db.query(Issue).filter(
                Issue.id == data['issue_id']
            ).first()
            
            if not issue:
                return False, "Issue not found"
            
            # Create receipt
            receipt = Receipt(
                receipt_no=data['receipt_no'],
                receipt_date=data['receipt_date'],
                issue_id=data['issue_id'],
                karigar_id=data['karigar_id'],
                pieces=data.get('pieces', 0),
                gross_weight=data['gross_weight'],
                stone_weight=data.get('stone_weight', 0),
                wastage_weight=data.get('wastage_weight', 0),
                net_weight=data['net_weight'],
                remarks=data.get('remarks', '')
            )
            
            self.db.add(receipt)
            
            # Update issue status
            total_receipts = self.get_total_receipts_for_issue(issue.id)
            total_net_received = total_receipts['net_weight'] + receipt.net_weight
            
            if abs(total_net_received - issue.net_weight) < 0.001:  # Fully received
                issue.status = 'Completed'
            else:
                issue.status = 'Partial'
            
            # Update stock register
            stock_entry = StockRegister(
                transaction_type='Receipt',
                transaction_id=receipt.id,
                transaction_date=receipt.receipt_date,
                gross_weight_in=receipt.gross_weight,
                net_weight_in=receipt.net_weight
            )
            
            self.db.add(stock_entry)
            self.db.commit()
            
            return True, f"Receipt {receipt.receipt_no} created successfully"
            
        except Exception as e:
            self.db.rollback()
            return False, str(e)
    
    def get_karigar_balance(self, karigar_id):
        # Get total issued
        issued = self.db.query(
            func.sum(Issue.net_weight).label('total_issued')
        ).filter(Issue.karigar_id == karigar_id).first()
        
        # Get total received
        received = self.db.query(
            func.sum(Receipt.net_weight).label('total_received')
        ).filter(Receipt.karigar_id == karigar_id).first()
        
        total_issued = issued.total_issued or 0 if issued else 0
        total_received = received.total_received or 0 if received else 0
        
        return {
            'total_issued': total_issued,
            'total_received': total_received,
            'balance': total_issued - total_received
        }