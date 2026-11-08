<script setup lang="ts">
import { computed } from 'vue';
import { Head, Link, usePage } from '@inertiajs/vue3';
import { Check, ClipboardList, Inbox, Map } from '@lucide/vue';
import OpenStreetMap from '@/components/OpenStreetMap.vue';
import type { MapMarker } from '@/components/OpenStreetMap.vue';
import { ComplaintTable, PageHeader, StatCard } from '@/components/geo';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { formatNumber, formatRelative } from '@/lib/format';
import type { ComplaintSummary } from '@/types/geo';

const props = withDefaults(
    defineProps<{
        assignedComplaintsList?: ComplaintSummary[];
        staffStats?: {
            total: number;
            newAssignments: number;
            inProgress: number;
            resolved: number;
            urgent: number;
        };
    }>(),
    {
        assignedComplaintsList: () => [],
        staffStats: () => ({
            total: 0,
            newAssignments: 0,
            inProgress: 0,
            resolved: 0,
            urgent: 0,
        }),
    },
);

defineOptions({
    layout: {
        breadcrumbs: [{ title: 'Dashboard', href: '/staff/dashboard' }],
    },
});

const page = usePage();
const userName = computed(
    () => (page.props.auth as any)?.user?.name ?? 'Staff Officer',
);
const firstName = computed(
    () => userName.value.split(' ')[0] || 'Staff Officer',
);

const newAssignments = computed(() =>
    props.assignedComplaintsList.filter(
        (complaint) => complaint.status === 'assigned',
    ),
);

const recent = computed(() => props.assignedComplaintsList.slice(0, 4));

const liveMarkers = computed<MapMarker[]>(() =>
    props.assignedComplaintsList
        .filter((complaint) => complaint.latitude && complaint.longitude)
        .map((complaint) => ({
            id: complaint.id,
            latitude: complaint.latitude,
            longitude: complaint.longitude,
            title: `${complaint.reference} — ${complaint.title}`,
            description:
                complaint.address || complaint.barangay || 'Loon, Bohol',
            color: complaint.category?.color ?? '#0284C7',
        })),
);
</script>

<template>
    <Head title="Staff Dashboard" />

    <div class="flex h-full flex-1 flex-col gap-4 p-4">
        <PageHeader
            eyebrow="Field Operations"
            :title="`Good to see you, ${firstName}`"
            :description="`Municipal Engineering & Response · ${formatNumber(staffStats.total)} reports currently assigned to you.`"
        >
            <template #actions>
                <Button variant="outline" as-child>
                    <Link href="/staff/complaints">
                        <ClipboardList class="size-4" />
                        Open work queue
                    </Link>
                </Button>
            </template>
        </PageHeader>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
                label="New assignments"
                :value="formatNumber(staffStats.newAssignments)"
                hint="Waiting to be picked up"
                :icon="Inbox"
                :accent="
                    staffStats.newAssignments > 0
                        ? 'text-amber-600 dark:text-amber-400'
                        : undefined
                "
            />
            <StatCard
                label="Under investigation"
                :value="formatNumber(staffStats.inProgress)"
                hint="Site visits and verification"
                :icon="ClipboardList"
            />
            <StatCard
                label="Resolved"
                :value="formatNumber(staffStats.resolved)"
                hint="Completed with evidence"
                :icon="Check"
            />
            <StatCard
                label="Total assigned"
                :value="formatNumber(staffStats.total)"
                hint="Across all statuses"
                :icon="Map"
            />
        </div>

        <div class="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
            <div class="space-y-4">
                <Card v-if="newAssignments.length" class="gap-3">
                    <CardHeader>
                        <CardTitle>Pick up next</CardTitle>
                        <CardDescription>
                            Newest assignments that have not been started.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ComplaintTable
                            :complaints="newAssignments"
                            link-prefix="/staff/complaints"
                        />
                    </CardContent>
                </Card>

                <Card class="gap-3">
                    <CardHeader>
                        <CardTitle>Your work queue</CardTitle>
                        <CardDescription>
                            The most recent reports assigned to you.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ComplaintTable
                            :complaints="recent"
                            link-prefix="/staff/complaints"
                            empty-title="Work queue is clear"
                            empty-description="You have no pending assignments right now. New tasks assigned by administration will appear here."
                        />
                        <div class="mt-4" v-if="recent.length > 0">
                            <Button variant="outline" size="sm" as-child>
                                <Link href="/staff/complaints">
                                    View all assignments
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div class="space-y-4">
                <Card class="gap-3">
                    <CardHeader>
                        <CardTitle>Recent activity</CardTitle>
                        <CardDescription>
                            Latest movements on your cases.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div
                            v-if="recent.length === 0"
                            class="flex flex-col items-center justify-center py-8 text-center text-sm text-muted-foreground"
                        >
                            <ClipboardList class="mb-2 size-8 opacity-40" />
                            <p class="font-medium text-foreground">
                                No recent case movements
                            </p>
                            <p class="text-xs">
                                Investigation updates and assigned reports will
                                appear here.
                            </p>
                        </div>
                        <ol v-else class="space-y-4">
                            <li
                                v-for="entry in recent"
                                :key="entry.id"
                                class="flex gap-3"
                            >
                                <span
                                    class="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground/40"
                                />
                                <div class="min-w-0 space-y-0.5">
                                    <p class="text-sm leading-snug">
                                        Case assigned
                                    </p>
                                    <p
                                        class="truncate text-xs text-muted-foreground"
                                    >
                                        {{ entry.reference }} ·
                                        {{ entry.title }}
                                    </p>
                                    <p class="text-xs text-muted-foreground">
                                        {{ formatRelative(entry.createdAt) }}
                                    </p>
                                </div>
                            </li>
                        </ol>
                    </CardContent>
                </Card>

                <Card class="gap-3">
                    <CardHeader>
                        <CardTitle>Where the work is</CardTitle>
                        <CardDescription>
                            Your assignments plotted for route planning.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <OpenStreetMap
                            :latitude="9.8"
                            :longitude="123.8"
                            :zoom="12"
                            height="h-[260px]"
                            :markers="liveMarkers"
                            :selectable="false"
                            :show-barangays="false"
                            :show-legend="false"
                            :show-coordinates-badge="false"
                            caption="Field assignments plotted across Loon, Bohol."
                        />
                        <div class="mt-4">
                            <Button variant="outline" size="sm" as-child>
                                <Link href="/staff/map">Open field map</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
</template>
