import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SearchInputProps {
    value?: string;
    modelValue?: string;
    onChange?: (value: string) => void;
    onUpdateModelValue?: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export default function SearchInput({
    value,
    modelValue,
    onChange,
    onUpdateModelValue,
    placeholder = 'Search…',
    className,
}: SearchInputProps) {
    const currentValue = value ?? modelValue ?? '';

    const handleChange = (val: string) => {
        onChange?.(val);
        onUpdateModelValue?.(val);
    };

    return (
        <div className={cn('relative', className)}>
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                value={currentValue}
                placeholder={placeholder}
                className="pr-9 pl-9"
                onChange={(e) => handleChange(e.target.value)}
            />
            {currentValue && (
                <button
                    type="button"
                    aria-label="Clear search"
                    className="absolute top-1/2 right-2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    onClick={() => handleChange('')}
                >
                    <X className="size-3.5" />
                </button>
            )}
        </div>
    );
}
