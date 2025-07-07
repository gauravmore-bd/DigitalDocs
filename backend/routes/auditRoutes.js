const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const { getAuditLogs, fetchAuditLogs } = require('../controllers/auditController');

router.get('/my-logs', verifyToken, getAuditLogs);
router.get('/logs', verifyToken, fetchAuditLogs);

module.exports = router;