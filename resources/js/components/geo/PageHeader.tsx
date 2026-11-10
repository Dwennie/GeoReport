import React from 'react';

interface PageHeaderProps {
    title: string;
    description?: string;
    eyebrow?: string;
    actions?: React.ReactNode;
    children?: React.ReactNode;
}

export default function PageHeader({
    title,
    description,
    eyebrow,
    actions,
    children,
}: PageHeaderProps) {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
                {eyebrow && (
                    <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        {eyebrow}
                    </p>
                )}
                <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    {title}
                </h1>
                {description && (
                    <p className="max-w-2xl text-sm text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>
            {(actions || children) && (
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                    {actions || children}
                </div>
            )}
        </div>
    );
}
