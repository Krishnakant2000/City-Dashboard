const City = require('../models/City');
const MetricsHistory = require('../models/MetricsHistory');

// @desc    Get all 10 cities with their latest metrics
// @route   GET /api/cities
const getCities = async (req, res) => {
    try {
        const cities = await City.find();
        res.json(cities);
    } catch (error) {
        res.status(500).json({ message: 'Server Error parsing cities', error: error.message });
    }
};

// @desc    Get historical metrics for a specific city
// @route   GET /api/cities/:id/history
const getCityHistory = async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch the history and sort by timestamp (oldest to newest) for graphing
        const history = await MetricsHistory.find({ cityId: id }).sort({ timestamp: 1 });

        res.json(history);
    } catch (error) {
        res.status(500).json({ message: 'Server Error parsing history', error: error.message });
    }
};

module.exports = { getCities, getCityHistory };