import React, { useMemo } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { AlertCircle, Check, ClipboardList, Inbox, Plus } from 'lucide-react';
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
}

export default function Dashboard({
    initialComplaints = [],
    communityMapPoints = [],
    userStats = {
        total: 0,
        pending: 0,
        inProgress: 0,
        resolved: 0,
    },
}: DashboardProps) {
    const page = usePage<{ auth?: { user?: { name?: string } } }>();
    const userName = page.props.auth?.user?.name ?? 'Citizen';
    const firstName = userName.split(' ')[0] || 'Citizen';

    const recentReports = useMemo(
        () => initialComplaints.slice(0, 4),
        [initialComplaints]
    );

    const liveMarkers = useMemo<MapMarker[]>(() => {
        const source =
            communityMapPoints.length > 0
                ? communityMapPoints
                : initialComplaints.map((complaint) => ({
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
    }, [communityMapPoints, initialComplaints]);

    const breadcrumbs = [{ title: 'Dashboard', href: '/citizen/dashboard' }];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Citizen Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <PageHeader
                    eyebrow="Community"
                    title={`Welcome back, ${firstName}`}
                    description="Track the concerns you reported and monitor service progress across your barangay."
                    actions={
                        <Button asChild>
                            <Link href="/citizen/complaints/create">
                                <Plus className="size-4" />
                                Report a concern
                            </Link>
                        </Button>
                    }
                />

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        label="Your reports"
                        value={formatNumber(userStats.total)}
                        hint="Submitted from this account"
                        icon={Inbox}
                    />
                    <StatCard
                        label="Awaiting review"
                        value={formatNumber(userStats.pending)}
                        hint="Not yet assigned to staff"
                        icon={AlertCircle}
                        accent={
                            userStats.pending > 0
                                ? 'text-amber-600 dark:text-amber-400'
                                : undefined
                        }
                    />
                    <StatCard
                        label="In progress"
                        value={formatNumber(userStats.inProgress)}
                        hint="Assigned or under investigation"
                        icon={ClipboardList}
                    />
                    <StatCard
                        label="Resolved"
                        value={formatNumber(userStats.resolved)}
                        hint="Closed with evidence on file"
                        icon={Check}
                    />
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
                    <Card className="gap-3">
                        <CardHeader>
                            <CardTitle>Your recent reports</CardTitle>
                            <CardDescription>
                                The most recent concerns you submitted.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ComplaintTable
                                complaints={recentReports}
                                linkPrefix="/citizen/complaints"
                                emptyTitle="No reports filed yet"
                                emptyDescription="Have an infrastructure, sanitation, or safety concern in Loon? Click 'Report a concern' to submit your first report."
                            />
                            {recentReports.length > 0 && (
                                <div className="mt-4">
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href="/citizen/complaints">
                                            View all reports
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="gap-3">
                        <CardHeader>
                            <CardTitle>Latest activity</CardTitle>
                            <CardDescription>
                                Updates on the reports you filed.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {recentReports.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center text-sm text-muted-foreground">
                                    <Inbox className="mb-2 size-8 opacity-40" />
                                    <p className="font-medium text-foreground">
                                        No recent activity yet
                                    </p>
                                    <p className="text-xs">
                                        Timeline updates will appear here once you file a
                                        complaint.
                                    </p>
                                </div>
                            ) : (
                                <ol className="space-y-4">
                                    {recentReports.map((entry) => (
                                        <li key={entry.id} className="flex gap-3">
                                            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
                                            <div className="min-w-0 space-y-0.5">
                                                <p className="text-sm leading-snug">
                                                    Report submitted
                                                </p>
                                                <p className="truncate text-xs text-muted-foreground">
                                                    {entry.reference} · {entry.title}
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
                </div>

                <Card className="gap-3">
                    <CardHeader>
                        <CardTitle>Approved reports near you</CardTitle>
                        <CardDescription>
                            Concerns approved for action and visible on the community
                            map.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <OpenStreetMap
                            latitude={9.8}
                            longitude={123.8}
                            zoom={13}
                            height="h-[300px] sm:h-[360px]"
                            markers={liveMarkers}
                            selectable={false}
                            showBarangays={false}
                            showLegend={false}
                            showCoordinatesBadge={false}
                            caption="Approved public concerns across Loon, Bohol · OpenStreetMap"
                        />
                        <div className="mt-4">
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/citizen/map">Open the community map</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
