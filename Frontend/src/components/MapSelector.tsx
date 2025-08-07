import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

import { updateUserLocation } from "../api/profile_service";
import { Button } from "./Button";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function LocationSelector({
  onSelect,
}: {
  onSelect: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function ManualLocationPicker() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [successMessage, setSuccessMessage] = useState("");

  const handleSaveLocation = async () => {
    if (!location) return;
    try {
      await updateUserLocation(location.lat, location.lng);
      setSuccessMessage("Location saved");
      
    } catch (error) {
      console.error("Error saving location:", error);
    }
  };

  return (
    <div>
      <h2>Select your location manually</h2>
      <p>Click on the map to select a location.</p>

      <div style={{ height: "400px", marginBottom: "1rem" }}>
        <MapContainer
          center={[40.4168, -3.7038]} // inicial point: Madrid
          zoom={6}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <LocationSelector
            onSelect={(lat, lng) => setLocation({ lat, lng })}
          />
          {location && <Marker position={[location.lat, location.lng]} />}
        </MapContainer>
      </div>

      {location && (
        <div>
          <p>
            Selected location: {location.lat.toFixed(4)},{" "}
            {location.lng.toFixed(4)}
          </p>
          <Button className="mb-4" variant="outline" onClick={handleSaveLocation}>Save location</Button>
        </div>
      )}

      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
    </div>
  );
}
