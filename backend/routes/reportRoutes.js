const express = require('express');
const router = express.Router();
const { getLeadConversionReport, getRevenueReport, getTaskPerformanceReport } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.get('/leads', protect, getLeadConversionReport);
router.get('/revenue', protect, getRevenueReport);
router.get('/tasks', protect, getTaskPerformanceReport);

module.exports = router;
