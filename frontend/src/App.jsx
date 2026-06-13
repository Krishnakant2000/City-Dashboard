import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Globe from 'react-globe.gl';
import { RefreshCw, Thermometer, Wind, Users, DollarSign, Clock, X } from 'lucide-react';
import GaugeComponent from 'react-gauge-component';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

function App() {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const globeRef = useRef();

  const fetchCityData = async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/cities`);
      setCities(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to connect to backend server.');
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  useEffect(() => {
    fetchCityData(true);
    const interval = setInterval(() => fetchCityData(false), 30000); // 30s polling
    return () => clearInterval(interval);
  }, []);

  // Make the globe slowly rotate automatically until user interacts
  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.controls().autoRotate = true;
      globeRef.current.controls().autoRotateSpeed = 0.5;
    }
  }, [loading]);

  const handleCityClick = async (city) => {
    setSelectedCity(city);
    setLoadingHistory(true);

    // Stop auto-rotation and center on the clicked city
    if (globeRef.current) {
      globeRef.current.controls().autoRotate = false;
      globeRef.current.pointOfView({ lat: city.coordinates.lat, lng: city.coordinates.lon, altitude: 1.5 }, 1000);
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/cities/${city._id}/history`);
      setHistoryData(response.data);
    } catch (err) {
      console.error('Error fetching city history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const getAQIStyle = (aqi) => {
    switch (aqi) {
      case 1: return { color: 'text-green-600', bg: 'bg-green-100', label: 'Good' };
      case 2: return { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Fair' };
      case 3: return { color: 'text-orange-600', bg: 'bg-orange-100', label: 'Moderate' };
      case 4: return { color: 'text-red-600', bg: 'bg-red-100', label: 'Poor' };
      case 5: return { color: 'text-purple-600', bg: 'bg-purple-100', label: 'Very Poor' };
      default: return { color: 'text-gray-600', bg: 'bg-gray-100', label: 'Unknown' };
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0a0a0a]">
        <RefreshCw className="h-10 w-10 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#000011]">
      {/* 3D Globe Background */}
      <div className="absolute inset-0 cursor-grab active:cursor-grabbing">
        <Globe
          ref={globeRef}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
          labelsData={cities}
          labelLat={d => d.coordinates.lat}
          labelLng={d => d.coordinates.lon}
          labelText={d => d.name}
          labelSize={1.5}
          labelDotRadius={0.7}
          labelColor={() => 'rgba(0, 255, 255, 0.9)'}
          labelResolution={2}
          onLabelClick={handleCityClick}
          animateIn={true}
        />
      </div>

      {/* Floating Header */}
      <div className="absolute left-6 top-6 z-10 pointer-events-none">
        <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-lg">
          Global City <span className="text-cyan-400">Insights</span>
        </h1>
        <p className="text-sm text-cyan-200/80">Real-Time Data Dashboard</p>
      </div>

      {/* Error Toast */}
      {error && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-full bg-red-500/90 px-6 py-2 text-sm text-white shadow-xl backdrop-blur-md">
          {error}
        </div>
      )}

      {/* Glassmorphism Details Panel */}
      <div className={`absolute bottom-0 right-0 top-0 z-20 w-full transform transition-transform duration-500 ease-in-out md:w-[420px] ${selectedCity ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full w-full bg-white/10 p-6 backdrop-blur-xl border-l border-white/20 shadow-2xl flex flex-col">

          {selectedCity && (
            <>
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-4xl font-extrabold text-white drop-shadow-md">{selectedCity.name}</h2>
                  <p className="text-lg text-cyan-200 font-medium">{selectedCity.country}</p>
                </div>
                <button
                  onClick={() => setSelectedCity(null)}
                  className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Main Metrics Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="rounded-2xl bg-white/10 p-4 border border-white/10 hover:bg-white/20 transition-all flex flex-col items-center justify-center">
                  <div className="flex items-center space-x-2 text-cyan-300 w-full mb-2">
                    <Thermometer className="h-5 w-5" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Temp Gauge</span>
                  </div>
                  <div className="w-full mt-2">
                    <GaugeComponent
                      value={selectedCity.latestMetrics?.temperature}
                      minValue={-20}
                      maxValue={50}
                      type="semicircle"
                      arc={{
                        nbSubArcs: 20,
                        colorArray: ['#00f5d4', '#fee440', '#f15bb5'],
                        width: 0.2,
                        padding: 0.02
                      }}
                      labels={{
                        valueLabel: {
                          style: { fontSize: '35px', fill: '#ffffff', textShadow: 'none' },
                          formatTextValue: value => `${value}°C`
                        },
                        tickLabels: { hideMinMax: true }
                      }}
                    />
                  </div>
                </div>

                <div className="rounded-2xl bg-white/10 p-4 border border-white/10 hover:bg-white/20 transition-all">
                  <div className="flex items-center space-x-2 text-cyan-300 mb-1">
                    <Wind className="h-5 w-5" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Humidity</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{selectedCity.latestMetrics?.humidity}%</p>
                </div>

                <div className={`col-span-2 rounded-2xl p-4 border border-white/10 flex items-center justify-between ${getAQIStyle(selectedCity.latestMetrics?.aqi).bg} bg-opacity-20`}>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-black/70">Air Quality Index</span>
                    <p className={`text-xl font-bold ${getAQIStyle(selectedCity.latestMetrics?.aqi).color}`}>
                      {getAQIStyle(selectedCity.latestMetrics?.aqi).label} (Level {selectedCity.latestMetrics?.aqi})
                    </p>
                  </div>
                </div>

                <div className="col-span-2 rounded-2xl bg-white/10 p-4 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-8 w-8 text-green-400" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-cyan-300">Currency Exchange</p>
                      <p className="text-lg font-bold text-white">1 {selectedCity.currencyCode} = ₹{selectedCity.latestMetrics?.exchangeRateToINR}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Historical Trend Logs */}
              <div className="flex-1 overflow-hidden flex flex-col">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-cyan-300 mb-3">Recent Trend Logs</h3>

                {loadingHistory ? (
                  <div className="flex justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-white/50" />
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                    {historyData.slice().reverse().map((log, index) => (
                      <div key={index} className="flex justify-between items-center rounded-xl bg-black/20 px-4 py-3 border border-white/5">
                        <span className="text-sm text-white/60">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <div className="flex space-x-4 text-sm font-medium text-white">
                          <span>{log.temperature}°C</span>
                          <span className={getAQIStyle(log.aqi).color}>AQI: {log.aqi}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer Timestamp */}
              <div className="mt-6 flex items-center justify-center space-x-2 text-xs text-white/40 pt-4 border-t border-white/10">
                <Clock className="h-3 w-3" />
                <span>Live Data Updated: {new Date(selectedCity.latestMetrics?.updatedAt).toLocaleTimeString()}</span>
              </div>
            </>
          )}
        </div>
      </div>

    </div>
  );
}

export default App;