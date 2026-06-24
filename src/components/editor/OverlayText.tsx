'use client'

import { Rnd } from 'react-rnd'
import { type TextStyle, type TimestampData } from './EditorWorkspace'

interface OverlayTextProps {
  data: TimestampData
  style: TextStyle
  bounds: string
  containerWidth: number
  containerHeight: number
}

export function OverlayText({ data, style, bounds, containerWidth, containerHeight }: OverlayTextProps) {
  // Styles for the container based on variant
  const getVariantStyles = (): React.CSSProperties => {
    switch (style.variant) {
      case 'shadow':
        return { textShadow: '2px 2px 4px rgba(0,0,0,0.8), -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }
      case 'box':
        return { backgroundColor: 'rgba(0,0,0,0.4)', padding: '10px 15px' } // No border radius, solid dark transparent bg
      case 'rounded':
        return { backgroundColor: 'rgba(0,0,0,0.4)', padding: '10px 15px', borderRadius: '12px' }
      case 'pill':
        return { backgroundColor: 'rgba(0,0,0,0.4)', padding: '8px 20px', borderRadius: '999px' }
      case 'plain':
      default:
        return {}
    }
  }

  // Estimate block width/height to position at bottom right
  const estWidth = 280
  const estHeight = 150
  const startX = Math.max(0, containerWidth - estWidth)
  const startY = Math.max(0, containerHeight - estHeight)

  return (
    <Rnd
      default={{
        x: startX,
        y: startY,
        width: 'auto',
        height: 'auto',
      }}
      bounds={bounds}
      enableResizing={false}
      className="cursor-move group"
      style={{ zIndex: 10 }}
    >
      <div 
        className={`whitespace-nowrap border-2 border-transparent group-hover:border-dashed group-hover:border-white/50 text-${style.align}`}
        style={{
          color: style.color,
          fontSize: `${style.size}px`,
          opacity: style.opacity / 100,
          fontFamily: 'Inter, system-ui, sans-serif',
          lineHeight: '1.2',
          ...getVariantStyles()
        }}
      >
        <div className="font-semibold mb-1">{data.date}</div>
        <div className="mb-1">{data.gps}</div>
        {data.loc1 && <div>{data.loc1}</div>}
        {data.loc2 && <div>{data.loc2}</div>}
        {data.loc3 && <div>{data.loc3}</div>}
        {data.loc4 && <div>{data.loc4}</div>}
      </div>
    </Rnd>
  )
}
