import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
    label: string;
    value: string | number;
    hint?: string;
    icon?: LucideIcon;
    accent?: string;
    className?: string;
}

export default function StatCard({
    label,
    value,
    hint,
    icon: Icon,
    accent,
    className,
}: StatCardProps) {
    return (
        <Card className={cn('gap-0 py-4', className)}>
            <CardContent className="px-4">
                <div className="flex items-start justify-between gap-3">
                    <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        {label}
                    </p>
                    {Icon && (
                        <Icon className="size-4 shrink-0 text-muted-foreground/50" />
                    )}
                </div>
                <p className={cn('mt-2 text-2xl font-semibold tabular-nums', accent)}>
                    {value}
                </p>
                {hint && (
                    <p className="mt-1 text-xs text-muted-foreground">
                        {hint}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
