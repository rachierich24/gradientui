'use client';

import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { gsap } from 'gsap';
import { openContactSalesModal } from '@/components/ContactSalesModal';

export interface CardNavLink {
  label: string;
  href: string;
  description?: string;
  badge?: string;
  accent?: string;
  icon?: string;
  ariaLabel?: string;
}

export interface CardNavItem {
  label: string;
  category?: string;
  description?: string;
  bgColor?: string;
  textColor?: string;
  links: CardNavLink[];
  featured?: {
    tag: string;
    title: string;
    desc: string;
    meta?: string;
    href?: string;
  };
}

export interface CardNavProps {
  logo?: React.ReactNode | string;
  logoAlt?: string;
  items?: CardNavItem[];
  className?: string;
  ease?: string;
  baseColor?: string;
  menuColor?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
  ctaText?: string;
  onCtaClick?: () => void;
}

// ─── DEFAULT GRABBIT NAVIGATION DATA ─────────────────────────────────────────
export const defaultGrabbitNavItems: CardNavItem[] = [
  {
    label: 'Product',
    category: 'PRODUCT',
    description: 'The real-time operating system for café procurement and routing',
    bgColor: '#FFFFFF',
    textColor: '#0F172A',
    links: [
      {
        label: 'Ordering',
        description: 'Multi-vendor basket with instant split dispatch',
        href: '/features#ordering',
        badge: 'Live',
        icon: 'cart',
      },
      {
        label: 'Sourcing',
        description: 'Browse 340+ verified specialty roasters & suppliers',
        href: '/features#sourcing',
        icon: 'search',
      },
      {
        label: 'Inventory',
        description: 'Live par alerts, batch expiry & zero-stockout auto-reorder',
        href: '/features#inventory',
        icon: 'box',
      },
      {
        label: 'Analytics',
        description: 'Consumption forecast, price benchmarks & margin tracking',
        href: '/features#analytics',
        badge: 'v2.4',
        icon: 'chart',
      },
    ],
    featured: {
      tag: 'CORE ENGINE',
      title: 'Grabbit Signal Router',
      desc: 'Sub-second order arbitration across cafes, local hubs, and primary roasters.',
      meta: '2,633 signals routed today · 14ms latency',
      href: '#ecosystem',
    },
  },
  {
    label: 'Solutions',
    category: 'SOLUTIONS',
    description: 'Tailored workflows for each participant in India’s café economy',
    bgColor: '#FFFFFF',
    textColor: '#0F172A',
    links: [
      {
        label: 'For Cafés',
        description: 'Source smarter. Order faster. Single-click multi-vendor ordering.',
        href: '#for-cafes',
        accent: '#E03E3E',
        badge: '1,240+ Cafés',
        icon: 'cafe',
      },
      {
        label: 'For Suppliers',
        description: 'Turn demand into fulfillment. Automated purchase orders & instant payout.',
        href: '#for-suppliers',
        accent: '#22C55E',
        badge: '340+ Suppliers',
        icon: 'supplier',
      },
      {
        label: 'For Brands',
        description: 'See demand before it moves. Direct consumption telemetry & retail coverage.',
        href: '#for-brands',
        accent: '#6D28D9',
        badge: '47 Trials',
        icon: 'brand',
      },
    ],
    featured: {
      tag: 'TRI-PILLAR NETWORK',
      title: 'Unified Ecosystem Sync',
      desc: 'Demand from cafes instantly triggers supplier routes and brand consumption insights.',
      meta: 'Cafés ↔ Suppliers ↔ Brands',
      href: '#ecosystem',
    },
  },
  {
    label: 'Resources',
    category: 'RESOURCES',
    description: 'Guides, architecture breakdowns, and ecosystem documentation',
    bgColor: '#FFFFFF',
    textColor: '#0F172A',
    links: [
      {
        label: 'How Grabbit Works',
        description: 'Deep dive into orthogonal routing and automated trade arbitration',
        href: '#ecosystem',
        icon: 'flow',
      },
      {
        label: 'Customer Stories',
        description: 'How top specialty café chains reduced purchasing overhead by 22%',
        href: '/about',
        icon: 'quote',
      },
      {
        label: 'Supply Insights',
        description: 'Weekly commodity updates on green beans, packaging, and oat milk tariffs',
        href: '/faq',
        badge: 'Weekly',
        icon: 'sparkle',
      },
      {
        label: 'Help & Documentation',
        description: 'POS & ERP integrations, webhook guides, and dedicated support',
        href: '/faq',
        icon: 'help',
      },
    ],
    featured: {
      tag: 'DOCUMENTATION',
      title: 'Developer & ERP Connectors',
      desc: 'Out-of-the-box syncing with Petpooja, Posist, Tally, and Shadowfax.',
      meta: 'REST APIs & Webhooks',
      href: '/features',
    },
  },
  {
    label: 'Company',
    category: 'COMPANY',
    description: 'Our mission to modernize India’s café beverage supply infrastructure',
    bgColor: '#FFFFFF',
    textColor: '#0F172A',
    links: [
      {
        label: 'About Grabbit',
        description: 'The story behind the team building India’s specialty café highway',
        href: '/about',
        icon: 'flag',
      },
      {
        label: 'Careers',
        description: 'Join our engineering, operations, and merchant growth teams',
        href: '/careers',
        badge: "We're hiring",
        icon: 'user',
      },
      {
        label: 'Contact',
        description: 'Direct inquiry for enterprise roaster networks and café chains',
        href: '/contact',
        icon: 'mail',
      },
      {
        label: 'Partners & Ecosystem',
        description: 'Hardware, packaging, and logistics integration partners',
        href: '/features',
        icon: 'shield',
      },
    ],
    featured: {
      tag: 'MISSION',
      title: 'Powering 10,000+ Independent Cafés',
      desc: 'Built in Bengaluru with zero-downtime architecture for fast-growing hospitality brands.',
      meta: 'Unified Nexgrade Pvt Ltd',
      href: '/about',
    },
  },
];

// ─── SUB-COMPONENTS & ICONS ──────────────────────────────────────────────────
function NavIcon({ type, accent }: { type?: string; accent?: string }) {
  const color = accent || '#475569';
  switch (type) {
    case 'cart':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" />
          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
        </svg>
      );
    case 'search':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
        </svg>
      );
    case 'box':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      );
    case 'chart':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" />
        </svg>
      );
    case 'cafe':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={accent || '#E03E3E'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
          <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
          <line x1="6" y1="2" x2="6" y2="4" /><line x1="10" y1="2" x2="10" y2="4" /><line x1="14" y1="2" x2="14" y2="4" />
        </svg>
      );
    case 'supplier':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={accent || '#22C55E'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="3" width="15" height="13" />
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
          <circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
      );
    case 'brand':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={accent || '#6D28D9'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
          <path d="M2 12h20" />
        </svg>
      );
    case 'flow':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="6" height="6" rx="1" /><rect x="15" y="15" width="6" height="6" rx="1" />
          <path d="M6 9v3a3 3 0 0 0 3 3h6" />
        </svg>
      );
    case 'quote':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
          <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
        </svg>
      );
    case 'sparkle':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
        </svg>
      );
    case 'flag':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" />
        </svg>
      );
    case 'user':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
        </svg>
      );
    case 'mail':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      );
    case 'shield':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
        </svg>
      );
    default:
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><path d="m10 8 4 4-4 4" />
        </svg>
      );
  }
}

// ─── PRODUCT PREVIEW WIDGET (Linear / Attio style SaaS mini-engine) ─────────
function ProductPreviewCard({ item }: { item: CardNavItem }) {
  if (item.label === 'Product') {
    return (
      <div className="card-nav-preview-box">
        <div className="preview-top-bar">
          <div className="preview-status-pill">
            <span className="preview-live-dot" />
            <span className="preview-live-text">Routing Active</span>
          </div>
          <span className="preview-latency-badge">14ms latency</span>
        </div>

        <div className="preview-card-canvas">
          <div className="preview-stat-grid">
            <div className="preview-stat-cell">
              <span className="preview-stat-label">SIGNALS ROUTED</span>
              <span className="preview-stat-value">2,633</span>
            </div>
            <div className="preview-stat-cell">
              <span className="preview-stat-label">FILL RATE</span>
              <span className="preview-stat-value text-emerald">99.8%</span>
            </div>
          </div>

          <div className="preview-order-row">
            <div className="preview-order-icon">
              <NavIcon type="cart" accent="#0F172A" />
            </div>
            <div className="preview-order-info">
              <div className="preview-order-title">
                <span>Order #G-842</span>
                <span className="preview-order-tag">Dispatched</span>
              </div>
              <div className="preview-order-sub">Araku Micro-Lot · 12kg · ₹14,200</div>
            </div>
          </div>

          <div className="preview-ticker-footer">
            <span className="preview-ticker-dot" />
            <span>Café Demand ➔ Supplier Hub ➔ Verified</span>
          </div>
        </div>
      </div>
    );
  }

  if (item.label === 'Solutions') {
    return (
      <div className="card-nav-preview-box">
        <div className="preview-top-bar">
          <div className="preview-status-pill">
            <span className="preview-live-dot pulse-purple" />
            <span className="preview-live-text">Tri-Pillar Graph</span>
          </div>
          <span className="preview-latency-badge">Active Sync</span>
        </div>

        <div className="preview-card-canvas">
          <div className="preview-nodes-cluster">
            <div className="preview-node node-cafe">
              <span className="node-port red-port" />
              <span className="node-title">1,240 Cafés</span>
              <span className="node-sub">Demand signals</span>
            </div>
            <div className="preview-node-connector">
              <span className="connector-line" />
              <span className="connector-pill">grabbit engine</span>
            </div>
            <div className="preview-nodes-bottom">
              <div className="preview-node node-supplier">
                <span className="node-port green-port" />
                <span className="node-title">340 Suppliers</span>
                <span className="node-sub">Fulfillment</span>
              </div>
              <div className="preview-node node-brand">
                <span className="node-port purple-port" />
                <span className="node-title">47 Brands</span>
                <span className="node-sub">Intelligence</span>
              </div>
            </div>
          </div>
          <div className="preview-ticker-footer">
            <span>Zero intermediary markup · Direct settlements</span>
          </div>
        </div>
      </div>
    );
  }

  // Fallback for Resources and Company
  return (
    <div className="card-nav-preview-box preview-featured-panel">
      <div className="featured-panel-header">
        <span className="featured-panel-tag">{item.featured?.tag || 'DISCOVER'}</span>
        <span className="featured-panel-status">● Live Network</span>
      </div>
      <h4 className="featured-panel-title">{item.featured?.title}</h4>
      <p className="featured-panel-desc">{item.featured?.desc}</p>
      <div className="featured-panel-meta">
        <span>{item.featured?.meta}</span>
      </div>
      {item.featured?.href && (
        <a href={item.featured.href} className="featured-panel-link">
          Explore architecture ➔
        </a>
      )}
    </div>
  );
}

// ─── MAIN REACT BITS CARDNAV COMPONENT ───────────────────────────────────────
export function CardNav({
  logo,
  logoAlt = 'Grabbit',
  items = defaultGrabbitNavItems,
  className = '',
  ease = 'power3.out',
  baseColor,
  menuColor = '#0F172A',
  buttonBgColor = '#18181B',
  buttonTextColor = '#FFFFFF',
  ctaText = 'Get Started',
  onCtaClick,
}: CardNavProps) {
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const activeIndexRef = useRef<number | null>(null);
  const prevIndexRef = useRef<number | null>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const navContainerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Timers for hover intent
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Handle scroll threshold
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cancel any pending close timer
  const cancelClose = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  // Close dropdown with GSAP fade-out
  const closeDropdown = useCallback(() => {
    if (dropdownRef.current && activeIndexRef.current !== null) {
      activeIndexRef.current = null;
      gsap.killTweensOf(dropdownRef.current);
      gsap.to(dropdownRef.current, {
        opacity: 0,
        y: -6,
        scale: 0.985,
        duration: 0.16,
        ease: 'power2.in',
        onComplete: () => {
          setActiveItemIndex(null);
          prevIndexRef.current = null;
          if (dropdownRef.current) {
            dropdownRef.current.style.display = 'none';
            dropdownRef.current.style.visibility = 'hidden';
            dropdownRef.current.style.pointerEvents = 'none';
            dropdownRef.current.style.height = 'auto';
          }
        },
      });
    } else {
      activeIndexRef.current = null;
      setActiveItemIndex(null);
      prevIndexRef.current = null;
      if (dropdownRef.current) {
        dropdownRef.current.style.display = 'none';
        dropdownRef.current.style.visibility = 'hidden';
        dropdownRef.current.style.pointerEvents = 'none';
        dropdownRef.current.style.height = 'auto';
      }
    }
  }, []);

  // Schedule close timer (hover-intent delay: 190ms)
  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimerRef.current = setTimeout(() => {
      closeDropdown();
    }, 190);
  }, [cancelClose, closeDropdown]);

  // Open dropdown with GSAP animation
  const openDropdown = useCallback((index: number) => {
    cancelClose();
    activeIndexRef.current = index;
    prevIndexRef.current = index;
    setActiveItemIndex(index);

    // Initial panel setup
    items.forEach((_, i) => {
      const p = panelRefs.current[i];
      if (p) {
        if (i === index) {
          p.style.visibility = 'visible';
          p.style.pointerEvents = 'auto';
          gsap.set(p, { opacity: 1, x: 0 });
        } else {
          p.style.visibility = 'hidden';
          p.style.pointerEvents = 'none';
          gsap.set(p, { opacity: 0, x: 0 });
        }
      }
    });

    if (dropdownRef.current) {
      dropdownRef.current.style.display = 'block';
      dropdownRef.current.style.visibility = 'visible';
      dropdownRef.current.style.pointerEvents = 'auto';
      dropdownRef.current.style.height = 'auto';
      gsap.killTweensOf(dropdownRef.current);

      const activeP = panelRefs.current[index];

      gsap.fromTo(
        dropdownRef.current,
        {
          opacity: 0,
          y: -8,
          scale: 0.985,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.24,
          ease: ease || 'power3.out',
          onComplete: () => {
            if (dropdownRef.current) dropdownRef.current.style.height = 'auto';
          },
        }
      );

      // Micro stagger entrance for links
      if (activeP) {
        const links = activeP.querySelectorAll('.card-nav-item-link');
        if (links.length) {
          gsap.fromTo(
            links,
            { opacity: 0, y: 6 },
            { opacity: 1, y: 0, duration: 0.22, stagger: 0.02, ease: 'power2.out', delay: 0.03 }
          );
        }
      }
    }
  }, [cancelClose, ease, items]);

  // Switch between menu items with direction-aware glide & container morphing
  const switchItem = useCallback((newIndex: number) => {
    cancelClose();
    const prevIndex = prevIndexRef.current;
    if (prevIndex === newIndex) return;

    if (prevIndex === null || activeItemIndex === null) {
      openDropdown(newIndex);
      return;
    }

    const direction = newIndex > prevIndex ? 1 : -1;
    prevIndexRef.current = newIndex;
    setActiveItemIndex(newIndex);

    const outgoingPanel = panelRefs.current[prevIndex];
    const incomingPanel = panelRefs.current[newIndex];

    if (outgoingPanel && incomingPanel) {
      // Outgoing panel exits in opposite direction
      gsap.killTweensOf(outgoingPanel);
      gsap.to(outgoingPanel, {
        opacity: 0,
        x: -direction * 22,
        duration: 0.18,
        ease: 'power2.inOut',
        onComplete: () => {
          outgoingPanel.style.visibility = 'hidden';
          outgoingPanel.style.pointerEvents = 'none';
          gsap.set(outgoingPanel, { x: 0 });
        },
      });

      // Incoming panel enters from current direction
      incomingPanel.style.visibility = 'visible';
      incomingPanel.style.pointerEvents = 'auto';
      gsap.killTweensOf(incomingPanel);
      gsap.fromTo(
        incomingPanel,
        { opacity: 0, x: direction * 24 },
        { opacity: 1, x: 0, duration: 0.26, ease: 'power3.out' }
      );

      // Smooth stagger on links in incoming panel
      const links = incomingPanel.querySelectorAll('.card-nav-item-link');
      if (links.length) {
        gsap.fromTo(
          links,
          { opacity: 0, x: direction * 10, y: 4 },
          { opacity: 1, x: 0, y: 0, duration: 0.22, stagger: 0.02, ease: 'power2.out', delay: 0.03 }
        );
      }

      // Smooth micro-scale on preview card
      const preview = incomingPanel.querySelector('.card-nav-preview-box');
      if (preview) {
        gsap.fromTo(
          preview,
          { opacity: 0, scale: 0.97, x: direction * 12 },
          { opacity: 1, scale: 1, x: 0, duration: 0.26, ease: 'power3.out', delay: 0.02 }
        );
      }

      // Smooth height interpolation of the outer container
      if (dropdownRef.current) {
        const targetHeight = incomingPanel.offsetHeight;
        if (targetHeight > 0) {
          gsap.to(dropdownRef.current, {
            height: targetHeight,
            duration: 0.26,
            ease: 'power3.out',
            onComplete: () => {
              if (dropdownRef.current) dropdownRef.current.style.height = 'auto';
            },
          });
        }
      }
    }
  }, [activeItemIndex, cancelClose, openDropdown]);

  // Hover handlers for top nav item buttons with hover intent (80ms open delay)
  const handleButtonMouseEnter = (index: number) => {
    cancelClose();
    if (activeItemIndex !== null) {
      // Already open: switch immediately without delay
      switchItem(index);
    } else {
      if (openTimerRef.current) clearTimeout(openTimerRef.current);
      openTimerRef.current = setTimeout(() => {
        openDropdown(index);
      }, 85);
    }
  };

  const handleButtonMouseLeave = () => {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    scheduleClose();
  };

  // Keyboard navigation support
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (activeItemIndex === index) {
        closeDropdown();
      } else {
        openDropdown(index);
      }
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = (index + 1) % items.length;
      switchItem(nextIndex);
      const nextBtn = document.getElementById(`card-nav-tab-${nextIndex}`);
      nextBtn?.focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIndex = (index - 1 + items.length) % items.length;
      switchItem(prevIndex);
      const prevBtn = document.getElementById(`card-nav-tab-${prevIndex}`);
      prevBtn?.focus();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (activeItemIndex !== index) {
        openDropdown(index);
      }
      setTimeout(() => {
        const firstLink = dropdownRef.current?.querySelector<HTMLAnchorElement>('.card-nav-item-link');
        firstLink?.focus();
      }, 50);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeDropdown();
    }
  };

  // Mobile menu toggle animation
  const toggleMobileMenu = () => {
    const willOpen = !isMobileOpen;
    setIsMobileOpen(willOpen);
    if (mobileMenuRef.current) {
      if (willOpen) {
        gsap.fromTo(
          mobileMenuRef.current,
          { height: 0, opacity: 0 },
          { height: 'auto', opacity: 1, duration: 0.3, ease: 'power3.out' }
        );
      } else {
        gsap.to(mobileMenuRef.current, {
          height: 0,
          opacity: 0,
          duration: 0.22,
          ease: 'power3.in',
        });
      }
    }
  };

  const handleCta = (e: React.MouseEvent) => {
    e.preventDefault();
    closeDropdown();
    setIsMobileOpen(false);
    if (onCtaClick) {
      onCtaClick();
    } else {
      openContactSalesModal();
    }
  };

  const activeItem = activeItemIndex !== null ? items[activeItemIndex] : null;

  return (
    <header
      className={`card-nav-header ${isScrolled ? 'is-scrolled' : ''} ${className}`}
      ref={navContainerRef}
    >
      <div className="card-nav-container">
        {/* React Bits CardNav Core Bar */}
        <nav
          className="card-nav"
          style={baseColor ? { backgroundColor: baseColor } : undefined}
          aria-label="Main Navigation"
        >
          <div className="card-nav-top">
            {/* Left: Brand / Logo */}
            <div className="card-nav-brand-wrap">
              <a href="/" className="card-nav-brand" aria-label="Grabbit Home">
                {typeof logo === 'string' ? (
                  <img src={logo} alt={logoAlt} className="card-nav-logo-img" />
                ) : logo ? (
                  logo
                ) : (
                  <div className="card-nav-brand-flex">
                    <span className="card-nav-brand-mark">G</span>
                    <span className="card-nav-brand-name">grabbit</span>
                  </div>
                )}
              </a>
            </div>

            {/* Desktop Navigation Links (Always Visible on Desktop) */}
            <div className="card-nav-desktop-tabs" role="tablist">
              {items.map((item, idx) => {
                const isActive = activeItemIndex === idx;
                return (
                  <div
                    key={item.label}
                    className="card-nav-tab-wrapper"
                    onMouseEnter={() => handleButtonMouseEnter(idx)}
                    onMouseLeave={handleButtonMouseLeave}
                  >
                    <button
                      id={`card-nav-tab-${idx}`}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      aria-expanded={isActive}
                      aria-controls="card-nav-mega-dropdown"
                      className={`card-nav-tab-btn ${isActive ? 'is-active' : ''}`}
                      onFocus={() => handleButtonMouseEnter(idx)}
                      onBlur={handleButtonMouseLeave}
                      onKeyDown={(e) => handleKeyDown(e, idx)}
                    >
                      <span>{item.label}</span>
                      <svg
                        className={`card-nav-tab-chevron ${isActive ? 'is-flipped' : ''}`}
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Right: CTA Button & Mobile Hamburger */}
            <div className="card-nav-actions">
              <a href="/login" className="card-nav-login-link">
                Log in
              </a>
              <button
                type="button"
                className="card-nav-cta-button"
                style={{ backgroundColor: buttonBgColor, color: buttonTextColor }}
                onClick={handleCta}
              >
                {ctaText}
              </button>

              {/* React Bits Mobile Hamburger (Restored for <= 768px) */}
              <div
                className={`hamburger-menu ${isMobileOpen ? 'open' : ''}`}
                onClick={toggleMobileMenu}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleMobileMenu();
                  }
                }}
                role="button"
                aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMobileOpen}
                tabIndex={0}
                style={{ color: menuColor }}
              >
                <div className="hamburger-line" />
                <div className="hamburger-line" />
              </div>
            </div>
          </div>

          {/* SHARED CONTEXTUAL MEGA-MENU DROPDOWN SURFACE (DESKTOP) */}
          <div
            id="card-nav-mega-dropdown"
            ref={dropdownRef}
            className={`card-nav-dropdown ${activeItemIndex !== null ? 'is-open' : ''}`}
            style={{ display: activeItemIndex !== null ? 'block' : 'none' }}
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
            aria-hidden={activeItemIndex === null}
          >
            <div className="card-nav-panels-container">
              {items.map((cat, idx) => (
                <div
                  key={cat.label}
                  ref={(el) => { panelRefs.current[idx] = el; }}
                  className={`card-nav-panel ${activeItemIndex === idx ? 'is-active' : ''}`}
                  aria-hidden={activeItemIndex !== idx}
                >
                  <div className="card-nav-dropdown-inner">
                    {/* Left Column: Category Info & Structured Links */}
                    <div className="card-nav-links-col">
                      <div className="card-nav-col-header">
                        <span className="card-nav-col-badge">{cat.category || cat.label}</span>
                        <p className="card-nav-col-desc">{cat.description}</p>
                      </div>

                      <div className="card-nav-grid-links">
                        {cat.links.map((link) => (
                          <a
                            key={link.label}
                            href={link.href}
                            className="card-nav-item-link"
                            onClick={(e) => {
                              if (link.href.startsWith('#')) {
                                const target = document.querySelector(link.href);
                                if (target) {
                                  e.preventDefault();
                                  closeDropdown();
                                  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }
                              }
                            }}
                          >
                            <div
                              className="card-nav-link-icon-wrap"
                              style={link.accent ? { backgroundColor: `${link.accent}12`, borderColor: `${link.accent}30` } : {}}
                            >
                              <NavIcon type={link.icon} accent={link.accent} />
                            </div>

                            <div className="card-nav-link-texts">
                              <div className="card-nav-link-row">
                                <span className="card-nav-link-title" style={link.accent ? { color: link.accent } : {}}>
                                  {link.label}
                                </span>
                                {link.badge && (
                                  <span
                                    className="card-nav-link-pill"
                                    style={link.accent ? { color: link.accent, backgroundColor: `${link.accent}15` } : {}}
                                  >
                                    {link.badge}
                                  </span>
                                )}
                              </div>
                              {link.description && (
                                <p className="card-nav-link-caption">{link.description}</p>
                              )}
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>

                    {/* Right Column: Live Interactive SaaS Preview */}
                    <div className="card-nav-preview-col">
                      <ProductPreviewCard item={cat} />
                    </div>
                  </div>

                  {/* Sub-bar / Proof strip at base of mega-menu */}
                  <div className="card-nav-bottom-strip">
                    <div className="bottom-strip-item">
                      <span className="pulse-indicator" />
                      <span>Live B2B Route: Bangalore · Mumbai · Delhi NCR · Hyderabad</span>
                    </div>
                    <div className="bottom-strip-meta">
                      <a
                        href="#contact-sales"
                        className="bottom-strip-link"
                        onClick={(e) => {
                          e.preventDefault();
                          closeDropdown();
                          openContactSalesModal();
                        }}
                      >
                        Request Platform Demo ➔
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </nav>

        {/* MOBILE MENU ACCORDION DRAWER (max-width: 768px) */}
        <div ref={mobileMenuRef} className={`card-nav-mobile-drawer ${isMobileOpen ? 'is-open' : ''}`}>
          <div className="card-nav-mobile-inner">
            {items.map((cat) => (
              <div key={cat.label} className="mobile-drawer-section">
                <span className="mobile-section-heading">{cat.label}</span>
                <div className="mobile-links-list">
                  {cat.links.map((lk) => (
                    <a
                      key={lk.label}
                      href={lk.href}
                      className="mobile-link-item"
                      onClick={() => setIsMobileOpen(false)}
                    >
                      <span className="mobile-link-icon">
                        <NavIcon type={lk.icon} accent={lk.accent} />
                      </span>
                      <div className="mobile-link-copy">
                        <span className="mobile-link-name">{lk.label}</span>
                        {lk.description && <span className="mobile-link-sub">{lk.description}</span>}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ))}

            <div className="mobile-drawer-footer">
              <a href="/login" className="mobile-login-btn" onClick={() => setIsMobileOpen(false)}>
                Log in
              </a>
              <button type="button" className="mobile-cta-btn" onClick={handleCta}>
                {ctaText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default CardNav;
