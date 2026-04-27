"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Map, List, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PlaceCard, { Place } from "../../components/PlaceCard";
import MapWrapper from "../../components/MapWrapper";
import { searchPlaces, getCityName } from "../actions/googlePlaces";

function ExploreContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.toLowerCase() || "";
  const moodParam = searchParams.get("mood") || "";
  const timeParam = searchParams.get("time") || "";

  const [view, setView] = useState<"list" | "map">("list");
  const [filterCategory, setFilterCategory] = useState("All");
  
  const [userLocation, setUserLocation] = useState<string | null>(null);
  const [cityName, setCityName] = useState<string>("Detecting Location...");
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isLocationSearch, setIsLocationSearch] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation(`${lat},${lng}`);
        },
        (error) => {
          console.error("Error getting location:", error);
          setPermissionDenied(true);
          setIsLoading(false);
        }
      );
    } else {
      setPermissionDenied(true);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!userLocation) return;

    async function loadPlaces() {
      setIsLoading(true);
      try {
        const name = await getCityName(userLocation!);
        setCityName(name);

        const searchTerm = query || "cafe, restaurant, park, lounge, club";
        const { places, resolvedCity, isLocationSearch } = await searchPlaces(searchTerm, userLocation!, 100);
        setPlaces(places);
        setIsLocationSearch(!!isLocationSearch);
        if (resolvedCity) {
          setCityName(resolvedCity);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadPlaces();
  }, [query, userLocation]);

  const categories = ["All", ...Array.from(new Set(places.map(p => p.category)))];

  const filteredPlaces = places.filter((place) => {
    let match = true;
    if (moodParam) {
      match = match && place.tags.mood.includes(moodParam);
    }
    if (timeParam) {
      match = match && place.tags.time.includes(timeParam);
    }
    if (filterCategory !== "All") {
      match = match && place.category === filterCategory;
    }
    return match;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col h-[calc(100vh-4rem)]">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-bold">Explore Places</h1>
          <p className="text-muted-foreground">
            {!isLoading && `${filteredPlaces.length} places found near `}
            <span className="text-primary font-semibold">{cityName}</span>
            {query && cityName.toLowerCase() !== query.toLowerCase() && ` for "${query}"`}
            {moodParam && ` for ${moodParam} mood`}
            {timeParam && ` for ${timeParam}`}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center bg-card border border-border rounded-lg p-1">
            <button
              onClick={() => setView("list")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === "list" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <List className="w-4 h-4" />
              List
            </button>
            <button
              onClick={() => setView("map")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === "map" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Map className="w-4 h-4" />
              Map
            </button>
          </div>

          <div className="relative group">
            <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors">
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
            </button>
            <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-2">
              <p className="text-xs font-bold text-muted-foreground mb-2 px-2 uppercase tracking-wider">Category</p>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`w-full text-left px-3 py-1.5 rounded-md text-sm ${filterCategory === cat ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-0 relative">
        <AnimatePresence mode="wait">
          {permissionDenied ? (
            <motion.div key="denied" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center justify-center p-6 text-center max-w-xl mx-auto">
              <div className="text-5xl mb-4">📍</div>
              <p className="text-muted-foreground font-medium text-lg mb-2">Location access was denied or isn't supported.</p>
              <p className="text-sm text-muted-foreground/80">Please allow location permissions in browser configurations to generate mapped pointers.</p>
            </motion.div>
          ) : isLoading || !userLocation ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center justify-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground animate-pulse">Establishing secure positioning...</p>
            </motion.div>
          ) : view === "list" ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full flex flex-col lg:flex-row gap-6"
            >
              <div className="flex-1 h-full overflow-y-auto pr-2 no-scrollbar pb-8">
                {filteredPlaces.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredPlaces.map((place, i) => (
                      <motion.div
                        key={place.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <PlaceCard place={place} hideDistance={isLocationSearch} />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground pt-20">
                    <div className="text-4xl mb-4">🏜️</div>
                    <h3 className="text-xl font-bold mb-2">No places found</h3>
                    <p>Try adjusting your filters or search query.</p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="map"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="h-full w-full rounded-2xl overflow-hidden relative z-0"
            >
              <MapWrapper places={filteredPlaces} userLocation={userLocation} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center w-full h-[calc(100vh-4rem)] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
      <ExploreContent />
    </Suspense>
  );
}

