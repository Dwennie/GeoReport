import { computed } from 'vue';
import { usePage } from '@inertiajs/vue3';
import type { SharedBarangayItem, SharedCategoryItem } from '@/types/geo';

export function useTaxonomy() {
    const page = usePage();

    const categories = computed<SharedCategoryItem[]>(
        () => page.props.taxonomy?.categories ?? [],
    );

    const activeCategories = computed<SharedCategoryItem[]>(() =>
        categories.value.filter((category) => category.isActive),
    );

    const barangays = computed<SharedBarangayItem[]>(
        () => page.props.taxonomy?.barangays ?? [],
    );

    function findCategoryById(
        id: number | string | null | undefined,
    ): SharedCategoryItem | undefined {
        if (id === null || id === undefined || id === '') {
            return undefined;
        }

        return categories.value.find(
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
