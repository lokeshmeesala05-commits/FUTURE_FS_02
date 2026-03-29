const sequelize = require('../config/database');
const User = require('./User');
const Lead = require('./Lead');
const Activity = require('./Activity');
const Account = require('./Account');
const Contact = require('./Contact');
const Deal = require('./Deal');
const Task = require('./Task');

// User Associations
User.hasMany(Lead, { foreignKey: 'userId', as: 'leads' });
Lead.belongsTo(User, { foreignKey: 'userId', as: 'assignedTo' });

User.hasMany(Account, { foreignKey: 'userId', as: 'accounts' });
Account.belongsTo(User, { foreignKey: 'userId', as: 'owner' });

User.hasMany(Contact, { foreignKey: 'userId', as: 'contacts' });
Contact.belongsTo(User, { foreignKey: 'userId', as: 'owner' });

User.hasMany(Deal, { foreignKey: 'userId', as: 'deals' });
Deal.belongsTo(User, { foreignKey: 'userId', as: 'assignedTo' });

User.hasMany(Task, { foreignKey: 'userId', as: 'tasks' });
Task.belongsTo(User, { foreignKey: 'userId', as: 'assignedTo' });

// Lead Associations
Lead.hasMany(Activity, { foreignKey: 'leadId', as: 'activities', onDelete: 'CASCADE' });
Activity.belongsTo(Lead, { foreignKey: 'leadId', as: 'lead' });

Lead.hasMany(Task, { foreignKey: 'relatedId', as: 'tasks', constraints: false, scope: { relatedType: 'Lead' } });

// Account & Contact Associations
Account.hasMany(Contact, { foreignKey: 'accountId', as: 'contacts', onDelete: 'SET NULL' });
Contact.belongsTo(Account, { foreignKey: 'accountId', as: 'account' });

// Deal Associations
Account.hasMany(Deal, { foreignKey: 'accountId', as: 'deals', onDelete: 'SET NULL' });
Deal.belongsTo(Account, { foreignKey: 'accountId', as: 'account' });

Contact.hasMany(Deal, { foreignKey: 'contactId', as: 'deals', onDelete: 'SET NULL' });
Deal.belongsTo(Contact, { foreignKey: 'contactId', as: 'contact' });

// Task polymorphic relations (manual lookup usually, but defining basic associations)
Contact.hasMany(Task, { foreignKey: 'relatedId', as: 'tasks', constraints: false, scope: { relatedType: 'Contact' } });
Deal.hasMany(Task, { foreignKey: 'relatedId', as: 'tasks', constraints: false, scope: { relatedType: 'Deal' } });

module.exports = {
  sequelize,
  User,
  Lead,
  Activity,
  Account,
  Contact,
  Deal,
  Task
};
