'use client'

import { useEffect, useRef } from 'react'
import type { GraphNode, GraphEdge } from '../utils/dijkstra'

interface IndoorMapProps {
  nodes: GraphNode[]
  edges: GraphEdge[]
  startNode: GraphNode | null
  destinationNode: GraphNode | null
  routePath: GraphNode[]
  imageUrl: string
  imageWidth: number
  imageHeight: number
  heading: number | null
}

export function IndoorMap({
  nodes,
  edges,
  startNode,
  destinationNode,
  routePath,
  imageUrl,
  imageWidth,
  imageHeight,
  heading,
}: IndoorMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const layersRef = useRef<{
    polyline: any | null
    startMarker: any | null
    endMarker: any | null
    intermediateMarkers: any[]
  }>({
    polyline: null,
    startMarker: null,
    endMarker: null,
    intermediateMarkers: [],
  })

  // Leaflet initialization
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return

    let L: any
    
    // Import Leaflet dynamically
    import('leaflet').then((leafletModule) => {
      L = leafletModule.default

      // Clean up previous map instance if any
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }

      // Initialize Map
      const map = L.map(mapContainerRef.current, {
        crs: L.CRS.Simple,
        minZoom: -1,
        maxZoom: 2,
        zoomControl: false,
        attributionControl: false,
      })

      // Add elegant dark theme zoom controls to bottom-right
      L.control.zoom({ position: 'bottomright' }).addTo(map)

      // Setup bounds matching image dimensions
      const bounds: [[number, number], [number, number]] = [
        [0, 0],
        [imageHeight, imageWidth],
      ]

      // Render image overlay
      L.imageOverlay(imageUrl, bounds).addTo(map)
      
      // Fit view to the bounds
      map.fitBounds(bounds)

      mapInstanceRef.current = map

      // Draw initial state
      updateMapLayers(L)
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl, imageWidth, imageHeight])

  // Update layers when nodes, edges, start, destination, or route path changes
  useEffect(() => {
    if (!mapInstanceRef.current) return
    import('leaflet').then((L) => {
      updateMapLayers(L.default)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startNode, destinationNode, routePath, nodes, edges, heading])

  // Function to draw overlays
  const updateMapLayers = (L: any) => {
    const map = mapInstanceRef.current
    if (!map) return

    // 1. Clear previous layers
    if (layersRef.current.polyline) {
      map.removeLayer(layersRef.current.polyline)
      layersRef.current.polyline = null
    }
    if (layersRef.current.startMarker) {
      map.removeLayer(layersRef.current.startMarker)
      layersRef.current.startMarker = null
    }
    if (layersRef.current.endMarker) {
      map.removeLayer(layersRef.current.endMarker)
      layersRef.current.endMarker = null
    }
    layersRef.current.intermediateMarkers.forEach((marker) => map.removeLayer(marker))
    layersRef.current.intermediateMarkers = []

    // Helper: Flip Y-axis coordinate for Leaflet Simple CRS
    const getLatLng = (x: number, y: number) => {
      return [imageHeight - y, x]
    }

    // 2. Draw active route polyline
    if (routePath && routePath.length > 1) {
      const latLngs = routePath.map((node) => getLatLng(node.x, node.y))
      
      // Draw high tech glowing blue polyline
      const polyline = L.polyline(latLngs, {
        color: '#2563EB',
        weight: 5,
        opacity: 0.95,
        className: 'route-polyline-flow', // Add animation class
      }).addTo(map)

      layersRef.current.polyline = polyline

      // Draw small intermediate path dots
      routePath.forEach((node, index) => {
        if (index > 0 && index < routePath.length - 1) {
          const dotIcon = L.divIcon({
            html: `<div class="w-2.5 h-2.5 bg-slate-400 rounded-full border border-white shadow"></div>`,
            className: '',
            iconSize: [10, 10],
            iconAnchor: [5, 5],
          })
          const dotMarker = L.marker(getLatLng(node.x, node.y), { icon: dotIcon }).addTo(map)
          layersRef.current.intermediateMarkers.push(dotMarker)
        }
      })

      // Fit map to show the entire route with a nice padding
      map.fitBounds(L.latLngBounds(latLngs), { padding: [55, 55] })
    } else if (startNode) {
      // Just focus on start node if no route yet
      map.setView(getLatLng(startNode.x, startNode.y), 0)
    }

    // 3. Draw Start Marker (Pulsating green radar icon)
    if (startNode) {
      const startIcon = L.divIcon({
        html: `
          <div class="relative flex items-center justify-center w-8 h-8">
            <span class="absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-50 animate-ping"></span>
            <div class="relative w-4.5 h-4.5 bg-[#10B981] rounded-full border-2 border-white flex items-center justify-center shadow">
              <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
            ${heading !== null ? `
              <div class="absolute -top-3.5 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[9px] border-b-[#10B981] drop-shadow-[0_0_2px_rgba(16,185,129,0.8)]" style="transform: rotate(${heading}deg); transform-origin: 50% 20px;"></div>
            ` : ''}
          </div>
        `,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      })

      const startMarker = L.marker(getLatLng(startNode.x, startNode.y), { icon: startIcon }).addTo(map)
      startMarker.bindPopup(`<div class="text-slate-900 font-semibold p-1">📌 ${startNode.label}</div>`)
      layersRef.current.startMarker = startMarker
    }

    // 4. Draw End Marker (Modern elegant red pin)
    if (destinationNode) {
      const endIcon = L.divIcon({
        html: `
          <div class="relative flex flex-col items-center justify-end w-8 h-8 animate-bounce">
            <svg viewBox="0 0 24 24" fill="none" class="w-8 h-8 drop-shadow-md">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5Z" fill="#EF4444" stroke="#FFFFFF" stroke-width="1.5"/>
            </svg>
          </div>
        `,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 30],
      })

      const endMarker = L.marker(getLatLng(destinationNode.x, destinationNode.y), { icon: endIcon }).addTo(map)
      endMarker.bindPopup(`<div class="text-slate-900 font-semibold p-1">🚩 ${destinationNode.label}</div>`)
      layersRef.current.endMarker = endMarker
    }
  }

  return (
    <div className="w-full h-full relative bg-slate-100 overflow-hidden rounded-3xl border border-slate-200 shadow-sm">
      <div ref={mapContainerRef} className="w-full h-full z-10 monochrome-map" />

      {/* Simulated Map Controls Info Overlays */}
      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-200/80 text-xs text-slate-500 flex items-center gap-2 z-20 shadow-sm">
        <div className="w-1.5 h-1.5 bg-[#10B981] rounded-full"></div>
        <span>Seret untuk menggeser (Pan)</span>
        <span className="text-slate-300">|</span>
        <div className="w-1.5 h-1.5 bg-[#2563EB] rounded-full"></div>
        <span>Cubit / Scroll untuk memperbesar (Zoom)</span>
      </div>
    </div>
  )
}
