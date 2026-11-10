import {
    Bell,
    ClipboardList,
    FileText,
    History,
    Inbox,
    LayoutGrid,
    Map,
    MapPin,
    Plus,
    Settings,
    Tags,
    TrendingUp,
    UserCheck,
    Users,
} from 'lucide-react';
import type { NavItem } from '@/types';
import type { GeoRole } from '@/types/geo';

export type NavGroup = {
    label: string;
    items: NavItem[];
};

/** Label for the area a role works in, used in the sidebar header. */
export const roleWorkspace: Record<GeoRole, string> = {
    administrator: 'Administration',
    staff: 'Field operations',
    citizen: 'Community',
};

export const roleHome: Record<GeoRole, string> = {
    citizen: '/citizen/dashboard',
    staff: '/staff/dashboard',
    administrator: '/admin/dashboard',
};

export const navigation: Record<GeoRole, NavGroup[]> = {
    citizen: [
        {
            label: 'Community',
            items: [
                {
                    title: 'Dashboard',
                    href: '/citizen/dashboard',
                    icon: LayoutGrid,
                },
                {
                    title: 'Report a concern',
                    href: '/citizen/complaints/create',
                    icon: Plus,
                },
                {
                    title: 'My reports',
                    href: '/citizen/complaints',
                    icon: Inbox,
                },
                {
                    title: 'Community map',
                    href: '/citizen/map',
                    icon: Map,
                },
                {
                    title: 'Notifications',
                    href: '/citizen/notifications',
                    icon: Bell,
                },
            ],
        },
    ],

    staff: [
        {
            label: 'Field operations',
            items: [
                {
                    title: 'Dashboard',
                    href: '/staff/dashboard',
                    icon: LayoutGrid,
                },
                {
                    title: 'Assigned reports',
                    href: '/staff/complaints',
                    icon: ClipboardList,
                },
                {
                    title: 'Field map',
                    href: '/staff/map',
                    icon: Map,
                },
                {
                    title: 'History',
                    href: '/staff/history',
                    icon: History,
                },
            ],
        },
        {
            label: 'Account',
            items: [
                {
                    title: 'Profile',
                    href: '/settings/profile',
                    icon: Settings,
                },
            ],
        },
    ],

    administrator: [
        {
            label: 'Administration',
            items: [
                {
                    title: 'Dashboard',
                    href: '/admin/dashboard',
                    icon: LayoutGrid,
                },
                {
                    title: 'All reports',
                    href: '/admin/complaints',
                    icon: FileText,
                },
                {
                    title: 'GIS map',
                    href: '/admin/map',
                    icon: Map,
                },
                {
                    title: 'Assignments',
                    href: '/admin/assignments',
                    icon: UserCheck,
                },
            ],
        },
        {
            label: 'Configuration',
            items: [
                {
                    title: 'Categories',
                    href: '/admin/categories',
                    icon: Tags,
                },
                {
                    title: 'Barangays',
                    href: '/admin/barangays',
                    icon: MapPin,
                },
                {
                    title: 'Users',
                    href: '/admin/users',
                    icon: Users,
                },
                {
                    title: 'Analytics',
                    href: '/admin/analytics',
                    icon: TrendingUp,
                },
                {
                    title: 'Settings',
                    href: '/admin/settings',
                    icon: Settings,
                },
            ],
        },
    ],
};
