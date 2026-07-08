const express = require('express');
const router = express.Router();
const {
  getHosts,
  preRegister,
  verifyOTP,
  getAppointments,
  approveAppointment,
  rejectAppointment,
  createHostInvite,
} = require('../controllers/appointmentController');
const { protect, authorizeRoles } = require('../middleware/auth');

router.get('/hosts', getHosts);
router.post('/pre-register', preRegister);
router.post('/verify-otp', verifyOTP);

router.get('/', protect, getAppointments);
router.post('/invite', protect, authorizeRoles('host'), createHostInvite);
router.put('/:id/approve', protect, authorizeRoles('host'), approveAppointment);
router.put('/:id/reject', protect, authorizeRoles('host'), rejectAppointment);

module.exports = router;
