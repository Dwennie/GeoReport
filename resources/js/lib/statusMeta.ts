import type { ComplaintPriority, ComplaintStatus, GeoRole } from '@/types/geo';

type StatusMeta = {
    label: string;
    /** Badge classes: soft tint, readable in light and dark. */
    badge: string;
    /** Solid dot colour for timelines and legends. */
    dot: string;
    /** Hex colour for inline styles such as map markers. */
    pin: string;
    /** Position in the review lifecycle, used by the status rail. */
    step: number;
};

export const complaintStatusMeta: Record<ComplaintStatus, StatusMeta> = {
    pending: {
        label: 'Pending review',
        badge: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
        dot: 'bg-amber-500',
        pin: '#f59e0b',
        step: 1,
    },
    approved: {
        label: 'Approved',
        badge: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300',
        dot: 'bg-blue-500',
        pin: '#3b82f6',
        step: 2,
    },
    assigned: {
        label: 'Assigned',
        badge: 'border-indigo-200 bg-indigo-50 text-indigo-800 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300',
        dot: 'bg-indigo-500',
        pin: '#6366f1',
        step: 3,
    },
    in_progress: {
        label: 'Under investigation',
        badge: 'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300',
        dot: 'bg-sky-500',
        pin: '#0ea5e9',
        step: 4,
    },
    resolved: {
        label: 'Resolved',
        badge: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
        dot: 'bg-emerald-500',
        pin: '#10b981',
        step: 5,
    },
    closed: {
        label: 'Closed',
        badge: 'border-zinc-200 bg-zinc-100 text-zinc-700 dark:border-zinc-500/30 dark:bg-zinc-500/10 dark:text-zinc-300',
        dot: 'bg-zinc-400',
        pin: '#a1a1aa',
        step: 6,
    },
    rejected: {
        label: 'Rejected',
        badge: 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300',
        dot: 'bg-rose-500',
        pin: '#f43f5e',
        step: 0,
    },
};

export const complaintPriorityMeta: Record<
    ComplaintPriority,
    { label: string; badge: string; dot: string }
> = {
    low: {
        label: 'Low',
        badge: 'border-zinc-200 bg-transparent text-zinc-600 dark:border-zinc-700 dark:text-zinc-400',
        dot: 'bg-zinc-400',
    },
    medium: {
        label: 'Medium',
        badge: 'border-blue-200 bg-transparent text-blue-700 dark:border-blue-500/40 dark:text-blue-300',
        dot: 'bg-blue-500',
    },
    high: {
        label: 'High',
        badge: 'border-amber-300 bg-transparent text-amber-800 dark:border-amber-500/40 dark:text-amber-300',
        dot: 'bg-amber-500',
    },
    urgent: {
        label: 'Urgent',
        badge: 'border-rose-300 bg-transparent text-rose-700 dark:border-rose-500/40 dark:text-rose-300',
        dot: 'bg-rose-500',
    },
};

export const roleMeta: Record<GeoRole, { label: string; badge: string }> = {
    administrator: {
        label: 'Administrator',
        badge: 'border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300',
    },
    staff: {
        label: 'Staff',
        badge: 'border-teal-200 bg-teal-50 text-teal-800 dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-300',
    },
    citizen: {
        label: 'Citizen',
        badge: 'border-zinc-200 bg-zinc-100 text-zinc-700 dark:border-zinc-500/30 dark:bg-zinc-500/10 dark:text-zinc-300',
    },
};

/** Ordered lifecycle used by the status rail and progress indicators. */
export const complaintLifecycle: ComplaintStatus[] = [
    'pending',
    'approved',
    'assigned',
    'in_progress',
    'resolved',
    'closed',
];

/** Complete list of complaint statuses for filter dropdowns. */
export const complaintStatuses: ComplaintStatus[] = [
    'pending',
    'approved',
    'assigned',
    'in_progress',
    'resolved',
    'closed',
    'rejected',
];
