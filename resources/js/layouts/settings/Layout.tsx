import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SettingsLayoutProps {
    children: React.ReactNode;
}

const navItems = [
    { title: 'Profile', href: '/settings/profile' },
    { title: 'Security', href: '/settings/security' },
    { title: 'Appearance', href: '/settings/appearance' },
];

export default function SettingsLayout({ children }: SettingsLayoutProps) {
    const page = usePage();
    const currentUrl = page.url;

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Settings', href: '/settings/profile' },
            ]}
        >
            <div className="space-y-6">
                <div>
                    <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                        Settings
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Manage your profile and account credentials.
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row lg:space-x-8">
                    <aside className="w-full lg:w-48 mb-6 lg:mb-0">
                        <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto">
                            {navItems.map((item) => {
                                const isActive = currentUrl.startsWith(item.href);
                                return (
                                    <Button
                                        key={item.href}
                                        variant="ghost"
                                        asChild
                                        className={cn(
                                            'justify-start font-medium',
                                            isActive && 'bg-muted text-foreground'
                                        )}
                                    >
                                        <Link href={item.href}>{item.title}</Link>
                                    </Button>
                                );
                            })}
                        </nav>
                    </aside>

                    <div className="flex-1 max-w-2xl">
                        {children}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
