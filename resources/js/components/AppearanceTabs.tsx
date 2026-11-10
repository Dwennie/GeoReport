import React from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useAppearance } from '@/composables/useAppearance';
import { cn } from '@/lib/utils';

export default function AppearanceTabs() {
    const { appearance, updateAppearance } = useAppearance();

    const tabs = [
        { value: 'light', icon: Sun, label: 'Light' },
        { value: 'dark', icon: Moon, label: 'Dark' },
        { value: 'system', icon: Monitor, label: 'System' },
    ] as const;

    return (
        <div className="inline-flex gap-1 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800">
            {tabs.map(({ value, icon: Icon, label }) => {
                const isSelected = appearance === value;
                return (
                    <button
                        key={value}
                        type="button"
                        onClick={() => updateAppearance(value)}
                        className={cn(
                            'flex items-center rounded-md px-3.5 py-1.5 transition-colors',
                            isSelected
                                ? 'bg-white shadow-xs dark:bg-neutral-700 dark:text-neutral-100'
                                : 'text-neutral-500 hover:bg-neutral-200/60 hover:text-black dark:text-neutral-400 dark:hover:bg-neutral-700/60'
                        )}
                    >
                        <Icon className="-ml-1 h-4 w-4" />
                        <span className="ml-1.5 text-sm">{label}</span>
                    </button>
                );
            })}
        </div>
    );
}
