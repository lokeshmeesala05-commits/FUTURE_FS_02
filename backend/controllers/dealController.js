const { Deal, Account, Contact, User } = require('../models');

const getDeals = async (req, res) => {
  try {
    const query = {};
    if (req.user.role === 'Sales User') {
      query.userId = req.user.id;
    }

    const deals = await Deal.findAll({
      where: query,
      include: [
        { model: Account, as: 'account', attributes: ['id', 'name'] },
        { model: Contact, as: 'contact', attributes: ['id', 'name'] },
        { model: User, as: 'assignedTo', attributes: ['id', 'name'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(deals);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getDealById = async (req, res) => {
  try {
    const deal = await Deal.findByPk(req.params.id, {
      include: [
        { model: Account, as: 'account', attributes: ['id', 'name'] },
        { model: Contact, as: 'contact', attributes: ['id', 'name'] },
        { model: User, as: 'assignedTo', attributes: ['id', 'name'] }
      ]
    });

    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    if (req.user.role === 'Sales User' && deal.userId !== req.user.id) {
       return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(deal);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createDeal = async (req, res) => {
  try {
    const { name, value, currency, stage, expectedCloseDate, accountId, contactId } = req.body;
    const deal = await Deal.create({
      name, 
      value, 
      currency: currency || 'INR', 
      stage, 
      expectedCloseDate, 
      accountId, 
      contactId, 
      userId: req.user.id
    });
    res.status(201).json(deal);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateDeal = async (req, res) => {
  try {
    const deal = await Deal.findByPk(req.params.id);

    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    if (req.user.role === 'Sales User' && deal.userId !== req.user.id) {
       return res.status(403).json({ message: 'Not authorized' });
    }

    await deal.update(req.body);
    res.json(deal);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteDeal = async (req, res) => {
  try {
    const deal = await Deal.findByPk(req.params.id);

    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    if (req.user.role === 'Sales User' && deal.userId !== req.user.id) {
       return res.status(403).json({ message: 'Not authorized' });
    }

    await deal.destroy();
    res.json({ message: 'Deal deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getDeals, getDealById, createDeal, updateDeal, deleteDeal };
