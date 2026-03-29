const { Contact, Account, User } = require('../models');

const getContacts = async (req, res) => {
  try {
    const query = {};
    if (req.user.role === 'Sales User') {
      query.userId = req.user.id;
    }

    const contacts = await Contact.findAll({
      where: query,
      include: [
        { model: Account, as: 'account', attributes: ['id', 'name'] },
        { model: User, as: 'owner', attributes: ['id', 'name'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findByPk(req.params.id, {
      include: [
        { model: Account, as: 'account', attributes: ['id', 'name'] },
        { model: User, as: 'owner', attributes: ['id', 'name'] }
      ]
    });

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    if (req.user.role === 'Sales User' && contact.userId !== req.user.id) {
       return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createContact = async (req, res) => {
  try {
    const { name, email, phone, title, accountId } = req.body;
    const contact = await Contact.create({
      name, email, phone, title, accountId, userId: req.user.id
    });
    res.status(201).json(contact);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getContacts, getContactById, createContact };
