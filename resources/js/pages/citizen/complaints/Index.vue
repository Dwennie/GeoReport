<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Head, Link } from '@inertiajs/vue3';
import { Plus } from '@lucide/vue';
import {
    ComplaintTable,
    FilterSelect,
    PageHeader,
    SearchInput,
    TablePagination,
} from '@/components/geo';
import type { FilterOption } from '@/components/geo';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { formatNumber } from '@/lib/format';
import { complaintStatusMeta, complaintStatuses } from '@/lib/statusMeta';
import { useTaxonomy } from '@/lib/taxonomy';

import type { ComplaintSummary } from '@/types/geo';

const props = defineProps<{
    complaintsList?: ComplaintSummary[];
}>();

defineOptions({
    layout: {
        breadcrumbs: [
            { title: 'Dashboard', href: '/citizen/dashboard' },
            { title: 'My reports', href: '/citizen/complaints' },
        ],
    },
});

const perPage = 5;

const search = ref('');
const status = ref('all');
const category = ref('all');
const page = ref(1);

const records = computed(() => props.complaintsList ?? []);
const counts = computed(() => ({
    pending: records.value.filter((r) => r.status === 'pending').length,
    assigned: records.value.filter((r) => r.status === 'assigned').length,
    in_progress: records.value.filter((r) => r.status === 'in_progress').length,
    resolved: records.value.filter((r) => r.status === 'resolved').length,
    closed: records.value.filter((r) => r.status === 'closed').length,
}));

const summary = computed(
    () =>
        `${formatNumber(records.value.length)} reports · ${formatNumber(counts.value.pending)} awaiting review · ${formatNumber(counts.value.assigned + counts.value.in_progress)} in progress · ${formatNumber(counts.value.resolved + counts.value.closed)} resolved`,
);

const { categories: liveCategories } = useTaxonomy();

const statusOptions: FilterOption[] = [
    { value: 'all', label: 'All statuses' },
    ...complaintStatuses.map((value) => ({
        value,
        label: complaintStatusMeta[value].label,
    })),
];

const categoryOptions = computed<FilterOption[]>(() => [
    { value: 'all', label: 'All categories' },
    ...liveCategories.value.map((item) => ({
        value: String(item.id),
        label: item.name,
    })),
]);

const filtered = computed(() => {
    const term = search.value.trim().toLowerCase();

    return records.value.filter((complaint) => {
        if (status.value !== 'all' && complaint.status !== status.value) {
            return false;
        }

        if (
            category.value !== 'all' &&
            String(complaint.categoryId) !== category.value
        ) {
            return false;
        }

        if (term === '') {
            return true;
        }

        return (
            complaint.title.toLowerCase().includes(term) ||
            complaint.reference.toLowerCase().includes(term) ||
            complaint.barangay.toLowerCase().includes(term)
        );
    });
});

const paged = computed(() =>
    filtered.value.slice((page.value - 1) * perPage, page.value * perPage),
);

watch([search, status, category], () => {
    page.value = 1;
});
</script>

<template>
    <Head title="My reports" />

    <div class="flex h-full flex-1 flex-col gap-4 p-4">
        <PageHeader
            eyebrow="Community"
            title="My reports"
            description="Every concern you submitted, with its current status and assigned staff."
        >
            <template #actions>
                <Button as-child>
                    <Link href="/citizen/complaints/create">
                        <Plus class="size-4" />
                        Report a concern
                    </Link>
                </Button>
            </template>
        </PageHeader>

        <Card class="gap-3">
            <CardHeader>
                <CardTitle>Report history</CardTitle>
                <CardDescription>{{ summary }}</CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
                <div class="flex flex-col gap-2 lg:flex-row lg:items-center">
                    <SearchInput
                        v-model="search"
                        placeholder="Search by title, reference or barangay"
                        class="lg:max-w-sm"
                    />
                    <div class="flex flex-col gap-2 sm:flex-row">
                        <FilterSelect
                            v-model="status"
                            :options="statusOptions"
                            aria-label="Filter by status"
                        />
                        <FilterSelect
                            v-model="category"
                            :options="categoryOptions"
                            aria-label="Filter by category"
                        />
                    </div>
                </div>

                <ComplaintTable
                    :complaints="paged"
                    link-prefix="/citizen/complaints"
                />

                <TablePagination
                    v-if="filtered.length > perPage"
                    :page="page"
                    :per-page="perPage"
                    :total="filtered.length"
                    @update:page="page = $event"
                />
            </CardContent>
        </Card>
    </div>
</template>
