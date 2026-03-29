const express = require('express');
const router = express.Router();
const { getLeads, getLeadById, createLead, updateLead, deleteLead, convertLead } = require('../controllers/leadController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getLeads)
  .post(protect, createLead);

router.route('/:id')
  .get(protect, getLeadById)
  .put(protect, updateLead)
  .delete(protect, deleteLead);

router.post('/:id/convert', protect, convertLead);

module.exports = router;
