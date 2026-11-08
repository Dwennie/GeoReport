<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue';
import { ImagePlus, X } from '@lucide/vue';
import { Button } from '@/components/ui/button';

export type ImagePreview = {
    id: string;
    name: string;
    url: string;
    file?: File;
};

const props = defineProps<{
    modelValue?: ImagePreview[];
}>();

const emit = defineEmits<{
    (e: 'update:modelValue', value: ImagePreview[]): void;
}>();

const previews = ref<ImagePreview[]>(props.modelValue ?? []);
const input = ref<HTMLInputElement | null>(null);

watch(
    () => props.modelValue,
    (value) => {
        previews.value = value ?? [];
    },
);

function chooseFiles(): void {
    input.value?.click();
}

function onSelect(event: Event): void {
    const target = event.target as HTMLInputElement;
    const files = Array.from(target.files ?? []);

    const added: ImagePreview[] = files.map((file, index) => ({
        id: `${file.name}-${file.lastModified}-${index}`,
        name: file.name,
        url: URL.createObjectURL(file),
        file,
    }));

    previews.value = [...previews.value, ...added];
    emit('update:modelValue', previews.value);

    target.value = '';
}

function remove(id: string): void {
    const target = previews.value.find((preview) => preview.id === id);

    if (target) {
        URL.revokeObjectURL(target.url);
    }

    previews.value = previews.value.filter((preview) => preview.id !== id);
    emit('update:modelValue', previews.value);
}

onBeforeUnmount(() => {
    previews.value.forEach((preview) => URL.revokeObjectURL(preview.url));
});
</script>

<template>
    <div class="space-y-3">
        <input
            ref="input"
            type="file"
            accept="image/*"
            multiple
            class="hidden"
            @change="onSelect"
        />

        <div
            class="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-6 text-center"
        >
            <ImagePlus class="size-5 text-muted-foreground" />
            <p class="text-sm font-medium">Add photos</p>
            <p class="text-xs text-muted-foreground">
                JPG or PNG, up to 5 files. Photos help staff locate the concern.
            </p>
            <Button
                type="button"
                variant="outline"
                size="sm"
                class="mt-1"
                @click="chooseFiles"
            >
                Choose photos
            </Button>
        </div>

        <div
            v-if="previews.length"
            class="grid grid-cols-2 gap-3 sm:grid-cols-4"
        >
            <div
                v-for="preview in previews"
                :key="preview.id"
                class="group relative overflow-hidden rounded-lg border"
            >
                <img
                    :src="preview.url"
                    :alt="preview.name"
                    class="aspect-square w-full bg-muted object-cover"
                />
                <button
                    type="button"
                    :aria-label="`Remove ${preview.name}`"
                    class="absolute top-1.5 right-1.5 rounded-full border bg-background/90 p-1 shadow-sm transition-colors hover:bg-background"
                    @click="remove(preview.id)"
                >
                    <X class="size-3.5" />
                </button>
                <span
                    class="block truncate bg-background px-2 py-1 text-[11px] text-muted-foreground"
                >
                    {{ preview.name }}
                </span>
            </div>
        </div>

        <p class="text-xs text-muted-foreground">
            Selected photos are uploaded securely and attached to the report
            upon submission.
        </p>
    </div>
</template>
