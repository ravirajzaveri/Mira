# Esatto-Factory Software Analysis

## Overview
Esatto-Factory appears to be a jewelry manufacturing management software built on the .NET Framework (v4.5) using Windows Forms. The application is designed to manage various aspects of jewelry manufacturing operations.

## Technology Stack

### Core Technologies
- **Platform**: .NET Framework 4.5
- **UI Framework**: Windows Forms with Infragistics controls
- **Database**: SQL Server (connection to remote server 103.30.72.63)
- **Reporting**: Crystal Reports 13.0
- **Additional Libraries**:
  - Google APIs (Drive, Sheets) - likely for data export/import
  - Newtonsoft.Json - for JSON processing
  - Microsoft Office Interop - for Excel integration

### Third-Party Components
1. **Infragistics Controls** (v12.1):
   - UltraWinGrid - for data grids
   - UltraWinEditors - for input controls
   - UltraWinExplorerBar - for navigation
   - UltraWinToolbars - for toolbars and menus
   - UltraWinTabControl - for tabbed interfaces
   - Excel Export functionality

2. **Crystal Reports Components**:
   - Report engine and viewers
   - Report design and runtime libraries

3. **Custom Controls**:
   - CodeVendor.Controls.dll
   - EsattoCrystalControl.dll

## Application Architecture

### Configuration
From `Esatto-Factory.exe.config`:
- **Application Name**: Esatto-VMS
- **Database**: Factory1920 (on remote SQL Server)
- **Report Storage**: Network path (\\192.168.1.6\SATOLM)
- **Image Storage**: Local \Images directory

### Data Layer
- **Esatto.DataLayer.dll**: Contains data access logic
- **System.DataLayer.pdb**: Debug symbols for data layer

## Business Entities and Workflows

Based on the XML schema files in ReportsXML directory, the system manages:

### 1. Job Card Management (`JobCardStaffwise.xsd`)
- Tracks manufacturing jobs with unique job card numbers
- Records process names and staff assignments
- Manages item descriptions and design details
- Tracks pieces, weights (gross/net), and stone details
- Records time spent (hours and minutes)
- Links to order numbers and quality control

### 2. Stock Register (`tblStockRegister.xsd`)
- Manages inventory with issue numbers and dates
- Tracks various weight measurements:
  - Cwt (Carat weight)
  - Stnwt (Stone weight)
  - Gwt (Gross weight)
  - Nwt (Net weight)
  - PureWt (Pure weight)
  - ChainWt (Chain weight)
- Calculates amounts and making rates

### 3. Karigar (Craftsman) Ledger (`tblKarigarLeadger.xsd`)
- Manages craftsman transactions
- Tracks parties, dates, and amounts
- Records pure weights and carat weights

### 4. Diamond Ledger (`tblDiamLed.xsd`)
- Specialized tracking for diamond inventory
- Issue and receipt management
- Detailed weight tracking for diamonds
- Price calculations including making rates

### 5. Casting Process (`IssueCasting.xsd`)
- Manages casting operations
- Tracks brass weight for casting
- Links to process IDs and staff
- Records design specifications

### 6. Issue and Receipt Processes
- `IssueProcess.xsd`: General issue tracking
- `IssueWax.xsd`: Wax model issue tracking
- `ReceiptCasting.xsd`: Casting receipt management
- `ReceiptProcess.xsd`: General receipt tracking

### 7. Specialized Reports
- `StoneWiseReport.xsd`: Stone inventory analysis
- `KarigarLedSizeWise.xsd`: Size-wise craftsman ledger
- `tblRapaport.xsd`: Likely for diamond pricing (Rapaport reference)
- `tblPointer.xsd` and `tblPointLed.xsd`: Point tracking system

## Key Features

### 1. Manufacturing Process Management
- Job card creation and tracking
- Multi-stage process workflow
- Staff assignment and time tracking
- Quality control integration

### 2. Inventory Management
- Comprehensive weight tracking system
- Multiple weight types (gross, net, pure, stone, etc.)
- Issue and receipt management
- Stock register maintenance

### 3. Craftsman Management
- Individual craftsman ledgers
- Work assignment and tracking
- Payment calculations based on work done

### 4. Reporting System
- Crystal Reports integration
- Multiple report templates
- XML-based data schemas for reports
- Network-based report storage

### 5. Data Integration
- Google Drive integration (backup/sync)
- Google Sheets integration (data export)
- Excel export capabilities
- JSON data processing

## Security and Access
- Client authentication membership provider
- Role-based access control
- Network-based deployment

## File Structure
- Main executable: Esatto-Factory.exe
- Configuration: Esatto-Factory.exe.config
- Data access: Esatto.DataLayer.dll
- UI controls: Multiple Infragistics DLLs
- Reports: ReportsXML directory with schema definitions
- Images: Local Images directory

## Database Design (Inferred)
Based on the XML schemas, the database likely contains tables for:
- Job cards and job card details
- Stock register entries
- Craftsman (Karigar) information and ledgers
- Diamond inventory and transactions
- Casting and process records
- Issue and receipt transactions
- Design specifications
- Order management
- Quality control records

## Business Logic Areas
1. **Weight Calculations**: Complex weight conversions between gross, net, pure weights
2. **Pricing Logic**: Making rates, stone amounts, total calculations
3. **Process Flow**: Multi-stage manufacturing workflow
4. **Inventory Tracking**: Real-time stock management
5. **Craftsman Accounting**: Work-based payment calculations

## Notes
- The application appears to be designed for Indian jewelry manufacturing (use of terms like "Karigar")
- Multiple weight tracking systems suggest dealing with precious metals
- Integration with Rapaport suggests diamond trading capabilities
- Network-based deployment indicates multi-user environment
- The presence of "Factory1920" suggests fiscal year-based database naming

## Recommendations for Further Analysis
To get a complete understanding of the source code, you would need to:
1. Extract and examine the RAR files (Debug.rar and Esatto-Factory.rar) using appropriate tools
2. Decompile the .NET assemblies to view the actual C# code
3. Analyze the database schema from the SQL Server
4. Review any documentation within the extracted files
5. Examine the UI forms and user workflows