const express = require('express');
const router = express.Router();
const { login, getMe, setupAdmin } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/setup-admin', setupAdmin);

module.exports = router;
