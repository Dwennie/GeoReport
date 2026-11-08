<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Head, router } from '@inertiajs/vue3';
import { Check, X } from '@lucide/vue';
import {
    ComplaintTable,
    ConfirmDialog,
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
import {
    complaintPriorityMeta,
    complaintStatusMeta,
    complaintStatuses,
} from '@/lib/statusMeta';
import { useTaxonomy } from '@/lib/taxonomy';
import type { ComplaintSummary } from '@/types/geo';

const props = withDefaults(
    defineProps<{
        complaintsList?: ComplaintSummary[];
    }>(),
    {
        complaintsList: () => [],
    },
);

defineOptions({
    layout: {
        breadcrumbs: [
            { title: 'Dashboard', href: '/admin/dashboard' },
            { title: 'All reports', href: '/admin/complaints' },
        ],
    },
});

const perPage = 8;

/** Allow deep links like `/admin/complaints?status=pending` (e.g. "Open the full queue"). */
const initialStatus = (() => {
    if (typeof window === 'undefined') {
        return 'all';
    }

    const fromQuery = new URLSearchParams(window.location.search).get('status');

    return fromQuery &&
        (complaintStatuses as readonly string[]).includes(fromQuery)
        ? fromQuery
        : 'all';
})();

const search = ref('');
const status = ref(initialStatus);
const category = ref('all');
const barangay = ref('all');
const priority = ref('all');
const page = ref(1);
const selected = ref<number[]>([]);
const bulkAction = ref<'approve' | 'reject' | null>(null);
const bulkProcessing = ref(false);

const records = computed(() => props.complaintsList);

const counts = computed(() => ({
    pending: records.value.filter((c) => c.status === 'pending').length,
    assigned: records.value.filter((c) => c.status === 'assigned').length,
    in_progress: records.value.filter((c) => c.status === 'in_progress').length,
    resolved: records.value.filter((c) => c.status === 'resolved').length,
    closed: records.value.filter((c) => c.status === 'closed').length,
}));

const summary = computed(
    () =>
        `${formatNumber(records.value.length)} reports in registry · ${formatNumber(counts.value.pending)} awaiting review · ${formatNumber(counts.value.assigned + counts.value.in_progress)} in the field · ${formatNumber(counts.value.resolved + counts.value.closed)} resolved`,
);

const { categories: liveCategories, barangays: liveBarangays } = useTaxonomy();

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

const barangayOptions = computed<FilterOption[]>(() => [
    { value: 'all', label: 'All barangays' },
    ...liveBarangays.value.map((item) => ({
        value: item.name,
        label: item.name,
    })),
]);

const priorityOptions: FilterOption[] = [
    { value: 'all', label: 'All priorities' },
    ...Object.entries(complaintPriorityMeta).map(([value, meta]) => ({
        value,
        label: meta.label,
    })),
];

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

        if (barangay.value !== 'all' && complaint.barangay !== barangay.value) {
            return false;
        }

        if (priority.value !== 'all' && complaint.priority !== priority.value) {
            return false;
        }

        if (term === '') {
            return true;
        }

        return (
            complaint.title.toLowerCase().includes(term) ||
            complaint.reference.toLowerCase().includes(term) ||
            complaint.barangay.toLowerCase().includes(term) ||
            (complaint.reporterName &&
                complaint.reporterName.toLowerCase().includes(term))
        );
    });
});

const paged = computed(() =>
    filtered.value.slice((page.value - 1) * perPage, page.value * perPage),
);

const bulkTarget = computed(() =>
    records.value.filter((complaint) => selected.value.includes(complaint.id)),
);

const hasSelection = computed(() => selected.value.length > 0);

watch([search, status, category, barangay, priority], () => {
    page.value = 1;
    selected.value = [];
});

function requestBulk(action: 'approve' | 'reject'): void {
    bulkAction.value = action;
}

function applyBulk(): void {
    if (!bulkAction.value || selected.value.length === 0) {
        return;
    }

    const action = bulkAction.value;
    const ids = [...selected.value];
    bulkProcessing.value = true;

    router.post(
        '/admin/complaints/bulk-status',
        { ids, action },
        {
            preserveScroll: true,
            onSuccess: () => {
                bulkAction.value = null;
                selected.value = [];
            },
            onFinish: () => {
                bulkProcessing.value = false;
            },
        },
    );
}
</script>

<template>
    <Head title="All reports" />

    <div class="flex h-full flex-1 flex-col gap-4 p-4">
        <PageHeader
            eyebrow="Administration"
            title="All reports"
            description="Every complaint filed across the municipality. Review valid reports, assign staff and keep the resolution workflow moving."
        />

        <Card class="gap-3">
            <CardHeader>
                <CardTitle>Report registry</CardTitle>
                <CardDescription>{{ summary }}</CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
                <div class="flex flex-col gap-2 xl:flex-row xl:items-center">
                    <SearchInput
                        v-model="search"
                        placeholder="Search by title, reference, reporter or barangay"
                        class="xl:max-w-sm"
                    />
                    <div class="grid grid-cols-2 gap-2 lg:flex lg:flex-wrap">
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
                        <FilterSelect
                            v-model="barangay"
                            :options="barangayOptions"
                            aria-label="Filter by barangay"
                        />
                        <FilterSelect
                            v-model="priority"
                            :options="priorityOptions"
                            aria-label="Filter by priority"
                        />
                    </div>
                </div>

                <div
                    v-if="hasSelection"
                    class="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/40 px-3 py-2"
                >
                    <p class="text-sm">{{ selected.length }} selected</p>
                    <div class="ml-auto flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            :disabled="bulkProcessing"
                            @click="requestBulk('approve')"
                        >
                            <Check class="size-4" />
                            Approve
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            class="text-destructive hover:text-destructive"
                            :disabled="bulkProcessing"
                            @click="requestBulk('reject')"
                        >
                            <X class="size-4" />
                            Reject
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            :disabled="bulkProcessing"
                            @click="selected = []"
                        >
                            Clear
                        </Button>
                    </div>
                </div>

                <ComplaintTable
                    :complaints="paged"
                    link-prefix="/admin/complaints"
                    show-reporter
                    show-assignee
                    selectable
                    v-model:selected="selected"
                    empty-title="No reports match these filters"
                    empty-description="Adjust your filters or clear the search to view records."
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

        <ConfirmDialog
            :open="bulkAction === 'approve'"
            :title="`Approve ${bulkTarget.length} reports?`"
            description="Approved reports become public on the community map and move to the assignment queue."
            confirm-label="Approve reports"
            @update:open="bulkAction = $event ? 'approve' : null"
            @confirm="applyBulk"
        />

        <ConfirmDialog
            :open="bulkAction === 'reject'"
            :title="`Reject ${bulkTarget.length} reports?`"
            description="Rejected reports are hidden from the community map. The reporter is notified with the reason."
            confirm-label="Reject reports"
            destructive
            @update:open="bulkAction = $event ? 'reject' : null"
            @confirm="applyBulk"
        />
    </div>
</template>
