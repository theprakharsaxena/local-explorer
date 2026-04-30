# Local Explorer 📍

Local Explorer is a modern web application built with **React + Vite** that helps users discover nearby places, hidden gems, and hangout spots based on their location, mood, or category. It uses the **Google Places API** for real-time location data and provides an interactive map interface using **Leaflet**.

## ✨ Features

- **Location-Based Discovery**: Automatically detects user location (with permission) to suggest nearby spots.
- **Dynamic Search**: Search for cities, specific places, or categories (e.g., "cafes", "parks").
- **Interactive Map View**: Toggle between list view and map view (Leaflet) to visualize places.
- **Mood & Time Filters**: Filter locations based on vibe (Chill, Date, Study, Party).
- **Favorites System**: Save favorite spots for later (persisted in localStorage).
- **Responsive & Premium Design**: Tailwind CSS, Framer Motion animations, Light & Dark modes.

## 🚀 Tech Stack

- **Frontend**: [React 19](https://react.dev/) + [Vite 6](https://vite.dev/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **UI & Animations**: [Tailwind CSS 4](https://tailwindcss.com/), [Framer Motion](https://motion.dev/), [Lucide React](https://lucide.dev/)
- **Maps**: [Leaflet](https://leafletjs.com/) via [React-Leaflet](https://react-leaflet.js.org/)
- **API**: [Google Places API](https://developers.google.com/maps/documentation/places/web-service/overview)
- **Deployment**: [Netlify](https://www.netlify.com/) (with serverless functions for API proxy)

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- A Google Cloud Project with **Places API** and **Geocoding API** enabled.

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_GOOGLE_PLACES_API_KEY=your_api_key_here
```

### Installation & Run

```bash
npm install
npm run dev        # Start dev server at http://localhost:5173
npm run build      # Production build
npm run preview    # Preview production build
```

---

## 🏗️ How It Works

### 1. Data Fetching & Google Places API
All location queries go through `src/services/googlePlaces.js` which calls the Google Places API via serverless proxy functions (`/api/place/*`, `/api/geocode/*`).
- **`searchPlaces`**: Supports text-based queries (searching a city) and proximity searches (nearby venues within 10km).
- **Smart Tagging**: The app maps place types (`cafe`, `bar`, `park`) to mood tags like *Chill*, *Party*, or *Study*.

### 2. Map Integration
Uses React-Leaflet for interactive maps with custom markers showing place thumbnails and names.

### 3. Local State Persistence
Favorites are stored on the user's device using a custom `useLocalStorage` hook — no backend needed.

### 4. API Proxy (CORS Solution)
Google Places API blocks direct browser requests (CORS). The app uses:
- **Local dev**: Vite's built-in proxy (`vite.config.js`)
- **Production**: Netlify serverless functions (`netlify/functions/`)

---

## 📂 Project Structure

```
├── src/
│   ├── pages/              # Page components (Home, Explore, Favorites, PlaceDetails)
│   ├── components/         # UI components (Map, PlaceCard, Navbar, MoodSelector)
│   ├── services/           # Google Places API service
│   ├── context/            # Dark Mode context
│   ├── hooks/              # Custom React hooks (useLocalStorage)
│   ├── App.jsx             # Root component with routing
│   ├── main.jsx            # Vite entry point
│   └── index.css           # Global styles & design tokens
├── netlify/functions/      # Serverless API proxy functions
├── vite.config.js          # Vite config with dev proxy
├── netlify.toml            # Netlify deployment config
└── index.html              # HTML entry point
```
