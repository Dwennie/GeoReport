import React from 'react';
import CivicSeal from '@/components/CivicSeal';

export default function AppLogo() {
    return (
        <div className="flex items-center gap-2.5">
            <CivicSeal size="sm" className="shrink-0 drop-shadow-xs" />
            <div className="grid flex-1 text-left">
                <span className="truncate text-xs font-bold tracking-tight text-foreground uppercase">
                    Municipality of Loon
                </span>
                <span className="truncate font-mono text-[10px] leading-none font-medium tracking-tight text-emerald-600 dark:text-emerald-400">
                    GeoReport • loon.gov.ph
                </span>
            </div>
        </div>
    );
}
