"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import { Place } from "./PlaceCard";

// Fix Leaflet's default icon issue
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom User Location Icon (Pulsing Blue Dot)
const userIcon = L.divIcon({
  className: 'user-location-icon',
  html: `
    <div class="relative flex items-center justify-center w-6 h-6">
      <div class="absolute w-full h-full bg-blue-500 rounded-full opacity-50 animate-ping"></div>
      <div class="relative w-3 h-3 bg-blue-600 border border-white rounded-full"></div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

// Custom Place Marker (Image + Name)
const createCustomMarker = (place: Place) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div class="flex flex-col items-center">
        <div class="w-10 h-10 rounded-full border-2 border-primary shadow-lg overflow-hidden bg-white flex items-center justify-center">
          ${place.image ? `<img src="${place.image}" alt="${place.name}" class="w-full h-full object-cover" />` : `<span class="text-xs text-primary font-bold">${place.name.charAt(0)}</span>`}
        </div>
        <div class="bg-card text-card-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-md mt-1 whitespace-nowrap max-w-[100px] truncate shadow-md border border-border">
          ${place.name}
        </div>
      </div>
    `,
    iconSize: [40, 55],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });
};

function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function MapComponent({ places, userLocation }: { places: Place[]; userLocation?: string | null }) {
  const defaultCenter: [number, number] = [28.6139, 77.2090]; 
  
  const userCoords: [number, number] | null = userLocation 
    ? userLocation.split(',').map(Number) as [number, number]
    : null;

  const center = userCoords || (places.length > 0 
    ? [places[0].coordinates.lat, places[0].coordinates.lng] as [number, number]
    : defaultCenter);

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden border border-border shadow-sm isolate">
      <MapContainer 
        center={center} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ChangeView center={center} zoom={13} />
        
        {/* User Location Marker */}
        {userCoords && (
          <Marker position={userCoords} icon={userIcon}>
            <Popup>
              <div className="text-center text-xs font-semibold p-1">You are here 📍</div>
            </Popup>
          </Marker>
        )}

        {/* Place Markers */}
        {places.map((place) => (
          <Marker 
            key={place.id} 
            position={[place.coordinates.lat, place.coordinates.lng]}
            icon={createCustomMarker(place)}
          >
            <Popup>
              <div className="text-center w-40">
                {place.image && (
                  <div className="w-full h-24 mb-2 overflow-hidden rounded-md">
                    <img src={place.image} alt={place.name} className="object-cover w-full h-full" />
                  </div>
                )}
                <h3 className="font-bold text-sm mb-1">{place.name}</h3>
                <p className="text-xs text-gray-500 mb-2">{place.category}</p>
                <Link href={`/place/${place.id}`} className="block w-full bg-primary text-primary-foreground text-xs py-1 rounded-md text-center hover:bg-primary/90 transition-colors">
                  View Details
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
