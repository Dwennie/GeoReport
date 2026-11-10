import React from 'react';
import { Badge } from '@/components/ui/badge';
import { complaintPriorityMeta } from '@/lib/statusMeta';
import { cn } from '@/lib/utils';
import type { ComplaintPriority } from '@/types/geo';

interface PriorityBadgeProps {
    priority: ComplaintPriority;
    className?: string;
}

export default function PriorityBadge({ priority, className }: PriorityBadgeProps) {
    const meta = complaintPriorityMeta[priority] ?? {
        label: priority,
        badge: 'border-border text-foreground',
    };

    return (
        <Badge variant="outline" className={cn(meta.badge, className)}>
            {meta.label}
        </Badge>
    );
}
