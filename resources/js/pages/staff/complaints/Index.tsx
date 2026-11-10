import React, { useEffect, useMemo, useState } from 'react';
import { Head } from '@inertiajs/react';
import {
    ComplaintTable,
    FilterSelect,
    PageHeader,
    SearchInput,
    TablePagination,
} from '@/components/geo';
import type { FilterOption } from '@/components/geo';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/AppLayout';
import { formatNumber } from '@/lib/format';
import { complaintStatusMeta, complaintStatuses } from '@/lib/statusMeta';
import type { ComplaintSummary } from '@/types/geo';

interface IndexProps {
    assignedComplaintsList?: ComplaintSummary[];
}

export default function Index({ assignedComplaintsList = [] }: IndexProps) {
    const perPage = 6;

    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [page, setPage] = useState(1);

    const counts = useMemo(
        () => ({
            assigned: assignedComplaintsList.filter((c) => c.status === 'assigned')
                .length,
            in_progress: assignedComplaintsList.filter(
                (c) => c.status === 'in_progress'
            ).length,
            resolved: assignedComplaintsList.filter((c) => c.status === 'resolved')
                .length,
            closed: assignedComplaintsList.filter((c) => c.status === 'closed')
                .length,
        }),
        [assignedComplaintsList]
    );

    const summary = useMemo(
        () =>
            `${formatNumber(assignedComplaintsList.length)} assigned · ${formatNumber(
                counts.assigned
            )} not started · ${formatNumber(
                counts.in_progress
            )} under investigation · ${formatNumber(
                counts.resolved + counts.closed
            )} resolved`,
        [assignedComplaintsList.length, counts]
    );

    const statusOptions: FilterOption[] = useMemo(
        () => [
            { value: 'all', label: 'All statuses' },
            ...complaintStatuses.map((value) => ({
                value,
                label: complaintStatusMeta[value].label,
            })),
        ],
        []
    );

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();

        return assignedComplaintsList.filter((complaint) => {
            if (status !== 'all' && complaint.status !== status) {
                return false;
            }

            if (term === '') {
                return true;
            }

            return (
                complaint.title.toLowerCase().includes(term) ||
                complaint.reference.toLowerCase().includes(term) ||
                complaint.barangay.toLowerCase().includes(term)
            );
        });
    }, [assignedComplaintsList, status, search]);

    const paged = useMemo(
        () => filtered.slice((page - 1) * perPage, page * perPage),
        [filtered, page, perPage]
    );

    useEffect(() => {
        setPage(1);
    }, [search, status]);

    const breadcrumbs = [
        { title: 'Dashboard', href: '/staff/dashboard' },
        { title: 'Assigned reports', href: '/staff/complaints' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Assigned reports" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <PageHeader
                    eyebrow="Field operations"
                    title="Assigned reports"
                    description="Your work queue. Open a report to review details, post updates and upload evidence."
                />

                <Card className="gap-3">
                    <CardHeader>
                        <CardTitle>Work queue</CardTitle>
                        <CardDescription>{summary}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <SearchInput
                                modelValue={search}
                                onUpdateModelValue={setSearch}
                                placeholder="Search by title, reference or barangay"
                                className="sm:max-w-sm"
                            />
                            <FilterSelect
                                modelValue={status}
                                onUpdateModelValue={setStatus}
                                options={statusOptions}
                                aria-label="Filter by status"
                            />
                        </div>

                        <ComplaintTable
                            complaints={paged}
                            linkPrefix="/staff/complaints"
                            emptyTitle="No assignments found"
                            emptyDescription="Clear the search box or pick another status. New assignments appear here as soon as an administrator dispatches them."
                        />

                        {filtered.length > perPage && (
                            <TablePagination
                                page={page}
                                perPage={perPage}
                                total={filtered.length}
                                onUpdatePage={setPage}
                            />
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
