// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path'); // Import the 'path' module
const connectDB = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// --- API Routes ---
app.use('/api/products', require('./routes/products'));
app.use('/api/users', require('./routes/users'));
app.use('/api/orders', require('./routes/orders'));

// --- Serve Frontend Static Files ---
// This tells Express to serve all the files from the 'frontend' folder
app.use(express.static(path.join(__dirname, '../frontend')));

// For any other request, serve the index.html file
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});