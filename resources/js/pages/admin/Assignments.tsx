import React, { useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import { ClipboardList, UserCheck } from 'lucide-react';
import { PageHeader, StatCard, StatusBadge } from '@/components/geo';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/AppLayout';
import { formatDate, formatNumber } from '@/lib/format';
import type {
    ComplaintStatus,
    ComplaintSummary,
    StaffMember,
} from '@/types/geo';

interface AssignmentsProps {
    staffList?: StaffMember[];
    complaintsList?: ComplaintSummary[];
}

type AssignmentRow = {
    id: number;
    reference: string;
    title: string;
    staffName: string;
    department: string;
    assignedBy: string;
    assignedAt: string;
    status: ComplaintStatus;
};

export default function Assignments({
    staffList = [],
    complaintsList = [],
}: AssignmentsProps) {
    const assignmentRows = useMemo<AssignmentRow[]>(
        () =>
            complaintsList
                .filter((complaint) => complaint.assignedStaffName)
                .map((complaint) => ({
                    id: complaint.id,
                    reference: complaint.reference,
                    title: complaint.title,
                    staffName: complaint.assignedStaffName!,
                    department: 'Municipal Operations',
                    assignedBy: 'Administrator',
                    assignedAt: complaint.updatedAt,
                    status: complaint.status,
                }))
                .sort(
                    (a, b) =>
                        new Date(b.assignedAt).getTime() -
                        new Date(a.assignedAt).getTime()
                ),
        [complaintsList]
    );

    const totalActive = useMemo(
        () =>
            complaintsList.filter(
                (c) => c.status === 'assigned' || c.status === 'in_progress'
            ).length,
        [complaintsList]
    );

    const unassignedComplaints = useMemo(
        () =>
            complaintsList.filter(
                (c) =>
                    !c.assignedStaffName &&
                    c.status !== 'rejected' &&
                    c.status !== 'closed'
            ),
        [complaintsList]
    );

    const peakLoad = useMemo(
        () => Math.max(...staffList.map((member) => member.activeAssignments), 1),
        [staffList]
    );

    const breadcrumbs = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Assignments', href: '/admin/assignments' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Assignments" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <PageHeader
                    eyebrow="Administration"
                    title="Assignments"
                    description="Manage case assignments across municipal personnel and field departments."
                />

                <div className="grid gap-4 sm:grid-cols-3">
                    <StatCard
                        label="Active assignments"
                        value={formatNumber(totalActive)}
                        hint="Across all field staff"
                        icon={UserCheck}
                    />
                    <StatCard
                        label="Unassigned queue"
                        value={formatNumber(unassignedComplaints.length)}
                        hint="Reports waiting for an assignee"
                        icon={ClipboardList}
                    />
                    <StatCard
                        label="Field staff"
                        value={formatNumber(staffList.length)}
                        hint="Registered in system"
                        icon={UserCheck}
                    />
                </div>

                <div className="grid gap-4 xl:grid-cols-[1fr_1.4fr]">
                    <Card className="gap-3">
                        <CardHeader>
                            <CardTitle>Staff workload</CardTitle>
                            <CardDescription>
                                Open cases per staff member.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {staffList.length === 0 ? (
                                <div className="py-8 text-center text-sm text-muted-foreground">
                                    No field staff members registered yet.
                                </div>
                            ) : (
                                <ul className="divide-y">
                                    {staffList.map((member) => (
                                        <li
                                            key={member.id}
                                            className="space-y-1.5 py-3 first:pt-0 last:pb-0"
                                        >
                                            <div className="flex items-center justify-between text-sm">
                                                <div>
                                                    <p className="font-medium">
                                                        {member.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {member.department}
                                                    </p>
                                                </div>
                                                <span className="font-mono text-xs tabular-nums text-muted-foreground">
                                                    {member.activeAssignments}{' '}
                                                    active
                                                </span>
                                            </div>
                                            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                                                <div
                                                    className="h-full rounded-full bg-primary"
                                                    style={{
                                                        width: `${Math.round(
                                                            (member.activeAssignments /
                                                                peakLoad) *
                                                                100
                                                        )}%`,
                                                    }}
                                                />
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="gap-3">
                        <CardHeader>
                            <CardTitle>Recent assignment log</CardTitle>
                            <CardDescription>
                                Cases currently linked to personnel.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {assignmentRows.length === 0 ? (
                                <div className="py-8 text-center text-sm text-muted-foreground">
                                    No active assignments on record.
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Reference</TableHead>
                                                <TableHead>Assigned To</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">
                                                    Updated
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {assignmentRows.map((row) => (
                                                <TableRow key={row.id}>
                                                    <TableCell>
                                                        <Link
                                                            href={`/admin/complaints/${row.id}`}
                                                            className="font-mono text-xs font-medium hover:underline"
                                                        >
                                                            {row.reference}
                                                        </Link>
                                                        <p className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                                                            {row.title}
                                                        </p>
                                                    </TableCell>
                                                    <TableCell className="text-sm font-medium">
                                                        {row.staffName}
                                                    </TableCell>
                                                    <TableCell>
                                                        <StatusBadge
                                                            status={row.status}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="text-right text-xs text-muted-foreground">
                                                        {formatDate(row.assignedAt)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
