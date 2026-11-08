<script setup lang="ts">
import { computed } from 'vue';
import { ChevronLeft, ChevronRight } from '@lucide/vue';
import { Button } from '@/components/ui/button';
import { formatNumber } from '@/lib/format';

const props = defineProps<{
    page: number;
    perPage: number;
    total: number;
}>();

const emit = defineEmits<{
    (e: 'update:page', page: number): void;
}>();

const pageCount = computed(() =>
    Math.max(Math.ceil(props.total / props.perPage), 1),
);

const firstRow = computed(() =>
    props.total === 0 ? 0 : (props.page - 1) * props.perPage + 1,
);

const lastRow = computed(() =>
    Math.min(props.page * props.perPage, props.total),
);
</script>

<template>
    <div class="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <p class="text-xs text-muted-foreground tabular-nums">
            Showing {{ formatNumber(firstRow) }}–{{ formatNumber(lastRow) }} of
            {{ formatNumber(total) }}
        </p>

        <div class="flex items-center gap-2">
            <Button
                variant="outline"
                size="sm"
                :disabled="page <= 1"
                @click="emit('update:page', page - 1)"
            >
                <ChevronLeft class="size-4" />
                Previous
            </Button>
            <span class="px-1 text-xs text-muted-foreground tabular-nums">
                Page {{ page }} of {{ pageCount }}
            </span>
            <Button
                variant="outline"
                size="sm"
                :disabled="page >= pageCount"
                @click="emit('update:page', page + 1)"
            >
                Next
                <ChevronRight class="size-4" />
            </Button>
        </div>
    </div>
</template>
