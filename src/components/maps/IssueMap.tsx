'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type L from 'leaflet';
import {
  ExternalLink,
  CheckCircle2,
  TrendingUp,
  MapPin,
  X,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

interface IssuePin {
  id: string;
  trackingCode: string;
  title: string;
  description: string;
  status: string;
  priorityScore: number;
  priorityLevel: string;
  communityConfidence: number;
  confirmationsCount: number;
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  isEmergency: boolean;
  category: {
    name: string;
    colorCode: string;
  };
  images?: Array<{ url: string }>;
}

interface IssueMapProps {
  issues: IssuePin[];
  selectedIssue: IssuePin | null;
  onSelectIssue: (issue: IssuePin | null) => void;
  center: [number, number];
  zoom: number;
}

export default function IssueMap({
  issues,
  selectedIssue,
  onSelectIssue,
  center,
  zoom,
}: IssueMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    let isMounted = true;

    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      const map = L.map(mapContainerRef.current, {
        center,
        zoom,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

      // Render pins
      renderPins(L, map, issues);
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update center when center prop changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(center, zoom, { animate: true });
    }
  }, [center, zoom]);

  // Re-render pins when issues change
  useEffect(() => {
    if (mapInstanceRef.current) {
      import('leaflet').then((L) => {
        if (mapInstanceRef.current) {
          renderPins(L, mapInstanceRef.current, issues);
        }
      });
    }
  }, [issues]);

  const renderPins = (L: any, map: L.Map, issueList: IssuePin[]) => {
    // Clear old markers
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    issueList.forEach((issue) => {
      // Pin styling based on priority
      let pinColor = '#22c55e'; // Green for resolved
      let hasPulse = false;

      if (issue.status === 'RESOLVED') {
        pinColor = '#10b981';
      } else if (issue.priorityScore >= 80 || issue.isEmergency) {
        pinColor = '#ef4444'; // Red for critical
        hasPulse = true;
      } else if (issue.priorityScore >= 60) {
        pinColor = '#f97316'; // Orange for high
      } else if (issue.priorityScore >= 35) {
        pinColor = '#eab308'; // Yellow for medium
      } else {
        pinColor = '#06b6d4'; // Cyan for low
      }

      const iconHtml = `
        <div class="relative group cursor-pointer">
          ${hasPulse ? `<div class="absolute -inset-2 rounded-full bg-rose-500/40 animate-ping"></div>` : ''}
          <div style="
            background: ${pinColor};
            width: 32px;
            height: 32px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px ${pinColor}66;
            border: 2px solid white;
          ">
            <span style="
              transform: rotate(45deg);
              color: white;
              font-size: 11px;
              font-weight: 800;
              font-family: monospace;
            ">${issue.priorityScore}</span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-priority-pin',
        html: iconHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      const marker = L.marker([issue.latitude, issue.longitude], {
        icon: customIcon,
      }).addTo(map);

      marker.on('click', () => {
        onSelectIssue(issue);
      });

      markersRef.current[issue.id] = marker;
    });
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Issue Preview Card */}
      {selectedIssue && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 sm:left-6 sm:translate-x-0 w-[92vw] sm:w-96 bg-white/95 backdrop-blur-md rounded-3xl p-5 shadow-2xl border border-slate-200 z-[1000] fade-in">
          <button
            onClick={() => onSelectIssue(null)}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
              {selectedIssue.trackingCode}
            </span>
            <span
              className="text-[11px] font-bold px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: `${selectedIssue.category.colorCode}15`,
                color: selectedIssue.category.colorCode,
              }}
            >
              {selectedIssue.category.name}
            </span>
            {selectedIssue.isEmergency && (
              <span className="text-[10px] font-extrabold bg-rose-600 text-white px-2 py-0.5 rounded-full uppercase">
                Emergency
              </span>
            )}
          </div>

          <h3 className="font-bold text-slate-900 text-base leading-snug mb-1 line-clamp-1">
            {selectedIssue.title}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2 mb-3">
            {selectedIssue.description}
          </p>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3 truncate">
            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">{selectedIssue.address}, {selectedIssue.city}</span>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 font-semibold text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {selectedIssue.confirmationsCount} confirmed
              </span>
              <span className="flex items-center gap-1 font-semibold text-indigo-600">
                <TrendingUp className="w-3.5 h-3.5" />
                {selectedIssue.communityConfidence}% conf
              </span>
            </div>

            <Link
              href={`/issues/${selectedIssue.id}`}
              className="inline-flex items-center gap-1 font-bold text-xs px-3 py-1.5 rounded-xl gradient-primary text-white shadow-sm hover:shadow transition-all"
            >
              Details <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
