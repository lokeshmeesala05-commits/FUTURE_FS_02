const express = require('express');
const cors = require('cors');
require('dotenv').config();
// Forced redeploy to verify fix

const sequelize = require('./config/database');

const authRoutes = require('./routes/authRoutes');
const leadRoutes = require('./routes/leadRoutes');
const activityRoutes = require('./routes/activityRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const accountRoutes = require('./routes/accountRoutes');
const contactRoutes = require('./routes/contactRoutes');
const dealRoutes = require('./routes/dealRoutes');
const taskRoutes = require('./routes/taskRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || '*', // Allow frontend URL or all if not set
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/reports', reportRoutes);

// Basic health check with deployment version
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'API is running',
    version: '1.2.0',
    deployedAt: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;

// Safe migration: add new columns if they don't exist (works on TiDB & MySQL)
const runMigrations = async () => {
  const qi = sequelize.getQueryInterface();
  const tableDesc = await qi.describeTable('users').catch(() => null);
  if (!tableDesc) {
    console.log('Users table not found, skipping migration.');
    return;
  }
  if (!tableDesc.isVerified) {
    await sequelize.query("ALTER TABLE users ADD COLUMN isVerified TINYINT(1) NOT NULL DEFAULT 0");
    console.log('Migration: added isVerified column');
  }
  if (!tableDesc.otp) {
    await sequelize.query("ALTER TABLE users ADD COLUMN otp VARCHAR(10) DEFAULT NULL");
    console.log('Migration: added otp column');
  }
  if (!tableDesc.otpExpires) {
    await sequelize.query("ALTER TABLE users ADD COLUMN otpExpires DATETIME DEFAULT NULL");
    console.log('Migration: added otpExpires column');
  }
};

// Connect to database and start server
sequelize.authenticate()
  .then(() => {
    console.log('Database connected successfully.');
    return sequelize.sync({ alter: false });
  })
  .then(async () => {
    console.log('Database synced successfully.');
    await runMigrations();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });
