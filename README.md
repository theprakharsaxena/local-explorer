# Local Explorer 📍

Local Explorer is a modern web application built with **Next.js** that helps users discover nearby places, hidden gems, and hangout spots based on their location, mood, or category. It leverages the **Google Places API** for real-time location data and provides an interactive map interface using **Leaflet**.

## ✨ Features

- **Location-Based Discovery**: Automatically detects user location (with permission) to suggest the most relevant nearby spots.
- **Dynamic Search**: Search for cities, specific places, or categories (e.g., "cafes", "parks").
- **Interactive Map View**: Toggle between a list view and a map view (via Leaflet) to visualize places geographically.
- **Mood & Time Filters**: Filter locations based on vibe (Chill, Date, Study, Party) and best time to visit (Morning, Evening, Night).
- **Favorites System**: Save your favorite spots for later (persisted locally).
- **User Reviews**: Add ratings and reviews for visited places (persisted locally).
- **Responsive & Premium Design**: Built with Tailwind CSS, Framer Motion, and support for both Light and Dark modes.

## 🚀 Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **UI & Animations**: [Tailwind CSS 4](https://tailwindcss.com/), [Framer Motion](https://motion.dev/), [Lucide React](https://lucide.dev/)
- **Maps**: [Leaflet](https://leafletjs.com/) via [React-Leaflet](https://react-leaflet.js.org/)
- **API**: [Google Places API](https://developers.google.com/maps/documentation/places/web-service/overview)

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- A Google Cloud Project with the **Places API** and **Geocoding API** enabled.

### Environment Variables

Create a `.env.local` file in the root directory and add your Google Places API Key:

```env
GOOGLE_PLACES_API_KEY=your_actual_api_key_here
```

### Installation & Run

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏗️ How It Works (Implementation Details)

### 1. Data Fetching & Google Places API
All location queries route through Next.js **Server Actions** located in `app/actions/googlePlaces.ts`.
- **`searchPlaces`**: Supports both text-based queries (e.g., searching a city) and proximity searches (fetching local venues within a 10km radius).
- **Smart Tagging**: Since the Google API doesn't return "moods", the app programmatically maps place types (`cafe`, `bar`, `park`) to tags like *Chill*, *Party*, or *Study*.

### 2. Map Integration (Client-Side Rendering)
Leaflet requires access to browser-specific APIs (`window`). To prevent Server-Side Rendering (SSR) crashes:
- `components/MapWrapper.tsx` dynamically imports `components/MapComponent.tsx` using `next/dynamic` with `{ ssr: false }`.

### 3. Local State Persistence
Data that doesn't need a heavy backend (like Favorites and Reviews) is safely stored on the user's device using a custom `useLocalStorage` hook (`hooks/useLocalStorage.ts`).

---

## 📂 Project Structure

```
├── app/
│   ├── actions/           # Server Actions for Google API
│   ├── explore/           # Explore route (List/Map toggle)
│   ├── favorites/         # Saved places route
│   ├── place/[id]/        # Dynamic route for specific places
│   ├── layout.tsx         # Root Layout with ThemeProvider
│   └── page.tsx           # Landing Page
├── components/            # UI components (Map, Cards, Navbar)
├── context/               # Dark Mode context logic
├── hooks/                 # Custom React hooks
```
