'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'

const stats = [
  { value: 1200,  suffix: '+',   label: 'orders processed on Gradient 365',    prefix: '', decimals: 0 },
  { value: 340,   suffix: '+',   label: 'active cafes on the platform',         prefix: '', decimals: 0 },
  { value: 98,    suffix: '%',   label: 'order fulfillment rate by suppliers',  prefix: '', decimals: 0 },
  { value: 4.8,   suffix: '/5',  label: 'average cafe satisfaction rating',     prefix: '', decimals: 1 },
]

function Counter({ to, suffix = '', prefix = '', decimals = 0, started }: { to: number; suffix?: string; prefix?: string; decimals?: number; started: boolean }) {
  const [val, setVal] = useState(0)
  const hasRun = useRef(false)

  useEffect(() => {
    if (!started || hasRun.current) return
    hasRun.current = true
    const duration = 1800
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(eased * to)
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [started, to])

  return <>{prefix}{val.toFixed(decimals)}{suffix}</>
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.3 } },
}
const itemVariants = {
  hidden:   { opacity: 0, y: 24 },
  visible:  { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

export default function StatsSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const started    = useInView(sectionRef, { once: true, amount: 0.3 })
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] })
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])

  return (
    <section ref={sectionRef} className="section" style={{ backgroundColor: '#fff', position: 'relative', overflow: 'hidden' }}>
      {/* Parallax background blob */}
      <motion.div
        style={{
          position: 'absolute', bottom: '-10%', right: '-10%', width: '60%', height: '80%',
          background: 'radial-gradient(ellipse, rgba(107,33,168,0.08) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none', y: bgY,
        }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Heading */}
        <motion.h2
          style={{ fontSize: 'clamp(28px, 3.5vw, 48px)', fontWeight: 300, letterSpacing: '-0.02em', color: '#061b31', textAlign: 'center', marginBottom: '64px' }}
          initial={{ opacity: 0, y: 30 }}
          animate={started ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          Built for India&apos;s<br />growing cafe economy
        </motion.h2>

        {/* Stats grid */}
        <motion.div
          style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '40px' }}
          variants={containerVariants}
          initial="hidden"
          animate={started ? 'visible' : 'hidden'}
        >
          {stats.map((stat, i) => (
            <motion.div key={i} variants={itemVariants} style={{ display: 'flex', flexDirection: 'column' }}>
              {/* Animated line */}
              <motion.div style={{ height: '2px', background: '#e6ebf1', marginBottom: '24px', transformOrigin: 'left' }}
                variants={{ hidden: { scaleX: 0 }, visible: { scaleX: 1, transition: { duration: 0.5 } } }}
              />
              {/* Counter */}
              <p style={{ fontSize: 'clamp(28px, 3vw, 44px)', fontWeight: 700, color: '#061b31', lineHeight: 1, marginBottom: '12px' }}>
                <Counter to={stat.value} suffix={stat.suffix} prefix={stat.prefix} decimals={stat.decimals} started={started} />
              </p>
              <p style={{ fontSize: '15px', color: '#425466', lineHeight: 1.5 }}>{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
