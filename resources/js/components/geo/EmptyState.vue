<script setup lang="ts">
import type { Component } from 'vue';

withDefaults(
    defineProps<{
        title: string;
        description?: string;
        icon?: Component;
    }>(),
    {},
);
</script>

<template>
    <div
        class="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-12 text-center"
    >
        <div
            v-if="icon"
            class="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground"
        >
            <component :is="icon" class="size-5" />
        </div>
        <div class="space-y-1">
            <p class="text-sm font-medium">{{ title }}</p>
            <p
                v-if="description"
                class="mx-auto max-w-sm text-sm text-muted-foreground"
            >
                {{ description }}
            </p>
        </div>
        <div v-if="$slots.default" class="mt-1">
            <slot />
        </div>
    </div>
</template>
