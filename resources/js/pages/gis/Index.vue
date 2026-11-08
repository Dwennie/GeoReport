<script setup lang="ts">
import { computed, ref } from 'vue';
import { Head, Link } from '@inertiajs/vue3';
import {
    Check,
    Compass,
    Crosshair,
    ExternalLink,
    Filter,
    Layers,
    MapPin,
    Navigation2,
    RotateCcw,
    ShieldCheck,
    X,
} from '@lucide/vue';
import OpenStreetMap from '@/components/OpenStreetMap.vue';
import type { BarangaySelection } from '@/components/OpenStreetMap.vue';
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
import AppLayout from '@/layouts/AppLayout.vue';
import type { BreadcrumbItem } from '@/types';

defineOptions({
    layout: AppLayout,
});

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'GIS OpenStreetMap', href: '/gis' },
];

const mapRef = ref<InstanceType<typeof OpenStreetMap> | null>(null);

const targetLat = ref(9.8);
const targetLng = ref(123.8);
const targetZoom = ref(13);

const selectedLat = ref<number | null>(null);
const selectedLng = ref<number | null>(null);

const selectedBarangay = ref<BarangaySelection | null>(null);
const activeBarangayPsgc = ref<string | null>(null);
const searchQuery = ref('');

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

function goToPreset(preset: (typeof loonPresets)[0]) {
    targetLat.value = preset.lat;
    targetLng.value = preset.lng;
    targetZoom.value = preset.zoom;
    selectedLat.value = preset.lat;
    selectedLng.value = preset.lng;

    mapRef.value?.setSelectedLocation(preset.lat, preset.lng, true);
}

function handleLocationSelected(coords: {
    latitude: number;
    longitude: number;
}) {
    selectedLat.value = coords.latitude;
    selectedLng.value = coords.longitude;
}

function handleBarangaySelected(b: BarangaySelection | null) {
    selectedBarangay.value = b;
    activeBarangayPsgc.value = b?.psgc_code ?? null;
}

function clearBarangay() {
    mapRef.value?.clearBarangaySelection();
    selectedBarangay.value = null;
    activeBarangayPsgc.value = null;
}

function fitLoon() {
    mapRef.value?.fitLoonBounds();
}
</script>

<template>
    <Head title="GIS Phase 2 · Loon, Bohol Barangay Boundaries" />

    <div
        class="mx-auto flex h-full w-full max-w-7xl flex-1 flex-col gap-5 p-4 sm:p-6"
    >
        <PageHeader
            eyebrow="GIS Phase 2"
            title="Loon, Bohol Barangay Boundaries"
            description="Integrated 67 official barangay boundary polygons from the NAMRIA / PSA GeoJSON dataset over OpenStreetMap with hover tooltips, click selection, and PSGC metadata inspector."
        >
            <template #actions>
                <div class="flex flex-wrap items-center gap-2">
                    <Button variant="outline" size="sm" @click="fitLoon">
                        <Crosshair
                            class="mr-1.5 size-3.5 text-emerald-600 dark:text-emerald-400"
                        />
                        Fit All 67 Barangays
                    </Button>
                    <Button variant="outline" size="sm" as-child>
                        <Link href="/admin/map">
                            <Navigation2 class="mr-1.5 size-3.5" />
                            Admin GIS Map
                        </Link>
                    </Button>
                </div>
            </template>
        </PageHeader>

        <!-- GovTech Compliance & Status Banner -->
        <div
            class="flex flex-col justify-between gap-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 shadow-xs sm:flex-row sm:items-center"
        >
            <div class="flex items-start gap-3">
                <div
                    class="flex size-9 shrink-0 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                >
                    <ShieldCheck class="size-5" />
                </div>
                <div class="space-y-0.5">
                    <div class="flex flex-wrap items-center gap-2">
                        <span class="text-xs font-bold text-foreground"
                            >Official NAMRIA / PSA Boundaries (2023)
                            Active</span
                        >
                        <Badge
                            variant="outline"
                            class="border-emerald-500/40 px-2 py-0 text-[10px] text-emerald-700 dark:text-emerald-300"
                        >
                            67 Verified Polygons
                        </Badge>
                    </div>
                    <p class="text-xs text-muted-foreground">
                        Securely served via
                        <code
                            class="font-mono text-emerald-700 dark:text-emerald-300"
                            >/geojson/loon-barangays</code
                        >
                        (81 KB) with transparent overlays, interactive hover
                        tooltips, and click-to-inspect popups.
                    </p>
                </div>
            </div>

            <div
                class="flex shrink-0 flex-wrap items-center gap-3 font-mono text-xs"
            >
                <span class="flex items-center gap-1.5">
                    <span
                        class="size-2 animate-pulse rounded-full bg-emerald-500"
                    />
                    <span class="text-muted-foreground">Total Area:</span>
                    <span class="font-bold text-foreground">98.70 km²</span>
                </span>
                <span class="text-border">|</span>
                <span class="text-muted-foreground">PSGC:</span>
                <span class="font-bold text-foreground">070123000</span>
            </div>
        </div>

        <!-- Main Map and Control Grid -->
        <div class="grid gap-5 lg:grid-cols-12">
            <!-- Left: Primary OpenStreetMap Container (8 cols) -->
            <div class="space-y-3 lg:col-span-8">
                <Card class="overflow-hidden border-border/80 shadow-xs">
                    <CardHeader
                        class="border-b border-border/50 bg-muted/20 pb-3"
                    >
                        <div
                            class="flex flex-wrap items-start justify-between gap-2"
                        >
                            <div>
                                <CardTitle
                                    class="flex items-center gap-2 text-base font-bold"
                                >
                                    <Layers
                                        class="size-4 text-emerald-600 dark:text-emerald-400"
                                    />
                                    <span>Loon Municipal Boundary GIS Map</span>
                                </CardTitle>
                                <CardDescription class="text-xs">
                                    Click any barangay polygon on the map to
                                    inspect its official PSGC code, land area,
                                    and boundaries.
                                </CardDescription>
                            </div>
                            <Badge
                                variant="outline"
                                class="bg-background font-mono text-[11px]"
                            >
                                67 Barangays Loaded
                            </Badge>
                        </div>
                    </CardHeader>

                    <CardContent class="p-3">
                        <OpenStreetMap
                            ref="mapRef"
                            :latitude="targetLat"
                            :longitude="targetLng"
                            :zoom="targetZoom"
                            height="h-[480px] sm:h-[540px]"
                            :selectable="true"
                            :show-barangays="true"
                            :show-legend="true"
                            geo-json-url="/geojson/loon-barangays"
                            v-model:selected-latitude="selectedLat"
                            v-model:selected-longitude="selectedLng"
                            v-model:selected-barangay-psgc="activeBarangayPsgc"
                            caption="Municipality of Loon, Province of Bohol · OpenStreetMap & Official NAMRIA Boundaries"
                            @select-location="handleLocationSelected"
                            @select-barangay="handleBarangaySelected"
                        />
                    </CardContent>
                </Card>
            </div>

            <!-- Right: Barangay Inspector & Loon Strategic Areas (4 cols) -->
            <div class="space-y-4 lg:col-span-4">
                <!-- Selected Barangay Metadata Inspector Card -->
                <Card class="border-border/80 shadow-xs">
                    <CardHeader class="pb-3">
                        <div class="flex items-center justify-between">
                            <CardTitle
                                class="flex items-center gap-2 text-sm font-bold"
                            >
                                <Layers class="size-4 text-amber-500" />
                                <span>Barangay Inspector</span>
                            </CardTitle>
                            <Button
                                v-if="selectedBarangay"
                                type="button"
                                variant="ghost"
                                size="sm"
                                class="h-6 px-1.5 text-[10px] text-muted-foreground hover:text-red-500"
                                @click="clearBarangay"
                            >
                                <X class="mr-1 size-3" />
                                Clear
                            </Button>
                        </div>
                        <CardDescription class="text-xs">
                            Official boundaries and geographic data for the
                            selected barangay in Loon.
                        </CardDescription>
                    </CardHeader>
                    <CardContent class="space-y-3 text-xs">
                        <div
                            v-if="selectedBarangay"
                            class="space-y-2.5 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3.5"
                        >
                            <div class="flex items-center justify-between">
                                <div class="text-sm font-bold text-foreground">
                                    {{ selectedBarangay.name }}
                                </div>
                                <Badge
                                    variant="outline"
                                    class="border-amber-500/40 text-[10px] text-amber-700 dark:text-amber-300"
                                >
                                    Selected Barangay
                                </Badge>
                            </div>

                            <div
                                class="space-y-1.5 border-t border-amber-500/20 pt-1 font-mono text-[11px]"
                            >
                                <div class="flex justify-between">
                                    <span
                                        class="font-sans text-xs text-muted-foreground"
                                        >PSGC Code:</span
                                    >
                                    <span class="font-bold text-foreground">{{
                                        selectedBarangay.psgc_code
                                    }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span
                                        class="font-sans text-xs text-muted-foreground"
                                        >PCODE:</span
                                    >
                                    <span class="text-foreground">{{
                                        selectedBarangay.pcode
                                    }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span
                                        class="font-sans text-xs text-muted-foreground"
                                        >Land Area:</span
                                    >
                                    <span class="font-bold text-foreground"
                                        >{{
                                            selectedBarangay.area_sqkm
                                        }}
                                        km²</span
                                    >
                                </div>
                                <div class="flex justify-between">
                                    <span
                                        class="font-sans text-xs text-muted-foreground"
                                        >Province:</span
                                    >
                                    <span class="text-foreground"
                                        >Bohol (Region VII)</span
                                    >
                                </div>
                            </div>

                            <div
                                class="flex items-center justify-between border-t border-amber-500/20 pt-1 text-[11px] text-muted-foreground"
                            >
                                <span>Polygon boundary highlighted on map</span>
                                <Check class="size-3.5 text-amber-600" />
                            </div>
                        </div>

                        <div
                            v-else
                            class="space-y-1 rounded-lg border border-dashed border-border p-4 text-center text-muted-foreground"
                        >
                            <Layers
                                class="mx-auto size-5 text-muted-foreground/60"
                            />
                            <p class="font-medium">No barangay selected</p>
                            <p class="text-[11px]">
                                Click any barangay polygon on the map to inspect
                                details.
                            </p>
                        </div>

                        <!-- Clicked Point Coordinates Inspector -->
                        <div
                            v-if="selectedLat && selectedLng"
                            class="space-y-1.5 rounded-lg border border-red-500/30 bg-red-500/5 p-3"
                        >
                            <div class="flex items-center justify-between">
                                <span
                                    class="flex items-center gap-1.5 text-xs font-bold text-foreground"
                                >
                                    <MapPin class="size-3.5 text-red-500" />
                                    <span>Pin Point Coordinates</span>
                                </span>
                                <Badge
                                    variant="outline"
                                    class="border-red-500/40 text-[10px] text-red-600 dark:text-red-400"
                                    >Pinned</Badge
                                >
                            </div>
                            <div
                                class="font-mono text-[11px] font-bold text-foreground"
                            >
                                {{ selectedLat.toFixed(6) }}° N,
                                {{ selectedLng.toFixed(6) }}° E
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <!-- Loon Landmark Quick Nav Presets Card -->
                <Card class="border-border/80 shadow-xs">
                    <CardHeader class="pb-3">
                        <CardTitle
                            class="flex items-center gap-2 text-sm font-bold"
                        >
                            <Compass
                                class="size-4 text-emerald-600 dark:text-emerald-400"
                            />
                            <span>Loon Strategic Landmarks</span>
                        </CardTitle>
                        <CardDescription class="text-xs">
                            Pan the map to major strategic locations across
                            Loon.
                        </CardDescription>
                    </CardHeader>
                    <CardContent class="space-y-2">
                        <button
                            v-for="preset in loonPresets"
                            :key="preset.name"
                            type="button"
                            class="w-full rounded-lg border border-border/70 p-2.5 text-left transition-all hover:border-emerald-500/60 hover:bg-emerald-500/5 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                            @click="goToPreset(preset)"
                        >
                            <div
                                class="flex items-center justify-between gap-1"
                            >
                                <span
                                    class="text-xs font-bold text-foreground"
                                    >{{ preset.name }}</span
                                >
                                <Badge
                                    variant="outline"
                                    class="shrink-0 font-mono text-[10px]"
                                >
                                    {{ preset.barangay }}
                                </Badge>
                            </div>
                            <p
                                class="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground"
                            >
                                {{ preset.description }}
                            </p>
                            <div
                                class="mt-1 font-mono text-[10px] text-emerald-700 dark:text-emerald-300"
                            >
                                {{ preset.lat }}° N, {{ preset.lng }}° E
                            </div>
                        </button>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
</template>
