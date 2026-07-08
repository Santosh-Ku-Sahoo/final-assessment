const express = require('express');
const router = express.Router();
const { getPassDetails, verifyPass, checkIn, checkOut } = require('../controllers/passController');
const { protect, authorizeRoles } = require('../middleware/auth');

router.get('/:passCode', getPassDetails);

router.use(protect);
router.use(authorizeRoles('security', 'admin'));

router.get('/verify/:passCode', verifyPass);
router.post('/check-in/:passCode', checkIn);
router.post('/check-out/:passCode', checkOut);

module.exports = router;
