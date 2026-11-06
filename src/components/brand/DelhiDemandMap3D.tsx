'use client';

import React, { useState, useTransition, useRef, useEffect, useCallback, useMemo } from 'react';

export type ProductType = 'oat' | 'cold' | 'almond';

export interface ClusterPin {
  id: string;
  name: string;
  x: number; // SVG X (0..2752)
  y: number; // SVG Y (0..1536)
  growth: Record<ProductType, string>;
  growthNum: Record<ProductType, number>;
  intensity: 'Very High' | 'High' | 'Moderate' | 'Low';
  cafes: number;
}

const PIN_DELAYS: Record<string, number> = {
  cp: 0.10,
  gurugram: 0.13,
  kamla: 0.16,
  rajouri: 0.20,
  hauz: 0.23,
  lajpat: 0.26,
  saket: 0.29,
  vasant: 0.32,
  noida: 0.35,
};

const MASTER_W = 2752;
const MASTER_H = 1536;

// 9 Cluster Pins matching exact geographic coordinates in 2752x1536 master resolution
const CLUSTERS: ClusterPin[] = [
  {
    id: 'kamla',
    name: 'Kamla Nagar',
    x: 1680,
    y: 338,
    growth: { oat: '+16.8%', cold: '+19.5%', almond: '+11.5%' },
    growthNum: { oat: 16.8, cold: 19.5, almond: 11.5 },
    intensity: 'High',
    cafes: 24,
  },
  {
    id: 'rajouri',
    name: 'Rajouri Garden',
    x: 963,
    y: 492,
    growth: { oat: '+12.6%', cold: '+14.9%', almond: '+8.9%' },
    growthNum: { oat: 12.6, cold: 14.9, almond: 8.9 },
    intensity: 'Moderate',
    cafes: 19,
  },
  {
    id: 'cp',
    name: 'Connaught Place',
    x: 1651,
    y: 614,
    growth: { oat: '+22.1%', cold: '+28.4%', almond: '+16.3%' },
    growthNum: { oat: 22.1, cold: 28.4, almond: 16.3 },
    intensity: 'Very High',
    cafes: 38,
  },
  {
    id: 'hauz',
    name: 'Hauz Khas',
    x: 1321,
    y: 799,
    growth: { oat: '+14.2%', cold: '+17.1%', almond: '+10.2%' },
    growthNum: { oat: 14.2, cold: 17.1, almond: 10.2 },
    intensity: 'High',
    cafes: 31,
  },
  {
    id: 'lajpat',
    name: 'Lajpat Nagar',
    x: 1926,
    y: 829,
    growth: { oat: '+15.9%', cold: '+18.6%', almond: '+12.1%' },
    growthNum: { oat: 15.9, cold: 18.6, almond: 12.1 },
    intensity: 'High',
    cafes: 22,
  },
  {
    id: 'saket',
    name: 'Saket',
    x: 1651,
    y: 1075,
    growth: { oat: '+13.5%', cold: '+16.2%', almond: '+9.4%' },
    growthNum: { oat: 13.5, cold: 16.2, almond: 9.4 },
    intensity: 'Moderate',
    cafes: 26,
  },
  {
    id: 'vasant',
    name: 'Vasant Kunj',
    x: 936,
    y: 1045,
    growth: { oat: '+11.3%', cold: '+13.8%', almond: '+14.6%' },
    growthNum: { oat: 11.3, cold: 13.8, almond: 14.6 },
    intensity: 'Moderate',
    cafes: 18,
  },
  {
    id: 'gurugram',
    name: 'Gurugram',
    x: 633,
    y: 1167,
    growth: { oat: '+20.7%', cold: '+26.1%', almond: '+15.8%' },
    growthNum: { oat: 20.7, cold: 26.1, almond: 15.8 },
    intensity: 'Very High',
    cafes: 46,
  },
  {
    id: 'noida',
    name: 'Noida',
    x: 2422,
    y: 799,
    growth: { oat: '+10.1%', cold: '+12.4%', almond: '+7.8%' },
    growthNum: { oat: 10.1, cold: 12.4, almond: 7.8 },
    intensity: 'Low',
    cafes: 24,
  },
];

// Delivery corridors connecting clusters
const NETWORK_ROUTES = [
  { id: 'cp-kamla', from: 'cp', to: 'kamla', path: 'M 1651 614 Q 1665 476 1680 338' },
  { id: 'cp-rajouri', from: 'cp', to: 'rajouri', path: 'M 1651 614 Q 1307 553 963 492' },
  { id: 'cp-hauz', from: 'cp', to: 'hauz', path: 'M 1651 614 Q 1486 706 1321 799' },
  { id: 'cp-lajpat', from: 'cp', to: 'lajpat', path: 'M 1651 614 Q 1788 721 1926 829' },
  { id: 'lajpat-noida', from: 'lajpat', to: 'noida', path: 'M 1926 829 Q 2174 814 2422 799' },
  { id: 'hauz-saket', from: 'hauz', to: 'saket', path: 'M 1321 799 Q 1486 937 1651 1075' },
  { id: 'hauz-vasant', from: 'hauz', to: 'vasant', path: 'M 1321 799 Q 1128 922 936 1045' },
  { id: 'hauz-gurugram', from: 'hauz', to: 'gurugram', path: 'M 1321 799 Q 977 983 633 1167' },
];

// Verified Café Micro-Telemetry Nodes scattered across active zones
const CAFE_MICRO_NODES = [
  // Connaught Place Hub (38 Cafés)
  { cx: 1625, cy: 605, r: 4.5 }, { cx: 1670, cy: 620, r: 4.0 }, { cx: 1645, cy: 635, r: 4.2 },
  { cx: 1685, cy: 595, r: 3.8 }, { cx: 1615, cy: 625, r: 4.5 }, { cx: 1660, cy: 580, r: 3.6 },
  { cx: 1635, cy: 575, r: 4.0 }, { cx: 1690, cy: 630, r: 4.2 }, { cx: 1605, cy: 600, r: 3.5 },
  // Hauz Khas Hub (31 Cafés)
  { cx: 1305, cy: 785, r: 4.5 }, { cx: 1340, cy: 810, r: 4.0 }, { cx: 1315, cy: 820, r: 3.8 },
  { cx: 1335, cy: 780, r: 4.2 }, { cx: 1290, cy: 805, r: 3.6 }, { cx: 1350, cy: 795, r: 4.0 },
  // Gurugram Cyber Hub (46 Cafés)
  { cx: 615, cy: 1150, r: 4.8 }, { cx: 655, cy: 1175, r: 4.5 }, { cx: 630, cy: 1195, r: 4.2 },
  { cx: 670, cy: 1155, r: 4.0 }, { cx: 600, cy: 1170, r: 4.5 }, { cx: 645, cy: 1140, r: 3.8 },
  // Saket Spine (26 Cafés)
  { cx: 1635, cy: 1060, r: 4.2 }, { cx: 1670, cy: 1085, r: 4.0 }, { cx: 1640, cy: 1100, r: 3.8 },
  { cx: 1665, cy: 1050, r: 4.5 }, { cx: 1625, cy: 1080, r: 3.6 },
  // Vasant Kunj Spine (18 Cafés)
  { cx: 920, cy: 1030, r: 4.0 }, { cx: 955, cy: 1055, r: 4.2 }, { cx: 930, cy: 1070, r: 3.8 },
  // Kamla Nagar North Campus (24 Cafés)
  { cx: 1665, cy: 325, r: 4.2 }, { cx: 1695, cy: 350, r: 4.0 }, { cx: 1670, cy: 360, r: 3.8 },
  // Rajouri Garden (19 Cafés)
  { cx: 945, cy: 480, r: 4.0 }, { cx: 980, cy: 505, r: 4.2 }, { cx: 955, cy: 515, r: 3.8 },
  // Lajpat Nagar (22 Cafés)
  { cx: 1910, cy: 815, r: 4.2 }, { cx: 1945, cy: 840, r: 4.0 }, { cx: 1920, cy: 850, r: 3.8 },
  // Noida Sector 18 (24 Cafés)
  { cx: 2405, cy: 785, r: 4.2 }, { cx: 2440, cy: 810, r: 4.0 }, { cx: 2415, cy: 825, r: 3.8 },
];

const PRODUCT_DATA: Record<
  ProductType,
  {
    growth: string;
    vsDay: string;
    totalCafes: number;
    weeklyVolume: string;
    topCluster: string;
  }
> = {
  oat: {
    growth: '+18.4%',
    vsDay: 'vs. Day 13',
    totalCafes: 248,
    weeklyVolume: '2,840 L',
    topCluster: 'Connaught Pl.',
  },
  cold: {
    growth: '+24.6%',
    vsDay: 'vs. Day 13',
    totalCafes: 274,
    weeklyVolume: '3,420 L',
    topCluster: 'Gurugram',
  },
  almond: {
    growth: '+14.2%',
    vsDay: 'vs. Day 13',
    totalCafes: 218,
    weeklyVolume: '2,190 L',
    topCluster: 'South Delhi',
  },
};

export function DelhiDemandMap3D() {
  const [product, setProduct] = useState<ProductType>('oat');
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);
  const [hoveredCluster, setHoveredCluster] = useState<string | null>(null);
  const [currentDay, setCurrentDay] = useState<number>(20);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [, startTransition] = useTransition();

  // ─── High-Fidelity SVG ViewBox Pan & Zoom Engine ───
  // Center is in SVG units (0..2752, 0..1536)
  const [zoom, setZoom] = useState<number>(1.0);
  const [center, setCenter] = useState<{ x: number; y: number }>({
    x: MASTER_W / 2,
    y: MASTER_H / 2,
  });
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);

  const viewportRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{
    clientX: number;
    clientY: number;
    centerX: number;
    centerY: number;
  }>({ clientX: 0, clientY: 0, centerX: MASTER_W / 2, centerY: MASTER_H / 2 });

  const zoomRef = useRef<number>(1.0);
  zoomRef.current = zoom;
  const centerRef = useRef<{ x: number; y: number }>({ x: MASTER_W / 2, y: MASTER_H / 2 });
  centerRef.current = center;
  const hoveredClusterRef = useRef<string | null>(null);

  // 21-Day Flight Timer
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentDay((prev) => (prev >= 21 ? 1 : prev + 1));
    }, 450);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Compute Current ViewBox (Clamped to map perimeter)
  const viewBox = useMemo(() => {
    const curZoom = Math.max(1.0, zoom);
    const vbW = MASTER_W / curZoom;
    const vbH = MASTER_H / curZoom;

    // Center boundary clamping
    const minCenterX = vbW / 2;
    const maxCenterX = MASTER_W - vbW / 2;
    const minCenterY = vbH / 2;
    const maxCenterY = MASTER_H - vbH / 2;

    const clampedX = Math.min(maxCenterX, Math.max(minCenterX, center.x));
    const clampedY = Math.min(maxCenterY, Math.max(minCenterY, center.y));

    const vbX = clampedX - vbW / 2;
    const vbY = clampedY - vbH / 2;

    return { x: vbX, y: vbY, w: vbW, h: vbH };
  }, [zoom, center]);

  // ─── Native Wheel Zoom Handler (Centered on Cursor) ───
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const rect = el.getBoundingClientRect();
      const cursorNormX = (e.clientX - rect.left) / rect.width;
      const cursorNormY = (e.clientY - rect.top) / rect.height;

      const prevZoom = zoomRef.current;
      const prevCenter = centerRef.current;

      const prevVbW = MASTER_W / prevZoom;
      const prevVbH = MASTER_H / prevZoom;
      const prevVbX = prevCenter.x - prevVbW / 2;
      const prevVbY = prevCenter.y - prevVbH / 2;

      // Coordinate on SVG map currently under mouse cursor
      const cursorMapX = prevVbX + cursorNormX * prevVbW;
      const cursorMapY = prevVbY + cursorNormY * prevVbH;

      const delta = -e.deltaY;
      const factor = delta > 0 ? 1.15 : 0.86;
      const newZoom = Math.min(2.8, Math.max(1.0, +(prevZoom * factor).toFixed(3)));

      if (Math.abs(newZoom - prevZoom) < 0.005) return;

      setHasInteracted(true);
      setIsTransitioning(false);

      if (newZoom <= 1.02) {
        setZoom(1.0);
        setCenter({ x: MASTER_W / 2, y: MASTER_H / 2 });
        return;
      }

      const newVbW = MASTER_W / newZoom;
      const newVbH = MASTER_H / newZoom;

      // Calculate new center such that (cursorMapX, cursorMapY) remains under cursor
      const newCenterX = cursorMapX + (0.5 - cursorNormX) * newVbW;
      const newCenterY = cursorMapY + (0.5 - cursorNormY) * newVbH;

      setZoom(newZoom);
      setCenter({ x: newCenterX, y: newCenterY });
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // ─── Pointer Drag & 3D Tilt Handlers ───
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('.ddm-ctrl-btn, .ddm-pill-btn, .ddm-pin-badge, button')) {
      return;
    }

    hoveredClusterRef.current = null;
    if (selectedCluster) {
      setSelectedCluster(null);
    }

    setIsDragging(true);
    setIsTransitioning(false);
    setHasInteracted(true);

    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      centerX: center.x,
      centerY: center.y,
    };

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return;

    if (isDragging) {
      const dx = e.clientX - dragStartRef.current.clientX;
      const dy = e.clientY - dragStartRef.current.clientY;

      const curVbW = MASTER_W / zoomRef.current;
      const curVbH = MASTER_H / zoomRef.current;

      // Convert screen pixel delta to SVG map unit delta
      const svgDx = (dx / rect.width) * curVbW;
      const svgDy = (dy / rect.height) * curVbH;

      setCenter({
        x: dragStartRef.current.centerX - svgDx,
        y: dragStartRef.current.centerY - svgDy,
      });
      return;
    }

    // Freeze 3D perspective tilt when hovering over a pin badge for rock-solid stability
    if (hoveredClusterRef.current) return;

    const posX = e.clientX - rect.left;
    const posY = e.clientY - rect.top;

    const normX = (posX - rect.width / 2) / (rect.width / 2);
    const normY = (posY - rect.height / 2) / (rect.height / 2);
    setTilt({
      x: -normY * 2.8,
      y: normX * 2.8,
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  const handlePointerLeave = () => {
    if (!isDragging) {
      setTilt({ x: 0, y: 0 });
    }
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('.ddm-ctrl-btn, .ddm-pin-wrapper, button')) return;
    setHasInteracted(true);
    setIsTransitioning(true);

    if (zoom > 1.25) {
      setZoom(1.0);
      setCenter({ x: MASTER_W / 2, y: MASTER_H / 2 });
    } else {
      const rect = viewportRef.current?.getBoundingClientRect();
      if (!rect) return;
      const cursorNormX = (e.clientX - rect.left) / rect.width;
      const cursorNormY = (e.clientY - rect.top) / rect.height;

      const curVbW = MASTER_W / zoom;
      const curVbH = MASTER_H / zoom;
      const curVbX = center.x - curVbW / 2;
      const curVbY = center.y - curVbH / 2;

      const targetX = curVbX + cursorNormX * curVbW;
      const targetY = curVbY + cursorNormY * curVbH;

      setZoom(1.85);
      setCenter({ x: targetX, y: targetY });
    }
  };

  // ─── Button Zoom & Reset Controls ───
  const handleZoomIn = () => {
    setHasInteracted(true);
    setIsTransitioning(true);
    setZoom((prev) => Math.min(2.8, +(prev + 0.35).toFixed(2)));
  };

  const handleZoomOut = () => {
    setHasInteracted(true);
    setIsTransitioning(true);
    setZoom((prev) => {
      const n = Math.max(1.0, +(prev - 0.35).toFixed(2));
      if (n <= 1.05) setCenter({ x: MASTER_W / 2, y: MASTER_H / 2 });
      return n;
    });
  };

  const handleResetView = () => {
    setHasInteracted(true);
    setIsTransitioning(true);
    setSelectedCluster(null);
    setZoom(1.0);
    setCenter({ x: MASTER_W / 2, y: MASTER_H / 2 });
    setTilt({ x: 0, y: 0 });
  };

  // ─── Cluster Pin Click Handler ───
  const handleClusterClick = (c: ClusterPin, e: React.MouseEvent) => {
    e.stopPropagation();
    setHasInteracted(true);
    setIsTransitioning(true);

    if (selectedCluster === c.id) {
      setSelectedCluster(null);
      setZoom(1.0);
      setCenter({ x: MASTER_W / 2, y: MASTER_H / 2 });
    } else {
      setSelectedCluster(c.id);
      setZoom(1.85);
      setCenter({ x: c.x, y: c.y });
    }
  };

  const cur = PRODUCT_DATA[product];
  const dynamicCafes = Math.round(cur.totalCafes * (0.65 + (currentDay / 21) * 0.35));
  const activeClusterObj = selectedCluster ? CLUSTERS.find((c) => c.id === selectedCluster) : null;

  return (
    <div className="ddm-container">
      <div className="ddm-inner">
        {/* ─── Top Header Bar (Minimal & Sleek) ─── */}
        <header className="ddm-header">
          {/* Left: Live Indicator + Title + Day Badge */}
          <div className="ddm-header-left">
            <span className="ddm-live-indicator" aria-label="Live Telemetry">
              <span className="ddm-live-halo" />
              <span className="ddm-live-core" />
            </span>
            <div className="ddm-header-titles">
              <h3 className="ddm-header-title">
                Café Demand Index <span className="ddm-dot-sep">·</span> Delhi NCR
              </h3>
            </div>
            <span className="ddm-day-chip">Day {currentDay}/21</span>
          </div>

          {/* Right: Interactive Product Selector Pills */}
          <nav className="ddm-pills" aria-label="Product selector">
            <button
              type="button"
              onClick={() => startTransition(() => setProduct('oat'))}
              className={`ddm-pill-btn ${product === 'oat' ? 'is-active' : ''}`}
              aria-pressed={product === 'oat'}
            >
              <span>Oat Milk</span>
            </button>
            <button
              type="button"
              onClick={() => startTransition(() => setProduct('cold'))}
              className={`ddm-pill-btn ${product === 'cold' ? 'is-active' : ''}`}
              aria-pressed={product === 'cold'}
            >
              <span>Cold Brew</span>
            </button>
            <button
              type="button"
              onClick={() => startTransition(() => setProduct('almond'))}
              className={`ddm-pill-btn ${product === 'almond' ? 'is-active' : ''}`}
              aria-pressed={product === 'almond'}
            >
              <span>Almond Milk</span>
            </button>
          </nav>
        </header>

        {/* ─── High-Fidelity SVG Interactive Map Viewport ─── */}
        <div
          ref={viewportRef}
          className={`ddm-map-viewport ${isDragging ? 'is-dragging' : ''}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
          onDoubleClick={handleDoubleClick}
        >
          {/* 3D Perspective Tilt Wrapper */}
          <div
            className="ddm-tilt-wrapper"
            style={{
              width: '100%',
              height: '100%',
              transform: `perspective(1200px) rotateX(${tilt.x.toFixed(2)}deg) rotateY(${tilt.y.toFixed(2)}deg)`,
              transformOrigin: '50% 50%',
              transition: isTransitioning
                ? 'transform 0.52s cubic-bezier(0.16, 1, 0.3, 1)'
                : 'transform 0.12s ease-out',
            }}
          >
            {/* SVG Native ViewBox Map: Infinite vector sharpness & direct device pixel sampling */}
            <svg
              className="ddm-map-svg"
              viewBox={`${viewBox.x.toFixed(1)} ${viewBox.y.toFixed(1)} ${viewBox.w.toFixed(1)} ${viewBox.h.toFixed(1)}`}
              preserveAspectRatio="xMidYMid meet"
              aria-hidden="true"
            >
              <defs>
                <filter id="route-glow-hd" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <radialGradient id="hub-heat-gradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#6B33D3" stopOpacity="0.32" />
                  <stop offset="60%" stopColor="#8B5CF6" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#C4B5FD" stopOpacity="0.0" />
                </radialGradient>
              </defs>

              {/* Master 2752x1536 3D Extruded Cutout Image */}
              <image
                href="/brand/delhi-demand-map-3d-cutout.png"
                width={MASTER_W}
                height={MASTER_H}
                preserveAspectRatio="xMidYMid meet"
              />

              {/* ─── Level 1: Vector Arterial Highways & Expressway Rings (Always Razor Sharp) ─── */}
              <g className="ddm-vector-expressways" opacity="0.65">
                {/* Outer Ring Road Corridor */}
                <ellipse cx="1580" cy="740" rx="440" ry="240" fill="none" stroke="#6B33D3" strokeWidth="2.8" strokeDasharray="9 6" />
                {/* Inner Ring Road Corridor */}
                <ellipse cx="1600" cy="670" rx="270" ry="150" fill="none" stroke="#6B33D3" strokeWidth="3.2" />
                {/* Connaught Place Radial Cones */}
                <circle cx="1651" cy="614" r="34" fill="none" stroke="#6B33D3" strokeWidth="2.8" />
                <circle cx="1651" cy="614" r="68" fill="none" stroke="#8B5CF6" strokeWidth="2.2" strokeDasharray="6 4" />
                <circle cx="1651" cy="614" r="6" fill="#6B33D3" />
                {/* DND Flyway across Yamuna */}
                <path d="M 1926 829 Q 2174 814 2422 799" fill="none" stroke="#7C3AED" strokeWidth="3.2" strokeDasharray="7 5" />
                {/* Delhi-Gurgaon Expressway (NH-48) */}
                <path d="M 1651 614 Q 1142 890 633 1167" fill="none" stroke="#6B33D3" strokeWidth="3.4" strokeDasharray="8 5" />
                {/* Barapullah Elevated */}
                <path d="M 1480 750 Q 1700 780 1926 829" fill="none" stroke="#8B5CF6" strokeWidth="2.8" />
              </g>

              {/* ─── Level 2: Supply Network Corridors & Animated Flowing Particles ─── */}
              <g className="ddm-vector-routes">
                {NETWORK_ROUTES.map((r, i) => {
                  const isRouteActive = selectedCluster && (r.from === selectedCluster || r.to === selectedCluster);
                  return (
                    <g key={r.id}>
                      <path
                        d={r.path}
                        fill="none"
                        stroke={isRouteActive ? '#6B33D3' : 'rgba(107, 51, 211, 0.4)'}
                        strokeWidth={isRouteActive ? '4.2' : '2.4'}
                        strokeDasharray={isRouteActive ? 'none' : '5 4'}
                      />
                      <circle r={isRouteActive ? '6' : '4.5'} fill="#6B33D3" filter="url(#route-glow-hd)">
                        <animateMotion
                          path={r.path}
                          dur={`${3.2 + (i % 3) * 0.8}s`}
                          repeatCount="indefinite"
                        />
                      </circle>
                    </g>
                  );
                })}
              </g>

              {/* ─── Level 3: Individual Active Café Telemetry Nodes (Emerge on Zoom) ─── */}
              <g className="ddm-cafe-nodes" opacity={zoom > 1.25 ? 0.95 : 0.65}>
                {CAFE_MICRO_NODES.map((node, idx) => (
                  <g key={`cafe-${idx}`}>
                    <circle cx={node.cx} cy={node.cy} r={node.r * 1.8} fill="#6B33D3" opacity="0.18" />
                    <circle cx={node.cx} cy={node.cy} r={node.r} fill="#6B33D3" />
                    <circle cx={node.cx} cy={node.cy} r={node.r * 0.45} fill="#ffffff" />
                  </g>
                ))}
              </g>

              {/* ─── Level 4: Progressive Street & Landmark Typography (Crisp Vector Text) ─── */}
              <g
                className="ddm-street-typography"
                opacity={zoom > 1.25 ? 1.0 : 0.75}
                style={{ transition: 'opacity 0.25s ease' }}
              >
                {/* Connaught Place */}
                <text x="1651" y="568" fill="#4C1D95" fontSize="17" fontWeight="800" textAnchor="middle" letterSpacing="1.2">
                  CONNAUGHT PLACE
                </text>
                <text x="1651" y="588" fill="#6B33D3" fontSize="11" fontWeight="700" textAnchor="middle">
                  Rajiv Chowk · Inner Circle · 38 Cafés
                </text>

                {/* Ring Road Labels */}
                <text x="1280" y="728" fill="#64748B" fontSize="12" fontWeight="700" transform="rotate(-14, 1280, 728)">
                  Ring Road (M.G. Marg)
                </text>
                <text x="1600" y="750" fill="#6B33D3" fontSize="11" fontWeight="600" transform="rotate(7, 1600, 750)">
                  Barapullah Elevated Corridor
                </text>
                <text x="1250" y="930" fill="#64748B" fontSize="11.5" fontWeight="700" transform="rotate(-18, 1250, 930)">
                  Outer Ring Road
                </text>

                {/* Hauz Khas */}
                <text x="1321" y="842" fill="#1E293B" fontSize="13.5" fontWeight="750" textAnchor="middle">
                  Hauz Khas Village
                </text>
                <text x="1321" y="858" fill="#6B33D3" fontSize="10.5" fontWeight="600" textAnchor="middle">
                  Aurobindo Marg · 31 Cafés
                </text>

                {/* Gurugram Cyber City */}
                <text x="633" y="1215" fill="#4C1D95" fontSize="16" fontWeight="800" textAnchor="middle" letterSpacing="1">
                  DLF CYBER CITY
                </text>
                <text x="633" y="1233" fill="#6B33D3" fontSize="11" fontWeight="700" textAnchor="middle">
                  Cyber Hub · NH-48 Direct · 46 Cafés
                </text>

                {/* Saket */}
                <text x="1651" y="1120" fill="#1E293B" fontSize="13" fontWeight="750" textAnchor="middle">
                  Select Citywalk · Saket
                </text>
                <text x="1651" y="1135" fill="#6B33D3" fontSize="10" fontWeight="600" textAnchor="middle">
                  Press Enclave Marg · 26 Cafés
                </text>

                {/* Vasant Kunj */}
                <text x="936" y="1090" fill="#1E293B" fontSize="12.5" fontWeight="750" textAnchor="middle">
                  Vasant Kunj Spine
                </text>
                <text x="936" y="1105" fill="#6B33D3" fontSize="10" fontWeight="600" textAnchor="middle">
                  Nelson Mandela Marg
                </text>

                {/* Noida Sector 18 */}
                <text x="2422" y="845" fill="#1E293B" fontSize="13" fontWeight="750" textAnchor="middle">
                  Noida Sector 18 & Film City
                </text>
                <text x="2422" y="860" fill="#6B33D3" fontSize="10" fontWeight="600" textAnchor="middle">
                  DND Corridor · 24 Cafés
                </text>
              </g>
            </svg>

            {/* ─── Synchronized Screen-Space Hovering Little Cards (Zero Blur, Constant Crisp Size) ─── */}
            <div className="ddm-pins-layer" aria-label="Geographic demand cluster pins">
              {CLUSTERS.map((c) => {
                const isSelected = selectedCluster === c.id;

                // Project SVG map coordinates (0..2752, 0..1536) directly into screen viewport percentage
                const screenX = ((c.x - viewBox.x) / viewBox.w) * 100;
                const screenY = ((c.y - viewBox.y) / viewBox.h) * 100;

                // Hide pins if panned completely outside viewport
                const isVisible = screenX >= -12 && screenX <= 112 && screenY >= -12 && screenY <= 112;

                return (
                  <div
                    key={c.id}
                    style={{
                      left: `${screenX.toFixed(2)}%`,
                      top: `${screenY.toFixed(2)}%`,
                      opacity: isVisible ? 1 : 0,
                      pointerEvents: isVisible ? 'auto' : 'none',
                    }}
                    className={`ddm-pin-wrapper ${isSelected ? 'is-selected' : ''}`}
                    onMouseEnter={() => {
                      hoveredClusterRef.current = c.id;
                      setHoveredCluster(c.id);
                    }}
                    onMouseLeave={() => {
                      if (hoveredClusterRef.current === c.id) {
                        hoveredClusterRef.current = null;
                      }
                      setHoveredCluster(null);
                    }}
                    onClick={(e) => handleClusterClick(c, e)}
                  >
                    {/* Pulsing Radar Ring & Ground Dot */}
                    <div className="ddm-pin-radar">
                      <span className="ddm-pin-radar-ring" />
                      <span className="ddm-pin-radar-dot" />
                    </div>

                    {/* Hovering Little Card Badge */}
                    <div className="ddm-pin-badge">
                      <div className="ddm-pin-eq" aria-hidden="true">
                        <span />
                        <span />
                        <span />
                      </div>
                      <span className="ddm-pin-name">{c.name}</span>
                      <span className="ddm-pin-growth">↑ {c.growth[product]}</span>
                    </div>

                    {/* Stem pointing to cluster center */}
                    <div className="ddm-pin-stem" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* ─── Floating Glass Zoom Controls (+, %, -, Reset) ─── */}
          <aside className="ddm-map-controls" aria-label="Interactive map zoom controls">
            <button
              type="button"
              className="ddm-ctrl-btn"
              onClick={handleZoomIn}
              title="Zoom in (+)"
              aria-label="Zoom in"
            >
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 4a1 1 0 011 1v4h4a1 1 0 110 2h-4v4a1 1 0 11-2 0v-4H5a1 1 0 110-2h4V5a1 1 0 011-1z" />
              </svg>
            </button>
            <button
              type="button"
              className="ddm-ctrl-btn ddm-ctrl-badge"
              onClick={handleResetView}
              title="Reset zoom to 100%"
              aria-label="Reset zoom level"
            >
              <span>{Math.round(zoom * 100)}%</span>
            </button>
            <button
              type="button"
              className="ddm-ctrl-btn"
              onClick={handleZoomOut}
              title="Zoom out (-)"
              aria-label="Zoom out"
            >
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M4 10a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1z" />
              </svg>
            </button>
            {(zoom > 1.05 || center.x !== MASTER_W / 2 || center.y !== MASTER_H / 2 || selectedCluster !== null) && (
              <button
                type="button"
                className="ddm-ctrl-btn ddm-ctrl-reset"
                onClick={handleResetView}
                title="Reset map view"
                aria-label="Reset map view"
              >
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </aside>

          {/* ─── Interactive Navigation Hint ─── */}
          <div className={`ddm-map-hint ${hasInteracted ? 'is-faded' : ''}`}>
            <span>Drag to pan · Scroll to zoom · Click pins to focus</span>
          </div>
        </div>

        {/* ─── Bottom Scrubber Bar & Telemetry (Minimal & Sleek) ─── */}
        <footer className="ddm-bottom-bar">
          {/* Left: Scrubber Controls + Simulation Play Button */}
          <div className="ddm-scrubber-group">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className={`ddm-play-btn ${isPlaying ? 'is-playing' : ''}`}
              title={isPlaying ? 'Pause simulation' : 'Auto-play 21-day timeline'}
              aria-label={isPlaying ? 'Pause telemetry playback' : 'Play telemetry playback'}
            >
              {isPlaying ? (
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="5" width="4" height="14" rx="1" />
                  <rect x="14" y="5" width="4" height="14" rx="1" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="7 5 19 12 7 19 7 5" />
                </svg>
              )}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>

            <span className="ddm-day-label">
              Day <b>{String(currentDay).padStart(2, '0')}</b>
            </span>

            {/* 21 Scrubber Segment Pills */}
            <div className="ddm-scrubber-tracks">
              {Array.from({ length: 21 }, (_, i) => {
                const dayNum = i + 1;
                const isPast = dayNum <= currentDay;
                const isCur = dayNum === currentDay;
                return (
                  <button
                    key={dayNum}
                    type="button"
                    title={`Day ${dayNum} of 21`}
                    onClick={() => {
                      setIsPlaying(false);
                      setCurrentDay(dayNum);
                    }}
                    onMouseEnter={() => {
                      if (!isPlaying) setCurrentDay(dayNum);
                    }}
                    className={`ddm-scrubber-pill ${isCur ? 'is-current' : isPast ? 'is-past' : ''}`}
                    aria-label={`Jump to Day ${dayNum}`}
                  />
                );
              })}
            </div>
          </div>

          {/* Right: Minimal Live Telemetry */}
          <div className="ddm-bottom-stats">
            <div className="ddm-bottom-stat">
              <span className="ddm-stat-bullet">●</span>
              <span className="ddm-bottom-stat-val">{dynamicCafes}</span>
              <span className="ddm-bottom-stat-sub">Cafés</span>
            </div>

            <div className="ddm-bottom-divider" />

            <div className="ddm-bottom-stat">
              <span className="ddm-stat-bullet" style={{ color: '#6B33D3' }}>
                ↑
              </span>
              <span className="ddm-bottom-stat-val">{cur.growth}</span>
            </div>

            <div className="ddm-bottom-divider" />

            <div className="ddm-bottom-stat">
              <span className="ddm-stat-bullet">📍</span>
              <span className="ddm-bottom-stat-val">
                {activeClusterObj ? activeClusterObj.name : '9 Zones'}
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default DelhiDemandMap3D;
