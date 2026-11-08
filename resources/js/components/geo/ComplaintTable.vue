<script setup lang="ts">
import { computed } from 'vue';
import { Link } from '@inertiajs/vue3';
import { Inbox } from '@lucide/vue';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatDate } from '@/lib/format';
import CategoryBadge from './CategoryBadge.vue';
import EmptyState from './EmptyState.vue';
import PriorityBadge from './PriorityBadge.vue';
import StatusBadge from './StatusBadge.vue';
import type { Complaint, ComplaintSummary } from '@/types/geo';

const props = withDefaults(
    defineProps<{
        complaints: Array<Complaint | ComplaintSummary>;
        /** Route prefix for the detail page, e.g. `/citizen/complaints`. */
        linkPrefix: string;
        showReporter?: boolean;
        showAssignee?: boolean;
        selectable?: boolean;
        selected?: number[];
        emptyTitle?: string;
        emptyDescription?: string;
    }>(),
    {
        showReporter: false,
        showAssignee: false,
        selectable: false,
        selected: () => [],
        emptyTitle: 'No reports match these filters',
        emptyDescription:
            'Clear the search box or pick a different status to see more reports.',
    },
);

const emit = defineEmits<{
    (e: 'update:selected', value: number[]): void;
}>();

const allSelected = computed(
    () =>
        props.complaints.length > 0 &&
        props.selected.length === props.complaints.length,
);

function isSelected(id: number): boolean {
    return props.selected.includes(id);
}

function toggle(id: number): void {
    emit(
        'update:selected',
        isSelected(id)
            ? props.selected.filter((value) => value !== id)
            : [...props.selected, id],
    );
}

function toggleAll(): void {
    emit(
        'update:selected',
        allSelected.value
            ? []
            : props.complaints.map((complaint) => complaint.id),
    );
}

function detailLink(complaint: Complaint | ComplaintSummary): string {
    return `${props.linkPrefix}/${complaint.id}`;
}
</script>

<template>
    <div>
        <EmptyState
            v-if="complaints.length === 0"
            :title="emptyTitle"
            :description="emptyDescription"
            :icon="Inbox"
        />

        <template v-else>
            <div
                v-if="selectable"
                class="mb-1 flex items-center gap-2.5 border-b pb-2.5 lg:hidden"
            >
                <Checkbox
                    :model-value="allSelected"
                    aria-label="Select all reports"
                    @update:model-value="toggleAll"
                />
                <span class="text-xs font-medium text-muted-foreground">
                    Select all ({{ complaints.length }})
                </span>
            </div>

            <ul class="divide-y lg:hidden">
                <li
                    v-for="complaint in complaints"
                    :key="complaint.id"
                    class="flex items-start gap-3 py-3 last:pb-0"
                    :class="{ 'first:pt-0': !selectable }"
                >
                    <Checkbox
                        v-if="selectable"
                        class="mt-0.5 shrink-0"
                        :model-value="isSelected(complaint.id)"
                        :aria-label="`Select ${complaint.reference}`"
                        @update:model-value="toggle(complaint.id)"
                    />
                    <Link
                        :href="detailLink(complaint)"
                        class="block min-w-0 flex-1 space-y-2"
                    >
                        <div class="flex items-center justify-between gap-2">
                            <span
                                class="min-w-0 truncate font-mono text-xs text-muted-foreground"
                            >
                                {{ complaint.reference }}
                            </span>
                            <StatusBadge
                                :status="complaint.status"
                                class="shrink-0"
                            />
                        </div>
                        <p class="text-sm leading-snug font-medium break-words">
                            {{ complaint.title }}
                        </p>
                        <div class="flex flex-wrap items-center gap-2">
                            <CategoryBadge
                                :category-id="complaint.categoryId"
                                :category="complaint.category"
                            />
                            <PriorityBadge :priority="complaint.priority" />
                        </div>
                        <p class="text-xs break-words text-muted-foreground">
                            {{ complaint.barangay }} ·
                            {{ formatDate(complaint.submittedAt) }}
                            <template
                                v-if="
                                    showReporter &&
                                    'reporterName' in complaint &&
                                    (complaint as Complaint).reporterName
                                "
                            >
                                · {{ (complaint as Complaint).reporterName }}
                            </template>
                        </p>
                    </Link>
                    <div
                        v-if="$slots['row-actions']"
                        class="shrink-0 self-center"
                    >
                        <slot name="row-actions" :complaint="complaint" />
                    </div>
                </li>
            </ul>

            <div class="hidden lg:block">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead v-if="selectable" class="w-10">
                                <Checkbox
                                    :model-value="allSelected"
                                    aria-label="Select all reports"
                                    @update:model-value="toggleAll"
                                />
                            </TableHead>
                            <TableHead>Reference</TableHead>
                            <TableHead>Concern</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead v-if="showReporter">
                                Reported by
                            </TableHead>
                            <TableHead v-if="showAssignee">
                                Assigned to
                            </TableHead>
                            <TableHead>Submitted</TableHead>
                            <TableHead
                                v-if="$slots['row-actions']"
                                class="text-right"
                            >
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow
                            v-for="complaint in complaints"
                            :key="complaint.id"
                        >
                            <TableCell v-if="selectable">
                                <Checkbox
                                    :model-value="isSelected(complaint.id)"
                                    :aria-label="`Select ${complaint.reference}`"
                                    @update:model-value="toggle(complaint.id)"
                                />
                            </TableCell>
                            <TableCell>
                                <Link
                                    :href="detailLink(complaint)"
                                    class="font-mono text-xs hover:underline"
                                >
                                    {{ complaint.reference }}
                                </Link>
                            </TableCell>
                            <TableCell class="max-w-[320px] whitespace-normal">
                                <Link
                                    :href="detailLink(complaint)"
                                    class="font-medium hover:underline"
                                >
                                    {{ complaint.title }}
                                </Link>
                            </TableCell>
                            <TableCell>
                                <CategoryBadge
                                    :category-id="complaint.categoryId"
                                    :category="complaint.category"
                                />
                            </TableCell>
                            <TableCell>
                                <StatusBadge :status="complaint.status" />
                            </TableCell>
                            <TableCell>
                                <PriorityBadge :priority="complaint.priority" />
                            </TableCell>
                            <TableCell
                                v-if="showReporter"
                                class="text-muted-foreground"
                            >
                                {{
                                    'reporterName' in complaint
                                        ? (complaint as Complaint).reporterName
                                        : 'Resident'
                                }}
                            </TableCell>
                            <TableCell
                                v-if="showAssignee"
                                class="text-muted-foreground"
                            >
                                {{ complaint.assignedTo?.name ?? 'Unassigned' }}
                            </TableCell>
                            <TableCell class="text-muted-foreground">
                                {{ formatDate(complaint.submittedAt) }}
                            </TableCell>
                            <TableCell
                                v-if="$slots['row-actions']"
                                class="text-right"
                            >
                                <slot
                                    name="row-actions"
                                    :complaint="complaint"
                                />
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        </template>
    </div>
</template>
