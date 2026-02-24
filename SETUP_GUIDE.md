# 🚀 Quick Setup Guide

Follow these steps to get your Recovery Management SaaS up and running.

## Step 1: Prerequisites Check

Ensure you have:
- ✅ Node.js v18+ installed (`node --version`)
- ✅ MongoDB installed and running (`mongod --version`)
- ✅ npm or yarn installed

## Step 2: Install Dependencies

From the project root directory:

```bash
# Install all dependencies (backend + frontend)
npm run install:all
```

## Step 3: Setup Backend

```bash
cd backend

# 1. Create .env file (already exists, but verify it)
# Make sure DATABASE_URL points to your MongoDB

# 2. Generate Prisma Client
npm run prisma:generate

# 3. Push database schema to MongoDB
npm run prisma:push

# 4. Seed database with demo data
npm run seed
```

Expected output:
```
✅ Super Admin created: admin@saas.com
✅ Demo Business created: Demo Business Ltd
✅ Business Owner created: owner@business.com
✅ Coin Rule created for business
✅ Demo Clients created
✅ Demo Transactions created
✅ Coin Transactions created
```

## Step 4: Start the Application

### Option A: Run Both Together (Recommended)

From the root directory:
```bash
npm run dev
```

This starts:
- Backend on http://localhost:5000
- Frontend on http://localhost:3000

### Option B: Run Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## Step 5: Access the Application

Open your browser and go to: **http://localhost:3000**

## Step 6: Login with Demo Accounts

### Test as Super Admin
```
Email: admin@saas.com
Password: admin123
```
**Features:** View all businesses, system stats, activate/deactivate businesses

### Test as Business Owner
```
Email: owner@business.com
Password: owner123
```
**Features:** Manage clients, create transactions, mark payments, configure coins

### Test as Client
```
Email: john@example.com
Password: client123
```
**Features:** View transactions, check coin balance, request claims

## 🎯 What to Try

### As Business Owner:
1. **Dashboard** - View stats and charts
2. **Clients** - Add a new client
3. **Transactions** - Create a recovery transaction
4. **Mark Payment** - Mark a pending payment as paid (generates coins!)
5. **Coin Rules** - Adjust coin earning rates

### As Client:
1. **Dashboard** - View your stats
2. **Transactions** - See all your transactions
3. **My Coins** - Check coin balance and request a claim

### As Super Admin:
1. **Dashboard** - See system-wide statistics
2. **Businesses** - View all businesses
3. **Toggle Status** - Activate/deactivate a business

## 🔧 Troubleshooting

### MongoDB Not Running
```bash
# On Ubuntu/Linux
sudo systemctl start mongod
sudo systemctl status mongod

# On macOS (Homebrew)
brew services start mongodb-community
```

### Port Already in Use
If port 5000 or 3000 is busy, edit:
- Backend: `backend/.env` → Change `PORT=5000` to another port
- Frontend: `frontend/vite.config.js` → Change `server.port: 3000`

### Prisma Client Error
```bash
cd backend
rm -rf node_modules
npm install
npm run prisma:generate
```

### Cannot Find Module Error
```bash
# Re-install dependencies
cd backend && npm install
cd ../frontend && npm install
```

## 📱 Testing the Full Flow

1. **Register a New Business:**
   - Logout if logged in
   - Click "Register Business"
   - Fill in the form
   - Login with new credentials

2. **Add a Client:**
   - Go to Clients page
   - Click "Add Client"
   - Enter client details
   - Client can now login!

3. **Create & Pay Transaction:**
   - Go to Transactions
   - Click "Add Transaction"
   - Select client and amount
   - Mark as paid → Coins generated automatically!

4. **Client Claims Coins:**
   - Login as client
   - Go to "My Coins"
   - Click "Request Claim"
   - Enter coins to redeem

## 🎨 Customization

### Change Brand Colors
Edit `frontend/tailwind.config.js` and `frontend/src/main.jsx`

### Modify Coin Rules
Login as Business Owner → Coin Rules page

### Add More Features
- Backend: Add controllers in `backend/src/controllers/`
- Frontend: Add pages in `frontend/src/pages/`

## ✅ Success!

You now have a fully functional SaaS Recovery Management System!

For detailed API documentation and more information, see the main README.md file.

---

**Need help?** Check the troubleshooting section or review the logs in your terminal.
