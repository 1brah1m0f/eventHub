'use client';
import { useCallback, useState } from 'react';
import { APIProvider, Map, Marker, MapMouseEvent } from '@vis.gl/react-google-maps';
import { Check, LocateFixed, MapPin, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';

export interface Coords { lat: number; lng: number; }

interface Props {
  value: Coords | null;
  onChange: (coords: Coords | null) => void;
  locationLabel?: string;
  onLocationLabelChange?: (label: string) => void;
}

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
const DEFAULT_CENTER = { lat: 40.4093, lng: 49.8671 };

export function LocationPicker({ value, onChange, locationLabel, onLocationLabelChange }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<Coords | null>(null);
  const [center, setCenter] = useState<Coords>(value ?? DEFAULT_CENTER);
  const [query, setQuery] = useState(locationLabel || '');
  const [searching, setSearching] = useState(false);

  const openModal = () => {
    setPending(value);
    setCenter(value ?? DEFAULT_CENTER);
    setQuery(locationLabel || '');
    setOpen(true);
  };

  const updatePending = useCallback((coords: Coords) => {
    setPending(coords);
    setCenter(coords);
  }, []);

  const handleMapClick = useCallback((e: MapMouseEvent) => {
    if (e.detail.latLng) {
      updatePending({ lat: e.detail.latLng.lat, lng: e.detail.latLng.lng });
    }
  }, [updatePending]);

  const handleMarkerDrag = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      updatePending({ lat: e.latLng.lat(), lng: e.latLng.lng() });
    }
  }, [updatePending]);

  const searchAddress = async () => {
    const googleMaps = (window as any).google?.maps;
    if (!query.trim() || !googleMaps) return;

    setSearching(true);
    try {
      const geocoder = new googleMaps.Geocoder();
      const response = await geocoder.geocode({ address: query.trim() });
      const result = response.results[0];
      const location = result?.geometry.location;

      if (!location) {
        toast.error('Location not found');
        return;
      }

      updatePending({ lat: location.lat(), lng: location.lng() });
      setQuery(result.formatted_address || query.trim());
    } catch {
      toast.error('Could not search this location');
    } finally {
      setSearching(false);
    }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Your browser does not support location access');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        updatePending({ lat: position.coords.latitude, lng: position.coords.longitude });
      },
      () => toast.error('Location permission was not granted'),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const confirm = () => {
    onChange(pending);
    if (query.trim()) onLocationLabelChange?.(query.trim());
    setOpen(false);
  };

  return (
    <>
      <div className="mt-2 rounded-xl border border-gray-200 bg-gray-50 p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-700">Exact map pin</p>
            <p className="mt-0.5 text-xs text-gray-500">
              {value ? `${value.lat.toFixed(5)}, ${value.lng.toFixed(5)}` : 'No coordinates selected yet'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openModal}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                value
                  ? 'border-violet-300 bg-violet-50 text-violet-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-violet-300 hover:text-violet-700'
              }`}
            >
              <MapPin size={14} />
              {value ? 'Adjust pin' : 'Select on map'}
            </button>
            {value && (
              <button type="button" onClick={() => onChange(null)} className="grid h-9 w-9 place-items-center rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-red-500 transition-colors">
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col" style={{ maxHeight: '92vh' }}>
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100 shrink-0">
              <div>
                <h3 className="font-semibold text-gray-900">Select Event Location</h3>
                <p className="text-xs text-gray-500">Search, click the map, or drag the marker into place.</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="border-b border-gray-100 p-4">
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                  <input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        searchAddress();
                      }
                    }}
                    placeholder="Search address or place name"
                    className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-700"
                  />
                </div>
                <button
                  type="button"
                  onClick={searchAddress}
                  disabled={!query.trim() || searching || !API_KEY}
                  className="rounded-xl bg-violet-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-900 disabled:opacity-50"
                >
                  {searching ? 'Searching...' : 'Search'}
                </button>
                <button
                  type="button"
                  onClick={useMyLocation}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  <LocateFixed size={15} />
                  My location
                </button>
              </div>
            </div>

            <div className="relative h-[420px] bg-gray-100">
              {!API_KEY ? (
                <div className="absolute inset-0 grid place-items-center p-6 text-center">
                  <div>
                    <p className="font-semibold text-gray-900">Google Maps key is missing</p>
                    <p className="mt-1 text-sm text-gray-500">Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to enable map location selection.</p>
                  </div>
                </div>
              ) : (
                <APIProvider apiKey={API_KEY}>
                  <Map
                    center={center}
                    defaultZoom={12}
                    onClick={handleMapClick}
                    style={{ width: '100%', height: '100%' }}
                    gestureHandling="greedy"
                    disableDefaultUI
                    zoomControl
                  >
                    {pending && <Marker position={pending} draggable onDragEnd={handleMarkerDrag} />}
                  </Map>
                </APIProvider>
              )}
            </div>

            <div className="flex flex-col gap-3 px-5 py-4 border-t border-gray-100 shrink-0 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-gray-500">
                {pending
                  ? <span><span className="font-semibold text-violet-700">{pending.lat.toFixed(5)}, {pending.lng.toFixed(5)}</span> selected</span>
                  : <span className="text-gray-400">No location selected</span>
                }
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirm}
                  disabled={!pending}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-violet-800 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-900 disabled:opacity-50"
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
