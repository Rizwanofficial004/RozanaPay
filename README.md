# 💼 Recovery Management SaaS

A professional, full-stack multi-tenant SaaS application for managing recovery transactions with an integrated coin rewards system.

## 🚀 Features

### Multi-Tenant Architecture
- **Super Admin** - Manage all businesses, view system-wide statistics
- **Business Owner** - Manage clients, recovery transactions, and coin rules
- **Client (Shopkeeper)** - View transactions, track coins, and request claims

### Core Functionality
- ✅ Complete authentication system with JWT
- ✅ Role-based access control
- ✅ Recovery transaction management
- ✅ Automated coin rewards system
- ✅ Beautiful, responsive dashboard UI
- ✅ Real-time statistics and analytics
- ✅ Interactive charts (daily/monthly recovery)
- ✅ Professional Material UI components

### Coin Rewards System
- Automatic coin generation on payment completion
- Configurable earning rates per business
- Minimum claim thresholds
- Transaction history tracking
- Client redemption requests

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express** - REST API server
- **MongoDB** - NoSQL database
- **Prisma ORM** - Type-safe database client
- **JWT** - Secure authentication
- **Bcrypt** - Password hashing

### Frontend
- **React 18** - UI library
- **Vite** - Fast build tool
- **JavaScript** (ES6+) - No TypeScript
- **Tailwind CSS** - Utility-first styling
- **Material UI v5** - Premium components
- **Zustand** - State management
- **React Router v6** - Navigation
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **React Toastify** - Notifications

## 📁 Project Structure

```
saas/
├── backend/
│   ├── src/
│   │   ├── controllers/       # Request handlers
│   │   ├── routes/            # API routes
│   │   ├── middlewares/       # Auth & error handling
│   │   ├── utils/             # Helper functions
│   │   └── index.js           # Server entry point
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── seed.js            # Seed data script
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── layouts/           # Layout templates
│   │   ├── pages/             # Page components
│   │   │   ├── auth/          # Login, Register
│   │   │   ├── super-admin/   # Super admin pages
│   │   │   ├── business-owner/ # Business owner pages
│   │   │   └── client/        # Client pages
│   │   ├── routes/            # Route configuration
│   │   ├── services/          # API services
│   │   ├── store/             # Zustand stores
│   │   ├── App.jsx            # Root component
│   │   └── main.jsx           # Entry point
│   └── package.json
│
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (running locally or connection string)
- npm or yarn

### Installation

1. **Clone or navigate to the project directory:**
```bash
cd /home/rizwan/Documents/rizwan/saas
```

2. **Install dependencies for all packages:**
```bash
npm run install:all
```

Or install manually:
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
cd ..
```

### Backend Setup

1. **Configure environment variables:**
```bash
cd backend
# Edit the .env file or create one based on .env.example
```

Default `.env` configuration:
```env
PORT=5000
DATABASE_URL="mongodb://localhost:27017/recovery_saas"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
NODE_ENV="development"
```

2. **Generate Prisma Client:**
```bash
npm run prisma:generate
```

3. **Push database schema:**
```bash
npm run prisma:push
```

4. **Seed database with demo data:**
```bash
npm run seed
```

### Running the Application

**Option 1: Run both frontend and backend together (from root):**
```bash
npm run dev
```

**Option 2: Run separately:**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

### Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000

## 👥 Demo Credentials

After running the seed script, use these credentials to login:

### Super Admin
- **Email:** admin@saas.com
- **Password:** admin123

### Business Owner
- **Email:** owner@business.com
- **Password:** owner123

### Client
- **Email:** john@example.com
- **Password:** client123

## 📊 Database Models

### User
- Multi-role support (super_admin, business_owner, client)
- Linked to Business or Client

### Business
- Business information
- Active/inactive status
- Coin rules configuration

### Client
- Customer information
- Linked to business
- Has coin wallet

### RecoveryTransaction
- Amount and status
- Payment tracking
- Business and client references

### CoinWallet
- Tracks client coin balance

### CoinTransaction
- History of earned/claimed coins

### CoinRule
- Business-specific coin configuration
- Earning rates and minimum claim amounts

## 🎯 Key Features by Role

### Super Admin Dashboard
- View all businesses
- Total system statistics
- Activate/Deactivate businesses
- Monitor revenue across all businesses

### Business Owner Dashboard
- Overview cards (clients, recovery, coins)
- Daily and monthly recovery charts
- **Manage Clients:**
  - Add/Edit/Delete clients
  - View client details and transactions
- **Recovery Transactions:**
  - Create recovery entries
  - Mark payments as paid
  - Automatic coin generation
- **Coin Rules:**
  - Configure earning rates
  - Set minimum claim amounts
  - Customize coin descriptions

### Client Portal
- View dashboard with stats
- Transaction history
- Coin balance and history
- Request coin claims

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new business
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Super Admin
- `GET /api/super-admin/dashboard` - Dashboard stats
- `GET /api/super-admin/businesses` - List businesses
- `PATCH /api/super-admin/businesses/:id/toggle-status` - Toggle business status

### Business Owner
- `GET /api/business-owner/dashboard` - Dashboard stats
- `GET /api/business-owner/clients` - List clients
- `POST /api/business-owner/clients` - Create client
- `PUT /api/business-owner/clients/:id` - Update client
- `DELETE /api/business-owner/clients/:id` - Delete client
- `GET /api/business-owner/recovery-transactions` - List transactions
- `POST /api/business-owner/recovery-transactions` - Create transaction
- `PATCH /api/business-owner/recovery-transactions/:id/mark-paid` - Mark as paid
- `GET /api/business-owner/coin-rules` - Get coin rules
- `PUT /api/business-owner/coin-rules` - Update coin rules

### Client
- `GET /api/client/dashboard` - Dashboard data
- `GET /api/client/transactions` - Transaction history
- `GET /api/client/coins` - Coin balance and history
- `POST /api/client/coins/claim` - Request coin claim

## 🎨 UI Components

- **Cards** - Modern card layouts with shadows
- **Tables** - Paginated data tables
- **Charts** - Line and bar charts using Recharts
- **Modals** - Dialog forms for CRUD operations
- **Navigation** - Collapsible sidebar with role-based menus
- **Toasts** - Real-time notifications
- **Responsive** - Mobile-friendly design

## 🔄 Coin System Logic

```javascript
// When a payment is marked as paid:
coinsEarned = Math.floor(paymentAmount / recoveryAmountPerCoin)

// Example:
// Payment: $350
// recoveryAmountPerCoin: 100
// Result: 3 coins earned
```

## 🚦 Future Enhancements

- [ ] Payment gateway integration (webhook ready)
- [ ] Email notifications
- [ ] SMS alerts
- [ ] Advanced reporting
- [ ] Export data (PDF/Excel)
- [ ] Mobile app
- [ ] Multi-language support
- [ ] Dark mode

## 🐛 Troubleshooting

### MongoDB Connection Error
```bash
# Make sure MongoDB is running
sudo systemctl start mongod
```

### Port Already in Use
```bash
# Change PORT in backend/.env
PORT=5001
```

### Prisma Client Not Found
```bash
cd backend
npm run prisma:generate
```

## 📝 Scripts Reference

### Root
- `npm run dev` - Run both frontend and backend
- `npm run install:all` - Install all dependencies

### Backend
- `npm run dev` - Start development server
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:push` - Push schema to database
- `npm run seed` - Seed database

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🤝 Contributing

This is a professional SaaS template. Feel free to customize and extend it for your needs.

## 📄 License

MIT License

## 👨‍💻 Author

Built with ❤️ using modern web technologies

---

### 🌟 Star this project if you find it helpful!

For any questions or issues, please open an issue in the repository.
