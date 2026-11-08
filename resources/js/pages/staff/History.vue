<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Head } from '@inertiajs/vue3';
import { Check } from '@lucide/vue';
import {
    ComplaintTable,
    EmptyState,
    PageHeader,
    SearchInput,
    StatCard,
    TablePagination,
} from '@/components/geo';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { formatNumber } from '@/lib/format';
import type { ComplaintSummary } from '@/types/geo';

const props = withDefaults(
    defineProps<{
        resolvedComplaintsList?: ComplaintSummary[];
    }>(),
    {
        resolvedComplaintsList: () => [],
    },
);

defineOptions({
    layout: {
        breadcrumbs: [
            { title: 'Dashboard', href: '/staff/dashboard' },
            { title: 'History', href: '/staff/history' },
        ],
    },
});

const perPage = 8;

const search = ref('');
const page = ref(1);

const completed = computed(() => props.resolvedComplaintsList);

const filtered = computed(() => {
    const term = search.value.trim().toLowerCase();

    if (term === '') {
        return completed.value;
    }

    return completed.value.filter(
        (complaint) =>
            complaint.title.toLowerCase().includes(term) ||
            complaint.reference.toLowerCase().includes(term) ||
            complaint.barangay.toLowerCase().includes(term),
    );
});

const paged = computed(() =>
    filtered.value.slice((page.value - 1) * perPage, page.value * perPage),
);

watch(search, () => {
    page.value = 1;
});
</script>

<template>
    <Head title="History" />

    <div class="flex h-full flex-1 flex-col gap-4 p-4">
        <PageHeader
            eyebrow="Field operations"
            title="History"
            description="Cases you completed, kept for reference and audits."
        />

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
                label="Completed cases"
                :value="formatNumber(completed.length)"
                hint="Assigned cases resolved"
                :icon="Check"
            />
        </div>

        <Card class="gap-3">
            <CardHeader>
                <CardTitle>Resolved and closed</CardTitle>
                <CardDescription>
                    {{ formatNumber(filtered.length) }} cases match the current
                    search.
                </CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
                <SearchInput
                    v-model="search"
                    placeholder="Search completed cases"
                    class="sm:max-w-sm"
                />

                <ComplaintTable
                    v-if="filtered.length"
                    :complaints="paged"
                    link-prefix="/staff/complaints"
                    empty-title="Nothing completed yet"
                    empty-description="Cases you resolve appear here with their evidence."
                />

                <EmptyState
                    v-else
                    title="No completed cases yet"
                    description="Resolved investigations and closed complaints will be archived here automatically."
                    :icon="Check"
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
