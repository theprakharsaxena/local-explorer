"use client";

import { useLocalStorage } from "../../hooks/useLocalStorage";
import PlaceCard, { Place } from "../../components/PlaceCard";
import { motion } from "framer-motion";
import { HeartOff } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getMultiplePlaces } from "../actions/googlePlaces";

export default function FavoritesPage() {
  const [favorites] = useLocalStorage<string[]>("favorites", []);
  const [mounted, setMounted] = useState(false);
  
  const [favoritePlaces, setFavoritePlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    async function fetchFavorites() {
      if (favorites.length === 0) {
        setFavoritePlaces([]);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        const places = await getMultiplePlaces(favorites);
        setFavoritePlaces(places);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchFavorites();
  }, [favorites, mounted]);

  if (!mounted) return null; // Avoid hydration mismatch

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-3">Your Favorites ❤️</h1>
        <p className="text-muted-foreground text-lg">Places you've saved for later.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : favoritePlaces.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-3xl border border-border text-center">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
            <HeartOff className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-3">No favorites yet</h2>
          <p className="text-muted-foreground mb-8 max-w-md">
            You haven't saved any places yet. Start exploring and click the heart icon to save places here.
          </p>
          <Link 
            href="/explore" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-full font-medium transition-colors"
          >
            Explore Places
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favoritePlaces.map((place, i) => (
            <motion.div
              key={place.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <PlaceCard place={place} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
