'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Compass, Loader2 } from 'lucide-react';
import type L from 'leaflet';

interface LocationPickerProps {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  ward: string;
  onLocationChange: (data: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    ward: string;
  }) => void;
}

export default function LocationPicker({
  latitude,
  longitude,
  address,
  city,
  ward,
  onLocationChange,
}: LocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [geocoding, setGeocoding] = useState(false);

  // Reverse geocode to human-readable address using OSM Nominatim
  const reverseGeocode = async (lat: number, lng: number) => {
    setGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (res.ok) {
        const data = await res.json();
        const displayAddr = data.display_name?.split(',').slice(0, 3).join(',').trim() || address;
        const detectedCity = data.address?.city || data.address?.town || data.address?.municipality || city;
        const detectedSubdistrict = data.address?.suburb || data.address?.neighbourhood || '';
        const detectedWard = detectedSubdistrict.match(/ward\s*\d+/i)?.[0] || ward;

        onLocationChange({
          latitude: lat,
          longitude: lng,
          address: displayAddr || address,
          city: detectedCity || city,
          ward: detectedWard || ward,
        });
        return;
      }
    } catch (e) {
      console.warn('Reverse geocoding error or rate limit:', e);
    } finally {
      setGeocoding(false);
    }

    onLocationChange({
      latitude: lat,
      longitude: lng,
      address,
      city,
      ward,
    });
  };

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    let isMounted = true;

    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Fix default Leaflet icon paths
      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="
            background: linear-gradient(135deg, #6366f1 0%, #4338ca 100%);
            width: 38px;
            height: 38px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 14px rgba(99, 102, 241, 0.45);
            border: 2.5px solid white;
          ">
            <div style="
              width: 12px;
              height: 12px;
              background: white;
              border-radius: 50%;
              transform: rotate(45deg);
            "></div>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 38],
        popupAnchor: [0, -38],
      });

      const map = L.map(mapContainerRef.current, {
        center: [latitude, longitude],
        zoom: 15,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker([latitude, longitude], {
        draggable: true,
        icon: customIcon,
      }).addTo(map);

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        reverseGeocode(Number(pos.lat.toFixed(6)), Number(pos.lng.toFixed(6)));
      });

      map.on('click', (e) => {
        marker.setLatLng(e.latlng);
        reverseGeocode(Number(e.latlng.lat.toFixed(6)), Number(e.latlng.lng.toFixed(6)));
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update marker position when latitude or longitude changes externally
  useEffect(() => {
    if (markerRef.current && mapInstanceRef.current) {
      const currentPos = markerRef.current.getLatLng();
      if (Math.abs(currentPos.lat - latitude) > 0.0001 || Math.abs(currentPos.lng - longitude) > 0.0001) {
        markerRef.current.setLatLng([latitude, longitude]);
        mapInstanceRef.current.setView([latitude, longitude], 15);
      }
    }
  }, [latitude, longitude]);

  // Request browser GPS position
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        setIsLocating(false);

        if (markerRef.current && mapInstanceRef.current) {
          markerRef.current.setLatLng([lat, lng]);
          mapInstanceRef.current.setView([lat, lng], 16);
        }
        reverseGeocode(lat, lng);
      },
      (err) => {
        setIsLocating(false);
        alert(`Location access failed: ${err.message}. Using default Nepal city coordinates.`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-4">
      {/* Map Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
          <Compass className="w-4 h-4 text-indigo-600 animate-spin-slow" />
          <span>Click anywhere on the map or drag the pin to set the exact issue location.</span>
        </div>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-indigo-600 shadow-sm hover:bg-indigo-50 transition-colors disabled:opacity-50"
        >
          {isLocating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Navigation className="w-3.5 h-3.5 text-indigo-600" />
          )}
          Use Current GPS Location
        </button>
      </div>

      {/* Map Canvas */}
      <div className="relative w-full h-80 rounded-2xl overflow-hidden border border-slate-200 shadow-inner z-0">
        <div ref={mapContainerRef} className="w-full h-full" />
        {geocoding && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-slate-700 shadow-md border flex items-center gap-1.5 z-[1000]">
            <Loader2 className="w-3 h-3 animate-spin text-indigo-600" />
            Updating address...
          </div>
        )}
      </div>

      {/* Coordinate & Address Input Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Street / Landmark Address *
          </label>
          <div className="relative">
            <input
              type="text"
              value={address}
              onChange={(e) =>
                onLocationChange({
                  latitude,
                  longitude,
                  address: e.target.value,
                  city,
                  ward,
                })
              }
              placeholder="e.g. Baidam Road, Near Hallanchowk"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Ward Number</label>
          <input
            type="text"
            value={ward}
            onChange={(e) =>
              onLocationChange({
                latitude,
                longitude,
                address,
                city,
                ward: e.target.value,
              })
            }
            placeholder="e.g. Ward 6"
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Municipality / City</label>
          <select
            value={city}
            onChange={(e) =>
              onLocationChange({
                latitude,
                longitude,
                address,
                city: e.target.value,
                ward,
              })
            }
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="Pokhara">Pokhara Metropolitan City</option>
            <option value="Kathmandu">Kathmandu Metropolitan City</option>
            <option value="Lalitpur">Lalitpur Metropolitan City</option>
            <option value="Bharatpur">Bharatpur Metropolitan City</option>
            <option value="Biratnagar">Biratnagar Metropolitan City</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Latitude</label>
          <input
            type="number"
            step="any"
            value={latitude}
            readOnly
            className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 bg-slate-50 text-slate-600"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Longitude</label>
          <input
            type="number"
            step="any"
            value={longitude}
            readOnly
            className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 bg-slate-50 text-slate-600"
          />
        </div>
      </div>
    </div>
  );
}
