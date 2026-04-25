"use client";
import dynamic from "next/dynamic";
import { Place } from "./PlaceCard";

const MapComponent = dynamic(() => import("./MapComponent"), { ssr: false });

export default function MapWrapper({ places }: { places: Place[] }) {
  return <MapComponent places={places} />;
}
