import React from 'react';
import { cn } from '@/lib/utils';

export type FilterOption = {
    value: string;
    label: string;
};

interface FilterSelectProps {
    value?: string;
    modelValue?: string;
    onChange?: (value: string) => void;
    onUpdateModelValue?: (value: string) => void;
    options: FilterOption[];
    placeholder?: string;
    ariaLabel?: string;
    'aria-label'?: string;
    disabled?: boolean;
    className?: string;
    id?: string;
}

export default function FilterSelect({
    value,
    modelValue,
    onChange,
    onUpdateModelValue,
    options,
    placeholder = 'Select…',
    ariaLabel,
    'aria-label': ariaLabelAttr,
    disabled = false,
    className = 'w-full sm:w-[190px]',
    id,
}: FilterSelectProps) {
    const currentValue = value ?? modelValue ?? '';

    const handleChange = (val: string) => {
        onChange?.(val);
        onUpdateModelValue?.(val);
    };

    return (
        <select
            id={id}
            aria-label={ariaLabel ?? ariaLabelAttr}
            disabled={disabled}
            value={currentValue}
            onChange={(e) => handleChange(e.target.value)}
            className={cn(
                'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-foreground',
                className
            )}
        >
            {placeholder && (
                <option value="" disabled className="text-muted-foreground">
                    {placeholder}
                </option>
            )}
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
}
