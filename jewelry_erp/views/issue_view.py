import customtkinter as ctk
from tkinter import messagebox, ttk
from datetime import datetime
from ..database.database import get_db
from ..database.models import Issue, Karigar, Process, Design
from ..controllers.issue_controller import IssueController

class IssueView(ctk.CTkFrame):
    def __init__(self, parent, *args, **kwargs):
        super().__init__(parent, *args, **kwargs)
        self.controller = IssueController()
        self.setup_ui()
        self.load_data()
        
    def setup_ui(self):
        # Title
        title = ctk.CTkLabel(self, text="Issue Entry", font=("Arial", 24, "bold"))
        title.grid(row=0, column=0, columnspan=4, pady=10)
        
        # Form Frame
        form_frame = ctk.CTkFrame(self)
        form_frame.grid(row=1, column=0, columnspan=4, padx=20, pady=10, sticky="ew")
        
        # Issue Number
        ctk.CTkLabel(form_frame, text="Issue No:").grid(row=0, column=0, padx=5, pady=5, sticky="e")
        self.issue_no_var = ctk.StringVar()
        self.issue_no_entry = ctk.CTkEntry(form_frame, textvariable=self.issue_no_var)
        self.issue_no_entry.grid(row=0, column=1, padx=5, pady=5)
        
        # Date
        ctk.CTkLabel(form_frame, text="Date:").grid(row=0, column=2, padx=5, pady=5, sticky="e")
        self.date_var = ctk.StringVar(value=datetime.now().strftime("%Y-%m-%d"))
        self.date_entry = ctk.CTkEntry(form_frame, textvariable=self.date_var)
        self.date_entry.grid(row=0, column=3, padx=5, pady=5)
        
        # Karigar
        ctk.CTkLabel(form_frame, text="Karigar:").grid(row=1, column=0, padx=5, pady=5, sticky="e")
        self.karigar_var = ctk.StringVar()
        self.karigar_combo = ctk.CTkComboBox(form_frame, variable=self.karigar_var, values=[])
        self.karigar_combo.grid(row=1, column=1, padx=5, pady=5)
        
        # Process
        ctk.CTkLabel(form_frame, text="Process:").grid(row=1, column=2, padx=5, pady=5, sticky="e")
        self.process_var = ctk.StringVar()
        self.process_combo = ctk.CTkComboBox(form_frame, variable=self.process_var, values=[])
        self.process_combo.grid(row=1, column=3, padx=5, pady=5)
        
        # Design
        ctk.CTkLabel(form_frame, text="Design:").grid(row=2, column=0, padx=5, pady=5, sticky="e")
        self.design_var = ctk.StringVar()
        self.design_combo = ctk.CTkComboBox(form_frame, variable=self.design_var, values=[])
        self.design_combo.grid(row=2, column=1, padx=5, pady=5)
        
        # Pieces
        ctk.CTkLabel(form_frame, text="Pieces:").grid(row=2, column=2, padx=5, pady=5, sticky="e")
        self.pieces_var = ctk.IntVar(value=0)
        self.pieces_entry = ctk.CTkEntry(form_frame, textvariable=self.pieces_var)
        self.pieces_entry.grid(row=2, column=3, padx=5, pady=5)
        
        # Weight Section
        weight_frame = ctk.CTkFrame(self)
        weight_frame.grid(row=2, column=0, columnspan=4, padx=20, pady=10, sticky="ew")
        
        ctk.CTkLabel(weight_frame, text="Weight Details", font=("Arial", 16, "bold")).grid(row=0, column=0, columnspan=4, pady=5)
        
        # Gross Weight
        ctk.CTkLabel(weight_frame, text="Gross Weight:").grid(row=1, column=0, padx=5, pady=5, sticky="e")
        self.gross_weight_var = ctk.DoubleVar(value=0.0)
        self.gross_weight_entry = ctk.CTkEntry(weight_frame, textvariable=self.gross_weight_var)
        self.gross_weight_entry.grid(row=1, column=1, padx=5, pady=5)
        
        # Stone Weight
        ctk.CTkLabel(weight_frame, text="Stone Weight:").grid(row=1, column=2, padx=5, pady=5, sticky="e")
        self.stone_weight_var = ctk.DoubleVar(value=0.0)
        self.stone_weight_entry = ctk.CTkEntry(weight_frame, textvariable=self.stone_weight_var)
        self.stone_weight_entry.grid(row=1, column=3, padx=5, pady=5)
        self.stone_weight_entry.bind("<KeyRelease>", self.calculate_net_weight)
        
        # Net Weight
        ctk.CTkLabel(weight_frame, text="Net Weight:").grid(row=2, column=0, padx=5, pady=5, sticky="e")
        self.net_weight_var = ctk.DoubleVar(value=0.0)
        self.net_weight_label = ctk.CTkLabel(weight_frame, textvariable=self.net_weight_var, 
                                           font=("Arial", 14, "bold"))
        self.net_weight_label.grid(row=2, column=1, padx=5, pady=5)
        
        # Remarks
        ctk.CTkLabel(self, text="Remarks:").grid(row=3, column=0, padx=20, pady=5, sticky="nw")
        self.remarks_text = ctk.CTkTextbox(self, height=80, width=400)
        self.remarks_text.grid(row=3, column=1, columnspan=3, padx=5, pady=5, sticky="ew")
        
        # Buttons
        button_frame = ctk.CTkFrame(self)
        button_frame.grid(row=4, column=0, columnspan=4, pady=20)
        
        ctk.CTkButton(button_frame, text="Save", command=self.save_issue, 
                     fg_color="green", width=100).grid(row=0, column=0, padx=10)
        ctk.CTkButton(button_frame, text="Clear", command=self.clear_form,
                     width=100).grid(row=0, column=1, padx=10)
        ctk.CTkButton(button_frame, text="Generate No", command=self.generate_issue_no,
                     width=100).grid(row=0, column=2, padx=10)
        
        # List View
        list_frame = ctk.CTkFrame(self)
        list_frame.grid(row=5, column=0, columnspan=4, padx=20, pady=10, sticky="nsew")
        
        # Treeview
        columns = ("Issue No", "Date", "Karigar", "Process", "Gross Wt", "Net Wt", "Status")
        self.tree = ttk.Treeview(list_frame, columns=columns, show="tree headings", height=10)
        
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
        self.grid_rowconfigure(5, weight=1)
        
    def calculate_net_weight(self, event=None):
        try:
            gross = self.gross_weight_var.get()
            stone = self.stone_weight_var.get()
            net = gross - stone
            self.net_weight_var.set(round(net, 3))
        except:
            pass
    
    def load_data(self):
        # Load karigars
        karigars = self.controller.get_all_karigars()
        karigar_list = [f"{k.code} - {k.name}" for k in karigars]
        self.karigar_combo.configure(values=karigar_list)
        
        # Load processes
        processes = self.controller.get_all_processes()
        process_list = [p.name for p in processes]
        self.process_combo.configure(values=process_list)
        
        # Load designs
        designs = self.controller.get_all_designs()
        design_list = [f"{d.code} - {d.name}" for d in designs]
        self.design_combo.configure(values=design_list)
        
        # Load issues
        self.refresh_issue_list()
    
    def refresh_issue_list(self):
        # Clear existing items
        for item in self.tree.get_children():
            self.tree.delete(item)
        
        # Load issues
        issues = self.controller.get_recent_issues()
        for issue in issues:
            self.tree.insert("", "end", text=issue.id, values=(
                issue.issue_no,
                issue.issue_date.strftime("%Y-%m-%d"),
                issue.karigar.name if issue.karigar else "",
                issue.process.name if issue.process else "",
                f"{issue.gross_weight:.3f}",
                f"{issue.net_weight:.3f}",
                issue.status
            ))
    
    def generate_issue_no(self):
        issue_no = self.controller.generate_issue_number()
        self.issue_no_var.set(issue_no)
    
    def clear_form(self):
        self.issue_no_var.set("")
        self.date_var.set(datetime.now().strftime("%Y-%m-%d"))
        self.karigar_var.set("")
        self.process_var.set("")
        self.design_var.set("")
        self.pieces_var.set(0)
        self.gross_weight_var.set(0.0)
        self.stone_weight_var.set(0.0)
        self.net_weight_var.set(0.0)
        self.remarks_text.delete("1.0", "end")
    
    def save_issue(self):
        # Validation
        if not self.issue_no_var.get():
            messagebox.showerror("Error", "Please enter Issue Number")
            return
        
        if not self.karigar_var.get():
            messagebox.showerror("Error", "Please select Karigar")
            return
        
        if not self.process_var.get():
            messagebox.showerror("Error", "Please select Process")
            return
        
        if self.gross_weight_var.get() <= 0:
            messagebox.showerror("Error", "Please enter valid Gross Weight")
            return
        
        # Prepare data
        data = {
            'issue_no': self.issue_no_var.get(),
            'issue_date': datetime.strptime(self.date_var.get(), "%Y-%m-%d"),
            'karigar_code': self.karigar_var.get().split(" - ")[0],
            'process_name': self.process_var.get(),
            'design_code': self.design_var.get().split(" - ")[0] if self.design_var.get() else None,
            'pieces': self.pieces_var.get(),
            'gross_weight': self.gross_weight_var.get(),
            'stone_weight': self.stone_weight_var.get(),
            'net_weight': self.net_weight_var.get(),
            'remarks': self.remarks_text.get("1.0", "end-1c")
        }
        
        # Save
        success, message = self.controller.create_issue(data)
        
        if success:
            messagebox.showinfo("Success", message)
            self.clear_form()
            self.refresh_issue_list()
        else:
            messagebox.showerror("Error", message)