import React from 'react';
import { Header, Card, Button } from '../ui';
import { Clock, AlertTriangle, RotateCcw, CheckCircle } from '../ui/icons';

interface RouteMapScreenProps {
  destinationLabel: string;
  destinationFloor: number;
  distanceMeters: number;
  walkingTimeText: string;
  floorChangeWarning?: string;
  onArrived: () => void;
  onSearchNewRoute: () => void;
  onBack: () => void;
  mapChildren: React.ReactNode; // The IndoorMap component will be passed here to preserve its own state/lifecycle
}

export function RouteMapScreen({
  destinationLabel,
  destinationFloor,
  distanceMeters,
  walkingTimeText,
  floorChangeWarning,
  onArrived,
  onSearchNewRoute,
  onBack,
  mapChildren
}: RouteMapScreenProps) {
  return (
    <div className="flex flex-col h-screen bg-surface">
      <Header title={`Rute ke: ${destinationLabel}`} onBack={onBack} />

      {/* Map Container - Flexible height */}
      <div className="flex-1 relative m-4 md:m-8 bg-background rounded-card shadow-subtle overflow-hidden border border-border">
        {mapChildren}
      </div>

      {/* Bottom Information Panel */}
      <div className="bg-background border-t-2 border-t-success shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] rounded-t-3xl pt-5 pb-6 px-4 md:px-8 shrink-0 relative z-20">
        
        {/* Floor Change Warning */}
        {floorChangeWarning && (
          <div className="mb-4 bg-warningLight border-l-4 border-l-warning rounded-base p-3 flex items-start">
            <AlertTriangle size={20} className="text-warning mr-3 shrink-0" />
            <p className="text-bodySmall text-secondary font-medium leading-snug">{floorChangeWarning}</p>
          </div>
        )}

        {/* Route Details */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center text-body font-bold text-secondary">
            <span className="mr-4">🛣️ Jarak: {distanceMeters.toFixed(1)} meter</span>
            <span className="flex items-center"><Clock size={16} className="mr-1.5" /> ~{walkingTimeText}</span>
          </div>
        </div>
        
        <div className="flex items-center text-bodySmall text-muted mb-4">
          <span className="mr-3">📍 Lantai {destinationFloor}</span>
          <span className="italic">Ikuti garis biru/ungu</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 w-full max-w-[500px] mx-auto">
          <Button size="large" fullWidth onClick={onArrived} className="bg-success hover:bg-success text-white shadow-md hover:shadow-lg">
            <CheckCircle size={18} className="mr-2" />
            Sudah Sampai
          </Button>
          <Button variant="secondary" fullWidth onClick={onSearchNewRoute}>
            <RotateCcw size={16} className="mr-2" />
            Cari Rute Baru
          </Button>
        </div>
      </div>
    </div>
  );
}
