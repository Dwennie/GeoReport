import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatNumber } from '@/lib/format';

interface TablePaginationProps {
    page: number;
    perPage: number;
    total: number;
    onPageChange?: (page: number) => void;
    onUpdatePage?: (page: number) => void;
}

export default function TablePagination({
    page,
    perPage,
    total,
    onPageChange,
    onUpdatePage,
}: TablePaginationProps) {
    const pageCount = Math.max(Math.ceil(total / perPage), 1);
    const firstRow = total === 0 ? 0 : (page - 1) * perPage + 1;
    const lastRow = Math.min(page * perPage, total);

    const changePage = (newPage: number) => {
        onPageChange?.(newPage);
        onUpdatePage?.(newPage);
    };

    return (
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-xs text-muted-foreground tabular-nums">
                Showing {formatNumber(firstRow)}–{formatNumber(lastRow)} of{' '}
                {formatNumber(total)}
            </p>

            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => changePage(page - 1)}
                >
                    <ChevronLeft className="size-4" />
                    Previous
                </Button>
                <span className="px-1 text-xs text-muted-foreground tabular-nums">
                    Page {page} of {pageCount}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= pageCount}
                    onClick={() => changePage(page + 1)}
                >
                    Next
                    <ChevronRight className="size-4" />
                </Button>
            </div>
        </div>
    );
}
