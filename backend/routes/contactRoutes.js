const express = require('express');
const router = express.Router();
const { getContacts, getContactById, createContact } = require('../controllers/contactController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getContacts)
  .post(protect, createContact);

router.route('/:id')
  .get(protect, getContactById);

module.exports = router;
