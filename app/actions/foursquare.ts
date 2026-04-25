"use server";

import { Place } from "../../components/PlaceCard";

const API_KEY = process.env.FOURSQUARE_API_KEY;

function mapFoursquareToPlace(fsq: any): Place {
  const category = fsq.categories?.[0]?.name || "Place";
  
  // Construct image url
  let image = "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=800"; // fallback
  if (fsq.photos && fsq.photos.length > 0) {
    const photo = fsq.photos[0];
    image = `${photo.prefix}800x800${photo.suffix}`;
  }

  // Rating is out of 10, convert to 5
  let rating = 0;
  if (fsq.rating) {
    rating = Number((fsq.rating / 2).toFixed(1));
  } else {
    rating = Number((Math.random() * 1.5 + 3.5).toFixed(1)); // mock rating if missing
  }

  const distanceInMiles = fsq.distance ? Number((fsq.distance * 0.000621371).toFixed(1)) : 0;

  // Derive tags from tastes or category
  const tastes = fsq.tastes || [];
  const moodTags = [];
  const timeTags = [];
  
  const textMatch = [category, ...tastes].join(" ").toLowerCase();
  
  if (textMatch.includes("coffee") || textMatch.includes("study") || textMatch.includes("cafe")) {
    moodTags.push("Study", "Chill");
    timeTags.push("Morning");
  }
  if (textMatch.includes("park") || textMatch.includes("nature")) {
    moodTags.push("Chill");
    timeTags.push("Morning", "Evening");
  }
  if (textMatch.includes("bar") || textMatch.includes("club") || textMatch.includes("lounge")) {
    moodTags.push("Party", "Date");
    timeTags.push("Night");
  }
  if (textMatch.includes("restaurant") || textMatch.includes("dining")) {
    moodTags.push("Date");
    timeTags.push("Evening", "Night");
  }

  if (moodTags.length === 0) moodTags.push("Chill");
  if (timeTags.length === 0) timeTags.push("Evening");

  return {
    id: fsq.fsq_id,
    name: fsq.name,
    category,
    image,
    rating,
    distance: distanceInMiles,
    description: fsq.description || `A highly rated ${category.toLowerCase()} in the area offering great experiences.`,
    tags: {
      mood: [...new Set(moodTags)],
      time: [...new Set(timeTags)]
    },
    coordinates: {
      lat: fsq.geocodes?.main?.latitude || 0,
      lng: fsq.geocodes?.main?.longitude || 0
    },
    isHiddenGem: rating >= 4.5 && (!fsq.popularity || fsq.popularity < 0.5) // mock logic
  };
}

export async function searchPlaces(query: string = "", ll: string = "28.6139,77.2090", limit: number = 30) {
  if (!API_KEY) {
    console.warn("FOURSQUARE_API_KEY is not set.");
    return [];
  }

  try {
    const params = new URLSearchParams({
      ll,
      limit: limit.toString(),
      fields: "fsq_id,name,categories,photos,rating,distance,description,geocodes,tastes,popularity"
    });

    if (query) {
      params.append("query", query);
    }

    const response = await fetch(`https://api.foursquare.com/v3/places/search?${params.toString()}`, {
      headers: {
        "Authorization": API_KEY,
        "Accept": "application/json"
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) {
      console.error("Foursquare API error:", await response.text());
      return [];
    }

    const data = await response.json();
    return data.results.map(mapFoursquareToPlace);
  } catch (error) {
    console.error("Failed to fetch places:", error);
    return [];
  }
}

export async function getPlaceDetails(id: string) {
  if (!API_KEY) {
    console.warn("FOURSQUARE_API_KEY is not set.");
    return null;
  }

  try {
    const params = new URLSearchParams({
      fields: "fsq_id,name,categories,photos,rating,distance,description,geocodes,tastes,popularity"
    });

    const response = await fetch(`https://api.foursquare.com/v3/places/${id}?${params.toString()}`, {
      headers: {
        "Authorization": API_KEY,
        "Accept": "application/json"
      },
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      console.error("Foursquare API error:", await response.text());
      return null;
    }

    const data = await response.json();
    return mapFoursquareToPlace(data);
  } catch (error) {
    console.error("Failed to fetch place details:", error);
    return null;
  }
}

// Fetch specific IDs for the favorites page
export async function getMultiplePlaces(ids: string[]) {
  if (!ids || ids.length === 0) return [];
  
  // Foursquare API doesn't have a bulk fetch by ID endpoint, so we fetch in parallel
  const promises = ids.map(id => getPlaceDetails(id));
  const results = await Promise.all(promises);
  return results.filter(Boolean) as Place[];
}
