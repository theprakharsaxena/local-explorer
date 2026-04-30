import MapComponent from "./MapComponent";
import { Place } from "./PlaceCard";

export default function MapWrapper({ places, userLocation }: { places: Place[]; userLocation?: string | null }) {
  return <MapComponent places={places} userLocation={userLocation} />;
}
