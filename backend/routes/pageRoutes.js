const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const pageController = require('../controllers/pageController');

// Public pages (optional)
router.get('/', pageController.renderHomePage);
router.get('/login', (req, res) => res.render('login'));
router.get('/register', (req, res) => res.render('register'));

// Authenticated pages
router.get('/dashboard', verifyToken, pageController.renderDashboard);
router.get('/upload', verifyToken, pageController.renderUploadPage);
router.get('/my-documents', verifyToken, pageController.renderMyDocuments);
router.get('/view/:id', verifyToken, pageController.renderViewDocument);
router.get('/edit/:id', verifyToken, pageController.renderEditDocument);
router.get('/shared-with-me', verifyToken, pageController.renderSharedWithMe);
router.get('/audit-logs', verifyToken, pageController.renderAuditLogs);

module.exports = router;