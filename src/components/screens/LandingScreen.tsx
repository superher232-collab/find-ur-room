import React from 'react';
import { Button } from '../ui';
import { MapPin, Camera } from '../ui/icons';

interface LandingScreenProps {
  onManualSelect: () => void;
  onScanQR: () => void;
}

export function LandingScreen({ onManualSelect, onScanQR }: LandingScreenProps) {
  return (
    <div className="flex flex-col min-h-screen bg-background p-4 md:p-8 animate-fade-in items-center justify-center">
      <div className="absolute top-4 left-4 md:top-8 md:left-8 flex items-center gap-2">
        <img src="/logo.png" alt="UAJY Logo" className="w-8 h-8 object-contain" />
        <span className="text-bodySmall text-muted font-medium">Find Ur Room</span>
      </div>

      <div className="w-full max-w-[500px] flex flex-col items-center text-center mt-12">
        {/* Placeholder for Hero Illustration */}
        <div className="w-[140px] h-[140px] md:w-[180px] md:h-[180px] bg-primaryLight rounded-full flex items-center justify-center mb-6">
          <MapPin size={64} className="text-primary" />
        </div>

        <h1 className="text-h1 text-secondary mb-2">Temukan Ruangan dengan Mudah</h1>
        <p className="text-body text-muted mb-8 max-w-[300px] md:max-w-[400px]">
          Scan QR code di gedung atau pilih lokasi manual untuk mulai navigasi.
        </p>

        <div className="w-full flex flex-col gap-3">
          <Button size="large" fullWidth onClick={onScanQR}>
            <Camera size={20} className="mr-2" />
            Scan QR Code
          </Button>
          
          <Button variant="link" onClick={onManualSelect} className="mt-2">
            Pilih Posisi Manual
          </Button>
        </div>
      </div>
    </div>
  );
}
