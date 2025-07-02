import customtkinter as ctk
from tkinter import messagebox, ttk
from datetime import datetime
from ..database.database import get_db
from ..database.models import Receipt, Issue, Karigar
from ..controllers.receive_controller import ReceiveController

class ReceiveView(ctk.CTkFrame):
    def __init__(self, parent, *args, **kwargs):
        super().__init__(parent, *args, **kwargs)
        self.controller = ReceiveController()
        self.selected_issue = None
        self.setup_ui()
        self.load_data()
        
    def setup_ui(self):
        # Title
        title = ctk.CTkLabel(self, text="Receipt Entry", font=("Arial", 24, "bold"))
        title.grid(row=0, column=0, columnspan=4, pady=10)
        
        # Issue Selection Frame
        issue_frame = ctk.CTkFrame(self)
        issue_frame.grid(row=1, column=0, columnspan=4, padx=20, pady=10, sticky="ew")
        
        ctk.CTkLabel(issue_frame, text="Select Issue", font=("Arial", 16, "bold")).grid(row=0, column=0, columnspan=4, pady=5)
        
        # Karigar filter
        ctk.CTkLabel(issue_frame, text="Karigar:").grid(row=1, column=0, padx=5, pady=5, sticky="e")
        self.karigar_filter_var = ctk.StringVar()
        self.karigar_filter_combo = ctk.CTkComboBox(issue_frame, variable=self.karigar_filter_var, 
                                                   command=self.filter_issues)
        self.karigar_filter_combo.grid(row=1, column=1, padx=5, pady=5)
        
        # Issue selection
        ctk.CTkLabel(issue_frame, text="Issue No:").grid(row=1, column=2, padx=5, pady=5, sticky="e")
        self.issue_var = ctk.StringVar()
        self.issue_combo = ctk.CTkComboBox(issue_frame, variable=self.issue_var, 
                                         command=self.load_issue_details)
        self.issue_combo.grid(row=1, column=3, padx=5, pady=5)
        
        # Issue Details Display
        details_frame = ctk.CTkFrame(self)
        details_frame.grid(row=2, column=0, columnspan=4, padx=20, pady=10, sticky="ew")
        
        ctk.CTkLabel(details_frame, text="Issue Details", font=("Arial", 14, "bold")).grid(row=0, column=0, columnspan=4, pady=5)
        
        self.issue_details_label = ctk.CTkLabel(details_frame, text="Select an issue to view details", 
                                              font=("Arial", 12))
        self.issue_details_label.grid(row=1, column=0, columnspan=4, padx=10, pady=5)
        
        # Receipt Form Frame
        form_frame = ctk.CTkFrame(self)
        form_frame.grid(row=3, column=0, columnspan=4, padx=20, pady=10, sticky="ew")
        
        ctk.CTkLabel(form_frame, text="Receipt Details", font=("Arial", 16, "bold")).grid(row=0, column=0, columnspan=4, pady=5)
        
        # Receipt Number
        ctk.CTkLabel(form_frame, text="Receipt No:").grid(row=1, column=0, padx=5, pady=5, sticky="e")
        self.receipt_no_var = ctk.StringVar()
        self.receipt_no_entry = ctk.CTkEntry(form_frame, textvariable=self.receipt_no_var)
        self.receipt_no_entry.grid(row=1, column=1, padx=5, pady=5)
        
        # Date
        ctk.CTkLabel(form_frame, text="Date:").grid(row=1, column=2, padx=5, pady=5, sticky="e")
        self.date_var = ctk.StringVar(value=datetime.now().strftime("%Y-%m-%d"))
        self.date_entry = ctk.CTkEntry(form_frame, textvariable=self.date_var)
        self.date_entry.grid(row=1, column=3, padx=5, pady=5)
        
        # Pieces
        ctk.CTkLabel(form_frame, text="Pieces:").grid(row=2, column=0, padx=5, pady=5, sticky="e")
        self.pieces_var = ctk.IntVar(value=0)
        self.pieces_entry = ctk.CTkEntry(form_frame, textvariable=self.pieces_var)
        self.pieces_entry.grid(row=2, column=1, padx=5, pady=5)
        
        # Weight Section
        weight_frame = ctk.CTkFrame(self)
        weight_frame.grid(row=4, column=0, columnspan=4, padx=20, pady=10, sticky="ew")
        
        ctk.CTkLabel(weight_frame, text="Weight Details", font=("Arial", 16, "bold")).grid(row=0, column=0, columnspan=4, pady=5)
        
        # Gross Weight
        ctk.CTkLabel(weight_frame, text="Gross Weight:").grid(row=1, column=0, padx=5, pady=5, sticky="e")
        self.gross_weight_var = ctk.DoubleVar(value=0.0)
        self.gross_weight_entry = ctk.CTkEntry(weight_frame, textvariable=self.gross_weight_var)
        self.gross_weight_entry.grid(row=1, column=1, padx=5, pady=5)
        self.gross_weight_entry.bind("<KeyRelease>", self.calculate_weights)
        
        # Stone Weight
        ctk.CTkLabel(weight_frame, text="Stone Weight:").grid(row=1, column=2, padx=5, pady=5, sticky="e")
        self.stone_weight_var = ctk.DoubleVar(value=0.0)
        self.stone_weight_entry = ctk.CTkEntry(weight_frame, textvariable=self.stone_weight_var)
        self.stone_weight_entry.grid(row=1, column=3, padx=5, pady=5)
        self.stone_weight_entry.bind("<KeyRelease>", self.calculate_weights)
        
        # Wastage Weight
        ctk.CTkLabel(weight_frame, text="Wastage Weight:").grid(row=2, column=0, padx=5, pady=5, sticky="e")
        self.wastage_weight_var = ctk.DoubleVar(value=0.0)
        self.wastage_weight_entry = ctk.CTkEntry(weight_frame, textvariable=self.wastage_weight_var)
        self.wastage_weight_entry.grid(row=2, column=1, padx=5, pady=5)
        self.wastage_weight_entry.bind("<KeyRelease>", self.calculate_weights)
        
        # Net Weight
        ctk.CTkLabel(weight_frame, text="Net Weight:").grid(row=2, column=2, padx=5, pady=5, sticky="e")
        self.net_weight_var = ctk.DoubleVar(value=0.0)
        self.net_weight_label = ctk.CTkLabel(weight_frame, textvariable=self.net_weight_var, 
                                           font=("Arial", 14, "bold"))
        self.net_weight_label.grid(row=2, column=3, padx=5, pady=5)
        
        # Balance Display
        balance_frame = ctk.CTkFrame(self)
        balance_frame.grid(row=5, column=0, columnspan=4, padx=20, pady=10, sticky="ew")
        
        self.balance_label = ctk.CTkLabel(balance_frame, text="", font=("Arial", 14))
        self.balance_label.grid(row=0, column=0, columnspan=4, padx=10, pady=5)
        
        # Remarks
        ctk.CTkLabel(self, text="Remarks:").grid(row=6, column=0, padx=20, pady=5, sticky="nw")
        self.remarks_text = ctk.CTkTextbox(self, height=60, width=400)
        self.remarks_text.grid(row=6, column=1, columnspan=3, padx=5, pady=5, sticky="ew")
        
        # Buttons
        button_frame = ctk.CTkFrame(self)
        button_frame.grid(row=7, column=0, columnspan=4, pady=20)
        
        ctk.CTkButton(button_frame, text="Save", command=self.save_receipt, 
                     fg_color="green", width=100).grid(row=0, column=0, padx=10)
        ctk.CTkButton(button_frame, text="Clear", command=self.clear_form,
                     width=100).grid(row=0, column=1, padx=10)
        ctk.CTkButton(button_frame, text="Generate No", command=self.generate_receipt_no,
                     width=100).grid(row=0, column=2, padx=10)
        
        # List View
        list_frame = ctk.CTkFrame(self)
        list_frame.grid(row=8, column=0, columnspan=4, padx=20, pady=10, sticky="nsew")
        
        # Treeview
        columns = ("Receipt No", "Date", "Issue No", "Karigar", "Gross Wt", "Net Wt", "Wastage")
        self.tree = ttk.Treeview(list_frame, columns=columns, show="tree headings", height=8)
        
        # Define headings
        self.tree.heading("#0", text="ID")
        self.tree.column("#0", width=0, stretch=False)
        
        for col in columns:
            self.tree.heading(col, text=col)
            self.tree.column(col, width=100)
        
        # Scrollbar
        scrollbar = ttk.Scrollbar(list_frame, orient="vertical", command=self.tree.yview)
        self.tree.configure(yscrollcommand=scrollbar.set)
        
        self.tree.grid(row=0, column=0, sticky="nsew")
        scrollbar.grid(row=0, column=1, sticky="ns")
        
        list_frame.grid_rowconfigure(0, weight=1)
        list_frame.grid_columnconfigure(0, weight=1)
        
        # Configure grid weights
        self.grid_columnconfigure(1, weight=1)
        self.grid_rowconfigure(8, weight=1)
        
    def calculate_weights(self, event=None):
        try:
            gross = self.gross_weight_var.get()
            stone = self.stone_weight_var.get()
            wastage = self.wastage_weight_var.get()
            net = gross - stone - wastage
            self.net_weight_var.set(round(net, 3))
            
            # Update balance if issue is selected
            if self.selected_issue:
                self.update_balance_display()
        except:
            pass
    
    def update_balance_display(self):
        if not self.selected_issue:
            return
        
        total_receipts = self.controller.get_total_receipts_for_issue(self.selected_issue.id)
        current_receipt = self.net_weight_var.get()
        total_with_current = total_receipts['net_weight'] + current_receipt
        balance = self.selected_issue.net_weight - total_with_current
        
        status = "Complete" if abs(balance) < 0.001 else "Pending"
        color = "green" if status == "Complete" else "orange"
        
        self.balance_label.configure(
            text=f"Issued: {self.selected_issue.net_weight:.3f}g | "
                 f"Total Received: {total_with_current:.3f}g | "
                 f"Balance: {balance:.3f}g | Status: {status}",
            text_color=color
        )
    
    def load_data(self):
        # Load karigars for filter
        karigars = self.controller.get_all_karigars()
        karigar_list = ["All"] + [f"{k.code} - {k.name}" for k in karigars]
        self.karigar_filter_combo.configure(values=karigar_list)
        self.karigar_filter_var.set("All")
        
        # Load pending issues
        self.filter_issues()
        
        # Load recent receipts
        self.refresh_receipt_list()
    
    def filter_issues(self, event=None):
        karigar_filter = self.karigar_filter_var.get()
        
        if karigar_filter == "All":
            issues = self.controller.get_pending_issues()
        else:
            karigar_code = karigar_filter.split(" - ")[0]
            issues = self.controller.get_pending_issues_by_karigar(karigar_code)
        
        issue_list = [f"{i.issue_no} ({i.karigar.name})" for i in issues]
        self.issue_combo.configure(values=issue_list)
        
        if issue_list:
            self.issue_var.set(issue_list[0])
            self.load_issue_details()
    
    def load_issue_details(self, event=None):
        if not self.issue_var.get():
            return
        
        issue_no = self.issue_var.get().split(" (")[0]
        issue = self.controller.get_issue_by_no(issue_no)
        
        if issue:
            self.selected_issue = issue
            receipts = self.controller.get_receipts_for_issue(issue.id)
            total_received = sum(r.net_weight for r in receipts)
            balance = issue.net_weight - total_received
            
            details = (
                f"Issue Date: {issue.issue_date.strftime('%Y-%m-%d')} | "
                f"Process: {issue.process.name} | "
                f"Design: {issue.design.name if issue.design else 'N/A'}\n"
                f"Issued: {issue.gross_weight:.3f}g (Net: {issue.net_weight:.3f}g) | "
                f"Pieces: {issue.pieces} | "
                f"Received: {total_received:.3f}g | "
                f"Balance: {balance:.3f}g"
            )
            
            self.issue_details_label.configure(text=details)
            self.update_balance_display()
    
    def generate_receipt_no(self):
        receipt_no = self.controller.generate_receipt_number()
        self.receipt_no_var.set(receipt_no)
    
    def clear_form(self):
        self.receipt_no_var.set("")
        self.date_var.set(datetime.now().strftime("%Y-%m-%d"))
        self.pieces_var.set(0)
        self.gross_weight_var.set(0.0)
        self.stone_weight_var.set(0.0)
        self.wastage_weight_var.set(0.0)
        self.net_weight_var.set(0.0)
        self.remarks_text.delete("1.0", "end")
        self.balance_label.configure(text="")
    
    def refresh_receipt_list(self):
        # Clear existing items
        for item in self.tree.get_children():
            self.tree.delete(item)
        
        # Load receipts
        receipts = self.controller.get_recent_receipts()
        for receipt in receipts:
            self.tree.insert("", "end", text=receipt.id, values=(
                receipt.receipt_no,
                receipt.receipt_date.strftime("%Y-%m-%d"),
                receipt.issue.issue_no if receipt.issue else "",
                receipt.karigar.name if receipt.karigar else "",
                f"{receipt.gross_weight:.3f}",
                f"{receipt.net_weight:.3f}",
                f"{receipt.wastage_weight:.3f}"
            ))
    
    def save_receipt(self):
        # Validation
        if not self.receipt_no_var.get():
            messagebox.showerror("Error", "Please enter Receipt Number")
            return
        
        if not self.selected_issue:
            messagebox.showerror("Error", "Please select an Issue")
            return
        
        if self.gross_weight_var.get() <= 0:
            messagebox.showerror("Error", "Please enter valid Gross Weight")
            return
        
        # Check if receipt would exceed issue amount
        total_receipts = self.controller.get_total_receipts_for_issue(self.selected_issue.id)
        current_receipt = self.net_weight_var.get()
        total_with_current = total_receipts['net_weight'] + current_receipt
        
        if total_with_current > self.selected_issue.net_weight * 1.01:  # Allow 1% tolerance
            messagebox.showerror("Error", 
                               f"Receipt amount exceeds issue amount.\n"
                               f"Issue Net Weight: {self.selected_issue.net_weight:.3f}g\n"
                               f"Already Received: {total_receipts['net_weight']:.3f}g\n"
                               f"Current Receipt: {current_receipt:.3f}g\n"
                               f"Total would be: {total_with_current:.3f}g")
            return
        
        # Prepare data
        data = {
            'receipt_no': self.receipt_no_var.get(),
            'receipt_date': datetime.strptime(self.date_var.get(), "%Y-%m-%d"),
            'issue_id': self.selected_issue.id,
            'karigar_id': self.selected_issue.karigar_id,
            'pieces': self.pieces_var.get(),
            'gross_weight': self.gross_weight_var.get(),
            'stone_weight': self.stone_weight_var.get(),
            'wastage_weight': self.wastage_weight_var.get(),
            'net_weight': self.net_weight_var.get(),
            'remarks': self.remarks_text.get("1.0", "end-1c")
        }
        
        # Save
        success, message = self.controller.create_receipt(data)
        
        if success:
            messagebox.showinfo("Success", message)
            self.clear_form()
            self.refresh_receipt_list()
            self.filter_issues()  # Refresh issue list to update status
        else:
            messagebox.showerror("Error", message)