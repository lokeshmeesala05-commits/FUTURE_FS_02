const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Deal = sequelize.define('Deal', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  value: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00,
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'INR',
  },
  stage: {
    type: DataTypes.ENUM(
      'Qualification',
      'Need Analysis',
      'Proposal',
      'Negotiation',
      'Closed Won',
      'Closed Lost'
    ),
    defaultValue: 'Qualification',
  },
  expectedCloseDate: {
    type: DataTypes.DATE,
  },
  accountId: {
    type: DataTypes.INTEGER,
  },
  contactId: {
    type: DataTypes.INTEGER,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
}, {
  timestamps: true,
  tableName: 'deals'
});

module.exports = Deal;
