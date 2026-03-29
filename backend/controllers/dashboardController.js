const { Lead, Deal, Task } = require('../models');
const { Op } = require('sequelize');

const getDashboardStats = async (req, res) => {
  try {
    const query = {};
    if (req.user.role === 'Sales User') {
      query.userId = req.user.id;
    }

    // Lead Stats
    const totalLeads = await Lead.count({ where: query });
    
    const leadsByStatus = await Lead.findAll({
      where: query,
      attributes: ['status', [Lead.sequelize.fn('COUNT', Lead.sequelize.col('id')), 'count']],
      group: ['status']
    });

    const convertedCount = await Lead.count({ where: { ...query, status: 'Converted' } });
    const conversionRate = totalLeads ? ((convertedCount / totalLeads) * 100).toFixed(2) : 0;

    const pendingFollowUps = await Lead.count({
      where: {
        ...query,
        follow_up_date: {
          [Op.lte]: new Date(),
          [Op.not]: null
        },
        status: {
          [Op.notIn]: ['Converted', 'Lost']
        }
      }
    });

    // Deal Stats
    const totalPipelineValue = await Deal.sum('value', {
      where: {
        ...query,
        stage: { [Op.notIn]: ['Closed Won', 'Closed Lost'] }
      }
    }) || 0;

    const dealsByStage = await Deal.findAll({
      where: query,
      attributes: [
        'stage', 
        [Deal.sequelize.fn('COUNT', Deal.sequelize.col('id')), 'count'],
        [Deal.sequelize.fn('SUM', Deal.sequelize.col('value')), 'totalValue']
      ],
      group: ['stage']
    });

    // Task Stats
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    const pendingTasksCount = await Task.count({
      where: {
        ...query,
        status: { [Op.in]: ['Pending', 'In Progress'] },
        dueDate: { [Op.lte]: today }
      }
    });

    const upcomingTasks = await Task.findAll({
      where: {
        ...query,
        status: { [Op.in]: ['Pending', 'In Progress'] }
      },
      limit: 5,
      order: [['dueDate', 'ASC']]
    });

    res.json({
      totalLeads,
      conversionRate,
      pendingFollowUps,
      leadsByStatus,
      totalPipelineValue,
      dealsByStage,
      pendingTasksCount,
      upcomingTasks
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getDashboardStats };
