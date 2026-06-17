"use client";

import { useEffect, useRef } from "react";

interface Flight {
  id: number;
  flight_number: string;
  origin: string;
  destination: string;
  status: string;
  vehicle_code?: string;
  vehicle_name?: string;
  simulation_started_at?: string | null;
  simulation_interval?: number;
}

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
  "Hong Kong": [22.3193, 114.1694],
};

function getCityCoords(cityStr: string): [number, number] {
  for (const [city, coords] of Object.entries(CITY_COORDS)) {
    if (cityStr.toLowerCase().includes(city.toLowerCase())) {
      return coords;
    }
  }
  return [-2.5, 118.0];
}

function getStatusFraction(status: string): number {
  switch (status?.toLowerCase()) {
    case "scheduled":
    case "delayed":
      return 0.05;
    case "departed":
      return 0.25;
    case "in transit":
      return 0.55;
    case "landed":
      return 1.0;
    default:
      return 0.05;
  }
}

function getStatusColor(status: string): string {
  switch (status?.toLowerCase()) {
    case "departed": return "#2563eb";
    case "in transit": return "#d97706";
    case "landed": return "#16a34a";
    case "delayed": return "#dc2626";
    case "scheduled": return "#6b7280";
    default: return "#6b7280";
  }
}

interface DashboardMapProps {
  flights: Flight[];
}

export default function DashboardMap({ flights }: DashboardMapProps) {
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    import("leaflet").then((L) => {
      delete (L.Icon.Default.prototype as any)._getIconUrl;

      const container = containerRef.current as any;

      if (container._leaflet_id) {
        delete container._leaflet_id;
      }

      const map = L.map(container, {
        center: [-2.5, 118.0],
        zoom: 4,
        scrollWheelZoom: false,
        zoomControl: true,
      });

      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      flights.forEach((flight) => {
        const originCoords = getCityCoords(flight.origin);
        const destCoords = getCityCoords(flight.destination);
        const fraction = getStatusFraction(flight.status);
        const color = getStatusColor(flight.status);

        // Draw route line
        L.polyline([originCoords, destCoords], {
          color: color,
          weight: 2,
          opacity: 0.4,
          dashArray: "6, 5",
        }).addTo(map);

        // Origin dot
        L.circleMarker(originCoords, {
          radius: 5,
          fillColor: "#1d4ed8",
          color: "white",
          weight: 2,
          fillOpacity: 0.9,
        }).addTo(map).bindPopup(`<b>Origin:</b> ${flight.origin}`);

        // Destination dot
        L.circleMarker(destCoords, {
          radius: 5,
          fillColor: "#16a34a",
          color: "white",
          weight: 2,
          fillOpacity: 0.9,
        }).addTo(map).bindPopup(`<b>Destination:</b> ${flight.destination}`);

        // Flight position
        const planeLat = originCoords[0] + (destCoords[0] - originCoords[0]) * fraction;
        const planeLng = originCoords[1] + (destCoords[1] - originCoords[1]) * fraction;

        const planeIcon = L.divIcon({
          html: `
            <div style="
              background:${color};
              color:white;
              padding:3px 6px;
              border-radius:6px;
              font-size:10px;
              font-weight:700;
              white-space:nowrap;
              box-shadow:0 2px 6px rgba(0,0,0,0.3);
              display:flex;
              align-items:center;
              gap:3px;
              border:1.5px solid rgba(255,255,255,0.7);
            ">
              ✈ ${flight.flight_number}
            </div>`,
          className: "",
          iconSize: [80, 24],
          iconAnchor: [40, 12],
        });

        L.marker([planeLat, planeLng], { icon: planeIcon })
          .addTo(map)
          .bindPopup(`
            <div style="min-width:180px">
              <p style="font-size:13px;font-weight:700;margin:0 0 4px">${flight.flight_number}</p>
              <p style="font-size:11px;color:#555;margin:0">✈ ${flight.origin}</p>
              <p style="font-size:11px;color:#555;margin:0">🏁 ${flight.destination}</p>
              ${flight.vehicle_code ? `<p style="font-size:11px;color:#555;margin:4px 0 0">🚀 ${flight.vehicle_code}</p>` : ""}
              <span style="
                display:inline-block;
                margin-top:6px;
                padding:2px 8px;
                border-radius:10px;
                font-size:10px;
                font-weight:700;
                background:${color}22;
                color:${color};
                border:1px solid ${color}55;
              ">${flight.status}</span>
            </div>
          `);
      });
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [flights]);

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm">
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin=""
      />
      <div ref={containerRef} style={{ height: "420px", width: "100%" }} />
    </div>
  );
}
