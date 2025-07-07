const pool = require('../config/db');

const logAction = async({ user_id, document_id, action_type }) => {
    await pool.query(
        `INSERT INTO audit_logs (user_id, document_id, action_type) VALUES (?, ?, ?)`, [user_id, document_id, action_type]
    );
};

const getLogsForUser = async(user_id) => {
    const [rows] = await pool.query(
        `SELECT al.*, d.file_name FROM audit_logs al
         JOIN documents d ON al.document_id = d.id
         WHERE al.user_id = ?
         ORDER BY al.timestamp DESC`, [user_id]
    );
    return rows;
};

// Fetch logs with optional filters
const getLogsByQuery = async(filters) => {
    let baseQuery = `
        SELECT al.id, al.user_id, al.document_id, al.action_type, al.timestamp, al.description,
               u.name AS user_name, d.file_name
        FROM audit_logs al
        JOIN users u ON al.user_id = u.id
        JOIN documents d ON al.document_id = d.id
        WHERE 1 = 1
    `;

    const values = [];

    if (filters.user_id) {
        baseQuery += ' AND al.user_id = ?';
        values.push(filters.user_id);
    }

    if (filters.document_id) {
        baseQuery += ' AND al.document_id = ?';
        values.push(filters.document_id);
    }

    if (filters.action_type) {
        baseQuery += ' AND al.action_type = ?';
        values.push(filters.action_type);
    }

    if (filters.start_date) {
        baseQuery += ' AND al.timestamp >= ?';
        values.push(filters.start_date);
    }

    if (filters.end_date) {
        baseQuery += ' AND al.timestamp <= ?';
        values.push(filters.end_date);
    }

    baseQuery += ' ORDER BY al.timestamp DESC';

    const [rows] = await pool.query(baseQuery, values);
    return rows;
};

module.exports = {
    logAction,
    getLogsForUser,
    getLogsByQuery
};