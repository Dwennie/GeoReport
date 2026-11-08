<script setup lang="ts">
import { computed } from 'vue';
import { Badge } from '@/components/ui/badge';
import { complaintPriorityMeta } from '@/lib/statusMeta';
import type { ComplaintPriority } from '@/types/geo';

const props = defineProps<{
    priority: ComplaintPriority;
}>();

const meta = computed(() => complaintPriorityMeta[props.priority]);
</script>

<template>
    <Badge variant="outline" :class="meta.badge">
        {{ meta.label }}
    </Badge>
</template>
