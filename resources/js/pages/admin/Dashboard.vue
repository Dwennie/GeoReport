<script setup lang="ts">
import { computed } from 'vue';
import { Head, Link } from '@inertiajs/vue3';
import {
    AlertCircle,
    BarChart3,
    Clock,
    FileText,
    FolderArchive,
    ShieldCheck,
    Wrench,
} from '@lucide/vue';
import OpenStreetMap from '@/components/OpenStreetMap.vue';
import type { MapMarker } from '@/components/OpenStreetMap.vue';
import { ComplaintTable, PageHeader, StatCard } from '@/components/geo';
import { Badge } from '@/components/ui/badge';
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
        allComplaintsList?: ComplaintSummary[];
        reviewQueueList?: ComplaintSummary[];
        totals?: {
            total: number;
            pending: number;
            assigned: number;
            inProgress: number;
            resolved: number;
            resolutionRate: number;
            avgResolutionDays: number;
        };
        categoriesBreakdown?: Array<{ label: string; value: number }>;
        monthlyTrend?: Array<{
            label: string;
            submitted: number;
            resolved: number;
        }>;
    }>(),
    {
        allComplaintsList: () => [],
        reviewQueueList: () => [],
        totals: () => ({
            total: 0,
            pending: 0,
            assigned: 0,
            inProgress: 0,
            resolved: 0,
            resolutionRate: 0,
            avgResolutionDays: 0,
        }),
        categoriesBreakdown: () => [],
        monthlyTrend: () => [],
    },
);

defineOptions({
    layout: {
        breadcrumbs: [{ title: 'Dashboard', href: '/admin/dashboard' }],
    },
});

const reviewQueue = computed(() => props.reviewQueueList.slice(0, 4));

const recentActivity = computed(() => props.allComplaintsList.slice(0, 5));

const liveMarkers = computed<MapMarker[]>(() =>
    props.allComplaintsList
        .filter((complaint) => complaint.latitude && complaint.longitude)
        .map((complaint) => ({
            id: complaint.id,
            latitude: complaint.latitude,
            longitude: complaint.longitude,
            title: `${complaint.reference} — ${complaint.title}`,
            description: `${complaint.barangay} · ${complaint.status.replace('_', ' ')}`,
            color: complaint.category?.color ?? '#0284C7',
        })),
);

/** Highest submitted count in the trend, used to scale the bar chart. */
const peakTrend = computed(() =>
    Math.max(
        ...props.monthlyTrend.map((point) =>
            Math.max(point.submitted, point.resolved),
        ),
        1,
    ),
);

const topCategories = computed(() => props.categoriesBreakdown.slice(0, 5));

const peakCategory = computed(() =>
    Math.max(...props.categoriesBreakdown.map((entry) => entry.value), 1),
);
</script>

<template>
    <Head title="Admin Dashboard" />

    <div class="flex h-full flex-1 flex-col gap-4 p-4">
        <PageHeader
            eyebrow="Administration"
            title="Municipality Overview"
            description="Complaint volume and service resolution across all 67 barangays of Loon, Bohol."
        >
            <template #actions>
                <Button variant="outline" as-child>
                    <Link href="/admin/complaints">
                        <FileText class="size-4" />
                        All reports
                    </Link>
                </Button>
            </template>
        </PageHeader>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
                label="Total reports"
                :value="formatNumber(totals.total)"
                hint="All time, all barangays"
                :icon="FileText"
            />
            <StatCard
                label="Awaiting review"
                :value="formatNumber(totals.pending)"
                hint="Needs triage decision"
                :icon="AlertCircle"
                :accent="
                    totals.pending > 0
                        ? 'text-amber-600 dark:text-amber-400'
                        : undefined
                "
            />
            <StatCard
                label="In the field"
                :value="formatNumber(totals.assigned + totals.inProgress)"
                hint="Assigned or under investigation"
                :icon="Wrench"
            />
            <StatCard
                label="Resolution rate"
                :value="`${totals.resolutionRate}%`"
                :hint="
                    totals.total > 0
                        ? `${totals.resolved} resolved cases`
                        : 'No cases closed yet'
                "
                :icon="ShieldCheck"
            />
        </div>

        <div class="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
            <div class="min-w-0 space-y-4">
                <Card class="gap-3">
                    <CardHeader>
                        <CardTitle>Review queue</CardTitle>
                        <CardDescription>
                            New reports waiting for an approve or reject
                            decision.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ComplaintTable
                            :complaints="reviewQueue"
                            link-prefix="/admin/complaints"
                            empty-title="Review queue is clear"
                            empty-description="New citizen reports land here for triage and assignment."
                        />
                        <div class="mt-4" v-if="reviewQueue.length > 0">
                            <Button
                                variant="outline"
                                size="sm"
                                class="w-full sm:w-auto"
                                as-child
                            >
                                <Link href="/admin/complaints?status=pending">
                                    Open the full queue
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card class="gap-3">
                    <CardHeader>
                        <CardTitle>Reports per month</CardTitle>
                        <CardDescription>
                            Submissions against resolutions.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div
                            v-if="totals.total === 0"
                            class="flex flex-col items-center justify-center py-12 text-center text-sm text-muted-foreground"
                        >
                            <BarChart3 class="mb-2 size-8 opacity-40" />
                            <p class="font-medium text-foreground">
                                No monthly report data yet
                            </p>
                            <p class="text-xs">
                                Trends will display here as complaints are
                                received and resolved.
                            </p>
                        </div>
                        <div v-else>
                            <div class="flex h-40 items-end gap-2">
                                <div
                                    v-for="point in monthlyTrend"
                                    :key="point.label"
                                    class="flex flex-1 flex-col items-center gap-1"
                                >
                                    <div
                                        class="flex h-32 w-full items-end justify-center gap-0.5"
                                    >
                                        <div
                                            class="w-1/2 rounded-t-sm bg-primary/70"
                                            :style="{
                                                height: `${Math.round((point.submitted / peakTrend) * 100)}%`,
                                            }"
                                            :title="`${point.submitted} submitted`"
                                        />
                                        <div
                                            class="w-1/2 rounded-t-sm bg-emerald-500/70"
                                            :style="{
                                                height: `${Math.round((point.resolved / peakTrend) * 100)}%`,
                                            }"
                                            :title="`${point.resolved} resolved`"
                                        />
                                    </div>
                                    <span
                                        class="text-[10px] text-muted-foreground tabular-nums"
                                    >
                                        {{ point.label }}
                                    </span>
                                </div>
                            </div>
                            <div
                                class="mt-3 flex items-center gap-4 text-xs text-muted-foreground"
                            >
                                <span class="flex items-center gap-1.5">
                                    <span
                                        class="size-2.5 rounded-full bg-primary/70"
                                    />
                                    Submitted
                                </span>
                                <span class="flex items-center gap-1.5">
                                    <span
                                        class="size-2.5 rounded-full bg-emerald-500/70"
                                    />
                                    Resolved
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div class="min-w-0 space-y-4">
                <Card class="gap-3">
                    <CardHeader>
                        <CardTitle>Latest activity</CardTitle>
                        <CardDescription
                            >Municipality-wide, newest first.</CardDescription
                        >
                    </CardHeader>
                    <CardContent>
                        <div
                            v-if="recentActivity.length === 0"
                            class="flex flex-col items-center justify-center py-8 text-center text-sm text-muted-foreground"
                        >
                            <Clock class="mb-2 size-8 opacity-40" />
                            <p class="font-medium text-foreground">
                                No recent activity recorded
                            </p>
                            <p class="text-xs">
                                Citizen report submissions and updates will
                                appear here.
                            </p>
                        </div>
                        <ol v-else class="space-y-4">
                            <li
                                v-for="entry in recentActivity"
                                :key="entry.id"
                                class="flex gap-3"
                            >
                                <span
                                    class="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground/40"
                                />
                                <div class="min-w-0 space-y-0.5">
                                    <p class="text-sm leading-snug">
                                        <span class="font-medium">
                                            {{ entry.barangay }}
                                        </span>
                                        · {{ entry.status }}
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
                        <CardTitle>Categories breakdown</CardTitle>
                    </CardHeader>
                    <CardContent class="space-y-3">
                        <div
                            v-if="topCategories.length === 0"
                            class="flex flex-col items-center justify-center py-6 text-center text-sm text-muted-foreground"
                        >
                            <FolderArchive class="mb-2 size-8 opacity-40" />
                            <p class="font-medium text-foreground">
                                No categorized reports
                            </p>
                            <p class="text-xs">
                                Categories will populate as reports are filed.
                            </p>
                        </div>
                        <template v-else>
                            <div
                                v-for="entry in topCategories"
                                :key="entry.label"
                                class="space-y-1"
                            >
                                <div
                                    class="flex items-center justify-between text-sm"
                                >
                                    <span>{{ entry.label }}</span>
                                    <span
                                        class="text-muted-foreground tabular-nums"
                                    >
                                        {{ formatNumber(entry.value) }}
                                    </span>
                                </div>
                                <div
                                    class="h-1.5 overflow-hidden rounded-full bg-muted"
                                >
                                    <div
                                        class="h-full rounded-full bg-primary"
                                        :style="{
                                            width: `${totals.total > 0 ? Math.round((entry.value / peakCategory) * 100) : 0}%`,
                                        }"
                                    />
                                </div>
                            </div>
                            <Badge variant="outline" class="mt-1">
                                <Link href="/admin/analytics"
                                    >Full analytics</Link
                                >
                            </Badge>
                        </template>
                    </CardContent>
                </Card>

                <Card class="gap-3">
                    <CardHeader>
                        <CardTitle>GIS overview map</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <OpenStreetMap
                            :latitude="9.8"
                            :longitude="123.8"
                            :zoom="12"
                            height="h-[240px]"
                            :markers="liveMarkers"
                            :selectable="false"
                            :show-barangays="true"
                            :show-legend="false"
                            :show-coordinates-badge="false"
                            caption="All reports across Loon, Bohol with barangay boundaries."
                        />
                        <div class="mt-4">
                            <Button variant="outline" size="sm" as-child>
                                <Link href="/admin/map">Open GIS map</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
</template>
