require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const initCronJobs = require('./services/cronJobs');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB().then(() => {
    // Initialize cron jobs ONLY after database connects successfully
    initCronJobs();
});

// Health Check Route
app.get('/', (req, res) => {
    res.json({ message: 'City Dashboard API is running!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});