'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { X } from './ui/icons'

interface QrScannerProps {
  onScanSuccess: (decodedText: string) => void
  onScanError: (error: string) => void
  onClose: () => void
}

export function QrScanner({ onScanSuccess, onScanError, onClose }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animFrameRef = useRef<number>(0)
  const [status, setStatus] = useState<'requesting' | 'active' | 'error'>('requesting')
  const [errorMessage, setErrorMessage] = useState<string>('')

  const stopEverything = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = 0
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const startCamera = async () => {
      try {
        // Try back camera first, fall back to any camera
        let stream: MediaStream | null = null

        const constraints: MediaStreamConstraints[] = [
          { video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } } },
          { video: { facingMode: 'environment' } },
          { video: true },
        ]

        for (const constraint of constraints) {
          try {
            stream = await navigator.mediaDevices.getUserMedia(constraint)
            break
          } catch {
            continue
          }
        }

        if (!stream) throw new Error('Tidak ada kamera yang dapat diakses. Pastikan izin kamera sudah diberikan.')
        if (!isMounted) { stream.getTracks().forEach(t => t.stop()); return }

        streamRef.current = stream

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
          if (isMounted) setStatus('active')
          startDecoding()
        }
      } catch (err: any) {
        if (!isMounted) return
        const msg = err?.message || 'Gagal mengakses kamera.'
        setErrorMessage(msg)
        setStatus('error')
        onScanError(msg)
      }
    }

    const startDecoding = () => {
      const tick = async () => {
        if (!isMounted) return
        const video = videoRef.current
        const canvas = canvasRef.current
        if (!video || !canvas || video.readyState < video.HAVE_ENOUGH_DATA) {
          animFrameRef.current = requestAnimationFrame(tick)
          return
        }

        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')
        if (!ctx) { animFrameRef.current = requestAnimationFrame(tick); return }

        ctx.drawImage(video, 0, 0)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

        try {
          // Dynamically import jsQR only when needed (avoids SSR issues)
          const jsQR = (await import('jsqr')).default
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert'
          })
          if (code && code.data && isMounted) {
            onScanSuccess(code.data)
            return // Stop scanning after success
          }
        } catch {
          // jsQR decode error is non-fatal, just try next frame
        }

        animFrameRef.current = requestAnimationFrame(tick)
      }
      animFrameRef.current = requestAnimationFrame(tick)
    }

    startCamera()

    return () => {
      isMounted = false
      stopEverything()
    }
  }, [onScanSuccess, onScanError, stopEverything])

  const handleClose = useCallback(() => {
    stopEverything()
    onClose()
  }, [stopEverything, onClose])

  return (
    <div className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl w-full max-w-[380px] shadow-2xl flex flex-col gap-0 border border-border overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              {status === 'active' && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              )}
              <span className={`relative inline-flex rounded-full h-3 w-3 ${
                status === 'active' ? 'bg-green-400' :
                status === 'error'  ? 'bg-red-400' :
                'bg-yellow-400 animate-pulse'
              }`} />
            </span>
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
              {status === 'requesting' ? 'Meminta Izin Kamera...' :
               status === 'active'    ? 'Scan Kamera Aktif' :
               'Kamera Tidak Tersedia'}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface text-muted transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Video Area */}
        <div className="relative w-full bg-black" style={{ aspectRatio: '4/3' }}>
          {/* Native video element — always in DOM so browser can attach stream */}
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            autoPlay
            muted
          />
          {/* Hidden canvas for QR decoding */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Scanning reticle overlay — only when active */}
          {status === 'active' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-52 h-52">
                {/* Dashed border */}
                <div className="absolute inset-0 border-2 border-dashed border-primary/60 rounded-2xl" />
                {/* Corner brackets */}
                <div className="absolute -top-0.5 -left-0.5 w-7 h-7 border-t-4 border-l-4 border-primary rounded-tl-md" />
                <div className="absolute -top-0.5 -right-0.5 w-7 h-7 border-t-4 border-r-4 border-primary rounded-tr-md" />
                <div className="absolute -bottom-0.5 -left-0.5 w-7 h-7 border-b-4 border-l-4 border-primary rounded-bl-md" />
                <div className="absolute -bottom-0.5 -right-0.5 w-7 h-7 border-b-4 border-r-4 border-primary rounded-br-md" />
                {/* Laser scan line */}
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent absolute animate-scan-laser" />
              </div>
            </div>
          )}

          {/* Requesting permission overlay */}
          {status === 'requesting' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white gap-3">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium">Meminta akses kamera...</p>
            </div>
          )}

          {/* Error overlay */}
          {status === 'error' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 p-6 text-center text-white gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-14 h-14 text-red-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5-6 6m0-6 6 6" />
              </svg>
              <div>
                <h4 className="font-bold text-base mb-1">Kamera Tidak Dapat Diakses</h4>
                <p className="text-xs text-gray-300 leading-relaxed">{errorMessage}</p>
              </div>
              <p className="text-xs text-gray-400">Izinkan akses kamera di pengaturan browser, lalu tutup dan buka kembali scanner ini.</p>
            </div>
          )}
        </div>

        {/* Info footer */}
        <div className="px-5 py-4 bg-surface border-t border-border flex items-start gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4 text-primary shrink-0 mt-0.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
          <span className="text-xs text-muted leading-relaxed">
            Posisikan stiker QR Anchor FTI UAJY tepat di dalam kotak pemindai.
          </span>
        </div>
      </div>
    </div>
  )
}
