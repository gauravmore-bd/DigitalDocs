const pool = require('../config/db');

const createUser = async(user) => {
    const { aadhaar, name, email, password_hash } = user;
    const sql = `INSERT INTO users (aadhaar, name, email, password_hash) VALUES (?, ?, ?, ?)`;
    const [result] = await pool.execute(sql, [aadhaar, name, email, password_hash]);
    return result;
};

const getUserByAadhaar = async(aadhaar) => {
    const sql = `SELECT * FROM users WHERE aadhaar = ?`;
    const [rows] = await pool.execute(sql, [aadhaar]);
    return rows[0];
};

module.exports = {
    createUser,
    getUserByAadhaar,
};