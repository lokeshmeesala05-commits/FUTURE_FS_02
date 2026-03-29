const { Lead, Activity, User, Account, Contact, sequelize } = require('../models');
const { Op } = require('sequelize');

const getLeads = async (req, res) => {
  try {
    const { status, source, search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const query = {};
    if (status) query.status = status;
    if (source) query.source = source;
    
    if (search) {
      query[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ];
    }

    if (req.user.role === 'Sales User') {
      query.userId = req.user.id;
    }

    const { count, rows } = await Lead.findAndCountAll({
      where: query,
      include: [{ model: User, as: 'assignedTo', attributes: ['id', 'name'] }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      leads: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalLeads: count
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id, {
      include: [
        { model: User, as: 'assignedTo', attributes: ['id', 'name'] },
        { model: Activity, as: 'activities', order: [['createdAt', 'DESC']] }
      ]
    });

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    if (req.user.role === 'Sales User' && lead.userId !== req.user.id) {
       return res.status(403).json({ message: 'Not authorized to view this lead' });
    }

    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createLead = async (req, res) => {
  try {
    const { name, email, phone, source, status, notes, follow_up_date, userId } = req.body;
    
    let assignedUserId = userId;
    if (req.user.role === 'Sales User') {
      assignedUserId = req.user.id;
    }

    const newLead = await Lead.create({
      name, email, phone, source, status, notes, follow_up_date, userId: assignedUserId || req.user.id
    });

    await Activity.create({
      leadId: newLead.id,
      action_type: 'Lead Created',
      description: `Lead created manually.`
    });

    res.status(201).json(newLead);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    if (req.user.role === 'Sales User' && lead.userId !== req.user.id) {
       return res.status(403).json({ message: 'Not authorized to update this lead' });
    }
    
    const previousStatus = lead.status;
    const { status } = req.body;

    await lead.update(req.body);

    if (status && status !== previousStatus) {
       await Activity.create({
         leadId: lead.id,
         action_type: 'Status Changed',
         description: `Status changed from ${previousStatus} to ${status}`
       });
    }

    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteLead = async (req, res) => {
   try {
    const lead = await Lead.findByPk(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    if (req.user.role === 'Sales User' && lead.userId !== req.user.id) {
       return res.status(403).json({ message: 'Not authorized to delete this lead' });
    }

    await lead.destroy();
    res.json({ message: 'Lead removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

const convertLead = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const lead = await Lead.findByPk(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    if (req.user.role === 'Sales User' && lead.userId !== req.user.id) {
       return res.status(403).json({ message: 'Not authorized to convert this lead' });
    }

    if (lead.status === 'Converted') {
      return res.status(400).json({ message: 'Lead is already converted' });
    }

    const { companyName, website, title } = req.body;

    let account = null;
    if (companyName) {
      account = await Account.create({
        name: companyName,
        website: website || '',
        userId: lead.userId
      }, { transaction: t });
    }

    const contact = await Contact.create({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      title: title || '',
      accountId: account ? account.id : null,
      userId: lead.userId
    }, { transaction: t });

    await lead.update({ status: 'Converted' }, { transaction: t });

    await Activity.create({
      leadId: lead.id,
      action_type: 'Lead Converted',
      description: `Lead converted to Contact: ${contact.name}${account ? ` and Account: ${account.name}` : ''}`
    }, { transaction: t });

    await t.commit();
    res.json({ message: 'Lead successfully converted', contact, account });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getLeads, getLeadById, createLead, updateLead, deleteLead, convertLead };
