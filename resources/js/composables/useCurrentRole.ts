import { computed } from 'vue';
import { usePage } from '@inertiajs/vue3';
import type { GeoRole } from '@/types/geo';

/**
 * Resolves the authenticated user's role strictly from the active database session.
 */
export function useCurrentRole() {
    const page = usePage();

    const role = computed<GeoRole>(() => {
        const authRole = page.props.auth?.user?.role;

        if (
            authRole === 'administrator' ||
            authRole === 'staff' ||
            authRole === 'citizen'
        ) {
            return authRole;
        }

        return 'citizen';
    });

    return { role };
}
