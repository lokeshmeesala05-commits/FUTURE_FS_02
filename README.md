# CRM Pro - Full-Stack Application

Production-ready Customer Relationship Management web application built with a modern stack.

## 🌐 Live Demo

| Service | URL |
|---------|-----|
| **Frontend (Live App)** | https://future-fs-02-lac.vercel.app |
| **Backend API** | https://future-fs-02-1-42q7.onrender.com |
| **GitHub Repository** | https://github.com/lokeshmeesala05-commits/FUTURE_FS_02.git |

## Tech Stack
- **Frontend**: React.js (Vite), Tailwind CSS, React Router DOM, Recharts, Lucide React
- **Backend**: Node.js, Express.js, Sequelize ORM, JWT Authentication
- **Database**: MySQL / TiDB Cloud (Serverless)
- **Hosting**: Vercel (Frontend) + Render (Backend) + TiDB Cloud (DB)

## Features
- 🔐 JWT-based Authentication with Role-based access (Admin, Sales User)
- 📋 Comprehensive Lead Management (CRUD, Search, Filtering, Activity Timeline)
- 🏢 Contacts & Accounts Management
- 💼 Sales Deals Pipeline with Stage Tracking
- ✅ Tasks & Follow-up Scheduling (linked to Leads, Contacts, Deals)
- 📊 Reports & Analytics Dashboard with Bar & Pie Charts
- 📥 CSV Export for all reports
- 🔄 Lead-to-Contact Conversion workflow
- 📱 Responsive, modern UI

## Architecture & Database Schema
The backend uses MVC architecture. The database has three main tables:
1. `users` (id, name, email, password, role)
2. `leads` (id, userId, name, email, phone, source, status, notes, follow_up_date)
3. `activities` (id, leadId, action_type, description)

## Local Setup

### 1. Database Setup (MySQL)
Make sure you have MySQL server running locally. Create a new database:
```sql
CREATE DATABASE crm_db;
```

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in your DB credentials:
   ```env
   PORT=5000
   DB_HOST=127.0.0.1
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=crm_db
   JWT_SECRET=supersecretjwtkey12345
   ```
4. Start the server (this will auto-create the tables):
   ```bash
   node server.js
   ```

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```
4. Access the app at `http://localhost:5173`. Make sure the backend is running on `http://localhost:5000`.

## Deployment Guide

### Database (TiDB Serverless — Free)
1. Sign up at https://tidbcloud.com/ and create a free Serverless cluster.
2. Click **Connect** and generate a password.
3. Note the Host, Port (4000), Username, and Password.

### Backend (Render.com — Free)
1. Push your code to GitHub.
2. Go to Render → New Web Service → Connect GitHub repo.
3. Set **Root Directory** to `backend`.
4. Set **Build Command** to `npm install`.
5. Set **Start Command** to `node server.js`.
6. Add these Environment Variables:
   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` (from TiDB)
   - `JWT_SECRET` (any random secure string)
   - `NODE_ENV` = `production`
   - `FRONTEND_URL` = `*`

### Frontend (Vercel — Free)
1. Import your GitHub repository to Vercel.
2. Set the Framework Preset to **Vite**.
3. Set the Root Directory to `frontend`.
4. Add Environment Variable:
   - Key: `VITE_API_URL`
   - Value: `https://your-backend.onrender.com/api`
5. Click **Deploy**.

## 📦 Deployed At
- **Frontend**: https://future-fs-02-lac.vercel.app
- **Backend**: https://future-fs-02-1-42q7.onrender.com
- **Repository**: https://github.com/lokeshmeesala05-commits/FUTURE_FS_02.git
