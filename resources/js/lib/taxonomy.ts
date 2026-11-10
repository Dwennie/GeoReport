import { useMemo } from 'react';
import { usePage } from '@inertiajs/react';
import type { SharedBarangayItem, SharedCategoryItem } from '@/types/geo';

export function useTaxonomy() {
    const page = usePage<{
        taxonomy?: {
            categories?: SharedCategoryItem[];
            barangays?: SharedBarangayItem[];
        };
    }>();

    const categories = useMemo<SharedCategoryItem[]>(
        () => page.props.taxonomy?.categories ?? [],
        [page.props.taxonomy?.categories],
    );

    const activeCategories = useMemo<SharedCategoryItem[]>(
        () => categories.filter((category) => category.isActive),
        [categories],
    );

    const barangays = useMemo<SharedBarangayItem[]>(
        () => page.props.taxonomy?.barangays ?? [],
        [page.props.taxonomy?.barangays],
    );

    function findCategoryById(
        id: number | string | null | undefined,
    ): SharedCategoryItem | undefined {
        if (id === null || id === undefined || id === '') {
            return undefined;
        }

        return categories.find(
            (category) => String(category.id) === String(id),
        );
    }

    return {
        categories,
        activeCategories,
        barangays,
        findCategoryById,
    };
}
