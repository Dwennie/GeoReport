import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
    Compass,
    Copy,
    Check,
    Layers,
    MapPin,
    RotateCcw,
    ZoomIn,
    ZoomOut,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type MapMarker = {
    id: string | number;
    latitude: number;
    longitude: number;
    title?: string;
    description?: string;
    color?: string;
    status?: string;
};

export type BarangaySelection = {
    name: string;
    psgc_code: string;
    pcode: string;
    area_sqkm: number;
    properties: Record<string, unknown>;
};

interface OpenStreetMapProps {
    latitude?: number;
    longitude?: number;
    zoom?: number;
    height?: string;
    selectable?: boolean;
    selectedLatitude?: number | null;
    selectedLongitude?: number | null;
    onLocationSelect?: (lat: number, lng: number) => void;
    onSelectCoordinates?: (lat: number, lng: number) => void;
    markers?: MapMarker[];
    draggablePin?: boolean;
    showCoordinatesBadge?: boolean;
    showBarangays?: boolean;
    geoJsonUrl?: string;
    geoJsonData?: unknown;
    selectedBarangayPsgc?: string | null;
    onBarangaySelect?: (barangay: BarangaySelection) => void;
    fitBoundsToBarangays?: boolean;
    pinOnPolygonClick?: boolean;
    showLegend?: boolean;
    caption?: string;
}

function createPinIcon(color = '#10B981') {
    return L.divIcon({
        className: 'custom-map-pin',
        html: `
            <div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%, -100%);">
                <div style="background-color:${color};width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 8px rgba(0,0,0,0.35);border:2px solid white;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                        <circle cx="12" cy="10" r="3"/>
                    </svg>
                </div>
                <div style="width:2px;height:6px;background-color:${color};"></div>
            </div>
        `,
        iconSize: [28, 34],
        iconAnchor: [14, 34],
        popupAnchor: [0, -34],
    });
}

export default function OpenStreetMap({
    latitude = 9.8,
    longitude = 123.8,
    zoom = 13,
    height = 'h-[440px] sm:h-[520px]',
    selectable = true,
    selectedLatitude = null,
    selectedLongitude = null,
    onLocationSelect,
    onSelectCoordinates,
    markers = [],
    draggablePin = true,
    showCoordinatesBadge = true,
    showBarangays = true,
    geoJsonUrl = '/geojson/loon-barangays',
    geoJsonData,
    selectedBarangayPsgc = null,
    onBarangaySelect,
    fitBoundsToBarangays = false,
    pinOnPolygonClick = true,
    showLegend = false,
    caption,
}: OpenStreetMapProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const pinMarkerRef = useRef<L.Marker | null>(null);
    const markersLayerRef = useRef<L.LayerGroup | null>(null);
    const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);

    const [pinCoords, setPinCoords] = useState<{ lat: number; lng: number } | null>(
        selectedLatitude != null && selectedLongitude != null
            ? { lat: selectedLatitude, lng: selectedLongitude }
            : null
    );
    const [copied, setCopied] = useState(false);

    // Initialize Map
    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        const map = L.map(containerRef.current, {
            center: [latitude, longitude],
            zoom,
            zoomControl: false,
        });
        mapRef.current = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
        }).addTo(map);

        const markersLayer = L.layerGroup().addTo(map);
        markersLayerRef.current = markersLayer;

        if (selectable) {
            map.on('click', (e: L.LeafletMouseEvent) => {
                const { lat, lng } = e.latlng;
                const roundedLat = parseFloat(lat.toFixed(6));
                const roundedLng = parseFloat(lng.toFixed(6));
                setPinCoords({ lat: roundedLat, lng: roundedLng });
                onLocationSelect?.(roundedLat, roundedLng);
                onSelectCoordinates?.(roundedLat, roundedLng);
            });
        }

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, []);

    // Sync Pin when selected props change
    useEffect(() => {
        if (selectedLatitude != null && selectedLongitude != null) {
            setPinCoords({
                lat: parseFloat(selectedLatitude.toFixed(6)),
                lng: parseFloat(selectedLongitude.toFixed(6)),
            });
        }
    }, [selectedLatitude, selectedLongitude]);

    // Render / Move Pin Marker
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        if (pinCoords) {
            if (!pinMarkerRef.current) {
                const marker = L.marker([pinCoords.lat, pinCoords.lng], {
                    icon: createPinIcon('#EF4444'),
                    draggable: selectable && draggablePin,
                }).addTo(map);

                marker.on('dragend', () => {
                    const pos = marker.getLatLng();
                    const lat = parseFloat(pos.lat.toFixed(6));
                    const lng = parseFloat(pos.lng.toFixed(6));
                    setPinCoords({ lat, lng });
                    onLocationSelect?.(lat, lng);
                    onSelectCoordinates?.(lat, lng);
                });

                pinMarkerRef.current = marker;
            } else {
                pinMarkerRef.current.setLatLng([pinCoords.lat, pinCoords.lng]);
            }
        } else if (pinMarkerRef.current) {
            pinMarkerRef.current.remove();
            pinMarkerRef.current = null;
        }
    }, [pinCoords, selectable, draggablePin]);

    // Update Markers
    useEffect(() => {
        const layer = markersLayerRef.current;
        if (!layer) return;

        layer.clearLayers();

        markers.forEach((m) => {
            if (m.latitude == null || m.longitude == null) return;
            const marker = L.marker([m.latitude, m.longitude], {
                icon: createPinIcon(m.color ?? '#3B82F6'),
            });

            if (m.title || m.description) {
                marker.bindPopup(`
                    <div style="font-family:inherit;min-width:180px;">
                        <p style="font-weight:600;font-size:13px;margin:0 0 4px 0;">${m.title ?? ''}</p>
                        ${m.description ? `<p style="font-size:12px;color:#64748b;margin:0;">${m.description}</p>` : ''}
                    </div>
                `);
            }

            layer.addLayer(marker);
        });
    }, [markers]);

    // Load GeoJSON Boundaries
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !showBarangays) return;

        function renderGeoJson(data: any) {
            if (geoJsonLayerRef.current) {
                geoJsonLayerRef.current.remove();
            }

            const layer = L.geoJSON(data, {
                style: (feature) => {
                    const isSelected =
                        selectedBarangayPsgc &&
                        (feature?.properties?.adm4_psgc === selectedBarangayPsgc ||
                            feature?.properties?.ADM4_PCODE === selectedBarangayPsgc);

                    return {
                        fillColor: isSelected ? '#10B981' : '#0284C7',
                        weight: isSelected ? 2.5 : 1.2,
                        opacity: 0.85,
                        color: isSelected ? '#047857' : '#0369A1',
                        fillOpacity: isSelected ? 0.35 : 0.08,
                    };
                },
                onEachFeature: (feature, fLayer) => {
                    const name =
                        feature.properties?.adm4_en ||
                        feature.properties?.ADM4_EN ||
                        feature.properties?.name ||
                        'Barangay';

                    fLayer.bindTooltip(name, {
                        sticky: true,
                        direction: 'top',
                        className: 'barangay-map-tooltip',
                    });

                    fLayer.on('click', (e: L.LeafletMouseEvent) => {
                        if (onBarangaySelect) {
                            onBarangaySelect({
                                name,
                                psgc_code:
                                    feature.properties?.adm4_psgc ||
                                    feature.properties?.ADM4_PCODE ||
                                    '',
                                pcode: feature.properties?.ADM4_PCODE || '',
                                area_sqkm: feature.properties?.area_sqkm ?? 0,
                                properties: feature.properties ?? {},
                            });
                        }

                        if (selectable && pinOnPolygonClick) {
                            const { lat, lng } = e.latlng;
                            const roundedLat = parseFloat(lat.toFixed(6));
                            const roundedLng = parseFloat(lng.toFixed(6));
                            setPinCoords({ lat: roundedLat, lng: roundedLng });
                            onLocationSelect?.(roundedLat, roundedLng);
                            onSelectCoordinates?.(roundedLat, roundedLng);
                        }
                    });
                },
            });

            const currentMap = mapRef.current;
            if (currentMap) {
                layer.addTo(currentMap);
                geoJsonLayerRef.current = layer;

                if (fitBoundsToBarangays && layer.getBounds().isValid()) {
                    currentMap.fitBounds(layer.getBounds(), { padding: [20, 20] });
                }
            }
        }

        if (geoJsonData) {
            renderGeoJson(geoJsonData);
        } else if (geoJsonUrl) {
            fetch(geoJsonUrl)
                .then((res) => (res.ok ? res.json() : null))
                .then((data) => {
                    if (data) renderGeoJson(data);
                })
                .catch(() => {});
        }
    }, [showBarangays, geoJsonUrl, geoJsonData, selectedBarangayPsgc, fitBoundsToBarangays]);

    function zoomIn() {
        mapRef.current?.zoomIn();
    }

    function zoomOut() {
        mapRef.current?.zoomOut();
    }

    function resetView() {
        mapRef.current?.setView([latitude, longitude], zoom);
    }

    function copyCoords() {
        if (!pinCoords) return;
        navigator.clipboard.writeText(`${pinCoords.lat}, ${pinCoords.lng}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <div className="relative w-full overflow-hidden rounded-xl border bg-muted/30">
            <div ref={containerRef} className={cn('w-full', height)} />

            {/* Custom Floating Controls */}
            <div className="absolute top-3 right-3 z-[400] flex flex-col gap-1.5 shadow-md">
                <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    className="bg-background/90 backdrop-blur-xs hover:bg-background"
                    onClick={zoomIn}
                    aria-label="Zoom in"
                >
                    <ZoomIn className="size-4" />
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    className="bg-background/90 backdrop-blur-xs hover:bg-background"
                    onClick={zoomOut}
                    aria-label="Zoom out"
                >
                    <ZoomOut className="size-4" />
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    className="bg-background/90 backdrop-blur-xs hover:bg-background"
                    onClick={resetView}
                    aria-label="Reset view"
                >
                    <RotateCcw className="size-4" />
                </Button>
            </div>

            {/* Floating Coordinates Bar */}
            {showCoordinatesBadge && pinCoords && (
                <div className="absolute bottom-3 left-3 z-[400] flex items-center gap-2 rounded-lg border bg-background/95 px-3 py-1.5 text-xs font-mono shadow-md backdrop-blur-xs">
                    <MapPin className="size-3.5 text-rose-500" />
                    <span>
                        {pinCoords.lat.toFixed(6)}, {pinCoords.lng.toFixed(6)}
                    </span>
                    <button
                        type="button"
                        onClick={copyCoords}
                        className="ml-1 text-muted-foreground hover:text-foreground"
                        aria-label="Copy coordinates"
                    >
                        {copied ? (
                            <Check className="size-3.5 text-emerald-500" />
                        ) : (
                            <Copy className="size-3.5" />
                        )}
                    </button>
                </div>
            )}

            {caption && (
                <div className="border-t bg-background/80 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur-xs">
                    {caption}
                </div>
            )}
        </div>
    );
}
