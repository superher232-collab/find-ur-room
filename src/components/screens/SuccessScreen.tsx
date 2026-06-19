import React from 'react';
import { Button } from '../ui';
import { CheckCircle, Search, Camera } from '../ui/icons';

interface SuccessScreenProps {
  destinationLabel: string;
  onSearchOtherRoom: () => void;
  onScanNewQR: () => void;
}

export function SuccessScreen({ destinationLabel, onSearchOtherRoom, onScanNewQR }: SuccessScreenProps) {
  return (
    <div className="flex flex-col min-h-screen bg-background p-4 md:p-8 animate-fade-in items-center justify-center">
      <div className="absolute top-4 left-4 md:top-8 md:left-8 flex items-center gap-2">
        <img src="/logo.png" alt="UAJY Logo" className="w-8 h-8 object-contain" />
      </div>

      <div className="w-full max-w-[400px] flex flex-col items-center text-center">
        {/* Animated Checkmark */}
        <div className="mb-8 text-success animate-success-bounce">
          <CheckCircle size={80} strokeWidth={2.5} />
        </div>

        <h1 className="text-h1 text-success mb-2">Selamat Sampai!</h1>
        <p className="text-body text-muted mb-12">
          Anda telah mencapai <span className="font-semibold text-secondary">{destinationLabel}</span>
        </p>

        <div className="w-full flex flex-col gap-3">
          <Button size="large" fullWidth onClick={onSearchOtherRoom}>
            <Search size={18} className="mr-2" />
            Cari Ruangan Lain
          </Button>
          
          <Button variant="secondary" size="large" fullWidth onClick={onScanNewQR}>
            <Camera size={18} className="mr-2" />
            Scan QR Baru
          </Button>
        </div>
      </div>
    </div>
  );
}
