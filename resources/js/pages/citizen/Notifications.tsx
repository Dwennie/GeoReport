import React, { useEffect, useMemo, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Bell, Check } from 'lucide-react';
import { EmptyState, PageHeader } from '@/components/geo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import AppLayout from '@/layouts/AppLayout';
import { formatRelative } from '@/lib/format';

interface NotificationItem {
    id: string;
    title: string;
    body: string;
    complaintReference?: string;
    complaintId?: number;
    read: boolean;
    createdAt: string;
}

interface NotificationsProps {
    notificationsList?: NotificationItem[];
}

export default function Notifications({
    notificationsList = [],
}: NotificationsProps) {
    const [items, setItems] = useState<NotificationItem[]>(() =>
        notificationsList.map((notification) => ({ ...notification }))
    );

    useEffect(() => {
        setItems(notificationsList.map((notification) => ({ ...notification })));
    }, [notificationsList]);

    const unreadCount = useMemo(
        () => items.filter((item) => !item.read).length,
        [items]
    );

    const entries = useMemo(
        () =>
            items.map((item) => ({
                ...item,
                href: item.complaintId
                    ? `/citizen/complaints/${item.complaintId}`
                    : null,
            })),
        [items]
    );

    const markAllRead = () => {
        const unreadIds = items.filter((item) => !item.read).map((item) => item.id);
        if (unreadIds.length === 0) {
            return;
        }

        setItems((prev) => prev.map((item) => ({ ...item, read: true })));
        router.post(
            '/citizen/notifications/read',
            { ids: unreadIds },
            { preserveScroll: true }
        );
    };

    const markRead = (id: string) => {
        setItems((prev) =>
            prev.map((item) => (item.id === id ? { ...item, read: true } : item))
        );
        router.post(
            '/citizen/notifications/read',
            { ids: [id] },
            { preserveScroll: true }
        );
    };

    const breadcrumbs = [
        { title: 'Dashboard', href: '/citizen/dashboard' },
        { title: 'Notifications', href: '/citizen/notifications' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notifications" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <PageHeader
                    eyebrow="Community"
                    title="Notifications"
                    description={`${unreadCount} unread of ${entries.length} updates on your reports.`}
                    actions={
                        <Button
                            variant="outline"
                            disabled={unreadCount === 0}
                            onClick={markAllRead}
                        >
                            <Check className="size-4" />
                            Mark all as read
                        </Button>
                    }
                />

                {entries.length === 0 ? (
                    <EmptyState
                        title="Nothing to catch up on"
                        description="Updates about your reports will appear here as municipal staff review and resolve them."
                        icon={Bell}
                    />
                ) : (
                    <Card className="gap-0 py-0">
                        <ul className="divide-y">
                            {entries.map((entry) => (
                                <li
                                    key={entry.id}
                                    className="flex gap-3 px-4 py-4"
                                >
                                    <span
                                        className={`mt-1.5 size-2 shrink-0 rounded-full ${
                                            entry.read
                                                ? 'bg-transparent ring-1 ring-border'
                                                : 'bg-primary'
                                        }`}
                                    />

                                    <div className="min-w-0 flex-1 space-y-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="text-sm font-medium">
                                                {entry.title}
                                            </p>
                                            {!entry.read && (
                                                <Badge variant="secondary">
                                                    Unread
                                                </Badge>
                                            )}
                                        </div>

                                        <p className="text-sm text-muted-foreground">
                                            {entry.body}
                                        </p>

                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                            <span>
                                                {formatRelative(entry.createdAt)}
                                            </span>

                                            {entry.href && (
                                                <Link
                                                    href={entry.href}
                                                    className="underline-offset-4 hover:text-foreground hover:underline"
                                                >
                                                    View {entry.complaintReference}
                                                </Link>
                                            )}

                                            {!entry.read && (
                                                <button
                                                    type="button"
                                                    className="underline-offset-4 hover:text-foreground hover:underline"
                                                    onClick={() => markRead(entry.id)}
                                                >
                                                    Mark as read
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
