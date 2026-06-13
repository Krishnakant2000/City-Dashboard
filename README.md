# 🌍 Global City Insights Map - Real-Time Data Dashboard

An interactive, 3D world map dashboard that displays real-time weather, Air Quality Index (AQI), population estimates, and live currency exchange rates for 10 major global cities. 

This full-stack application utilizes a decoupled architecture, where a robust Node.js background engine handles third-party API rate limits and historical data aggregation, while a sleek React frontend provides a responsive, 3D "Glassmorphism" user experience.

## 🚀 Live Demo
* **Frontend Application:** https://city-dashboard-seven.vercel.app/
* **Backend REST API:** https://city-dashboard-api.onrender.com/api/cities

---

## ✨ Core Features

* **Interactive 3D Globe:** Built using `react-globe.gl` and Three.js, featuring auto-rotation, smooth camera transitions, and glowing city markers.
* **Real-Time Metrics Engine:** Displays accurate Temperature, Humidity, AQI levels, and live Currency Exchange Rates (vs INR).
* **Historical Trend Logs:** Tracks and graphs the previous 15 days of environmental trends.
* **Intelligent Polling:** The React UI silently polls the backend every 30 seconds for immediate updates without triggering full page reloads.
* **Rate-Limit Safe Architecture:** A Node.js `node-cron` job fetches bulk data from external APIs every 15 minutes, safely storing it in MongoDB to prevent third-party API throttling.
* **Modern UI/UX:** Responsive Glassmorphism design using Tailwind CSS, including dynamic AQI color-coding and an animated temperature gauge.

---

## 🛠️ Technology Stack

### Frontend (Client-Side)
* **Framework:** React.js (via Vite)
* **Styling:** Tailwind CSS (Glassmorphism & responsive design)
* **3D Rendering:** `react-globe.gl`
* **Data Visualization:** `react-gauge-component`
* **Icons:** Lucide React
* **Deployment:** Vercel

### Backend (Server-Side)
* **Environment:** Node.js & Express.js
* **Database:** MongoDB Atlas (Time-Series ready)
* **ODM:** Mongoose
* **Task Scheduling:** `node-cron`
* **HTTP Client:** Axios
* **Deployment:** Render

### Third-Party APIs Utilized
1. **OpenWeatherMap API:** Powers both real-time weather data and real-time Air Pollution (AQI) metrics.
2. **Frankfurter API:** Open-source API powering real-time currency exchange rates against the Indian Rupee (INR).

---

## 🏗️ System Architecture

1. **The Seed:** On initial setup, 10 global cities (with exact coordinates and local currency codes) are seeded into the database.
2. **The Sync (Cron Job):** Every 15 minutes, the backend loop fetches fresh data for all 10 cities from OpenWeather and Frankfurter. It updates the `latestMetrics` in the `City` collection and pushes a snapshot to the `MetricsHistory` collection.
3. **The API Delivery:** The Express router exposes endpoints (`/api/cities` and `/api/cities/:id/history`) that serve the heavily optimized JSON.
4. **The Client:** The React frontend visualizes the 3D map, pulling the initial payload on mount and setting up a silent 30-second interval polling mechanism.

---

## 💻 Local Installation & Setup

### Prerequisites
* Node.js (v16+)
* MongoDB Atlas Cluster (Free Tier)
* OpenWeatherMap API Key (Free Tier)

### 1. Clone the Repository
```
git clone https://github.com/Krishnakant2000/City-Dashboard.git
cd City-Dashboard
```

### 2. Backend Setup
```
cd backend
npm install
```

Create a .env file in the backend/ directory:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
OPENWEATHER_API_KEY=your_openweather_api_key_here
```

Seed the database and start the server:

```
node src/seed.js   # Only run this once!
npm run dev        # Starts server on http://localhost:5000
```

### 3. Frontend Setup
Open a new terminal window:

```
cd frontend
npm install
```
Create a .env file in the frontend/ directory:
```
VITE_API_BASE_URL=http://localhost:5000/api
```

Start the Vite development server:
```
npm run dev
```

### 📄 API Documentation
```
GET /api/cities
```
Returns an array of all 10 cities along with their latest environmental and financial metrics.

```
GET /api/cities/:id/history
```
Returns an array of historical snapshots for a specific city, sorted chronologically for trend graphing.
