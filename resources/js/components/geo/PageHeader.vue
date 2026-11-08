<script setup lang="ts">
defineProps<{
    title: string;
    description?: string;
    eyebrow?: string;
}>();
</script>

<template>
    <div
        class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
    >
        <div class="space-y-1">
            <p
                v-if="eyebrow"
                class="text-xs font-medium tracking-wide text-muted-foreground uppercase"
            >
                {{ eyebrow }}
            </p>
            <h1 class="text-xl font-semibold tracking-tight sm:text-2xl">
                {{ title }}
            </h1>
            <p
                v-if="description"
                class="max-w-2xl text-sm text-muted-foreground"
            >
                {{ description }}
            </p>
        </div>
        <div
            v-if="$slots.actions"
            class="flex shrink-0 flex-wrap items-center gap-2"
        >
            <slot name="actions" />
        </div>
    </div>
</template>
