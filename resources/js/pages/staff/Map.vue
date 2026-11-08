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
import { complaintStatusMeta, complaintStatuses } from '@/lib/statusMeta';

type MapPointItem = {
    id: number;
    reference?: string;
    title?: string;
    label: string;
    latitude: number;
    longitude: number;
    status: string;
    color?: string;
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
            { title: 'Dashboard', href: '/staff/dashboard' },
            { title: 'Field map', href: '/staff/map' },
        ],
    },
});

const status = ref('all');

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
            status.value === 'all' || complaint.status === status.value,
    ),
);

const liveMarkers = computed<MapMarker[]>(() =>
    visible.value.map((complaint) => ({
        id: complaint.id,
        latitude: complaint.latitude,
        longitude: complaint.longitude,
        title: complaint.label,
        description: complaint.address || complaint.barangay || 'Loon, Bohol',
        color: complaint.color ?? '#0284C7',
    })),
);
</script>

<template>
    <Head title="Field map" />

    <div class="flex h-full flex-1 flex-col gap-4 p-4">
        <PageHeader
            eyebrow="Field operations"
            title="Field map"
            description="Your assigned work orders plotted on OpenStreetMap for route planning across Loon, Bohol."
        />

        <div
            class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
        >
            <FilterSelect
                v-model="status"
                :options="statusOptions"
                aria-label="Filter by status"
            />
            <p class="text-xs text-muted-foreground">
                Showing {{ visible.length }} of
                {{ mapPointsList.length }} assignments
            </p>
        </div>

        <div class="grid gap-4 lg:grid-cols-[1.75fr_1fr]">
            <Card class="gap-3">
                <CardHeader>
                    <CardTitle>Assignment pins</CardTitle>
                    <CardDescription>
                        Interactive OpenStreetMap view of reports assigned to
                        you.
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
                        caption="Municipality of Loon, Bohol · Field Operations OpenStreetMap"
                    />
                </CardContent>
            </Card>

            <Card class="gap-3">
                <CardHeader>
                    <CardTitle>Visit list</CardTitle>
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
                                :href="`/staff/complaints/${complaint.id}`"
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
                                    {{
                                        complaint.address ||
                                        complaint.barangay ||
                                        'Loon, Bohol'
                                    }}
                                </p>
                            </Link>
                        </li>
                    </ul>
                    <p
                        v-else
                        class="py-8 text-center text-sm text-muted-foreground"
                    >
                        No field assignments found for this filter.
                    </p>
                </CardContent>
            </Card>
        </div>
    </div>
</template>
