import MapComponent from "./MapComponent";

export default function MapWrapper({ places, userLocation }) {
  return <MapComponent places={places} userLocation={userLocation} />;
}
