import React, { useState } from 'react';
import { Header, Input, Button, Card } from '../ui';
import { MapPin, CheckCircle, Search, Camera } from '../ui/icons';

interface DestinationSearchScreenProps {
  nodes: { id: string, label: string, floor: number, type: string }[];
  currentPositionNode: { id: string, label: string, floor: number } | null;
  onBack: () => void;
  onCalculateRoute: (destinationId: string) => void;
  onScanNewQR: () => void;
}

export function DestinationSearchScreen({ 
  nodes, 
  currentPositionNode, 
  onBack, 
  onCalculateRoute,
  onScanNewQR
}: DestinationSearchScreenProps) {
  
  const [search, setSearch] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const destinationRooms = nodes.filter(n => n.type === 'room');
  const filteredRooms = destinationRooms
    .filter(n => n.label.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.label.localeCompare(b.label));

  const selectedNode = destinationRooms.find(n => n.id === selectedNodeId);
  const isSameAsStart = selectedNodeId === currentPositionNode?.id;

  return (
    <div className="flex flex-col min-h-screen bg-surface animate-fade-in">
      <Header title="Pilih Tujuan" onBack={onBack} showLogo={false} />
      
      <div className="flex flex-col p-4 md:p-8 max-w-[500px] w-full mx-auto flex-1">
        
        {/* Current Position */}
        <div className="mb-4">
          <h3 className="text-h3 text-secondary mb-2">Posisi Anda Sekarang</h3>
          <Card variant="position" elevation="subtle" className="flex items-center">
            <CheckCircle size={24} className="text-success mr-3" />
            <div className="flex flex-col">
              <span className="text-body font-bold text-secondary">{currentPositionNode?.label || 'Tidak diketahui'}</span>
              <span className="text-bodySmall text-muted">Lantai {currentPositionNode?.floor || '?'}</span>
            </div>
          </Card>
        </div>

        {/* Destination Search */}
        <div className="flex flex-col flex-1 mb-4">
          <h3 className="text-h3 text-secondary mb-2">Mau Ke Mana?</h3>
          <Input 
            icon={<Search size={20} />}
            placeholder="Cari ruangan tujuan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-3 shadow-subtle"
            error={isSameAsStart}
          />
          {isSameAsStart && (
            <span className="text-bodySmall text-errorDark font-medium mb-2 -mt-1 block">Pilih ruangan yang berbeda dari posisi awal</span>
          )}

          {!selectedNodeId || search.length > 0 ? (
            <div className="flex-1 bg-background border border-border rounded-card shadow-subtle overflow-hidden flex flex-col mb-2">
              <div className="flex-1 overflow-y-auto max-h-[calc(100vh-380px)] md:max-h-[300px]">
                {filteredRooms.length > 0 ? (
                  filteredRooms.map(room => (
                    <div 
                      key={room.id}
                      onClick={() => {
                        setSelectedNodeId(room.id);
                        setSearch(''); // Clear search to show selected card
                      }}
                      className="flex items-center p-3.5 border-b border-border last:border-b-0 cursor-pointer transition-colors hover:bg-surface"
                    >
                      <MapPin size={20} className="mr-3 text-muted" />
                      <div className="flex flex-col">
                        <span className="text-body text-secondary">
                          {room.label}
                        </span>
                        <span className="text-bodySmall text-muted">Lantai {room.floor}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-bodySmall text-muted">
                    Ruangan tidak ditemukan.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Card variant="destination" elevation="medium" className="flex items-center mb-2 animate-dropdown-slide">
              <MapPin size={24} className="text-success mr-3" />
              <div className="flex flex-col">
                <span className="text-body font-bold text-secondary">{selectedNode?.label}</span>
                <span className="text-bodySmall text-muted">Tujuan Terpilih</span>
              </div>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-2 mt-auto">
          <Button 
            size="large" 
            fullWidth 
            disabled={!selectedNodeId || isSameAsStart}
            onClick={() => selectedNodeId && onCalculateRoute(selectedNodeId)}
          >
            Cari Rute
          </Button>
          <Button 
            variant="secondary" 
            fullWidth 
            onClick={onScanNewQR}
          >
            <Camera size={16} className="mr-2" />
            Scan QR Baru
          </Button>
        </div>
      </div>
    </div>
  );
}
