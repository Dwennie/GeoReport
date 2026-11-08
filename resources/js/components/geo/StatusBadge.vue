<script setup lang="ts">
import { computed } from 'vue';
import { Badge } from '@/components/ui/badge';
import { complaintStatusMeta } from '@/lib/statusMeta';
import type { ComplaintStatus } from '@/types/geo';

const props = withDefaults(
    defineProps<{
        status: ComplaintStatus;
        dot?: boolean;
    }>(),
    { dot: true },
);

const meta = computed(() => complaintStatusMeta[props.status]);
</script>

<template>
    <Badge variant="outline" :class="meta.badge">
        <span
            v-if="dot"
            class="size-1.5 shrink-0 rounded-full"
            :class="meta.dot"
        />
        {{ meta.label }}
    </Badge>
</template>
