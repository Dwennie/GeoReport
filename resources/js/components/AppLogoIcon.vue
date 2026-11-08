<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

defineOptions({
    inheritAttrs: false,
});

type Props = {
    className?: HTMLAttributes['class'];
};

defineProps<Props>();
</script>

<template>
    <img
        src="/images/loon-seal.png"
        alt="Municipality of Loon Official Seal"
        :class="['rounded-full object-contain select-none', className]"
        v-bind="$attrs"
    />
</template>
