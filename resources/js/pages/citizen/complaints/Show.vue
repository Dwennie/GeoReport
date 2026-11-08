<script setup lang="ts">
import { computed } from 'vue';
import { Head, Link } from '@inertiajs/vue3';
import { ArrowLeft, FileText, MapPin } from '@lucide/vue';
import OpenStreetMap from '@/components/OpenStreetMap.vue';
import type { MapMarker } from '@/components/OpenStreetMap.vue';
import {
    ComplaintTimeline,
    EmptyState,
    EvidenceGallery,
    StatusBadge,
} from '@/components/geo';
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
import { useTaxonomy } from '@/lib/taxonomy';

import type { Complaint } from '@/types/geo';

const props = defineProps<{
    complaintId: number;
    complaintData?: Complaint;
}>();

const { findCategoryById } = useTaxonomy();

const complaint = computed(() => props.complaintData ?? null);

const category = computed(() => {
    if (!complaint.value) {
        return undefined;
    }

    return (
        complaint.value.category ?? findCategoryById(complaint.value.categoryId)
    );
});

/** Internal staff notes stay private to the city team. */
const publicNotes = computed(() =>
    complaint.value
        ? complaint.value.notes.filter((note) => !note.isInternal)
        : [],
);

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
            color: category.value?.color ?? '#DC2626',
        },
    ];
});
</script>

<template>
    <Head :title="complaint ? complaint.title : 'Report not found'" />

    <div class="flex h-full flex-1 flex-col gap-4 p-4">
        <div class="flex items-center gap-3">
            <Button variant="ghost" size="icon-sm" as-child>
                <Link href="/citizen/complaints" aria-label="Back to reports">
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
            description="This report could not be found in your submissions."
            :icon="FileText"
        >
            <Button variant="outline" size="sm" as-child>
                <Link href="/citizen/complaints">Back to my reports</Link>
            </Button>
        </EmptyState>

        <template v-else>
            <div class="space-y-2">
                <div class="flex flex-wrap items-center gap-2">
                    <StatusBadge :status="complaint.status" />
                    <span
                        v-if="category"
                        class="flex items-center gap-1.5 text-xs text-muted-foreground"
                    >
                        <span
                            class="size-2 rounded-full"
                            :style="{ backgroundColor: category.color }"
                        />
                        {{ category.name }}
                    </span>
                </div>
                <h1 class="text-xl font-semibold tracking-tight sm:text-2xl">
                    {{ complaint.title }}
                </h1>
                <p class="text-sm text-muted-foreground">
                    Submitted {{ formatDate(complaint.submittedAt) }} from
                    {{ complaint.barangay }}.
                </p>
            </div>

            <div class="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
                <div class="space-y-4">
                    <Card class="gap-3">
                        <CardHeader>
                            <CardTitle>What you reported</CardTitle>
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
                                                : 'Not assigned yet'
                                        }}
                                    </dd>
                                </div>
                                <div>
                                    <dt
                                        class="text-xs tracking-wide text-muted-foreground uppercase"
                                    >
                                        Last update
                                    </dt>
                                    <dd class="mt-0.5 text-sm">
                                        {{
                                            formatDateTime(complaint.updatedAt)
                                        }}
                                    </dd>
                                </div>
                            </dl>
                        </CardContent>
                    </Card>

                    <Card class="gap-3">
                        <CardHeader>
                            <CardTitle>Photos</CardTitle>
                            <CardDescription>
                                Evidence you attached when reporting.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <EvidenceGallery
                                :attachments="complaint.evidence"
                                empty-label="You did not attach photos to this report."
                            />
                        </CardContent>
                    </Card>

                    <Card
                        v-if="complaint.resolutionEvidence.length > 0"
                        class="gap-3"
                    >
                        <CardHeader>
                            <CardTitle>Resolution evidence</CardTitle>
                            <CardDescription>
                                Photos uploaded by staff after the work was
                                done.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <EvidenceGallery
                                :attachments="complaint.resolutionEvidence"
                            />
                        </CardContent>
                    </Card>

                    <Card class="gap-3">
                        <CardHeader>
                            <CardTitle>Updates from the city team</CardTitle>
                            <CardDescription>
                                Notes staff published about this report.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p
                                v-if="publicNotes.length === 0"
                                class="text-sm text-muted-foreground"
                            >
                                No public notes yet. You will be notified when
                                staff post an update.
                            </p>
                            <ul v-else class="space-y-4">
                                <li
                                    v-for="note in publicNotes"
                                    :key="note.id"
                                    class="space-y-1"
                                >
                                    <p class="text-sm leading-snug">
                                        {{ note.body }}
                                    </p>
                                    <p class="text-xs text-muted-foreground">
                                        {{ note.authorName }} ·
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
                            <CardTitle>Progress</CardTitle>
                            <CardDescription>
                                Where this report is in the review process.
                            </CardDescription>
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
                                caption="Your report pin at the recorded GPS coordinates."
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
    </div>
</template>
