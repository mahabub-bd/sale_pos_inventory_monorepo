# Sale POS & Inventory Management System

A comprehensive Point of Sale (POS) and Inventory Management System built with modern technologies. This monorepo includes a full-featured frontend web application, a robust NestJS backend API, and shared packages.

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Development](#development)
- [Deployment](#deployment)
- [Documentation](#documentation)

---

## Project Overview

This is a full-stack enterprise POS and inventory management system designed for retail and wholesale businesses. It provides comprehensive features for managing sales, inventory, purchases, accounting, and business operations efficiently.

---

## Features

### Point of Sale (POS)

- **Multi-Register Support**: Manage multiple cash registers simultaneously
- **Cash Management**: Track cash in/out transactions and register balances
- **Multiple Payment Methods**: Support for cash, card, digital wallets, and bank transfers
- **Receipt Generation**: Automatic PDF receipt generation with customizable templates
- **Barcode Scanning**: Fast product lookup via barcode/QR code scanning
- **Hold & Resume Sales**: Put sales on hold and resume later
- **Discount & Tax Management**: Apply discounts and taxes at item or invoice level
- **Returns & Refunds**: Process returns and refunds with automatic inventory updates
- **Split Payments**: Accept payments from multiple payment methods
- **Tip Management**: Add and track tips for service-based transactions

### Inventory Management

- **Multi-Location Support**: Manage inventory across multiple warehouses/branches
- **Stock Tracking**: Real-time stock level monitoring with low stock alerts
- **Batch/Lot Tracking**: Track products by batch or lot numbers with expiry dates
- **Serial Number Tracking**: Individual item tracking via serial numbers
- **Stock Transfers**: Transfer stock between locations with approval workflows
- **Stock Adjustments**: Handle stock additions, damages, and losses
- **Inventory Valuation**: FIFO, LIFO, and weighted average costing methods
- **Reorder Points**: Automatic reorder notifications based on minimum stock levels
- **Physical Inventory**: Stock taking and reconciliation features
- **Product Variants**: Manage products with multiple variants (size, color, etc.)

### Product Management

- **Product Catalog**: Comprehensive product database with detailed information
- **Categories & Subcategories**: Hierarchical category organization
- **Brand Management**: Brand classification and reporting
- **Manufacturer Tracking**: Track product manufacturers and suppliers
- **Unit of Measurement**: Multiple units with conversion rates
- **Product Images**: Multiple image uploads with gallery view
- **Product Specifications**: Custom fields and attributes per product type
- **Pricing Control**: Multiple price lists (retail, wholesale, etc.)
- **Product Tags**: Flexible tagging system for categorization
- **Product Variations**: Manage size, color, and other variations

### Purchase Management

- **Purchase Orders**: Create and manage purchase orders
- **Purchase Returns**: Process returns to suppliers
- **Supplier Management**: Comprehensive supplier database
- **Price Comparison**: Compare prices across suppliers
- **Purchase Requisitions**: Request purchases from different departments
- **Goods Receipt Note (GRN)**: Record received goods with quality checks
- **Supplier Invoices**: Track and manage supplier bills
- **Payment Tracking**: Monitor supplier payments and outstanding balances
- **Purchase Analytics**: Purchase reports and trend analysis

### Sales Management

- **Sales Orders**: Create and manage sales orders
- **Invoicing**: Generate professional invoices with company branding
- **Quotations**: Create price quotes and convert to sales orders
- **Delivery Management**: Manage deliveries and shipment tracking
- **Sales Returns**: Handle customer returns and credit notes
- **Credit Management**: Manage customer credit limits and payment terms
- **Invoice Discounts**: Apply early payment discounts
- **Recurring Invoices**: Automated recurring billing
- **Sales Analytics**: Comprehensive sales reports and dashboards

### Customer Management

- **Customer Database**: Detailed customer profiles and history
- **Customer Groups**: Segment customers for targeted pricing
- **Credit Limits**: Set and monitor credit limits per customer
- **Customer Loyalty**: Loyalty points and rewards program
- **Transaction History**: Complete purchase history and tracking
- **Customer Statements**: Generate account statements
- **Multi-Currency**: Support for international customers
- **Communication**: Email/SMS integration for notifications

### Accounting & Finance

- **Double-Entry Accounting**: Complete double-entry bookkeeping system
- **Chart of Accounts**: Hierarchical account structure (Assets, Liabilities, Equity, Revenue, Expenses)
- **Journal Entries**: Manual and automated journal entries
- **General Ledger**: Complete transaction history per account
- **Accounts Payable**: Track money owed to suppliers
- **Accounts Receivable**: Track money owed by customers
- **Bank Reconciliation**: Reconcile bank statements
- **Financial Reports**:
  - Profit & Loss Statement
  - Balance Sheet
  - Cash Flow Statement
  - Trial Balance
  - Aging Reports
- **Budget Management**: Create and track budgets
- **Tax Management**: Multi-tax rate support with tax reporting
- **Cost Centers**: Track expenses by department/project

### Expense Management

- **Expense Categories**: Organize expenses by category
- **Expense Tracking**: Record and track all business expenses
- **Expense Approval**: Multi-level approval workflows
- **Reimbursements**: Process employee expense reimbursements
- **Expense Reports**: Detailed expense analysis and reporting
- **Budget vs Actual**: Compare actual spending against budgets

### Human Resources

- **Employee Management**: Complete employee database
- **Departments**: Organize employees by department
- **Designations**: Manage job titles and roles
- **Attendance Tracking**: Monitor employee attendance
- **Leave Management**: Leave requests, balances, and approval workflows
- **Payroll**: Salary calculation and payment processing
- **Employee Performance**: Performance reviews and ratings
- **Shift Management**: Manage work shifts and schedules

### Production Management

- **Production Orders**: Create and manage production orders
- **Bill of Materials (BOM)**: Define recipes and material requirements
- **Production Planning**: Plan production based on demand
- **Work Orders**: Issue work orders to production teams
- **Material Consumption**: Track raw material usage
- **Finished Goods**: Track completed production
- **Production Costing**: Calculate production costs
- **Waste Management**: Track production waste and scrap

### Warehouse Management

- **Multi-Warehouse**: Manage multiple warehouse locations
- **Warehouse Zones**: Organize warehouse into zones/bins
- **Stock Movement**: Track all stock movements
- **Pick & Pack**: Optimize picking and packing processes
- **Stock Transfers**: Transfer stock between warehouses
- **Warehouse Reports**: Warehouse performance analytics

### Reporting & Analytics

- **Sales Reports**: Sales by product, customer, period, salesperson
- **Inventory Reports**: Stock valuation, movement, slow/fast-moving items
- **Purchase Reports**: Purchase analysis by supplier, category
- **Financial Reports**: P&L, Balance Sheet, Cash Flow, Trial Balance
- **Tax Reports**: Sales tax, purchase tax, GST/VAT reports
- **Customer Reports**: Customer analytics, aging, purchase history
- **Supplier Reports**: Supplier performance and payment reports
- **Employee Reports**: Sales by employee, commission reports
- **Custom Reports**: Build custom reports with filters
- **Dashboard**: Real-time business intelligence dashboards
- **Export Options**: Export to PDF, Excel, CSV
- **Scheduled Reports**: Automated report generation and email

### System Features

- **Multi-Branch**: Manage multiple business branches
- **Role-Based Access Control**: Granular permissions by role
- **User Management**: Manage system users and access
- **Audit Trail**: Complete audit log of all system activities
- **Settings**: Configurable system settings and preferences
- **Database Backup**: Automated backup and restore functionality
- **File Attachments**: Attach documents to transactions
- **Currency Management**: Multi-currency support with rate updates
- **Tax Configuration**: Flexible tax configuration
- **Number Series**: Customizable numbering sequences for all documents
- **Email Templates**: Customizable email templates
- **API Access**: RESTful API for integrations
- **Mobile Responsive**: Fully responsive design for mobile devices

---

## Project Structure

This is a **Turborepo** monorepo with the following structure:

```
sale-pos-inventory/
├── apps/                              # Applications
│   ├── web/                           # Frontend React application
│   │   ├── src/                       # Source code
│   │   ├── public/                    # Static assets
│   │   ├── package.json
│   │   └── PROJECT_STRUCTURE.md       # Frontend structure details
│   │
│   └── backend/                       # Backend NestJS API
│       ├── src/                       # Source code
│       │   ├── account/               # Accounting module
│       │   ├── auth/                  # Authentication module
│       │   ├── attachment/            # File attachments
│       │   ├── audit/                 # Audit logging
│       │   ├── branch/                # Branch management
│       │   ├── brand/                 # Brand management
│       │   ├── cash-register/         # Cash register operations
│       │   ├── category/              # Product categories
│       │   ├── customer-group/        # Customer groups
│       │   ├── customer/              # Customer management
│       │   ├── database-backup/       # Backup system
│       │   ├── department/            # Department management
│       │   ├── designation/           # Designation/roles
│       │   ├── employee/              # Employee management
│       │   ├── expense-category/      # Expense categories
│       │   ├── expenses/              # Expense tracking
│       │   ├── inventory/             # Inventory management
│       │   ├── invoice/               # Invoice generation
│       │   ├── leave/                 # Leave management
│       │   ├── manufacturer/          # Manufacturer management
│       │   ├── payment/               # Payment processing
│       │   ├── permissions/           # Permission management
│       │   ├── pos/                   # Point of Sale
│       │   ├── product/               # Product management
│       │   ├── production/            # Production orders
│       │   ├── production-recipe/     # Production recipes/BOM
│       │   ├── purchase-return/       # Purchase returns
│       │   ├── purchase/              # Purchase orders
│       │   ├── quotation/             # Quotations
│       │   ├── report/                # Reporting
│       │   ├── role/                  # Role management
│       │   ├── sale/                  # Sales management
│       │   ├── settings/              # System settings
│       │   ├── supplier/              # Supplier management
│       │   ├── tag/                   # Tag management
│       │   ├── unit/                  # Unit of measurement
│       │   ├── user/                  # User management
│       │   ├── warehouse/             # Warehouse management
│       │   ├── common/                # Common utilities
│       │   ├── health/                # Health check
│       │   ├── app.module.ts          # Root module
│       │   ├── main.ts                # Entry point
│       │   └── ...
│       ├── test/                      # Test files
│       ├── .env                       # Environment variables
│       └── package.json
│
├── packages/                          # Shared packages
│   ├── eslint-config/                # Shared ESLint configuration
│   ├── typescript-config/            # Shared TypeScript configuration
│   └── ui/                           # Shared UI components
│
├── package.json                      # Root package.json
├── turbo.json                        # Turborepo configuration
├── pnpm-workspace.yaml               # PNPM workspace configuration
└── README.md                         # This file
```

---

## Technology Stack

### Frontend (Web App)

- **Framework:** React 18+ with TypeScript
- **Build Tool:** Vite
- **State Management:** Redux Toolkit + RTK Query
- **UI Components:** Custom component library with Tailwind CSS
- **Forms:** React Hook Form + Zod validation
- **Charts:** Recharts
- **Routing:** React Router v6
- **Icons:** Lucide React
- **PDF Generation:** @react-pdf/renderer
- **QR/Barcode:** QR code & barcode generation libraries
- **Styling:** Tailwind CSS + PostCSS

### Backend (API)

- **Framework:** NestJS (Node.js framework)
- **Language:** TypeScript
- **Database:** PostgreSQL with TypeORM
- **Authentication:** JWT (JSON Web Tokens)
- **Validation:** class-validator
- **API Documentation:** Swagger/OpenAPI
- **File Upload:** Multer
- **Scheduling:** NestJS Scheduler
- **Architecture:** Modular architecture with dependency injection

### Development Tools

- **Monorepo:** Turborepo
- **Package Manager:** PNPM
- **Code Quality:** ESLint, Prettier
- **Type Checking:** TypeScript
- **Version Control:** Git

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- PostgreSQL database
- Git

### Installation

1. **Clone the repository:**

```bash
git clone <repository-url>
cd sale-pos-inventory
```

2. **Install dependencies:**

```bash
pnpm install
```

3. **Set up environment variables:**

Copy the example environment files and configure them:

```bash
# Backend
cp apps/backend/.env.example apps/backend/.env

# Frontend (if needed)
cp apps/web/.env.example apps/web/.env
```

Edit the `.env` files with your database credentials and other configuration.

4. **Set up the database:**

```bash
# Run database migrations
cd apps/backend
pnpm prisma migrate dev
# or with TypeORM
pnpm typeorm migration:run
```

5. **Start the development servers:**

```bash
# Start all apps and packages
pnpm dev

# Or start individually:
pnpm --filter web dev          # Frontend only
pnpm --filter backend dev      # Backend only
```

The applications will be available at:

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:3000](http://localhost:3000)
- API Documentation (Swagger): [http://localhost:3000/api](http://localhost:3000/api)

---

## Development

### Available Scripts

- `pnpm dev` - Start development servers for all apps
- `pnpm build` - Build all apps and packages
- `pnpm lint` - Lint all packages
- `pnpm format` - Format code with Prettier
- `pnpm test` - Run tests

### Workspace Commands

```bash
# Run commands in specific workspace
pnpm --filter <app-name> <command>

# Examples:
pnpm --filter web dev
pnpm --filter backend build
pnpm --filter web lint
```

### Code Structure

#### Frontend Structure

The frontend application follows a feature-based structure:

- **`/src/components`** - Reusable React components
- **`/src/pages`** - Page components organized by feature
- **`/src/features`** - Redux slices and API endpoints
- **`/src/types`** - TypeScript type definitions
- **`/src/hooks`** - Custom React hooks
- **`/src/utils`** - Utility functions
- **`/src/constants`** - Application constants

For detailed frontend structure, see [apps/web/PROJECT_STRUCTURE.md](apps/web/PROJECT_STRUCTURE.md)

#### Backend Structure

The backend follows NestJS modular architecture with the following modules:

| Module                | Description                                           |
| --------------------- | ----------------------------------------------------- |
| **Auth**              | Authentication & authorization (JWT, login, register) |
| **User**              | User management and profiles                          |
| **Role**              | Role definitions and management                       |
| **Permissions**       | Granular permission control                           |
| **Branch**            | Multi-branch management                               |
| **Product**           | Product catalog and CRUD operations                   |
| **Category**          | Product categories and subcategories                  |
| **Brand**             | Brand management                                      |
| **Manufacturer**      | Manufacturer/supplier tracking                        |
| **Unit**              | Unit of measurement management                        |
| **Tag**               | Product tagging system                                |
| **Inventory**         | Stock management and tracking                         |
| **Warehouse**         | Warehouse/location management                         |
| **POS**               | Point of Sale operations                              |
| **Cash Register**     | Cash register management                              |
| **Sale**              | Sales order and invoice management                    |
| **Purchase**          | Purchase order management                             |
| **Purchase Return**   | Supplier return processing                            |
| **Customer**          | Customer database and management                      |
| **Customer Group**    | Customer segmentation                                 |
| **Supplier**          | Supplier management                                   |
| **Quotation**         | Price quote management                                |
| **Invoice**           | Invoice generation and tracking                       |
| **Payment**           | Payment processing and tracking                       |
| **Account**           | Chart of accounts and accounting                      |
| **Expenses**          | Expense tracking and management                       |
| **Expense Category**  | Expense categorization                                |
| **Employee**          | Employee records and management                       |
| **Department**        | Organizational departments                            |
| **Designation**       | Job titles and designations                           |
| **Leave**             | Leave management system                               |
| **Production**        | Production order management                           |
| **Production Recipe** | Bill of Materials (BOM)                               |
| **Report**            | Business reporting and analytics                      |
| **Settings**          | System configuration                                  |
| **Audit**             | Activity logging and audit trail                      |
| **Attachment**        | File upload and document management                   |
| **Database Backup**   | Backup and restore functionality                      |
| **Health**            | Health check endpoints                                |

Each module contains:

- **`*.module.ts`** - Module definition
- **`*.controller.ts`** - Request handling
- **`*.service.ts`** - Business logic
- **`dto/`** - Data Transfer Objects
- **`entities/`** - Database entities

---

## Deployment

### Building for Production

```bash
# Build all apps
pnpm build

# Build individually
pnpm --filter web build
pnpm --filter backend build
```

### Docker Deployment

Both applications support Docker deployment:

```bash
# Build Docker images
docker-compose build

# Run with Docker Compose
docker-compose up -d
```

### Environment Variables

Ensure all production environment variables are set:

**Backend:**

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (production/development)

**Frontend:**

- `VITE_API_URL` - Backend API URL
- Other VITE\_ prefixed variables

---

## Documentation

### Detailed Documentation

- [Frontend Structure](apps/web/PROJECT_STRUCTURE.md) - Complete frontend architecture and file organization
- [API Documentation](http://localhost:3000/api) - Swagger/OpenAPI documentation (when backend is running)

### Key Features

#### Point of Sale (POS)

- Multi-register support
- Cash management
- Multiple payment methods
- Receipt printing
- Barcode scanning

#### Inventory Management

- Multi-location inventory tracking
- Batch and serial number tracking
- Stock movements and adjustments
- Low stock alerts

#### Accounting

- Double-entry accounting system
- Chart of accounts
- Journal entries
- Financial reports (P&L, Balance Sheet)

#### Human Resources

- Employee management
- Attendance tracking
- Leave management
- Department and designation management

#### Reporting

- Sales reports
- Purchase reports
- Inventory reports
- Financial statements
- Custom date range filtering

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

## License

This project is licensed under the MIT License.

---

## Author

**Mahabub Hosain**

- Email: [contact@mahabub.me](mailto:contact@mahabub.me)
- Domain: [supplyzoneltd.com](https://supplyzoneltd.com)

---

## Support

For issues and questions, please open an issue on the GitHub repository or contact the author directly.

---

**Last Updated:** January 2026
