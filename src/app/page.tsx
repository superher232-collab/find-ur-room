'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import graphData from '../../public/data/building-graph.json'
import { findShortestPath, type GraphNode, type GraphEdge } from '../utils/dijkstra'

// Dynamically import IndoorMap component with SSR disabled to bypass Leaflet window errors
const DynamicIndoorMap = dynamic(
  () => import('../components/IndoorMap').then((mod) => mod.IndoorMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 border border-slate-200 rounded-3xl shadow-sm">
        <div className="relative w-12 h-12 animate-spin rounded-full border-3 border-t-[#2563EB] border-r-transparent border-b-[#2563EB]/25 border-l-transparent"></div>
        <p className="mt-4 text-xs text-slate-500 font-semibold">Memuat Peta Navigasi...</p>
      </div>
    ),
  }
)

// Dynamically import QrScanner component with SSR disabled to bypass SSR window errors
const DynamicQrScanner = dynamic(
  () => import('../components/QrScanner').then((mod) => mod.QrScanner),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="glass-panel rounded-3xl p-5 w-full max-w-[360px] shadow-2xl flex flex-col items-center justify-center bg-white">
          <div className="relative w-10 h-10 animate-spin rounded-full border-3 border-t-[#2563EB] border-slate-200"></div>
          <p className="mt-4 text-xs font-semibold text-slate-500">Membuka Kamera...</p>
        </div>
      </div>
    ),
  }
)

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-650">
      <div className="w-10 h-10 rounded-full border-3 border-t-[#2563EB] border-slate-200 animate-spin"></div>
      <p className="mt-4 text-xs font-semibold text-slate-550">Menyiapkan Aplikasi...</p>
    </div>
  )
}

function HomeContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Load and preprocess building data directly from imported JSON to preserve raw JSON structure
  const nodes = (graphData.nodes as any[]).map((node) => {
    let label = ''
    if (node.type === 'room') {
      const rawName = node.name || `Ruangan ${node.id}`
      label = rawName
        .split(' ')
        .map((word: string) => {
          if (word.toUpperCase() === 'RPB') return 'RPB'
          return word.charAt(0).toUpperCase() + word.slice(1)
        })
        .join(' ')
    } else {
      const transitLabels: Record<number, string> = {
        0: 'Selasar Tangga Kanan',
        2: 'Selasar Tangga Kiri',
        4: 'Selasar Lift',
        6: 'Ujung Lorong Timur',
        7: 'Selasar Ruang Seminar',
        9: 'Selasar Lab RPB',
        11: 'Selasar Ruang Dosen',
      }
      label = transitLabels[node.id] || `Transit ${node.id}`
    }

    let instruction = ''
    if (node.type === 'room') {
      instruction = `Anda telah sampai di ${label}`
    } else {
      instruction = `Berjalan melewati ${label}`
    }

    return {
      id: String(node.id),
      label: label,
      x: node.x,
      y: node.y,
      floor: 2,
      type: node.type === 'transit' ? 'junction' : node.type,
      instruction: instruction,
    } as GraphNode
  })

  const edges = (graphData.edges as any[]).map((edge) => {
    return {
      from: String(edge.from),
      to: String(edge.to),
      weight: edge.weight,
      direction: 'straight'
    } as GraphEdge
  })

  const metadata = {
    building: "Gedung FTI UAJY - Custom Lantai 2",
    floor: 2,
    imageWidth: 1000,
    imageHeight: 707,
    imageUrl: "/maps/Lantai 2.png"
  }

  // State Management
  const [startNodeId, setStartNodeId] = useState<string>('')
  const [destinationId, setDestinationId] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [routeResult, setRouteResult] = useState<{ path: GraphNode[]; totalWeight: number } | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [showSearchDropdown, setShowSearchDropdown] = useState<boolean>(false)
  const [isOffline, setIsOffline] = useState<boolean>(false)
  const [showSimulator, setShowSimulator] = useState<boolean>(false)
  const [locationConfirmed, setLocationConfirmed] = useState<string>('')
  const [showCameraScanner, setShowCameraScanner] = useState<boolean>(false)

  // Real-time GPS & Compass Sensor States
  const [gpsActive, setGpsActive] = useState<boolean>(false)
  const [userHeading, setUserHeading] = useState<number | null>(null)
  const [watchId, setWatchId] = useState<number | null>(null)

  // GPS Calibration constants mapping to FTI UAJY Kampus 3 boundaries
  const LAT_MIN = -7.778550
  const LAT_MAX = -7.778100
  const LNG_MIN = 110.415800
  const LNG_MAX = 110.416550

  // Detect Offline Mode
  useEffect(() => {
    setIsOffline(!navigator.onLine)
    const goOnline = () => setIsOffline(false)
    const goOffline = () => setIsOffline(true)

    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)

    // Register Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(
        (reg) => console.log('[Service Worker] Registration successful with scope:', reg.scope),
        (err) => console.error('[Service Worker] Registration failed:', err)
      )
    }

    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  // Geolocation Sensor cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchId !== null && typeof window !== 'undefined' && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [watchId])

  // Parse URL Query Parameter for ?start=
  useEffect(() => {
    const startQuery = searchParams.get('start')
    if (startQuery) {
      const match = nodes.find((node) => node.id === startQuery)
      if (match) {
        setStartNodeId(match.id)
        setErrorMessage('')
        
        // Show confirmation toast
        setLocationConfirmed(match.label)
        const timer = setTimeout(() => setLocationConfirmed(''), 3500)
        return () => clearTimeout(timer)
      } else {
        setErrorMessage(`Titik QR "${startQuery}" tidak ditemukan pada denah gedung ini.`)
      }
    }
  }, [searchParams, nodes])


  // iOS Device Orientation permission handler
  const requestOrientationPermission = async (): Promise<boolean> => {
    if (
      typeof window !== 'undefined' &&
      typeof (DeviceOrientationEvent as any).requestPermission === 'function'
    ) {
      try {
        const permissionState = await (DeviceOrientationEvent as any).requestPermission()
        return permissionState === 'granted'
      } catch (error) {
        console.error('Error requesting compass permission:', error)
        return false
      }
    }
    return true
  }

  // Toggle GPS sensor tracking (Real-time indoor wayfinding)
  const toggleGps = async () => {
    if (gpsActive) {
      if (watchId !== null && typeof window !== 'undefined' && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchId)
        setWatchId(null)
      }
      setGpsActive(false)
      setUserHeading(null)
      setErrorMessage('')
    } else {
      if (typeof window !== 'undefined' && 'geolocation' in navigator) {
        setErrorMessage('')
        
        // Request compass permission on iOS devices
        await requestOrientationPermission()

        const id = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude } = position.coords
            
            // 1. Interpolate latitude & longitude to image pixel coordinates
            let x = ((longitude - LNG_MIN) / (LNG_MAX - LNG_MIN)) * metadata.imageWidth
            let y = ((LAT_MAX - latitude) / (LAT_MAX - LAT_MIN)) * metadata.imageHeight
            
            // 2. Clamp coordinates inside boundary canvas
            x = Math.max(0, Math.min(metadata.imageWidth, x))
            y = Math.max(0, Math.min(metadata.imageHeight, y))
            
            // 3. Snap to nearest node (Snaps ONLY to route path nodes if active route exists!)
            const activeNodes = (routeResult && routeResult.path.length > 0) ? routeResult.path : nodes
            let closestNode = activeNodes[0]
            let minDistance = Infinity
            
            activeNodes.forEach((node) => {
              const dist = Math.sqrt(Math.pow(node.x - x, 2) + Math.pow(node.y - y, 2))
              if (dist < minDistance) {
                minDistance = dist
                closestNode = node
              }
            })
            
            // 4. Update position anchor dynamically
            setStartNodeId(closestNode.id)
            setErrorMessage('')

            // 5. Dynamic Real-time route path shrinking & arrived detection
            if (destinationId) {
              if (closestNode.id === destinationId) {
                // User arrived at destination node
                setRouteResult(null)
                setDestinationId('')
                setSearchTerm('')
                setErrorMessage('Selamat! Anda telah sampai di tujuan.')
                
                // Clear tracking after arrival
                navigator.geolocation.clearWatch(id)
                setWatchId(null)
                setGpsActive(false)
                setUserHeading(null)
              } else {
                // Shrink route dynamically
                const shortenedRoute = findShortestPath(nodes, edges, closestNode.id, destinationId)
                if (shortenedRoute) {
                  setRouteResult(shortenedRoute)
                }
              }
            }
          },
          (error) => {
            console.error('GPS Geolocation error:', error)
            setErrorMessage('Gagal mengakses GPS. Pastikan izin lokasi HP Anda aktif.')
            setGpsActive(false)
          },
          { enableHighAccuracy: true, maximumAge: 0, timeout: 8000 }
        )
        setWatchId(id)
        setGpsActive(true)
 
        // Read orientation compass dynamic rotation (Compass support)
        const handleOrientation = (e: DeviceOrientationEvent) => {
          const heading = (e as any).webkitCompassHeading || e.alpha
          if (heading !== undefined && heading !== null) {
            setUserHeading(Math.round(heading))
          }
        }
        window.addEventListener('deviceorientation', handleOrientation)
      } else {
        setErrorMessage('Sensor lokasi GPS tidak didukung oleh perangkat ini.')
      }
    }
  }

  // Handlers
  const handleCalculateRoute = () => {
    if (!startNodeId || !destinationId) return

    if (startNodeId === destinationId) {
      setErrorMessage('Posisi awal dan tujuan tidak boleh sama.')
      setRouteResult(null)
      return
    }

    const result = findShortestPath(nodes, edges, startNodeId, destinationId)
    if (result) {
      setRouteResult(result)
      setErrorMessage('')
    } else {
      setErrorMessage('Tidak ditemukan jalur yang menghubungkan titik ini. Hubungi pengelola gedung.')
      setRouteResult(null)
    }
  }

  const handleManualStartChange = (id: string) => {
    setStartNodeId(id)
    setErrorMessage('')
    setRouteResult(null)
    router.replace('/')
  }

  const handleDestinationSelect = (node: GraphNode) => {
    setDestinationId(node.id)
    setSearchTerm(node.label)
    setShowSearchDropdown(false)
    setErrorMessage('')
    setRouteResult(null)
  }

  // Tombol 'Sudah Sampai' (Flexible Update - FR-05.4 / FR-05.5)
  const handleArrived = () => {
    if (!destinationId) return
    const prevDestination = destinationId
    setDestinationId('')
    setSearchTerm('')
    setRouteResult(null)
    setErrorMessage('')
    setStartNodeId(prevDestination)
    router.replace('/')
  }

  // Camera scan success handler (F-01 / FR-01.5)
  const handleCameraScanSuccess = (decodedText: string) => {
    let nodeId = ''
    try {
      if (decodedText.startsWith('http://') || decodedText.startsWith('https://')) {
        const url = new URL(decodedText)
        const startParam = url.searchParams.get('start')
        if (startParam) {
          nodeId = startParam
        }
      } else {
        nodeId = decodedText.trim()
      }
    } catch (e) {
      nodeId = decodedText.trim()
    }

    if (nodeId) {
      const match = nodes.find((node) => node.id === nodeId)
      if (match) {
        setStartNodeId(match.id)
        setErrorMessage('')
        setLocationConfirmed(match.label)
        setShowCameraScanner(false)
        
        router.push(`/?start=${match.id}`)
        
        const timer = setTimeout(() => setLocationConfirmed(''), 3500)
        return () => clearTimeout(timer)
      } else {
        setErrorMessage(`Titik QR "${nodeId}" tidak ditemukan pada denah gedung ini.`)
        setShowCameraScanner(false)
      }
    } else {
      setErrorMessage('Format QR Code tidak valid.')
      setShowCameraScanner(false)
    }
  }

  const handleCameraScanError = (error: string) => {
    console.warn('QR scan error:', error)
  }

  // Simulate scanning a physical QR code
  const simulateQRScan = (id: string) => {
    router.push(`/?start=${id}`)
  }

  // Filtering only 'room' nodes for destination autocomplete search
  const destinationRooms = nodes.filter((node) => node.type === 'room')
  const filteredRooms = destinationRooms.filter((room) =>
    room.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const activeStartNode = nodes.find((n) => n.id === startNodeId) || null
  const activeDestinationNode = nodes.find((n) => n.id === destinationId) || null

  // Metric scale computations
  const scaleFactor = 0.4 // 1 pixel = 0.4 meters
  const rawWeight = routeResult?.totalWeight || 0
  const meters = rawWeight * scaleFactor
  
  // Calculate walking time text based on 1.2 m/s average speed
  const getWalkingTimeText = (distanceMeters: number) => {
    const seconds = distanceMeters / 1.2
    if (seconds < 60) {
      return `${Math.round(seconds)} detik`
    }
    const minutes = Math.ceil(seconds / 60)
    return `${minutes} menit`
  }

  // Generate customized step-by-step route progress with JSON fields
  const getRouteSteps = (path: GraphNode[]) => {
    return path.map((node, idx) => {
      const isLast = idx === path.length - 1
      const nextNode = isLast ? null : path[idx + 1]

      // Retrieve edge information to find direction and pixel weight
      const edge = nextNode
        ? edges.find(
            (e) =>
              (e.from === node.id && e.to === nextNode.id) ||
              (e.from === nextNode.id && e.to === node.id)
          )
        : null

      const stepWeight = edge ? edge.weight : 0
      const stepMeters = stepWeight * scaleFactor
      const direction = isLast ? 'arrive' : (edge as any)?.direction || 'straight'
      const instruction = node.instruction || `${isLast ? 'Tiba di' : 'Lurus melewati'} ${node.label}`

      return {
        node,
        instruction,
        direction,
        meters: stepMeters,
      }
    })
  }

  const startNodeIdx = routeResult ? routeResult.path.findIndex(n => n.id === startNodeId) : -1
  const steps = routeResult ? getRouteSteps(routeResult.path) : []

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-50 select-none">
      
      {/* 1. Immersive Map Layer (Occupies 100% bounds) */}
      <section className="absolute inset-0 w-full h-full z-10">
        <DynamicIndoorMap
          nodes={nodes}
          edges={edges}
          startNode={activeStartNode}
          destinationNode={activeDestinationNode}
          routePath={routeResult?.path || []}
          imageUrl={metadata.imageUrl}
          imageWidth={metadata.imageWidth}
          imageHeight={metadata.imageHeight}
          heading={userHeading}
        />
      </section>

      {/* 2. Floating Header & Search Overlay Sheet */}
      <div className="absolute top-4 left-4 right-4 lg:left-6 lg:top-6 lg:w-[380px] lg:right-auto z-20 flex flex-col gap-3">
        <div className="glass-panel rounded-3xl p-5 shadow-sm flex flex-col gap-4 relative overflow-hidden">
          {/* Brand Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-[#2563EB]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
              </div>
              <div>
                <h1 className="text-sm font-black tracking-tight text-slate-800 flex items-center gap-1 leading-none">
                  Find Ur Room
                  <span className="text-[8px] bg-blue-50 border border-blue-100 text-[#2563EB] font-bold px-1.5 py-0.5 rounded tracking-wider uppercase">Basement</span>
                </h1>
              </div>
            </div>
            
            {/* Status Badges */}
            <div className="flex items-center gap-1">
              {isOffline ? (
                <span className="text-[9px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">OFFLINE</span>
              ) : (
                <span className="text-[9px] font-bold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">ONLINE</span>
              )}
            </div>
          </div>

          {/* Dual-row inputs (green dot origin, red dot destination) with dotted vertical connector */}
          <div className="relative flex flex-col gap-4 pl-7 mt-1">
            {/* Vertical dotted connector line between dots */}
            <div className="absolute left-3 top-3 bottom-3 w-px border-l-2 border-dotted border-slate-300 z-10"></div>
            
            {/* Row 1: Origin */}
            <div className="relative flex items-center gap-3">
              {/* Green dot */}
              <div className="absolute -left-[23px] w-2.5 h-2.5 bg-[#10B981] rounded-full z-20 ring-4 ring-[#10B981]/15"></div>
              <div className="relative w-full">
                <select
                  value={startNodeId}
                  onChange={(e) => handleManualStartChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-3 pr-8 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#2563EB]/80 cursor-pointer appearance-none shadow-sm"
                >
                  <option value="" disabled className="text-slate-400">Pilih titik awal...</option>
                  {nodes
                    .slice()
                    .sort((a, b) => a.label.localeCompare(b.label))
                    .map((node) => (
                      <option key={node.id} value={node.id} className="bg-white text-slate-700">
                        {node.label}
                      </option>
                    ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3 h-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Row 2: Destination */}
            <div className="relative flex items-center gap-3">
              {/* Red dot */}
              <div className="absolute -left-[23px] w-2.5 h-2.5 bg-[#EF4444] rounded-full z-20 ring-4 ring-[#EF4444]/15"></div>
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setShowSearchDropdown(true)
                    if (!e.target.value) setDestinationId('')
                  }}
                  onFocus={() => setShowSearchDropdown(true)}
                  placeholder="Cari ruangan tujuan..."
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-3 pr-8 py-2 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#2563EB]/80 shadow-sm"
                />
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm('')
                      setDestinationId('')
                      setRouteResult(null)
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-450 hover:text-slate-650 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Dropdown autocomplete items */}
              {showSearchDropdown && searchTerm && (
                <div className="absolute top-[44px] left-0 right-0 bg-white border border-slate-200/90 rounded-xl shadow-xl max-h-44 overflow-y-auto z-45">
                  {filteredRooms.length > 0 ? (
                    filteredRooms.map((room) => (
                      <button
                        key={room.id}
                        onClick={() => handleDestinationSelect(room)}
                        className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between border-b border-slate-100 last:border-0 transition-colors"
                      >
                        <span className="font-semibold">{room.label}</span>
                        <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-450 font-bold">Lantai {room.floor}</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-3.5 py-2 text-xs text-slate-400 text-center">Ruangan tidak ditemukan</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Trigger routing calculations */}
          <button
            onClick={handleCalculateRoute}
            disabled={!startNodeId || !destinationId}
            className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all duration-300 ${
              startNodeId && destinationId
                ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/10 hover:bg-blue-600 active:scale-[0.98]'
                : 'bg-slate-100 text-slate-400 border border-slate-200/60 cursor-not-allowed'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.03L2.01 12 9 17.97m6-11.94L21.99 12 15 17.97M12 3v18" />
            </svg>
            Cari Rute Navigasi
          </button>

          {/* Error notifications */}
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 text-[10px] px-3.5 py-2.5 rounded-xl flex items-start gap-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0 mt-0.5">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              <span className="leading-snug font-semibold">{errorMessage}</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. Floating Bottom Sheet (Guide Stepper instructions) */}
      {routeResult && (
        <div className="absolute bottom-4 left-4 right-4 lg:bottom-6 lg:left-6 lg:w-[380px] lg:right-auto z-20 flex flex-col gap-3">
          <div className="glass-panel rounded-3xl p-4 pb-4.5 shadow-md flex flex-col gap-3 relative border border-slate-200">
            {/* Drag Handle representation */}
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-1"></div>
            
            {/* Summary Row: Icon + "Asal → Tujuan" + Jarak + Waktu */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-3">
                {/* Clean blue arrow symbol indicator */}
                <div className="w-8.5 h-8.5 rounded-xl bg-blue-50 flex items-center justify-center text-[#2563EB]">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 15l3-3m0 0l-3-3m3 3h-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 leading-none">
                    <span>{activeStartNode?.label}</span>
                    <span className="text-slate-400">→</span>
                    <span>{activeDestinationNode?.label}</span>
                  </h3>
                  <p className="text-[10px] font-bold text-slate-500 mt-1">
                    {meters.toFixed(1)} m • {getWalkingTimeText(meters)} jalan kaki
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => {
                  setRouteResult(null)
                  setDestinationId('')
                  setSearchTerm('')
                }}
                className="w-6 h-6 rounded-full bg-slate-50 border border-slate-200/50 hover:bg-slate-100 flex items-center justify-center text-slate-450 hover:text-slate-700 transition-colors"
                title="Batalkan navigasi"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>

            {/* Steps Stepper List with dynamic checking states */}
            <div className="relative pl-6.5 flex flex-col gap-4 py-1.5 max-h-40 overflow-y-auto pr-1">
              <div className="absolute left-2.5 top-2.5 bottom-2.5 w-px bg-slate-200"></div>

              {steps.map((step, idx) => {
                const isCompleted = idx < startNodeIdx
                const isActive = idx === startNodeIdx
                const isNext = idx > startNodeIdx

                // SVG Direction icons
                const getDirectionIcon = (dir: string) => {
                  switch (dir) {
                    case 'turn_left':
                      return (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3 h-3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
                        </svg>
                      )
                    case 'turn_right':
                      return (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3 h-3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 0 0 0 12h3" />
                        </svg>
                      )
                    case 'arrive':
                      return (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3 h-3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-5.605-11.345.75.75 0 0 0-1.248-.056 9 9 0 0 0-5.602 6.57L3 15Z" />
                        </svg>
                      )
                    default:
                      return (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3 h-3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
                        </svg>
                      )
                  }
                }

                return (
                  <div key={`${step.node.id}-${idx}`} className="relative flex flex-col gap-0.5">
                    {/* Visual check circles */}
                    <div className={`absolute -left-[21.5px] top-0.5 w-5.5 h-5.5 rounded-full border flex items-center justify-center transition-all ${
                      isCompleted 
                        ? 'bg-[#10B981] border-[#10B981] text-white shadow-sm' 
                        : isActive 
                        ? 'bg-[#2563EB] border-[#2563EB] text-white shadow shadow-blue-500/20' 
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}>
                      {isCompleted ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor" className="w-3 h-3 text-white">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                      ) : (
                        getDirectionIcon(step.direction)
                      )}
                    </div>

                    <span className={`text-[11px] font-bold ${
                      isCompleted ? 'text-slate-400 line-through decoration-slate-300' : isActive ? 'text-slate-800' : 'text-slate-500'
                    }`}>
                      {step.instruction}
                    </span>
                    
                    {step.meters > 0 && !isCompleted && (
                      <span className={`text-[9.5px] font-bold mt-0.5 ${isActive ? 'text-[#2563EB]' : 'text-slate-400'}`}>
                        Jalan lurus selama {step.meters.toFixed(1)} m ke langkah berikutnya
                      </span>
                    )}
                  </div>
                )
              })}
            </div>

            {/* "Sudah Sampai" button */}
            <button
              onClick={handleArrived}
              className="w-full py-2 bg-[#10B981] hover:bg-emerald-500 text-white rounded-xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-[0.98]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
              </svg>
              Sudah Sampai di Tujuan
            </button>
          </div>
        </div>
      )}

      {/* 4. Floating Action Buttons (FABs) in bottom-right corner */}
      <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-2.5">
        {/* Camera Scan FAB (F-01 / FR-01.5) */}
        <button
          onClick={() => setShowCameraScanner(true)}
          className="w-11 h-11 rounded-full flex items-center justify-center border shadow-md bg-white border-slate-200 text-slate-655 hover:text-slate-800 hover:border-slate-350 shadow active:scale-90 transition-all duration-300"
          title="Scan QR Code Lokasi"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5.5 h-5.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
          </svg>
        </button>

        {/* GPS activation FAB */}
        <button
          onClick={toggleGps}
          className={`w-11 h-11 rounded-full flex items-center justify-center border shadow-md backdrop-blur-md transition-all duration-300 active:scale-90 ${
            gpsActive
              ? 'bg-[#10B981] border-[#10B981] text-white ring-4 ring-[#10B981]/15'
              : 'bg-white border-slate-200 text-slate-600 hover:text-slate-800 hover:border-slate-350 shadow'
          }`}
          title="Aktifkan GPS Pelacak HP"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5.5 h-5.5 ${gpsActive ? 'animate-pulse' : ''}`}>
            <path fillRule="evenodd" d="M9.69 18.933a.75.75 0 01-.38-.636V12.75H3.003a.75.75 0 01-.636-.38.75.75 0 010-.74l14.25-9.5a.75.75 0 011.016.966l-7.003 15.5a.75.75 0 01-.94.337z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Developer QR Simulator FAB Toggle button */}
        <button
          onClick={() => setShowSimulator(!showSimulator)}
          className={`w-11 h-11 rounded-full flex items-center justify-center border shadow-md backdrop-blur-md transition-all duration-300 active:scale-90 ${
            showSimulator
              ? 'bg-[#2563EB] border-[#2563EB] text-white ring-4 ring-[#2563EB]/15'
              : 'bg-white border-slate-200 text-slate-600 hover:text-slate-800 hover:border-slate-355 shadow'
          }`}
          title="Simulasikan Scan QR Code"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5.5 h-5.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 15h.008v.008H15V15Zm0 2.25h.008v.008H15v-.008ZM17.25 15h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008ZM15 12.75h.008v.008H15v-.008Zm2.25 0h.008v.008h-.008v-.008ZM12.75 15h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008ZM12.75 12.75h.008v.008h-.008v-.008Z" />
          </svg>
        </button>
      </div>

      {/* 5. Collapsible QR Code Station Simulator Drawer Modal */}
      {showSimulator && (
        <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm z-30 flex items-center justify-center p-4">
          <div className="glass-panel rounded-3xl p-5.5 w-full max-w-[340px] shadow-lg flex flex-col gap-3.5 relative overflow-hidden animate-fade-in border border-slate-200">
            {/* Header / Dismiss */}
            <div className="flex flex-col gap-1 pr-6 border-b border-slate-100 pb-2.5">
              <button
                onClick={() => setShowSimulator(false)}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-650"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
              
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 leading-none">
                <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse"></span>
                Simulator QR
              </h3>
              <p className="text-[10px] text-slate-550 leading-snug mt-1 font-semibold">
                Pilih stiker QR stasiun lorong di bawah untuk mensimulasikan pemindaian kamera fisik secara instan:
              </p>
            </div>

            {/* Simulator Grid */}
            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                onClick={() => {
                  simulateQRScan('1')
                  setShowSimulator(false)
                }}
                className="p-2.5 text-left bg-slate-50 hover:bg-blue-50/50 border border-slate-200/60 rounded-xl flex flex-col gap-0.5 transition-all text-xs"
              >
                <span className="font-bold text-slate-700 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                  QR Tangga Kiri
                </span>
                <span className="text-[8.5px] text-slate-400 font-mono font-bold">node 1 (Tangga Kiri)</span>
              </button>

              <button
                onClick={() => {
                  simulateQRScan('4')
                  setShowSimulator(false)
                }}
                className="p-2.5 text-left bg-slate-50 hover:bg-blue-50/50 border border-slate-200/60 rounded-xl flex flex-col gap-0.5 transition-all text-xs"
              >
                <span className="font-bold text-slate-700 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                  QR Lift
                </span>
                <span className="text-[8.5px] text-slate-400 font-mono font-bold">node 4 (Lift)</span>
              </button>
              
              <button
                onClick={() => {
                  simulateQRScan('6')
                  setShowSimulator(false)
                }}
                className="p-2.5 text-left bg-slate-50 hover:bg-blue-50/50 border border-slate-200/60 rounded-xl flex flex-col gap-0.5 transition-all text-xs"
              >
                <span className="font-bold text-slate-700 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]"></span>
                  QR Selasar Seminar
                </span>
                <span className="text-[8.5px] text-slate-400 font-mono font-bold">node 6 (Selasar Ruang Seminar)</span>
              </button>

              <button
                onClick={() => {
                  simulateQRScan('8')
                  setShowSimulator(false)
                }}
                className="p-2.5 text-left bg-slate-50 hover:bg-blue-50/50 border border-slate-200/60 rounded-xl flex flex-col gap-0.5 transition-all text-xs"
              >
                <span className="font-bold text-slate-700 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]"></span>
                  QR Selasar Lab RPB
                </span>
                <span className="text-[8.5px] text-slate-400 font-mono font-bold">node 8 (Selasar Lab RPB)</span>
              </button>

              <button
                onClick={() => {
                  simulateQRScan('11')
                  setShowSimulator(false)
                }}
                className="p-2.5 text-left bg-slate-50 hover:bg-blue-50/50 border border-slate-200/60 rounded-xl flex flex-col gap-0.5 transition-all text-xs col-span-2"
              >
                <span className="font-bold text-slate-700 flex items-center gap-1 justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]"></span>
                  QR Ruang Dosen
                </span>
                <span className="text-[8.5px] text-slate-400 font-mono font-bold text-center">node 11 (Ruang Dosen)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Location Confirmation Toast (FR-01.3) */}
      {locationConfirmed && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300 animate-[slide-down_0.3s_ease-out]">
          <div className="glass-panel px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 border border-emerald-500/25 bg-emerald-50/90 backdrop-blur-md">
            <div className="w-5.5 h-5.5 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow shadow-emerald-500/20 animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-emerald-600 font-extrabold uppercase tracking-wider leading-none">Posisi Terkonfirmasi</span>
              <span className="text-xs text-slate-800 font-black mt-0.5 leading-none">{locationConfirmed}</span>
            </div>
          </div>
        </div>
      )}

      {/* Camera QR Scanner Drawer Modal (F-01 / FR-01.5) */}
      {showCameraScanner && (
        <DynamicQrScanner
          onScanSuccess={handleCameraScanSuccess}
          onScanError={handleCameraScanError}
          onClose={() => setShowCameraScanner(false)}
        />
      )}
    </main>
  )
}

// Wrap HomeContent with Suspense fallback to resolve Next.js dynamic hydration query parsing builds
export default function Home() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <HomeContent />
    </Suspense>
  )
}
