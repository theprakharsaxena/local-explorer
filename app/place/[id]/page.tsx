"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Heart, Star, MapPin, ArrowLeft } from "lucide-react";
import { useLocalStorage } from "../../../hooks/useLocalStorage";
import { getPlaceDetails } from "../../actions/googlePlaces";
import { Place } from "../../../components/PlaceCard";

export default function PlaceDetails() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  
  const [place, setPlace] = useState<Place | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [favorites, setFavorites] = useLocalStorage<string[]>("favorites", []);

  useEffect(() => {
    async function fetchPlace() {
      try {
        const data = await getPlaceDetails(id as string);
        setPlace(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPlace();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!place) {
    return <div className="p-20 text-center text-xl">Place not found 🏜️</div>;
  }

  const isFavorite = favorites.includes(place.id);

  const toggleFavorite = () => {
    if (isFavorite) {
      setFavorites(favorites.filter(favId => favId !== place.id));
    } else {
      setFavorites([...favorites, place.id]);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Banner */}
      <div className="relative w-full h-[40vh] md:h-[50vh] bg-muted">
        <Image
          src={place.image}
          alt={place.name}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent"></div>
        
        <div className="absolute top-6 left-4 sm:left-8 z-10">
          <button 
            onClick={() => router.back()}
            className="p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="bg-card text-card-foreground p-6 sm:p-8 rounded-3xl shadow-xl border border-border">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold tracking-wide">
                  {place.category}
                </span>
                {place.isHiddenGem && (
                  <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-3 py-1 rounded-full text-sm font-semibold tracking-wide flex items-center gap-1">
                    💎 Hidden Gem
                  </span>
                )}
              </div>
              <h1 className="text-4xl font-extrabold">{place.name}</h1>
            </div>
            
            <button 
              onClick={toggleFavorite}
              className={`p-4 rounded-full transition-all duration-300 shadow-md flex items-center gap-2 ${isFavorite ? 'bg-rose-500 text-white' : 'bg-muted hover:bg-muted/80 text-muted-foreground'}`}
            >
              <Heart className={`w-6 h-6 ${isFavorite ? 'fill-white' : ''}`} />
              <span className="font-semibold hidden sm:inline">{isFavorite ? 'Saved' : 'Save'}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-6 mb-8 text-muted-foreground">
            <div className="flex items-center gap-1.5 text-foreground font-semibold text-lg">
              <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              {place.rating}
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-5 h-5" />
              {place.distance} km away
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Best for:</span>
              <div className="flex gap-1">
                {place.tags.mood.map(m => (
                  <span key={m} className="bg-muted px-2 py-0.5 rounded text-xs">{m}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-3">About</h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                {place.description}
              </p>
            </section>

            <section className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
              <h2 className="text-xl font-bold mb-2 flex items-center gap-2 text-primary">
                ✨ Why visit?
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Whether you're looking for a {place.tags.mood.join(" or ").toLowerCase()} vibe, {place.name} offers an unparalleled experience. Best visited in the {place.tags.time.join(" or ").toLowerCase()} for the perfect atmosphere.
              </p>
            </section>
          </div>
        </div>


      </div>
    </div>
  );
}

