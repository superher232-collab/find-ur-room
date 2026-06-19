'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import graphData from '../../public/data/building-graph.json'
import { findShortestPath, type GraphNode, type GraphEdge } from '../utils/dijkstra'
import { useNavigation } from '../hooks/useNavigation'

// UI Components
import { OfflineBanner, Toast, Spinner } from '../components/ui'
import {
  LandingScreen,
  ManualPositionScreen,
  DestinationSearchScreen,
  RouteLoadingScreen,
  RouteMapScreen,
  SuccessScreen,
  ErrorScreen
} from '../components/screens'
import { QrScanner } from '../components/QrScanner'

// Dynamically import IndoorMap component with SSR disabled
const DynamicIndoorMap = dynamic(
  () => import('../components/IndoorMap').then((mod) => mod.IndoorMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-surface border border-border rounded-card shadow-subtle">
        <Spinner size={40} className="mb-4" />
        <p className="text-bodySmall text-muted font-semibold">Memuat Peta...</p>
      </div>
    ),
  }
)

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <Spinner size={40} className="mb-4" />
      <p className="text-bodySmall font-semibold text-muted">Menyiapkan Aplikasi...</p>
    </div>
  )
}

function HomeContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const nav = useNavigation()
  const { state, actions } = nav

  // Load and preprocess building data
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

  const [showScanner, setShowScanner] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // Detect Offline Mode & Register Service Worker
  useEffect(() => {
    actions.setOffline(!navigator.onLine)
    const goOnline = () => actions.setOffline(false)
    const goOffline = () => actions.setOffline(true)

    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)

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
  }, [actions])

  // Parse URL Query Parameter for ?start=
  useEffect(() => {
    const startQuery = searchParams.get('start')
    if (startQuery) {
      const match = nodes.find((node) => node.id === startQuery)
      if (match) {
        actions.setCurrentPosition(match.id)
        actions.setScreen('destination-search')
        
        setToastMessage(`Posisi: ${match.label}`)
        setTimeout(() => setToastMessage(''), 3500)
      } else {
        actions.setError('NODE_NOT_FOUND', `Titik QR "${startQuery}" tidak ditemukan pada denah gedung ini.`)
      }
    }
  }, [searchParams]) // Only run when searchParams change

  // Actions handlers
  const handleCalculateRoute = (destinationId: string) => {
    if (!state.currentNodeId) return

    actions.setDestination(destinationId)
    actions.setRouteLoading(true)
    actions.setScreen('route-loading')

    // Simulate slight delay for calculating to show loading screen
    setTimeout(() => {
      const result = findShortestPath(nodes, edges, state.currentNodeId!, destinationId)
      actions.setRouteLoading(false)
      
      if (result) {
        actions.setRoute(result)
        actions.setScreen('viewing-map')
      } else {
        actions.setError('NO_ROUTE', 'Tidak ditemukan jalur yang menghubungkan titik ini. Hubungi pengelola gedung.')
      }
    }, 600)
  }

  const handleQRScanSuccess = (decodedText: string) => {
    let nodeId = ''
    try {
      if (decodedText.startsWith('http://') || decodedText.startsWith('https://')) {
        const url = new URL(decodedText)
        nodeId = url.searchParams.get('start') || ''
      } else {
        nodeId = decodedText.trim()
      }
    } catch (e) {
      nodeId = decodedText.trim()
    }

    setShowScanner(false)

    if (nodeId) {
      const match = nodes.find((n) => n.id === nodeId)
      if (match) {
        actions.setCurrentPosition(match.id)
        actions.setScreen('destination-search')
        setToastMessage(`Posisi: ${match.label}`)
        setTimeout(() => setToastMessage(''), 3500)
        
        // Update URL
        router.push(`/?start=${match.id}`)
      } else {
        actions.setError('NODE_NOT_FOUND', `Titik QR "${nodeId}" tidak ditemukan pada denah gedung ini.`)
      }
    } else {
      actions.setError('NODE_NOT_FOUND', 'Format QR Code tidak valid.')
    }
  }

  // Current Node References
  const startNode = nodes.find(n => n.id === state.currentNodeId) || null
  const destNode = nodes.find(n => n.id === state.destinationNodeId) || null

  // Metric computations for map
  const scaleFactor = 0.4
  const rawWeight = state.route?.totalWeight || 0
  const distanceMeters = rawWeight * scaleFactor
  
  const getWalkingTimeText = (meters: number) => {
    const seconds = meters / 1.2
    if (seconds < 60) return `${Math.round(seconds)} detik`
    return `${Math.ceil(seconds / 60)} menit`
  }

  // Render logic based on state
  return (
    <main className="relative w-screen min-h-screen bg-background overflow-hidden selection:bg-primary selection:text-white">
      
      {/* Global Elements */}
      <OfflineBanner visible={state.showOfflineBanner} onClose={actions.dismissOfflineBanner} />
      <Toast message={toastMessage} visible={!!toastMessage} onClose={() => setToastMessage('')} />
      
      {showScanner && (
        <QrScanner 
          onScanSuccess={handleQRScanSuccess} 
          onScanError={(err) => console.warn(err)} 
          onClose={() => setShowScanner(false)} 
        />
      )}

      {/* Error Overlay */}
      {state.error.type && (
        <div className="absolute inset-0 z-[100] bg-background">
          <ErrorScreen 
            errorType={state.error.type}
            errorMessage={state.error.message}
            onBackToSearch={() => {
              actions.clearError()
              if (state.screen === 'landing') return
              actions.setScreen('destination-search')
            }}
            onScanAgain={() => {
              actions.clearError()
              setShowScanner(true)
            }}
          />
        </div>
      )}

      {/* Screen Routing */}
      {state.screen === 'landing' && (
        <LandingScreen 
          onManualSelect={() => actions.setScreen('manual-position')}
          onScanQR={() => setShowScanner(true)}
        />
      )}

      {state.screen === 'manual-position' && (
        <ManualPositionScreen 
          nodes={nodes}
          onBack={() => actions.setScreen('landing')}
          onSelectPosition={(id) => {
            actions.setCurrentPosition(id)
            actions.setScreen('destination-search')
          }}
        />
      )}

      {state.screen === 'destination-search' && (
        <DestinationSearchScreen 
          nodes={nodes}
          currentPositionNode={startNode}
          onBack={() => actions.setScreen('landing')}
          onCalculateRoute={handleCalculateRoute}
          onScanNewQR={() => setShowScanner(true)}
        />
      )}

      {state.screen === 'route-loading' && (
        <div className="absolute inset-0">
          <DestinationSearchScreen 
            nodes={nodes}
            currentPositionNode={startNode}
            onBack={() => {}}
            onCalculateRoute={() => {}}
            onScanNewQR={() => {}}
          />
          <RouteLoadingScreen />
        </div>
      )}

      {state.screen === 'viewing-map' && (
        <RouteMapScreen 
          destinationLabel={destNode?.label || ''}
          destinationFloor={destNode?.floor || 2}
          distanceMeters={distanceMeters}
          walkingTimeText={getWalkingTimeText(distanceMeters)}
          onArrived={() => actions.setScreen('success')}
          onSearchNewRoute={() => actions.resetToPositionSelect()}
          onBack={() => actions.setScreen('destination-search')}
          mapChildren={
            <DynamicIndoorMap
              nodes={nodes}
              edges={edges}
              startNode={startNode}
              destinationNode={destNode}
              routePath={state.route?.path || []}
              imageUrl={metadata.imageUrl}
              imageWidth={metadata.imageWidth}
              imageHeight={metadata.imageHeight}
              heading={null}
            />
          }
        />
      )}

      {state.screen === 'success' && (
        <SuccessScreen 
          destinationLabel={destNode?.label || ''}
          onSearchOtherRoom={() => actions.resetToPositionSelect()}
          onScanNewQR={() => setShowScanner(true)}
        />
      )}
    </main>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <HomeContent />
    </Suspense>
  )
}
