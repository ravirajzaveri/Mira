# Esatto-Factory Jewelry Manufacturing Software Documentation

## Overview
Esatto-Factory is a comprehensive Windows-based ERP system designed specifically for jewelry manufacturing businesses. Built on .NET Framework 4.5, it manages the complete jewelry production lifecycle from raw materials to finished products.

## System Architecture

### Technology Stack
- **Platform**: Windows Desktop Application
- **Framework**: .NET Framework 4.5
- **UI Framework**: Windows Forms with Infragistics Controls
- **Database**: SQL Server (Remote connection)
- **Reporting**: Crystal Reports
- **Integration**: Google Drive/Sheets APIs
- **Languages**: C#/VB.NET (compiled assemblies)

### Application Components
- `Esatto-Factory.exe` - Main application executable
- `Esatto.DataLayer.dll` - Data access layer
- `EsattoCrystalControl.dll` - Custom Crystal Reports control
- Multiple third-party libraries for UI, reporting, and integration

## Core Business Modules

### 1. Job Card Management System
**Purpose**: Track manufacturing jobs from creation to completion

**Key Features**:
- Job card creation with unique identifiers
- Process assignment and tracking
- Staff/Karigar (craftsman) assignment
- Time tracking (hours and minutes)
- Quality control checkpoints

**Data Fields**:
- `JobCardNo` - Unique job identifier
- `ProcessName` - Current manufacturing process
- `StaffName` - Assigned craftsman
- `IssueDate` / `ReceiptDate` - Process timeline
- `GrossWeight`, `NetWeight`, `CaratWeight` - Weight measurements
- `StoneWeight`, `WastageWeight` - Material tracking
- `DesignSpecification` - Product design details

### 2. Inventory Management

**Stock Register** (`tblStockRegister`):
- Real-time inventory tracking
- Multiple weight categories:
  - Gross Weight - Total weight including all materials
  - Net Weight - Weight after deductions
  - Pure Weight - Actual gold/silver content
  - Stone Weight - Gemstone weight
  - Chain Weight - Specific for chain products
- Issue and receipt tracking
- Location-based inventory

**Key Operations**:
- Material issue to craftsmen
- Receipt of finished/semi-finished goods
- Wastage tracking and accounting
- Stock transfer between locations

### 3. Karigar (Craftsman) Management

**Purpose**: Manage workforce and track individual performance

**Features**:
- Individual craftsman ledgers
- Work assignment tracking
- Productivity measurement
- Payment calculation based on:
  - Pieces completed
  - Weight processed
  - Making charges
  - Time spent

**Data Structure**:
```
KarigarLedger:
  - KarigarID
  - KarigarName
  - TotalIssued (weight/pieces)
  - TotalReceived
  - PendingWork
  - PaymentDue
  - MakingCharges
```

### 4. Manufacturing Process Management

**Core Processes**:

1. **Casting Process**:
   - Wax model creation
   - Brass weight tracking
   - Metal pouring and finishing
   - Quality inspection

2. **Wax Issue Management**:
   - Wax model inventory
   - Issue to casting department
   - Weight and piece tracking

3. **General Processing**:
   - Filing and polishing
   - Stone setting
   - Final finishing
   - Quality control

**Process Flow**:
```
Raw Material → Issue → Process → Quality Check → Receipt → Stock
                ↓                      ↓
            Karigar               Wastage/Loss
```

### 5. Diamond and Gemstone Management

**Diamond Ledger** (`tblDiamLed`):
- Detailed stone inventory
- Rapaport price integration
- Quality parameters:
  - Color grading
  - Clarity grading
  - Cut quality
  - Polish rating
  - Symmetry assessment
  - Fluorescence
- Certificate tracking
- Supplier/party management

**Features**:
- Stone-wise reporting
- Value calculation based on Rapaport
- Inventory aging analysis
- Supplier performance tracking

### 6. Financial Management

**Components**:
- Making charges calculation
- Labor cost tracking
- Material cost management
- Party (customer/supplier) ledgers
- Payment tracking
- Profit/loss analysis

**Calculations**:
```
Total Amount = Metal Value + Stone Value + Making Charges - Deductions
Making Charges = Weight × Rate per gram/piece
```

## Database Schema

### Key Tables

1. **Job Cards**
   - Primary key: JobCardNo
   - Foreign keys: KarigarID, ProcessID, DesignID

2. **Stock Register**
   - Primary key: StockID
   - Tracks all inventory movements

3. **Karigar Master**
   - Primary key: KarigarID
   - Personal and payment details

4. **Process Master**
   - Primary key: ProcessID
   - Process definitions and parameters

5. **Design Master**
   - Primary key: DesignID
   - Design specifications and images

6. **Party Master**
   - Primary key: PartyID
   - Customer/supplier information

## User Interface Components

### Navigation Structure
```
Main Menu
├── Masters
│   ├── Karigar Master
│   ├── Design Master
│   ├── Process Master
│   └── Party Master
├── Transactions
│   ├── Job Card Entry
│   ├── Issue Entry
│   ├── Receipt Entry
│   └── Stock Transfer
├── Reports
│   ├── Job Card Reports
│   ├── Karigar Ledger
│   ├── Stock Reports
│   └── Financial Reports
└── Utilities
    ├── Backup
    ├── User Management
    └── Settings
```

### UI Controls (Infragistics)
- **UltraWinGrid**: Advanced data grids with filtering, sorting, grouping
- **UltraWinEditors**: Enhanced input controls with validation
- **UltraWinToolbars**: Ribbon-style navigation
- **UltraWinTabControl**: Multi-tab interfaces
- **UltraWinExplorerBar**: Tree-view navigation

## Reporting System

### Report Types
1. **Production Reports**:
   - Daily production summary
   - Process-wise production
   - Karigar-wise output

2. **Inventory Reports**:
   - Stock summary
   - Stock movement
   - Aging analysis

3. **Financial Reports**:
   - Party ledgers
   - Payment pending
   - Profit/loss statements

4. **Management Reports**:
   - Efficiency analysis
   - Wastage analysis
   - Design-wise profitability

### Report Features
- Crystal Reports integration
- Export to Excel, PDF, Email
- Scheduled report generation
- Custom report builder

## Integration Features

### Google Integration
- **Google Drive**: Automated backup of data
- **Google Sheets**: Export reports for sharing
- **Authentication**: OAuth 2.0 implementation

### Excel Integration
- Direct export of grids to Excel
- Import master data from Excel
- Batch update capabilities

## Security Features

1. **User Management**:
   - Role-based access control
   - Module-wise permissions
   - Activity logging

2. **Data Security**:
   - SQL Server authentication
   - Encrypted connection strings
   - Regular backup scheduling

## Configuration

### Application Settings (`Esatto-Factory.exe.config`)
```xml
<appSettings>
  <add key="ApplicationName" value="Esatto-VMS"/>
  <add key="DatabaseName" value="Factory1920"/>
  <add key="ReportPath" value="\\192.168.1.100\Reports"/>
</appSettings>
```

### Database Connection
- Server: Remote SQL Server (IP-based)
- Authentication: SQL Server authentication
- Connection pooling enabled

## Business Workflows

### 1. New Order Processing
1. Create design or select existing
2. Generate job card
3. Calculate material requirements
4. Issue materials to karigar
5. Track progress through processes
6. Quality inspection
7. Final receipt to stock
8. Delivery to customer

### 2. Daily Operations
1. Morning material issue
2. Process updates throughout day
3. Evening receipts
4. Wastage accounting
5. Daily reports generation

### 3. Month-End Processing
1. Stock reconciliation
2. Karigar payment calculation
3. Financial closing
4. Management reports
5. Backup and archival

## Modernization Recommendations

### Python GUI Architecture
1. **Framework**: PyQt6 or Kivy for modern UI
2. **Database**: PostgreSQL or SQLite
3. **Backend**: FastAPI for API-first approach
4. **Voice Features**:
   - Speech recognition for data entry
   - Voice commands for navigation
   - Audio alerts for critical events

### Key Improvements
1. Cloud-based architecture
2. Mobile app for field operations
3. Real-time analytics dashboard
4. AI-powered quality inspection
5. Barcode/QR code integration
6. WhatsApp integration for notifications

## Migration Strategy

### Phase 1: Analysis and Planning
- Extract and analyze source code (from RAR files)
- Document all business rules
- Create detailed data migration plan

### Phase 2: Core Module Development
- User management and authentication
- Master data management
- Basic transaction modules

### Phase 3: Advanced Features
- Reporting system
- Voice integration
- Mobile apps
- Analytics dashboard

### Phase 4: Data Migration and Testing
- Migrate historical data
- Parallel run with old system
- User training
- Go-live

## Notes for Developers

1. **Weight Calculations**: The system uses multiple weight types. Ensure precision in calculations.
2. **Multi-language**: Consider Hindi/regional language support
3. **Offline Capability**: Design for intermittent connectivity
4. **Audit Trail**: Maintain complete audit logs for compliance
5. **Performance**: Optimize for large datasets (millions of transactions)

## Appendix

### Glossary
- **Karigar**: Craftsman/artisan who performs jewelry making
- **Gross Weight**: Total weight including all materials
- **Net Weight**: Weight after standard deductions
- **Pure Weight**: Actual precious metal content
- **Touch**: Purity of gold (e.g., 22K, 18K)
- **Making Charges**: Labor cost for crafting
- **Wastage**: Material loss during manufacturing

### Common Calculations
```python
# Pure weight calculation
pure_weight = gross_weight * (touch / 24)

# Making charges
making_charges = net_weight * rate_per_gram

# Total value
total_value = metal_value + stone_value + making_charges
```