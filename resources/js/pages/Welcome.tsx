import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    CheckCircle2,
    MapPin,
    ShieldCheck,
    Wrench,
} from 'lucide-react';
import CivicSeal from '@/components/CivicSeal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { User } from '@/types';

export default function Welcome() {
    const page = usePage<{ auth?: { user?: User } }>();
    const user = page.props.auth?.user;

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            <Head title="GeoReport · Municipality of Loon, Province of Bohol" />

            {/* Top Republic Ribbon */}
            <div className="border-b border-slate-800 bg-[#0B1528] text-[11px] text-slate-300">
                <div className="flex h-1 w-full">
                    <div className="h-full w-1/3 bg-[#0038A8]" />
                    <div className="h-full w-1/3 bg-[#FCD116]" />
                    <div className="h-full w-1/3 bg-[#CE1126]" />
                </div>
                <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2 sm:px-6">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span className="font-bold tracking-wider text-white uppercase">
                            Republic of the Philippines
                        </span>
                        <span className="hidden text-slate-500 sm:inline">•</span>
                        <span>Municipality of Loon, Province of Bohol</span>
                    </div>
                    <span className="font-mono text-emerald-400">
                        GeoReport Municipal GIS System
                    </span>
                </div>
            </div>

            {/* Navigation */}
            <header className="border-b bg-card/50 backdrop-blur-xs">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                        <CivicSeal size="md" />
                        <div>
                            <span className="block text-sm font-bold tracking-tight">
                                GeoReport Loon
                            </span>
                            <span className="hidden text-xs text-muted-foreground sm:block">
                                Public Service & Community Concern Registry
                            </span>
                        </div>
                    </div>

                    <nav className="flex items-center gap-2">
                        {user ? (
                            <Button asChild size="sm">
                                <Link href="/dashboard">
                                    Go to Workspace
                                    <ArrowRight className="size-4 ml-1.5" />
                                </Link>
                            </Button>
                        ) : (
                            <>
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href="/login">Sign in</Link>
                                </Button>
                                <Button size="sm" asChild>
                                    <Link href="/register">Register</Link>
                                </Button>
                            </>
                        )}
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex flex-1 items-center">
                <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-12 lg:py-20">
                    <div className="flex flex-col justify-center space-y-6 lg:col-span-7">
                        <div className="space-y-3">
                            <Badge
                                variant="outline"
                                className="border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 w-fit"
                            >
                                Municipality of Loon · All 67 Barangays
                            </Badge>
                            <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
                                Report local concerns with GPS precision across Loon, Bohol.
                            </h1>
                            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
                                GeoReport connects Loon residents, field engineering
                                responders, and municipal administrators on one
                                unified OpenStreetMap platform for faster public
                                infrastructure and community issue resolution.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            {user ? (
                                <Button size="lg" asChild>
                                    <Link href="/dashboard">
                                        Open My Dashboard
                                        <ArrowRight className="size-4 ml-2" />
                                    </Link>
                                </Button>
                            ) : (
                                <>
                                    <Button size="lg" asChild>
                                        <Link href="/register">
                                            Report a Concern
                                            <ArrowRight className="size-4 ml-2" />
                                        </Link>
                                    </Button>
                                    <Button variant="outline" size="lg" asChild>
                                        <Link href="/login">Sign in to Existing Account</Link>
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="grid gap-4 lg:col-span-5">
                        <div className="rounded-xl border bg-card p-5 shadow-xs">
                            <div className="flex items-start gap-3.5">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                                    <MapPin className="size-4.5" />
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-sm font-semibold">
                                        OpenStreetMap Geolocation
                                    </h2>
                                    <p className="text-xs leading-relaxed text-muted-foreground">
                                        Pin exact locations across coastal,
                                        mainland, and upland barangays of Loon with
                                        photo evidence.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border bg-card p-5 shadow-xs">
                            <div className="flex items-start gap-3.5">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400">
                                    <Wrench className="size-4.5" />
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-sm font-semibold">
                                        Field Staff Dispatch
                                    </h2>
                                    <p className="text-xs leading-relaxed text-muted-foreground">
                                        Approved reports are assigned directly to
                                        municipal field staff for on-site inspection
                                        and documented repair.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border bg-card p-5 shadow-xs">
                            <div className="flex items-start gap-3.5">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
                                    <CheckCircle2 className="size-4.5" />
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-sm font-semibold">
                                        Transparent Progress Tracking
                                    </h2>
                                    <p className="text-xs leading-relaxed text-muted-foreground">
                                        Follow every status update from submission
                                        and review through field work and verified
                                        closure.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="border-t py-5 text-center text-xs text-muted-foreground">
                <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 sm:px-6">
                    <span>Municipal Government of Loon, Province of Bohol</span>
                    <span className="flex items-center gap-1.5">
                        <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                        Official GeoReport Portal
                    </span>
                </div>
            </footer>
        </div>
    );
}
