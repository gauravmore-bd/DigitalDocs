const fs = require('fs');
const path = require('path');
const { logAction } = require('../models/auditLogModel');
const { saveDocument, getDocumentsByUserId, shareDocumentWithUser, getDocumentsSharedWithUser, updateDocumentInDB, getDocumentById, deleteDocumentById, getSharedDocumentByIdAndAadhaar } = require('../models/documentModel');

const uploadDocument = async(req, res) => {
    try {
        const { permission } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const docId = await saveDocument({
            user_id: req.user.id,
            file_name: file.originalname,
            // Save the file's public URL path
            file_path: `uploads/${file.filename}`,
            permission
        });

        res.status(201).json({
            message: 'File uploaded successfully',
            document_id: docId,
            file_url: `/uploads/${file.filename}`
        });
        await logAction({
            user_id: req.params.id,
            document_id: docId,
            action_type: 'upload'
        })
    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ message: 'Upload failed' });
    }
};

const getUserDocuments = async(req, res) => {
    try {
        const userId = req.user.id;
        const documents = await getDocumentsByUserId(userId);

        res.status(200).json({
            message: 'Documents fetched successfully',
            documents
        });
    } catch (err) {
        console.error('Fetch documents error:', err);
        res.status(500).json({ message: 'Failed to fetch documents' });
    }
};

const shareDocument = async(req, res) => {
    try {
        const document_id = req.params.id;
        const { shared_with_aadhaar, permission } = req.body;

        if (!shared_with_aadhaar || !permission) {
            return res.status(400).json({ message: 'Aadhaar and permission are required' });
        }

        // Validate permission strictly
        const validPermissions = ['view', 'download'];
        if (!validPermissions.includes(permission)) {
            return res.status(400).json({ message: 'Invalid permission. Must be "view" or "download".' });
        }

        await shareDocumentWithUser({
            document_id,
            shared_with_aadhaar,
            permission
        });

        await logAction({
            user_id: req.user.id,
            document_id,
            action_type: 'share'
        });

        res.status(200).json({ message: 'Document shared successfully!' });
    } catch (error) {
        console.error('Share Error:', error);
        res.status(500).json({ message: 'Failed to share document' });
    }
};


const getSharedDocuments = async(req, res) => {
    try {
        const userAadhaar = req.user.aadhaar;

        const sharedDocs = await getDocumentsSharedWithUser(userAadhaar);
        res.status(200).json(sharedDocs);
    } catch (error) {
        console.error('Shared Docs Error:', error);
        res.status(500).json({ message: 'Failed to fetch shared documents' });
    }
};

const updateDocument = async(req, res) => {
    try {
        const documentId = req.params.id;
        const { permission } = req.body;
        const file = req.file;

        // Fetch existing document to get old file path
        const existingDoc = await getDocumentById(documentId);
        if (!existingDoc) {
            return res.status(404).json({ message: 'Document not found' });
        }

        let newFilePath = existingDoc.file_path;
        let newFileName = existingDoc.file_name;

        // If new file uploaded, replace it
        if (file) {
            // Delete the old file
            const oldFilePath = path.join(__dirname, '..', existingDoc.file_path);
            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
            }
            // Set new file details
            newFilePath = `/uploads/${file.filename}`;
            newFileName = file.originalname;
        }

        // Update in DB
        await updateDocumentInDB({
            id: documentId,
            file_name: newFileName,
            file_path: newFilePath,
            permission
        });
        await logAction({
            user_id: req.user.id,
            document_id,
            action: 'update'
        });
        res.status(200).json({ message: 'Document updated successfully' });

    } catch (err) {
        console.error('Update error:', err);
        res.status(500).json({ message: 'Update failed' });
    }
};

const deleteDocument = async(req, res) => {
    try {
        const documentId = req.params.id;

        // Get document details from DB
        const doc = await getDocumentById(documentId);

        if (!doc) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // Build correct absolute path of file
        const filePath = path.join(__dirname, '..', '..', doc.file_path);

        // Check if file exists before deleting
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath); // Delete file
        } else {
            console.warn('File not found on disk:', filePath);
        }

        // Delete document record from DB
        await deleteDocumentById(documentId);

        res.status(200).json({ message: 'Document deleted successfully' });

    } catch (error) {
        console.error('File delete error:', error);
        res.status(500).json({ message: 'Failed to delete document' });
    }
    await logAction({
        user_id: req.user.id,
        document_id,
        action_type: 'delete'
    });

};

const downloadDocument = async(req, res) => {
    try {
        const document_id = req.params.id;
        const userAadhaar = req.user.aadhaar;
        // console.log(userAadhaar);
        // console.log(document_id);

        // Check if this doc is shared with user and permission is 'download'
        const doc = await getSharedDocumentByIdAndAadhaar(document_id, userAadhaar);
        // console.log("Fetched Shared Doc:", doc);

        if (!doc) {
            return res.status(403).json({ message: 'Access denied or document not shared with you.' });
        }

        if (doc.permission !== 'download') {
            return res.status(403).json({ message: 'You do not have download permission.' });
        }

        await logAction({
            user_id: req.user.id,
            document_id,
            action_type: 'download'
        });

        // Send the file
        const filePath = path.join(__dirname, '..', '..', 'backend', doc.file_path);
        res.download(filePath, doc.file_name); // file download
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ message: 'Failed to download document.' });
    }
};

const viewDocument = async(req, res) => {
    try {
        const document_id = req.params.id;
        const userAadhaar = req.user.aadhaar;
        const doc = await getSharedDocumentByIdAndAadhaar(document_id, userAadhaar);
        if (!doc) {
            return res.status(403).json({ message: 'Access denied or document not shared with you.' });
        }
        if (doc.permission !== 'view' && doc.permission !== "download") {
            return res.status(403).json({ message: 'You do not have view permission.' });
        }
        await logAction({
            user_id: req.user.id,
            document_id,
            action_type: 'view'
        });
        const filePath = path.join(__dirname, "..", "..", "backend", doc.file_path);
        res.sendFile(filePath);

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to view the document" });
    }
}



module.exports = {
    uploadDocument,
    getUserDocuments,
    shareDocument,
    getSharedDocuments,
    updateDocument,
    deleteDocument,
    downloadDocument,
    viewDocument
};