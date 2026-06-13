require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const City = require('./models/City');

const citiesData = [
    { name: 'Tokyo', country: 'Japan', coordinates: { lat: 35.6762, lon: 139.6503 }, currencyCode: 'JPY' },
    { name: 'Delhi', country: 'India', coordinates: { lat: 28.7041, lon: 77.1025 }, currencyCode: 'INR' },
    { name: 'Shanghai', country: 'China', coordinates: { lat: 31.2304, lon: 121.4737 }, currencyCode: 'CNY' },
    { name: 'Sao Paulo', country: 'Brazil', coordinates: { lat: -23.5505, lon: -46.6333 }, currencyCode: 'BRL' },
    { name: 'New York', country: 'USA', coordinates: { lat: 40.7128, lon: -74.0060 }, currencyCode: 'USD' },
    { name: 'London', country: 'UK', coordinates: { lat: 51.5074, lon: -0.1278 }, currencyCode: 'GBP' },
    { name: 'Paris', country: 'France', coordinates: { lat: 48.8566, lon: 2.3522 }, currencyCode: 'EUR' },
    { name: 'Sydney', country: 'Australia', coordinates: { lat: -33.8688, lon: 151.2093 }, currencyCode: 'AUD' },
    { name: 'Dubai', country: 'UAE', coordinates: { lat: 25.2048, lon: 55.2708 }, currencyCode: 'AED' },
    { name: 'Cape Town', country: 'South Africa', coordinates: { lat: -33.9249, lon: 18.4241 }, currencyCode: 'ZAR' }
];

const seedDatabase = async () => {
    try {
        await connectDB();

        // Clear existing data to prevent duplicates if run multiple times
        await City.deleteMany();
        console.log('Existing cities cleared.');

        // Insert new data
        await City.insertMany(citiesData);
        console.log('10 Global Cities seeded successfully!');

        process.exit();
    } catch (error) {
        console.error(`Error with seeding data: ${error.message}`);
        process.exit(1);
    }
};

seedDatabase();