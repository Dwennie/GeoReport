import React, { useMemo, useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import {
    ComplaintTable,
    FilterSelect,
    PageHeader,
    SearchInput,
    TablePagination,
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
import AppLayout from '@/layouts/AppLayout';
import { formatNumber } from '@/lib/format';
import { complaintStatusMeta, complaintStatuses } from '@/lib/statusMeta';
import { useTaxonomy } from '@/lib/taxonomy';
import type { ComplaintSummary } from '@/types/geo';

interface IndexProps {
    complaintsList?: ComplaintSummary[];
}

export default function Index({ complaintsList = [] }: IndexProps) {
    const perPage = 5;

    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [category, setCategory] = useState('all');
    const [page, setPage] = useState(1);

    const counts = useMemo(
        () => ({
            pending: complaintsList.filter((r) => r.status === 'pending').length,
            assigned: complaintsList.filter((r) => r.status === 'assigned').length,
            in_progress: complaintsList.filter((r) => r.status === 'in_progress').length,
            resolved: complaintsList.filter((r) => r.status === 'resolved').length,
            closed: complaintsList.filter((r) => r.status === 'closed').length,
        }),
        [complaintsList]
    );

    const summary = useMemo(
        () =>
            `${formatNumber(complaintsList.length)} reports · ${formatNumber(
                counts.pending
            )} awaiting review · ${formatNumber(
                counts.assigned + counts.in_progress
            )} in progress · ${formatNumber(
                counts.resolved + counts.closed
            )} resolved`,
        [complaintsList.length, counts]
    );

    const { categories: liveCategories } = useTaxonomy();

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

    const categoryOptions = useMemo<FilterOption[]>(
        () => [
            { value: 'all', label: 'All categories' },
            ...liveCategories.map((item) => ({
                value: String(item.id),
                label: item.name,
            })),
        ],
        [liveCategories]
    );

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();

        return complaintsList.filter((complaint) => {
            if (status !== 'all' && complaint.status !== status) {
                return false;
            }

            if (category !== 'all' && String(complaint.categoryId) !== category) {
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
    }, [complaintsList, status, category, search]);

    const paged = useMemo(
        () => filtered.slice((page - 1) * perPage, page * perPage),
        [filtered, page, perPage]
    );

    useEffect(() => {
        setPage(1);
    }, [search, status, category]);

    const breadcrumbs = [
        { title: 'Dashboard', href: '/citizen/dashboard' },
        { title: 'My reports', href: '/citizen/complaints' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My reports" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <PageHeader
                    eyebrow="Community"
                    title="My reports"
                    description="Every concern you submitted, with its current status and assigned staff."
                    actions={
                        <Button asChild>
                            <Link href="/citizen/complaints/create">
                                <Plus className="size-4" />
                                Report a concern
                            </Link>
                        </Button>
                    }
                />

                <Card className="gap-3">
                    <CardHeader>
                        <CardTitle>Report history</CardTitle>
                        <CardDescription>{summary}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
                            <SearchInput
                                modelValue={search}
                                onUpdateModelValue={setSearch}
                                placeholder="Search by title, reference or barangay"
                                className="lg:max-w-sm"
                            />
                            <div className="flex flex-col gap-2 sm:flex-row">
                                <FilterSelect
                                    modelValue={status}
                                    onUpdateModelValue={setStatus}
                                    options={statusOptions}
                                    aria-label="Filter by status"
                                />
                                <FilterSelect
                                    modelValue={category}
                                    onUpdateModelValue={setCategory}
                                    options={categoryOptions}
                                    aria-label="Filter by category"
                                />
                            </div>
                        </div>

                        <ComplaintTable
                            complaints={paged}
                            linkPrefix="/citizen/complaints"
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
