const { Lead, Deal, Task, sequelize } = require('../models');
const { Op } = require('sequelize');

const getLeadConversionReport = async (req, res) => {
  try {
    const query = {};
    if (req.user.role === 'Sales User') {
      query.userId = req.user.id;
    }

    const leadsByStatus = await Lead.findAll({
      where: query,
      attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['status']
    });

    res.json(leadsByStatus);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getRevenueReport = async (req, res) => {
  try {
    const query = {};
    if (req.user.role === 'Sales User') {
      query.userId = req.user.id;
    }

    const dealsByStage = await Deal.findAll({
      where: query,
      attributes: ['stage', [sequelize.fn('SUM', sequelize.col('value')), 'totalValue'], [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['stage']
    });

    res.json(dealsByStage);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getTaskPerformanceReport = async (req, res) => {
  try {
    const query = {};
    if (req.user.role === 'Sales User') {
      query.userId = req.user.id;
    }

    const tasksByStatus = await Task.findAll({
      where: query,
      attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['status']
    });

    res.json(tasksByStatus);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getLeadConversionReport, getRevenueReport, getTaskPerformanceReport };
