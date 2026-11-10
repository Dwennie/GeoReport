import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
    title: string;
    description?: string;
    icon?: LucideIcon;
    children?: React.ReactNode;
}

export default function EmptyState({
    title,
    description,
    icon: Icon,
    children,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-12 text-center">
            {Icon && (
                <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Icon className="size-5" />
                </div>
            )}
            <div className="space-y-1">
                <p className="text-sm font-medium">{title}</p>
                {description && (
                    <p className="mx-auto max-w-sm text-sm text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>
            {children && <div className="mt-1">{children}</div>}
        </div>
    );
}
