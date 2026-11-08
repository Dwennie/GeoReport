<script setup lang="ts">
import { computed } from 'vue';
import { Head, Link, usePage } from '@inertiajs/vue3';
import { AlertCircle, Check, ClipboardList, Inbox, Plus } from '@lucide/vue';
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
        initialComplaints?: ComplaintSummary[];
        communityMapPoints?: Array<{
            id: number;
            label: string;
            latitude: number;
            longitude: number;
            status: string;
            color?: string;
            barangay?: string;
        }>;
        userStats?: {
            total: number;
            pending: number;
            inProgress: number;
            resolved: number;
        };
    }>(),
    {
        initialComplaints: () => [],
        communityMapPoints: () => [],
        userStats: () => ({
            total: 0,
            pending: 0,
            inProgress: 0,
            resolved: 0,
        }),
    },
);

defineOptions({
    layout: {
        breadcrumbs: [{ title: 'Dashboard', href: '/citizen/dashboard' }],
    },
});

const page = usePage();
const userName = computed(
    () => (page.props.auth as any)?.user?.name ?? 'Citizen',
);
const firstName = computed(() => userName.value.split(' ')[0] || 'Citizen');

const recentReports = computed(() => props.initialComplaints.slice(0, 4));

const liveMarkers = computed<MapMarker[]>(() => {
    const source =
        props.communityMapPoints.length > 0
            ? props.communityMapPoints
            : props.initialComplaints.map((complaint) => ({
                  id: complaint.id,
                  label: `${complaint.reference} — ${complaint.title}`,
                  latitude: complaint.latitude,
                  longitude: complaint.longitude,
                  color: complaint.category?.color ?? '#10B981',
                  barangay: complaint.barangay,
              }));

    return source
        .filter((item) => item.latitude && item.longitude)
        .map((item) => ({
            id: item.id,
            latitude: item.latitude,
            longitude: item.longitude,
            title: item.label,
            description: item.barangay || 'Loon, Bohol',
            color: item.color ?? '#10B981',
        }));
});
</script>

<template>
    <Head title="Citizen Dashboard" />

    <div class="flex h-full flex-1 flex-col gap-4 p-4">
        <PageHeader
            eyebrow="Community"
            :title="`Welcome back, ${firstName}`"
            description="Track the concerns you reported and monitor service progress across your barangay."
        >
            <template #actions>
                <Button as-child>
                    <Link href="/citizen/complaints/create">
                        <Plus class="size-4" />
                        Report a concern
                    </Link>
                </Button>
            </template>
        </PageHeader>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
                label="Your reports"
                :value="formatNumber(userStats.total)"
                hint="Submitted from this account"
                :icon="Inbox"
            />
            <StatCard
                label="Awaiting review"
                :value="formatNumber(userStats.pending)"
                hint="Not yet assigned to staff"
                :icon="AlertCircle"
                :accent="
                    userStats.pending > 0
                        ? 'text-amber-600 dark:text-amber-400'
                        : undefined
                "
            />
            <StatCard
                label="In progress"
                :value="formatNumber(userStats.inProgress)"
                hint="Assigned or under investigation"
                :icon="ClipboardList"
            />
            <StatCard
                label="Resolved"
                :value="formatNumber(userStats.resolved)"
                hint="Closed with evidence on file"
                :icon="Check"
            />
        </div>

        <div class="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
            <Card class="gap-3">
                <CardHeader>
                    <CardTitle>Your recent reports</CardTitle>
                    <CardDescription>
                        The most recent concerns you submitted.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ComplaintTable
                        :complaints="recentReports"
                        link-prefix="/citizen/complaints"
                        empty-title="No reports filed yet"
                        empty-description="Have an infrastructure, sanitation, or safety concern in Loon? Click 'Report a concern' to submit your first report."
                    />
                    <div class="mt-4" v-if="recentReports.length > 0">
                        <Button variant="outline" size="sm" as-child>
                            <Link href="/citizen/complaints">
                                View all reports
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card class="gap-3">
                <CardHeader>
                    <CardTitle>Latest activity</CardTitle>
                    <CardDescription>
                        Updates on the reports you filed.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div
                        v-if="recentReports.length === 0"
                        class="flex flex-col items-center justify-center py-8 text-center text-sm text-muted-foreground"
                    >
                        <Inbox class="mb-2 size-8 opacity-40" />
                        <p class="font-medium text-foreground">
                            No recent activity yet
                        </p>
                        <p class="text-xs">
                            Timeline updates will appear here once you file a
                            complaint.
                        </p>
                    </div>
                    <ol v-else class="space-y-4">
                        <li
                            v-for="entry in recentReports"
                            :key="entry.id"
                            class="flex gap-3"
                        >
                            <span
                                class="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground/40"
                            />
                            <div class="min-w-0 space-y-0.5">
                                <p class="text-sm leading-snug">
                                    Report submitted
                                </p>
                                <p
                                    class="truncate text-xs text-muted-foreground"
                                >
                                    {{ entry.reference }} · {{ entry.title }}
                                </p>
                                <p class="text-xs text-muted-foreground">
                                    {{ formatRelative(entry.createdAt) }}
                                </p>
                            </div>
                        </li>
                    </ol>
                </CardContent>
            </Card>
        </div>

        <Card class="gap-3">
            <CardHeader>
                <CardTitle>Approved reports near you</CardTitle>
                <CardDescription>
                    Concerns approved for action and visible on the community
                    map.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <OpenStreetMap
                    :latitude="9.8"
                    :longitude="123.8"
                    :zoom="13"
                    height="h-[300px] sm:h-[360px]"
                    :markers="liveMarkers"
                    :selectable="false"
                    :show-barangays="false"
                    :show-legend="false"
                    :show-coordinates-badge="false"
                    caption="Approved public concerns across Loon, Bohol · OpenStreetMap"
                />
                <div class="mt-4">
                    <Button variant="outline" size="sm" as-child>
                        <Link href="/citizen/map">Open the community map</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    </div>
</template>
