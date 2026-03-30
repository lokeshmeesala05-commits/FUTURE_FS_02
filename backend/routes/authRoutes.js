const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, verifyEmail, resendOTP } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-email', verifyEmail);
router.post('/resend-otp', resendOTP);
router.get('/me', protect, getMe);

module.exports = router;
