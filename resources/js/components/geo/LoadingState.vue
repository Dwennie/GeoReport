<script setup lang="ts">
import { Skeleton } from '@/components/ui/skeleton';

withDefaults(
    defineProps<{
        variant?: 'table' | 'cards' | 'list';
        rows?: number;
    }>(),
    { variant: 'table', rows: 5 },
);
</script>

<template>
    <div
        v-if="variant === 'cards'"
        class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
        <Skeleton
            v-for="row in rows"
            :key="row"
            class="h-[104px] w-full rounded-xl"
        />
    </div>

    <div v-else-if="variant === 'list'" class="space-y-3">
        <Skeleton
            v-for="row in rows"
            :key="row"
            class="h-16 w-full rounded-lg"
        />
    </div>

    <div v-else class="space-y-2">
        <Skeleton class="h-9 w-full rounded-md" />
        <Skeleton
            v-for="row in rows"
            :key="row"
            class="h-11 w-full rounded-md"
        />
    </div>
</template>
