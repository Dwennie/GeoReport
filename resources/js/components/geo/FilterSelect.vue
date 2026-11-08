<script setup lang="ts">
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export type FilterOption = {
    value: string;
    label: string;
};

withDefaults(
    defineProps<{
        modelValue: string;
        options: FilterOption[];
        placeholder?: string;
        ariaLabel?: string;
        disabled?: boolean;
        class?: string;
    }>(),
    {
        placeholder: 'Select…',
        disabled: false,
        class: 'w-full sm:w-[190px]',
    },
);

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
}>();
</script>

<template>
    <Select
        :model-value="modelValue"
        :disabled="disabled"
        @update:model-value="emit('update:modelValue', String($event))"
    >
        <SelectTrigger :class="$props.class" :aria-label="ariaLabel">
            <SelectValue :placeholder="placeholder" />
        </SelectTrigger>
        <SelectContent>
            <SelectItem
                v-for="option in options"
                :key="option.value"
                :value="option.value"
            >
                {{ option.label }}
            </SelectItem>
        </SelectContent>
    </Select>
</template>
