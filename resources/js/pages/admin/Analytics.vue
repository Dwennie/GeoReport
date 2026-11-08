<script setup lang="ts">
import { computed } from 'vue';
import { Head } from '@inertiajs/vue3';
import {
    AlertCircle,
    BarChart3,
    FileText,
    ShieldCheck,
    TrendingUp,
} from '@lucide/vue';
import { PageHeader, StatCard } from '@/components/geo';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { formatNumber } from '@/lib/format';

type StatPoint = { label: string; value: number };
type TrendPoint = { label: string; submitted: number; resolved: number };

const props = withDefaults(
    defineProps<{
        totals?: {
            total: number;
            pending: number;
            assigned: number;
            inProgress: number;
            resolved: number;
            resolutionRate: number;
            avgResolutionDays: number;
        };
        analyticsData?: {
            monthlyTrend: TrendPoint[];
            byCategory: StatPoint[];
            byBarangay: StatPoint[];
            byPriority: StatPoint[];
        };
    }>(),
    {
        totals: () => ({
            total: 0,
            pending: 0,
            assigned: 0,
            inProgress: 0,
            resolved: 0,
            resolutionRate: 0,
            avgResolutionDays: 0,
        }),
        analyticsData: () => ({
            monthlyTrend: [],
            byCategory: [],
            byBarangay: [],
            byPriority: [],
        }),
    },
);

defineOptions({
    layout: {
        breadcrumbs: [
            { title: 'Dashboard', href: '/admin/dashboard' },
            { title: 'Analytics', href: '/admin/analytics' },
        ],
    },
});

const peakTrend = computed(() =>
    Math.max(
        ...props.analyticsData.monthlyTrend.map((point) =>
            Math.max(point.submitted, point.resolved),
        ),
        1,
    ),
);

const peakCategory = computed(() =>
    Math.max(...props.analyticsData.byCategory.map((entry) => entry.value), 1),
);

const peakBarangay = computed(() =>
    Math.max(...props.analyticsData.byBarangay.map((entry) => entry.value), 1),
);

const peakPriority = computed(() =>
    Math.max(...props.analyticsData.byPriority.map((entry) => entry.value), 1),
);
</script>

<template>
    <Head title="Analytics" />

    <div class="flex h-full flex-1 flex-col gap-4 p-4">
        <PageHeader
            eyebrow="Administration"
            title="Analytics"
            description="Historical complaint metrics across the Municipality of Loon, Bohol, broken down by category, barangay and priority."
        />

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
                label="Total reports"
                :value="formatNumber(totals.total)"
                hint="All time recorded"
                :icon="FileText"
            />
            <StatCard
                label="Awaiting review"
                :value="formatNumber(totals.pending)"
                hint="Pending triage"
                :icon="AlertCircle"
                :accent="
                    totals.pending > 0
                        ? 'text-amber-600 dark:text-amber-400'
                        : undefined
                "
            />
            <StatCard
                label="Resolution rate"
                :value="`${totals.resolutionRate}%`"
                :hint="`${formatNumber(totals.resolved)} reports resolved`"
                :icon="ShieldCheck"
            />
            <StatCard
                label="Avg. resolution time"
                :value="`${totals.avgResolutionDays} days`"
                hint="Submission to closure"
                :icon="TrendingUp"
            />
        </div>

        <Card class="gap-3">
            <CardHeader>
                <CardTitle>Monthly volume</CardTitle>
                <CardDescription>
                    Submissions against resolutions over the past 12 months.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div
                    v-if="totals.total === 0"
                    class="flex flex-col items-center justify-center py-12 text-center text-sm text-muted-foreground"
                >
                    <BarChart3 class="mb-2 size-8 opacity-40" />
                    <p class="font-medium text-foreground">
                        No monthly volume data recorded yet
                    </p>
                    <p class="text-xs">
                        Bar graphs will plot as complaints are logged and
                        resolved.
                    </p>
                </div>
                <div v-else>
                    <div class="flex h-56 items-end gap-1.5 sm:gap-2">
                        <div
                            v-for="point in analyticsData.monthlyTrend"
                            :key="point.label"
                            class="flex flex-1 flex-col items-center gap-1"
                        >
                            <div
                                class="flex h-48 w-full items-end justify-center gap-0.5"
                            >
                                <div
                                    class="w-1/2 rounded-t-sm bg-primary/70"
                                    :style="{
                                        height: `${Math.round((point.submitted / peakTrend) * 100)}%`,
                                    }"
                                    :title="`${point.label}: ${point.submitted} submitted`"
                                />
                                <div
                                    class="w-1/2 rounded-t-sm bg-emerald-500/70"
                                    :style="{
                                        height: `${Math.round((point.resolved / peakTrend) * 100)}%`,
                                    }"
                                    :title="`${point.label}: ${point.resolved} resolved`"
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
                            <span class="size-2.5 rounded-full bg-primary/70" />
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

        <div class="grid gap-4 lg:grid-cols-2">
            <Card class="gap-3">
                <CardHeader>
                    <CardTitle>By category</CardTitle>
                    <CardDescription>
                        Concentration of complaints by category.
                    </CardDescription>
                </CardHeader>
                <CardContent class="space-y-3">
                    <div
                        v-if="
                            analyticsData.byCategory.length === 0 ||
                            totals.total === 0
                        "
                        class="py-8 text-center text-sm text-muted-foreground"
                    >
                        No category data recorded yet.
                    </div>
                    <template v-else>
                        <div
                            v-for="entry in analyticsData.byCategory"
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
                                        width: `${Math.round((entry.value / peakCategory) * 100)}%`,
                                    }"
                                />
                            </div>
                        </div>
                    </template>
                </CardContent>
            </Card>

            <Card class="gap-3">
                <CardHeader>
                    <CardTitle>By barangay</CardTitle>
                    <CardDescription>
                        Top barangays with registered complaints.
                    </CardDescription>
                </CardHeader>
                <CardContent class="space-y-3">
                    <div
                        v-if="analyticsData.byBarangay.length === 0"
                        class="py-8 text-center text-sm text-muted-foreground"
                    >
                        No barangay complaints recorded yet.
                    </div>
                    <template v-else>
                        <div
                            v-for="entry in analyticsData.byBarangay"
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
                                        width: `${Math.round((entry.value / peakBarangay) * 100)}%`,
                                    }"
                                />
                            </div>
                        </div>
                    </template>
                </CardContent>
            </Card>
        </div>

        <Card class="gap-3">
            <CardHeader>
                <CardTitle>By priority</CardTitle>
                <CardDescription>
                    Distribution of report severity levels.
                </CardDescription>
            </CardHeader>
            <CardContent class="space-y-3">
                <div
                    v-if="totals.total === 0"
                    class="py-8 text-center text-sm text-muted-foreground"
                >
                    No priority distribution recorded yet.
                </div>
                <template v-else>
                    <div
                        v-for="entry in analyticsData.byPriority"
                        :key="entry.label"
                        class="space-y-1"
                    >
                        <div class="flex items-center justify-between text-sm">
                            <span>{{ entry.label }}</span>
                            <span class="text-muted-foreground tabular-nums">
                                {{ formatNumber(entry.value) }}
                            </span>
                        </div>
                        <div
                            class="h-1.5 overflow-hidden rounded-full bg-muted"
                        >
                            <div
                                class="h-full rounded-full"
                                :class="{
                                    'bg-rose-500': entry.label === 'Urgent',
                                    'bg-amber-500': entry.label === 'High',
                                    'bg-blue-500': entry.label === 'Medium',
                                    'bg-zinc-400': entry.label === 'Low',
                                }"
                                :style="{
                                    width: `${Math.round((entry.value / peakPriority) * 100)}%`,
                                }"
                            />
                        </div>
                    </div>
                </template>
            </CardContent>
        </Card>
    </div>
</template>
