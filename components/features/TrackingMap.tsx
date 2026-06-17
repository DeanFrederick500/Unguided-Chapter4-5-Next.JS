"use client";

import { useEffect, useRef } from "react";

interface TrackingMapProps {
  origin: string;
  destination: string;
  status?: string;
}

// City coordinate lookup (approximated)
const CITY_COORDS: Record<string, [number, number]> = {
  Jakarta: [-6.2088, 106.8456],
  Bandung: [-6.9147, 107.6098],
  Surabaya: [-7.2575, 112.7521],
  Malang: [-7.9797, 112.6304],
  Yogyakarta: [-7.7956, 110.3695],
  Solo: [-7.5755, 110.8243],
  Semarang: [-6.9932, 110.4203],
  Denpasar: [-8.6705, 115.2126],
  Medan: [3.5952, 98.6722],
  Pekanbaru: [0.5335, 101.4508],
  Palembang: [-2.9761, 104.7754],
  Balikpapan: [-1.2379, 116.8529],
  Samarinda: [-0.5022, 117.1536],
  Makassar: [-5.1477, 119.4327],
  Manado: [1.4748, 124.8421],
  Jambi: [-1.6101, 103.6131],
  Banjarmasin: [-3.3194, 114.5908],
  Pontianak: [-0.0263, 109.3425],
  Batam: [1.1301, 104.0529],
  Ambon: [-3.6554, 128.1908],
  Singapore: [1.3521, 103.8198],
  Hongkong: [22.3193, 114.1694],
  Tokyo: [35.6762, 139.6503],
  Bangkok: [13.7563, 100.5018],
  "Kuala Lumpur": [3.139, 101.6869],
};

function getCityCoords(cityStr: string): [number, number] {
  for (const [city, coords] of Object.entries(CITY_COORDS)) {
    if (cityStr.toLowerCase().includes(city.toLowerCase())) {
      return coords;
    }
  }
  // Default: center of Indonesia
  return [-2.5, 118.0];
}

export default function TrackingMap({ origin, destination, status }: TrackingMapProps) {
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;

    // Cleanup previous map instance
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    import("leaflet").then((L) => {
      // Fix default icons for Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const originCoords = getCityCoords(origin);
      const destCoords = getCityCoords(destination);

      // Calculate midpoint for map centering
      const centerLat = (originCoords[0] + destCoords[0]) / 2;
      const centerLng = (originCoords[1] + destCoords[1]) / 2;

      const container = containerRef.current!;

      // Prevent duplicate initialization
      if ((container as any)._leaflet_id) {
        return;
      }

      const map = L.map(containerRef.current!, {
        center: [centerLat, centerLng],
        zoom: 5,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      // Origin marker (blue)
      const originIcon = L.divIcon({
        html: `<div style="background:#1d4ed8;width:14px;height:14px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>`,
        className: "",
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      // Destination marker (green)
      const destIcon = L.divIcon({
        html: `<div style="background:#16a34a;width:14px;height:14px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>`,
        className: "",
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      L.marker(originCoords, { icon: originIcon })
        .addTo(map)
        .bindPopup(`<b>📦 Origin</b><br/>${origin}`)
        .openPopup();

      L.marker(destCoords, { icon: destIcon })
        .addTo(map)
        .bindPopup(`<b>🏁 Destination</b><br/>${destination}`);

      // Route line
      L.polyline([originCoords, destCoords], {
        color: "#1d4ed8",
        weight: 3,
        opacity: 0.7,
        dashArray: "8, 6",
      }).addTo(map);

      // Cargo position marker based on status
      if (status) {
        const s = status.toLowerCase();
        let fraction = 0;
        if (s === "scheduled" || s === "delayed") fraction = 0;
        else if (s === "departed") fraction = 0.2;
        else if (s === "in transit") fraction = 0.55;
        else if (s === "landed" || s === "delivered") fraction = 1;

        const cargoLat = originCoords[0] + (destCoords[0] - originCoords[0]) * fraction;
        const cargoLng = originCoords[1] + (destCoords[1] - originCoords[1]) * fraction;

        const planeIcon = L.divIcon({
          html: `<div title="${status}" style="font-size:22px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.4))">✈️</div>`,
          className: "",
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        L.marker([cargoLat, cargoLng], { icon: planeIcon })
          .addTo(map)
          .bindPopup(`<b>✈️ Current Position</b><br/>Status: <b>${status}</b>`);
      }

      // Fit bounds to show both markers
      const bounds = L.latLngBounds([originCoords, destCoords]);
      map.fitBounds(bounds, { padding: [40, 40] });
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [origin, destination, status]);

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm">
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin=""
      />
      <div ref={containerRef} style={{ height: "320px", width: "100%" }} />
    </div>
  );
}
