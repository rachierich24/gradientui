'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BorderBeam } from '@/components/ui/border-beam';

interface SupplierNavbarProps {
  onJoinClick?: () => void;
}

export function SupplierNavbar({ onJoinClick }: SupplierNavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sup-navbar ${isScrolled ? 'is-scrolled' : ''}`}>
      <div className="sup-container sup-nav-inner">
        {/* Left: Gradient Logo + Supplier Portal Tag */}
        <Link href="/supplier" className="sup-logo-group" aria-label="Gradient Supplier Portal">
          <div className="sup-logo-mark" aria-hidden="true">G</div>
          <div className="sup-logo-text">
            <span>Gradient</span>
            <span className="sup-badge-portal">Supplier Portal</span>
          </div>
        </Link>

        {/* Center: Clean Marketing Links */}
        <nav aria-label="Supplier Portal Navigation">
          <ul className="sup-nav-links">
            <li>
              <a href="#benefits" className="sup-nav-link">
                Platform
              </a>
            </li>
            <li>
              <a href="#workflow" className="sup-nav-link">
                How it works
              </a>
            </li>
            <li>
              <a href="#workspace" className="sup-nav-link">
                Features
              </a>
            </li>
            <li>
              <a href="#faq" className="sup-nav-link">
                Resources
              </a>
            </li>
          </ul>
        </nav>

        {/* Right: Log in & Supplier CTA */}
        <div className="sup-nav-right">
          <Link href="/login" className="sup-btn-login">
            Log in
          </Link>
          <a
            href="#cta"
            className="sup-btn-cta"
            onClick={(e) => {
              if (onJoinClick) {
                e.preventDefault();
                onJoinClick();
              }
            }}
          >
            <BorderBeam
              size={42}
              duration={4}
              borderWidth={1.5}
              colorFrom="#86efac"
              colorTo="#ffffff"
            />
            <span>Join as a Supplier</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
        </div>
      </div>
    </header>
  );
}
