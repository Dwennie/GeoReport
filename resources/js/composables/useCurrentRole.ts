import { useMemo } from 'react';
import { usePage } from '@inertiajs/react';
import type { GeoRole } from '@/types/geo';
import type { User } from '@/types/auth';

/**
 * Resolves the authenticated user's role strictly from the active database session.
 */
export function useCurrentRole() {
    const page = usePage<{ auth?: { user?: User } }>();

    const role = useMemo<GeoRole>(() => {
        const authRole = page.props.auth?.user?.role;

        if (
            authRole === 'administrator' ||
            authRole === 'staff' ||
            authRole === 'citizen'
        ) {
            return authRole;
        }

        return 'citizen';
    }, [page.props.auth?.user?.role]);

    return { role };
}
