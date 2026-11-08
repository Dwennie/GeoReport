<script setup lang="ts">
import CivicSeal from '@/components/CivicSeal.vue';
</script>

<template>
    <div class="flex items-center gap-2.5">
        <CivicSeal size="sm" class="shrink-0 drop-shadow-xs" />
        <div class="grid flex-1 text-left">
            <span
                class="truncate text-xs font-bold tracking-tight text-foreground uppercase"
            >
                Municipality of Loon
            </span>
            <span
                class="truncate font-mono text-[10px] leading-none font-medium tracking-tight text-emerald-600 dark:text-emerald-400"
            >
                GeoReport • loon.gov.ph
            </span>
        </div>
    </div>
</template>
