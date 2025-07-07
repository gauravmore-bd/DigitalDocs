const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const upload = require('../utils/multer'); // <-- import multer upload

const {
    uploadDocument,
    deleteDocument,
    updateDocument,
    getUserDocuments,
    shareDocument,
    getSharedDocuments,
    downloadDocument,
    viewDocument
} = require('../controllers/documentController');

// Protect all routes with verifyToken middleware
router.post('/upload', verifyToken, upload.single('file'), uploadDocument); // <-- add multer middleware here
router.get('/my-documents', verifyToken, getUserDocuments);
router.get('/shared-with-me', verifyToken, getSharedDocuments);
router.post('/share/:id', verifyToken, shareDocument);
// router.put('/update/:id', verifyToken, updateDocument);
router.put('/update/:id', verifyToken, upload.single('file'), updateDocument);
router.delete('/delete/:id', verifyToken, deleteDocument);
router.get('/download/:id', verifyToken, downloadDocument);
router.get('/view/:id', verifyToken, viewDocument);

// router.post('/share/:id', verifyToken, shareDocument);

module.exports = router;