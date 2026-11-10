import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    ChevronRight,
    LogOut,
    Menu,
    Moon,
    Settings,
    Sun,
    User as UserIcon,
    X,
} from 'lucide-react';
import { Toaster } from 'sonner';
import AppLogo from '@/components/AppLogo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppearance } from '@/composables/useAppearance';
import { useCurrentRole } from '@/composables/useCurrentRole';
import { navigation, roleHome, roleWorkspace } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem, User } from '@/types';

interface AppLayoutProps {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}

export default function AppLayout({ breadcrumbs = [], children }: AppLayoutProps) {
    const { role } = useCurrentRole();
    const page = usePage<{ auth?: { user?: User } }>();
    const user = page.props.auth?.user;
    const { resolvedAppearance, updateAppearance } = useAppearance();

    const [mobileOpen, setMobileOpen] = useState(false);

    const groups = navigation[role] ?? [];
    const home = roleHome[role] ?? '/';
    const workspaceName = roleWorkspace[role] ?? 'Workspace';

    const currentUrl = page.url;

    const initials = user?.name
        ? user.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)
        : 'U';

    return (
        <div className="flex min-h-screen w-full bg-background text-foreground">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-64 flex-col border-r bg-card/60 backdrop-blur-xs shrink-0 select-none">
                <div className="flex h-16 items-center border-b px-4">
                    <Link href={home} className="flex items-center gap-2">
                        <AppLogo />
                    </Link>
                </div>

                <div className="px-3 py-2 text-[10px] font-bold tracking-wider text-muted-foreground/80 uppercase">
                    {workspaceName}
                </div>

                <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-1">
                    {groups.map((group) => (
                        <div key={group.label} className="space-y-1">
                            <p className="px-3 text-[11px] font-semibold text-muted-foreground/60 uppercase">
                                {group.label}
                            </p>
                            <div className="space-y-0.5">
                                {group.items.map((item) => {
                                    const Icon = item.icon;
                                    const isActive =
                                        currentUrl === item.href ||
                                        currentUrl.startsWith(item.href + '/');

                                    return (
                                        <Link
                                            key={item.title}
                                            href={item.href}
                                            className={cn(
                                                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                                isActive
                                                    ? 'bg-primary/10 text-primary font-semibold'
                                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                            )}
                                        >
                                            {Icon && <Icon className="size-4 shrink-0" />}
                                            <span className="truncate">{item.title}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Sidebar Bottom User Profile */}
                <div className="border-t p-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger as-child>
                            <button
                                type="button"
                                className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-muted transition-colors outline-none"
                            >
                                <Avatar className="size-8">
                                    <AvatarImage src={user?.avatar} />
                                    <AvatarFallback className="bg-primary/15 text-primary text-xs font-bold">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-xs font-semibold leading-tight">
                                        {user?.name}
                                    </p>
                                    <p className="truncate text-[11px] text-muted-foreground">
                                        {user?.email}
                                    </p>
                                </div>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        {user?.name}
                                    </p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        {user?.email}
                                    </p>
                                    <Badge
                                        variant="outline"
                                        className="mt-1 w-fit text-[10px] uppercase font-bold text-primary"
                                    >
                                        {user?.role ?? 'citizen'}
                                    </Badge>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem as-child>
                                <Link
                                    href="/settings/profile"
                                    className="flex w-full items-center cursor-pointer"
                                >
                                    <Settings className="mr-2 size-4" />
                                    Settings
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() =>
                                    updateAppearance(
                                        resolvedAppearance === 'dark' ? 'light' : 'dark'
                                    )
                                }
                                className="cursor-pointer"
                            >
                                {resolvedAppearance === 'dark' ? (
                                    <>
                                        <Sun className="mr-2 size-4" /> Light mode
                                    </>
                                ) : (
                                    <>
                                        <Moon className="mr-2 size-4" /> Dark mode
                                    </>
                                )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem as-child>
                                <Link
                                    href="/logout"
                                    method="post"
                                    as="button"
                                    className="flex w-full items-center text-rose-500 cursor-pointer"
                                >
                                    <LogOut className="mr-2 size-4" /> Log out
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </aside>

            {/* Mobile Sheet / Drawer */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 flex lg:hidden">
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-xs"
                        onClick={() => setMobileOpen(false)}
                    />
                    <div className="relative flex w-72 flex-col bg-background border-r p-4 shadow-xl">
                        <div className="flex items-center justify-between border-b pb-3">
                            <AppLogo />
                            <button
                                type="button"
                                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
                                onClick={() => setMobileOpen(false)}
                            >
                                <X className="size-5" />
                            </button>
                        </div>
                        <nav className="flex-1 space-y-5 overflow-y-auto py-4">
                            {groups.map((group) => (
                                <div key={group.label} className="space-y-1">
                                    <p className="px-2 text-xs font-semibold text-muted-foreground uppercase">
                                        {group.label}
                                    </p>
                                    <div className="space-y-0.5">
                                        {group.items.map((item) => {
                                            const Icon = item.icon;
                                            const isActive =
                                                currentUrl === item.href ||
                                                currentUrl.startsWith(item.href + '/');

                                            return (
                                                <Link
                                                    key={item.title}
                                                    href={item.href}
                                                    onClick={() => setMobileOpen(false)}
                                                    className={cn(
                                                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium',
                                                        isActive
                                                            ? 'bg-primary/10 text-primary font-semibold'
                                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                                    )}
                                                >
                                                    {Icon && <Icon className="size-4 shrink-0" />}
                                                    <span>{item.title}</span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </nav>
                        <div className="border-t pt-3">
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-rose-500 hover:bg-rose-500/10"
                            >
                                <LogOut className="size-4" /> Log out
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Area */}
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                {/* Top Header */}
                <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/90 px-4 backdrop-blur-xs sm:px-6">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            className="lg:hidden rounded-md p-1.5 text-muted-foreground hover:bg-muted"
                            onClick={() => setMobileOpen(true)}
                            aria-label="Open menu"
                        >
                            <Menu className="size-5" />
                        </button>

                        {/* Breadcrumbs */}
                        {breadcrumbs.length > 0 && (
                            <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                {breadcrumbs.map((crumb, idx) => (
                                    <React.Fragment key={crumb.title}>
                                        {idx > 0 && (
                                            <ChevronRight className="size-3 text-muted-foreground/40" />
                                        )}
                                        {idx === breadcrumbs.length - 1 ? (
                                            <span className="font-semibold text-foreground">
                                                {crumb.title}
                                            </span>
                                        ) : (
                                            <Link
                                                href={crumb.href}
                                                className="hover:text-foreground hover:underline"
                                            >
                                                {crumb.title}
                                            </Link>
                                        )}
                                    </React.Fragment>
                                ))}
                            </nav>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() =>
                                updateAppearance(
                                    resolvedAppearance === 'dark' ? 'light' : 'dark'
                                )
                            }
                            aria-label="Toggle theme"
                        >
                            {resolvedAppearance === 'dark' ? (
                                <Sun className="size-4 text-amber-400" />
                            ) : (
                                <Moon className="size-4 text-slate-700" />
                            )}
                        </Button>
                    </div>
                </header>

                {/* Main Page Content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>

            <Toaster position="top-right" richColors />
        </div>
    );
}
