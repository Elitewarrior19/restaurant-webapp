"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Location = {
  lat: number;
  lng: number;
};

type MapPickerProps = {
  value: Location | null;
  onChange: (loc: Location) => void;
  onAddressChange?: (address: string) => void;
};

const defaultCenter: LatLngExpression = [31.5204, 74.3587]; // Lahore

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

type ClickHandlerProps = {
  onPick: (loc: Location) => void;
  onAddressChange?: (address: string) => void;
};

function ClickHandler({ onPick, onAddressChange }: ClickHandlerProps) {
  useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;
      const loc = { lat, lng };
      onPick(loc);
      if (onAddressChange) {
        try {
          const res = await fetch(`/api/geocode?lat=${lat}&lng=${lng}`);
          if (res.ok) {
            const data = (await res.json()) as { address?: string };
            if (data.address) {
              onAddressChange(data.address);
            }
          }
        } catch {
          // ignore, manual address still works
        }
      }
    }
  });
  return null;
}

export function MapPicker({ value, onChange, onAddressChange }: MapPickerProps) {
  const [center, setCenter] = useState<LatLngExpression>(value ?? defaultCenter);

  useEffect(() => {
    if (value) {
      setCenter([value.lat, value.lng]);
      return;
    }
    if (typeof window === "undefined") return;
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCenter([pos.coords.latitude, pos.coords.longitude]);
      },
      () => {
        // keep default center
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [value]);

  const markerPosition: LatLngExpression | null = value
    ? [value.lat, value.lng]
    : Array.isArray(center)
    ? center
    : null;

  return (
    <div className="h-64 overflow-hidden rounded-xl border border-gray-200">
      <MapContainer
        center={center}
        zoom={15}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onPick={onChange} onAddressChange={onAddressChange} />
        {markerPosition && <Marker position={markerPosition} icon={markerIcon} />}
      </MapContainer>
    </div>
  );
}

