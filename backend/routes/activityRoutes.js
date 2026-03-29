const express = require('express');
const router = express.Router();
const { addActivity, getLeadActivities } = require('../controllers/activityController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, addActivity);
router.get('/lead/:leadId', protect, getLeadActivities);

module.exports = router;
