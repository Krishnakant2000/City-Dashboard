const mongoose = require('mongoose');

const MetricsHistorySchema = new mongoose.Schema({
    cityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'City',
        required: true,
        index: true
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    },
    temperature: { type: Number, required: true },
    aqi: { type: Number, required: true },
    exchangeRateToINR: { type: Number, required: true }
});

// Automatically delete records older than 15 days to optimize storage
MetricsHistorySchema.index({ timestamp: 1 }, { expireAfterSeconds: 15 * 24 * 60 * 60 });

module.exports = mongoose.model('MetricsHistory', MetricsHistorySchema);