<script setup lang="ts">
import { computed, ref } from 'vue';
import { ImageOff } from '@lucide/vue';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import type { ComplaintAttachment } from '@/types/geo';

const props = withDefaults(
    defineProps<{
        attachments: ComplaintAttachment[];
        emptyLabel?: string;
    }>(),
    { emptyLabel: 'No photos attached.' },
);

const active = ref<ComplaintAttachment | null>(null);

const isOpen = computed({
    get: () => active.value !== null,
    set: (value: boolean) => {
        if (!value) {
            active.value = null;
        }
    },
});
</script>

<template>
    <div class="space-y-3">
        <div
            v-if="props.attachments.length === 0"
            class="flex items-center justify-center gap-2 rounded-lg border border-dashed px-3 py-8 text-sm text-muted-foreground"
        >
            <ImageOff class="size-4" />
            {{ emptyLabel }}
        </div>

        <div v-else class="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <button
                v-for="attachment in props.attachments"
                :key="attachment.id"
                type="button"
                class="group overflow-hidden rounded-lg border text-left transition-colors hover:border-foreground/30 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                @click="active = attachment"
            >
                <img
                    :src="attachment.url"
                    :alt="attachment.name"
                    loading="lazy"
                    class="aspect-[4/3] w-full bg-muted object-cover"
                />
                <span
                    class="block truncate px-2 py-1.5 text-xs text-muted-foreground"
                >
                    {{ attachment.name }}
                </span>
            </button>
        </div>

        <Dialog v-model:open="isOpen">
            <DialogContent class="sm:max-w-2xl">
                <DialogTitle class="sr-only">
                    {{ active?.name }}
                </DialogTitle>
                <img
                    v-if="active"
                    :src="active.url"
                    :alt="active.name"
                    class="w-full rounded-md border"
                />
            </DialogContent>
        </Dialog>
    </div>
</template>
