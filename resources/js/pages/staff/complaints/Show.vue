<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Head, Link, router } from '@inertiajs/vue3';
import {
    ArrowLeft,
    Check,
    ClipboardList,
    FileText,
    MapPin,
    Plus,
} from '@lucide/vue';
import OpenStreetMap from '@/components/OpenStreetMap.vue';
import type { MapMarker } from '@/components/OpenStreetMap.vue';
import {
    ComplaintTimeline,
    ConfirmDialog,
    EmptyState,
    EvidenceGallery,
    ImageUploadPreview,
    StatusBadge,
} from '@/components/geo';
import type { ImagePreview } from '@/components/geo';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { formatCoordinates, formatDate, formatDateTime } from '@/lib/format';
import type { Complaint } from '@/types/geo';

const props = defineProps<{
    complaintId: number;
    complaintData?: Complaint;
}>();

const complaint = computed(() => props.complaintData ?? null);

const noteBody = ref('');
const noteIsInternal = ref(true);
const resolutionPhotos = ref<ImagePreview[]>([]);
const resolutionOpen = ref(false);
const submitting = ref(false);

const canStart = computed(() => complaint.value?.status === 'assigned');
const canResolve = computed(() => complaint.value?.status === 'in_progress');

watch(
    () => props.complaintId,
    () => {
        noteBody.value = '';
        noteIsInternal.value = true;
        resolutionPhotos.value = [];
        resolutionOpen.value = false;
    },
    { immediate: true },
);

function startInvestigation(): void {
    submitting.value = true;
    router.post(
        `/staff/complaints/${props.complaintId}/status`,
        {
            status: 'in_progress',
            remarks:
                'Field staff initiated ocular inspection and investigation at the site.',
        },
        {
            preserveScroll: true,
            onFinish: () => {
                submitting.value = false;
            },
        },
    );
}

function confirmResolution(): void {
    resolutionOpen.value = false;
    submitting.value = true;

    const files = resolutionPhotos.value
        .map((item) => item.file)
        .filter((file): file is File => file instanceof File);

    router.post(
        `/staff/complaints/${props.complaintId}/status`,
        {
            status: 'resolved',
            remarks:
                'Complaint resolved. Repair work completed and verified on site.',
            photos: files,
        },
        {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                resolutionPhotos.value = [];
            },
            onFinish: () => {
                submitting.value = false;
            },
        },
    );
}

function addNote(): void {
    const body = noteBody.value.trim();

    if (body.length < 3) {
        return;
    }

    submitting.value = true;
    router.post(
        `/staff/complaints/${props.complaintId}/notes`,
        {
            comment: body,
            is_internal: noteIsInternal.value,
        },
        {
            preserveScroll: true,
            onSuccess: () => {
                noteBody.value = '';
            },
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
            color: complaint.value.category?.color ?? '#0284C7',
        },
    ];
});
</script>

<template>
    <Head :title="complaint ? complaint.title : 'Report not found'" />

    <div class="flex h-full flex-1 flex-col gap-4 p-4">
        <div class="flex items-center gap-3">
            <Button variant="ghost" size="icon-sm" as-child>
                <Link href="/staff/complaints" aria-label="Back to work queue">
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
            description="This report could not be found in your assigned queue."
            :icon="FileText"
        >
            <Button variant="outline" size="sm" as-child>
                <Link href="/staff/complaints">Back to assignments</Link>
            </Button>
        </EmptyState>

        <template v-else>
            <div class="space-y-2">
                <div class="flex flex-wrap items-center gap-2">
                    <StatusBadge :status="complaint.status" />
                    <span class="text-xs text-muted-foreground">
                        Priority set by the administrator during approval.
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
                            <CardTitle>Investigation details</CardTitle>
                            <CardDescription>
                                What the resident reported and where to find it.
                            </CardDescription>
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
                            </dl>
                        </CardContent>
                    </Card>

                    <Card class="gap-3">
                        <CardHeader>
                            <CardTitle>Resident photos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <EvidenceGallery
                                :attachments="complaint.evidence"
                                empty-label="The resident did not attach photos."
                            />
                        </CardContent>
                    </Card>

                    <Card class="gap-3">
                        <CardHeader>
                            <CardTitle>Resolution evidence</CardTitle>
                            <CardDescription>
                                Photos proving the work is done. The
                                administrator reviews them before closing.
                            </CardDescription>
                        </CardHeader>
                        <CardContent class="space-y-4">
                            <EvidenceGallery
                                v-if="complaint.resolutionEvidence.length"
                                :attachments="complaint.resolutionEvidence"
                            />
                            <ImageUploadPreview
                                v-if="canResolve"
                                v-model="resolutionPhotos"
                            />
                            <p
                                v-else-if="
                                    complaint.resolutionEvidence.length === 0
                                "
                                class="text-sm text-muted-foreground"
                            >
                                Start the investigation to attach resolution
                                photos.
                            </p>
                        </CardContent>
                    </Card>

                    <Card class="gap-3">
                        <CardHeader>
                            <CardTitle>Case notes</CardTitle>
                            <CardDescription>
                                Internal notes are visible to the municipal team
                                only.
                            </CardDescription>
                        </CardHeader>
                        <CardContent class="space-y-4">
                            <div class="space-y-3 rounded-lg border p-3">
                                <Textarea
                                    v-model="noteBody"
                                    :rows="3"
                                    placeholder="Record what you found on site…"
                                />
                                <div
                                    class="flex flex-wrap items-center justify-between gap-3"
                                >
                                    <Label
                                        class="flex items-center gap-2 text-xs font-normal"
                                    >
                                        <Checkbox
                                            :model-value="noteIsInternal"
                                            @update:model-value="
                                                noteIsInternal = Boolean($event)
                                            "
                                        />
                                        Internal note (not shown to the
                                        reporter)
                                    </Label>
                                    <Button
                                        size="sm"
                                        :disabled="
                                            noteBody.trim().length < 3 ||
                                            submitting
                                        "
                                        @click="addNote"
                                    >
                                        <Plus class="size-4" />
                                        Add note
                                    </Button>
                                </div>
                            </div>

                            <ul v-if="complaint.notes.length" class="space-y-4">
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
                            <p v-else class="text-sm text-muted-foreground">
                                No notes on this case yet.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div class="space-y-4">
                    <Card class="gap-3">
                        <CardHeader>
                            <CardTitle>Case actions</CardTitle>
                            <CardDescription>
                                Update investigation progress and submit
                                resolution updates.
                            </CardDescription>
                        </CardHeader>
                        <CardContent class="space-y-3">
                            <Button
                                v-if="canStart"
                                class="w-full"
                                :disabled="submitting"
                                @click="startInvestigation"
                            >
                                <ClipboardList class="size-4" />
                                Start investigation
                            </Button>

                            <Button
                                v-if="canResolve"
                                class="w-full"
                                :disabled="submitting"
                                @click="resolutionOpen = true"
                            >
                                <Check class="size-4" />
                                Submit resolution
                            </Button>

                            <p
                                v-if="complaint.status === 'resolved'"
                                class="text-sm text-muted-foreground"
                            >
                                Resolution recorded. The administrator reviews
                                the evidence and closes the case.
                            </p>
                            <p
                                v-else-if="
                                    complaint.status === 'closed' ||
                                    complaint.status === 'rejected'
                                "
                                class="text-sm text-muted-foreground"
                            >
                                This case is closed and read-only.
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
                                :show-barangays="false"
                                :show-legend="false"
                                :show-coordinates-badge="false"
                                caption="Exact site pin for this field assignment."
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
            v-model:open="resolutionOpen"
            title="Submit resolution?"
            description="Selected site photos will be uploaded and attached to this report. The administrator reviews the evidence before closing the case."
            confirm-label="Mark as resolved"
            @confirm="confirmResolution"
        />
    </div>
</template>
