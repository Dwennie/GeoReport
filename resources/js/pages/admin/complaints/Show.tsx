import React, { useEffect, useMemo, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Check,
    CheckCircle2,
    FileText,
    MapPin,
    UserCheck,
    Users,
    X,
} from 'lucide-react';
import OpenStreetMap, { type MapMarker } from '@/components/OpenStreetMap';
import {
    ComplaintTimeline,
    ConfirmDialog,
    EmptyState,
    EvidenceGallery,
    FilterSelect,
    PriorityBadge,
    StatusBadge,
} from '@/components/geo';
import type { FilterOption } from '@/components/geo';
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
import type { AssignedStaff, Complaint, StaffMember } from '@/types/geo';

interface ShowProps {
    complaintId: number;
    complaintData?: Complaint;
    staffOptions?: StaffMember[];
}

export default function Show({
    complaintId,
    complaintData,
    staffOptions = [],
}: ShowProps) {
    const complaint = complaintData ?? null;

    const [workingAssignee, setWorkingAssignee] = useState('');
    const [rejectOpen, setRejectOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        setWorkingAssignee(
            complaint?.assignedTo != null ? String(complaint.assignedTo.id) : ''
        );
        setRejectOpen(false);
    }, [complaintId, complaint?.assignedTo?.id]);

    const staffDropdownOptions = useMemo<FilterOption[]>(
        () => [
            { value: '', label: 'Select field staff…' },
            ...staffOptions.map((member) => ({
                value: String(member.id),
                label: `${member.name} · ${member.department}`,
            })),
        ],
        [staffOptions]
    );

    const selectedStaff = useMemo<AssignedStaff | null>(() => {
        const member = staffOptions.find(
            (item) => String(item.id) === workingAssignee
        );
        return member
            ? { id: member.id, name: member.name, department: member.department }
            : null;
    }, [staffOptions, workingAssignee]);

    const canDecide =
        complaint?.status === 'pending' || complaint?.status === 'approved';
    const canAssign =
        complaint?.status === 'approved' ||
        complaint?.status === 'assigned' ||
        complaint?.status === 'in_progress';
    const canClose = complaint?.status === 'resolved';

    const approve = () => {
        setSubmitting(true);
        router.post(
            `/admin/complaints/${complaintId}/approve`,
            {},
            {
                preserveScroll: true,
                onFinish: () => {
                    setSubmitting(false);
                },
            }
        );
    };

    const confirmReject = () => {
        setRejectOpen(false);
        setSubmitting(true);
        router.post(
            `/admin/complaints/${complaintId}/reject`,
            {},
            {
                preserveScroll: true,
                onFinish: () => {
                    setSubmitting(false);
                },
            }
        );
    };

    const assign = () => {
        if (workingAssignee === '' || !selectedStaff) {
            return;
        }

        setSubmitting(true);
        router.post(
            `/admin/complaints/${complaintId}/assign`,
            {
                staff_id: Number(workingAssignee),
            },
            {
                preserveScroll: true,
                onFinish: () => {
                    setSubmitting(false);
                },
            }
        );
    };

    const closeCase = () => {
        setSubmitting(true);
        router.post(
            `/admin/complaints/${complaintId}/close`,
            {},
            {
                preserveScroll: true,
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
                color: complaint.category?.color ?? '#DC2626',
            },
        ];
    }, [complaint]);

    const breadcrumbs = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'All reports', href: '/admin/complaints' },
        {
            title: complaint ? complaint.reference : 'Details',
            href: `/admin/complaints/${complaintId}`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={complaint ? complaint.title : 'Report not found'} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" asChild className="size-8">
                        <Link href="/admin/complaints" aria-label="Back to all reports">
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
                        description="This report could not be found in the municipal registry."
                        icon={FileText}
                    >
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/admin/complaints">Back to all reports</Link>
                        </Button>
                    </EmptyState>
                ) : (
                    <>
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <StatusBadge status={complaint.status} />
                                <PriorityBadge priority={complaint.priority} />
                                {!complaint.isPublic && (
                                    <span className="text-xs text-muted-foreground">
                                        Not visible on the community map
                                    </span>
                                )}
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
                                        <CardTitle>Report details</CardTitle>
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
                                                        : 'Unassigned'}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-xs tracking-wide text-muted-foreground uppercase">
                                                    Resolved on
                                                </dt>
                                                <dd className="mt-0.5 text-sm">
                                                    {formatDate(complaint.resolvedAt)}
                                                </dd>
                                            </div>
                                        </dl>
                                    </CardContent>
                                </Card>

                                <Card className="gap-3">
                                    <CardHeader>
                                        <CardTitle>Evidence</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                                From the reporter
                                            </p>
                                            <EvidenceGallery
                                                attachments={complaint.evidence}
                                                emptyLabel="No photos attached."
                                            />
                                        </div>
                                        {complaint.resolutionEvidence.length > 0 && (
                                            <div>
                                                <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                                    From staff (resolution)
                                                </p>
                                                <EvidenceGallery
                                                    attachments={
                                                        complaint.resolutionEvidence
                                                    }
                                                />
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card className="gap-3">
                                    <CardHeader>
                                        <CardTitle>All case notes</CardTitle>
                                        <CardDescription>
                                            Internal and public notes across the municipal
                                            team.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {complaint.notes.length === 0 ? (
                                            <p className="text-sm text-muted-foreground">
                                                No notes recorded on this case.
                                            </p>
                                        ) : (
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
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="space-y-4">
                                <Card className="gap-3">
                                    <CardHeader>
                                        <CardTitle>Decisions</CardTitle>
                                        <CardDescription>
                                            Approve or reject incoming concerns and dispatch
                                            field staff.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {canDecide && (
                                            <div className="flex gap-2">
                                                <Button
                                                    className="flex-1"
                                                    disabled={
                                                        submitting ||
                                                        complaint.status === 'approved'
                                                    }
                                                    onClick={approve}
                                                >
                                                    <Check className="size-4" />
                                                    {complaint.status === 'approved'
                                                        ? 'Approved'
                                                        : 'Approve'}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="flex-1 text-destructive hover:text-destructive"
                                                    disabled={submitting}
                                                    onClick={() => setRejectOpen(true)}
                                                >
                                                    <X className="size-4" />
                                                    Reject
                                                </Button>
                                            </div>
                                        )}

                                        {canAssign && (
                                            <div className="space-y-2 border-t pt-3">
                                                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                                    Assign to field staff
                                                </p>
                                                {staffOptions.length > 0 ? (
                                                    <>
                                                        <FilterSelect
                                                            modelValue={workingAssignee}
                                                            onUpdateModelValue={
                                                                setWorkingAssignee
                                                            }
                                                            options={
                                                                staffDropdownOptions
                                                            }
                                                            aria-label="Assign to staff"
                                                            className="w-full"
                                                        />
                                                        <Button
                                                            className="w-full"
                                                            disabled={
                                                                !selectedStaff ||
                                                                submitting
                                                            }
                                                            onClick={assign}
                                                        >
                                                            <UserCheck className="size-4" />
                                                            Assign report
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <div className="space-y-2 rounded-lg border border-dashed p-3 text-xs">
                                                        <p className="text-muted-foreground">
                                                            No Field Staff accounts are
                                                            registered yet. Promote a
                                                            citizen or add a staff member
                                                            to assign reports.
                                                        </p>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="w-full"
                                                            asChild
                                                        >
                                                            <Link href="/admin/users">
                                                                <Users className="size-3.5" />
                                                                Manage users &amp; roles
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {canClose && (
                                            <div className="space-y-2 border-t pt-3">
                                                <p className="text-sm text-muted-foreground">
                                                    Staff marked this resolved{' '}
                                                    {complaint.resolvedAt
                                                        ? `on ${formatDate(
                                                              complaint.resolvedAt
                                                          )}`
                                                        : ''}
                                                    . Close the case once the evidence is
                                                    verified.
                                                </p>
                                                <Button
                                                    className="w-full"
                                                    disabled={submitting}
                                                    onClick={closeCase}
                                                >
                                                    <CheckCircle2 className="size-4" />
                                                    Verify &amp; close case
                                                </Button>
                                            </div>
                                        )}

                                        {complaint.status === 'rejected' && (
                                            <p className="text-sm text-muted-foreground">
                                                Rejected. The reporter is notified and the
                                                report stays off the public map.
                                            </p>
                                        )}
                                        {complaint.status === 'closed' && (
                                            <p className="text-sm text-muted-foreground">
                                                Closed and archived. Resolution verified
                                                by the municipal administrator.
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
                                            showBarangays={true}
                                            showLegend={false}
                                            showCoordinatesBadge={false}
                                            caption="Report pin within Loon GIS barangay boundaries."
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
                    open={rejectOpen}
                    onOpenChange={setRejectOpen}
                    title="Reject this report?"
                    description="Rejected reports are hidden from the community map and the reporter is notified with the reason."
                    confirmLabel="Reject report"
                    destructive
                    onConfirm={confirmReject}
                />
            </div>
        </AppLayout>
    );
}
