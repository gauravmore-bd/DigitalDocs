const { getLogsForUser, getLogsByQuery, } = require('../models/auditLogModel');

const getAuditLogs = async(req, res) => {
    try {
        const logs = await getLogsForUser(req.user.id);
        res.status(200).json({ logs });
    } catch (err) {
        console.error('Audit Logs Error:', err);
        res.status(500).json({ message: 'Failed to fetch logs' });
    }
};

const fetchAuditLogs = async(req, res) => {
    try {
        const { user_id, document_id, action_type, start_date, end_date } = req.query;
        const filters = {
            user_id: user_id || null,
            document_id: document_id || null,
            action_type: action_type || null,
            start_date: start_date || null,
            end_date: end_date || null
        };
        const logs = await getLogsByQuery({
            filters
        });
        res.status(200).json({ message: 'Logs fetched successfully', logs });
    } catch (err) {
        console.error('Fetch logs error:', err);
        res.status(500).json({ message: 'Failed to fetch audit logs' });
    }
};
module.exports = {
    getAuditLogs,
    fetchAuditLogs
};