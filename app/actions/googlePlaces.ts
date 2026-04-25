"use server";

import { Place } from "../../components/PlaceCard";

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;

function mapGoogleToPlace(gPlace: any): Place {
  const category = gPlace.types?.[0] || "Place";
  
  // Construct photo URL using Google Places API
  let image = "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=800"; // fallback
  if (gPlace.photos && gPlace.photos.length > 0 && API_KEY) {
    const photoRef = gPlace.photos[0].photo_reference;
    image = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoRef}&key=${API_KEY}`;
  }

  const rating = gPlace.rating || Number((Math.random() * 1.5 + 3.5).toFixed(1));
  const distance = Number((Math.random() * 3 + 1).toFixed(1)); // mock distance as nearby API doesn't return it directly

  const moodTags = [];
  const timeTags = [];
  const textMatch = [category, ...(gPlace.types || [])].join(" ").toLowerCase();

  if (textMatch.includes("cafe") || textMatch.includes("coffee")) {
    moodTags.push("Study", "Chill");
    timeTags.push("Morning");
  } else if (textMatch.includes("park") || textMatch.includes("tourist")) {
    moodTags.push("Chill");
    timeTags.push("Morning", "Evening");
  } else if (textMatch.includes("bar") || textMatch.includes("night_club")) {
    moodTags.push("Party", "Date");
    timeTags.push("Night");
  } else if (textMatch.includes("restaurant") || textMatch.includes("food")) {
    moodTags.push("Date");
    timeTags.push("Evening", "Night");
  } else {
    moodTags.push("Chill");
    timeTags.push("Evening");
  }

  return {
    id: gPlace.place_id || Math.random().toString(),
    name: gPlace.name,
    category: category.replace(/_/g, ' ').toUpperCase(),
    image,
    rating,
    distance,
    description: gPlace.vicinity || gPlace.formatted_address || `A highly recommended spot to visit.`,
    tags: {
      mood: [...new Set(moodTags)],
      time: [...new Set(timeTags)]
    },
    coordinates: {
      lat: gPlace.geometry?.location?.lat || 0,
      lng: gPlace.geometry?.location?.lng || 0
    },
    isHiddenGem: rating >= 4.5 && (gPlace.user_ratings_total || 0) < 100
  };
}

export async function searchPlaces(query: string = "", ll: string = "28.6139,77.2090", limit: number = 20) {
  if (!API_KEY) {
    console.warn("GOOGLE_PLACES_API_KEY is not set.");
    return [];
  }

  try {
    const [lat, lng] = ll.split(",");
    let url = "";

    if (query && query !== "cafe, restaurant, park, lounge, club") {
      url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&location=${lat},${lng}&radius=5000&key=${API_KEY}`;
    } else {
      url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&key=${API_KEY}`;
    }

    const response = await fetch(url);
    if (!response.ok) return [];

    const data = await response.json();
    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.error("Google Places API error:", data.status, data.error_message);
      return [];
    }

    return (data.results || []).slice(0, limit).map(mapGoogleToPlace);
  } catch (err) {
    console.error("Failed Google search:", err);
    return [];
  }
}

export async function getPlaceDetails(id: string) {
  if (!API_KEY) return null;

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${id}&key=${API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    if (data.status !== "OK") {
      console.error("Google Places Detail error:", data.status);
      return null;
    }

    return mapGoogleToPlace(data.result);
  } catch (err) {
    console.error("Failed Google Details:", err);
    return null;
  }
}

export async function getMultiplePlaces(ids: string[]) {
  if (!ids || ids.length === 0) return [];
  const promises = ids.map(id => getPlaceDetails(id));
  const results = await Promise.all(promises);
  return results.filter(Boolean) as Place[];
}
