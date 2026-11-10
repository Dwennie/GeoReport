import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useTaxonomy } from '@/lib/taxonomy';

interface CategoryBadgeProps {
    categoryId: number;
    category?: {
        name: string;
        color: string;
    } | null;
}

export default function CategoryBadge({ categoryId, category }: CategoryBadgeProps) {
    const { findCategoryById } = useTaxonomy();
    const resolvedCategory = category ?? findCategoryById(categoryId);

    return (
        <Badge
            variant="outline"
            className="border-border/70 font-normal text-muted-foreground gap-1.5"
        >
            <span
                className="size-2 shrink-0 rounded-full"
                style={{
                    backgroundColor: resolvedCategory?.color ?? 'currentColor',
                }}
            />
            {resolvedCategory?.name ?? 'Uncategorized'}
        </Badge>
    );
}
