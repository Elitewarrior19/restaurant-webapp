"use client";

import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, CircleMarker } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Location = {
  lat: number;
  lng: number;
};

type OrderMapProps = {
  customerLocation: Location | null | undefined;
  riderLocation?: Location | null;
};

const defaultCenter: LatLngExpression = [31.5204, 74.3587]; // Lahore approx

const customerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

export function OrderMap({ customerLocation, riderLocation }: OrderMapProps) {
  const [center, setCenter] = useState<LatLngExpression>(defaultCenter);

  useEffect(() => {
    if (customerLocation) {
      setCenter([customerLocation.lat, customerLocation.lng]);
    } else if (riderLocation) {
      setCenter([riderLocation.lat, riderLocation.lng]);
    }
  }, [customerLocation, riderLocation]);

  const hasAnyLocation = useMemo(
    () => !!customerLocation || !!riderLocation,
    [customerLocation, riderLocation]
  );

  if (!hasAnyLocation) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-cream/40 px-3 text-[11px] text-gray-500">
        Location abhi set nahi hui. Customer checkout par map use karega to yahan dikhegi.
      </div>
    );
  }

  const customerPos: LatLngExpression | null = customerLocation
    ? [customerLocation.lat, customerLocation.lng]
    : null;
  const riderPos: LatLngExpression | null = riderLocation
    ? [riderLocation.lat, riderLocation.lng]
    : null;

  return (
    <div className="h-40 overflow-hidden rounded-xl border border-gray-200">
      <MapContainer
        center={center}
        zoom={15}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {customerPos && <Marker position={customerPos} icon={customerIcon} />}
        {riderPos && (
          <CircleMarker
            center={riderPos}
            radius={8}
            pathOptions={{ color: "#0b7a4a", fillColor: "#0b7a4a", fillOpacity: 0.8 }}
          />
        )}
      </MapContainer>
    </div>
  );
}

