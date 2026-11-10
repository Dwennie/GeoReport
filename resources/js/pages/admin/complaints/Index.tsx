import React, { useEffect, useMemo, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Check, X } from 'lucide-react';
import {
    ComplaintTable,
    ConfirmDialog,
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
import {
    complaintPriorityMeta,
    complaintStatusMeta,
    complaintStatuses,
} from '@/lib/statusMeta';
import { useTaxonomy } from '@/lib/taxonomy';
import type { ComplaintSummary } from '@/types/geo';

interface IndexProps {
    complaintsList?: ComplaintSummary[];
}

export default function Index({ complaintsList = [] }: IndexProps) {
    const perPage = 8;

    const initialStatus = (() => {
        if (typeof window === 'undefined') {
            return 'all';
        }
        const fromQuery = new URLSearchParams(window.location.search).get(
            'status'
        );
        return fromQuery &&
            (complaintStatuses as readonly string[]).includes(fromQuery)
            ? fromQuery
            : 'all';
    })();

    const [search, setSearch] = useState('');
    const [status, setStatus] = useState(initialStatus);
    const [category, setCategory] = useState('all');
    const [barangay, setBarangay] = useState('all');
    const [priority, setPriority] = useState('all');
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState<number[]>([]);
    const [bulkAction, setBulkAction] = useState<'approve' | 'reject' | null>(
        null
    );
    const [bulkProcessing, setBulkProcessing] = useState(false);

    const counts = useMemo(
        () => ({
            pending: complaintsList.filter((c) => c.status === 'pending').length,
            assigned: complaintsList.filter((c) => c.status === 'assigned').length,
            in_progress: complaintsList.filter((c) => c.status === 'in_progress')
                .length,
            resolved: complaintsList.filter((c) => c.status === 'resolved').length,
            closed: complaintsList.filter((c) => c.status === 'closed').length,
        }),
        [complaintsList]
    );

    const summary = useMemo(
        () =>
            `${formatNumber(complaintsList.length)} reports in registry · ${formatNumber(
                counts.pending
            )} awaiting review · ${formatNumber(
                counts.assigned + counts.in_progress
            )} in the field · ${formatNumber(
                counts.resolved + counts.closed
            )} resolved`,
        [complaintsList.length, counts]
    );

    const { categories: liveCategories, barangays: liveBarangays } =
        useTaxonomy();

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

    const barangayOptions = useMemo<FilterOption[]>(
        () => [
            { value: 'all', label: 'All barangays' },
            ...liveBarangays.map((item) => ({
                value: item.name,
                label: item.name,
            })),
        ],
        [liveBarangays]
    );

    const priorityOptions: FilterOption[] = useMemo(
        () => [
            { value: 'all', label: 'All priorities' },
            ...Object.entries(complaintPriorityMeta).map(([value, meta]) => ({
                value,
                label: meta.label,
            })),
        ],
        []
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

            if (barangay !== 'all' && complaint.barangay !== barangay) {
                return false;
            }

            if (priority !== 'all' && complaint.priority !== priority) {
                return false;
            }

            if (term === '') {
                return true;
            }

            return (
                complaint.title.toLowerCase().includes(term) ||
                complaint.reference.toLowerCase().includes(term) ||
                complaint.barangay.toLowerCase().includes(term) ||
                (complaint.reporterName &&
                    complaint.reporterName.toLowerCase().includes(term))
            );
        });
    }, [complaintsList, status, category, barangay, priority, search]);

    const paged = useMemo(
        () => filtered.slice((page - 1) * perPage, page * perPage),
        [filtered, page, perPage]
    );

    const bulkTarget = useMemo(
        () => complaintsList.filter((complaint) => selected.includes(complaint.id)),
        [complaintsList, selected]
    );

    const hasSelection = selected.length > 0;

    useEffect(() => {
        setPage(1);
        setSelected([]);
    }, [search, status, category, barangay, priority]);

    const applyBulk = () => {
        if (!bulkAction || selected.length === 0) {
            return;
        }

        const action = bulkAction;
        const ids = [...selected];
        setBulkProcessing(true);

        router.post(
            '/admin/complaints/bulk-status',
            { ids, action },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setBulkAction(null);
                    setSelected([]);
                },
                onFinish: () => {
                    setBulkProcessing(false);
                },
            }
        );
    };

    const breadcrumbs = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'All reports', href: '/admin/complaints' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="All reports" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <PageHeader
                    eyebrow="Administration"
                    title="All reports"
                    description="Every complaint filed across the municipality. Review valid reports, assign staff and keep the resolution workflow moving."
                />

                <Card className="gap-3">
                    <CardHeader>
                        <CardTitle>Report registry</CardTitle>
                        <CardDescription>{summary}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col gap-2 xl:flex-row xl:items-center">
                            <SearchInput
                                modelValue={search}
                                onUpdateModelValue={setSearch}
                                placeholder="Search by title, reference, reporter or barangay"
                                className="xl:max-w-sm"
                            />
                            <div className="grid grid-cols-2 gap-2 lg:flex lg:flex-wrap">
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
                                <FilterSelect
                                    modelValue={barangay}
                                    onUpdateModelValue={setBarangay}
                                    options={barangayOptions}
                                    aria-label="Filter by barangay"
                                />
                                <FilterSelect
                                    modelValue={priority}
                                    onUpdateModelValue={setPriority}
                                    options={priorityOptions}
                                    aria-label="Filter by priority"
                                />
                            </div>
                        </div>

                        {hasSelection && (
                            <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/40 px-3 py-2">
                                <p className="text-sm">
                                    {selected.length} selected
                                </p>
                                <div className="ml-auto flex items-center gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        disabled={bulkProcessing}
                                        onClick={() => setBulkAction('approve')}
                                    >
                                        <Check className="size-4" />
                                        Approve
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-destructive hover:text-destructive"
                                        disabled={bulkProcessing}
                                        onClick={() => setBulkAction('reject')}
                                    >
                                        <X className="size-4" />
                                        Reject
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        disabled={bulkProcessing}
                                        onClick={() => setSelected([])}
                                    >
                                        Clear
                                    </Button>
                                </div>
                            </div>
                        )}

                        <ComplaintTable
                            complaints={paged}
                            linkPrefix="/admin/complaints"
                            showReporter
                            showAssignee
                            selectable
                            selected={selected}
                            onSelectedChange={setSelected}
                            emptyTitle="No reports match these filters"
                            emptyDescription="Adjust your filters or clear the search to view records."
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

                <ConfirmDialog
                    open={bulkAction === 'approve'}
                    onOpenChange={(open) => setBulkAction(open ? 'approve' : null)}
                    title={`Approve ${bulkTarget.length} reports?`}
                    description="Approved reports become public on the community map and move to the assignment queue."
                    confirmLabel="Approve reports"
                    onConfirm={applyBulk}
                />

                <ConfirmDialog
                    open={bulkAction === 'reject'}
                    onOpenChange={(open) => setBulkAction(open ? 'reject' : null)}
                    title={`Reject ${bulkTarget.length} reports?`}
                    description="Rejected reports are hidden from the community map. The reporter is notified with the reason."
                    confirmLabel="Reject reports"
                    destructive
                    onConfirm={applyBulk}
                />
            </div>
        </AppLayout>
    );
}
