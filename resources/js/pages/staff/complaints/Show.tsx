import React, { useEffect, useMemo, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Check,
    ClipboardList,
    FileText,
    MapPin,
    Plus,
} from 'lucide-react';
import OpenStreetMap, { type MapMarker } from '@/components/OpenStreetMap';
import {
    ComplaintTimeline,
    ConfirmDialog,
    EmptyState,
    EvidenceGallery,
    ImageUploadPreview,
    StatusBadge,
} from '@/components/geo';
import type { ImagePreview } from '@/components/geo';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/AppLayout';
import { formatCoordinates, formatDate, formatDateTime } from '@/lib/format';
import type { Complaint } from '@/types/geo';

interface ShowProps {
    complaintId: number;
    complaintData?: Complaint;
}

export default function Show({ complaintId, complaintData }: ShowProps) {
    const complaint = complaintData ?? null;

    const [noteBody, setNoteBody] = useState('');
    const [noteIsInternal, setNoteIsInternal] = useState(true);
    const [resolutionPhotos, setResolutionPhotos] = useState<ImagePreview[]>([]);
    const [resolutionOpen, setResolutionOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        setNoteBody('');
        setNoteIsInternal(true);
        setResolutionPhotos([]);
        setResolutionOpen(false);
    }, [complaintId]);

    const canStart = complaint?.status === 'assigned';
    const canResolve = complaint?.status === 'in_progress';

    const startInvestigation = () => {
        setSubmitting(true);
        router.post(
            `/staff/complaints/${complaintId}/status`,
            {
                status: 'in_progress',
                remarks:
                    'Field staff initiated ocular inspection and investigation at the site.',
            },
            {
                preserveScroll: true,
                onFinish: () => {
                    setSubmitting(false);
                },
            }
        );
    };

    const confirmResolution = () => {
        setResolutionOpen(false);
        setSubmitting(true);

        const files = resolutionPhotos
            .map((item) => item.file)
            .filter((file): file is File => file instanceof File);

        router.post(
            `/staff/complaints/${complaintId}/status`,
            {
                status: 'resolved',
                remarks:
                    'Complaint resolved. Repair work completed and verified on site.',
                photos: files,
            },
            {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    setResolutionPhotos([]);
                },
                onFinish: () => {
                    setSubmitting(false);
                },
            }
        );
    };

    const addNote = () => {
        const body = noteBody.trim();
        if (body.length < 3) {
            return;
        }

        setSubmitting(true);
        router.post(
            `/staff/complaints/${complaintId}/notes`,
            {
                comment: body,
                is_internal: noteIsInternal,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setNoteBody('');
                },
                onFinish: () => {
                    setSubmitting(false);
                },
            }
        );
    };

    const liveMarkers = useMemo<MapMarker[]>(() => {
        if (!complaint) {
            return [];
        }

        return [
            {
                id: complaint.id,
                latitude: complaint.latitude,
                longitude: complaint.longitude,
                title: `${complaint.reference} — ${complaint.title}`,
                description: `${complaint.address}, ${complaint.barangay}`,
                color: complaint.category?.color ?? '#0284C7',
            },
        ];
    }, [complaint]);

    const breadcrumbs = [
        { title: 'Dashboard', href: '/staff/dashboard' },
        { title: 'Assigned reports', href: '/staff/complaints' },
        {
            title: complaint ? complaint.reference : 'Details',
            href: `/staff/complaints/${complaintId}`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={complaint ? complaint.title : 'Report not found'} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" asChild className="size-8">
                        <Link href="/staff/complaints" aria-label="Back to work queue">
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
                        description="This report could not be found in your assigned queue."
                        icon={FileText}
                    >
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/staff/complaints">Back to assignments</Link>
                        </Button>
                    </EmptyState>
                ) : (
                    <>
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <StatusBadge status={complaint.status} />
                                <span className="text-xs text-muted-foreground">
                                    Priority set by the administrator during approval.
                                </span>
                            </div>
                            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                                {complaint.title}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Reported by {complaint.reporterName} on{' '}
                                {formatDate(complaint.submittedAt)} ·{' '}
                                {complaint.barangay}
                            </p>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
                            <div className="space-y-4">
                                <Card className="gap-3">
                                    <CardHeader>
                                        <CardTitle>Investigation details</CardTitle>
                                        <CardDescription>
                                            What the resident reported and where to find
                                            it.
                                        </CardDescription>
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
                                        </dl>
                                    </CardContent>
                                </Card>

                                <Card className="gap-3">
                                    <CardHeader>
                                        <CardTitle>Resident photos</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <EvidenceGallery
                                            attachments={complaint.evidence}
                                            emptyLabel="The resident did not attach photos."
                                        />
                                    </CardContent>
                                </Card>

                                <Card className="gap-3">
                                    <CardHeader>
                                        <CardTitle>Resolution evidence</CardTitle>
                                        <CardDescription>
                                            Photos proving the work is done. The
                                            administrator reviews them before closing.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {complaint.resolutionEvidence.length > 0 && (
                                            <EvidenceGallery
                                                attachments={complaint.resolutionEvidence}
                                            />
                                        )}
                                        {canResolve ? (
                                            <ImageUploadPreview
                                                modelValue={resolutionPhotos}
                                                onUpdateModelValue={setResolutionPhotos}
                                            />
                                        ) : complaint.resolutionEvidence.length === 0 ? (
                                            <p className="text-sm text-muted-foreground">
                                                Start the investigation to attach
                                                resolution photos.
                                            </p>
                                        ) : null}
                                    </CardContent>
                                </Card>

                                <Card className="gap-3">
                                    <CardHeader>
                                        <CardTitle>Case notes</CardTitle>
                                        <CardDescription>
                                            Internal notes are visible to the municipal
                                            team only.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-3 rounded-lg border p-3">
                                            <Textarea
                                                value={noteBody}
                                                onChange={(e) =>
                                                    setNoteBody(e.target.value)
                                                }
                                                rows={3}
                                                placeholder="Record what you found on site…"
                                            />
                                            <div className="flex flex-wrap items-center justify-between gap-3">
                                                <Label className="flex items-center gap-2 text-xs font-normal">
                                                    <Checkbox
                                                        checked={noteIsInternal}
                                                        onCheckedChange={(checked) =>
                                                            setNoteIsInternal(
                                                                Boolean(checked)
                                                            )
                                                        }
                                                    />
                                                    Internal note (not shown to the
                                                    reporter)
                                                </Label>
                                                <Button
                                                    size="sm"
                                                    disabled={
                                                        noteBody.trim().length < 3 ||
                                                        submitting
                                                    }
                                                    onClick={addNote}
                                                >
                                                    <Plus className="size-4" />
                                                    Add note
                                                </Button>
                                            </div>
                                        </div>

                                        {complaint.notes.length > 0 ? (
                                            <ul className="space-y-4">
                                                {complaint.notes.map((note) => (
                                                    <li
                                                        key={note.id}
                                                        className="space-y-1"
                                                    >
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <p className="text-sm font-medium">
                                                                {note.authorName}
                                                            </p>
                                                            <span className="text-[11px] tracking-wide text-muted-foreground uppercase">
                                                                {note.isInternal
                                                                    ? 'Internal'
                                                                    : 'Public'}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm leading-snug">
                                                            {note.body}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {formatDateTime(
                                                                note.createdAt
                                                            )}
                                                        </p>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">
                                                No notes on this case yet.
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="space-y-4">
                                <Card className="gap-3">
                                    <CardHeader>
                                        <CardTitle>Case actions</CardTitle>
                                        <CardDescription>
                                            Update investigation progress and submit
                                            resolution updates.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {canStart && (
                                            <Button
                                                className="w-full"
                                                disabled={submitting}
                                                onClick={startInvestigation}
                                            >
                                                <ClipboardList className="size-4" />
                                                Start investigation
                                            </Button>
                                        )}

                                        {canResolve && (
                                            <Button
                                                className="w-full"
                                                disabled={submitting}
                                                onClick={() => setResolutionOpen(true)}
                                            >
                                                <Check className="size-4" />
                                                Submit resolution
                                            </Button>
                                        )}

                                        {complaint.status === 'resolved' && (
                                            <p className="text-sm text-muted-foreground">
                                                Resolution recorded. The administrator
                                                reviews the evidence and closes the case.
                                            </p>
                                        )}

                                        {(complaint.status === 'closed' ||
                                            complaint.status === 'rejected') && (
                                            <p className="text-sm text-muted-foreground">
                                                This case is closed and read-only.
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card className="gap-3">
                                    <CardHeader>
                                        <CardTitle>Progress</CardTitle>
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
                                            caption="Exact site pin for this field assignment."
                                        />
                                        <p className="mt-3 flex items-start gap-1.5 text-xs text-muted-foreground">
                                            <MapPin className="mt-px size-3.5 shrink-0" />
                                            {complaint.address},{' '}
                                            {complaint.barangay}
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </>
                )}

                <ConfirmDialog
                    open={resolutionOpen}
                    onOpenChange={setResolutionOpen}
                    title="Submit resolution?"
                    description="Selected site photos will be uploaded and attached to this report. The administrator reviews the evidence before closing the case."
                    confirmLabel="Mark as resolved"
                    onConfirm={confirmResolution}
                />
            </div>
        </AppLayout>
    );
}
