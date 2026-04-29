"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Heart, Star, MapPin, ArrowLeft, Phone, Globe, Clock, ExternalLink } from "lucide-react";
import { useLocalStorage } from "../../../hooks/useLocalStorage";
import { getPlaceDetails } from "../../actions/googlePlaces";
import { Place } from "../../../components/PlaceCard";

function PlaceDetailsContent() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const searchParams = useSearchParams();
  const hideDistance = searchParams.get("hideDistance") === "true";
  
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
        {place.image && (
          <Image
            src={place.image}
            alt={place.name}
            fill
            priority
            className="object-cover"
          />
        )}
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
                {place.openNow !== undefined && (
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold tracking-wide ${place.openNow ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                    {place.openNow ? '● Open Now' : '○ Closed'}
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
            {!hideDistance && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-5 h-5" />
                {place.distance} km away
              </div>
            )}
            {place.priceLevel !== undefined && (
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium">Price:</span>
                <span className="text-primary font-bold">
                  {'₹'.repeat(place.priceLevel)}
                </span>
              </div>
            )}
            {/* Best for tags removed */}
          </div>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-3">About</h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                {place.description}
              </p>
            </section>

            {/* Why visit section removed */}

            {/* Contact & Info Section */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card text-card-foreground p-6 rounded-2xl border border-border shadow-sm">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-primary" />
                  Contact Details
                </h2>
                <div className="space-y-3 text-muted-foreground">
                  {place.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-5 h-5 shrink-0 mt-0.5" />
                      <span>{place.address}</span>
                    </div>
                  )}
                  {place.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-5 h-5 shrink-0" />
                      <a href={`tel:${place.phone}`} className="hover:text-primary transition-colors">{place.phone}</a>
                    </div>
                  )}
                  {place.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-5 h-5 shrink-0" />
                      <a href={place.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-1 truncate max-w-[250px]">
                        Visit Website
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                  {place.mapUrl && (
                    <div className="pt-2">
                      <a 
                        href={place.mapUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-sm text-primary hover:underline flex items-center gap-1 font-medium"
                      >
                        View on Google Maps
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {place.openingHours && (
                <div className="bg-card text-card-foreground p-6 rounded-2xl border border-border shadow-sm">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Opening Hours
                  </h2>
                  <ul className="space-y-1.5 text-sm text-muted-foreground">
                    {place.openingHours.map((day, idx) => (
                      <li key={idx} className="flex justify-between border-b border-border/50 pb-1 last:border-0">
                        {day}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          </div>
        </div>


      </div>
    </div>
  );
}

export default function PlaceDetails() {
  return (
    <Suspense fallback={<div className="p-8 text-center w-full min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
      <PlaceDetailsContent />
    </Suspense>
  );
}

