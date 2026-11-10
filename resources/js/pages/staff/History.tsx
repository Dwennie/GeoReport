import React, { useEffect, useMemo, useState } from 'react';
import { Head } from '@inertiajs/react';
import { Check } from 'lucide-react';
import {
    ComplaintTable,
    EmptyState,
    PageHeader,
    SearchInput,
    StatCard,
    TablePagination,
} from '@/components/geo';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/AppLayout';
import { formatNumber } from '@/lib/format';
import type { ComplaintSummary } from '@/types/geo';

interface HistoryProps {
    resolvedComplaintsList?: ComplaintSummary[];
}

export default function History({
    resolvedComplaintsList = [],
}: HistoryProps) {
    const perPage = 8;

    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();

        if (term === '') {
            return resolvedComplaintsList;
        }

        return resolvedComplaintsList.filter(
            (complaint) =>
                complaint.title.toLowerCase().includes(term) ||
                complaint.reference.toLowerCase().includes(term) ||
                complaint.barangay.toLowerCase().includes(term)
        );
    }, [resolvedComplaintsList, search]);

    const paged = useMemo(
        () => filtered.slice((page - 1) * perPage, page * perPage),
        [filtered, page, perPage]
    );

    useEffect(() => {
        setPage(1);
    }, [search]);

    const breadcrumbs = [
        { title: 'Dashboard', href: '/staff/dashboard' },
        { title: 'History', href: '/staff/history' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="History" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <PageHeader
                    eyebrow="Field operations"
                    title="History"
                    description="Cases you completed, kept for reference and audits."
                />

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        label="Completed cases"
                        value={formatNumber(resolvedComplaintsList.length)}
                        hint="Assigned cases resolved"
                        icon={Check}
                    />
                </div>

                <Card className="gap-3">
                    <CardHeader>
                        <CardTitle>Resolved and closed</CardTitle>
                        <CardDescription>
                            {formatNumber(filtered.length)} cases match the current
                            search.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <SearchInput
                            modelValue={search}
                            onUpdateModelValue={setSearch}
                            placeholder="Search completed cases"
                            className="sm:max-w-sm"
                        />

                        {filtered.length > 0 ? (
                            <ComplaintTable
                                complaints={paged}
                                linkPrefix="/staff/complaints"
                                emptyTitle="Nothing completed yet"
                                emptyDescription="Cases you resolve appear here with their evidence."
                            />
                        ) : (
                            <EmptyState
                                title="No completed cases yet"
                                description="Resolved investigations and closed complaints will be archived here automatically."
                                icon={Check}
                            />
                        )}

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
