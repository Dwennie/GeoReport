import React from 'react';
import { Badge } from '@/components/ui/badge';
import { complaintStatusMeta } from '@/lib/statusMeta';
import { cn } from '@/lib/utils';
import type { ComplaintStatus } from '@/types/geo';

interface StatusBadgeProps {
    status: ComplaintStatus;
    dot?: boolean;
    className?: string;
}

export default function StatusBadge({ status, dot = true, className }: StatusBadgeProps) {
    const meta = complaintStatusMeta[status] ?? {
        label: status,
        badge: 'border-border text-foreground',
        dot: 'bg-muted-foreground',
    };

    return (
        <Badge variant="outline" className={cn(meta.badge, 'gap-1.5', className)}>
            {dot && (
                <span
                    className={cn('size-1.5 shrink-0 rounded-full', meta.dot)}
                />
            )}
            {meta.label}
        </Badge>
    );
}
