<script setup lang="ts">
import { Search, X } from '@lucide/vue';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

withDefaults(
    defineProps<{
        modelValue: string;
        placeholder?: string;
        class?: string;
    }>(),
    { placeholder: 'Search…' },
);

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
}>();
</script>

<template>
    <div :class="cn('relative', $props.class)">
        <Search
            class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
            :model-value="modelValue"
            :placeholder="placeholder"
            class="pr-9 pl-9"
            @update:model-value="emit('update:modelValue', String($event))"
        />
        <button
            v-if="modelValue"
            type="button"
            aria-label="Clear search"
            class="absolute top-1/2 right-2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            @click="emit('update:modelValue', '')"
        >
            <X class="size-3.5" />
        </button>
    </div>
</template>
