'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

interface QrScannerProps {
  onScanSuccess: (decodedText: string) => void
  onScanError: (error: string) => void
  onClose: () => void
}

export function QrScanner({ onScanSuccess, onScanError, onClose }: QrScannerProps) {
  const qrScannerRef = useRef<Html5Qrcode | null>(null)
  const [initError, setInitError] = useState<string>('')

  useEffect(() => {
    if (typeof window === 'undefined') return

    let isMounted = true
    let scanner: Html5Qrcode | null = null

    const startScanner = async () => {
      try {
        scanner = new Html5Qrcode('qr-reader')
        qrScannerRef.current = scanner

        const config = {
          fps: 10,
          qrbox: (width: number, height: number) => {
            const size = Math.min(width, height) * 0.7
            return { width: size, height: size }
          }
        }

        const devices = await Html5Qrcode.getCameras()
        if (devices && devices.length > 0) {
          // Prefer back camera if available, otherwise fallback to the first device
          const backCamera = devices.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('rear'))
          const cameraId = backCamera ? backCamera.id : devices[0].id

          await scanner.start(
            cameraId,
            config,
            (decodedText) => {
              if (isMounted) onScanSuccess(decodedText)
            },
            () => {}
          )

          // If component unmounted while start() was processing, stop it immediately
          if (!isMounted && scanner.isScanning) {
            scanner.stop().then(() => scanner?.clear()).catch(console.error)
          }
        } else {
          throw new Error('Tidak ada kamera yang ditemukan.')
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Camera initialization failed:', err)
          setInitError(err?.message || 'Gagal mengakses kamera.')
          onScanError(err?.message || 'Gagal mengakses kamera.')
        }
      }
    }

    startScanner()

    return () => {
      isMounted = false
      if (scanner && scanner.isScanning) {
        scanner.stop()
          .then(() => scanner?.clear())
          .catch((e) => console.error('Error stopping scanner during cleanup:', e))
      }
    }
  }, [onScanSuccess, onScanError])

  return (
    <div className="absolute inset-0 bg-secondary/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-background rounded-card p-5 w-full max-w-[360px] shadow-large flex flex-col gap-4 relative overflow-hidden border border-border animate-dropdown-slide">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
            </span>
            <h3 className="text-bodySmall font-bold text-secondary uppercase tracking-wider">
              Scan Kamera Aktif
            </h3>
          </div>
          
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface hover:bg-border flex items-center justify-center text-muted hover:text-secondary transition-colors focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        {/* Video stream container */}
        <div className="relative w-full aspect-square bg-black rounded-2xl overflow-hidden border border-border shadow-inner flex items-center justify-center">
          <div id="qr-reader" className="w-full h-full object-cover [&>video]:object-cover" />
          
          {/* Overlay scanning reticle */}
          {(!initError) && (
            <div className="absolute inset-10 border-2 border-dashed border-primary/60 rounded-2xl pointer-events-none flex items-center justify-center">
              {/* Corner brackets */}
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-md"></div>
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-md"></div>
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-md"></div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-md"></div>
              
              {/* Laser scanning visual line */}
              <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent absolute animate-scan-laser"></div>
            </div>
          )}

          {/* Camera Access Error Message */}
          {initError && (
            <div className="absolute inset-0 bg-secondary/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-12 h-12 text-error mb-3 animate-pulse">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5-6 6m0-6 6 6" />
              </svg>
              <h4 className="text-body font-bold text-white mb-1">Izin Kamera Dibutuhkan</h4>
              <p className="text-[12px] text-muted leading-relaxed">
                Aplikasi membutuhkan akses kamera belakang untuk memindai kode QR penentu lokasi. Aktifkan izin kamera pada browser Anda.
              </p>
            </div>
          )}
        </div>

        {/* Scan guides info */}
        <div className="bg-surface border border-border rounded-base p-3 text-bodySmall text-muted font-medium leading-relaxed flex items-start gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4 text-primary shrink-0 mt-0.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
          <span>Posisikan stiker QR Anchor FTI UAJY tepat di tengah kotak pemindai untuk snapping instan.</span>
        </div>
      </div>
    </div>
  )
}
