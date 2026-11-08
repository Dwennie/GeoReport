<script setup lang="ts">
import { computed } from 'vue';
import { Badge } from '@/components/ui/badge';
import { useTaxonomy } from '@/lib/taxonomy';

const props = defineProps<{
    categoryId: number;
    category?: {
        name: string;
        color: string;
    } | null;
}>();

const { findCategoryById } = useTaxonomy();

const resolvedCategory = computed(
    () => props.category ?? findCategoryById(props.categoryId),
);
</script>

<template>
    <Badge
        variant="outline"
        class="border-border/70 font-normal text-muted-foreground"
    >
        <span
            class="size-2 shrink-0 rounded-full"
            :style="{
                backgroundColor: resolvedCategory?.color ?? 'currentColor',
            }"
        />
        {{ resolvedCategory?.name ?? 'Uncategorized' }}
    </Badge>
</template>
