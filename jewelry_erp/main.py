import customtkinter as ctk
from tkinter import messagebox
import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from jewelry_erp.database.database import init_database
from jewelry_erp.views.issue_view import IssueView
from jewelry_erp.views.receive_view import ReceiveView
from jewelry_erp.utils.seed_data import seed_master_data

class JewelryERPApp(ctk.CTk):
    def __init__(self):
        super().__init__()
        
        # Configure window
        self.title("Jewelry Manufacturing ERP")
        self.geometry("1200x800")
        
        # Set theme
        ctk.set_appearance_mode("light")
        ctk.set_default_color_theme("blue")
        
        # Initialize database
        self.init_database()
        
        # Create UI
        self.create_menu()
        self.create_main_content()
        
        # Show issue view by default
        self.show_issue_view()
        
    def init_database(self):
        try:
            init_database()
            # Seed data if needed (first run)
            seed_master_data()
        except Exception as e:
            messagebox.showerror("Database Error", f"Failed to initialize database: {e}")
            sys.exit(1)
    
    def create_menu(self):
        # Top frame for navigation
        menu_frame = ctk.CTkFrame(self)
        menu_frame.pack(side="top", fill="x", padx=10, pady=5)
        
        # Title
        title_label = ctk.CTkLabel(menu_frame, text="Jewelry Manufacturing ERP", 
                                  font=("Arial", 28, "bold"))
        title_label.pack(side="left", padx=20)
        
        # Navigation buttons
        nav_frame = ctk.CTkFrame(menu_frame)
        nav_frame.pack(side="right", padx=20)
        
        ctk.CTkButton(nav_frame, text="Issue", command=self.show_issue_view,
                     width=100).pack(side="left", padx=5)
        ctk.CTkButton(nav_frame, text="Receive", command=self.show_receive_view,
                     width=100).pack(side="left", padx=5)
        ctk.CTkButton(nav_frame, text="Masters", command=self.show_masters,
                     width=100).pack(side="left", padx=5)
        ctk.CTkButton(nav_frame, text="Reports", command=self.show_reports,
                     width=100).pack(side="left", padx=5)
        ctk.CTkButton(nav_frame, text="Exit", command=self.quit,
                     fg_color="red", width=100).pack(side="left", padx=5)
    
    def create_main_content(self):
        # Main content frame
        self.main_frame = ctk.CTkFrame(self)
        self.main_frame.pack(side="top", fill="both", expand=True, padx=10, pady=5)
        
        # Create views
        self.issue_view = IssueView(self.main_frame)
        self.receive_view = ReceiveView(self.main_frame)
        
        # Hide all views initially
        self.issue_view.pack_forget()
        self.receive_view.pack_forget()
    
    def show_issue_view(self):
        self.hide_all_views()
        self.issue_view.pack(fill="both", expand=True)
        self.issue_view.load_data()  # Refresh data
    
    def show_receive_view(self):
        self.hide_all_views()
        self.receive_view.pack(fill="both", expand=True)
        self.receive_view.load_data()  # Refresh data
    
    def show_masters(self):
        messagebox.showinfo("Coming Soon", "Masters module will be implemented soon!")
    
    def show_reports(self):
        messagebox.showinfo("Coming Soon", "Reports module will be implemented soon!")
    
    def hide_all_views(self):
        self.issue_view.pack_forget()
        self.receive_view.pack_forget()

def main():
    app = JewelryERPApp()
    app.mainloop()

if __name__ == "__main__":
    main()