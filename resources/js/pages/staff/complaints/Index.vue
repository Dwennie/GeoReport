<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Head } from '@inertiajs/vue3';
import {
    ComplaintTable,
    FilterSelect,
    PageHeader,
    SearchInput,
    TablePagination,
} from '@/components/geo';
import type { FilterOption } from '@/components/geo';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { formatNumber } from '@/lib/format';
import { complaintStatusMeta, complaintStatuses } from '@/lib/statusMeta';
import type { ComplaintSummary } from '@/types/geo';

const props = withDefaults(
    defineProps<{
        assignedComplaintsList?: ComplaintSummary[];
    }>(),
    {
        assignedComplaintsList: () => [],
    },
);

defineOptions({
    layout: {
        breadcrumbs: [
            { title: 'Dashboard', href: '/staff/dashboard' },
            { title: 'Assigned reports', href: '/staff/complaints' },
        ],
    },
});

const perPage = 6;

const search = ref('');
const status = ref('all');
const page = ref(1);

const records = computed(() => props.assignedComplaintsList);

const counts = computed(() => ({
    assigned: records.value.filter((c) => c.status === 'assigned').length,
    in_progress: records.value.filter((c) => c.status === 'in_progress').length,
    resolved: records.value.filter((c) => c.status === 'resolved').length,
    closed: records.value.filter((c) => c.status === 'closed').length,
}));

const summary = computed(
    () =>
        `${formatNumber(records.value.length)} assigned · ${formatNumber(counts.value.assigned)} not started · ${formatNumber(counts.value.in_progress)} under investigation · ${formatNumber(counts.value.resolved + counts.value.closed)} resolved`,
);

const statusOptions: FilterOption[] = [
    { value: 'all', label: 'All statuses' },
    ...complaintStatuses.map((value) => ({
        value,
        label: complaintStatusMeta[value].label,
    })),
];

const filtered = computed(() => {
    const term = search.value.trim().toLowerCase();

    return records.value.filter((complaint) => {
        if (status.value !== 'all' && complaint.status !== status.value) {
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

watch([search, status], () => {
    page.value = 1;
});
</script>

<template>
    <Head title="Assigned reports" />

    <div class="flex h-full flex-1 flex-col gap-4 p-4">
        <PageHeader
            eyebrow="Field operations"
            title="Assigned reports"
            description="Your work queue. Open a report to review details, post updates and upload evidence."
        />

        <Card class="gap-3">
            <CardHeader>
                <CardTitle>Work queue</CardTitle>
                <CardDescription>{{ summary }}</CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
                <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <SearchInput
                        v-model="search"
                        placeholder="Search by title, reference or barangay"
                        class="sm:max-w-sm"
                    />
                    <FilterSelect
                        v-model="status"
                        :options="statusOptions"
                        aria-label="Filter by status"
                    />
                </div>

                <ComplaintTable
                    :complaints="paged"
                    link-prefix="/staff/complaints"
                    empty-title="No assignments found"
                    empty-description="Clear the search box or pick another status. New assignments appear here as soon as an administrator dispatches them."
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
