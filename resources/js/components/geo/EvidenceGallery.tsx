import React, { useState } from 'react';
import { ImageOff } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import type { ComplaintAttachment } from '@/types/geo';

interface EvidenceGalleryProps {
    attachments: ComplaintAttachment[];
    emptyLabel?: string;
}

export default function EvidenceGallery({
    attachments,
    emptyLabel = 'No photos attached.',
}: EvidenceGalleryProps) {
    const [active, setActive] = useState<ComplaintAttachment | null>(null);

    if (attachments.length === 0) {
        return (
            <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed px-3 py-8 text-sm text-muted-foreground">
                <ImageOff className="size-4" />
                {emptyLabel}
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {attachments.map((attachment) => (
                    <button
                        key={attachment.id}
                        type="button"
                        className="group overflow-hidden rounded-lg border text-left transition-colors hover:border-foreground/30 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                        onClick={() => setActive(attachment)}
                    >
                        <img
                            src={attachment.url}
                            alt={attachment.name}
                            loading="lazy"
                            className="aspect-[4/3] w-full bg-muted object-cover"
                        />
                        <span className="block truncate px-2 py-1.5 text-xs text-muted-foreground">
                            {attachment.name}
                        </span>
                    </button>
                ))}
            </div>

            <Dialog
                open={active !== null}
                onOpenChange={(open) => !open && setActive(null)}
            >
                <DialogContent className="sm:max-w-2xl">
                    <DialogTitle className="sr-only">
                        {active?.name}
                    </DialogTitle>
                    {active && (
                        <img
                            src={active.url}
                            alt={active.name}
                            className="w-full rounded-md border"
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
