import React from 'react';
import { Check } from 'lucide-react';
import { formatDateTime } from '@/lib/format';
import { complaintLifecycle, complaintStatusMeta } from '@/lib/statusMeta';
import { cn } from '@/lib/utils';
import type { ComplaintStatus, ComplaintStatusEvent } from '@/types/geo';

interface ComplaintTimelineProps {
    events: ComplaintStatusEvent[];
    status: ComplaintStatus;
}

type RailStep = {
    key: string;
    status: ComplaintStatus;
    label: string;
    note?: string;
    actorName?: string;
    createdAt?: string;
    state: 'done' | 'current' | 'upcoming';
};

const upcomingLabels: Record<ComplaintStatus, string> = {
    pending: 'Queued for review',
    approved: 'Approval by the administrator',
    assigned: 'Assignment to field staff',
    in_progress: 'Field investigation',
    resolved: 'Resolution and evidence',
    closed: 'Case closure',
    rejected: 'Rejection',
};

export default function ComplaintTimeline({
    events,
    status,
}: ComplaintTimelineProps) {
    const recorded: RailStep[] = events.map((event, index) => ({
        key: `event-${event.id}`,
        status: event.status,
        label: event.label,
        note: event.note,
        actorName: event.actorName,
        createdAt: event.createdAt,
        state: index === events.length - 1 ? 'current' : 'done',
    }));

    const isTerminal = status === 'rejected' || status === 'closed';

    let steps = recorded;
    if (!isTerminal) {
        const currentStep = complaintStatusMeta[status]?.step ?? 0;
        const upcoming = complaintLifecycle
            .filter((s) => (complaintStatusMeta[s]?.step ?? 0) > currentStep)
            .map<RailStep>((s) => ({
                key: `upcoming-${s}`,
                status: s,
                label: upcomingLabels[s],
                state: 'upcoming',
            }));
        steps = [...recorded, ...upcoming];
    }

    function nodeClass(step: RailStep): string {
        if (step.state === 'done') {
            return 'border-primary bg-primary text-primary-foreground';
        }
        if (step.state === 'current') {
            return 'border-foreground/25 bg-background';
        }
        return 'border-border border-dashed bg-background';
    }

    return (
        <ol className="space-y-0">
            {steps.map((step, index) => (
                <li
                    key={step.key}
                    className="relative flex gap-3 pb-5 last:pb-0"
                >
                    {index < steps.length - 1 && (
                        <span
                            aria-hidden="true"
                            className={cn(
                                'absolute top-6 bottom-0 left-[11px] border-l',
                                step.state === 'upcoming'
                                    ? 'border-dashed border-border'
                                    : 'border-primary/30'
                            )}
                        />
                    )}

                    <span
                        className={cn(
                            'relative z-10 mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-medium',
                            nodeClass(step)
                        )}
                    >
                        {step.state === 'done' ? (
                            <Check className="size-3" />
                        ) : step.state === 'current' ? (
                            <span
                                className={cn(
                                    'size-1.5 rounded-full',
                                    complaintStatusMeta[step.status]?.dot
                                )}
                            />
                        ) : (
                            <span className="text-muted-foreground">
                                {index + 1}
                            </span>
                        )}
                    </span>

                    <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex flex-wrap items-center gap-x-2">
                            <p
                                className={cn(
                                    'text-sm font-medium',
                                    step.state === 'upcoming' &&
                                        'font-normal text-muted-foreground'
                                )}
                            >
                                {step.label}
                            </p>
                            {step.state === 'current' && (
                                <span className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                                    Current
                                </span>
                            )}
                        </div>

                        {step.createdAt && (
                            <p className="text-xs text-muted-foreground tabular-nums">
                                {formatDateTime(step.createdAt)}
                                {step.actorName && ` · ${step.actorName}`}
                            </p>
                        )}

                        {step.note && (
                            <p className="text-xs text-muted-foreground">
                                {step.note}
                            </p>
                        )}
                    </div>
                </li>
            ))}
        </ol>
    );
}
