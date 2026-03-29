const { Activity, Lead } = require('../models');

const addActivity = async (req, res) => {
  try {
    const { leadId, action_type, description } = req.body;

    const lead = await Lead.findByPk(leadId);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    if (req.user.role === 'Sales User' && lead.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to add activity for this lead' });
    }

    const activity = await Activity.create({
      leadId,
      action_type,
      description
    });

    res.status(201).json(activity);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getLeadActivities = async (req, res) => {
   try {
    const { leadId } = req.params;
    const activities = await Activity.findAll({
       where: { leadId },
       order: [['createdAt', 'DESC']]
    });
    res.json(activities);
   } catch (error) {
     res.status(500).json({ message: 'Server error', error: error.message });
   }
};

module.exports = { addActivity, getLeadActivities };
