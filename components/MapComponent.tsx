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

function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function MapComponent({ places }: { places: Place[] }) {
  const defaultCenter: [number, number] = [28.6139, 77.2090]; 
  
  const center = places.length > 0 
    ? [places[0].coordinates.lat, places[0].coordinates.lng] as [number, number]
    : defaultCenter;

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
        {places.map((place) => (
          <Marker 
            key={place.id} 
            position={[place.coordinates.lat, place.coordinates.lng]}
            icon={customIcon}
          >
            <Popup>
              <div className="text-center w-40">
                <div className="w-full h-24 mb-2 overflow-hidden rounded-md">
                  <img src={place.image} alt={place.name} className="object-cover w-full h-full" />
                </div>
                <h3 className="font-bold text-sm mb-1">{place.name}</h3>
                <p className="text-xs text-gray-500 mb-2">{place.category}</p>
                <Link href={`/place/${place.id}`} className="block w-full bg-blue-500 text-white text-xs py-1 rounded-md text-center hover:bg-blue-600 transition-colors">
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
