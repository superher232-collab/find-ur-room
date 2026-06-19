import React, { useState } from 'react';
import { Header, Input, Button, DropdownOption } from '../ui';
import { MapPin } from '../ui/icons';

interface ManualPositionScreenProps {
  nodes: { id: string, label: string, floor: number, type: string }[];
  onBack: () => void;
  onSelectPosition: (nodeId: string) => void;
}

export function ManualPositionScreen({ nodes, onBack, onSelectPosition }: ManualPositionScreenProps) {
  const [search, setSearch] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Filter nodes for the list
  const filteredNodes = nodes
    .filter(n => n.label.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.label.localeCompare(b.label));

  return (
    <div className="flex flex-col min-h-screen bg-surface animate-fade-in">
      <Header title="Pilih Lokasi Awal" onBack={onBack} showLogo={false} />
      
      <div className="flex flex-col p-4 md:p-8 max-w-[500px] w-full mx-auto flex-1">
        <Input 
          icon={<MapPin size={20} />}
          placeholder="Cari ruangan atau lokasi..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-3 shadow-subtle"
        />

        <div className="flex-1 bg-background border border-border rounded-card shadow-subtle overflow-hidden flex flex-col mb-4">
          <div className="flex-1 overflow-y-auto max-h-[calc(100vh-220px)] md:max-h-[400px]">
            {filteredNodes.length > 0 ? (
              filteredNodes.map(node => (
                <div 
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`flex items-center p-4 border-b border-border last:border-b-0 cursor-pointer transition-colors ${selectedNodeId === node.id ? 'bg-primaryLight border-l-4 border-l-primary' : 'hover:bg-surface border-l-4 border-l-transparent'}`}
                >
                  <MapPin size={20} className={`mr-3 ${selectedNodeId === node.id ? 'text-primary' : 'text-muted'}`} />
                  <div className="flex flex-col">
                    <span className={`text-body ${selectedNodeId === node.id ? 'text-primary font-medium' : 'text-secondary'}`}>
                      {node.label}
                    </span>
                    <span className="text-bodySmall text-muted">Lantai {node.floor}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-bodySmall text-muted">
                Tidak ada lokasi ditemukan.
              </div>
            )}
          </div>
        </div>

        <Button 
          size="large" 
          fullWidth 
          disabled={!selectedNodeId}
          onClick={() => selectedNodeId && onSelectPosition(selectedNodeId)}
        >
          Lanjut
        </Button>
      </div>
    </div>
  );
}
