# 🚀 Quick Reference Card

## ⚡ Start Commands

```bash
# Install everything
npm run install:all

# Setup database (run once)
cd backend
npm run prisma:generate
npm run prisma:push
npm run seed

# Start app (from root)
npm run dev
```

## 🔗 URLs

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 🔑 Demo Logins

```
Super Admin:    admin@saas.com / admin123
Business Owner: owner@business.com / owner123
Client:         john@example.com / client123
```

## 📁 Key Files

```
backend/
├── src/index.js              # Server entry
├── prisma/schema.prisma      # Database models
├── controllers/              # Request handlers
└── routes/                   # API routes

frontend/
├── src/main.jsx              # App entry
├── pages/                    # All pages
├── store/authStore.js        # Auth state
└── services/api.js           # API client
```

## 🎯 Key Features by Role

**Super Admin:**
- View all businesses
- System statistics
- Activate/deactivate businesses

**Business Owner:**
- Dashboard with charts
- Manage clients (CRUD)
- Create transactions
- Mark payments (auto-generates coins)
- Configure coin rules

**Client:**
- View transactions
- Check coin balance
- Request claims

## 🔄 Coin System

```javascript
Coins = floor(PaymentAmount / RecoveryAmountPerCoin)
```

Example: $350 payment ÷ $100 per coin = 3 coins earned

## 📡 Main API Routes

```
Auth:
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me

Super Admin:
GET  /api/super-admin/dashboard
GET  /api/super-admin/businesses

Business Owner:
GET  /api/business-owner/dashboard
GET  /api/business-owner/clients
POST /api/business-owner/clients
POST /api/business-owner/recovery-transactions
PATCH /api/business-owner/recovery-transactions/:id/mark-paid
GET  /api/business-owner/coin-rules
PUT  /api/business-owner/coin-rules

Client:
GET  /api/client/dashboard
GET  /api/client/transactions
GET  /api/client/coins
POST /api/client/coins/claim
```

## 🛠️ Common Commands

```bash
# Backend
cd backend
npm run dev           # Start dev server
npm run seed          # Reseed database
npm run prisma:push   # Update database schema

# Frontend
cd frontend
npm run dev           # Start dev server
npm run build         # Build for production

# Both (from root)
npm run dev           # Start both servers
```

## 🐛 Quick Troubleshooting

**MongoDB not running?**
```bash
sudo systemctl start mongod
```

**Port in use?**
Change PORT in `backend/.env`

**Prisma error?**
```bash
cd backend
npm run prisma:generate
```

**Module not found?**
```bash
npm run install:all
```

## 🎨 Tech Stack

**Backend:** Node.js, Express, MongoDB, Prisma, JWT
**Frontend:** React, Vite, Tailwind CSS, Material UI, Zustand

## 📊 Database Models

1. User (super_admin, business_owner, client)
2. Business (company accounts)
3. Client (customers)
4. RecoveryTransaction (payments)
5. CoinWallet (coin balances)
6. CoinTransaction (coin history)
7. CoinRule (earning rates)

## ✨ Testing Flow

1. Login as Business Owner
2. Add a new client
3. Create a recovery transaction
4. Mark it as paid → coins generated!
5. Login as that client
6. View coins and request claim

---

**Need more details?** See README.md and SETUP_GUIDE.md
