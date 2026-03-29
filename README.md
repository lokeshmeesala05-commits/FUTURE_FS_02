# CRM Pro - Full-Stack Application

Production-ready Customer Relationship Management web application built with a modern stack.

## Tech Stack
- **Frontend**: React.js (Vite), Tailwind CSS, React Router DOM, Recharts, Lucide React
- **Backend**: Node.js, Express.js, Sequelize ORM, JWT Authentication
- **Database**: MySQL

## Features
- JWT-based Auth with Role-based access (Admin, Sales User)
- Comprehensive Lead Management (CRUD, Search, Filtering)
- Activity Timeline tracking for each lead
- Analytics Dashboard with status charts and conversion rates
- Responsive, modern UI using Tailwind CSS

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

### Database (PlanetScale / Railway)
1. Provision a MySQL database on Railway or PlanetScale.
2. Obtain the connection URL or host/user/pass credentials.

### Backend (Render / Heroku)
1. Push your code to GitHub.
2. Connect your repo in Render and set the root directory to `backend/`.
3. Set the build command to `npm install`.
4. Set the start command to `node server.js`.
5. Add the environment variables from your DB provider and generate a strong `JWT_SECRET`.

### Frontend (Vercel / Netlify)
1. Import your GitHub repository to Vercel.
2. Set the Framework Preset to **Vite**.
3. Set the Root Directory to `frontend`.
4. Add Environment Variable:
   - Key: `VITE_API_URL`
   - Value: `https://your-backend-app.onrender.com/api` (Replace with your actual Render URL).
5. Deploy. The application will now use the global `api.js` Axios instance to communicate automatically with your production backend.
