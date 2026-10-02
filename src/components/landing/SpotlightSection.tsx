'use client'

import React, { useEffect, useRef } from 'react'

interface SpotlightCardItem {
  id: string
  title: string
  category: 'CAFÉ' | 'SUPPLIER' | 'BRAND'
  tagColor: string
  image: string
  width: number
  alt: string
}

// 12 Curated Items for Row 1
const ROW_1_CARDS: SpotlightCardItem[] = [
  {
    id: 'r1-1',
    title: 'Specialty Arabica AA',
    category: 'BRAND',
    tagColor: '#6D28D9',
    image: '/landing/spotlight/arabica-coffee-bag.jpg',
    width: 174,
    alt: 'Specialty Arabica AA Whole Bean Coffee Packaging',
  },
  {
    id: 'r1-2',
    title: 'Espresso Roast Beans',
    category: 'CAFÉ',
    tagColor: '#E03527',
    image: '/landing/spotlight/arabica-beans.jpg',
    width: 158,
    alt: 'Roasted Specialty Espresso Beans',
  },
  {
    id: 'r1-3',
    title: 'Barista Oat Milk',
    category: 'SUPPLIER',
    tagColor: '#22C55E',
    image: '/landing/spotlight/barista-oat-carton.jpg',
    width: 184,
    alt: 'Barista Edition Oat Milk 1L Carton',
  },
  {
    id: 'r1-4',
    title: 'Artisan Caramel Syrup',
    category: 'BRAND',
    tagColor: '#6D28D9',
    image: '/landing/spotlight/caramel-syrup-bottle.jpg',
    width: 162,
    alt: 'Artisan Salted Caramel Specialty Syrup Bottle',
  },
  {
    id: 'r1-5',
    title: 'Ceremonial Uji Matcha',
    category: 'BRAND',
    tagColor: '#6D28D9',
    image: '/landing/spotlight/ceremonial-matcha-tin.jpg',
    width: 168,
    alt: 'Ceremonial Grade Uji Matcha Green Tea Tin',
  },
  {
    id: 'r1-6',
    title: '12oz Ripple Paper Cups',
    category: 'SUPPLIER',
    tagColor: '#22C55E',
    image: '/landing/spotlight/ripple-paper-cups.jpg',
    width: 178,
    alt: 'Insulated Ripple Wall Takeaway Hot Cups',
  },
  {
    id: 'r1-7',
    title: 'Dutch Dark Chocolate',
    category: 'BRAND',
    tagColor: '#6D28D9',
    image: '/landing/spotlight/chocolate-syrup.jpg',
    width: 164,
    alt: 'Premium Dutch Cacao Sauce for Mocha and Hot Cocoa',
  },
  {
    id: 'r1-8',
    title: 'Commercial 2-Group Espresso',
    category: 'SUPPLIER',
    tagColor: '#22C55E',
    image: '/landing/spotlight/commercial-espresso-machine.jpg',
    width: 188,
    alt: 'Commercial Multi-boiler Espresso Machine',
  },
  {
    id: 'r1-9',
    title: 'Cold Brew Concentrate',
    category: 'CAFÉ',
    tagColor: '#E03527',
    image: '/landing/spotlight/cold-brew-bottle.jpg',
    width: 160,
    alt: 'Slow Steeped Nitrogen Cold Brew Bottle',
  },
  {
    id: 'r1-10',
    title: 'Kraft Carrier Bags',
    category: 'SUPPLIER',
    tagColor: '#22C55E',
    image: '/landing/spotlight/kraft-takeaway-bag.jpg',
    width: 176,
    alt: 'Reinforced Kraft Paper Food Delivery Bag',
  },
  {
    id: 'r1-11',
    title: 'Butter Brioche Croissant',
    category: 'CAFÉ',
    tagColor: '#E03527',
    image: '/landing/spotlight/croissant-bakery.jpg',
    width: 166,
    alt: 'Golden Flaky French Butter Croissant',
  },
  {
    id: 'r1-12',
    title: 'Single Origin Filter Roast',
    category: 'BRAND',
    tagColor: '#6D28D9',
    image: '/landing/spotlight/coffee-bag-red.jpg',
    width: 182,
    alt: 'Single Origin Specialty Coffee Packaging Pouch',
  },
]

// 12 Curated Items for Row 2
const ROW_2_CARDS: SpotlightCardItem[] = [
  {
    id: 'r2-1',
    title: 'Dark Mocha Sauce',
    category: 'CAFÉ',
    tagColor: '#E03527',
    image: '/landing/spotlight/chocolate-syrup.jpg',
    width: 166,
    alt: 'Dark Mocha Beverage Syrup Dispenser',
  },
  {
    id: 'r2-2',
    title: 'Estate Micro-lot Arabica',
    category: 'SUPPLIER',
    tagColor: '#22C55E',
    image: '/landing/spotlight/arabica-beans.jpg',
    width: 180,
    alt: 'Direct Farm Trade Raw Arabica Green and Roasted Beans',
  },
  {
    id: 'r2-3',
    title: 'Clear Cold Cup & Lid',
    category: 'CAFÉ',
    tagColor: '#E03527',
    image: '/landing/spotlight/iced-latte-cold-cup.jpg',
    width: 162,
    alt: 'Crystal Clear Recyclable PET Iced Drink Cup',
  },
  {
    id: 'r2-4',
    title: 'Pure Plant Oat Dairy',
    category: 'BRAND',
    tagColor: '#6D28D9',
    image: '/landing/spotlight/oat-milk.jpg',
    width: 174,
    alt: 'Plant-based Barista Oat Dairy Alternative',
  },
  {
    id: 'r2-5',
    title: 'Commercial Burr Grinder',
    category: 'SUPPLIER',
    tagColor: '#22C55E',
    image: '/landing/spotlight/coffee-grinder-commercial.jpg',
    width: 188,
    alt: 'On-demand Flat Burr Commercial Coffee Grinder',
  },
  {
    id: 'r2-6',
    title: 'Artisan Whole Bean Bag',
    category: 'CAFÉ',
    tagColor: '#E03527',
    image: '/landing/spotlight/arabica-coffee-bag.jpg',
    width: 160,
    alt: 'Artisan Roasted Coffee Beans in Foil Valved Bag',
  },
  {
    id: 'r2-7',
    title: 'Stoneground Organic Matcha',
    category: 'CAFÉ',
    tagColor: '#E03527',
    image: '/landing/spotlight/matcha.jpg',
    width: 170,
    alt: 'Freshly Whisked Japanese Ceremonial Matcha Bowl',
  },
  {
    id: 'r2-8',
    title: 'Double-Wall Insulated Cups',
    category: 'SUPPLIER',
    tagColor: '#22C55E',
    image: '/landing/spotlight/ripple-paper-cups.jpg',
    width: 182,
    alt: 'Double Wall Kraft Takeaway Hot Cups',
  },
  {
    id: 'r2-9',
    title: 'Beverage Infusion Syrup',
    category: 'BRAND',
    tagColor: '#6D28D9',
    image: '/landing/spotlight/caramel-syrup-bottle.jpg',
    width: 158,
    alt: 'Beverage Flavouring Craft Syrup',
  },
  {
    id: 'r2-10',
    title: 'Artisan Bakery Pastries',
    category: 'CAFÉ',
    tagColor: '#E03527',
    image: '/landing/spotlight/croissant-bakery.jpg',
    width: 172,
    alt: 'Freshly Baked Pastries on Bakery Display',
  },
  {
    id: 'r2-11',
    title: 'Amber Cold Extraction',
    category: 'BRAND',
    tagColor: '#6D28D9',
    image: '/landing/spotlight/cold-brew-bottle.jpg',
    width: 164,
    alt: 'Cold Drip Extracted Coffee Concentrate',
  },
  {
    id: 'r2-12',
    title: 'Steaming Barista Carton',
    category: 'SUPPLIER',
    tagColor: '#22C55E',
    image: '/landing/spotlight/barista-oat-carton.jpg',
    width: 186,
    alt: 'Steaming Oat Milk for Latte Art',
  },
]

// Repeat 3x for infinite seamless modular wrapping
const ROW_1_TRIPLED = [...ROW_1_CARDS, ...ROW_1_CARDS, ...ROW_1_CARDS]
const ROW_2_TRIPLED = [...ROW_2_CARDS, ...ROW_2_CARDS, ...ROW_2_CARDS]

export function SpotlightSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const row1Ref = useRef<HTMLDivElement>(null)
  const row2Ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Respect user's reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mediaQuery.matches) {
      return
    }

    let isSectionVisible = true
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isSectionVisible = entry.isIntersecting
        })
      },
      { rootMargin: '400px 0px 400px 0px' }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    // Velocity model variables
    let lastScrollY = window.scrollY
    let targetVelocity = 0
    let currentVelocity = 0

    // Measure dynamic width of single 12-card set (1/3 of row)
    let setWidth1 = 2248
    let setWidth2 = 2254

    const updateSetWidths = () => {
      if (row1Ref.current && row1Ref.current.scrollWidth > 0) {
        setWidth1 = row1Ref.current.scrollWidth / 3
      }
      if (row2Ref.current && row2Ref.current.scrollWidth > 0) {
        setWidth2 = row2Ref.current.scrollWidth / 3
      }
    }

    updateSetWidths()
    window.addEventListener('resize', updateSetWidths, { passive: true })

    // Staggered initial positions so cards extend beyond both viewport edges
    let pos1 = -setWidth1 * 0.35
    let pos2 = -setWidth2 * 0.65

    // Continuous Carousel + Scroll Acceleration
    // Base continuous marquee velocity (px/frame at 60fps)
    const BASE_SPEED = 0.85
    let lastTime = performance.now()
    let animId: number

    const animate = (now: number) => {
      const dt = Math.min((now - lastTime) / 16.667, 2.5) // normalized frame delta
      lastTime = now

      const currentScrollY = window.scrollY
      const deltaY = currentScrollY - lastScrollY
      lastScrollY = currentScrollY

      if (isSectionVisible) {
        if (Math.abs(deltaY) > 0.05) {
          // Smooth scroll velocity impulse (fastens up significantly when scrolling)
          const cappedDelta = Math.sign(deltaY) * Math.min(Math.abs(deltaY), 65)
          targetVelocity = cappedDelta * 1.15
        } else {
          // Smooth deceleration of the scroll boost back to continuous baseline
          targetVelocity *= 0.84
        }

        // Interpolate velocity for natural physical inertia
        currentVelocity += (targetVelocity - currentVelocity) * 0.22

        if (Math.abs(currentVelocity) < 0.02 && Math.abs(targetVelocity) < 0.02) {
          currentVelocity = 0
          targetVelocity = 0
        }

        // Total instantaneous speed = continuous baseline + scroll acceleration
        // Row 1: moves LEFT continuously (-BASE_SPEED) and fastens up on scroll down
        // Row 2: moves RIGHT continuously (+BASE_SPEED) and fastens up on scroll down (0.75x ratio for parallax depth)
        const move1 = (BASE_SPEED + currentVelocity) * 1.0 * dt
        const move2 = (BASE_SPEED + currentVelocity) * 0.75 * dt

        pos1 -= move1
        pos2 += move2

        // Modular infinite wrapping for Row 1
        if (setWidth1 > 0) {
          while (pos1 <= -setWidth1) {
            pos1 += setWidth1
          }
          while (pos1 > 0) {
            pos1 -= setWidth1
          }
        }

        // Modular infinite wrapping for Row 2
        if (setWidth2 > 0) {
          while (pos2 <= -setWidth2) {
            pos2 += setWidth2
          }
          while (pos2 > 0) {
            pos2 -= setWidth2
          }
        }

        if (row1Ref.current) {
          row1Ref.current.style.transform = `translate3d(${pos1.toFixed(2)}px, 0, 0)`
        }
        if (row2Ref.current) {
          row2Ref.current.style.transform = `translate3d(${pos2.toFixed(2)}px, 0, 0)`
        }
      }

      animId = requestAnimationFrame(animate)
    }

    animId = requestAnimationFrame(animate)

    // Apply initial positions immediately
    if (row1Ref.current) {
      row1Ref.current.style.transform = `translate3d(${pos1.toFixed(2)}px, 0, 0)`
    }
    if (row2Ref.current) {
      row2Ref.current.style.transform = `translate3d(${pos2.toFixed(2)}px, 0, 0)`
    }

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', updateSetWidths)
      observer.disconnect()
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="spotlight-section"
      id="spotlight-catalog"
      aria-label="Everything that keeps a café running - Product catalog showcase"
    >
      <div className="spotlight-container">
        {/* Minimal Typographic Section Header */}
        <div className="spotlight-header">
          <span className="spotlight-eyebrow">SPOTLIGHT</span>
          <h2 className="spotlight-title">
            Everything your café needs.{' '}
            <span className="spotlight-title-muted">One connected supply network.</span>
          </h2>
        </div>

        {/* Dynamic 2-Row Flowing Editorial Stage */}
        <div className="spotlight-stage">
          {/* Row 1: Moves Left on Scroll Down */}
          <div className="spotlight-row-wrapper">
            <div ref={row1Ref} className="spotlight-row" data-direction="left">
              {ROW_1_TRIPLED.map((card, idx) => (
                <div
                  key={`r1-${card.id}-${idx}`}
                  className="spotlight-card"
                  style={{ width: `${card.width}px` }}
                >
                  <div className="spotlight-card-inner">
                    <div className="spotlight-image-box">
                      <img
                        src={card.image}
                        alt={card.alt}
                        loading={idx < 12 ? 'eager' : 'lazy'}
                        className="spotlight-image"
                        draggable={false}
                      />
                    </div>
                    {/* Restrained 5% Ecosystem Metadata Pill */}
                    <div className="spotlight-card-footer">
                      <span className="spotlight-eco-badge">
                        <span
                          className="spotlight-eco-dot"
                          style={{ backgroundColor: card.tagColor }}
                        />
                        <span className="spotlight-eco-text">{card.category}</span>
                      </span>
                      <span className="spotlight-card-name" title={card.title}>
                        {card.title}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Row 2: Moves Right on Scroll Down (Staggered Vertical Offset) */}
          <div className="spotlight-row-wrapper">
            <div ref={row2Ref} className="spotlight-row" data-direction="right">
              {ROW_2_TRIPLED.map((card, idx) => (
                <div
                  key={`r2-${card.id}-${idx}`}
                  className="spotlight-card"
                  style={{ width: `${card.width}px` }}
                >
                  <div className="spotlight-card-inner">
                    <div className="spotlight-image-box">
                      <img
                        src={card.image}
                        alt={card.alt}
                        loading={idx < 12 ? 'eager' : 'lazy'}
                        className="spotlight-image"
                        draggable={false}
                      />
                    </div>
                    {/* Restrained 5% Ecosystem Metadata Pill */}
                    <div className="spotlight-card-footer">
                      <span className="spotlight-eco-badge">
                        <span
                          className="spotlight-eco-dot"
                          style={{ backgroundColor: card.tagColor }}
                        />
                        <span className="spotlight-eco-text">{card.category}</span>
                      </span>
                      <span className="spotlight-card-name" title={card.title}>
                        {card.title}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
