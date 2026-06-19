import React from 'react';
import { Header, Button } from '../ui';
import { AlertTriangle, Search, RotateCcw } from '../ui/icons';

import { ErrorType } from '../../hooks/useNavigation';

interface ErrorScreenProps {
  errorType: ErrorType;
  errorMessage: string;
  onBackToSearch: () => void;
  onScanAgain: () => void;
}

export function ErrorScreen({ errorType, errorMessage, onBackToSearch, onScanAgain }: ErrorScreenProps) {
  const isNoRoute = errorType === 'NO_ROUTE';

  return (
    <div className="flex flex-col min-h-screen bg-surface animate-fade-in">
      <Header title="Error" onBack={onBackToSearch} showLogo={false} />
      
      <div className="flex flex-col flex-1 items-center justify-center p-4 md:p-8 max-w-[400px] w-full mx-auto text-center">
        <div className="mb-6 text-error">
          {/* Custom illustration placeholder could be here, using icon for now */}
          <AlertTriangle size={64} strokeWidth={1.5} />
        </div>
        
        <h1 className="text-h2 text-secondary mb-2">
          {isNoRoute ? 'Rute Tidak Tersedia' : 'Ruangan Tidak Ditemukan'}
        </h1>
        
        <p className="text-body text-muted mb-8">
          {errorMessage || (isNoRoute 
            ? 'Tidak ada jalur antara lokasi ini. Hubungi staf untuk bantuan.' 
            : 'Node ID yang Anda cari tidak ada dalam sistem. Coba pilih dari daftar yang tersedia.')}
        </p>

        <div className="w-full flex flex-col gap-3">
          <Button size="large" fullWidth onClick={onBackToSearch}>
            <Search size={18} className="mr-2" />
            {isNoRoute ? 'Coba Lokasi Lain' : 'Kembali ke Pencarian'}
          </Button>
          
          <Button variant="secondary" size="large" fullWidth onClick={onScanAgain}>
            <RotateCcw size={18} className="mr-2" />
            {isNoRoute ? 'Hubungi Staf' : 'Scan Ulang'}
          </Button>
        </div>
      </div>
    </div>
  );
}
