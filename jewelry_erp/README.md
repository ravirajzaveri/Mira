# Jewelry Manufacturing ERP

A modern Python-based ERP system for jewelry manufacturing with Issue and Receive processes.

## Features

- **Issue Management**: Create and track material issues to karigars (craftsmen)
- **Receive Management**: Record receipts against issued materials
- **Weight Tracking**: Comprehensive tracking of gross weight, net weight, stone weight, and wastage
- **Process Management**: Track different manufacturing processes (Casting, Filing, Polishing, etc.)
- **Real-time Balance Calculation**: Automatic calculation of pending balances
- **Modern UI**: Built with CustomTkinter for a modern, clean interface

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the application:
```bash
python jewelry_erp/main.py
```

## Project Structure

```
jewelry_erp/
├── database/          # Database models and configuration
│   ├── models.py      # SQLAlchemy models
│   └── database.py    # Database connection and session management
├── views/             # UI views
│   ├── issue_view.py  # Issue entry interface
│   └── receive_view.py # Receipt entry interface
├── controllers/       # Business logic
│   ├── issue_controller.py
│   └── receive_controller.py
├── utils/            # Utility functions
│   └── seed_data.py  # Initial data seeding
└── main.py          # Application entry point
```

## Database Schema

- **Karigar**: Craftsmen/workers information
- **Process**: Manufacturing processes (Casting, Polishing, etc.)
- **Design**: Product designs
- **Issue**: Material issued to karigars
- **Receipt**: Material received from karigars
- **StockRegister**: Stock movement tracking

## Usage

### Issue Process
1. Click on "Issue" in navigation
2. Generate or enter Issue Number
3. Select Karigar, Process, and Design
4. Enter weight details (Gross Weight, Stone Weight)
5. Net Weight is calculated automatically
6. Save the issue

### Receive Process
1. Click on "Receive" in navigation
2. Select the Issue to receive against
3. Generate or enter Receipt Number
4. Enter received weights and wastage
5. System shows balance and updates status
6. Save the receipt

## Future Enhancements

- Voice integration with 11Labs AI for hands-free operation
- Master data management (Karigar, Process, Design)
- Comprehensive reporting module
- Export to Excel/PDF
- Multi-user support
- Cloud sync capabilities

## Technical Details

- **Framework**: CustomTkinter for modern UI
- **Database**: SQLite with SQLAlchemy ORM
- **Architecture**: MVC pattern
- **Python Version**: 3.8+