const { Account, User, Contact } = require('../models');

const getAccounts = async (req, res) => {
  try {
    const query = {};
    if (req.user.role === 'Sales User') {
      query.userId = req.user.id;
    }

    const accounts = await Account.findAll({
      where: query,
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name'] },
        { model: Contact, as: 'contacts' }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAccountById = async (req, res) => {
  try {
    const account = await Account.findByPk(req.params.id, {
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name'] },
        { model: Contact, as: 'contacts' }
      ]
    });

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    if (req.user.role === 'Sales User' && account.userId !== req.user.id) {
       return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(account);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createAccount = async (req, res) => {
  try {
    const { name, website, industry, description } = req.body;
    const account = await Account.create({
      name, website, industry, description, userId: req.user.id
    });
    res.status(201).json(account);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getAccounts, getAccountById, createAccount };
