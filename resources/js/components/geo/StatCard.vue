<script setup lang="ts">
import type { Component } from 'vue';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

defineProps<{
    label: string;
    value: string | number;
    hint?: string;
    icon?: Component;
    /** Tailwind text colour applied to the value, e.g. `text-rose-600`. */
    accent?: string;
    class?: string;
}>();
</script>

<template>
    <Card :class="cn('gap-0 py-4', $props.class)">
        <CardContent class="px-4">
            <div class="flex items-start justify-between gap-3">
                <p
                    class="text-xs font-medium tracking-wide text-muted-foreground uppercase"
                >
                    {{ label }}
                </p>
                <component
                    :is="icon"
                    v-if="icon"
                    class="size-4 shrink-0 text-muted-foreground/50"
                />
            </div>
            <p class="mt-2 text-2xl font-semibold tabular-nums" :class="accent">
                {{ value }}
            </p>
            <p v-if="hint" class="mt-1 text-xs text-muted-foreground">
                {{ hint }}
            </p>
        </CardContent>
    </Card>
</template>
