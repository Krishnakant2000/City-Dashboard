const mongoose = require('mongoose');

const CitySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    country: { type: String, required: true },
    coordinates: {
        lat: { type: Number, required: true },
        lon: { type: Number, required: true }
    },
    currencyCode: { type: String, required: true },
    latestMetrics: {
        temperature: { type: Number },
        humidity: { type: Number },
        aqi: { type: Number },
        population: { type: Number },
        exchangeRateToINR: { type: Number },
        updatedAt: { type: Date, default: Date.now }
    }
});

module.exports = mongoose.model('City', CitySchema);