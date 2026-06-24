'use client'

import { Rnd } from 'react-rnd'
import { type MapData } from './EditorWorkspace'
import { useEffect, useState, useMemo } from 'react'

interface OverlayMapProps {
  data: MapData
  bounds: string
  containerWidth: number
  containerHeight: number
}

export function OverlayMap({ data, bounds, containerWidth, containerHeight }: OverlayMapProps) {
  // OpenStreetMap tile URL calculation
  const getTileUrl = (lat: number, lon: number, zoom: number, xOffset = 0, yOffset = 0) => {
    const latRad = (lat * Math.PI) / 180
    const n = Math.pow(2, zoom)
    const xtile = Math.floor((lon + 180.0) / 360.0 * n) + xOffset
    const ytile = Math.floor((1.0 - Math.log(Math.tan(latRad) + (1 / Math.cos(latRad))) / Math.PI) / 2.0 * n) + yOffset
    return `https://tile.openstreetmap.org/${zoom}/${xtile}/${ytile}.png`
  }

  // Generate 3x3 grid for the map (center tile + 8 surrounding)
  const tiles = useMemo(() => {
    if (data.lat === null || data.lng === null) return []
    const newTiles = []
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        newTiles.push({
          url: getTileUrl(data.lat, data.lng, data.zoom, dx, dy),
          key: `${dx},${dy}`
        })
      }
    }
    return newTiles
  }, [data.lat, data.lng, data.zoom])

  if (data.lat === null || data.lng === null) return null

  const startY = Math.max(0, containerHeight - 150)

  return (
    <Rnd
      default={{
        x: 0,
        y: startY,
        width: 150,
        height: 150,
      }}
      bounds={bounds}
      lockAspectRatio={true}
      className="cursor-move group"
      style={{ 
        zIndex: 10,
        opacity: data.opacity / 100
      }}
      onResize={(e, direction, ref) => {
        // We could update size state here if we want 2-way binding, 
        // but for now relying on Rnd's internal state is fine for dragging/resizing
      }}
    >
      <div 
        className="relative w-full h-full overflow-hidden group-hover:outline group-hover:outline-2 group-hover:outline-blue-400 bg-[#e5e3df]"
      >
        <div 
          className="absolute inset-0 grid grid-cols-3 grid-rows-3 transform scale-150" 
          style={{ width: '300%', height: '300%', left: '-100%', top: '-100%' }}
        >
          {tiles.map((tile) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={tile.key} src={tile.url} alt="map tile" className="w-full h-full object-cover" crossOrigin="anonymous" />
          ))}
        </div>
        {/* Red Pin */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[100%] drop-shadow-md">
          <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" strokeWidth="2" fill="#ef4444" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3" fill="white"></circle>
          </svg>
        </div>
      </div>
    </Rnd>
  )
}
