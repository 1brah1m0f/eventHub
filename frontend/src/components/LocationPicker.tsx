'use client';
import { useState, useCallback } from 'react';
import { APIProvider, Map, Marker, MapMouseEvent } from '@vis.gl/react-google-maps';
import { MapPin, X, Check } from 'lucide-react';

export interface Coords { lat: number; lng: number; }

interface Props {
  value: Coords | null;
  onChange: (coords: Coords | null) => void;
}

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;

export function LocationPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<Coords | null>(null);

  const openModal = () => {
    setPending(value);
    setOpen(true);
  };

  const handleMapClick = useCallback((e: MapMouseEvent) => {
    if (e.detail.latLng) {
      setPending({ lat: e.detail.latLng.lat, lng: e.detail.latLng.lng });
    }
  }, []);

  const confirm = () => {
    onChange(pending);
    setOpen(false);
  };

  return (
    <>
      <div className="flex items-center gap-2 mt-1.5">
        <button
          type="button"
          onClick={openModal}
          className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border transition-colors ${
            value
              ? 'border-blue-300 bg-blue-50 text-blue-700'
              : 'border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50'
          }`}
        >
          <MapPin size={13} />
          {value ? `${value.lat.toFixed(5)}, ${value.lng.toFixed(5)}` : 'Pin exact location on map'}
        </button>
        {value && (
          <button type="button" onClick={() => onChange(null)} className="text-gray-400 hover:text-red-500 transition-colors">
            <X size={14} />
          </button>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col" style={{ maxHeight: '90vh' }}>
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-blue-700" />
                <h3 className="font-semibold text-gray-900">Pin Event Location</h3>
                <span className="text-xs text-gray-400">Click map to place marker</span>
              </div>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div style={{ height: '420px' }}>
              <APIProvider apiKey={API_KEY}>
                <Map
                  defaultCenter={pending ?? { lat: 40.4093, lng: 49.8671 }}
                  defaultZoom={12}
                  onClick={handleMapClick}
                  style={{ width: '100%', height: '100%' }}
                  gestureHandling="greedy"
                >
                  {pending && <Marker position={pending} />}
                </Map>
              </APIProvider>
            </div>

            <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between shrink-0">
              <span className="text-sm text-gray-500">
                {pending
                  ? <span className="text-blue-700 font-medium">{pending.lat.toFixed(5)}, {pending.lng.toFixed(5)}</span>
                  : <span className="text-gray-400">No location selected</span>
                }
              </span>
              <div className="flex gap-2">
                <button onClick={() => setOpen(false)} className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 border border-gray-200 rounded-lg transition-colors">
                  Cancel
                </button>
                <button
                  onClick={confirm}
                  disabled={!pending}
                  className="flex items-center gap-1.5 text-sm bg-blue-800 text-white px-4 py-1.5 rounded-lg hover:bg-blue-900 disabled:opacity-50 transition-colors font-medium"
                >
                  <Check size={14} /> Use this location
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
