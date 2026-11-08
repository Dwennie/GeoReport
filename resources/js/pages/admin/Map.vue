<script setup lang="ts">
import { computed, ref } from 'vue';
import { Head, Link } from '@inertiajs/vue3';
import { MapPin } from '@lucide/vue';
import OpenStreetMap from '@/components/OpenStreetMap.vue';
import type { MapMarker } from '@/components/OpenStreetMap.vue';
import { FilterSelect, PageHeader, StatusBadge } from '@/components/geo';
import type { FilterOption } from '@/components/geo';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { formatRelative } from '@/lib/format';
import { complaintStatusMeta, complaintStatuses } from '@/lib/statusMeta';
import { useTaxonomy } from '@/lib/taxonomy';

type ReportPoint = {
    id: number;
    reference: string;
    title: string;
    label: string;
    latitude: number;
    longitude: number;
    status: string;
    color?: string;
    categoryId?: number;
    barangay?: string;
    address?: string;
    submittedAt?: string;
};

const props = withDefaults(
    defineProps<{
        mapPointsList?: ReportPoint[];
    }>(),
    {
        mapPointsList: () => [],
    },
);

defineOptions({
    layout: {
        breadcrumbs: [
            { title: 'Dashboard', href: '/admin/dashboard' },
            { title: 'GIS map', href: '/admin/map' },
        ],
    },
});

const { categories: liveCategories } = useTaxonomy();
const category = ref('all');
const status = ref('all');

const categoryOptions = computed<FilterOption[]>(() => [
    { value: 'all', label: 'All categories' },
    ...liveCategories.value.map((item) => ({
        value: String(item.id),
        label: item.name,
    })),
]);

const statusOptions: FilterOption[] = [
    { value: 'all', label: 'All statuses' },
    ...complaintStatuses.map((value) => ({
        value,
        label: complaintStatusMeta[value].label,
    })),
];

const visible = computed(() =>
    props.mapPointsList.filter(
        (complaint) =>
            (category.value === 'all' ||
                (complaint.categoryId &&
                    String(complaint.categoryId) === category.value)) &&
            (status.value === 'all' || complaint.status === status.value),
    ),
);

const liveMarkers = computed<MapMarker[]>(() =>
    visible.value.map((p) => ({
        id: p.id,
        latitude: p.latitude,
        longitude: p.longitude,
        title: p.label,
        color: p.color ?? '#DC2626',
    })),
);
</script>

<template>
    <Head title="GIS map" />

    <div class="flex h-full flex-1 flex-col gap-4 p-4">
        <PageHeader
            eyebrow="Administration"
            title="GIS map"
            description="Interactive municipal GIS registry map across Loon, Bohol powered by OpenStreetMap and Leaflet."
        />

        <div
            class="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2.5 text-xs text-emerald-800 shadow-xs dark:text-emerald-300"
        >
            <div class="flex items-center gap-2">
                <span
                    class="size-2 animate-pulse rounded-full bg-emerald-500"
                />
                <span class="font-bold"
                    >Live OpenStreetMap GIS Engine Active</span
                >
                <span class="text-emerald-600 dark:text-emerald-400"
                    >• Centered on the Municipality of Loon, Province of Bohol
                    (9.80° N, 123.80° E).</span
                >
            </div>
            <span
                class="hidden font-mono text-[11px] text-emerald-700 sm:inline dark:text-emerald-300"
                >OSM Standard Tiles · EPSG:3857</span
            >
        </div>

        <div
            class="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between"
        >
            <div class="grid grid-cols-2 gap-2 lg:flex">
                <FilterSelect
                    v-model="category"
                    :options="categoryOptions"
                    aria-label="Filter by category"
                />
                <FilterSelect
                    v-model="status"
                    :options="statusOptions"
                    aria-label="Filter by status"
                />
            </div>
            <p class="text-xs text-muted-foreground">
                Showing {{ visible.length }} of
                {{ mapPointsList.length }} reports
            </p>
        </div>

        <div class="grid gap-4 lg:grid-cols-[1.8fr_1fr]">
            <Card class="gap-3">
                <CardHeader>
                    <CardTitle>Loon Municipal GIS</CardTitle>
                    <CardDescription>
                        Standard OpenStreetMap tile layer with zoom controls,
                        coordinate inspector, and click-to-pin.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <OpenStreetMap
                        :latitude="9.8"
                        :longitude="123.8"
                        :zoom="13"
                        height="h-[460px]"
                        :markers="liveMarkers"
                        :selectable="true"
                        :show-barangays="true"
                        :show-legend="true"
                        caption="Municipality of Loon, Bohol GIS · Powered by OpenStreetMap and Leaflet"
                    />
                </CardContent>
            </Card>

            <Card class="gap-3">
                <CardHeader>
                    <CardTitle>Registry list</CardTitle>
                    <CardDescription>Newest first.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ul
                        v-if="visible.length"
                        class="max-h-[460px] divide-y overflow-y-auto pr-1"
                    >
                        <li
                            v-for="complaint in visible"
                            :key="complaint.id"
                            class="py-3 first:pt-0"
                        >
                            <Link
                                :href="`/admin/complaints/${complaint.id}`"
                                class="block space-y-1.5"
                            >
                                <div
                                    class="flex items-center justify-between gap-2"
                                >
                                    <span
                                        class="font-mono text-xs text-muted-foreground"
                                    >
                                        {{ complaint.reference }}
                                    </span>
                                    <StatusBadge
                                        :status="complaint.status as any"
                                        :dot="false"
                                    />
                                </div>
                                <p class="text-sm leading-snug font-medium">
                                    {{ complaint.title }}
                                </p>
                                <p
                                    class="flex items-center gap-1.5 text-xs text-muted-foreground"
                                >
                                    <MapPin class="size-3" />
                                    {{
                                        complaint.address ||
                                        complaint.barangay ||
                                        'Loon, Bohol'
                                    }}
                                    <template v-if="complaint.submittedAt">
                                        ·
                                        {{
                                            formatRelative(
                                                complaint.submittedAt,
                                            )
                                        }}
                                    </template>
                                </p>
                            </Link>
                        </li>
                    </ul>
                    <p
                        v-else
                        class="py-8 text-center text-sm text-muted-foreground"
                    >
                        No reports match these filters.
                    </p>
                </CardContent>
            </Card>
        </div>
    </div>
</template>
