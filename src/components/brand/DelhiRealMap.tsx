'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { Map as LeafletMap, LayerGroup } from 'leaflet';

export interface DelhiCafeMarker {
  id: string;
  name: string;
  area: string;
  lat: number;
  lng: number;
  status: 'reordered' | 'trial_completed' | 'delivered';
  volume?: string;
  barista?: string;
  rating?: number;
  standingPO?: string;
  quote?: string;
  supplier?: string;
}

export interface CorridorCluster {
  name: string;
  count: number;
  lat: number;
  lng: number;
}

export interface HighwayShield {
  label: string;
  lat: number;
  lng: number;
}

export interface SupplierHub {
  name: string;
  area: string;
  lat: number;
  lng: number;
}

export const CORRIDOR_CLUSTERS_GPS: CorridorCluster[] = [
  { name: 'Hauz Khas', count: 22, lat: 28.5390, lng: 77.2110 },
  { name: 'Connaught Place', count: 12, lat: 28.6385, lng: 77.2260 },
  { name: 'Saket', count: 14, lat: 28.5130, lng: 77.2140 },
  { name: 'Lajpat Nagar', count: 14, lat: 28.5630, lng: 77.2530 },
  { name: 'Kamla Nagar', count: 22, lat: 28.6920, lng: 77.2140 },
  { name: 'Rajouri Garden', count: 8, lat: 28.6510, lng: 77.1080 },
  { name: 'Vasant Kunj', count: 10, lat: 28.5110, lng: 77.1490 },
  { name: 'Gurugram', count: 12, lat: 28.4890, lng: 77.0780 },
  { name: 'Noida', count: 6, lat: 28.5780, lng: 77.3380 },
];

export const HIGHWAY_SHIELDS_GPS: HighwayShield[] = [
  { label: 'NH 48', lat: 28.5080, lng: 77.0850 },
  { label: 'DND', lat: 28.5770, lng: 77.2850 },
  { label: 'NH 44', lat: 28.7100, lng: 77.1750 },
  { label: 'NH 19', lat: 28.5280, lng: 77.2920 },
];

export const SUPPLIER_HUBS_GPS: SupplierHub[] = [
  { name: 'Sharma Dairy', area: 'Central Hub', lat: 28.5900, lng: 77.2100 },
  { name: 'Fresh Lane Foods', area: 'South Hub', lat: 28.5350, lng: 77.1900 },
  { name: 'Hill Roasters', area: 'Gurugram Route', lat: 28.4850, lng: 77.1000 },
  { name: 'Northgate Dairy', area: 'North Hub', lat: 28.6700, lng: 77.1900 },
  { name: 'Eastline Supply', area: 'East Hub', lat: 28.5700, lng: 77.2700 },
  { name: 'Southfield Dairy', area: 'Southwest Hub', lat: 28.5100, lng: 77.1700 },
];

interface DelhiRealMapProps {
  cafes: DelhiCafeMarker[];
  selectedCafe: DelhiCafeMarker | null;
  onSelectCafe: (cafe: DelhiCafeMarker) => void;
  hoveredCafe: DelhiCafeMarker | null;
  onHoverCafe: (cafe: DelhiCafeMarker | null) => void;
  mapViewMode: 'corridors' | 'routes';
  onChangeViewMode: (mode: 'corridors' | 'routes') => void;
}

export default function DelhiRealMap({
  cafes,
  selectedCafe,
  onSelectCafe,
  hoveredCafe,
  onHoverCafe,
  mapViewMode,
  onChangeViewMode,
}: DelhiRealMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersLayerRef = useRef<LayerGroup | null>(null);
  const clustersLayerRef = useRef<LayerGroup | null>(null);
  const shieldsLayerRef = useRef<LayerGroup | null>(null);
  const routesLayerRef = useRef<LayerGroup | null>(null);
  const baseTileLayerRef = useRef<any>(null);
  const refTileLayerRef = useRef<any>(null);

  const [basemap, setBasemap] = useState<'canvas' | 'street'>('canvas');
  const [isLoaded, setIsLoaded] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    let isCancelled = false;

    async function initMap() {
      if (!containerRef.current) return;
      const L = await import('leaflet');

      if (isCancelled) return;

      // Ensure container is clean
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      // Center: Delhi NCR calibrated central coordinate
      const centerLat = 28.598;
      const centerLng = 77.215;

      const map = L.map(containerRef.current, {
        center: [centerLat, centerLng],
        zoom: 11.1,
        minZoom: 10,
        maxZoom: 16,
        zoomSnap: 0.1,
        zoomDelta: 0.5,
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: false,
        dragging: true,
        doubleClickZoom: true,
      });

      mapRef.current = map;

      // Base tile layers
      const esriGray = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 16, opacity: 0.96 }
      );

      const esriRef = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 16, opacity: 0.85 }
      );

      esriGray.addTo(map);
      esriRef.addTo(map);
      baseTileLayerRef.current = esriGray;
      refTileLayerRef.current = esriRef;

      // Layer groups for markers, clusters, shields, routes
      markersLayerRef.current = L.layerGroup().addTo(map);
      clustersLayerRef.current = L.layerGroup().addTo(map);
      shieldsLayerRef.current = L.layerGroup().addTo(map);
      routesLayerRef.current = L.layerGroup().addTo(map);

      // Map move listener for tooltip repositioning
      map.on('move', () => {
        if (hoveredCafe && mapRef.current) {
          const pt = mapRef.current.latLngToContainerPoint([hoveredCafe.lat, hoveredCafe.lng]);
          setTooltipPos({ x: pt.x, y: pt.y });
        }
      });

      setIsLoaded(true);
    }

    initMap();

    return () => {
      isCancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update Basemap Tiles (Canvas vs Street)
  useEffect(() => {
    async function updateBasemap() {
      if (!mapRef.current) return;
      const L = await import('leaflet');

      if (baseTileLayerRef.current) {
        mapRef.current.removeLayer(baseTileLayerRef.current);
      }
      if (refTileLayerRef.current) {
        mapRef.current.removeLayer(refTileLayerRef.current);
      }

      if (basemap === 'canvas') {
        const esriGray = L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
          { maxZoom: 16, opacity: 0.96 }
        );
        const esriRef = L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
          { maxZoom: 16, opacity: 0.85 }
        );
        esriGray.addTo(mapRef.current);
        esriRef.addTo(mapRef.current);
        baseTileLayerRef.current = esriGray;
        refTileLayerRef.current = esriRef;
      } else {
        const osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 16,
          opacity: 0.9,
        });
        osm.addTo(mapRef.current);
        baseTileLayerRef.current = osm;
        refTileLayerRef.current = null;
      }
    }

    if (isLoaded) {
      updateBasemap();
    }
  }, [basemap, isLoaded]);

  // Update Markers & Clusters & Shields
  useEffect(() => {
    async function renderLayers() {
      if (!mapRef.current || !isLoaded) return;
      const L = await import('leaflet');

      // Clear previous layers
      if (markersLayerRef.current) markersLayerRef.current.clearLayers();
      if (clustersLayerRef.current) clustersLayerRef.current.clearLayers();
      if (shieldsLayerRef.current) shieldsLayerRef.current.clearLayers();
      if (routesLayerRef.current) routesLayerRef.current.clearLayers();

      // 1. Render Corridor Cluster Badges (Lamar style)
      if (clustersLayerRef.current) {
        CORRIDOR_CLUSTERS_GPS.forEach((cluster) => {
          const clusterHtml = `
            <div class="bdb-lcluster" title="${cluster.name} Corridor (${cluster.count} seeded kits)">
              <span class="bdb-lcluster-ring"></span>
              <span class="bdb-lcluster-count">${cluster.count}</span>
            </div>
          `;

          const clusterIcon = L.divIcon({
            html: clusterHtml,
            className: 'bdb-lcluster-wrap',
            iconSize: [26, 26],
            iconAnchor: [13, 13],
          });

          const marker = L.marker([cluster.lat, cluster.lng], {
            icon: clusterIcon,
            zIndexOffset: 50,
          });

          marker.on('click', () => {
            if (mapRef.current) {
              mapRef.current.flyTo([cluster.lat, cluster.lng], 13.2, { duration: 0.7 });
            }
          });

          marker.addTo(clustersLayerRef.current!);
        });
      }

      // 2. Render Highway Shields (Lamar GIS style)
      if (shieldsLayerRef.current) {
        HIGHWAY_SHIELDS_GPS.forEach((shield) => {
          const shieldHtml = `<div class="bdb-lshield">${shield.label}</div>`;
          const shieldIcon = L.divIcon({
            html: shieldHtml,
            className: 'bdb-lshield-wrap',
            iconSize: [36, 16],
            iconAnchor: [18, 8],
          });

          const marker = L.marker([shield.lat, shield.lng], {
            icon: shieldIcon,
            zIndexOffset: 30,
            interactive: false,
          });

          marker.addTo(shieldsLayerRef.current!);
        });
      }

      // 3. Render 27 Delhi Café Markers
      if (markersLayerRef.current) {
        cafes.forEach((cafe) => {
          const isSelected = selectedCafe?.id === cafe.id;
          const isReordered = cafe.status === 'reordered';
          const isTried = cafe.status === 'trial_completed';

          const markerTypeClass = isReordered
            ? 'is-reordered'
            : isTried
              ? 'is-tried'
              : 'is-delivered';
          const selectedClass = isSelected ? 'is-selected' : '';

          const markerHtml = `
            <div class="bdb-lmarker ${markerTypeClass} ${selectedClass}">
              ${isReordered ? '<span class="bdb-lmarker-ping"></span>' : ''}
              <span class="bdb-lmarker-core"></span>
            </div>
          `;

          const markerIcon = L.divIcon({
            html: markerHtml,
            className: 'bdb-lmarker-wrap',
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          });

          const marker = L.marker([cafe.lat, cafe.lng], {
            icon: markerIcon,
            zIndexOffset: isSelected ? 200 : isReordered ? 120 : 100,
          });

          marker.on('click', () => {
            onSelectCafe(cafe);
            if (mapRef.current) {
              mapRef.current.panTo([cafe.lat, cafe.lng], { animate: true, duration: 0.4 });
            }
          });

          marker.on('mouseover', () => {
            onHoverCafe(cafe);
            if (mapRef.current) {
              const pt = mapRef.current.latLngToContainerPoint([cafe.lat, cafe.lng]);
              setTooltipPos({ x: pt.x, y: pt.y });
            }
          });

          marker.on('mouseout', () => {
            onHoverCafe(null);
            setTooltipPos(null);
          });

          marker.addTo(markersLayerRef.current!);
        });
      }

      // 4. Render Network Hub Logistics Routes (when in 'routes' mode)
      if (routesLayerRef.current && mapViewMode === 'routes') {
        const centralLat = 28.5980;
        const centralLng = 77.2150;

        SUPPLIER_HUBS_GPS.forEach((hub) => {
          // Smooth 12-point quadratic Bezier curve
          const pts: [number, number][] = [];
          const tSteps = 12;
          const p0 = [hub.lat, hub.lng];
          const p2 = [centralLat, centralLng];
          const p1 = [
            (hub.lat + centralLat) / 2 + (hub.lng > centralLng ? 0.012 : -0.012),
            (hub.lng + centralLng) / 2 + (hub.lat > centralLat ? -0.012 : 0.012),
          ];

          for (let step = 0; step <= tSteps; step++) {
            const t = step / tSteps;
            const lat = (1 - t) * (1 - t) * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0];
            const lng = (1 - t) * (1 - t) * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1];
            pts.push([lat, lng]);
          }

          const polyline = L.polyline(pts, {
            color: '#6B33D3',
            weight: 1.5,
            opacity: 0.5,
            dashArray: '3, 4',
          });
          polyline.addTo(routesLayerRef.current!);

          // Sleek Frosted Hub Badge
          const hubHtml = `
            <div class="bdb-lhub-badge" title="${hub.name} · ${hub.area}">
              <span class="bdb-lhub-dot"></span>
              <span class="bdb-lhub-name">${hub.name}</span>
              <span class="bdb-lhub-tag">${hub.area}</span>
            </div>
          `;
          const hubIcon = L.divIcon({
            html: hubHtml,
            className: 'bdb-lhub-wrap',
            iconSize: [110, 22],
            iconAnchor: [55, 11],
          });
          L.marker([hub.lat, hub.lng], { icon: hubIcon, zIndexOffset: 85 }).addTo(routesLayerRef.current!);
        });
      }
    }

    renderLayers();
  }, [cafes, selectedCafe, isLoaded, mapViewMode, onSelectCafe, onHoverCafe]);

  // Recenter Handler
  const handleRecenter = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.flyTo([28.598, 77.215], 11.1, { duration: 0.8 });
    }
  }, []);

  // Zoom Handlers
  const handleZoomIn = useCallback(() => {
    if (mapRef.current) mapRef.current.zoomIn();
  }, []);

  const handleZoomOut = useCallback(() => {
    if (mapRef.current) mapRef.current.zoomOut();
  }, []);

  return (
    <div className="bdb-real-map-container">
      {/* Leaflet Mount Element */}
      <div
        ref={containerRef}
        className={`bdb-real-map-stage ${basemap === 'canvas' ? 'is-canvas' : 'is-street'}`}
      />

      {/* Streamlined Top Left Floating Controls */}
      <div className="bdb-map-ctrl-top-left">
        <div className="bdb-mode-toggle" role="tablist" aria-label="Map View Mode">
          <button
            type="button"
            role="tab"
            aria-selected={mapViewMode === 'corridors'}
            className={`bdb-mode-btn ${mapViewMode === 'corridors' ? 'is-active' : ''}`}
            onClick={() => onChangeViewMode('corridors')}
          >
            ● Corridors
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mapViewMode === 'routes'}
            className={`bdb-mode-btn ${mapViewMode === 'routes' ? 'is-active' : ''}`}
            onClick={() => onChangeViewMode('routes')}
          >
            Hub Routes
          </button>
          <span className="bdb-ctrl-pipe" aria-hidden="true" />
          <button
            type="button"
            className={`bdb-mode-btn bdb-basemap-btn ${basemap === 'street' ? 'is-active' : ''}`}
            onClick={() => setBasemap(basemap === 'canvas' ? 'street' : 'canvas')}
            title={basemap === 'canvas' ? 'Switch to Street Cartography' : 'Switch to Canvas'}
          >
            {basemap === 'canvas' ? '🗺️ Street' : '📐 Canvas'}
          </button>
        </div>
      </div>

      {/* Streamlined Top Right Floating Controls */}
      <div className="bdb-map-ctrl-top-right">
        <span className="bdb-location-pill">📍 Delhi NCR</span>
        <button
          type="button"
          className="bdb-recenter-btn"
          onClick={handleRecenter}
          title="Reset map view to Delhi NCR center"
        >
          Reset
        </button>
        <div className="bdb-zoom-ctrl" role="group" aria-label="Map Zoom">
          <button
            type="button"
            className="bdb-zoom-btn"
            title="Zoom in"
            onClick={handleZoomIn}
          >
            +
          </button>
          <button
            type="button"
            className="bdb-zoom-btn"
            title="Zoom out"
            onClick={handleZoomOut}
          >
            −
          </button>
        </div>
      </div>

      {/* Lamar-style Interactive Tooltip */}
      {hoveredCafe && tooltipPos && (
        <div
          className="bdb-lamar-tooltip"
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
          }}
        >
          <div className="bdb-lt-header">
            <span className="bdb-lt-title">{hoveredCafe.name}</span>
            <span className="bdb-lt-status">
              {hoveredCafe.status === 'reordered'
                ? 'Weekly PO Active'
                : hoveredCafe.status === 'trial_completed'
                  ? 'Trial Verified'
                  : 'Trial Kit'}
            </span>
          </div>
          <div className="bdb-lt-body">
            <span>
              {hoveredCafe.area} · {hoveredCafe.volume || '24 L/wk'}
            </span>
            <span className="bdb-lt-hint">Click to inspect</span>
          </div>
          <div className="bdb-lt-arrow" />
        </div>
      )}

      {/* Docked Floating Café Intelligence Card */}
      {selectedCafe && (
        <div className="bdb-cafe-dock-card">
          <div className="bdb-dock-header">
            <div className="bdb-dock-title-group">
              <span className="bdb-dock-name">{selectedCafe.name}</span>
              <span className="bdb-dock-area">· {selectedCafe.area}</span>
            </div>
            <span
              className={`bdb-dock-status ${
                selectedCafe.status === 'reordered'
                  ? 'status-reordered'
                  : selectedCafe.status === 'trial_completed'
                    ? 'status-tried'
                    : 'status-delivered'
              }`}
            >
              {selectedCafe.status === 'reordered'
                ? '● Weekly Reorder Active'
                : selectedCafe.status === 'trial_completed'
                  ? '◎ Trial Completed'
                  : '○ Trial Kit Delivered'}
            </span>
          </div>

          {/* Verbatim Barista Cupping Feedback */}
          {selectedCafe.quote && (
            <div className="bdb-dock-quote">
              <span>{selectedCafe.quote}</span>
            </div>
          )}

          {/* Key Café Operating Telemetry */}
          <div className="bdb-dock-details">
            <div className="bdb-dock-stat">
              <span className="bdb-dock-label">WEEKLY VOLUME</span>
              <span className="bdb-dock-val text-purple">{selectedCafe.volume || '32 L/wk'}</span>
            </div>
            {selectedCafe.barista && (
              <div className="bdb-dock-stat">
                <span className="bdb-dock-label">HEAD BARISTA</span>
                <span className="bdb-dock-val">{selectedCafe.barista}</span>
              </div>
            )}
            {selectedCafe.rating && (
              <div className="bdb-dock-stat">
                <span className="bdb-dock-label">CUPPING SCORE</span>
                <span className="bdb-dock-val">★ {selectedCafe.rating}</span>
              </div>
            )}
            <div className="bdb-dock-stat">
              <span className="bdb-dock-label">PO CHANNEL</span>
              <span className="bdb-dock-val">{selectedCafe.standingPO || 'Net-15 Active'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
