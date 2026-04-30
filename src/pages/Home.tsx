import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import PlaceCard, { Place } from "../components/PlaceCard";
import { searchPlaces, getCityName } from "../services/googlePlaces";

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState<string | null>(null);
  const [cityName, setCityName] = useState<string>("Detecting Location...");
  const [trendingPlaces, setTrendingPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
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

    async function loadTrending() {
      setIsLoading(true);
      try {
        const name = await getCityName(userLocation!);
        setCityName(name);

        const { places } = await searchPlaces("cafe", userLocation!, 10);
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
      navigate(`/explore?q=${encodeURIComponent(searchQuery)}`);
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
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold mb-2">Trending Places 🔥</h2>
            <p className="text-muted-foreground">The most loved spots near <span className="text-primary font-semibold">{cityName}</span> right now.</p>
          </div>
        </div>

        {permissionDenied ? (
          <div className="text-center py-10 bg-card border border-border rounded-2xl max-w-xl mx-auto p-8 shadow-sm flex flex-col items-center">
            <div className="text-4xl mb-4">📍</div>
            <p className="text-muted-foreground mb-4 font-medium text-lg">Location access was denied or isn't supported.</p>
            <p className="text-sm text-muted-foreground/80 mb-6">Please allow location permissions in your browser settings to discover customized recommendations in your current area.</p>
          </div>
        ) : isLoading || !userLocation ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground animate-pulse">Establishing secure positioning...</p>
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
          <p className="text-center text-muted-foreground py-10">No trending places found in your area.</p>
        )}
      </section>
    </div>
  );
}
