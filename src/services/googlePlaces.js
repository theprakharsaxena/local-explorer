const API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;

function formatCategory(cat) {
  return cat.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

function mapGoogleToPlace(g) {
  const skip = ['establishment', 'point_of_interest', 'landmark', 'place_of_worship', 'political', 'store'];
  const types = (g.types || []).filter(t => !skip.includes(t));
  const category = formatCategory(types[0] || g.types?.[0] || 'place');

  let image;
  if (g.photos?.[0]?.photo_reference && API_KEY) {
    image = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${g.photos[0].photo_reference}&key=${API_KEY}`;
  }

  const text = [category, ...(g.types || [])].join(' ').toLowerCase();
  const mood = [];
  const time = [];

  if (/cafe|coffee|tea/.test(text)) { mood.push('Study', 'Chill'); time.push('Morning'); }
  if (/park|tourist|nature|garden/.test(text)) { mood.push('Chill'); time.push('Morning', 'Evening'); }
  if (/bar|night_club|liquor|dance/.test(text)) { mood.push('Party', 'Date'); time.push('Night'); }
  if (/restaurant|food|meal/.test(text)) { mood.push('Date'); time.push('Evening', 'Night'); }
  if (!mood.length) mood.push('Chill');
  if (!time.length) time.push('Evening');

  return {
    id: g.place_id || Math.random().toString(),
    name: g.name,
    category,
    image,
    rating: g.rating || +(Math.random() * 1.5 + 3.5).toFixed(1),
    distance: +(Math.random() * 3 + 1).toFixed(1),
    description: g.vicinity || g.formatted_address || `A great ${category.toLowerCase()} to visit.`,
    tags: { mood: [...new Set(mood)], time: [...new Set(time)] },
    coordinates: { lat: g.geometry?.location?.lat || 0, lng: g.geometry?.location?.lng || 0 },
    isHiddenGem: (g.rating || 0) >= 4.5 && (g.user_ratings_total || 0) < 100,
    website: g.website,
    phone: g.formatted_phone_number,
    address: g.formatted_address || g.vicinity,
    openingHours: g.opening_hours?.weekday_text,
    priceLevel: g.price_level,
    openNow: g.opening_hours?.open_now,
    mapUrl: g.url,
  };
}

async function fetchJson(url) {
  const res = await fetch(url);
  return res.ok ? res.json() : null;
}

export async function searchPlaces(query = '', ll = '28.6139,77.2090', limit = 100) {
  if (!API_KEY) return { places: [], isLocationSearch: false };
  const [lat, lng] = ll.split(',');

  try {
    if (query && query !== 'cafe, restaurant, park, lounge, club') {
      const data = await fetchJson(`/api/place/textsearch/json?query=${encodeURIComponent(query)}&location=${lat},${lng}&radius=10000&key=${API_KEY}`);
      if (!data?.results?.length) return { places: [], isLocationSearch: false };

      const first = data.results[0];
      const isCity = (first.types || []).some(t =>
        ['locality', 'administrative_area_level_1', 'administrative_area_level_2', 'sublocality', 'country'].includes(t)
      );

      if (isCity) {
        const city = first.name;
        const cats = ['tourist attractions', 'cafes', 'top restaurants', 'parks', 'shopping malls', 'museums', 'night clubs'];
        const all = await Promise.all(cats.map(c =>
          fetchJson(`/api/place/textsearch/json?query=${encodeURIComponent(`${c} in ${city}`)}&key=${API_KEY}`).then(d => d?.results || [])
        ));
        const unique = new Map();
        all.flat().forEach(p => p.place_id && unique.set(p.place_id, p));
        return { places: [...unique.values()].slice(0, limit).map(mapGoogleToPlace), resolvedCity: city, isLocationSearch: true };
      }

      return { places: data.results.slice(0, limit).map(mapGoogleToPlace), isLocationSearch: false };
    }

    const types = ['cafe', 'restaurant', 'tourist_attraction', 'park', 'shopping_mall', 'museum', 'night_club'];
    const all = await Promise.all(types.map(t =>
      fetchJson(`/api/place/nearbysearch/json?location=${lat},${lng}&radius=10000&type=${t}&key=${API_KEY}`).then(d => d?.results || [])
    ));
    const unique = new Map();
    all.flat().forEach(p => p.place_id && unique.set(p.place_id, p));
    return { places: [...unique.values()].slice(0, limit).map(mapGoogleToPlace), isLocationSearch: false };
  } catch (err) {
    console.error('Search failed:', err);
    return { places: [], isLocationSearch: false };
  }
}

export async function getPlaceDetails(id) {
  if (!API_KEY) return null;
  try {
    const data = await fetchJson(`/api/place/details/json?place_id=${id}&key=${API_KEY}`);
    return data?.status === 'OK' ? mapGoogleToPlace(data.result) : null;
  } catch { return null; }
}

export async function getMultiplePlaces(ids) {
  if (!ids?.length) return [];
  const results = await Promise.all(ids.map(getPlaceDetails));
  return results.filter(Boolean);
}

export async function getCityName(ll) {
  if (!API_KEY) return 'Your Location';
  const [lat, lng] = ll.split(',');

  try {
    const p = await fetchJson(`/api/place/nearbysearch/json?location=${lat},${lng}&radius=10000&type=locality&key=${API_KEY}`);
    if (p?.results?.[0]?.name) return p.results[0].name;

    const g = await fetchJson(`/api/geocode/json?latlng=${lat},${lng}&key=${API_KEY}`);
    if (g?.results?.[0]) {
      const parts = g.results[0].address_components;
      const loc = parts.find(c => c.types.includes('locality'));
      if (loc) return loc.long_name;
      const sub = parts.find(c => c.types.includes('sublocality'));
      if (sub) return sub.long_name;
    }

    return 'Your Location';
  } catch { return 'Your Location'; }
}
