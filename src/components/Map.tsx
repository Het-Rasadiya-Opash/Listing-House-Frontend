import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface MapProps {
  latitude: number;
  longitude: number;
  title?: string;
}

const Map = ({ latitude, longitude, title }: MapProps) => {
  const mapStyle = {
    height: "clamp(250px, 50vh, 400px)",
    width: "100%",
    borderRadius: "8px",
    minHeight: "250px",
    maxWidth: "100%",
  };

  return (
    <div style={{ width: "100%", overflow: "hidden" }}>
      <MapContainer center={[latitude, longitude]} zoom={13} style={mapStyle}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <Marker position={[latitude, longitude]}>
          {title && <Popup>{title}</Popup>}
        </Marker>
      </MapContainer>
    </div>
  );
};

export default Map;