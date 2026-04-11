/**
 * @file GradualBlur.tsx
 * @project Owivara - Development
 *
 * Gradual Blur — a layered backdrop-filter blur effect that creates a smooth
 * gradient blur transitioning from transparent to full blur strength.
 *
 * Used at the bottom of the landing page to create a smooth fade-out effect
 * before the footer section.
 */

import React, { CSSProperties, useMemo } from 'react'

interface GradualBlurProps {
  position?: 'top' | 'bottom' | 'left' | 'right'
  strength?: number
  height?: string
  divCount?: number
  exponential?: boolean
  opacity?: number
  curve?: 'linear' | 'bezier' | 'ease-in' | 'ease-out' | 'ease-in-out'
  className?: string
  style?: CSSProperties
}

const CURVE_FUNCTIONS: Record<string, (p: number) => number> = {
  linear: (p) => p,
  bezier: (p) => p * p * (3 - 2 * p),
  'ease-in': (p) => p * p,
  'ease-out': (p) => 1 - Math.pow(1 - p, 2),
  'ease-in-out': (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2),
}

const getGradientDirection = (position: string): string => {
  const directions: Record<string, string> = {
    top: 'to top',
    bottom: 'to bottom',
    left: 'to left',
    right: 'to right',
  }
  return directions[position] || 'to bottom'
}

const GradualBlur: React.FC<GradualBlurProps> = ({
  position = 'bottom',
  strength = 2,
  height = '7rem',
  divCount = 5,
  exponential = false,
  opacity = 1,
  curve = 'bezier',
  className = '',
  style = {},
}) => {
  const blurDivs = useMemo(() => {
    const divs: React.ReactNode[] = []
    const increment = 100 / divCount
    const curveFunc = CURVE_FUNCTIONS[curve] || CURVE_FUNCTIONS.linear

    for (let i = 1; i <= divCount; i++) {
      let progress = i / divCount
      progress = curveFunc(progress)

      let blurValue: number
      if (exponential) {
        blurValue = Math.pow(2, progress * 4) * 0.0625 * strength
      } else {
        blurValue = 0.0625 * (progress * divCount + 1) * strength
      }

      const p1 = Math.round((increment * i - increment) * 10) / 10
      const p2 = Math.round(increment * i * 10) / 10
      const p3 = Math.round((increment * i + increment) * 10) / 10
      const p4 = Math.round((increment * i + increment * 2) * 10) / 10

      let gradient = `transparent ${p1}%, black ${p2}%`
      if (p3 <= 100) gradient += `, black ${p3}%`
      if (p4 <= 100) gradient += `, transparent ${p4}%`

      const direction = getGradientDirection(position)

      const divStyle: CSSProperties = {
        maskImage: `linear-gradient(${direction}, ${gradient})`,
        WebkitMaskImage: `linear-gradient(${direction}, ${gradient})`,
        backdropFilter: `blur(${blurValue.toFixed(3)}rem)`,
        opacity,
      }

      divs.push(<div key={i} className="absolute inset-0" style={divStyle} />)
    }

    return divs
  }, [position, strength, divCount, exponential, opacity, curve])

  const containerStyle: CSSProperties = useMemo(() => {
    const isVertical = ['top', 'bottom'].includes(position)

    const baseStyle: CSSProperties = {
      position: 'absolute',
      pointerEvents: 'none',
      zIndex: 1000,
      ...style,
    }

    if (isVertical) {
      baseStyle.height = height
      baseStyle.width = '100%'
      baseStyle[position] = 0
      baseStyle.left = 0
      baseStyle.right = 0
    }

    return baseStyle
  }, [position, height, style])

  return (
    <div className={`gradual-blur relative isolate ${className}`} style={containerStyle}>
      <div className="relative w-full h-full">{blurDivs}</div>
    </div>
  )
}

export default GradualBlur
