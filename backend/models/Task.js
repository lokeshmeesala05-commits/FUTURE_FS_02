const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  dueDate: {
    type: DataTypes.DATE,
  },
  priority: {
    type: DataTypes.ENUM('Low', 'Medium', 'High'),
    defaultValue: 'Medium',
  },
  status: {
    type: DataTypes.ENUM('Pending', 'In Progress', 'Completed', 'Cancelled'),
    defaultValue: 'Pending',
  },
  relatedType: {
    type: DataTypes.ENUM('Lead', 'Contact', 'Deal', 'None'),
    defaultValue: 'None',
  },
  relatedId: {
    type: DataTypes.INTEGER,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
}, {
  timestamps: true,
  tableName: 'tasks'
});

module.exports = Task;
