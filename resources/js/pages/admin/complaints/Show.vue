<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Head, Link, router } from '@inertiajs/vue3';
import {
    ArrowLeft,
    Check,
    CheckCircle2,
    FileText,
    MapPin,
    UserCheck,
    Users,
    X,
} from '@lucide/vue';
import OpenStreetMap from '@/components/OpenStreetMap.vue';
import type { MapMarker } from '@/components/OpenStreetMap.vue';
import {
    ComplaintTimeline,
    ConfirmDialog,
    EmptyState,
    EvidenceGallery,
    FilterSelect,
    PriorityBadge,
    StatusBadge,
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
import { Separator } from '@/components/ui/separator';
import { formatCoordinates, formatDate, formatDateTime } from '@/lib/format';
import type { AssignedStaff, Complaint, StaffMember } from '@/types/geo';

const props = defineProps<{
    complaintId: number;
    complaintData?: Complaint;
    staffOptions?: StaffMember[];
}>();

const complaint = computed(() => props.complaintData ?? null);
const staffList = computed(() => props.staffOptions ?? []);

const workingAssignee = ref<string>('');
const rejectOpen = ref(false);
const submitting = ref(false);

const staffDropdownOptions = computed<FilterOption[]>(() => [
    { value: '', label: 'Select field staff…' },
    ...staffList.value.map((member) => ({
        value: String(member.id),
        label: `${member.name} · ${member.department}`,
    })),
]);

const selectedStaff = computed<AssignedStaff | null>(() => {
    const member = staffList.value.find(
        (item) => String(item.id) === workingAssignee.value,
    );

    return member
        ? { id: member.id, name: member.name, department: member.department }
        : null;
});

const canDecide = computed(
    () =>
        complaint.value?.status === 'pending' ||
        complaint.value?.status === 'approved',
);

const canAssign = computed(
    () =>
        complaint.value?.status === 'approved' ||
        complaint.value?.status === 'assigned' ||
        complaint.value?.status === 'in_progress',
);

const canClose = computed(() => complaint.value?.status === 'resolved');

watch(
    () => [props.complaintId, props.complaintData?.assignedTo?.id],
    () => {
        workingAssignee.value =
            complaint.value?.assignedTo != null
                ? String(complaint.value.assignedTo.id)
                : '';
        rejectOpen.value = false;
    },
    { immediate: true },
);

function approve(): void {
    submitting.value = true;
    router.post(
        `/admin/complaints/${props.complaintId}/approve`,
        {},
        {
            preserveScroll: true,
            onFinish: () => {
                submitting.value = false;
            },
        },
    );
}

function confirmReject(): void {
    rejectOpen.value = false;
    submitting.value = true;
    router.post(
        `/admin/complaints/${props.complaintId}/reject`,
        {},
        {
            preserveScroll: true,
            onFinish: () => {
                submitting.value = false;
            },
        },
    );
}

function assign(): void {
    if (workingAssignee.value === '' || !selectedStaff.value) {
        return;
    }

    submitting.value = true;
    router.post(
        `/admin/complaints/${props.complaintId}/assign`,
        {
            staff_id: Number(workingAssignee.value),
        },
        {
            preserveScroll: true,
            onFinish: () => {
                submitting.value = false;
            },
        },
    );
}

function closeCase(): void {
    submitting.value = true;
    router.post(
        `/admin/complaints/${props.complaintId}/close`,
        {},
        {
            preserveScroll: true,
            onFinish: () => {
                submitting.value = false;
            },
        },
    );
}

const liveMarkers = computed<MapMarker[]>(() => {
    if (!complaint.value) {
        return [];
    }

    return [
        {
            id: complaint.value.id,
            latitude: complaint.value.latitude,
            longitude: complaint.value.longitude,
            title: `${complaint.value.reference} — ${complaint.value.title}`,
            description: `${complaint.value.address}, ${complaint.value.barangay}`,
            color: complaint.value.category?.color ?? '#DC2626',
        },
    ];
});
</script>

<template>
    <Head :title="complaint ? complaint.title : 'Report not found'" />

    <div class="flex h-full flex-1 flex-col gap-4 p-4">
        <div class="flex items-center gap-3">
            <Button variant="ghost" size="icon-sm" as-child>
                <Link href="/admin/complaints" aria-label="Back to all reports">
                    <ArrowLeft class="size-4" />
                </Link>
            </Button>
            <span
                v-if="complaint"
                class="font-mono text-xs text-muted-foreground"
            >
                {{ complaint.reference }}
            </span>
        </div>

        <EmptyState
            v-if="!complaint"
            title="Report not found"
            description="This report could not be found in the municipal registry."
            :icon="FileText"
        >
            <Button variant="outline" size="sm" as-child>
                <Link href="/admin/complaints">Back to all reports</Link>
            </Button>
        </EmptyState>

        <template v-else>
            <div class="space-y-2">
                <div class="flex flex-wrap items-center gap-2">
                    <StatusBadge :status="complaint.status" />
                    <PriorityBadge :priority="complaint.priority" />
                    <span
                        v-if="!complaint.isPublic"
                        class="text-xs text-muted-foreground"
                    >
                        Not visible on the community map
                    </span>
                </div>
                <h1 class="text-xl font-semibold tracking-tight sm:text-2xl">
                    {{ complaint.title }}
                </h1>
                <p class="text-sm text-muted-foreground">
                    Reported by {{ complaint.reporterName }} on
                    {{ formatDate(complaint.submittedAt) }} ·
                    {{ complaint.barangay }}
                </p>
            </div>

            <div class="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
                <div class="space-y-4">
                    <Card class="gap-3">
                        <CardHeader>
                            <CardTitle>Report details</CardTitle>
                        </CardHeader>
                        <CardContent class="space-y-4">
                            <p class="text-sm leading-relaxed">
                                {{ complaint.description }}
                            </p>
                            <Separator />
                            <dl class="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                                <div>
                                    <dt
                                        class="text-xs tracking-wide text-muted-foreground uppercase"
                                    >
                                        Location
                                    </dt>
                                    <dd class="mt-0.5 text-sm">
                                        {{ complaint.address }}
                                    </dd>
                                </div>
                                <div>
                                    <dt
                                        class="text-xs tracking-wide text-muted-foreground uppercase"
                                    >
                                        Coordinates
                                    </dt>
                                    <dd
                                        class="mt-0.5 font-mono text-xs tabular-nums"
                                    >
                                        {{
                                            formatCoordinates(
                                                complaint.latitude,
                                                complaint.longitude,
                                            )
                                        }}
                                    </dd>
                                </div>
                                <div>
                                    <dt
                                        class="text-xs tracking-wide text-muted-foreground uppercase"
                                    >
                                        Assigned staff
                                    </dt>
                                    <dd class="mt-0.5 text-sm">
                                        {{
                                            complaint.assignedTo
                                                ? `${complaint.assignedTo.name} · ${complaint.assignedTo.department}`
                                                : 'Unassigned'
                                        }}
                                    </dd>
                                </div>
                                <div>
                                    <dt
                                        class="text-xs tracking-wide text-muted-foreground uppercase"
                                    >
                                        Resolved on
                                    </dt>
                                    <dd class="mt-0.5 text-sm">
                                        {{ formatDate(complaint.resolvedAt) }}
                                    </dd>
                                </div>
                            </dl>
                        </CardContent>
                    </Card>

                    <Card class="gap-3">
                        <CardHeader>
                            <CardTitle>Evidence</CardTitle>
                        </CardHeader>
                        <CardContent class="space-y-4">
                            <div>
                                <p
                                    class="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase"
                                >
                                    From the reporter
                                </p>
                                <EvidenceGallery
                                    :attachments="complaint.evidence"
                                    empty-label="No photos attached."
                                />
                            </div>
                            <div v-if="complaint.resolutionEvidence.length">
                                <p
                                    class="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase"
                                >
                                    From staff (resolution)
                                </p>
                                <EvidenceGallery
                                    :attachments="complaint.resolutionEvidence"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card class="gap-3">
                        <CardHeader>
                            <CardTitle>All case notes</CardTitle>
                            <CardDescription>
                                Internal and public notes across the municipal
                                team.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p
                                v-if="complaint.notes.length === 0"
                                class="text-sm text-muted-foreground"
                            >
                                No notes recorded on this case.
                            </p>
                            <ul v-else class="space-y-4">
                                <li
                                    v-for="note in complaint.notes"
                                    :key="note.id"
                                    class="space-y-1"
                                >
                                    <div
                                        class="flex flex-wrap items-center gap-2"
                                    >
                                        <p class="text-sm font-medium">
                                            {{ note.authorName }}
                                        </p>
                                        <span
                                            class="text-[11px] tracking-wide text-muted-foreground uppercase"
                                        >
                                            {{
                                                note.isInternal
                                                    ? 'Internal'
                                                    : 'Public'
                                            }}
                                        </span>
                                    </div>
                                    <p class="text-sm leading-snug">
                                        {{ note.body }}
                                    </p>
                                    <p class="text-xs text-muted-foreground">
                                        {{ formatDateTime(note.createdAt) }}
                                    </p>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                <div class="space-y-4">
                    <Card class="gap-3">
                        <CardHeader>
                            <CardTitle>Decisions</CardTitle>
                            <CardDescription>
                                Approve or reject incoming concerns and dispatch
                                field staff.
                            </CardDescription>
                        </CardHeader>
                        <CardContent class="space-y-3">
                            <div v-if="canDecide" class="flex gap-2">
                                <Button
                                    class="flex-1"
                                    :disabled="
                                        submitting ||
                                        complaint.status === 'approved'
                                    "
                                    @click="approve"
                                >
                                    <Check class="size-4" />
                                    {{
                                        complaint.status === 'approved'
                                            ? 'Approved'
                                            : 'Approve'
                                    }}
                                </Button>
                                <Button
                                    variant="outline"
                                    class="flex-1 text-destructive hover:text-destructive"
                                    :disabled="submitting"
                                    @click="rejectOpen = true"
                                >
                                    <X class="size-4" />
                                    Reject
                                </Button>
                            </div>

                            <div
                                v-if="canAssign"
                                class="space-y-2 border-t pt-3"
                            >
                                <p
                                    class="text-xs font-medium tracking-wide text-muted-foreground uppercase"
                                >
                                    Assign to field staff
                                </p>
                                <template v-if="staffList.length > 0">
                                    <FilterSelect
                                        v-model="workingAssignee"
                                        :options="staffDropdownOptions"
                                        aria-label="Assign to staff"
                                        class="w-full"
                                    />
                                    <Button
                                        class="w-full"
                                        :disabled="!selectedStaff || submitting"
                                        @click="assign"
                                    >
                                        <UserCheck class="size-4" />
                                        Assign report
                                    </Button>
                                </template>
                                <div
                                    v-else
                                    class="space-y-2 rounded-lg border border-dashed p-3 text-xs"
                                >
                                    <p class="text-muted-foreground">
                                        No Field Staff accounts are registered
                                        yet. Promote a citizen or add a staff
                                        member to assign reports.
                                    </p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        class="w-full"
                                        as-child
                                    >
                                        <Link href="/admin/users">
                                            <Users class="size-3.5" />
                                            Manage users &amp; roles
                                        </Link>
                                    </Button>
                                </div>
                            </div>

                            <div
                                v-if="canClose"
                                class="space-y-2 border-t pt-3"
                            >
                                <p class="text-sm text-muted-foreground">
                                    Staff marked this resolved
                                    {{
                                        complaint.resolvedAt
                                            ? `on ${formatDate(complaint.resolvedAt)}`
                                            : ''
                                    }}. Close the case once the evidence is
                                    verified.
                                </p>
                                <Button
                                    class="w-full"
                                    :disabled="submitting"
                                    @click="closeCase"
                                >
                                    <CheckCircle2 class="size-4" />
                                    Verify &amp; close case
                                </Button>
                            </div>

                            <p
                                v-if="complaint.status === 'rejected'"
                                class="text-sm text-muted-foreground"
                            >
                                Rejected. The reporter is notified and the
                                report stays off the public map.
                            </p>
                            <p
                                v-else-if="complaint.status === 'closed'"
                                class="text-sm text-muted-foreground"
                            >
                                Closed and archived. Resolution verified by the
                                municipal administrator.
                            </p>
                        </CardContent>
                    </Card>

                    <Card class="gap-3">
                        <CardHeader>
                            <CardTitle>Progress</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ComplaintTimeline
                                :events="complaint.timeline"
                                :status="complaint.status"
                            />
                        </CardContent>
                    </Card>

                    <Card class="gap-3">
                        <CardHeader>
                            <CardTitle>Location</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <OpenStreetMap
                                :latitude="complaint.latitude"
                                :longitude="complaint.longitude"
                                :zoom="15"
                                height="h-[240px]"
                                :markers="liveMarkers"
                                :selectable="false"
                                :show-barangays="true"
                                :show-legend="false"
                                :show-coordinates-badge="false"
                                caption="Report pin within Loon GIS barangay boundaries."
                            />
                            <p
                                class="mt-3 flex items-start gap-1.5 text-xs text-muted-foreground"
                            >
                                <MapPin class="mt-px size-3.5 shrink-0" />
                                {{ complaint.address }},
                                {{ complaint.barangay }}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </template>

        <ConfirmDialog
            v-model:open="rejectOpen"
            title="Reject this report?"
            description="Rejected reports are hidden from the community map and the reporter is notified with the reason."
            confirm-label="Reject report"
            destructive
            @confirm="confirmReject"
        />
    </div>
</template>
