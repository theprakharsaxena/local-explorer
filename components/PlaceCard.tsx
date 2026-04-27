"use client";

import { motion } from "framer-motion";
import { Star, MapPin } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export interface Place {
  id: string;
  name: string;
  category: string;
  image?: string;
  rating: number;
  distance: number;
  description: string;
  tags: { mood: string[]; time: string[] };
  coordinates: { lat: number; lng: number };
  isHiddenGem: boolean;
  website?: string;
  phone?: string;
  address?: string;
  openingHours?: string[];
  priceLevel?: number;
  openNow?: boolean;
  mapUrl?: string;
}

export default function PlaceCard({ place }: { place: Place }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="bg-card text-card-foreground rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-border group"
    >
      <Link href={`/place/${place.id}`} className="block h-full">
        <div className="relative h-48 w-full overflow-hidden bg-muted flex items-center justify-center">
          {place.image ? (
            <Image
              src={place.image}
              alt={place.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <MapPin className="w-12 h-12 text-muted-foreground/50" />
          )}
          {place.isHiddenGem && (
            <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full shadow-md backdrop-blur-md">
              Hidden Gem 💎
            </div>
          )}
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            {place.rating}
          </div>
        </div>
        
        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">{place.name}</h3>
            <span className="text-xs font-medium bg-muted px-2.5 py-1 rounded-md text-muted-foreground whitespace-nowrap">{place.category}</span>
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
            {place.description}
          </p>
          
          <div className="flex items-center text-xs text-muted-foreground font-medium">
            <MapPin className="w-3.5 h-3.5 mr-1" />
            {place.distance} km away
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
