const axios = require('axios');
const City = require('../models/City');
const MetricsHistory = require('../models/MetricsHistory');

const fetchAndUpdateData = async () => {
    console.log('--- Starting Global Cities Data Fetching Sync ---');

    try {
        // Get all 10 cities from our database
        const cities = await City.find();
        if (cities.length === 0) {
            console.log('No cities found in database. Please run the seed script first.');
            return;
        }

        const apiKey = process.env.OPENWEATHER_API_KEY;
        if (!apiKey) {
            console.error('Missing OPENWEATHER_API_KEY in environment variables.');
            return;
        }

        // Fetch real-time currency rates against INR using Frankfurter (No key needed)
        // We fetch all rates relative to INR in a single call to minimize network requests
        let currencyRates = {};
        try {
            const currencyRes = await axios.get('https://api.frankfurter.app/latest?to=INR');
            currencyRates = currencyRes.data.rates;
            // 1 INR = 1 INR
            currencyRates['INR'] = 1;
        } catch (err) {
            console.error('Failed to fetch currency rates:', err.message);
        }

        // Loop through each city and fetch Weather + AQI
        for (const city of cities) {
            const { lat, lon } = city.coordinates;

            try {
                // Fetch Current Weather
                const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
                const weatherRes = await axios.get(weatherUrl);
                const temperature = weatherRes.data.main.temp;
                const humidity = weatherRes.data.main.humidity;

                // Fetch Air Quality Index (AQI)
                const aqiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
                const aqiRes = await axios.get(aqiUrl);
                // OpenWeatherMap AQI scales from 1 (Good) to 5 (Very Poor)
                const aqi = aqiRes.data.list[0].main.aqi;

                // Calculate currency exchange rate (How many INR per 1 unit of local currency)
                // Formula: If 1 EUR = X INR, then exchange rate is X.
                // Special inverse handling because Frankfurter returns values relative to base currencies or inputs
                let exchangeRateToINR = 0;
                if (city.currencyCode === 'INR') {
                    exchangeRateToINR = 1;
                } else if (currencyRates[city.currencyCode]) {
                    // Frankfurter returns how many units of target currency equal 1 Euro/Base.
                    // To get '1 Local Currency = X INR':
                    // We can fetch directly or derive it cleanly. Let's make a safe fallback or calculation.
                    const localToEuro = currencyRates[city.currencyCode];
                    const inrToEuro = currencyRates['INR'];
                    // 1 Local = (1 / localToEuro) * inrToEuro
                    exchangeRateToINR = (1 / localToEuro) * inrToEuro;
                } else {
                    // Dynamic fallback call for standalone currencies not covered in bulk (like AED, Cape Town's ZAR, etc.)
                    try {
                        const standaloneCurrencyRes = await axios.get(`https://api.frankfurter.app/latest?from=${city.currencyCode}&to=INR`);
                        exchangeRateToINR = standaloneCurrencyRes.data.rates.INR;
                    } catch (e) {
                        console.error(`Could not resolve exchange rate for ${city.currencyCode}`);
                        exchangeRateToINR = city.latestMetrics?.exchangeRateToINR || 0; // fallback to past value
                    }
                }

                // Mock population if public city population API limits out, 
                // or let's inject a static baseline with a slight variation to mimic real time or keep it stable
                const baselinePopulations = {
                    'Tokyo': 37400000, 'Delhi': 32900000, 'Shanghai': 29200000, 'Sao Paulo': 22600000,
                    'New York': 18900000, 'London': 9600000, 'Paris': 11200000, 'Sydney': 5100000,
                    'Dubai': 3600000, 'Cape Town': 4900000
                };
                const population = baselinePopulations[city.name] || 1000000;

                // Update the City Collection with latest data
                city.latestMetrics = {
                    temperature,
                    humidity,
                    aqi,
                    population,
                    exchangeRateToINR: Number(exchangeRateToINR.toFixed(2)),
                    updatedAt: new Date()
                };
                await city.save();

                // Store data inside historical collection for graphs/trends
                await MetricsHistory.create({
                    cityId: city._id,
                    temperature,
                    aqi,
                    exchangeRateToINR: Number(exchangeRateToINR.toFixed(2)),
                    timestamp: new Date()
                });

                console.log(`Successfully synced data for: ${city.name}`);

            } catch (cityError) {
                console.error(`Error processing data for city ${city.name}:`, cityError.message);
            }
        }
        console.log('--- Global Cities Data Sync Completed ---');
    } catch (error) {
        console.error('Global sync job failed:', error.message);
    }
};

module.exports = { fetchAndUpdateData };