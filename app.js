const express = require('express');
const app = express();
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

dotenv.config();
app.use(cors());
app.use(express.json());

// Serve uploaded files from backend/uploads via /uploads route
app.use('/uploads', express.static(path.join(__dirname, 'backend/uploads')));

const PORT = process.env.PORT || 5000;

// Routes
const authRoutes = require('./backend/routes/authRoutes');
const documentRoutes = require('./backend/routes/documentRoutes');
const auditRoutes = require('./backend/routes/auditRoutes');

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/audit', auditRoutes);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});