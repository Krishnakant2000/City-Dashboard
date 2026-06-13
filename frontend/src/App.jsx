import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';
import { RefreshCw, Thermometer, Wind, Users, DollarSign, Clock } from 'lucide-react';

// Fix for default marker icon issues in Leaflet with bundlers like Vite
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

function App() {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Function to fetch latest metrics
  const fetchCityData = async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/cities`);
      setCities(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to connect to backend server. Make sure it is running.');
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  // Fetch data on initial mount and set up 30-second polling
  useEffect(() => {
    fetchCityData(true);

    const interval = setInterval(() => {
      console.log('Polling fresh data...');
      fetchCityData(false); // background update without reloading spinner
    }, 3000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Fetch trend history when a city marker is clicked
  const handleMarkerClick = async (city) => {
    setSelectedCity(city);
    setLoadingHistory(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/cities/${city._id}/history`);
      setHistoryData(response.data);
    } catch (err) {
      console.error('Error fetching city history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Helper to determine AQI rating color
  const getAQIColor = (aqi) => {
    switch (aqi) {
      case 1: return 'bg-green-500 text-white'; // Good
      case 2: return 'bg-yellow-400 text-black'; // Fair
      case 3: return 'bg-orange-400 text-white'; // Moderate
      case 4: return 'bg-red-500 text-white'; // Poor
      case 5: return 'bg-purple-600 text-white'; // Very Poor
      default: return 'bg-gray-400 text-white';
    }
  };

  const getAQILabel = (aqi) => {
    const labels = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
    return labels[aqi - 1] || 'Unknown';
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <RefreshCw className="mx-auto h-12 w-12 animate-spin text-blue-600" />
          <p className="mt-4 text-gray-600 font-medium">Loading Real-Time Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen flex-col bg-gray-100 font-sans md:flex-row overflow-hidden">

      {/* LEFT: Main Interactive Map View */}
      <div className="relative h-2/3 w-full md:h-full md:w-2/3">
        {error && (
          <div className="absolute top-4 left-4 right-4 z-[1000] rounded-lg bg-red-100 p-4 text-sm text-red-700 shadow-md">
            {error}
          </div>
        )}

        <MapContainer
          center={[20, 0]}
          zoom={2}
          className="h-full w-full"
          style={{ height: "100%", width: "100%", minHeight: "400px" }}
          minZoom={2}
          maxBounds={[[-90, -180], [90, 180]]}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {cities.map((city) => (
            <Marker
              key={city._id}
              position={[city.coordinates.lat, city.coordinates.lon]}
              eventHandlers={{
                click: () => handleMarkerClick(city),
              }}
            >
              <Popup>
                <div className="font-semibold">{city.name}</div>
                <div className="text-xs text-gray-500">{city.latestMetrics?.temperature}°C | AQI: {city.latestMetrics?.aqi}</div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* RIGHT: Detailed Metrics Side-Panel/Modal */}
      <div className="h-1/3 w-full border-t border-gray-200 bg-white p-6 shadow-inner md:h-full md:w-1/3 md:border-t-0 md:border-l md:shadow-none overflow-y-auto">
        {selectedCity ? (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{selectedCity.name}</h2>
                <p className="text-sm text-gray-500">{selectedCity.country}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${getAQIColor(selectedCity.latestMetrics?.aqi)}`}>
                AQI: {getAQILabel(selectedCity.latestMetrics?.aqi)}
              </span>
            </div>

            <hr className="my-4 border-gray-100" />

            {/* Metrics Metrics Table View */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center space-x-3 rounded-lg bg-blue-50 p-3">
                <Thermometer className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500">Temperature</p>
                  <p className="text-lg font-bold text-gray-800">{selectedCity.latestMetrics?.temperature}°C</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 rounded-lg bg-green-50 p-3">
                <Wind className="h-6 w-6 text-green-600" />
                <div>
                  <p className="text-xs text-gray-500">Humidity</p>
                  <p className="text-lg font-bold text-gray-800">{selectedCity.latestMetrics?.humidity}%</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 rounded-lg bg-purple-50 p-3">
                <Users className="h-6 w-6 text-purple-600" />
                <div>
                  <p className="text-xs text-gray-500">Population</p>
                  <p className="text-base font-bold text-gray-800">
                    {selectedCity.latestMetrics?.population?.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 rounded-lg bg-amber-50 p-3">
                <DollarSign className="h-6 w-6 text-amber-600" />
                <div>
                  <p className="text-xs text-gray-500">Exchange Rate</p>
                  <p className="text-sm font-bold text-gray-800">
                    1 {selectedCity.currencyCode} = ₹{selectedCity.latestMetrics?.exchangeRateToINR}
                  </p>
                </div>
              </div>
            </div>

            {/* Last Updated Timestamp */}
            <div className="flex items-center space-x-2 text-xs text-gray-400 mb-6">
              <Clock className="h-4 w-4" />
              <span>Last updated: {new Date(selectedCity.latestMetrics?.updatedAt).toLocaleTimeString()}</span>
            </div>

            {/* Simple Inline Historical Logs */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Historical Logs (Past 15 days trend updates)</h3>
              {loadingHistory ? (
                <p className="text-xs text-gray-400 animate-pulse">Fetching history records...</p>
              ) : (
                <div className="max-h-40 overflow-y-auto border border-gray-100 rounded-lg text-xs divide-y divide-gray-50">
                  {historyData.slice().reverse().map((log, index) => (
                    <div key={index} className="p-2 flex justify-between bg-gray-50/50">
                      <span className="text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      <span className="font-medium text-gray-700">{log.temperature}°C | AQI: {log.aqi}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center text-gray-400">
            <p className="text-lg font-medium">No City Selected</p>
            <p className="text-xs max-w-xs mt-1">Click any interactive marker on the map to explore real-time insights, metrics, and trends.</p>
          </div>
        )}
      </div>

    </div>
  );
}

export default App;