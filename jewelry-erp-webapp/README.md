# Jewelry ERP Web Application

A modern, full-stack jewelry manufacturing management system built with Next.js, FastAPI, and Prisma, deployable on Vercel.

## Features

### Core Functionality
- **Issue Management**: Create and track material issues to karigars (craftsmen)
- **Receipt Management**: Record receipts against issued materials with automatic balance calculation
- **Real-time Tracking**: Live updates of weight balances and process status
- **Responsive Design**: Modern UI that works on desktop, tablet, and mobile

### Business Features
- **Weight Management**: Comprehensive tracking of gross, net, stone, and wastage weights
- **Process Tracking**: Multi-stage manufacturing process management
- **Status Management**: Automatic status updates (Pending/Partial/Completed)
- **Balance Validation**: Prevents over-receipt with tolerance checking
- **Auto-numbering**: Automatic generation of unique issue and receipt numbers

### Technical Features
- **Modern Stack**: Next.js 14, FastAPI, Prisma ORM, PostgreSQL
- **Type Safety**: Full TypeScript implementation
- **API-First**: RESTful API design with OpenAPI documentation
- **Cloud Ready**: Optimized for Vercel deployment
- **Real-time Updates**: WebSocket support for live data updates
- **Voice Ready**: Architecture prepared for 11Labs AI integration

## Tech Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **React Hook Form**: Form validation and management
- **Axios**: HTTP client for API calls
- **Recharts**: Data visualization
- **React Hot Toast**: Notifications

### Backend
- **FastAPI**: Modern Python web framework
- **Prisma**: Next-generation ORM
- **PostgreSQL**: Production database
- **Pydantic**: Data validation
- **Python-jose**: JWT authentication
- **Asyncio**: Asynchronous programming

### Deployment
- **Vercel**: Frontend and API deployment
- **PostgreSQL**: Database (Vercel Postgres or external)
- **Environment Variables**: Secure configuration

## Project Structure

```
jewelry-erp-webapp/
├── frontend/                 # Next.js application
│   ├── app/                 # App router pages
│   │   ├── page.tsx         # Dashboard
│   │   ├── issue/           # Issue management
│   │   ├── receive/         # Receipt management
│   │   └── layout.tsx       # Root layout
│   ├── components/          # Reusable UI components
│   ├── lib/                 # Utilities and API client
│   ├── types/               # TypeScript type definitions
│   └── package.json
├── backend/                 # FastAPI application
│   ├── main.py              # Application entry point
│   ├── routers/             # API route handlers
│   ├── schemas/             # Pydantic models
│   ├── database.py          # Database connection
│   ├── schema.prisma        # Database schema
│   └── requirements.txt
└── vercel.json              # Deployment configuration
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- PostgreSQL database

### Environment Variables

Create `.env` files in both frontend and backend directories:

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Backend (.env):**
```env
# Neon PostgreSQL Database
DATABASE_URL="postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/jewelry_erp?sslmode=require"
DIRECT_URL="postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/jewelry_erp?sslmode=require"
ENVIRONMENT="development"
DEBUG=True
CORS_ORIGINS="http://localhost:3000"
JWT_SECRET="your-super-secret-jwt-key"
```

> **Note**: See [NEON_SETUP.md](./NEON_SETUP.md) for detailed Neon database setup instructions.

### Installation

1. **Clone and setup:**
```bash
git clone <repository-url>
cd jewelry-erp-webapp
```

2. **Frontend setup:**
```bash
cd frontend
npm install
npm run dev
```

3. **Backend setup:**
```bash
cd backend
pip install -r requirements.txt
prisma generate
prisma db push
uvicorn main:app --reload
```

4. **Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Database Schema

### Core Entities

**Karigar (Craftsmen)**
- Personal information and contact details
- Active status tracking
- Relationship to issues and receipts

**Process**
- Manufacturing process definitions
- Process descriptions and active status

**Design**
- Product design catalog
- Category-based organization

**Issue**
- Material issued to karigars
- Weight tracking and process assignment
- Status management (Pending/Partial/Completed)

**Receipt**
- Material received from karigars
- Wastage and loss tracking
- Automatic balance calculation

**Stock Register**
- Complete audit trail of all transactions
- Weight movement tracking
- Balance maintenance

## API Endpoints

### Issues
- `POST /api/issues/` - Create new issue
- `GET /api/issues/` - List issues with filtering
- `GET /api/issues/{id}` - Get issue details
- `PUT /api/issues/{id}` - Update issue
- `DELETE /api/issues/{id}` - Delete issue
- `GET /api/issues/generate/number` - Generate issue number

### Receipts
- `POST /api/receipts/` - Create new receipt
- `GET /api/receipts/` - List receipts with filtering
- `GET /api/receipts/{id}` - Get receipt details
- `PUT /api/receipts/{id}` - Update receipt
- `DELETE /api/receipts/{id}` - Delete receipt
- `GET /api/receipts/generate/number` - Generate receipt number

### Master Data
- `GET /api/karigars/` - List karigars
- `GET /api/processes/` - List processes
- `GET /api/designs/` - List designs

## Deployment to Vercel

### 1. Neon Database Setup
Set up a Neon PostgreSQL database (recommended):

1. Create account at [neon.tech](https://neon.tech)
2. Create new project: "jewelry-erp"
3. Copy the connection string

### 2. Environment Variables
Configure in Vercel dashboard:
- `DATABASE_URL`: Your Neon connection string
- `DIRECT_URL`: Same as DATABASE_URL for Neon
- `JWT_SECRET`: Secure random string

```bash
# Using Vercel CLI
vercel env add DATABASE_URL
vercel env add DIRECT_URL
vercel env add JWT_SECRET
```

### 3. Deploy
```bash
vercel --prod
```

### 4. Database Migration
After deployment:
```bash
prisma db push
python backend/seed.py
```

> **Detailed Setup**: See [NEON_SETUP.md](./NEON_SETUP.md) for complete Neon database configuration.

## Features Implementation Status

### ✅ Completed
- [x] Next.js frontend with responsive design
- [x] FastAPI backend with Prisma ORM
- [x] Complete Issue management
- [x] Complete Receipt management
- [x] Real-time weight calculations
- [x] Auto-numbering system
- [x] Status management
- [x] Vercel deployment configuration
- [x] TypeScript implementation
- [x] API documentation

### 🚧 In Progress
- [ ] Authentication and authorization
- [ ] Real-time WebSocket updates
- [ ] Advanced reporting

### 🔮 Planned
- [ ] 11Labs voice integration
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Export functionality (PDF/Excel)
- [ ] Barcode/QR code integration
- [ ] Multi-tenant support

## Business Workflow

### Issue Process
1. **Create Issue**: Assign work to karigar with material details
2. **Generate Number**: Auto-generate unique issue number
3. **Weight Tracking**: Track gross, stone, and calculated net weight
4. **Process Assignment**: Assign specific manufacturing process
5. **Status Monitoring**: Track completion status

### Receipt Process
1. **Select Issue**: Choose from pending issues by karigar
2. **Record Receipt**: Enter received weights and wastage
3. **Balance Validation**: Automatic validation against issued amount
4. **Status Update**: Auto-update issue status based on completion
5. **Audit Trail**: Complete transaction history

### Weight Calculations
```
Net Weight = Gross Weight - Stone Weight
Receipt Net = Receipt Gross - Receipt Stone - Wastage Weight
Balance = Issue Net Weight - Total Receipts Net Weight
```

## Voice Integration (Future)

The application is architected to support voice commands using 11Labs AI:

- **Voice Commands**: "Create new issue", "Show pending items"
- **Voice Data Entry**: Hands-free weight and number input
- **Audio Feedback**: Spoken confirmations and alerts
- **Multi-language**: Support for regional languages

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Open an issue on GitHub
- Check the API documentation at `/docs`
- Review the database schema in `schema.prisma`

---

**Built with ❤️ for modern jewelry manufacturing management**