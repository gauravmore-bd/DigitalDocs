const express = require('express');
const app = express();
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
// const cookieParser = require('cookie-parser');

dotenv.config();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());

// Set EJS and views path
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'frontend', 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'backend/uploads')));

// Routes
const authRoutes = require('./backend/routes/authRoutes');
const documentRoutes = require('./backend/routes/documentRoutes');
const auditRoutes = require('./backend/routes/auditRoutes');
const pageRoutes = require('./backend/routes/pageRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/audit', auditRoutes);
app.use('/', pageRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});