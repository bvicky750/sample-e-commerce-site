require('dotenv').config();
const express = require('express');
const cors = require('cors');
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

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
// backend/server.js
// ... (keep all the existing code at the top)

// --- API Routes ---
app.use('/api/products', require('./routes/products'));
app.use('/api/users', require('./routes/users'));
app.use('/api/orders', require('./routes/orders')); // <--- ADD THIS LINE

// Start the server
// ... (keep the existing app.listen code at the bottom)