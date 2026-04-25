"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import MoodSelector from "../components/MoodSelector";
import PlaceCard, { Place } from "../components/PlaceCard";
import { searchPlaces } from "./actions/googlePlaces";

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [mood, setMood] = useState("");
  const [userLocation, setUserLocation] = useState<string>("28.6139,77.2090");
  const [trendingPlaces, setTrendingPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
        }
      );
    }
  }, []);

  useEffect(() => {
    async function loadTrending() {
      try {
        const places = await searchPlaces("cafe", userLocation, 10);
        const topRated = places.sort((a: Place, b: Place) => b.rating - a.rating).slice(0, 3);
        setTrendingPlaces(topRated);
      } catch (err) {
        console.error("Error loading trending places:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadTrending();
  }, [userLocation]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleMoodSelect = (selectedMood: string) => {
    setMood(selectedMood);
    if (selectedMood) {
      router.push(`/explore?mood=${selectedMood}`);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-primary/10 to-background dark:from-primary/5"></div>
        
        <div className="relative z-10 w-full max-w-4xl px-4 flex flex-col items-center text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6"
          >
            Explore Your City <br className="md:hidden" />
            <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-rose-400">Like a Local</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl"
          >
            Discover nearby cafes, hidden gems, and the best hangout spots based on your mood and time of day.
          </motion.p>

          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onSubmit={handleSearch} 
            className="w-full max-w-2xl relative"
          >
            <div className="relative flex items-center w-full h-14 rounded-full bg-card shadow-lg border border-border focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all overflow-hidden">
              <div className="pl-6 text-muted-foreground">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="Search for a city, place, or category..."
                className="w-full h-full bg-transparent border-none focus:outline-none px-4 text-foreground placeholder:text-muted-foreground"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                type="submit"
                className="h-10 px-6 mr-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-full transition-colors"
              >
                Search
              </button>
            </div>
          </motion.form>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12 w-full"
          >
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">How are you feeling?</p>
            <MoodSelector selected={mood} onSelect={handleMoodSelect} />
          </motion.div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold mb-2">Trending Places 🔥</h2>
            <p className="text-muted-foreground">The most loved spots in your area right now.</p>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        ) : trendingPlaces.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trendingPlaces.map((place, i) => (
              <motion.div
                key={place.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <PlaceCard place={place} />
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-10">Ensure FOURSQUARE_API_KEY is set in .env.local to see trending places.</p>
        )}
      </section>

      <section className="bg-muted/50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-2">Time-Based Suggestions 🕒</h2>
            <p className="text-muted-foreground">Perfect spots for different times of the day.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border transition-all hover:shadow-md hover:-translate-y-1">
              <h3 className="font-bold text-xl mb-2 flex items-center gap-2">🌅 Morning</h3>
              <p className="text-muted-foreground text-sm mb-4">Start your day right with cozy cafes and peaceful parks.</p>
              <button onClick={() => router.push('/explore?time=Morning')} className="text-primary font-medium text-sm hover:underline">Explore Morning Spots →</button>
            </div>
            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border transition-all hover:shadow-md hover:-translate-y-1">
              <h3 className="font-bold text-xl mb-2 flex items-center gap-2">🌇 Evening</h3>
              <p className="text-muted-foreground text-sm mb-4">Relax after work at the best hangout spots and restaurants.</p>
              <button onClick={() => router.push('/explore?time=Evening')} className="text-primary font-medium text-sm hover:underline">Explore Evening Spots →</button>
            </div>
            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border transition-all hover:shadow-md hover:-translate-y-1">
              <h3 className="font-bold text-xl mb-2 flex items-center gap-2">🌃 Night</h3>
              <p className="text-muted-foreground text-sm mb-4">Experience the city's nightlife with clubs and late-night lounges.</p>
              <button onClick={() => router.push('/explore?time=Night')} className="text-primary font-medium text-sm hover:underline">Explore Night Spots →</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

