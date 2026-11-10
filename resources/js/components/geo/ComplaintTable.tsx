import React from 'react';
import { Link } from '@inertiajs/react';
import { Inbox } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import CategoryBadge from './CategoryBadge';
import EmptyState from './EmptyState';
import PriorityBadge from './PriorityBadge';
import StatusBadge from './StatusBadge';
import type { Complaint, ComplaintSummary } from '@/types/geo';

interface ComplaintTableProps {
    complaints: Array<Complaint | ComplaintSummary>;
    linkPrefix: string;
    showReporter?: boolean;
    showAssignee?: boolean;
    selectable?: boolean;
    selected?: number[];
    onSelectedChange?: (selected: number[]) => void;
    emptyTitle?: string;
    emptyDescription?: string;
    rowActions?: (complaint: Complaint | ComplaintSummary) => React.ReactNode;
}

export default function ComplaintTable({
    complaints,
    linkPrefix,
    showReporter = false,
    showAssignee = false,
    selectable = false,
    selected = [],
    onSelectedChange,
    emptyTitle = 'No reports match these filters',
    emptyDescription = 'Clear the search box or pick a different status to see more reports.',
    rowActions,
}: ComplaintTableProps) {
    const allSelected =
        complaints.length > 0 && selected.length === complaints.length;

    function isSelected(id: number): boolean {
        return selected.includes(id);
    }

    function toggle(id: number) {
        if (!onSelectedChange) return;
        onSelectedChange(
            isSelected(id)
                ? selected.filter((v) => v !== id)
                : [...selected, id]
        );
    }

    function toggleAll() {
        if (!onSelectedChange) return;
        onSelectedChange(
            allSelected ? [] : complaints.map((complaint) => complaint.id)
        );
    }

    function detailLink(complaint: Complaint | ComplaintSummary): string {
        return `${linkPrefix}/${complaint.id}`;
    }

    if (complaints.length === 0) {
        return (
            <EmptyState
                title={emptyTitle}
                description={emptyDescription}
                icon={Inbox}
            />
        );
    }

    return (
        <div>
            {selectable && (
                <div className="mb-1 flex items-center gap-2.5 border-b pb-2.5 lg:hidden">
                    <Checkbox
                        checked={allSelected}
                        aria-label="Select all reports"
                        onCheckedChange={toggleAll}
                    />
                    <span className="text-xs font-medium text-muted-foreground">
                        Select all ({complaints.length})
                    </span>
                </div>
            )}

            {/* Mobile Stacked Cards */}
            <ul className="divide-y lg:hidden">
                {complaints.map((complaint) => (
                    <li
                        key={complaint.id}
                        className={cn(
                            'flex items-start gap-3 py-3 last:pb-0',
                            !selectable && 'first:pt-0'
                        )}
                    >
                        {selectable && (
                            <Checkbox
                                className="mt-0.5 shrink-0"
                                checked={isSelected(complaint.id)}
                                aria-label={`Select ${complaint.reference}`}
                                onCheckedChange={() => toggle(complaint.id)}
                            />
                        )}
                        <Link
                            href={detailLink(complaint)}
                            className="block min-w-0 flex-1 space-y-2"
                        >
                            <div className="flex items-center justify-between gap-2">
                                <span className="min-w-0 truncate font-mono text-xs text-muted-foreground">
                                    {complaint.reference}
                                </span>
                                <StatusBadge
                                    status={complaint.status}
                                    className="shrink-0"
                                />
                            </div>
                            <p className="text-sm leading-snug font-medium break-words">
                                {complaint.title}
                            </p>
                            <div className="flex flex-wrap items-center gap-2">
                                <CategoryBadge
                                    categoryId={complaint.categoryId}
                                    category={complaint.category}
                                />
                                <PriorityBadge priority={complaint.priority} />
                            </div>
                            <p className="text-xs break-words text-muted-foreground">
                                {complaint.barangay} ·{' '}
                                {formatDate(complaint.submittedAt)}
                                {showReporter &&
                                    'reporterName' in complaint &&
                                    (complaint as Complaint).reporterName &&
                                    ` · ${(complaint as Complaint).reporterName}`}
                            </p>
                        </Link>
                        {rowActions && (
                            <div className="shrink-0 self-center">
                                {rowActions(complaint)}
                            </div>
                        )}
                    </li>
                ))}
            </ul>

            {/* Desktop Table */}
            <div className="hidden lg:block">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {selectable && (
                                <TableHead className="w-10">
                                    <Checkbox
                                        checked={allSelected}
                                        aria-label="Select all reports"
                                        onCheckedChange={toggleAll}
                                    />
                                </TableHead>
                            )}
                            <TableHead>Reference</TableHead>
                            <TableHead>Concern</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Priority</TableHead>
                            {showReporter && <TableHead>Reported by</TableHead>}
                            {showAssignee && <TableHead>Assigned to</TableHead>}
                            <TableHead>Submitted</TableHead>
                            {rowActions && (
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            )}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {complaints.map((complaint) => (
                            <TableRow key={complaint.id}>
                                {selectable && (
                                    <TableCell>
                                        <Checkbox
                                            checked={isSelected(complaint.id)}
                                            aria-label={`Select ${complaint.reference}`}
                                            onCheckedChange={() =>
                                                toggle(complaint.id)
                                            }
                                        />
                                    </TableCell>
                                )}
                                <TableCell>
                                    <Link
                                        href={detailLink(complaint)}
                                        className="font-mono text-xs hover:underline"
                                    >
                                        {complaint.reference}
                                    </Link>
                                </TableCell>
                                <TableCell className="max-w-[320px] whitespace-normal">
                                    <Link
                                        href={detailLink(complaint)}
                                        className="font-medium hover:underline"
                                    >
                                        {complaint.title}
                                    </Link>
                                </TableCell>
                                <TableCell>
                                    <CategoryBadge
                                        categoryId={complaint.categoryId}
                                        category={complaint.category}
                                    />
                                </TableCell>
                                <TableCell>
                                    <StatusBadge status={complaint.status} />
                                </TableCell>
                                <TableCell>
                                    <PriorityBadge
                                        priority={complaint.priority}
                                    />
                                </TableCell>
                                {showReporter && (
                                    <TableCell className="text-muted-foreground">
                                        {'reporterName' in complaint
                                            ? (complaint as Complaint)
                                                  .reporterName
                                            : 'Resident'}
                                    </TableCell>
                                )}
                                {showAssignee && (
                                    <TableCell className="text-muted-foreground">
                                        {complaint.assignedTo?.name ??
                                            'Unassigned'}
                                    </TableCell>
                                )}
                                <TableCell className="text-muted-foreground">
                                    {formatDate(complaint.submittedAt)}
                                </TableCell>
                                {rowActions && (
                                    <TableCell className="text-right">
                                        {rowActions(complaint)}
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
