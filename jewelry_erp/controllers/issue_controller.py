from datetime import datetime
from sqlalchemy.orm import Session
from ..database.database import get_db
from ..database.models import Issue, Karigar, Process, Design, StockRegister

class IssueController:
    def __init__(self):
        self.db = next(get_db())
    
    def get_all_karigars(self):
        return self.db.query(Karigar).filter(Karigar.active == True).all()
    
    def get_all_processes(self):
        return self.db.query(Process).filter(Process.active == True).all()
    
    def get_all_designs(self):
        return self.db.query(Design).filter(Design.active == True).all()
    
    def get_recent_issues(self, limit=50):
        return self.db.query(Issue).order_by(Issue.issue_date.desc()).limit(limit).all()
    
    def generate_issue_number(self):
        # Format: ISS-YYYYMMDD-XXX
        today = datetime.now()
        prefix = f"ISS-{today.strftime('%Y%m%d')}-"
        
        # Get last issue number for today
        last_issue = self.db.query(Issue).filter(
            Issue.issue_no.like(f"{prefix}%")
        ).order_by(Issue.issue_no.desc()).first()
        
        if last_issue:
            last_num = int(last_issue.issue_no.split("-")[-1])
            new_num = last_num + 1
        else:
            new_num = 1
        
        return f"{prefix}{new_num:03d}"
    
    def create_issue(self, data):
        try:
            # Get karigar
            karigar = self.db.query(Karigar).filter(
                Karigar.code == data['karigar_code']
            ).first()
            
            if not karigar:
                return False, "Karigar not found"
            
            # Get process
            process = self.db.query(Process).filter(
                Process.name == data['process_name']
            ).first()
            
            if not process:
                return False, "Process not found"
            
            # Get design if provided
            design = None
            if data.get('design_code'):
                design = self.db.query(Design).filter(
                    Design.code == data['design_code']
                ).first()
            
            # Create issue
            issue = Issue(
                issue_no=data['issue_no'],
                issue_date=data['issue_date'],
                karigar_id=karigar.id,
                process_id=process.id,
                design_id=design.id if design else None,
                pieces=data.get('pieces', 0),
                gross_weight=data['gross_weight'],
                stone_weight=data.get('stone_weight', 0),
                net_weight=data['net_weight'],
                remarks=data.get('remarks', ''),
                status='Pending'
            )
            
            self.db.add(issue)
            
            # Update stock register
            stock_entry = StockRegister(
                transaction_type='Issue',
                transaction_id=issue.id,
                transaction_date=issue.issue_date,
                gross_weight_out=issue.gross_weight,
                net_weight_out=issue.net_weight
            )
            
            self.db.add(stock_entry)
            self.db.commit()
            
            return True, f"Issue {issue.issue_no} created successfully"
            
        except Exception as e:
            self.db.rollback()
            return False, str(e)
    
    def update_issue_status(self, issue_id, status):
        try:
            issue = self.db.query(Issue).filter(Issue.id == issue_id).first()
            if issue:
                issue.status = status
                self.db.commit()
                return True, "Status updated"
            return False, "Issue not found"
        except Exception as e:
            self.db.rollback()
            return False, str(e)
    
    def get_pending_issues_by_karigar(self, karigar_id):
        return self.db.query(Issue).filter(
            Issue.karigar_id == karigar_id,
            Issue.status != 'Completed'
        ).all()