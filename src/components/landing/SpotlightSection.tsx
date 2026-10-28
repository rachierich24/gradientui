'use client'

import Image from 'next/image'
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

// Curated Real Market Food Brand Products for Row 1 (ITC, Veeba, Nestlé, Amul, McCain, Monin, Hershey's, etc.)
const ROW_1_CARDS: SpotlightCardItem[] = [
  {
    id: 'r1-1',
    title: "Veeba Chef's Choice Veg Mayonnaise (875g)",
    category: 'BRAND',
    tagColor: '#EA580C',
    image: '/landing/spotlight/veeba-chef-veg-mayo.png',
    width: 176,
    alt: "Veeba Chef's Choice Veg Mayonnaise Foodservice Pack",
  },
  {
    id: 'r1-2',
    title: "Nestlé Nescafé Classic Instant Coffee",
    category: 'BRAND',
    tagColor: '#DC2626',
    image: '/landing/spotlight/nestle-nescafe-classic.png',
    width: 172,
    alt: "Nestlé Nescafé Classic Instant Coffee Jar",
  },
  {
    id: 'r1-3',
    title: "ITC Master Chef Crispy French Fries",
    category: 'BRAND',
    tagColor: '#2563EB',
    image: '/landing/spotlight/itc-masterchef-crispy-fries.png',
    width: 180,
    alt: "ITC Master Chef Crispy French Fries Foodservice Pack",
  },
  {
    id: 'r1-4',
    title: "Amul Pasteurised Butter (500g)",
    category: 'BRAND',
    tagColor: '#F59E0B',
    image: '/landing/spotlight/amul-butter-500g.png',
    width: 178,
    alt: "Amul Pasteurised Salted Table Butter 500g Block",
  },
  {
    id: 'r1-5',
    title: "Nestlé Maggi 2-Minute Noodles Pack",
    category: 'BRAND',
    tagColor: '#E11D48',
    image: '/landing/spotlight/nestle-maggi-noodles.png',
    width: 174,
    alt: "Nestlé Maggi 2-Minute Instant Noodles Commercial Pack",
  },
  {
    id: 'r1-6',
    title: "Monin Vanilla Syrup (700ml)",
    category: 'BRAND',
    tagColor: '#D97706',
    image: '/landing/spotlight/monin-vanilla-syrup.png',
    width: 170,
    alt: "Monin Vanilla Syrup 700ml Glass Bottle",
  },
  {
    id: 'r1-7',
    title: "Veeba Pizza & Pasta Sauce (Herby Tomato)",
    category: 'BRAND',
    tagColor: '#BE123C',
    image: '/landing/spotlight/veeba-pizza-pasta-sauce.png',
    width: 176,
    alt: "Veeba Pizza and Pasta Sauce Herby Tomato Base",
  },
  {
    id: 'r1-8',
    title: "ITC Sunfeast Dark Fantasy Choco Fills",
    category: 'BRAND',
    tagColor: '#7C3AED',
    image: '/landing/spotlight/itc-dark-fantasy.png',
    width: 176,
    alt: "ITC Sunfeast Dark Fantasy Choco Fills for Shakes and Desserts",
  },
  {
    id: 'r1-9',
    title: "McCain French Fries (2.5kg Bulk)",
    category: 'BRAND',
    tagColor: '#6D28D9',
    image: '/landing/spotlight/mccain-mccain-french-fries.png',
    width: 182,
    alt: "McCain Straight Cut French Fries 2.5kg Foodservice Bag",
  },
  {
    id: 'r1-10',
    title: "Amul Processed Cheese Slices",
    category: 'BRAND',
    tagColor: '#F59E0B',
    image: '/landing/spotlight/amul-cheese-slices.png',
    width: 174,
    alt: "Amul Processed Cheese Slices Pack for Sandwiches and Burgers",
  },
  {
    id: 'r1-11',
    title: "Nestlé Milkmaid Sweetened Condensed Milk",
    category: 'BRAND',
    tagColor: '#0284C7',
    image: '/landing/spotlight/nestle-milkmaid-tin.jpg',
    width: 172,
    alt: "Nestlé Milkmaid Sweetened Condensed Milk Tin for Desserts",
  },
  {
    id: 'r1-12',
    title: "Hershey's Genuine Chocolate Syrup",
    category: 'BRAND',
    tagColor: '#78350F',
    image: '/landing/spotlight/hersheys-chocolate-syrup.png',
    width: 170,
    alt: "Hershey's Genuine Chocolate Dessert and Beverage Syrup",
  },
  {
    id: 'r1-13',
    title: "Oatly Barista Edition Oat Milk (1L)",
    category: 'BRAND',
    tagColor: '#0EA5E9',
    image: '/landing/spotlight/oatly-barista-oat-milk.jpg',
    width: 174,
    alt: "Oatly Barista Edition Oat Milk 1L Steaming Carton",
  },
  {
    id: 'r1-14',
    title: "Callebaut 811 Belgian Dark Chocolate",
    category: 'BRAND',
    tagColor: '#451A03',
    image: '/landing/spotlight/callebaut-811-dark-chocolate.png',
    width: 180,
    alt: "Callebaut 811 54.5% Dark Chocolate Couverture Callets 2.5kg",
  },
  {
    id: 'r1-15',
    title: "Veeba Tandoori Mayonnaise",
    category: 'BRAND',
    tagColor: '#EA580C',
    image: '/landing/spotlight/veeba-tandoori-mayo.png',
    width: 174,
    alt: "Veeba Veg Tandoori Flavoured Mayonnaise Dispenser",
  },
  {
    id: 'r1-16',
    title: "Nestlé KitKat Wafer Bar (Dessert Topping)",
    category: 'BRAND',
    tagColor: '#DC2626',
    image: '/landing/spotlight/nestle-kitkat-bar.png',
    width: 172,
    alt: "Nestlé KitKat Crisp Wafer Bar for Waffle and Shake Topping",
  },
  {
    id: 'r1-17',
    title: "Blue Tokai Vienna Roast Coffee Beans",
    category: 'BRAND',
    tagColor: '#3B82F6',
    image: '/landing/spotlight/blue-tokai-vienna-roast.jpg',
    width: 176,
    alt: "Blue Tokai Vienna Roast Specialty Coffee Beans Bag",
  },
  {
    id: 'r1-18',
    title: "Heinz Classic Tomato Ketchup",
    category: 'BRAND',
    tagColor: '#EF4444',
    image: '/landing/spotlight/heinz-heinz-tomato-ketchup.png',
    width: 176,
    alt: "Heinz Classic Tomato Ketchup Squeeze Dispenser",
  },
  {
    id: 'r1-19',
    title: "Amul Pizza Mozzarella Cheese Block",
    category: 'BRAND',
    tagColor: '#F59E0B',
    image: '/landing/spotlight/amul-mozzarella-cheese.png',
    width: 174,
    alt: "Amul Pizza Mozzarella Cheese Block for Cafes",
  },
  {
    id: 'r1-20',
    title: "ITC Master Chef Desi Potato Bites",
    category: 'BRAND',
    tagColor: '#2563EB',
    image: '/landing/spotlight/itc-masterchef-potato-bites.png',
    width: 176,
    alt: "ITC Master Chef Desi Style Potato Bites Ready-to-Fry Pack",
  },
  {
    id: 'r1-21',
    title: "Monin Caramel Syrup (700ml)",
    category: 'BRAND',
    tagColor: '#D97706',
    image: '/landing/spotlight/monin-caramel-syrup.png',
    width: 170,
    alt: "Monin Caramel Flavored Syrup 700ml Bottle",
  },
  {
    id: 'r1-22',
    title: "Cadbury Premium Cocoa Powder",
    category: 'BRAND',
    tagColor: '#451A03',
    image: '/landing/spotlight/cadbury-cocoa-powder.jpg',
    width: 170,
    alt: "Cadbury Cocoa Powder Mix for Hot Chocolate and Baking",
  },
  {
    id: 'r1-23',
    title: "Real Fruit Power Cranberry Juice (1L)",
    category: 'BRAND',
    tagColor: '#BE123C',
    image: '/landing/spotlight/real-cranberry-juice.png',
    width: 172,
    alt: "Real Fruit Power Cranberry Juice for Mocktails and Coolers",
  },
  {
    id: 'r1-24',
    title: "Nutella Hazelnut Spread with Cocoa",
    category: 'BRAND',
    tagColor: '#78350F',
    image: '/landing/spotlight/nutella-hazelnut-spread.png',
    width: 176,
    alt: "Nutella Hazelnut Spread with Cocoa Foodservice Jar",
  },
]

// Curated Real Market Food Brand Products for Row 2 (Nestlé, Veeba, Amul, McCain, Monin, Heinz, etc.)
const ROW_2_CARDS: SpotlightCardItem[] = [
  {
    id: 'r2-1',
    title: "Nestlé Nescafé Gold Freeze Dried Coffee",
    category: 'BRAND',
    tagColor: '#B45309',
    image: '/landing/spotlight/nestle-nescafe-gold.png',
    width: 174,
    alt: "Nestlé Nescafé Gold Blend Freeze Dried Instant Coffee Jar",
  },
  {
    id: 'r2-2',
    title: "Veeba Classic Marinara Sauce",
    category: 'BRAND',
    tagColor: '#BE123C',
    image: '/landing/spotlight/veeba-marinara-sauce.png',
    width: 176,
    alt: "Veeba Classic Marinara Italian Pizza and Pasta Sauce",
  },
  {
    id: 'r2-3',
    title: "Amul Whipping Cream (1L)",
    category: 'BRAND',
    tagColor: '#0284C7',
    image: '/landing/spotlight/amul-whipping-cream.png',
    width: 172,
    alt: "Amul Whipping Cream 1L Foodservice Carton",
  },
  {
    id: 'r2-4',
    title: "Nestlé Maggi Rich Tomato Ketchup",
    category: 'BRAND',
    tagColor: '#DC2626',
    image: '/landing/spotlight/nestle-maggi-tomato-sauce.png',
    width: 170,
    alt: "Nestlé Maggi Rich Tomato Sauce Squeeze Dispenser",
  },
  {
    id: 'r2-5',
    title: "McCain Potato Cheese Shotz",
    category: 'BRAND',
    tagColor: '#6D28D9',
    image: '/landing/spotlight/mccain-mccain-potato-cheese-shotz.png',
    width: 172,
    alt: "McCain Potato Cheese Shotz Foodservice Pack",
  },
  {
    id: 'r2-6',
    title: "Monin Hazelnut Syrup (700ml)",
    category: 'BRAND',
    tagColor: '#B45309',
    image: '/landing/spotlight/monin-hazelnut-syrup.png',
    width: 170,
    alt: "Le Sirop de Monin Roasted Hazelnut Syrup 700ml",
  },
  {
    id: 'r2-7',
    title: "Amul Taaza Milk (1L Tetra Pak)",
    category: 'BRAND',
    tagColor: '#0284C7',
    image: '/landing/spotlight/amul-taaza-milk-1l.png',
    width: 170,
    alt: "Amul Taaza Homogenised Toned Milk 1L Tetra Pak",
  },
  {
    id: 'r2-8',
    title: "Callebaut Recipe 823 Milk Chocolate (2.5kg)",
    category: 'BRAND',
    tagColor: '#5C381E',
    image: '/landing/spotlight/callebaut-823-milk-chocolate.png',
    width: 182,
    alt: "Callebaut Recipe 823 Belgian Milk Chocolate Callets 2.5kg",
  },
  {
    id: 'r2-9',
    title: "Veeba Burger Mayonnaise",
    category: 'BRAND',
    tagColor: '#EA580C',
    image: '/landing/spotlight/veeba-burger-mayo.jpg',
    width: 174,
    alt: "Veeba Professional Veg Burger Mayonnaise Dispenser",
  },
  {
    id: 'r2-10',
    title: "McCain Smiles Potato Smiles",
    category: 'BRAND',
    tagColor: '#6D28D9',
    image: '/landing/spotlight/mccain-mccain-smiles.png',
    width: 172,
    alt: "McCain Smiles Crispy Mashed Potato Shapes",
  },
  {
    id: 'r2-11',
    title: "Philadelphia Original Cream Cheese",
    category: 'BRAND',
    tagColor: '#0284C7',
    image: '/landing/spotlight/philadelphia-cream-cheese.png',
    width: 176,
    alt: "Philadelphia Original Fresh Cream Cheese Tub",
  },
  {
    id: 'r2-12',
    title: "Monin Wild Strawberry Syrup (700ml)",
    category: 'BRAND',
    tagColor: '#E11D48',
    image: '/landing/spotlight/monin-strawberry-syrup.png',
    width: 170,
    alt: "Monin Wild Strawberry Beverage Syrup 700ml",
  },
  {
    id: 'r2-13',
    title: "Lavazza Crema e Gusto Espresso Beans (1kg)",
    category: 'BRAND',
    tagColor: '#1E3A8A',
    image: '/landing/spotlight/lavazza-crema-e-gusto.jpg',
    width: 180,
    alt: "Lavazza Crema e Gusto Espresso Whole Coffee Beans 1kg",
  },
  {
    id: 'r2-14',
    title: "Amul Fresh Cream (1L Carton)",
    category: 'BRAND',
    tagColor: '#0284C7',
    image: '/landing/spotlight/amul-fresh-cream.png',
    width: 172,
    alt: "Amul Fresh Cream 1L Foodservice Carton",
  },
  {
    id: 'r2-15',
    title: "McCain Aloo Tikki Burger Patty",
    category: 'BRAND',
    tagColor: '#6D28D9',
    image: '/landing/spotlight/mccain-mccain-aloo-tikki.png',
    width: 180,
    alt: "McCain Aloo Tikki Burger Patty Foodservice Pack",
  },
  {
    id: 'r2-16',
    title: "Monin Blue Curaçao Syrup (700ml)",
    category: 'BRAND',
    tagColor: '#0284C7',
    image: '/landing/spotlight/monin-blue-curacao.png',
    width: 170,
    alt: "Monin Blue Curaçao Mocktail Syrup 700ml Bottle",
  },
  {
    id: 'r2-17',
    title: "Sleepy Owl Cold Brew Pitcher Packs",
    category: 'BRAND',
    tagColor: '#0F172A',
    image: '/landing/spotlight/sleepy-owl-cold-brew.png',
    width: 176,
    alt: "Sleepy Owl Premium Cold Brew Filter Coffee Pitcher Packs",
  },
  {
    id: 'r2-18',
    title: "Heinz Classic BBQ Sauce",
    category: 'BRAND',
    tagColor: '#991B1B',
    image: '/landing/spotlight/heinz-heinz-classic-bbq-sauce.png',
    width: 172,
    alt: "Heinz Classic Smoky Barbecue Glaze and Dip Bottle",
  },
  {
    id: 'r2-19',
    title: "Monin Dark Chocolate Gourmet Sauce",
    category: 'BRAND',
    tagColor: '#381E11',
    image: '/landing/spotlight/monin-dark-chocolate-sauce.png',
    width: 174,
    alt: "La Sauce de Monin Dark Chocolate Gourmet Sauce",
  },
  {
    id: 'r2-20',
    title: "Heinz Classic Yellow Mustard",
    category: 'BRAND',
    tagColor: '#EAB308',
    image: '/landing/spotlight/heinz-heinz-yellow-mustard.png',
    width: 170,
    alt: "Heinz Classic Yellow Mustard Dispenser Bottle",
  },
  {
    id: 'r2-21',
    title: "Real Thai Extra Hot Sriracha Sauce",
    category: 'BRAND',
    tagColor: '#DC2626',
    image: '/landing/spotlight/sriracha-hot-sauce.png',
    width: 168,
    alt: "Real Thai Extra Hot Sriracha Chili Sauce Bottle",
  },
  {
    id: 'r2-22',
    title: "Monin Mojito Mint Syrup (700ml)",
    category: 'BRAND',
    tagColor: '#059669',
    image: '/landing/spotlight/monin-mojito-mint-syrup.png',
    width: 170,
    alt: "Monin Mojito Mint Beverage Syrup 700ml Bottle",
  },
  {
    id: 'r2-23',
    title: "Twinings English Breakfast Tea Bags",
    category: 'BRAND',
    tagColor: '#C2410C',
    image: '/landing/spotlight/twinings-english-breakfast-tea.jpg',
    width: 172,
    alt: "Twinings English Breakfast Tea Bags Pack",
  },
  {
    id: 'r2-24',
    title: "Tabasco Red Pepper Hot Sauce",
    category: 'BRAND',
    tagColor: '#B91C1C',
    image: '/landing/spotlight/tabasco-pepper-sauce.png',
    width: 166,
    alt: "Tabasco Original Red Pepper Hot Sauce Bottle",
  },
];

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
    let setWidth1 = 5420
    let setWidth2 = 5420

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
              {ROW_1_TRIPLED.map((card, idx) => {
                const categoryKey = card.category === 'CAFÉ' ? 'cafe' : card.category.toLowerCase()
                return (
                  <div
                    key={`r1-${card.id}-${idx}`}
                    className={`spotlight-card spotlight-card--${categoryKey}`}
                    style={{ width: `${card.width}px` }}
                    title={card.title}
                  >
                    <div className="spotlight-card-inner">
                      <div className="spotlight-image-box">
                        <Image
                          src={card.image}
                          alt={card.alt}
                          width={352}
                          height={244}
                          sizes="180px"
                          loading="lazy"
                          className="spotlight-image"
                          draggable={false}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Row 2: Moves Right on Scroll Down (Staggered Vertical Offset) */}
          <div className="spotlight-row-wrapper">
            <div ref={row2Ref} className="spotlight-row" data-direction="right">
              {ROW_2_TRIPLED.map((card, idx) => {
                const categoryKey = card.category === 'CAFÉ' ? 'cafe' : card.category.toLowerCase()
                return (
                  <div
                    key={`r2-${card.id}-${idx}`}
                    className={`spotlight-card spotlight-card--${categoryKey}`}
                    style={{ width: `${card.width}px` }}
                    title={card.title}
                  >
                    <div className="spotlight-card-inner">
                      <div className="spotlight-image-box">
                        <Image
                          src={card.image}
                          alt={card.alt}
                          width={352}
                          height={244}
                          sizes="180px"
                          loading="lazy"
                          className="spotlight-image"
                          draggable={false}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
