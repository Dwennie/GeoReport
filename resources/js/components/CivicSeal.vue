<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

defineOptions({
    inheritAttrs: false,
});

type Props = {
    class?: HTMLAttributes['class'];
    size?: 'sm' | 'md' | 'lg' | 'xl';
};

const props = withDefaults(defineProps<Props>(), {
    size: 'md',
});

const sizeClasses = {
    sm: 'size-8',
    md: 'size-10',
    lg: 'size-14',
    xl: 'size-20',
};
</script>

<template>
    <img
        src="/images/loon-seal.png"
        alt="Municipality of Loon Official Seal"
        :class="[
            sizeClasses[props.size],
            'rounded-full object-contain select-none',
            props.class,
        ]"
        v-bind="$attrs"
    />
</template>
