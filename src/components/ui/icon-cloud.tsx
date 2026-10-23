"use client"

import React, { useEffect, useRef, useState } from "react"
import { renderToString } from "react-dom/server"

interface Icon {
  x: number
  y: number
  z: number
  scale: number
  opacity: number
  id: number
}

interface IconCloudProps {
  icons?: React.ReactNode[]
  images?: string[]
  showControl?: boolean
  className?: string
  radius?: number
  iconSize?: number
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

function PauseIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16" rx="1.5" />
      <rect x="14" y="4" width="4" height="16" rx="1.5" />
    </svg>
  )
}

function PlayIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <polygon points="6 4 20 12 6 20 6 4" />
    </svg>
  )
}

export function IconCloud({
  icons,
  images,
  showControl = false,
  className = "",
  radius = 138,
  iconSize = 58,
}: IconCloudProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [iconPositions, setIconPositions] = useState<Icon[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 })
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [targetRotation, setTargetRotation] = useState<{
    x: number
    y: number
    startX: number
    startY: number
    distance: number
    startTime: number
    duration: number
  } | null>(null)
  const animationFrameRef = useRef<number>(0)
  const rotationRef = useRef({ x: 0, y: 0 })
  const iconCanvasesRef = useRef<HTMLCanvasElement[]>([])
  const imagesLoadedRef = useRef<boolean[]>([])

  // Pause animation if user prefers reduced motion
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (mediaQuery.matches) {
      setIsPaused(true)
    }

    const handleChange = (e: MediaQueryListEvent) => {
      setIsPaused(e.matches)
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  // Create high-resolution icon badge canvases once when icons/images change
  useEffect(() => {
    if (!icons && !images) return

    const items = icons ?? images ?? []
    imagesLoadedRef.current = new Array(items.length).fill(false)

    const BADGE_RES = 120 // High-res 120x120 for crisp rendering on retina displays

    const newIconCanvases = items.map((item, index) => {
      const offscreen = document.createElement("canvas")
      offscreen.width = BADGE_RES
      offscreen.height = BADGE_RES
      const offCtx = offscreen.getContext("2d")

      const renderBadgeWithImage = (img: HTMLImageElement) => {
        if (!offCtx) return
        offCtx.clearRect(0, 0, BADGE_RES, BADGE_RES)

        // Draw genuine app icon directly with natural 3D depth shadow
        offCtx.save()
        offCtx.shadowColor = "rgba(18, 20, 19, 0.16)"
        offCtx.shadowBlur = 10
        offCtx.shadowOffsetY = 4

        // Preserve natural aspect ratio so icons are never stretched or squished
        const maxW = BADGE_RES - 16
        const maxH = BADGE_RES - 16
        const imgW = img.naturalWidth || img.width || BADGE_RES
        const imgH = img.naturalHeight || img.height || BADGE_RES
        const scale = Math.min(maxW / imgW, maxH / imgH)
        const drawW = imgW * scale
        const drawH = imgH * scale
        const drawX = (BADGE_RES - drawW) / 2
        const drawY = (BADGE_RES - drawH) / 2

        offCtx.drawImage(img, drawX, drawY, drawW, drawH)
        offCtx.restore()

        imagesLoadedRef.current[index] = true
      }

      if (offCtx) {
        if (images) {
          const img = new Image()
          img.crossOrigin = "anonymous"
          img.src = items[index] as string
          img.onload = () => {
            renderBadgeWithImage(img)
          }
          img.onerror = () => {
            // Branded fallback
            offCtx.clearRect(0, 0, BADGE_RES, BADGE_RES)
            offCtx.beginPath()
            offCtx.arc(BADGE_RES / 2, BADGE_RES / 2, (BADGE_RES - 8) / 2, 0, Math.PI * 2)
            offCtx.fillStyle = "#1FA952"
            offCtx.fill()
            offCtx.fillStyle = "#FFFFFF"
            offCtx.font = "bold 26px sans-serif"
            offCtx.textAlign = "center"
            offCtx.textBaseline = "middle"
            offCtx.fillText(`${index + 1}`, BADGE_RES / 2, BADGE_RES / 2)
            imagesLoadedRef.current[index] = true
          }
        } else {
          try {
            const svgString = renderToString(item as React.ReactElement)
            const img = new Image()
            img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgString)))
            img.onload = () => {
              renderBadgeWithImage(img)
            }
          } catch {
            imagesLoadedRef.current[index] = true
          }
        }
      }
      return offscreen
    })

    iconCanvasesRef.current = newIconCanvases
  }, [icons, images])

  // Generate initial icon positions on a Fibonacci sphere with larger radius
  useEffect(() => {
    const items = icons ?? images ?? []
    const newIcons: Icon[] = []
    const numIcons = items.length || 24

    const offset = 2 / numIcons
    const increment = Math.PI * (3 - Math.sqrt(5))

    for (let i = 0; i < numIcons; i++) {
      const y = i * offset - 1 + offset / 2
      const r = Math.sqrt(1 - y * y)
      const phi = i * increment

      const x = Math.cos(phi) * r
      const z = Math.sin(phi) * r

      newIcons.push({
        x: x * radius,
        y: y * radius,
        z: z * radius,
        scale: 1,
        opacity: 1,
        id: i,
      })
    }
    setIconPositions(newIcons)
  }, [icons, images, radius])

  // Handle mouse events for interactive drag and click-to-center
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect || !canvasRef.current) return

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    iconPositions.forEach((icon) => {
      const cosX = Math.cos(rotationRef.current.x)
      const sinX = Math.sin(rotationRef.current.x)
      const cosY = Math.cos(rotationRef.current.y)
      const sinY = Math.sin(rotationRef.current.y)

      const rotatedX = icon.x * cosY - icon.z * sinY
      const rotatedZ = icon.x * sinY + icon.z * cosY
      const rotatedY = icon.y * cosX + rotatedZ * sinX

      const screenX = canvasRef.current!.width / 2 + rotatedX
      const screenY = canvasRef.current!.height / 2 + rotatedY

      const scale = (rotatedZ + 240) / 360
      const hitRadius = (iconSize / 2) * scale
      const dx = x - screenX
      const dy = y - screenY

      if (dx * dx + dy * dy < hitRadius * hitRadius) {
        const targetX = -Math.atan2(
          icon.y,
          Math.sqrt(icon.x * icon.x + icon.z * icon.z)
        )
        const targetY = Math.atan2(icon.x, icon.z)

        const currentX = rotationRef.current.x
        const currentY = rotationRef.current.y
        const distance = Math.sqrt(
          Math.pow(targetX - currentX, 2) + Math.pow(targetY - currentY, 2)
        )

        const duration = Math.min(1800, Math.max(650, distance * 900))

        setTargetRotation({
          x: targetX,
          y: targetY,
          startX: currentX,
          startY: currentY,
          distance,
          startTime: performance.now(),
          duration,
        })
        return
      }
    })

    setIsDragging(true)
    setLastMousePos({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      setMousePos({ x, y })
    }

    if (isDragging) {
      const deltaX = e.clientX - lastMousePos.x
      const deltaY = e.clientY - lastMousePos.y

      rotationRef.current = {
        x: rotationRef.current.x + deltaY * 0.0025,
        y: rotationRef.current.y + deltaX * 0.0025,
      }

      setLastMousePos({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Animation and rendering loop
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (canvas && ctx) {
      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        const centerX = canvas.width / 2
        const centerY = canvas.height / 2
        const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY)
        const dx = mousePos.x - centerX
        const dy = mousePos.y - centerY
        const distance = Math.sqrt(dx * dx + dy * dy)
        const speed = 0.0025 + (distance / maxDistance) * 0.008

        if (targetRotation) {
          const elapsed = performance.now() - targetRotation.startTime
          const progress = Math.min(1, elapsed / targetRotation.duration)
          const easedProgress = easeOutCubic(progress)

          rotationRef.current = {
            x:
              targetRotation.startX +
              (targetRotation.x - targetRotation.startX) * easedProgress,
            y:
              targetRotation.startY +
              (targetRotation.y - targetRotation.startY) * easedProgress,
          }

          if (progress >= 1) {
            setTargetRotation(null)
          }
        } else if (!isDragging && !isPaused) {
          rotationRef.current = {
            x: rotationRef.current.x + (dy / canvas.height) * speed,
            y: rotationRef.current.y + (dx / canvas.width) * speed,
          }
        }

        // Sort items by z-depth so frontal icons draw on top of background ones
        const renderedList = iconPositions.map((icon, index) => {
          const cosX = Math.cos(rotationRef.current.x)
          const sinX = Math.sin(rotationRef.current.x)
          const cosY = Math.cos(rotationRef.current.y)
          const sinY = Math.sin(rotationRef.current.y)

          const rotatedX = icon.x * cosY - icon.z * sinY
          const rotatedZ = icon.x * sinY + icon.z * cosY
          const rotatedY = icon.y * cosX + rotatedZ * sinX

          const scale = (rotatedZ + 240) / 360
          const opacity = Math.max(0.28, Math.min(1, (rotatedZ + 180) / 260))

          return {
            index,
            rotatedX,
            rotatedY,
            rotatedZ,
            scale,
            opacity,
            id: icon.id,
          }
        })

        // Sort ascending by rotatedZ (far to near)
        renderedList.sort((a, b) => a.rotatedZ - b.rotatedZ)

        renderedList.forEach((item) => {
          ctx.save()
          ctx.translate(
            canvas.width / 2 + item.rotatedX,
            canvas.height / 2 + item.rotatedY
          )
          ctx.scale(item.scale, item.scale)
          ctx.globalAlpha = item.opacity

          if (icons || images) {
            if (
              iconCanvasesRef.current[item.index] &&
              imagesLoadedRef.current[item.index]
            ) {
              ctx.drawImage(
                iconCanvasesRef.current[item.index],
                -iconSize / 2,
                -iconSize / 2,
                iconSize,
                iconSize
              )
            }
          } else {
            ctx.beginPath()
            ctx.arc(0, 0, iconSize / 2, 0, Math.PI * 2)
            ctx.fillStyle = "#1FA952"
            ctx.fill()
            ctx.fillStyle = "white"
            ctx.textAlign = "center"
            ctx.textBaseline = "middle"
            ctx.font = "bold 16px sans-serif"
            ctx.fillText(`${item.id + 1}`, 0, 0)
          }

          ctx.restore()
        })

        const hasPendingAssets =
          Boolean(icons || images) &&
          !imagesLoadedRef.current.every((loaded) => loaded)
        const shouldContinue =
          !isPaused || isDragging || targetRotation !== null || hasPendingAssets

        if (shouldContinue) {
          animationFrameRef.current = requestAnimationFrame(animate)
        }
      }

      animate()
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [
    icons,
    images,
    iconPositions,
    isDragging,
    isPaused,
    mousePos,
    targetRotation,
    iconSize,
  ])

  return (
    <div className={`relative inline-block ${className}`}>
      <canvas
        ref={canvasRef}
        width={420}
        height={420}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="rounded-lg cursor-grab active:cursor-grabbing max-w-full h-auto select-none"
        aria-label="Interactive 3D Icon Cloud"
        role="img"
      />
      {showControl && (
        <button
          type="button"
          onClick={() => setIsPaused(!isPaused)}
          aria-label={isPaused ? "Play Animation" : "Pause Animation"}
          className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-zinc-700 flex items-center justify-center border border-zinc-200 shadow-sm transition-all"
        >
          {isPaused ? <PlayIcon size={14} /> : <PauseIcon size={14} />}
        </button>
      )}
    </div>
  )
}
