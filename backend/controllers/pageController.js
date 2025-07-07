exports.renderDashboard = async(req, res) => {
    res.render('dashboard', { username: req.user.name });
};

exports.renderUploadPage = (req, res) => {
    res.render('upload');
};

exports.renderMyDocuments = async(req, res) => {
    const documents = []; // fetch from DB
    res.render('mydocuments', { documents });
};

exports.renderViewDocument = async(req, res) => {
    const doc = {}; // fetch from DB
    res.render('viewdocument', { doc });
};

exports.renderEditDocument = async(req, res) => {
    const doc = {}; // fetch from DB
    res.render('editdocument', { doc });
};

exports.renderSharedWithMe = async(req, res) => {
    const sharedDocs = []; // fetch from DB
    res.render('sharedwithme', { sharedDocs });
};

exports.renderAuditLogs = async(req, res) => {
    const logs = []; // fetch from DB
    res.render('auditlogs', { logs });
};

exports.renderHomePage = (req, res) => {
    res.render('home');
};