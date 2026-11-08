<script setup lang="ts">
import { computed } from 'vue';
import { Head, Link } from '@inertiajs/vue3';
import { ClipboardList, UserCheck } from '@lucide/vue';
import { PageHeader, StatCard, StatusBadge } from '@/components/geo';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatDate, formatNumber } from '@/lib/format';
import type {
    ComplaintStatus,
    ComplaintSummary,
    StaffMember,
} from '@/types/geo';

const props = withDefaults(
    defineProps<{
        staffList?: StaffMember[];
        complaintsList?: ComplaintSummary[];
    }>(),
    {
        staffList: () => [],
        complaintsList: () => [],
    },
);

defineOptions({
    layout: {
        breadcrumbs: [
            { title: 'Dashboard', href: '/admin/dashboard' },
            { title: 'Assignments', href: '/admin/assignments' },
        ],
    },
});

type AssignmentRow = {
    id: number;
    reference: string;
    title: string;
    staffName: string;
    department: string;
    assignedBy: string;
    assignedAt: string;
    status: ComplaintStatus;
};

const assignmentRows = computed<AssignmentRow[]>(() =>
    props.complaintsList
        .filter((complaint) => complaint.assignedStaffName)
        .map((complaint) => ({
            id: complaint.id,
            reference: complaint.reference,
            title: complaint.title,
            staffName: complaint.assignedStaffName!,
            department: 'Municipal Operations',
            assignedBy: 'Administrator',
            assignedAt: complaint.updatedAt,
            status: complaint.status,
        }))
        .sort(
            (a, b) =>
                new Date(b.assignedAt).getTime() -
                new Date(a.assignedAt).getTime(),
        ),
);

const totalActive = computed(
    () =>
        props.complaintsList.filter(
            (c) => c.status === 'assigned' || c.status === 'in_progress',
        ).length,
);

const unassignedComplaints = computed(() =>
    props.complaintsList.filter(
        (c) =>
            !c.assignedStaffName &&
            c.status !== 'rejected' &&
            c.status !== 'closed',
    ),
);

const staff = computed(() => props.staffList);

const peakLoad = computed(() =>
    Math.max(...staff.value.map((member) => member.activeAssignments), 1),
);
</script>

<template>
    <Head title="Assignments" />

    <div class="flex h-full flex-1 flex-col gap-4 p-4">
        <PageHeader
            eyebrow="Administration"
            title="Assignments"
            description="Manage case assignments across municipal personnel and field departments."
        />

        <div class="grid gap-4 sm:grid-cols-3">
            <StatCard
                label="Active assignments"
                :value="formatNumber(totalActive)"
                hint="Across all field staff"
                :icon="UserCheck"
            />
            <StatCard
                label="Unassigned queue"
                :value="formatNumber(unassignedComplaints.length)"
                hint="Reports waiting for an assignee"
                :icon="ClipboardList"
            />
            <StatCard
                label="Field staff"
                :value="formatNumber(staff.length)"
                hint="Registered in system"
                :icon="UserCheck"
            />
        </div>

        <div class="grid gap-4 xl:grid-cols-[1fr_1.4fr]">
            <Card class="gap-3">
                <CardHeader>
                    <CardTitle>Staff workload</CardTitle>
                    <CardDescription>
                        Open cases per staff member.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div
                        v-if="staff.length === 0"
                        class="py-8 text-center text-sm text-muted-foreground"
                    >
                        No field staff members registered yet.
                    </div>
                    <ul v-else class="divide-y">
                        <li
                            v-for="member in staff"
                            :key="member.id"
                            class="space-y-2 py-3 first:pt-0"
                        >
                            <div
                                class="flex items-center justify-between gap-2"
                            >
                                <div class="min-w-0">
                                    <p class="truncate text-sm font-medium">
                                        {{ member.name }}
                                    </p>
                                    <p
                                        class="truncate text-xs text-muted-foreground"
                                    >
                                        {{ member.department }}
                                    </p>
                                </div>
                                <p class="text-sm tabular-nums">
                                    <span class="font-semibold">
                                        {{ member.activeAssignments }}
                                    </span>
                                    <span class="text-muted-foreground">
                                        / {{ member.resolvedCount }} done
                                    </span>
                                </p>
                            </div>
                            <div
                                class="h-1.5 overflow-hidden rounded-full bg-muted"
                            >
                                <div
                                    class="h-full rounded-full bg-primary"
                                    :style="{
                                        width: `${Math.round((member.activeAssignments / peakLoad) * 100)}%`,
                                    }"
                                />
                            </div>
                        </li>
                    </ul>
                </CardContent>
            </Card>

            <Card class="gap-3">
                <CardHeader>
                    <CardTitle>Assignment records</CardTitle>
                    <CardDescription>
                        {{ formatNumber(assignmentRows.length) }} cases
                        currently have an assigned officer.
                    </CardDescription>
                </CardHeader>
                <CardContent class="space-y-4">
                    <ul
                        class="divide-y md:hidden"
                        v-if="assignmentRows.length > 0"
                    >
                        <li
                            v-for="row in assignmentRows"
                            :key="row.id"
                            class="space-y-1.5 py-3 first:pt-0"
                        >
                            <div
                                class="flex items-center justify-between gap-2"
                            >
                                <span
                                    class="font-mono text-xs text-muted-foreground"
                                >
                                    {{ row.reference }}
                                </span>
                                <StatusBadge
                                    :status="row.status"
                                    :dot="false"
                                />
                            </div>
                            <Link
                                :href="`/admin/complaints/${row.id}`"
                                class="text-sm leading-snug font-medium"
                            >
                                {{ row.title }}
                            </Link>
                            <p class="text-xs text-muted-foreground">
                                {{ row.staffName }} · {{ row.department }}
                            </p>
                            <p class="text-xs text-muted-foreground">
                                Assigned by {{ row.assignedBy }} on
                                {{ formatDate(row.assignedAt) }}
                            </p>
                        </li>
                    </ul>

                    <Table
                        class="hidden md:table"
                        v-if="assignmentRows.length > 0"
                    >
                        <TableHeader>
                            <TableRow>
                                <TableHead>Report</TableHead>
                                <TableHead>Assigned to</TableHead>
                                <TableHead>By</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow
                                v-for="row in assignmentRows"
                                :key="row.id"
                            >
                                <TableCell>
                                    <Link
                                        :href="`/admin/complaints/${row.id}`"
                                        class="flex flex-col"
                                    >
                                        <span
                                            class="font-mono text-xs text-muted-foreground"
                                        >
                                            {{ row.reference }}
                                        </span>
                                        <span
                                            class="max-w-[260px] truncate font-medium"
                                        >
                                            {{ row.title }}
                                        </span>
                                    </Link>
                                </TableCell>
                                <TableCell>
                                    <span class="flex flex-col">
                                        <span>{{ row.staffName }}</span>
                                        <span
                                            class="text-xs text-muted-foreground"
                                        >
                                            {{ row.department }}
                                        </span>
                                    </span>
                                </TableCell>
                                <TableCell class="text-muted-foreground">
                                    {{ row.assignedBy }}
                                </TableCell>
                                <TableCell
                                    class="whitespace-nowrap text-muted-foreground"
                                >
                                    {{ formatDate(row.assignedAt) }}
                                </TableCell>
                                <TableCell>
                                    <StatusBadge
                                        :status="row.status"
                                        :dot="false"
                                    />
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>

                    <p
                        v-if="assignmentRows.length === 0"
                        class="py-4 text-center text-sm text-muted-foreground"
                    >
                        No active assignments found.
                    </p>
                </CardContent>
            </Card>
        </div>
    </div>
</template>
