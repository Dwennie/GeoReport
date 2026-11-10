import React from 'react';
import { Link } from '@inertiajs/react';
import CivicSeal from '@/components/CivicSeal';

interface AuthLayoutProps {
    title?: string;
    description?: string;
    children: React.ReactNode;
}

export default function AuthLayout({
    title,
    description,
    children,
}: AuthLayoutProps) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10 text-foreground">
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col items-center gap-3">
                        <Link
                            href="/"
                            className="flex flex-col items-center gap-2 font-medium"
                        >
                            <CivicSeal size="lg" className="drop-shadow-md" />
                            <div className="text-center">
                                <span className="block text-xs font-bold tracking-tight uppercase text-foreground">
                                    Municipality of Loon
                                </span>
                                <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
                                    GeoReport • loon.gov.ph
                                </span>
                            </div>
                        </Link>
                        {title && (
                            <div className="space-y-1 text-center mt-2">
                                <h1 className="text-xl font-bold tracking-tight">
                                    {title}
                                </h1>
                                {description && (
                                    <p className="text-center text-sm text-muted-foreground">
                                        {description}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
