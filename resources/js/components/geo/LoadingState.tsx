import React from 'react';

interface LoadingStateProps {
    variant?: 'table' | 'cards' | 'list';
    rows?: number;
}

export default function LoadingState({
    variant = 'table',
    rows = 5,
}: LoadingStateProps) {
    const items = Array.from({ length: rows }, (_, i) => i);

    if (variant === 'cards') {
        return (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {items.map((i) => (
                    <div
                        key={i}
                        className="h-[104px] w-full animate-pulse rounded-xl bg-muted"
                    />
                ))}
            </div>
        );
    }

    if (variant === 'list') {
        return (
            <div className="space-y-3">
                {items.map((i) => (
                    <div
                        key={i}
                        className="h-16 w-full animate-pulse rounded-lg bg-muted"
                    />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <div className="h-9 w-full animate-pulse rounded-md bg-muted" />
            {items.map((i) => (
                <div
                    key={i}
                    className="h-11 w-full animate-pulse rounded-md bg-muted"
                />
            ))}
        </div>
    );
}
