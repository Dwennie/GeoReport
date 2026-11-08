<script setup lang="ts">
import {
    computed,
    nextTick,
    onBeforeUnmount,
    onMounted,
    ref,
    watch,
} from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
    Check,
    ChevronDown,
    ChevronUp,
    Compass,
    Copy,
    Crosshair,
    Eye,
    EyeOff,
    Layers,
    MapPin,
    Navigation,
    RotateCcw,
    X,
    ZoomIn,
    ZoomOut,
} from '@lucide/vue';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export type MapMarker = {
    id: string | number;
    latitude: number;
    longitude: number;
    title?: string;
    description?: string;
    color?: string;
};

export type BarangaySelection = {
    name: string;
    psgc_code: string;
    pcode: string;
    area_sqkm: number;
    properties: Record<string, any>;
};

type Props = {
    /** Target Latitude (default: Loon, Bohol 9.80) */
    latitude?: number;
    /** Target Longitude (default: Loon, Bohol 123.80) */
    longitude?: number;
    /** Map Zoom Level (default: 13) */
    zoom?: number;
    /** Container height class or css value */
    height?: string;
    /** Enable click-to-select location pin */
    selectable?: boolean;
    /** Initial or bound selected latitude */
    selectedLatitude?: number | null;
    /** Initial or bound selected longitude */
    selectedLongitude?: number | null;
    /** Markers to plot on the map */
    markers?: MapMarker[];
    /** Allow location pin to be dragged */
    draggablePin?: boolean;
    /** Display the interactive floating coordinates toolbar */
    showCoordinatesBadge?: boolean;
    /** Display the barangay boundary GeoJSON overlay */
    showBarangays?: boolean;
    /** Endpoint URL to fetch Loon GeoJSON */
    geoJsonUrl?: string;
    /** Pre-loaded GeoJSON object if available */
    geoJsonData?: any;
    /** Selected barangay PSGC code */
    selectedBarangayPsgc?: string | null;
    /** Auto-fit map viewport to Loon barangays bounding box */
    fitBoundsToBarangays?: boolean;
    /** When true and selectable, clicking a barangay polygon also drops the location pin at the clicked coordinates */
    pinOnPolygonClick?: boolean;
    /** Display the map legend card */
    showLegend?: boolean;
    /** Optional caption beneath the map */
    caption?: string;
};

const props = withDefaults(defineProps<Props>(), {
    latitude: 9.8,
    longitude: 123.8,
    zoom: 13,
    height: 'h-[440px] sm:h-[520px]',
    selectable: true,
    selectedLatitude: null,
    selectedLongitude: null,
    markers: () => [],
    draggablePin: true,
    showCoordinatesBadge: true,
    showBarangays: true,
    geoJsonUrl: '/geojson/loon-barangays',
    geoJsonData: null,
    selectedBarangayPsgc: null,
    fitBoundsToBarangays: false,
    pinOnPolygonClick: false,
    showLegend: true,
    caption:
        'Municipality of Loon, Bohol GIS · OpenStreetMap & Official NAMRIA / PSA Boundaries',
});

const emit = defineEmits<{
    (
        e: 'select-location',
        payload: { latitude: number; longitude: number },
    ): void;
    (e: 'update:selectedLatitude', value: number | null): void;
    (e: 'update:selectedLongitude', value: number | null): void;
    (e: 'select-barangay', payload: BarangaySelection | null): void;
    (e: 'update:selectedBarangayPsgc', value: string | null): void;
}>();

// Module-level cache so navigating between views never re-downloads GeoJSON across session
let cachedLoonGeoJson: any = null;

const mapContainer = ref<HTMLDivElement | null>(null);
let map: L.Map | null = null;
let tileLayer: L.TileLayer | null = null;
let selectedMarker: L.Marker | null = null;
let markerLayerGroup: L.LayerGroup | null = null;
let geoJsonLayerGroup: L.GeoJSON | null = null;

const layerByPsgc = new Map<string, L.Path>();

const currentSelected = ref<{ latitude: number; longitude: number } | null>(
    props.selectedLatitude !== null && props.selectedLongitude !== null
        ? {
              latitude: props.selectedLatitude,
              longitude: props.selectedLongitude,
          }
        : null,
);

const currentCenter = ref({
    latitude: props.latitude,
    longitude: props.longitude,
});
const currentZoom = ref(props.zoom);
const copied = ref(false);

const isGeoJsonLoading = ref(false);
const geoJsonLoadError = ref<string | null>(null);
const isBoundariesVisible = ref(props.showBarangays);
const hoveredBarangay = ref<string | null>(null);
const selectedBarangay = ref<BarangaySelection | null>(null);
const isLegendExpanded = ref(
    typeof window !== 'undefined' ? window.innerWidth >= 640 : false,
);

// GovTech alternating color palette to ensure adjacent barangays are clearly distinct
const PALETTE = ['#10B981', '#06B6D4', '#3B82F6', '#8B5CF6'];

function getBarangayFillColor(psgcCode: string): string {
    const num = parseInt(psgcCode.slice(-3), 10) || 0;
    return PALETTE[num % PALETTE.length];
}

function getNormalStyle(feature: any) {
    const psgc =
        feature?.properties?.psgc_code || feature?.properties?.ADM4_PCODE || '';
    return {
        color: '#059669',
        weight: 1.5,
        opacity: 0.85,
        fillColor: getBarangayFillColor(psgc),
        fillOpacity: 0.12,
    };
}

function getHoverStyle(feature: any) {
    return {
        color: '#047857',
        weight: 2.5,
        opacity: 1,
        fillColor: '#10B981',
        fillOpacity: 0.28,
    };
}

function getSelectedStyle() {
    return {
        color: '#D97706',
        weight: 3,
        opacity: 1,
        fillColor: '#F59E0B',
        fillOpacity: 0.38,
    };
}

// Custom SVG Pin Icon for high-res crisp display
function createPinIcon(color = '#DC2626', isSelected = false) {
    return L.divIcon({
        className: 'georeport-leaflet-marker',
        html: `
            <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-full">
                ${isSelected ? '<span class="absolute -bottom-1 size-7 rounded-full bg-red-500/35 animate-ping"></span>' : ''}
                <div style="background-color: ${color};" class="size-8 rounded-full border-2 border-white dark:border-slate-900 shadow-md flex items-center justify-center text-white drop-shadow-sm transition-transform hover:scale-110">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
                        <circle cx="12" cy="10" r="3" fill="currentColor"/>
                    </svg>
                </div>
                <div style="border-top-color: ${color};" class="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] -mt-[1px]"></div>
            </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
        popupAnchor: [0, -32],
    });
}

function updateSelectedLocation(lat: number, lng: number, panTo = false) {
    const roundedLat = Number(lat.toFixed(6));
    const roundedLng = Number(lng.toFixed(6));

    currentSelected.value = { latitude: roundedLat, longitude: roundedLng };
    emit('select-location', { latitude: roundedLat, longitude: roundedLng });
    emit('update:selectedLatitude', roundedLat);
    emit('update:selectedLongitude', roundedLng);

    if (!map) return;

    if (selectedMarker) {
        selectedMarker.setLatLng([roundedLat, roundedLng]);
    } else {
        selectedMarker = L.marker([roundedLat, roundedLng], {
            icon: createPinIcon('#DC2626', true),
            draggable: props.draggablePin,
            title: 'Selected Coordinate · Loon, Bohol',
        }).addTo(map);

        if (props.draggablePin) {
            selectedMarker.on('dragend', (e) => {
                const target = e.target as L.Marker;
                const position = target.getLatLng();
                updateSelectedLocation(position.lat, position.lng, false);
            });
        }
    }

    selectedMarker.bindPopup(`
        <div class="p-1 space-y-1 text-xs font-sans">
            <div class="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span class="size-2 rounded-full bg-red-600 animate-pulse"></span>
                <span>Pinned Location</span>
            </div>
            <div class="font-mono text-[11px] text-slate-600 dark:text-slate-300">
                ${roundedLat.toFixed(6)}° N, ${roundedLng.toFixed(6)}° E
            </div>
            <div class="text-[10px] text-slate-500">
                Municipality of Loon, Province of Bohol
            </div>
        </div>
    `);

    if (panTo) {
        map.panTo([roundedLat, roundedLng]);
    }
}

function clearSelection() {
    if (selectedMarker && map) {
        map.removeLayer(selectedMarker);
        selectedMarker = null;
    }
    currentSelected.value = null;
    emit('update:selectedLatitude', null);
    emit('update:selectedLongitude', null);
}

function setSelectedBarangay(feature: any, layer?: L.Path, zoomTo = false) {
    const props = feature.properties || {};
    const name = props.ADM4_EN || props.psgc_name || 'Barangay';
    const psgc_code = props.psgc_code || props.ADM4_PCODE || '';
    const pcode = props.ADM4_PCODE || '';
    const area_sqkm = props.AREA_SQKM || 0;

    // Reset previous selected layer style
    if (
        selectedBarangay.value &&
        layerByPsgc.has(selectedBarangay.value.psgc_code)
    ) {
        const prevLayer = layerByPsgc.get(selectedBarangay.value.psgc_code);
        if (prevLayer && (prevLayer as any).feature) {
            prevLayer.setStyle(getNormalStyle((prevLayer as any).feature));
        }
    }

    const payload: BarangaySelection = {
        name,
        psgc_code,
        pcode,
        area_sqkm,
        properties: props,
    };

    selectedBarangay.value = payload;
    emit('select-barangay', payload);
    emit('update:selectedBarangayPsgc', psgc_code);

    // Apply selected style to target layer
    const targetLayer = layer || layerByPsgc.get(psgc_code);
    if (targetLayer) {
        targetLayer.setStyle(getSelectedStyle());
        if ('bringToFront' in targetLayer) {
            targetLayer.bringToFront();
        }

        if (zoomTo && map && 'getBounds' in targetLayer) {
            map.fitBounds((targetLayer as any).getBounds(), {
                padding: [40, 40],
                maxZoom: 16,
            });
        }
    }
}

function clearBarangaySelection() {
    if (
        selectedBarangay.value &&
        layerByPsgc.has(selectedBarangay.value.psgc_code)
    ) {
        const prevLayer = layerByPsgc.get(selectedBarangay.value.psgc_code);
        if (prevLayer && (prevLayer as any).feature) {
            prevLayer.setStyle(getNormalStyle((prevLayer as any).feature));
        }
    }

    selectedBarangay.value = null;
    emit('select-barangay', null);
    emit('update:selectedBarangayPsgc', null);

    if (map) {
        map.closePopup();
    }
}

function toggleBoundariesOverlay() {
    isBoundariesVisible.value = !isBoundariesVisible.value;
    if (!map || !geoJsonLayerGroup) return;

    if (isBoundariesVisible.value) {
        if (!map.hasLayer(geoJsonLayerGroup)) {
            map.addLayer(geoJsonLayerGroup);
        }
    } else {
        if (map.hasLayer(geoJsonLayerGroup)) {
            map.removeLayer(geoJsonLayerGroup);
        }
    }
}

function resetToDefaultCenter() {
    if (!map) return;
    map.setView([props.latitude, props.longitude], props.zoom);
}

function fitLoonBounds() {
    if (!map || !geoJsonLayerGroup) return;
    const bounds = geoJsonLayerGroup.getBounds();
    if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [30, 30] });
    }
}

function copyCoordinates() {
    if (!currentSelected.value) return;
    const text = `${currentSelected.value.latitude}, ${currentSelected.value.longitude}`;
    navigator.clipboard.writeText(text);
    copied.value = true;
    setTimeout(() => {
        copied.value = false;
    }, 2000);
}

function syncExternalMarkers() {
    if (!map || !markerLayerGroup) return;

    markerLayerGroup.clearLayers();

    props.markers.forEach((item) => {
        const marker = L.marker([item.latitude, item.longitude], {
            icon: createPinIcon(item.color ?? '#0284C7', false),
            title: item.title ?? `Marker #${item.id}`,
        });

        if (item.title || item.description) {
            marker.bindPopup(`
                <div class="p-1 space-y-1 text-xs font-sans">
                    ${item.title ? `<div class="font-bold text-slate-900 dark:text-white">${item.title}</div>` : ''}
                    ${item.description ? `<div class="text-slate-600 dark:text-slate-300 text-[11px] leading-tight">${item.description}</div>` : ''}
                    <div class="font-mono text-[10px] text-slate-500 pt-0.5">
                        ${item.latitude.toFixed(6)}° N, ${item.longitude.toFixed(6)}° E
                    </div>
                </div>
            `);
        }

        markerLayerGroup?.addLayer(marker);
    });
}

function renderGeoJsonLayer(geoJsonData: any) {
    if (!map) return;

    if (geoJsonLayerGroup) {
        map.removeLayer(geoJsonLayerGroup);
        geoJsonLayerGroup = null;
    }
    layerByPsgc.clear();

    geoJsonLayerGroup = L.geoJSON(geoJsonData, {
        style: (feature) => {
            const psgc =
                feature?.properties?.psgc_code ||
                feature?.properties?.ADM4_PCODE;
            if (
                selectedBarangay.value &&
                selectedBarangay.value.psgc_code === psgc
            ) {
                return getSelectedStyle();
            }
            return getNormalStyle(feature);
        },
        onEachFeature: (feature, layer) => {
            const p = feature.properties || {};
            const bName = p.ADM4_EN || p.psgc_name || 'Barangay';
            const psgc = p.psgc_code || p.ADM4_PCODE || '';
            const pcode = p.ADM4_PCODE || '';
            const area = p.AREA_SQKM ? Number(p.AREA_SQKM).toFixed(2) : '—';

            if (psgc) {
                layerByPsgc.set(psgc, layer as L.Path);
            }

            // 1. Tooltip on Hover
            layer.bindTooltip(
                `
                <div class="px-1.5 py-0.5 text-xs font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 font-sans">
                    <span class="size-2 rounded-full bg-emerald-500"></span>
                    <span>${bName}</span>
                </div>
            `,
                {
                    sticky: true,
                    direction: 'top',
                    className: 'georeport-barangay-tooltip',
                    offset: [0, -10],
                },
            );

            // 2. Interactive Click Popup
            layer.bindPopup(`
                <div class="p-1.5 space-y-2 text-xs font-sans min-w-[200px]">
                    <div class="flex items-center justify-between gap-2 border-b border-border/80 pb-1.5">
                        <span class="font-bold text-slate-900 dark:text-white text-sm">${bName}</span>
                        <span class="text-[10px] bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded font-mono font-medium">Loon</span>
                    </div>
                    <div class="space-y-1 text-[11px] text-slate-600 dark:text-slate-300 font-mono">
                        <div class="flex justify-between"><span class="text-slate-400">PSGC Code:</span> <strong>${psgc}</strong></div>
                        <div class="flex justify-between"><span class="text-slate-400">PCODE:</span> <span>${pcode}</span></div>
                        <div class="flex justify-between"><span class="text-slate-400">Land Area:</span> <span>${area} sq km</span></div>
                        <div class="flex justify-between"><span class="text-slate-400">Jurisdiction:</span> <span>LGU Loon, Bohol</span></div>
                    </div>
                </div>
            `);

            // 3. Mouse Event Listeners
            layer.on({
                mouseover: (e) => {
                    hoveredBarangay.value = bName;
                    const l = e.target as L.Path;
                    if (
                        !selectedBarangay.value ||
                        selectedBarangay.value.psgc_code !== psgc
                    ) {
                        l.setStyle(getHoverStyle(feature));
                        if ('bringToFront' in l) {
                            l.bringToFront();
                        }
                    }
                },
                mouseout: (e) => {
                    hoveredBarangay.value = null;
                    const l = e.target as L.Path;
                    if (
                        !selectedBarangay.value ||
                        selectedBarangay.value.psgc_code !== psgc
                    ) {
                        l.setStyle(getNormalStyle(feature));
                    }
                },
                click: (e: L.LeafletMouseEvent) => {
                    L.DomEvent.stopPropagation(e);
                    setSelectedBarangay(feature, e.target as L.Path, false);
                    if (props.selectable && props.pinOnPolygonClick) {
                        updateSelectedLocation(
                            e.latlng.lat,
                            e.latlng.lng,
                            false,
                        );
                    }
                },
            });
        },
    });

    if (isBoundariesVisible.value) {
        geoJsonLayerGroup.addTo(map);
    }

    if (props.fitBoundsToBarangays) {
        fitLoonBounds();
    }

    // Select initial barangay if passed
    if (
        props.selectedBarangayPsgc &&
        layerByPsgc.has(props.selectedBarangayPsgc)
    ) {
        const l = layerByPsgc.get(props.selectedBarangayPsgc);
        if (l && (l as any).feature) {
            setSelectedBarangay((l as any).feature, l, false);
        }
    }
}

async function fetchAndLoadGeoJson() {
    if (props.geoJsonData) {
        renderGeoJsonLayer(props.geoJsonData);
        return;
    }

    if (cachedLoonGeoJson) {
        renderGeoJsonLayer(cachedLoonGeoJson);
        return;
    }

    isGeoJsonLoading.value = true;
    geoJsonLoadError.value = null;

    try {
        const res = await fetch(props.geoJsonUrl, {
            headers: {
                Accept: 'application/geo+json, application/json',
            },
        });

        if (!res.ok) {
            throw new Error(`Failed to load Loon GeoJSON: HTTP ${res.status}`);
        }

        const data = await res.json();
        cachedLoonGeoJson = data;
        renderGeoJsonLayer(data);
    } catch (err: any) {
        console.error('Loon GeoJSON error:', err);
        geoJsonLoadError.value =
            err?.message || 'Error loading Loon boundaries';
    } finally {
        isGeoJsonLoading.value = false;
    }
}

function initializeMap() {
    if (!mapContainer.value || map) return;

    // 1. Create map instance centered on Loon, Bohol (9.80, 123.80)
    map = L.map(mapContainer.value, {
        center: [props.latitude, props.longitude],
        zoom: props.zoom,
        zoomControl: false, // Custom GovTech zoom controls
        attributionControl: true,
        scrollWheelZoom: true,
    });

    // 2. Attach standard OpenStreetMap tile layer with required attribution
    tileLayer = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
            maxZoom: 19,
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
        },
    ).addTo(map);

    // 3. Layer group for additional markers
    markerLayerGroup = L.layerGroup().addTo(map);
    syncExternalMarkers();

    // 4. Setup initial selected coordinate if passed
    if (props.selectedLatitude !== null && props.selectedLongitude !== null) {
        updateSelectedLocation(
            props.selectedLatitude,
            props.selectedLongitude,
            false,
        );
    }

    // 5. Track center and zoom
    map.on('move', () => {
        if (!map) return;
        const center = map.getCenter();
        currentCenter.value = {
            latitude: Number(center.lat.toFixed(6)),
            longitude: Number(center.lng.toFixed(6)),
        };
    });

    map.on('zoomend', () => {
        if (!map) return;
        currentZoom.value = map.getZoom();
    });

    // 6. Handle click-to-select location (only fires if not clicking on popup or polygon)
    if (props.selectable) {
        map.on('click', (e: L.LeafletMouseEvent) => {
            updateSelectedLocation(e.latlng.lat, e.latlng.lng, false);
        });
    }

    // 7. Load Loon barangays GeoJSON layer
    if (props.showBarangays) {
        fetchAndLoadGeoJson();
    }

    // 8. Invalidate size after layout completes
    nextTick(() => {
        map?.invalidateSize();
    });
}

function handleZoomIn() {
    map?.zoomIn();
}

function handleZoomOut() {
    map?.zoomOut();
}

watch(
    () => [props.latitude, props.longitude, props.zoom],
    ([newLat, newLng, newZoom]) => {
        if (map && typeof newLat === 'number' && typeof newLng === 'number') {
            map.setView([newLat, newLng], (newZoom as number) ?? props.zoom);
        }
    },
);

watch(
    () => props.markers,
    () => {
        syncExternalMarkers();
    },
    { deep: true },
);

watch(
    () => props.showBarangays,
    (val) => {
        if (val !== isBoundariesVisible.value) {
            toggleBoundariesOverlay();
        }
    },
);

watch(
    () => props.selectedBarangayPsgc,
    (newPsgc) => {
        if (newPsgc && layerByPsgc.has(newPsgc)) {
            const l = layerByPsgc.get(newPsgc);
            if (l && (l as any).feature) {
                setSelectedBarangay((l as any).feature, l, true);
            }
        } else if (!newPsgc && selectedBarangay.value) {
            clearBarangaySelection();
        }
    },
);

watch(
    () => [props.selectedLatitude, props.selectedLongitude],
    ([newLat, newLng]) => {
        if (
            newLat !== null &&
            newLng !== null &&
            typeof newLat === 'number' &&
            typeof newLng === 'number'
        ) {
            if (
                currentSelected.value?.latitude !== newLat ||
                currentSelected.value?.longitude !== newLng
            ) {
                updateSelectedLocation(newLat, newLng, false);
            }
        } else if (newLat === null && newLng === null && selectedMarker) {
            clearSelection();
        }
    },
);

function onWindowResize() {
    map?.invalidateSize();
}

onMounted(() => {
    initializeMap();
    window.addEventListener('resize', onWindowResize);
});

onBeforeUnmount(() => {
    window.removeEventListener('resize', onWindowResize);
    if (map) {
        map.off();
        map.remove();
        map = null;
        tileLayer = null;
        selectedMarker = null;
        markerLayerGroup = null;
        geoJsonLayerGroup = null;
        layerByPsgc.clear();
    }
});

defineExpose({
    map: () => map,
    getSelectedLocation: () => currentSelected.value,
    setSelectedLocation: updateSelectedLocation,
    clearSelection,
    resetToDefaultCenter,
    fitLoonBounds,
    setSelectedBarangay,
    clearBarangaySelection,
    toggleBoundariesOverlay,
    getSelectedBarangay: () => selectedBarangay.value,
});
</script>

<template>
    <div class="relative w-full space-y-2">
        <!-- Main Map Viewport -->
        <div
            class="relative w-full overflow-hidden rounded-xl border border-border/80 bg-muted/30 shadow-xs focus-within:ring-2 focus-within:ring-emerald-500/50"
            :class="height"
        >
            <!-- Leaflet Container -->
            <div
                ref="mapContainer"
                class="absolute inset-0 z-0 h-full w-full bg-slate-100 dark:bg-slate-900"
            />

            <!-- Top Left: GovTech Loon Identification Pill & Active Barangay Status -->
            <div
                class="pointer-events-none absolute top-3 left-3 z-[10] flex max-w-[calc(100%-4.5rem)] flex-col gap-1.5 sm:max-w-xs"
            >
                <div
                    class="pointer-events-auto flex flex-wrap items-center gap-x-2 gap-y-0.5 rounded-lg border border-slate-800/80 bg-[#0C1A30]/90 px-3 py-1.5 text-xs text-white shadow-md backdrop-blur-md"
                >
                    <span
                        class="size-2 animate-pulse rounded-full bg-emerald-400"
                    />
                    <span class="font-bold tracking-tight">
                        {{
                            showBarangays
                                ? 'Loon, Bohol GIS'
                                : 'Loon, Bohol Map'
                        }}
                    </span>
                    <template v-if="showBarangays">
                        <span class="text-slate-500">•</span>
                        <span class="font-mono text-[11px] text-amber-300"
                            >67 Barangays</span
                        >
                    </template>
                </div>

                <!-- Hovered or Selected Barangay Live Feedback Pill -->
                <div
                    v-if="
                        showBarangays && (hoveredBarangay || selectedBarangay)
                    "
                    class="pointer-events-auto flex animate-in items-center gap-2 rounded-lg border border-emerald-500/40 bg-background/95 px-3 py-1.5 text-xs shadow-md backdrop-blur-md transition-all fade-in slide-in-from-top-1"
                >
                    <span
                        class="size-2 rounded-full bg-emerald-600 dark:text-emerald-400"
                    />
                    <div class="truncate">
                        <span class="font-bold text-foreground">{{
                            hoveredBarangay || selectedBarangay?.name
                        }}</span>
                        <span
                            v-if="selectedBarangay && !hoveredBarangay"
                            class="ml-1 font-mono text-[10px] text-muted-foreground"
                        >
                            ({{ selectedBarangay.psgc_code }})
                        </span>
                    </div>
                </div>

                <div
                    v-else-if="selectable"
                    class="pointer-events-auto rounded-md border border-border/80 bg-background/90 px-2.5 py-1 text-[11px] font-medium text-muted-foreground shadow-xs backdrop-blur-sm"
                >
                    {{
                        showBarangays
                            ? 'Select a barangay or click to pin coordinates'
                            : 'Click on the map to pin coordinates'
                    }}
                </div>
            </div>

            <!-- Top Right: Zoom, Recenter, & Boundary Layer Toggle Toolbar -->
            <div class="absolute top-3 right-3 z-[10] flex flex-col gap-1.5">
                <div
                    class="flex flex-col rounded-lg border border-border/80 bg-background/95 p-1 shadow-md backdrop-blur-md"
                >
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        class="size-8 text-foreground hover:bg-muted"
                        title="Zoom in"
                        @click="handleZoomIn"
                    >
                        <ZoomIn class="size-4" />
                    </Button>
                    <div class="h-px w-full bg-border" />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        class="size-8 text-foreground hover:bg-muted"
                        title="Zoom out"
                        @click="handleZoomOut"
                    >
                        <ZoomOut class="size-4" />
                    </Button>
                </div>

                <!-- Recenter Map Button -->
                <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    class="size-8 rounded-lg border-border/80 bg-background/95 text-foreground shadow-md backdrop-blur-md hover:bg-muted"
                    :title="
                        showBarangays
                            ? 'Fit all Loon boundaries'
                            : 'Recenter map'
                    "
                    @click="
                        showBarangays ? fitLoonBounds() : resetToDefaultCenter()
                    "
                >
                    <Crosshair
                        class="size-4 text-emerald-600 dark:text-emerald-400"
                    />
                </Button>

                <!-- Toggle Barangay Boundaries Overlay (Only shown when boundaries feature is enabled) -->
                <Button
                    v-if="showBarangays"
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    class="size-8 rounded-lg border-border/80 bg-background/95 text-foreground shadow-md backdrop-blur-md hover:bg-muted"
                    :class="{
                        'border-emerald-500/60 text-emerald-600 dark:text-emerald-400':
                            isBoundariesVisible,
                    }"
                    :title="
                        isBoundariesVisible
                            ? 'Hide boundaries'
                            : 'Show boundaries'
                    "
                    @click="toggleBoundariesOverlay"
                >
                    <Eye v-if="isBoundariesVisible" class="size-4" />
                    <EyeOff v-else class="size-4 text-muted-foreground" />
                </Button>
            </div>

            <!-- Bottom Right: Map Legend (Section 6) -->
            <div
                v-if="showLegend && showBarangays"
                class="pointer-events-auto absolute right-3 z-[10] max-w-[220px] sm:max-w-[240px]"
                :class="
                    showCoordinatesBadge ? 'bottom-16 sm:bottom-3' : 'bottom-3'
                "
            >
                <div
                    class="space-y-2 rounded-lg border border-border/80 bg-background/95 p-2.5 text-xs shadow-lg backdrop-blur-md"
                >
                    <div
                        class="flex items-center justify-between gap-2 border-b border-border/60 pb-1.5"
                    >
                        <div
                            class="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-foreground uppercase"
                        >
                            <Layers
                                class="size-3.5 text-emerald-600 dark:text-emerald-400"
                            />
                            <span>GIS Legend</span>
                        </div>
                        <button
                            type="button"
                            class="text-[10px] text-muted-foreground hover:text-foreground"
                            @click="isLegendExpanded = !isLegendExpanded"
                        >
                            <ChevronDown
                                v-if="!isLegendExpanded"
                                class="size-3"
                            />
                            <ChevronUp v-else class="size-3" />
                        </button>
                    </div>

                    <div
                        v-if="isLegendExpanded"
                        class="space-y-1.5 text-[11px] text-muted-foreground"
                    >
                        <div class="flex items-center gap-2">
                            <span
                                class="size-3 shrink-0 rounded border border-emerald-600 bg-emerald-500/20"
                            />
                            <span>Barangay Boundary (67)</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <span
                                class="size-3 shrink-0 rounded border border-emerald-700 bg-emerald-500/40 shadow-xs"
                            />
                            <span>Hovered Barangay</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <span
                                class="size-3 shrink-0 rounded border border-amber-600 bg-amber-500/45 shadow-xs"
                            />
                            <span>Selected Barangay</span>
                        </div>

                        <!-- Active Selected Barangay Quick Actions -->
                        <div
                            v-if="selectedBarangay"
                            class="mt-1.5 space-y-1 border-t border-border/60 pt-1.5"
                        >
                            <div
                                class="flex items-center justify-between text-[11px] font-bold text-foreground"
                            >
                                <span class="truncate">{{
                                    selectedBarangay.name
                                }}</span>
                                <button
                                    type="button"
                                    class="ml-1 text-[10px] text-red-500 hover:text-red-600"
                                    title="Clear selected barangay"
                                    @click="clearBarangaySelection"
                                >
                                    <X class="size-3" />
                                </button>
                            </div>
                            <div
                                class="flex justify-between font-mono text-[10px] text-muted-foreground"
                            >
                                <span>PSGC:</span>
                                <span class="font-bold text-foreground">{{
                                    selectedBarangay.psgc_code
                                }}</span>
                            </div>
                            <div
                                class="flex justify-between font-mono text-[10px] text-muted-foreground"
                            >
                                <span>Area:</span>
                                <span
                                    >{{ selectedBarangay.area_sqkm }} sq
                                    km</span
                                >
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Bottom Left Floating Information Bar: Coordinates Display & Selection -->
            <div
                v-if="showCoordinatesBadge"
                class="pointer-events-auto absolute right-3 bottom-3 left-3 z-[10] flex flex-col gap-2 sm:right-auto sm:max-w-sm"
            >
                <!-- Selected Location Active Card -->
                <div
                    v-if="currentSelected"
                    class="flex animate-in items-center justify-between gap-3 rounded-lg border border-red-500/40 bg-[#0B1528]/95 px-3.5 py-2 text-white shadow-lg backdrop-blur-md duration-200 fade-in slide-in-from-bottom-2"
                >
                    <div class="flex min-w-0 items-center gap-2.5">
                        <div
                            class="flex size-7 shrink-0 items-center justify-center rounded-full border border-red-500/30 bg-red-500/20 text-red-400"
                        >
                            <MapPin class="size-3.5" />
                        </div>
                        <div class="min-w-0">
                            <div
                                class="text-[10px] font-semibold tracking-wide text-red-300 uppercase"
                            >
                                Selected Coordinates
                            </div>
                            <div
                                class="truncate font-mono text-xs font-bold text-white"
                            >
                                {{ currentSelected.latitude.toFixed(6) }}° N,
                                {{ currentSelected.longitude.toFixed(6) }}° E
                            </div>
                        </div>
                    </div>

                    <div class="flex shrink-0 items-center gap-1.5">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            class="size-7 text-slate-300 hover:bg-slate-800 hover:text-white"
                            title="Copy coordinates"
                            @click="copyCoordinates"
                        >
                            <Check
                                v-if="copied"
                                class="size-3.5 text-emerald-400"
                            />
                            <Copy v-else class="size-3.5" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            class="size-7 text-slate-400 hover:bg-red-950/40 hover:text-red-400"
                            title="Clear pin"
                            @click="clearSelection"
                        >
                            <RotateCcw class="size-3.5" />
                        </Button>
                    </div>
                </div>

                <!-- Map Center Viewport Readout (When no pin selected) -->
                <div
                    v-else
                    class="flex w-fit max-w-full flex-wrap items-center gap-x-2 gap-y-0.5 rounded-lg border border-border/80 bg-background/90 px-3 py-1.5 text-xs text-muted-foreground shadow-md backdrop-blur-md"
                >
                    <Compass
                        class="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                    />
                    <span class="font-mono text-[11px]">
                        {{ currentCenter.latitude.toFixed(4) }}° N,
                        {{ currentCenter.longitude.toFixed(4) }}° E
                    </span>
                    <span class="text-border">•</span>
                    <span class="font-mono text-[11px]"
                        >Zoom: {{ currentZoom }}</span
                    >
                </div>
            </div>
        </div>

        <!-- Optional Caption or Footer Meta -->
        <div
            v-if="caption"
            class="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-0.5 text-xs text-muted-foreground"
        >
            <p>{{ caption }}</p>
            <span class="font-mono text-[10px] text-muted-foreground">
                {{
                    showBarangays
                        ? 'NAMRIA / PSA (2023) · EPSG:4326'
                        : 'OpenStreetMap · EPSG:4326'
                }}
            </span>
        </div>
    </div>
</template>

<style>
/* Leaflet Custom GovTech Popup Styling */
.leaflet-popup-content-wrapper {
    background-color: var(--color-background, #ffffff);
    color: var(--color-foreground, #0f172a);
    border-radius: 0.5rem;
    border: 1px solid var(--color-border, #e2e8f0);
    box-shadow:
        0 4px 6px -1px rgb(0 0 0 / 0.1),
        0 2px 4px -2px rgb(0 0 0 / 0.1);
    padding: 0;
}

.leaflet-popup-content {
    margin: 8px 12px;
    line-height: 1.4;
}

.leaflet-popup-tip {
    background-color: var(--color-background, #ffffff);
    border: 1px solid var(--color-border, #e2e8f0);
}

/* Barangay Tooltip styling */
.georeport-barangay-tooltip {
    background-color: var(--color-background, #ffffff);
    border: 1px solid var(--color-border, #cbd5e1);
    color: var(--color-foreground, #0f172a);
    border-radius: 0.375rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 2px 6px;
    font-weight: 600;
}

.dark .georeport-barangay-tooltip {
    background-color: #0f172a;
    border-color: #334155;
    color: #f8fafc;
}

/* Ensure Leaflet stays strictly behind application header/modals (z-50+) */
.leaflet-pane {
    z-index: 1 !important;
}

.leaflet-top,
.leaflet-bottom {
    z-index: 2 !important;
}

.leaflet-control-attribution {
    background: rgba(255, 255, 255, 0.75) !important;
    backdrop-filter: blur(4px);
    font-size: 10px !important;
    color: #475569 !important;
    border-top-left-radius: 4px;
}

.dark .leaflet-control-attribution {
    background: rgba(15, 23, 42, 0.8) !important;
    color: #94a3b8 !important;
}

.dark .leaflet-control-attribution a {
    color: #38bdf8 !important;
}
</style>
