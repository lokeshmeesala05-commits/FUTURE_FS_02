const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Lead = sequelize.define('Lead', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
    }
  },
  phone: {
    type: DataTypes.STRING,
  },
  source: {
    type: DataTypes.STRING,
  },
  status: {
    type: DataTypes.ENUM('New', 'Contacted', 'Interested', 'Converted', 'Lost'),
    defaultValue: 'New',
  },
  notes: {
    type: DataTypes.TEXT,
  },
  follow_up_date: {
    type: DataTypes.DATE,
  }
}, {
  timestamps: true,
  tableName: 'leads'
});

module.exports = Lead;
