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

// 29 Real Curated Products for Row 1
const ROW_1_CARDS: SpotlightCardItem[] = [
  {
    id: 'r1-1',
    title: "Veg Sandwich Burger",
    category: 'CAFÉ',
    tagColor: '#E03527',
    image: '/landing/spotlight/dtq-veg-sandwich-burger-bold.jpg',
    width: 172,
    alt: "Veg Sandwich Burger - DroptheQ Café & Food Court",
  },
  {
    id: 'r1-2',
    title: "Hyderabadi Salan Gravy",
    category: 'SUPPLIER',
    tagColor: '#22C55E',
    image: '/landing/spotlight/fsi-hyderabadi-salan.jpg',
    width: 176,
    alt: "Hyderabadi Salan Base - Food Service India HORECA Solution",
  },
  {
    id: 'r1-3',
    title: "McCain Aloo Tikki Patty",
    category: 'BRAND',
    tagColor: '#6D28D9',
    image: '/landing/spotlight/mccain-mccain-aloo-tikki.png',
    width: 180,
    alt: "McCain Aloo Tikki Patty - McCain Foodservice",
  },
  {
    id: 'r1-4',
    title: "Crispy Onion Rings",
    category: 'CAFÉ',
    tagColor: '#E03527',
    image: '/landing/spotlight/dtq-onion-rings.jpg',
    width: 164,
    alt: "Crispy Golden Onion Rings - DroptheQ Café & Food Court",
  },
  {
    id: 'r1-5',
    title: "Classic Baked Beans",
    category: 'SUPPLIER',
    tagColor: '#22C55E',
    image: '/landing/spotlight/fsi-baked-beans.jpg',
    width: 164,
    alt: "Classic Baked Beans - Food Service India",
  },
  {
    id: 'r1-6',
    title: "Chilli Garlic Potato Bites",
    category: 'BRAND',
    tagColor: '#6D28D9',
    image: '/landing/spotlight/mccain-mccain-chilli-garlic-potat.png',
    width: 172,
    alt: "McCain Chilli Garlic Potato Bites - McCain Foodservice",
  },
  {
    id: 'r1-7',
    title: "Americano Mayo Veg Burger",
    category: 'CAFÉ',
    tagColor: '#E03527',
    image: '/landing/spotlight/dtq-americano-mayo-burst-veg.jpg',
    width: 182,
    alt: "Americano Mayo Veg Burger - DroptheQ Café & Food Court",
  },
  {
    id: 'r1-8',
    title: "Pomodoro Pasta Sauce",
    category: 'SUPPLIER',
    tagColor: '#22C55E',
    image: '/landing/spotlight/fsi-classic-pomodoro-sauce-spa.jpg',
    width: 180,
    alt: "Classic Pomodoro Pasta Sauce - Food Service India",
  },
  {
    id: 'r1-9',
    title: "American Herb & Garlic",
    category: 'BRAND',
    tagColor: '#6D28D9',
    image: '/landing/spotlight/mccain-american-herb-garlic.png',
    width: 176,
    alt: "McCain American Herb & Garlic Wedges - McCain Foodservice",
  },
  {
    id: 'r1-10',
    title: "Habanero Burst Chicken",
    category: 'CAFÉ',
    tagColor: '#E03527',
    image: '/landing/spotlight/dtq-habanero-burst-chicken.jpg',
    width: 176,
    alt: "Habanero Burst Chicken Burger - DroptheQ Café & Food Court",
  },
  {
    id: 'r1-11',
    title: "Mac & Cheese Sauce Base",
    category: 'SUPPLIER',
    tagColor: '#22C55E',
    image: '/landing/spotlight/fsi-mac-and-cheese.jpg',
    width: 172,
    alt: "Mac & Cheese Sauce Base - Food Service India",
  },
  {
    id: 'r1-12',
    title: "Mexican Hot & Tangy Fries",
    category: 'BRAND',
    tagColor: '#6D28D9',
    image: '/landing/spotlight/mccain-mexican-hot-tangy.png',
    width: 174,
    alt: "McCain Mexican Hot & Tangy Fries - McCain Foodservice",
  },
  {
    id: 'r1-13',
    title: "Classic Ranch Boneless",
    category: 'CAFÉ',
    tagColor: '#E03527',
    image: '/landing/spotlight/dtq-classic-ranch-boneless.jpg',
    width: 168,
    alt: "Classic Ranch Boneless Bites - DroptheQ Café & Food Court",
  },
  {
    id: 'r1-14',
    title: "Garden Fresh Fusilli Base",
    category: 'SUPPLIER',
    tagColor: '#22C55E',
    image: '/landing/spotlight/fsi-garden-fresh-fusilli.jpg',
    width: 178,
    alt: "Garden Fresh Fusilli Sauce - Food Service India",
  },
  {
    id: 'r1-15',
    title: "McCain Crispy Smiles",
    category: 'BRAND',
    tagColor: '#6D28D9',
    image: '/landing/spotlight/mccain-mccain-smiles.png',
    width: 168,
    alt: "McCain Crispy Potato Smiles - McCain Foodservice",
  },
  {
    id: 'r1-16',
    title: "Spicy BBQ Boneless Wings",
    category: 'CAFÉ',
    tagColor: '#E03527',
    image: '/landing/spotlight/dtq-spicy-barbeque-boneless.jpg',
    width: 178,
    alt: "Spicy Barbeque Boneless Chicken - DroptheQ Café & Food Court",
  },
  {
    id: 'r1-17',
    title: "Classic Arrabiata Sauce",
    category: 'SUPPLIER',
    tagColor: '#22C55E',
    image: '/landing/spotlight/fsi-classic-penne-arrabiata.jpg',
    width: 168,
    alt: "Classic Penne Arrabiata Sauce - Food Service India",
  },
  {
    id: 'r1-18',
    title: "McCain French Fries (Bulk)",
    category: 'BRAND',
    tagColor: '#6D28D9',
    image: '/landing/spotlight/mccain-mccain-french-fries.png',
    width: 184,
    alt: "McCain Straight Cut French Fries - McCain Foodservice",
  },
  {
    id: 'r1-19',
    title: "Garlic Burst Veg Wrap",
    category: 'CAFÉ',
    tagColor: '#E03527',
    image: '/landing/spotlight/dtq-garlic-burst-veg-wrap.jpg',
    width: 170,
    alt: "Garlic Burst Veg Wrap - DroptheQ Café & Food Court",
  },
  {
    id: 'r1-20',
    title: "Jamaican Jerk Tikka Glaze",
    category: 'SUPPLIER',
    tagColor: '#22C55E',
    image: '/landing/spotlight/fsi-jamacian-jerk-chicken-tikk.jpg',
    width: 184,
    alt: "Jamaican Jerk Tikka Sauce - Food Service India",
  },
  {
    id: 'r1-21',
    title: "Chilli Cheesy Nuggets",
    category: 'BRAND',
    tagColor: '#6D28D9',
    image: '/landing/spotlight/mccain-mccain-chilli-cheesy-nugge.png',
    width: 170,
    alt: "McCain Chilli Cheesy Nuggets - McCain Foodservice",
  },
  {
    id: 'r1-22',
    title: "Dal Makhani Bowl",
    category: 'CAFÉ',
    tagColor: '#E03527',
    image: '/landing/spotlight/dtq-dal-makhani.jpg',
    width: 162,
    alt: "Slow Cooked Dal Makhani - DroptheQ Café & Food Court",
  },
  {
    id: 'r1-23',
    title: "Paneer Butter Masala Gravy",
    category: 'SUPPLIER',
    tagColor: '#22C55E',
    image: '/landing/spotlight/fsi-paneer-butter-masala.jpg',
    width: 186,
    alt: "Paneer Butter Masala Gravy Base - Food Service India",
  },
  {
    id: 'r1-24',
    title: "Potato Cheese Shotz",
    category: 'BRAND',
    tagColor: '#6D28D9',
    image: '/landing/spotlight/mccain-mccain-potato-cheese-shotz.png',
    width: 166,
    alt: "McCain Potato Cheese Shotz - McCain Foodservice",
  },
  {
    id: 'r1-25',
    title: "Amritsari Chole Meal",
    category: 'CAFÉ',
    tagColor: '#E03527',
    image: '/landing/spotlight/dtq-amritsari-chole.jpg',
    width: 166,
    alt: "Amritsari Chole Meal - DroptheQ Café & Food Court",
  },
  {
    id: 'r1-26',
    title: "Chinese Wok Fried Rice",
    category: 'SUPPLIER',
    tagColor: '#22C55E',
    image: '/landing/spotlight/fsi-chinese-fried-rice.jpg',
    width: 174,
    alt: "Chinese Wok Seasoning Base - Food Service India",
  },
  {
    id: 'r1-27',
    title: "Pepper Crunch Fries",
    category: 'BRAND',
    tagColor: '#6D28D9',
    image: '/landing/spotlight/mccain-mccain-french-fries-pepper.png',
    width: 182,
    alt: "McCain French Fries Pepper Crunch - McCain Foodservice",
  },
  {
    id: 'r1-28',
    title: "Hot & Crispy Fried Chicken",
    category: 'CAFÉ',
    tagColor: '#E03527',
    image: '/landing/spotlight/dtq-2-pc-hot-crispy-chicken.jpg',
    width: 184,
    alt: "Hot & Crispy Fried Chicken - DroptheQ Café & Food Court",
  },
  {
    id: 'r1-29',
    title: "Hot Garlic Noodle Sauce",
    category: 'SUPPLIER',
    tagColor: '#22C55E',
    image: '/landing/spotlight/fsi-hot-garlic-noodles.jpg',
    width: 170,
    alt: "Hot Garlic Asian Sauce - Food Service India",
  },
]

// 29 Real Curated Products for Row 2
const ROW_2_CARDS: SpotlightCardItem[] = [
  {
    id: 'r2-1',
    title: "Margherita Pizza Sauce",
    category: 'SUPPLIER',
    tagColor: '#22C55E',
    image: '/landing/spotlight/fsi-margherita-pizza.jpg',
    width: 176,
    alt: "Margherita Pizza Herb Sauce - Food Service India",
  },
  {
    id: 'r2-2',
    title: "McCain Masala Fries",
    category: 'BRAND',
    tagColor: '#6D28D9',
    image: '/landing/spotlight/mccain-mccain-masala-fries.png',
    width: 178,
    alt: "McCain Spicy Masala Fries - McCain Foodservice",
  },
  {
    id: 'r2-3',
    title: "Peri Peri Chicken Strips",
    category: 'CAFÉ',
    tagColor: '#E03527',
    image: '/landing/spotlight/dtq-peri-peri-chicken-strips-3.jpg',
    width: 174,
    alt: "Peri Peri Crispy Chicken Strips - DroptheQ Café & Food Court",
  },
  {
    id: 'r2-4',
    title: "Dal Fry Tadka Gravy",
    category: 'SUPPLIER',
    tagColor: '#22C55E',
    image: '/landing/spotlight/fsi-dal-fry.jpg',
    width: 164,
    alt: "Dal Fry Tadka Gravy - Food Service India",
  },
  {
    id: 'r2-5',
    title: "McCain Veggie Fingers",
    category: 'BRAND',
    tagColor: '#6D28D9',
    image: '/landing/spotlight/mccain-mccain-veggie-fingers.png',
    width: 172,
    alt: "McCain Veggie Fingers - McCain Foodservice",
  },
  {
    id: 'r2-6',
    title: "Spicy Crisp Hot Wings",
    category: 'CAFÉ',
    tagColor: '#E03527',
    image: '/landing/spotlight/dtq-hot-wings-4-pc.jpg',
    width: 168,
    alt: "Spicy Crisp Hot Wings - DroptheQ Café & Food Court",
  },
  {
    id: 'r2-7',
    title: "Uber Eats Delivery Bag",
    category: 'SUPPLIER',
    tagColor: '#22C55E',
    image: '/landing/spotlight/detpak-66591076-ee25-4a68-8316-05.png',
    width: 176,
    alt: "Detpak Uber Eats Insulated Delivery Bag",
  },
  {
    id: 'r2-8',
    title: "McCain Veggie Nuggets",
    category: 'BRAND',
    tagColor: '#6D28D9',
    image: '/landing/spotlight/mccain-mccain-veggie-nuggets.png',
    width: 170,
    alt: "McCain Veggie Nuggets - McCain Foodservice",
  },
  {
    id: 'r2-9',
    title: "Heinz Tomato Ketchup",
    category: 'BRAND',
    tagColor: '#6D28D9',
    image: '/landing/spotlight/heinz-heinz-tomato-ketchup.png',
    width: 178,
    alt: "Heinz Classic Tomato Ketchup Squeeze Bottle",
  },
  {
    id: 'r2-10',
    title: "Uber Eats Compact Bag",
    category: 'SUPPLIER',
    tagColor: '#22C55E',
    image: '/landing/spotlight/detpak-c954p0590-uber-eats-small.png',
    width: 168,
    alt: "Detpak Small Takeaway Delivery Bag",
  },
  {
    id: 'r2-11',
    title: "Heinz Yellow Mustard",
    category: 'BRAND',
    tagColor: '#6D28D9',
    image: '/landing/spotlight/heinz-heinz-yellow-mustard.png',
    width: 170,
    alt: "Heinz Yellow Mustard Dispenser Bottle",
  },
  {
    id: 'r2-12',
    title: "Heinz Sweet Pickle Relish",
    category: 'BRAND',
    tagColor: '#6D28D9',
    image: '/landing/spotlight/heinz-heinz-sweet-pickle-relish.png',
    width: 166,
    alt: "Heinz Sweet Pickle Relish Bottle",
  },
  {
    id: 'r2-13',
    title: "Petite PTH Brown Bag",
    category: 'SUPPLIER',
    tagColor: '#22C55E',
    image: '/landing/spotlight/detpak-petite-pth-brown.png',
    width: 164,
    alt: "Detpak Petite Paper Carry Bag",
  },
  {
    id: 'r2-14',
    title: "Heinz Real Mayonnaise Dip",
    category: 'BRAND',
    tagColor: '#6D28D9',
    image: '/landing/spotlight/heinz-heinz-real-mayonnaise-dip.png',
    width: 174,
    alt: "Heinz Creamy Real Mayonnaise Dipping Pot",
  },
  {
    id: 'r2-15',
    title: "Heinz Classic BBQ Sauce",
    category: 'BRAND',
    tagColor: '#6D28D9',
    image: '/landing/spotlight/heinz-heinz-classic-bbq-sauce.png',
    width: 172,
    alt: "Heinz Classic Smoky Barbecue Sauce",
  },
  {
    id: 'r2-16',
    title: "Wide Gusset Takeaway Bag",
    category: 'SUPPLIER',
    tagColor: '#22C55E',
    image: '/landing/spotlight/detpak-detpak-wide-gusset-bag-bro.png',
    width: 182,
    alt: "Detpak Wide Gusset Kraft Bag",
  },
  {
    id: 'r2-17',
    title: "Kraft Dipping Sauce Pot",
    category: 'BRAND',
    tagColor: '#6D28D9',
    image: '/landing/spotlight/heinz-kraft-dipping-sauce-pot.png',
    width: 168,
    alt: "Kraft Single-Serve Portion Dip Cup",
  },
  {
    id: 'r2-18',
    title: "Heinz 57 Gourmet Sauce",
    category: 'BRAND',
    tagColor: '#6D28D9',
    image: '/landing/spotlight/heinz-heinz-57-gourmet-sauce.png',
    width: 180,
    alt: "Heinz 57 Gourmet Steak Sauce",
  },
  {
    id: 'r2-19',
    title: "Kraft Eco Packaging Box",
    category: 'SUPPLIER',
    tagColor: '#22C55E',
    image: '/landing/spotlight/detpak-kraft-eco-packaging.png',
    width: 178,
    alt: "Detpak Eco Meal Cartons",
  },
  {
    id: 'r2-20',
    title: "Heinz Smoky Chipotle Dip",
    category: 'BRAND',
    tagColor: '#6D28D9',
    image: '/landing/spotlight/heinz-heinz-smoky-chipotle-dip.png',
    width: 176,
    alt: "Heinz Smoky Chipotle Specialty Dip",
  },
  {
    id: 'r2-21',
    title: "Uber Delivery Carry Bag",
    category: 'SUPPLIER',
    tagColor: '#22C55E',
    image: '/landing/spotlight/detpak-y994p0241-uber-eats-delive.png',
    width: 172,
    alt: "Detpak Reinforced Takeaway Bag",
  },
  {
    id: 'r2-22',
    title: "Uber L-Seal Security Bag",
    category: 'SUPPLIER',
    tagColor: '#22C55E',
    image: '/landing/spotlight/detpak-y994p0324-uber-l-seal-no.png',
    width: 176,
    alt: "Detpak Tamper-evident Seal Food Bag",
  },
  {
    id: 'r2-23',
    title: "Bakery Window Pastry Bag",
    category: 'SUPPLIER',
    tagColor: '#22C55E',
    image: '/landing/spotlight/detpak-product-page-images-bags-3.jpg',
    width: 184,
    alt: "Detpak Window Pastry Takeaway Bag",
  },
  {
    id: 'r2-24',
    title: "Gourmet Double Wall Cup",
    category: 'SUPPLIER',
    tagColor: '#22C55E',
    image: '/landing/spotlight/worldstar-gourmet-double-wall-cup.png',
    width: 180,
    alt: "Worldstar Gourmet Double Wall Hot Coffee Cup",
  },
  {
    id: 'r2-25',
    title: "Coffee Eat Insulated Cup",
    category: 'SUPPLIER',
    tagColor: '#22C55E',
    image: '/landing/spotlight/worldstar-coffee-eat-insulated-cup.png',
    width: 174,
    alt: "Worldstar Insulated Paper Hot Cup",
  },
  {
    id: 'r2-26',
    title: "Hot Beverage Paper Cup",
    category: 'SUPPLIER',
    tagColor: '#22C55E',
    image: '/landing/spotlight/worldstar-hot-beverage-paper-cup.png',
    width: 168,
    alt: "Worldstar Single Wall Hot Cup",
  },
  {
    id: 'r2-27',
    title: "Kraft Disposable Salad Bowl",
    category: 'SUPPLIER',
    tagColor: '#22C55E',
    image: '/landing/spotlight/worldstar-kraft-disposable-salad-bowl.png',
    width: 182,
    alt: "Worldstar Kraft Paper Salad Bowl",
  },
  {
    id: 'r2-28',
    title: "Kraft Meal Container",
    category: 'SUPPLIER',
    tagColor: '#22C55E',
    image: '/landing/spotlight/worldstar-kraft-paper-meal-container.png',
    width: 176,
    alt: "Worldstar Kraft Food Container",
  },
  {
    id: 'r2-29',
    title: "Bio-Kraft Takeaway Tub",
    category: 'SUPPLIER',
    tagColor: '#22C55E',
    image: '/landing/spotlight/worldstar-bio-kraft-takeaway-food-tub.png',
    width: 170,
    alt: "Worldstar Bio Takeaway Food Tub",
  },
]

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
                        <img
                          src={card.image}
                          alt={card.alt}
                          loading={idx < 20 ? 'eager' : 'lazy'}
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
                        <img
                          src={card.image}
                          alt={card.alt}
                          loading={idx < 20 ? 'eager' : 'lazy'}
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
