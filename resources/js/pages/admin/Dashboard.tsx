import React, { useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    AlertCircle,
    BarChart3,
    Clock,
    FileText,
    FolderArchive,
    ShieldCheck,
    Wrench,
} from 'lucide-react';
import OpenStreetMap, { type MapMarker } from '@/components/OpenStreetMap';
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
import AppLayout from '@/layouts/AppLayout';
import { formatNumber, formatRelative } from '@/lib/format';
import type { ComplaintSummary } from '@/types/geo';

interface DashboardProps {
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
}

export default function Dashboard({
    allComplaintsList = [],
    reviewQueueList = [],
    totals = {
        total: 0,
        pending: 0,
        assigned: 0,
        inProgress: 0,
        resolved: 0,
        resolutionRate: 0,
        avgResolutionDays: 0,
    },
    categoriesBreakdown = [],
    monthlyTrend = [],
}: DashboardProps) {
    const reviewQueue = useMemo(
        () => reviewQueueList.slice(0, 4),
        [reviewQueueList]
    );

    const recentActivity = useMemo(
        () => allComplaintsList.slice(0, 5),
        [allComplaintsList]
    );

    const liveMarkers = useMemo<MapMarker[]>(
        () =>
            allComplaintsList
                .filter((complaint) => complaint.latitude && complaint.longitude)
                .map((complaint) => ({
                    id: complaint.id,
                    latitude: complaint.latitude,
                    longitude: complaint.longitude,
                    title: `${complaint.reference} — ${complaint.title}`,
                    description: `${complaint.barangay} · ${complaint.status.replace(
                        '_',
                        ' '
                    )}`,
                    color: complaint.category?.color ?? '#0284C7',
                })),
        [allComplaintsList]
    );

    const peakTrend = useMemo(
        () =>
            Math.max(
                ...monthlyTrend.map((point) =>
                    Math.max(point.submitted, point.resolved)
                ),
                1
            ),
        [monthlyTrend]
    );

    const topCategories = useMemo(
        () => categoriesBreakdown.slice(0, 5),
        [categoriesBreakdown]
    );

    const peakCategory = useMemo(
        () => Math.max(...categoriesBreakdown.map((entry) => entry.value), 1),
        [categoriesBreakdown]
    );

    const breadcrumbs = [{ title: 'Dashboard', href: '/admin/dashboard' }];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <PageHeader
                    eyebrow="Administration"
                    title="Municipality Overview"
                    description="Complaint volume and service resolution across all 67 barangays of Loon, Bohol."
                    actions={
                        <Button variant="outline" asChild>
                            <Link href="/admin/complaints">
                                <FileText className="size-4" />
                                All reports
                            </Link>
                        </Button>
                    }
                />

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        label="Total reports"
                        value={formatNumber(totals.total)}
                        hint="All time, all barangays"
                        icon={FileText}
                    />
                    <StatCard
                        label="Awaiting review"
                        value={formatNumber(totals.pending)}
                        hint="Needs triage decision"
                        icon={AlertCircle}
                        accent={
                            totals.pending > 0
                                ? 'text-amber-600 dark:text-amber-400'
                                : undefined
                        }
                    />
                    <StatCard
                        label="In the field"
                        value={formatNumber(totals.assigned + totals.inProgress)}
                        hint="Assigned or under investigation"
                        icon={Wrench}
                    />
                    <StatCard
                        label="Resolution rate"
                        value={`${totals.resolutionRate}%`}
                        hint={
                            totals.total > 0
                                ? `${totals.resolved} resolved cases`
                                : 'No cases closed yet'
                        }
                        icon={ShieldCheck}
                    />
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
                    <div className="min-w-0 space-y-4">
                        <Card className="gap-3">
                            <CardHeader>
                                <CardTitle>Review queue</CardTitle>
                                <CardDescription>
                                    New reports waiting for an approve or reject
                                    decision.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ComplaintTable
                                    complaints={reviewQueue}
                                    linkPrefix="/admin/complaints"
                                    emptyTitle="Review queue is clear"
                                    emptyDescription="New citizen reports land here for triage and assignment."
                                />
                                {reviewQueue.length > 0 && (
                                    <div className="mt-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full sm:w-auto"
                                            asChild
                                        >
                                            <Link href="/admin/complaints?status=pending">
                                                Open the full queue
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="gap-3">
                            <CardHeader>
                                <CardTitle>Reports per month</CardTitle>
                                <CardDescription>
                                    Submissions against resolutions.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {totals.total === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center text-sm text-muted-foreground">
                                        <BarChart3 className="mb-2 size-8 opacity-40" />
                                        <p className="font-medium text-foreground">
                                            No monthly report data yet
                                        </p>
                                        <p className="text-xs">
                                            Trends will display here as complaints are
                                            received and resolved.
                                        </p>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="flex h-40 items-end gap-2">
                                            {monthlyTrend.map((point) => (
                                                <div
                                                    key={point.label}
                                                    className="flex flex-1 flex-col items-center gap-1"
                                                >
                                                    <div className="flex h-32 w-full items-end justify-center gap-0.5">
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
                    </div>

                    <div className="min-w-0 space-y-4">
                        <Card className="gap-3">
                            <CardHeader>
                                <CardTitle>Latest activity</CardTitle>
                                <CardDescription>
                                    Municipality-wide, newest first.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {recentActivity.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-8 text-center text-sm text-muted-foreground">
                                        <Clock className="mb-2 size-8 opacity-40" />
                                        <p className="font-medium text-foreground">
                                            No recent activity recorded
                                        </p>
                                        <p className="text-xs">
                                            Citizen report submissions and updates will
                                            appear here.
                                        </p>
                                    </div>
                                ) : (
                                    <ol className="space-y-4">
                                        {recentActivity.map((entry) => (
                                            <li key={entry.id} className="flex gap-3">
                                                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
                                                <div className="min-w-0 space-y-0.5">
                                                    <p className="text-sm leading-snug">
                                                        <span className="font-medium">
                                                            {entry.barangay}
                                                        </span>{' '}
                                                        · {entry.status}
                                                    </p>
                                                    <p className="truncate text-xs text-muted-foreground">
                                                        {entry.reference} ·{' '}
                                                        {entry.title}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatRelative(
                                                            entry.createdAt
                                                        )}
                                                    </p>
                                                </div>
                                            </li>
                                        ))}
                                    </ol>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="gap-3">
                            <CardHeader>
                                <CardTitle>Categories breakdown</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {topCategories.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-6 text-center text-sm text-muted-foreground">
                                        <FolderArchive className="mb-2 size-8 opacity-40" />
                                        <p className="font-medium text-foreground">
                                            No categorized reports
                                        </p>
                                        <p className="text-xs">
                                            Categories will populate as reports are
                                            filed.
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        {topCategories.map((entry) => (
                                            <div
                                                key={entry.label}
                                                className="space-y-1"
                                            >
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
                                                            width: `${
                                                                totals.total > 0
                                                                    ? Math.round(
                                                                          (entry.value /
                                                                              peakCategory) *
                                                                              100
                                                                      )
                                                                    : 0
                                                            }%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        <Link href="/admin/analytics">
                                            <Badge variant="outline" className="mt-1">
                                                Full analytics
                                            </Badge>
                                        </Link>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="gap-3">
                            <CardHeader>
                                <CardTitle>GIS overview map</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <OpenStreetMap
                                    latitude={9.8}
                                    longitude={123.8}
                                    zoom={12}
                                    height="h-[240px]"
                                    markers={liveMarkers}
                                    selectable={false}
                                    showBarangays={true}
                                    showLegend={false}
                                    showCoordinatesBadge={false}
                                    caption="All reports across Loon, Bohol with barangay boundaries."
                                />
                                <div className="mt-4">
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href="/admin/map">Open GIS map</Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
