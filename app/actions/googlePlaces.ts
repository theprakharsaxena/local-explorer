"use server";

import { Place } from "../../components/PlaceCard";

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;

function formatCategory(cat: string): string {
  return cat
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function mapGoogleToPlace(gPlace: any): Place {
  const genericTypes = ["establishment", "point_of_interest", "landmark", "place_of_worship", "political", "store"];
  const specificTypes = (gPlace.types || []).filter((t: string) => !genericTypes.includes(t));
  const rawCategory = specificTypes[0] || gPlace.types?.[0] || "place";
  const category = formatCategory(rawCategory);
  
  // Construct photo URL using Google Places API
  let image = "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=800"; // fallback
  if (gPlace.photos && gPlace.photos.length > 0 && API_KEY) {
    const photoRef = gPlace.photos[0].photo_reference;
    image = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoRef}&key=${API_KEY}`;
  }

  const rating = gPlace.rating || Number((Math.random() * 1.5 + 3.5).toFixed(1));
  const distance = Number((Math.random() * 3 + 1).toFixed(1)); // mock distance as nearby API doesn't return it directly

  const moodTags: string[] = [];
  const timeTags: string[] = [];
  const textMatch = [category, ...(gPlace.types || [])].join(" ").toLowerCase();

  if (textMatch.includes("cafe") || textMatch.includes("coffee") || textMatch.includes("tea")) {
    moodTags.push("Study", "Chill");
    timeTags.push("Morning");
  }
  if (textMatch.includes("park") || textMatch.includes("tourist") || textMatch.includes("nature") || textMatch.includes("garden")) {
    moodTags.push("Chill");
    timeTags.push("Morning", "Evening");
  }
  if (textMatch.includes("bar") || textMatch.includes("night_club") || textMatch.includes("liquor") || textMatch.includes("dance")) {
    moodTags.push("Party", "Date");
    timeTags.push("Night");
  }
  if (textMatch.includes("restaurant") || textMatch.includes("food") || textMatch.includes("meal")) {
    moodTags.push("Date");
    timeTags.push("Evening", "Night");
  }

  if (moodTags.length === 0) moodTags.push("Chill");
  if (timeTags.length === 0) timeTags.push("Evening");

  const openingHours = gPlace.opening_hours?.weekday_text;
  const openNow = gPlace.opening_hours?.open_now;
  const priceLevel = gPlace.price_level;
  const website = gPlace.website;
  const phone = gPlace.formatted_phone_number;
  const address = gPlace.formatted_address || gPlace.vicinity;
  const mapUrl = gPlace.url;

  return {
    id: gPlace.place_id || Math.random().toString(),
    name: gPlace.name,
    category,
    image,
    rating,
    distance,
    description: gPlace.vicinity || gPlace.formatted_address || `A highly recommended ${category.toLowerCase()} to visit.`,
    tags: {
      mood: [...new Set(moodTags)],
      time: [...new Set(timeTags)]
    },
    coordinates: {
      lat: gPlace.geometry?.location?.lat || 0,
      lng: gPlace.geometry?.location?.lng || 0
    },
    isHiddenGem: rating >= 4.5 && (gPlace.user_ratings_total || 0) < 100,
    website,
    phone,
    address,
    openingHours,
    priceLevel,
    openNow,
    mapUrl
  };
}

export async function searchPlaces(query: string = "", ll: string = "28.6139,77.2090", limit: number = 40) {
  if (!API_KEY) {
    console.warn("GOOGLE_PLACES_API_KEY is not set.");
    return { places: [] };
  }

  try {
    const [lat, lng] = ll.split(",");
    
    // 1. Target location keyword detection
    if (query && query !== "cafe, restaurant, park, lounge, club") {
      const textUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&location=${lat},${lng}&radius=10000&key=${API_KEY}`;
      const response = await fetch(textUrl);
      if (!response.ok) return { places: [] };

      const data = await response.json();
      if (data.status === "OK" && data.results.length > 0) {
        const firstPlace = data.results[0];
        const types = firstPlace.types || [];
        
        const isLocation = types.some((t: string) => 
          ["locality", "administrative_area_level_1", "administrative_area_level_2", "sublocality", "country", "postal_code"].includes(t)
        );

        if (isLocation) {
          const cityName = firstPlace.name;
          const categoriesToFetch = ["tourist attractions", "cafes", "top restaurants", "parks"];
          
          const promises = categoriesToFetch.map(async (cat) => {
            const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(`${cat} in ${cityName}`)}&key=${API_KEY}`;
            const res = await fetch(url);
            if (res.ok) {
              const resData = await res.json();
              return resData.results || [];
            }
            return [];
          });

          const allResults = await Promise.all(promises);
          const uniquePlaces = new Map();
          
          allResults.flat().forEach(place => {
            if (place.place_id) uniquePlaces.set(place.place_id, place);
          });

          return { 
            places: Array.from(uniquePlaces.values()).slice(0, limit).map(mapGoogleToPlace),
            resolvedCity: cityName
          };
        }
        
        return { places: (data.results || []).slice(0, limit).map(mapGoogleToPlace) };
      }
      return { places: [] };
    }

    // 2. Multi-category parallel nearby POI acquisition
    const categoriesToFetch = ["cafe", "restaurant", "tourist_attraction", "park"];
    const promises = categoriesToFetch.map(async (type) => {
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=10000&type=${type}&key=${API_KEY}`;
      const res = await fetch(url);
      if (res.ok) {
        const resData = await res.json();
        return resData.results || [];
      }
      return [];
    });

    const allResults = await Promise.all(promises);
    const uniquePlaces = new Map();
    
    allResults.flat().forEach(place => {
      if (place.place_id) uniquePlaces.set(place.place_id, place);
    });

    return { places: Array.from(uniquePlaces.values()).slice(0, limit).map(mapGoogleToPlace) };
  } catch (err) {
    console.error("Failed Google search:", err);
    return { places: [] };
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

export async function getCityName(ll: string) {
  if (!API_KEY) return "Your Location";

  try {
    const [lat, lng] = ll.split(",");
    
    // Attempt 1: Places API type=locality (Most reliable with active credentials)
    const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=10000&type=locality&key=${API_KEY}`;
    const placesRes = await fetch(placesUrl);
    if (placesRes.ok) {
      const placesData = await placesRes.json();
      if (placesData.status === "OK" && placesData.results && placesData.results.length > 0) {
        return placesData.results[0].name;
      }
    }

    // Attempt 2: Geocoding API Fallback
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${API_KEY}`;
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      if (data.status === "OK" && data.results && data.results.length > 0) {
        const addressComponents = data.results[0].address_components;
        const locality = addressComponents.find((c: any) => c.types.includes("locality"));
        if (locality) return locality.long_name;
        
        const sublocality = addressComponents.find((c: any) => c.types.includes("sublocality"));
        if (sublocality) return sublocality.long_name;

        const adminArea = addressComponents.find((c: any) => c.types.includes("administrative_area_level_2"));
        if (adminArea) return adminArea.long_name;
      }
    }

    return "Your Location";
  } catch (err) {
    console.error("Reverse resolution failed:", err);
    return "Your Location";
  }
}
