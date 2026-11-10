import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    Check,
    Compass,
    Crosshair,
    Layers,
    MapPin,
    Navigation2,
    ShieldCheck,
    X,
} from 'lucide-react';
import OpenStreetMap, {
    type BarangaySelection,
} from '@/components/OpenStreetMap';
import { PageHeader } from '@/components/geo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/AppLayout';
import type { BreadcrumbItem } from '@/types';

export default function Index() {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'GIS OpenStreetMap', href: '/gis' },
    ];

    const [targetLat, setTargetLat] = useState(9.8);
    const [targetLng, setTargetLng] = useState(123.8);
    const [targetZoom, setTargetZoom] = useState(13);

    const [selectedLat, setSelectedLat] = useState<number | null>(null);
    const [selectedLng, setSelectedLng] = useState<number | null>(null);

    const [selectedBarangay, setSelectedBarangay] =
        useState<BarangaySelection | null>(null);
    const [activeBarangayPsgc, setActiveBarangayPsgc] = useState<string | null>(
        null
    );

    const loonPresets = [
        {
            name: 'Loon Municipal Hall & Poblacion',
            barangay: 'Moto Sur',
            lat: 9.7997,
            lng: 123.7925,
            zoom: 15,
            description:
                'Seat of Municipal Government and Emergency Incident Command',
        },
        {
            name: 'Catagbacan International Port',
            barangay: 'Catagbacan Norte',
            lat: 9.8123,
            lng: 123.8054,
            zoom: 15,
            description:
                'Key maritime passenger and cargo ferry terminal connecting Bohol to Cebu',
        },
        {
            name: 'Sandingan Island Causeway',
            barangay: 'Tangnan / Subayon',
            lat: 9.8512,
            lng: 123.7745,
            zoom: 14,
            description:
                'Causeway route linking mainland Loon to Sandingan Island barangays',
        },
        {
            name: 'Nuestra Señora de la Luz Heritage Church',
            barangay: 'Moto Norte',
            lat: 9.8015,
            lng: 123.794,
            zoom: 16,
            description: 'Historic Spanish colonial stone church founded in 1753',
        },
        {
            name: 'Napo Public Market & Fish Landing',
            barangay: 'Napo',
            lat: 9.7968,
            lng: 123.7912,
            zoom: 16,
            description: 'Commercial trading center and coastal fisherfolk dock',
        },
    ];

    const goToPreset = (preset: (typeof loonPresets)[0]) => {
        setTargetLat(preset.lat);
        setTargetLng(preset.lng);
        setTargetZoom(preset.zoom);
        setSelectedLat(preset.lat);
        setSelectedLng(preset.lng);
    };

    const handleLocationSelected = (lat: number, lng: number) => {
        setSelectedLat(lat);
        setSelectedLng(lng);
    };

    const handleBarangaySelected = (b: BarangaySelection) => {
        setSelectedBarangay(b);
        setActiveBarangayPsgc(b?.psgc_code ?? null);
    };

    const clearBarangay = () => {
        setSelectedBarangay(null);
        setActiveBarangayPsgc(null);
    };

    const fitLoon = () => {
        setTargetLat(9.8);
        setTargetLng(123.8);
        setTargetZoom(13);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="GIS Phase 2 · Loon, Bohol Barangay Boundaries" />

            <div className="mx-auto flex h-full w-full max-w-7xl flex-1 flex-col gap-5 p-4 sm:p-6">
                <PageHeader
                    eyebrow="GIS Phase 2"
                    title="Loon, Bohol Barangay Boundaries"
                    description="Integrated 67 official barangay boundary polygons from the NAMRIA / PSA GeoJSON dataset over OpenStreetMap with hover tooltips, click selection, and PSGC metadata inspector."
                    actions={
                        <div className="flex flex-wrap items-center gap-2">
                            <Button variant="outline" size="sm" onClick={fitLoon}>
                                <Crosshair className="mr-1.5 size-3.5 text-emerald-600 dark:text-emerald-400" />
                                Fit All 67 Barangays
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/admin/map">
                                    <Navigation2 className="mr-1.5 size-3.5" />
                                    Admin GIS Map
                                </Link>
                            </Button>
                        </div>
                    }
                />

                {/* GovTech Compliance & Status Banner */}
                <div className="flex flex-col justify-between gap-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 shadow-xs sm:flex-row sm:items-center">
                    <div className="flex items-start gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                            <ShieldCheck className="size-5" />
                        </div>
                        <div className="space-y-0.5">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-bold text-foreground">
                                    Official NAMRIA / PSA Boundaries (2023) Active
                                </span>
                                <Badge
                                    variant="outline"
                                    className="border-emerald-500/40 px-2 py-0 text-[10px] text-emerald-700 dark:text-emerald-300"
                                >
                                    67 Verified Polygons
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Securely served via{' '}
                                <code className="font-mono text-emerald-700 dark:text-emerald-300">
                                    /geojson/loon-barangays
                                </code>{' '}
                                (81 KB) with transparent overlays, interactive hover
                                tooltips, and click-to-inspect popups.
                            </p>
                        </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-3 font-mono text-xs">
                        <span className="flex items-center gap-1.5">
                            <span className="size-2 animate-pulse rounded-full bg-emerald-500" />
                            <span className="text-muted-foreground">Total Area:</span>
                            <span className="font-bold text-foreground">98.70 km²</span>
                        </span>
                        <span className="text-border">|</span>
                        <span className="text-muted-foreground">PSGC:</span>
                        <span className="font-bold text-foreground">070123000</span>
                    </div>
                </div>

                {/* Main Map and Control Grid */}
                <div className="grid gap-5 lg:grid-cols-12">
                    {/* Left: Primary OpenStreetMap Container (8 cols) */}
                    <div className="space-y-3 lg:col-span-8">
                        <Card className="overflow-hidden border-border/80 shadow-xs">
                            <CardHeader className="border-b border-border/50 bg-muted/20 pb-3">
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                    <div>
                                        <CardTitle className="flex items-center gap-2 text-base font-bold">
                                            <Layers className="size-4 text-emerald-600 dark:text-emerald-400" />
                                            <span>Loon Municipal Boundary GIS Map</span>
                                        </CardTitle>
                                        <CardDescription className="text-xs">
                                            Click any barangay polygon on the map to
                                            inspect its official PSGC code, land area,
                                            and boundaries.
                                        </CardDescription>
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className="bg-background font-mono text-[11px]"
                                    >
                                        67 Barangays Loaded
                                    </Badge>
                                </div>
                            </CardHeader>

                            <CardContent className="p-3">
                                <OpenStreetMap
                                    latitude={targetLat}
                                    longitude={targetLng}
                                    zoom={targetZoom}
                                    height="h-[480px] sm:h-[540px]"
                                    selectable={true}
                                    showBarangays={true}
                                    showLegend={true}
                                    geoJsonUrl="/geojson/loon-barangays"
                                    selectedLatitude={selectedLat}
                                    selectedLongitude={selectedLng}
                                    selectedBarangayPsgc={activeBarangayPsgc}
                                    caption="Municipality of Loon, Province of Bohol · OpenStreetMap & Official NAMRIA Boundaries"
                                    onLocationSelect={handleLocationSelected}
                                    onBarangaySelect={handleBarangaySelected}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right: Barangay Inspector & Loon Strategic Areas (4 cols) */}
                    <div className="space-y-4 lg:col-span-4">
                        {/* Selected Barangay Metadata Inspector Card */}
                        <Card className="border-border/80 shadow-xs">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2 text-sm font-bold">
                                        <Layers className="size-4 text-amber-500" />
                                        <span>Barangay Inspector</span>
                                    </CardTitle>
                                    {selectedBarangay && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 px-1.5 text-[10px] text-muted-foreground hover:text-red-500"
                                            onClick={clearBarangay}
                                        >
                                            <X className="mr-1 size-3" />
                                            Clear
                                        </Button>
                                    )}
                                </div>
                                <CardDescription className="text-xs">
                                    Official boundaries and geographic data for the
                                    selected barangay in Loon.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 text-xs">
                                {selectedBarangay ? (
                                    <div className="space-y-2.5 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3.5">
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm font-bold text-foreground">
                                                {selectedBarangay.name}
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className="border-amber-500/40 text-[10px] text-amber-700 dark:text-amber-300"
                                            >
                                                Selected Barangay
                                            </Badge>
                                        </div>

                                        <div className="space-y-1.5 border-t border-amber-500/20 pt-1 font-mono text-[11px]">
                                            <div className="flex justify-between">
                                                <span className="font-sans text-xs text-muted-foreground">
                                                    PSGC Code:
                                                </span>
                                                <span className="font-bold text-foreground">
                                                    {selectedBarangay.psgc_code}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="font-sans text-xs text-muted-foreground">
                                                    PCODE:
                                                </span>
                                                <span className="text-foreground">
                                                    {selectedBarangay.pcode}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="font-sans text-xs text-muted-foreground">
                                                    Land Area:
                                                </span>
                                                <span className="font-bold text-foreground">
                                                    {selectedBarangay.area_sqkm} km²
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="font-sans text-xs text-muted-foreground">
                                                    Province:
                                                </span>
                                                <span className="text-foreground">
                                                    Bohol (Region VII)
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between border-t border-amber-500/20 pt-1 text-[11px] text-muted-foreground">
                                            <span>
                                                Polygon boundary highlighted on map
                                            </span>
                                            <Check className="size-3.5 text-amber-600" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-1 rounded-lg border border-dashed border-border p-4 text-center text-muted-foreground">
                                        <Layers className="mx-auto size-5 text-muted-foreground/60" />
                                        <p className="font-medium">
                                            No barangay selected
                                        </p>
                                        <p className="text-[11px]">
                                            Click any barangay polygon on the map to
                                            inspect details.
                                        </p>
                                    </div>
                                )}

                                {/* Clicked Point Coordinates Inspector */}
                                {selectedLat !== null && selectedLng !== null && (
                                    <div className="space-y-1.5 rounded-lg border border-red-500/30 bg-red-500/5 p-3">
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                                                <MapPin className="size-3.5 text-red-500" />
                                                <span>Pin Point Coordinates</span>
                                            </span>
                                            <Badge
                                                variant="outline"
                                                className="border-red-500/40 text-[10px] text-red-600 dark:text-red-400"
                                            >
                                                Pinned
                                            </Badge>
                                        </div>
                                        <div className="font-mono text-[11px] font-bold text-foreground">
                                            {selectedLat.toFixed(6)}° N,{' '}
                                            {selectedLng.toFixed(6)}° E
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Loon Landmark Quick Nav Presets Card */}
                        <Card className="border-border/80 shadow-xs">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-sm font-bold">
                                    <Compass className="size-4 text-emerald-600 dark:text-emerald-400" />
                                    <span>Loon Strategic Landmarks</span>
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Pan the map to major strategic locations across
                                    Loon.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {loonPresets.map((preset) => (
                                    <button
                                        key={preset.name}
                                        type="button"
                                        className="w-full rounded-lg border border-border/70 p-2.5 text-left transition-all hover:border-emerald-500/60 hover:bg-emerald-500/5 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                                        onClick={() => goToPreset(preset)}
                                    >
                                        <div className="flex items-center justify-between gap-1">
                                            <span className="text-xs font-bold text-foreground">
                                                {preset.name}
                                            </span>
                                            <Badge
                                                variant="outline"
                                                className="shrink-0 font-mono text-[10px]"
                                            >
                                                {preset.barangay}
                                            </Badge>
                                        </div>
                                        <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
                                            {preset.description}
                                        </p>
                                        <div className="mt-1 font-mono text-[10px] text-emerald-700 dark:text-emerald-300">
                                            {preset.lat}° N, {preset.lng}° E
                                        </div>
                                    </button>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
