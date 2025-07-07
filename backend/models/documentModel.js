const { ResultWithContextImpl } = require('express-validator/lib/chain');
const pool = require('../config/db');

const saveDocument = async({ user_id, file_name, file_path, permission }) => {
    const [result] = await pool.query(
        'INSERT INTO documents (user_id, file_name, file_path, permission) VALUES (?, ?, ?, ?)', [user_id, file_name, file_path, permission]
    );
    return result.insertId;
};

const getDocumentsByUserId = async(userId) => {
    const [rows] = await pool.query('SELECT id, file_name, file_path, permission FROM documents WHERE user_id = ?', [userId]);
    return rows;
};
const shareDocumentWithUser = async({ document_id, shared_with_aadhaar, permission }) => {
    const [result] = await pool.query(
        `INSERT INTO shared_documents (document_id, shared_with_aadhaar, permission)
         VALUES (?, ?, ?)`, [document_id, shared_with_aadhaar, permission]
    );
    return result.insertId;
};

const getDocumentsSharedWithUser = async(aadhaar) => {
    const [rows] = await pool.query(
        `SELECT d.id, d.file_name, d.file_path, sd.permission, sd.shared_at
         FROM shared_documents sd
         JOIN documents d ON sd.document_id = d.id
         WHERE sd.shared_with_aadhaar = ?`, [aadhaar]
    );
    return rows;
};

const getDocumentById = async(id) => {
    const [rows] = await pool.query('SELECT * FROM documents WHERE id = ?', [id]);
    return rows[0];
};

const updateDocumentInDB = async({ id, file_name, file_path, permission }) => {
    await pool.query(
        `UPDATE documents SET file_name = ?, file_path = ?, permission = ? WHERE id = ?`, [file_name, file_path, permission, id]
    );
};

const deleteDocumentById = async(documentId, userId) => {
    const [result] = await pool.query(
        'DELETE FROM documents WHERE id = ? AND user_id = ?', [documentId, userId]
    );
    return result.affectedRows; // returns 1 if deleted, 0 if not found
};

const getSharedDocumentByIdAndAadhaar = async(document_id, aadhaar) => {
    const [rows] = await pool.query(
        `SELECT d.file_path, d.file_name, sd.permission
         FROM shared_documents sd
         JOIN documents d ON sd.document_id = d.id
         WHERE sd.document_id = ? AND sd.shared_with_aadhaar = ?`, [document_id, aadhaar]
    );

    // console.log("Fetched Rows:", rows); // Debugging line

    if (!rows || rows.length === 0) {
        return null;
    }
    return rows[0];
};


module.exports = {
    saveDocument,
    getDocumentsByUserId,
    shareDocumentWithUser,
    getDocumentsSharedWithUser,
    getDocumentById,
    updateDocumentInDB,
    deleteDocumentById,
    getSharedDocumentByIdAndAadhaar
};