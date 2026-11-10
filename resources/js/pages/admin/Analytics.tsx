import React, { useMemo } from 'react';
import { Head } from '@inertiajs/react';
import {
    AlertCircle,
    BarChart3,
    FileText,
    ShieldCheck,
    TrendingUp,
} from 'lucide-react';
import { PageHeader, StatCard } from '@/components/geo';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/AppLayout';
import { formatNumber } from '@/lib/format';

type StatPoint = { label: string; value: number };
type TrendPoint = { label: string; submitted: number; resolved: number };

interface AnalyticsProps {
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
}

export default function Analytics({
    totals = {
        total: 0,
        pending: 0,
        assigned: 0,
        inProgress: 0,
        resolved: 0,
        resolutionRate: 0,
        avgResolutionDays: 0,
    },
    analyticsData = {
        monthlyTrend: [],
        byCategory: [],
        byBarangay: [],
        byPriority: [],
    },
}: AnalyticsProps) {
    const peakTrend = useMemo(
        () =>
            Math.max(
                ...analyticsData.monthlyTrend.map((point) =>
                    Math.max(point.submitted, point.resolved)
                ),
                1
            ),
        [analyticsData.monthlyTrend]
    );

    const peakCategory = useMemo(
        () =>
            Math.max(
                ...analyticsData.byCategory.map((entry) => entry.value),
                1
            ),
        [analyticsData.byCategory]
    );

    const peakBarangay = useMemo(
        () =>
            Math.max(
                ...analyticsData.byBarangay.map((entry) => entry.value),
                1
            ),
        [analyticsData.byBarangay]
    );

    const peakPriority = useMemo(
        () =>
            Math.max(
                ...analyticsData.byPriority.map((entry) => entry.value),
                1
            ),
        [analyticsData.byPriority]
    );

    const breadcrumbs = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Analytics', href: '/admin/analytics' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Analytics" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <PageHeader
                    eyebrow="Administration"
                    title="Analytics"
                    description="Historical complaint metrics across the Municipality of Loon, Bohol, broken down by category, barangay and priority."
                />

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        label="Total reports"
                        value={formatNumber(totals.total)}
                        hint="All time recorded"
                        icon={FileText}
                    />
                    <StatCard
                        label="Awaiting review"
                        value={formatNumber(totals.pending)}
                        hint="Pending triage"
                        icon={AlertCircle}
                        accent={
                            totals.pending > 0
                                ? 'text-amber-600 dark:text-amber-400'
                                : undefined
                        }
                    />
                    <StatCard
                        label="Resolution rate"
                        value={`${totals.resolutionRate}%`}
                        hint={`${formatNumber(totals.resolved)} reports resolved`}
                        icon={ShieldCheck}
                    />
                    <StatCard
                        label="Avg. resolution time"
                        value={`${totals.avgResolutionDays} days`}
                        hint="Submission to closure"
                        icon={TrendingUp}
                    />
                </div>

                <Card className="gap-3">
                    <CardHeader>
                        <CardTitle>Monthly volume</CardTitle>
                        <CardDescription>
                            Submissions against resolutions over the past 12 months.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {totals.total === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center text-sm text-muted-foreground">
                                <BarChart3 className="mb-2 size-8 opacity-40" />
                                <p className="font-medium text-foreground">
                                    No monthly volume data recorded yet
                                </p>
                                <p className="text-xs">
                                    Metrics populate automatically as complaints are
                                    submitted.
                                </p>
                            </div>
                        ) : (
                            <div>
                                <div className="flex h-48 items-end gap-2">
                                    {analyticsData.monthlyTrend.map((point) => (
                                        <div
                                            key={point.label}
                                            className="flex flex-1 flex-col items-center gap-1"
                                        >
                                            <div className="flex h-40 w-full items-end justify-center gap-1">
                                                <div
                                                    className="w-1/2 rounded-t-sm bg-primary/70"
                                                    style={{
                                                        height: `${Math.round(
                                                            (point.submitted /
                                                                peakTrend) *
                                                                100
                                                        )}%`,
                                                    }}
                                                    title={`${point.submitted} submitted`}
                                                />
                                                <div
                                                    className="w-1/2 rounded-t-sm bg-emerald-500/70"
                                                    style={{
                                                        height: `${Math.round(
                                                            (point.resolved /
                                                                peakTrend) *
                                                                100
                                                        )}%`,
                                                    }}
                                                    title={`${point.resolved} resolved`}
                                                />
                                            </div>
                                            <span className="text-[10px] text-muted-foreground tabular-nums">
                                                {point.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1.5">
                                        <span className="size-2.5 rounded-full bg-primary/70" />
                                        Submitted
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <span className="size-2.5 rounded-full bg-emerald-500/70" />
                                        Resolved
                                    </span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="grid gap-4 lg:grid-cols-3">
                    <Card className="gap-3">
                        <CardHeader>
                            <CardTitle>By category</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {analyticsData.byCategory.map((entry) => (
                                <div key={entry.label} className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <span>{entry.label}</span>
                                        <span className="text-muted-foreground tabular-nums">
                                            {formatNumber(entry.value)}
                                        </span>
                                    </div>
                                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                                        <div
                                            className="h-full rounded-full bg-primary"
                                            style={{
                                                width: `${Math.round(
                                                    (entry.value / peakCategory) *
                                                        100
                                                )}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="gap-3">
                        <CardHeader>
                            <CardTitle>Top barangays</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {analyticsData.byBarangay.slice(0, 7).map((entry) => (
                                <div key={entry.label} className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <span>{entry.label}</span>
                                        <span className="text-muted-foreground tabular-nums">
                                            {formatNumber(entry.value)}
                                        </span>
                                    </div>
                                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                                        <div
                                            className="h-full rounded-full bg-emerald-600"
                                            style={{
                                                width: `${Math.round(
                                                    (entry.value / peakBarangay) *
                                                        100
                                                )}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="gap-3">
                        <CardHeader>
                            <CardTitle>By priority</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {analyticsData.byPriority.map((entry) => (
                                <div key={entry.label} className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="capitalize">
                                            {entry.label}
                                        </span>
                                        <span className="text-muted-foreground tabular-nums">
                                            {formatNumber(entry.value)}
                                        </span>
                                    </div>
                                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                                        <div
                                            className="h-full rounded-full bg-amber-500"
                                            style={{
                                                width: `${Math.round(
                                                    (entry.value / peakPriority) *
                                                        100
                                                )}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
