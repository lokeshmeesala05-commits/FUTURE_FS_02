# CRM Pro - Full-Stack Application

Production-ready Customer Relationship Management web application built with a modern, serverless-first stack.

## 🚀 Live Links

- **Frontend (Vercel)**: [https://future-fs-02-m65wlasml-lokeshmeesala05-commits-projects.vercel.app](https://future-fs-02-m65wlasml-lokeshmeesala05-commits-projects.vercel.app)
- **Backend (Render)**: [https://future-fs-02-1-42q7.onrender.com](https://future-fs-02-1-42q7.onrender.com)
- **Database (Supabase Dashboard)**: [https://supabase.com/dashboard/project/wrlztepbeyutmzhhbiud](https://supabase.com/dashboard/project/wrlztepbeyutmzhhbiud)

## Tech Stack

- **Frontend**: React.js (Vite), Tailwind CSS, React Router DOM, Lucide React
- **Backend**: Node.js, Express.js (Single server.js architecture)
- **Database & Auth**: Supabase (PostgreSQL + GoTrue)
- **Hosting**: Vercel (Frontend) + Render (Backend)

## Features

- 🔐 Real-time Authentication via Supabase
- 📋 Comprehensive Lead Management (Inquiry form + Admin Dashboard)
- 🏢 Contacts, Accounts, and Deals pipeline
- ✅ Task tracking and Reports
- 📱 Responsive, modern UI with "Outfit" typography

## Architecture

The application uses a consolidated Backend-as-a-Proxy architecture:

- **Frontend**: Communicates with the Backend API for most operations.
- **Backend**: Acts as a secure middleware for Supabase, handling complex queries and role-based logic.

## Deployment Guide

### 1. Database & Auth (Supabase)

Your database is already live on Supabase. To deploy a new environment:

1. Create a project at [supabase.com](https://supabase.com).
2. Run your table creation scripts (Leads, Accounts, etc.) in the SQL Editor.
3. Note your `SUPABASE_URL` and `SUPABASE_KEY` (anon key).

### 2. Backend (Render.com)

1. Push your code to a GitHub repository.
2. Go to **Render** → **New Web Service** → Connect your repository.
3. Configuration:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. Add **Environment Variables**:
   - `SUPABASE_URL` (From Supabase)
   - `SUPABASE_KEY` (From Supabase)
   - `PORT` = `5000`
   - `JWT_SECRET` = (Your secure secret)

### 3. Frontend (Vercel)

1. Go to **Vercel** → **New Project** → Import your repository.
2. Configuration:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
3. Add **Environment Variable**:
   - `VITE_API_URL` = `https://your-backend-name.onrender.com/api`
4. Click **Deploy**.

## Local Development

1. Clone the repo.
2. `cd backend && npm install && npm run dev` (Ensure `.env` matches your Supabase credentials).
3. `cd frontend && npm install && npm run dev`.
