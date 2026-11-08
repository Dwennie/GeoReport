<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Head, Link, router } from '@inertiajs/vue3';
import { Bell, Check } from '@lucide/vue';
import { EmptyState, PageHeader } from '@/components/geo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatRelative } from '@/lib/format';

type NotificationItem = {
    id: string;
    title: string;
    body: string;
    complaintReference?: string;
    complaintId?: number;
    read: boolean;
    createdAt: string;
};

const props = withDefaults(
    defineProps<{
        notificationsList?: NotificationItem[];
    }>(),
    {
        notificationsList: () => [],
    },
);

defineOptions({
    layout: {
        breadcrumbs: [
            { title: 'Dashboard', href: '/citizen/dashboard' },
            { title: 'Notifications', href: '/citizen/notifications' },
        ],
    },
});

const items = ref<NotificationItem[]>(
    props.notificationsList.map((notification) => ({ ...notification })),
);

watch(
    () => props.notificationsList,
    (list) => {
        items.value = list.map((notification) => ({ ...notification }));
    },
);

const unreadCount = computed(
    () => items.value.filter((item) => !item.read).length,
);

const entries = computed(() =>
    items.value.map((item) => ({
        ...item,
        href: item.complaintId
            ? `/citizen/complaints/${item.complaintId}`
            : null,
    })),
);

function markAllRead(): void {
    const unreadIds = items.value
        .filter((item) => !item.read)
        .map((item) => item.id);
    if (unreadIds.length === 0) {
        return;
    }

    items.value = items.value.map((item) => ({ ...item, read: true }));
    router.post(
        '/citizen/notifications/read',
        { ids: unreadIds },
        { preserveScroll: true },
    );
}

function markRead(id: string): void {
    items.value = items.value.map((item) =>
        item.id === id ? { ...item, read: true } : item,
    );
    router.post(
        '/citizen/notifications/read',
        { ids: [id] },
        { preserveScroll: true },
    );
}
</script>

<template>
    <Head title="Notifications" />

    <div class="flex h-full flex-1 flex-col gap-4 p-4">
        <PageHeader
            eyebrow="Community"
            title="Notifications"
            :description="`${unreadCount} unread of ${entries.length} updates on your reports.`"
        >
            <template #actions>
                <Button
                    variant="outline"
                    :disabled="unreadCount === 0"
                    @click="markAllRead"
                >
                    <Check class="size-4" />
                    Mark all as read
                </Button>
            </template>
        </PageHeader>

        <EmptyState
            v-if="entries.length === 0"
            title="Nothing to catch up on"
            description="Updates about your reports will appear here as municipal staff review and resolve them."
            :icon="Bell"
        />

        <Card v-else class="gap-0 py-0">
            <ul class="divide-y">
                <li
                    v-for="entry in entries"
                    :key="entry.id"
                    class="flex gap-3 px-4 py-4"
                >
                    <span
                        class="mt-1.5 size-2 shrink-0 rounded-full"
                        :class="
                            entry.read
                                ? 'bg-transparent ring-1 ring-border'
                                : 'bg-primary'
                        "
                    />

                    <div class="min-w-0 flex-1 space-y-1">
                        <div class="flex flex-wrap items-center gap-2">
                            <p class="text-sm font-medium">{{ entry.title }}</p>
                            <Badge v-if="!entry.read" variant="secondary">
                                Unread
                            </Badge>
                        </div>

                        <p class="text-sm text-muted-foreground">
                            {{ entry.body }}
                        </p>

                        <div
                            class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground"
                        >
                            <span>{{ formatRelative(entry.createdAt) }}</span>

                            <Link
                                v-if="entry.href"
                                :href="entry.href"
                                class="underline-offset-4 hover:text-foreground hover:underline"
                            >
                                View {{ entry.complaintReference }}
                            </Link>

                            <button
                                v-if="!entry.read"
                                type="button"
                                class="underline-offset-4 hover:text-foreground hover:underline"
                                @click="markRead(entry.id)"
                            >
                                Mark as read
                            </button>
                        </div>
                    </div>
                </li>
            </ul>
        </Card>
    </div>
</template>
