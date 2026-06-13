require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const initCronJobs = require('./services/cronJobs');
const cityRoutes = require('./routes/cityRoutes');

const app = express();

app.use(cors());
app.use(express.json());

connectDB().then(() => {
    initCronJobs();
});

// API Routes Mounting
app.use('/api/cities', cityRoutes);

// Health Check Route
app.get('/', (req, res) => {
    res.json({ message: 'City Dashboard API is running!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});