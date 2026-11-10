import React, { useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, FileText, MapPin } from 'lucide-react';
import OpenStreetMap, { type MapMarker } from '@/components/OpenStreetMap';
import {
    ComplaintTimeline,
    EmptyState,
    EvidenceGallery,
    StatusBadge,
} from '@/components/geo';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/AppLayout';
import { formatCoordinates, formatDate, formatDateTime } from '@/lib/format';
import { useTaxonomy } from '@/lib/taxonomy';
import type { Complaint } from '@/types/geo';

interface ShowProps {
    complaintId: number;
    complaintData?: Complaint;
}

export default function Show({ complaintId, complaintData }: ShowProps) {
    const { findCategoryById } = useTaxonomy();
    const complaint = complaintData ?? null;

    const category = useMemo(() => {
        if (!complaint) return undefined;
        return complaint.category ?? findCategoryById(complaint.categoryId);
    }, [complaint, findCategoryById]);

    const publicNotes = useMemo(
        () => (complaint ? complaint.notes.filter((note) => !note.isInternal) : []),
        [complaint]
    );

    const liveMarkers = useMemo<MapMarker[]>(() => {
        if (!complaint) return [];
        return [
            {
                id: complaint.id,
                latitude: complaint.latitude,
                longitude: complaint.longitude,
                title: `${complaint.reference} — ${complaint.title}`,
                description: `${complaint.address}, ${complaint.barangay}`,
                color: category?.color ?? '#DC2626',
            },
        ];
    }, [complaint, category]);

    const breadcrumbs = [
        { title: 'Dashboard', href: '/citizen/dashboard' },
        { title: 'My reports', href: '/citizen/complaints' },
        {
            title: complaint ? complaint.reference : 'Details',
            href: `/citizen/complaints/${complaintId}`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={complaint ? complaint.title : 'Report not found'} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" asChild className="size-8">
                        <Link href="/citizen/complaints" aria-label="Back to reports">
                            <ArrowLeft className="size-4" />
                        </Link>
                    </Button>
                    {complaint && (
                        <span className="font-mono text-xs text-muted-foreground">
                            {complaint.reference}
                        </span>
                    )}
                </div>

                {!complaint ? (
                    <EmptyState
                        title="Report not found"
                        description="This report could not be found in your submissions."
                        icon={FileText}
                    >
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/citizen/complaints">Back to my reports</Link>
                        </Button>
                    </EmptyState>
                ) : (
                    <>
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <StatusBadge status={complaint.status} />
                                {category && (
                                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <span
                                            className="size-2 rounded-full"
                                            style={{ backgroundColor: category.color }}
                                        />
                                        {category.name}
                                    </span>
                                )}
                            </div>
                            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                                {complaint.title}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Submitted {formatDate(complaint.submittedAt)} from{' '}
                                {complaint.barangay}.
                            </p>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
                            <div className="space-y-4">
                                <Card className="gap-3">
                                    <CardHeader>
                                        <CardTitle>What you reported</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <p className="text-sm leading-relaxed">
                                            {complaint.description}
                                        </p>
                                        <Separator />
                                        <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                                            <div>
                                                <dt className="text-xs tracking-wide text-muted-foreground uppercase">
                                                    Location
                                                </dt>
                                                <dd className="mt-0.5 text-sm">
                                                    {complaint.address}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-xs tracking-wide text-muted-foreground uppercase">
                                                    Coordinates
                                                </dt>
                                                <dd className="mt-0.5 font-mono text-xs tabular-nums">
                                                    {formatCoordinates(
                                                        complaint.latitude,
                                                        complaint.longitude
                                                    )}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-xs tracking-wide text-muted-foreground uppercase">
                                                    Assigned staff
                                                </dt>
                                                <dd className="mt-0.5 text-sm">
                                                    {complaint.assignedTo
                                                        ? `${complaint.assignedTo.name} · ${complaint.assignedTo.department}`
                                                        : 'Not assigned yet'}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-xs tracking-wide text-muted-foreground uppercase">
                                                    Last update
                                                </dt>
                                                <dd className="mt-0.5 text-sm">
                                                    {formatDateTime(complaint.updatedAt)}
                                                </dd>
                                            </div>
                                        </dl>
                                    </CardContent>
                                </Card>

                                <Card className="gap-3">
                                    <CardHeader>
                                        <CardTitle>Photos</CardTitle>
                                        <CardDescription>
                                            Evidence you attached when reporting.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <EvidenceGallery
                                            attachments={complaint.evidence}
                                            emptyLabel="You did not attach photos to this report."
                                        />
                                    </CardContent>
                                </Card>

                                {complaint.resolutionEvidence.length > 0 && (
                                    <Card className="gap-3">
                                        <CardHeader>
                                            <CardTitle>Resolution evidence</CardTitle>
                                            <CardDescription>
                                                Photos uploaded by staff after the work was
                                                done.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <EvidenceGallery
                                                attachments={complaint.resolutionEvidence}
                                            />
                                        </CardContent>
                                    </Card>
                                )}

                                <Card className="gap-3">
                                    <CardHeader>
                                        <CardTitle>Updates from the city team</CardTitle>
                                        <CardDescription>
                                            Notes staff published about this report.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {publicNotes.length === 0 ? (
                                            <p className="text-sm text-muted-foreground">
                                                No public notes yet. You will be notified when
                                                staff post an update.
                                            </p>
                                        ) : (
                                            <ul className="space-y-4">
                                                {publicNotes.map((note) => (
                                                    <li
                                                        key={note.id}
                                                        className="space-y-1"
                                                    >
                                                        <p className="text-sm leading-snug">
                                                            {note.body}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {note.authorName} ·{' '}
                                                            {formatDateTime(note.createdAt)}
                                                        </p>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="space-y-4">
                                <Card className="gap-3">
                                    <CardHeader>
                                        <CardTitle>Progress</CardTitle>
                                        <CardDescription>
                                            Where this report is in the review process.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ComplaintTimeline
                                            events={complaint.timeline}
                                            status={complaint.status}
                                        />
                                    </CardContent>
                                </Card>

                                <Card className="gap-3">
                                    <CardHeader>
                                        <CardTitle>Location</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <OpenStreetMap
                                            latitude={complaint.latitude}
                                            longitude={complaint.longitude}
                                            zoom={15}
                                            height="h-[240px]"
                                            markers={liveMarkers}
                                            selectable={false}
                                            showBarangays={false}
                                            showLegend={false}
                                            showCoordinatesBadge={false}
                                            caption="Your report pin at the recorded GPS coordinates."
                                        />
                                        <p className="mt-3 flex items-start gap-1.5 text-xs text-muted-foreground">
                                            <MapPin className="mt-px size-3.5 shrink-0" />
                                            {complaint.address}, {complaint.barangay}
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
