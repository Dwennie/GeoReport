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
import { useTaxonomy } from '@/lib/taxonomy';

type MapPointItem = {
    id: number;
    reference?: string;
    title?: string;
    label: string;
    latitude: number;
    longitude: number;
    status: string;
    color?: string;
    categoryId?: number;
    barangay?: string;
    address?: string;
};

const props = withDefaults(
    defineProps<{
        mapPointsList?: MapPointItem[];
    }>(),
    {
        mapPointsList: () => [],
    },
);

defineOptions({
    layout: {
        breadcrumbs: [
            { title: 'Dashboard', href: '/citizen/dashboard' },
            { title: 'Community map', href: '/citizen/map' },
        ],
    },
});

const { categories: liveCategories } = useTaxonomy();
const category = ref('all');

const categoryOptions = computed<FilterOption[]>(() => [
    { value: 'all', label: 'All categories' },
    ...liveCategories.value.map((item) => ({
        value: String(item.id),
        label: item.name,
    })),
]);

const visible = computed(() =>
    props.mapPointsList.filter(
        (complaint) =>
            category.value === 'all' ||
            (complaint.categoryId &&
                String(complaint.categoryId) === category.value),
    ),
);

const liveMarkers = computed<MapMarker[]>(() =>
    visible.value.map((complaint) => ({
        id: complaint.id,
        latitude: complaint.latitude,
        longitude: complaint.longitude,
        title: complaint.label,
        description: complaint.address || complaint.barangay || 'Loon, Bohol',
        color: complaint.color ?? '#10B981',
    })),
);
</script>

<template>
    <Head title="Community map" />

    <div class="flex h-full flex-1 flex-col gap-4 p-4">
        <PageHeader
            eyebrow="Community"
            title="Community map"
            description="Approved reports plotted across the Municipality of Loon, Bohol."
        />

        <div
            class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
        >
            <FilterSelect
                v-model="category"
                :options="categoryOptions"
                aria-label="Filter by category"
            />
            <p class="text-xs text-muted-foreground">
                Showing {{ visible.length }} of
                {{ mapPointsList.length }} approved reports
            </p>
        </div>

        <div class="grid gap-4 lg:grid-cols-[1.75fr_1fr]">
            <Card class="gap-3">
                <CardHeader>
                    <CardTitle>Approved reports</CardTitle>
                    <CardDescription>
                        Interactive OpenStreetMap view of public concerns
                        approved for action across Loon, Bohol.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <OpenStreetMap
                        :latitude="9.8"
                        :longitude="123.8"
                        :zoom="13"
                        height="h-[460px]"
                        :markers="liveMarkers"
                        :selectable="false"
                        :show-barangays="false"
                        :show-legend="false"
                        caption="Municipality of Loon, Bohol · Community OpenStreetMap"
                    />
                </CardContent>
            </Card>

            <Card class="gap-3">
                <CardHeader>
                    <CardTitle>Report list</CardTitle>
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
                                :href="`/citizen/complaints/${complaint.id}`"
                                class="block space-y-1.5"
                            >
                                <div
                                    class="flex items-center justify-between gap-2"
                                >
                                    <span
                                        class="font-mono text-xs text-muted-foreground"
                                    >
                                        {{
                                            complaint.reference ??
                                            `#${complaint.id}`
                                        }}
                                    </span>
                                    <StatusBadge
                                        :status="complaint.status as any"
                                        :dot="false"
                                    />
                                </div>
                                <p class="text-sm leading-snug font-medium">
                                    {{ complaint.title ?? complaint.label }}
                                </p>
                                <p
                                    class="flex items-center gap-1.5 text-xs text-muted-foreground"
                                >
                                    <MapPin class="size-3" />
                                    {{ complaint.barangay || 'Loon, Bohol' }}
                                </p>
                            </Link>
                        </li>
                    </ul>
                    <p
                        v-else
                        class="py-8 text-center text-sm text-muted-foreground"
                    >
                        No public reports recorded yet.
                    </p>
                </CardContent>
            </Card>
        </div>
    </div>
</template>
