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
        minZoom: -4,
        maxZoom: 1, // Limit max zoom to avoid severe pixelation
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
      
      // Calculate tighter bounds for initial view (focus strictly on building, crop white margins)
      const buildingBounds: [[number, number], [number, number]] = [
        [imageHeight - 500, 50],
        [imageHeight - 200, 950]
      ]
      
      // Fit view to the building bounds
      map.fitBounds(buildingBounds)

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
      
      const polyline = L.polyline(latLngs, {
        color: '#7C3AED',
        weight: 4,
        opacity: 0.85,
        dashArray: '5, 5',
        className: 'route-polyline', // CSS class for hover glow added in globals.css
      }).addTo(map)

      layersRef.current.polyline = polyline

      // Draw small intermediate path dots
      routePath.forEach((node, index) => {
        if (index > 0 && index < routePath.length - 1) {
          const dotIcon = L.divIcon({
            html: `<div class="w-2.5 h-2.5 bg-border rounded-full border border-background shadow-subtle"></div>`,
            className: '',
            iconSize: [10, 10],
            iconAnchor: [5, 5],
          })
          const dotMarker = L.marker(getLatLng(node.x, node.y), { icon: dotIcon }).addTo(map)
          layersRef.current.intermediateMarkers.push(dotMarker)
        }
      })

      map.fitBounds(L.latLngBounds(latLngs), { padding: [55, 55], maxZoom: 0 })
    } else if (startNode) {
      map.setView(getLatLng(startNode.x, startNode.y), -1)
    }

    // 3. Draw Start Marker
    if (startNode) {
      const startIcon = L.divIcon({
        html: `
          <div class="relative flex items-center justify-center w-5 h-5 bg-[#10B981] rounded-full border-2 border-white shadow-medium">
            <span class="text-[10px] text-white font-bold">S</span>
          </div>
        `,
        className: '',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      })

      const startMarker = L.marker(getLatLng(startNode.x, startNode.y), { icon: startIcon }).addTo(map)
      startMarker.bindPopup(`<div class="text-secondary font-semibold p-1">📍 ${startNode.label}</div>`)
      layersRef.current.startMarker = startMarker
    }

    // 4. Draw End Marker
    if (destinationNode) {
      const endIcon = L.divIcon({
        html: `
          <div class="relative flex flex-col items-center justify-center w-5 h-5 bg-[#EF4444] rounded-full border-2 border-white shadow-medium">
            <span class="text-[10px] text-white font-bold">E</span>
          </div>
        `,
        className: '',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      })

      const endMarker = L.marker(getLatLng(destinationNode.x, destinationNode.y), { icon: endIcon }).addTo(map)
      endMarker.bindPopup(`<div class="text-secondary font-semibold p-1">🚩 ${destinationNode.label}</div>`)
      layersRef.current.endMarker = endMarker
    }
  }

  return (
    <div className="w-full h-full relative overflow-hidden rounded-card">
      <div ref={mapContainerRef} className="w-full h-full z-10 monochrome-map" />
    </div>
  )
}
