import React, { useMemo } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Check, ClipboardList, Inbox, Map } from 'lucide-react';
import OpenStreetMap, { type MapMarker } from '@/components/OpenStreetMap';
import { ComplaintTable, PageHeader, StatCard } from '@/components/geo';
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
    assignedComplaintsList?: ComplaintSummary[];
    staffStats?: {
        total: number;
        newAssignments: number;
        inProgress: number;
        resolved: number;
        urgent: number;
    };
}

export default function Dashboard({
    assignedComplaintsList = [],
    staffStats = {
        total: 0,
        newAssignments: 0,
        inProgress: 0,
        resolved: 0,
        urgent: 0,
    },
}: DashboardProps) {
    const page = usePage<{ auth?: { user?: { name?: string } } }>();
    const userName = page.props.auth?.user?.name ?? 'Staff Officer';
    const firstName = userName.split(' ')[0] || 'Staff Officer';

    const newAssignments = useMemo(
        () =>
            assignedComplaintsList.filter(
                (complaint) => complaint.status === 'assigned'
            ),
        [assignedComplaintsList]
    );

    const recent = useMemo(
        () => assignedComplaintsList.slice(0, 4),
        [assignedComplaintsList]
    );

    const liveMarkers = useMemo<MapMarker[]>(
        () =>
            assignedComplaintsList
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
        [assignedComplaintsList]
    );

    const breadcrumbs = [{ title: 'Dashboard', href: '/staff/dashboard' }];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Staff Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <PageHeader
                    eyebrow="Field Operations"
                    title={`Good to see you, ${firstName}`}
                    description={`Municipal Engineering & Response · ${formatNumber(
                        staffStats.total
                    )} reports currently assigned to you.`}
                    actions={
                        <Button variant="outline" asChild>
                            <Link href="/staff/complaints">
                                <ClipboardList className="size-4" />
                                Open work queue
                            </Link>
                        </Button>
                    }
                />

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        label="New assignments"
                        value={formatNumber(staffStats.newAssignments)}
                        hint="Waiting to be picked up"
                        icon={Inbox}
                        accent={
                            staffStats.newAssignments > 0
                                ? 'text-amber-600 dark:text-amber-400'
                                : undefined
                        }
                    />
                    <StatCard
                        label="Under investigation"
                        value={formatNumber(staffStats.inProgress)}
                        hint="Site visits and verification"
                        icon={ClipboardList}
                    />
                    <StatCard
                        label="Resolved"
                        value={formatNumber(staffStats.resolved)}
                        hint="Completed with evidence"
                        icon={Check}
                    />
                    <StatCard
                        label="Total assigned"
                        value={formatNumber(staffStats.total)}
                        hint="Across all statuses"
                        icon={Map}
                    />
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
                    <div className="space-y-4">
                        {newAssignments.length > 0 && (
                            <Card className="gap-3">
                                <CardHeader>
                                    <CardTitle>Pick up next</CardTitle>
                                    <CardDescription>
                                        Newest assignments that have not been started.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ComplaintTable
                                        complaints={newAssignments}
                                        linkPrefix="/staff/complaints"
                                    />
                                </CardContent>
                            </Card>
                        )}

                        <Card className="gap-3">
                            <CardHeader>
                                <CardTitle>Your work queue</CardTitle>
                                <CardDescription>
                                    The most recent reports assigned to you.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ComplaintTable
                                    complaints={recent}
                                    linkPrefix="/staff/complaints"
                                    emptyTitle="Work queue is clear"
                                    emptyDescription="You have no pending assignments right now. New tasks assigned by administration will appear here."
                                />
                                {recent.length > 0 && (
                                    <div className="mt-4">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href="/staff/complaints">
                                                View all assignments
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-4">
                        <Card className="gap-3">
                            <CardHeader>
                                <CardTitle>Recent activity</CardTitle>
                                <CardDescription>
                                    Latest movements on your cases.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {recent.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-8 text-center text-sm text-muted-foreground">
                                        <ClipboardList className="mb-2 size-8 opacity-40" />
                                        <p className="font-medium text-foreground">
                                            No recent case movements
                                        </p>
                                        <p className="text-xs">
                                            Investigation updates and assigned reports
                                            will appear here.
                                        </p>
                                    </div>
                                ) : (
                                    <ol className="space-y-4">
                                        {recent.map((entry) => (
                                            <li key={entry.id} className="flex gap-3">
                                                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
                                                <div className="min-w-0 space-y-0.5">
                                                    <p className="text-sm leading-snug">
                                                        Case assigned
                                                    </p>
                                                    <p className="truncate text-xs text-muted-foreground">
                                                        {entry.reference} ·{' '}
                                                        {entry.title}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatRelative(entry.createdAt)}
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
                                <CardTitle>Where the work is</CardTitle>
                                <CardDescription>
                                    Your assignments plotted for route planning.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <OpenStreetMap
                                    latitude={9.8}
                                    longitude={123.8}
                                    zoom={12}
                                    height="h-[260px]"
                                    markers={liveMarkers}
                                    selectable={false}
                                    showBarangays={false}
                                    showLegend={false}
                                    showCoordinatesBadge={false}
                                    caption="Field assignments plotted across Loon, Bohol."
                                />
                                <div className="mt-4">
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href="/staff/map">Open field map</Link>
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
