require('dotenv').config({ path: '../.env' }); // Adjust path if .env is at backend/.env just use require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Explicitly configure dotenv since you are running from the backend folder
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Health Check Route
app.get('/', (req, res) => {
    res.json({ message: 'City Dashboard API is running!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});