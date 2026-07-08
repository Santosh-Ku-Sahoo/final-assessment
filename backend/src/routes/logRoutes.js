const express = require('express');
const router = express.Router();
const { getLogs, exportLogsCSV, getDashboardStats } = require('../controllers/logController');
const { protect, authorizeRoles } = require('../middleware/auth');

router.use(protect);

router.get('/dashboard/stats', getDashboardStats);

router.get('/', authorizeRoles('security', 'admin'), getLogs);
router.get('/export', authorizeRoles('admin'), exportLogsCSV);

module.exports = router;
