<script setup lang="ts">
import { computed } from 'vue';
import { Check } from '@lucide/vue';
import { formatDateTime } from '@/lib/format';
import { complaintLifecycle, complaintStatusMeta } from '@/lib/statusMeta';
import type { ComplaintStatus, ComplaintStatusEvent } from '@/types/geo';

const props = defineProps<{
    events: ComplaintStatusEvent[];
    /** Current status, used to draw the remaining steps of the process. */
    status: ComplaintStatus;
}>();

type RailStep = {
    key: string;
    status: ComplaintStatus;
    label: string;
    note?: string;
    actorName?: string;
    createdAt?: string;
    state: 'done' | 'current' | 'upcoming';
};

/** Process wording for steps that have not happened yet. */
const upcomingLabels: Record<ComplaintStatus, string> = {
    pending: 'Queued for review',
    approved: 'Approval by the administrator',
    assigned: 'Assignment to field staff',
    in_progress: 'Field investigation',
    resolved: 'Resolution and evidence',
    closed: 'Case closure',
    rejected: 'Rejection',
};

const steps = computed<RailStep[]>(() => {
    const recorded: RailStep[] = props.events.map((event, index) => ({
        key: `event-${event.id}`,
        status: event.status,
        label: event.label,
        note: event.note,
        actorName: event.actorName,
        createdAt: event.createdAt,
        state: index === props.events.length - 1 ? 'current' : 'done',
    }));

    const isTerminal = props.status === 'rejected' || props.status === 'closed';

    if (isTerminal) {
        return recorded;
    }

    const currentStep = complaintStatusMeta[props.status].step;

    const upcoming = complaintLifecycle
        .filter((status) => complaintStatusMeta[status].step > currentStep)
        .map<RailStep>((status) => ({
            key: `upcoming-${status}`,
            status,
            label: upcomingLabels[status],
            state: 'upcoming',
        }));

    return [...recorded, ...upcoming];
});

function nodeClass(step: RailStep): string {
    if (step.state === 'done') {
        return 'border-primary bg-primary text-primary-foreground';
    }

    if (step.state === 'current') {
        return 'border-foreground/25 bg-background';
    }

    return 'border-border border-dashed bg-background';
}
</script>

<template>
    <ol class="space-y-0">
        <li
            v-for="(step, index) in steps"
            :key="step.key"
            class="relative flex gap-3 pb-5 last:pb-0"
        >
            <span
                v-if="index < steps.length - 1"
                aria-hidden="true"
                class="absolute top-6 bottom-0 left-[11px] border-l"
                :class="
                    step.state === 'upcoming'
                        ? 'border-dashed border-border'
                        : 'border-primary/30'
                "
            />

            <span
                class="relative z-10 mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-medium"
                :class="nodeClass(step)"
            >
                <Check v-if="step.state === 'done'" class="size-3" />
                <span
                    v-else-if="step.state === 'current'"
                    class="size-1.5 rounded-full"
                    :class="complaintStatusMeta[step.status].dot"
                />
                <span v-else class="text-muted-foreground">
                    {{ index + 1 }}
                </span>
            </span>

            <div class="min-w-0 flex-1 space-y-0.5">
                <div class="flex flex-wrap items-center gap-x-2">
                    <p
                        class="text-sm font-medium"
                        :class="
                            step.state === 'upcoming'
                                ? 'font-normal text-muted-foreground'
                                : ''
                        "
                    >
                        {{ step.label }}
                    </p>
                    <span
                        v-if="step.state === 'current'"
                        class="text-[10px] font-medium tracking-wide text-muted-foreground uppercase"
                    >
                        Current
                    </span>
                </div>

                <p
                    v-if="step.createdAt"
                    class="text-xs text-muted-foreground tabular-nums"
                >
                    {{ formatDateTime(step.createdAt) }}
                    <template v-if="step.actorName">
                        · {{ step.actorName }}
                    </template>
                </p>

                <p v-if="step.note" class="text-xs text-muted-foreground">
                    {{ step.note }}
                </p>
            </div>
        </li>
    </ol>
</template>
