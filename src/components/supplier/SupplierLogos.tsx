'use client';

import React from 'react';

export function SupplierLogos() {
  const brands = [
    { name: 'Blue Tokai Coffee', label: 'BLUE TOKAI' },
    { name: 'Third Wave Coffee', label: 'THIRD WAVE' },
    { name: 'Subko Specialty Coffee', label: 'SUBKO' },
    { name: 'Araku Coffee', label: 'ARAKU' },
    { name: 'Maverick & Farmer', label: 'MAVERICK & FARMER' },
    { name: 'Slay Coffee', label: 'SLAY COFFEE' },
    { name: 'KC Roasters', label: 'KC ROASTERS' },
  ];

  return (
    <section className="sup-logos-section" aria-label="Trusted Wholesale Network">
      <div className="sup-container">
        <div className="sup-logos-card">
          <div className="sup-logos-title">
            The wholesale network trusted by leading cafés &amp; roasteries
          </div>

          <div className="sup-logos-grid">
            {brands.map((b) => (
              <div key={b.name} className="sup-logo-item">
                <span className="sup-logo-text-mark">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
