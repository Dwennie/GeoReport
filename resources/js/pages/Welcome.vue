<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3';
import {
    ArrowRight,
    CheckCircle2,
    MapPin,
    ShieldCheck,
    Wrench,
} from '@lucide/vue';
import CivicSeal from '@/components/CivicSeal.vue';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { dashboard, login, register } from '@/routes';
</script>

<template>
    <Head title="GeoReport · Municipality of Loon, Province of Bohol" />

    <div class="flex min-h-screen flex-col bg-background text-foreground">
        <!-- Top Republic Ribbon -->
        <div
            class="border-b border-slate-800 bg-[#0B1528] text-[11px] text-slate-300"
        >
            <div class="flex h-1 w-full">
                <div class="h-full w-1/3 bg-[#0038A8]" />
                <div class="h-full w-1/3 bg-[#FCD116]" />
                <div class="h-full w-1/3 bg-[#CE1126]" />
            </div>
            <div
                class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2 sm:px-6"
            >
                <div class="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span class="font-bold tracking-wider text-white uppercase"
                        >Republic of the Philippines</span
                    >
                    <span class="hidden text-slate-500 sm:inline">•</span>
                    <span>Municipality of Loon, Province of Bohol</span>
                </div>
                <span class="font-mono text-emerald-400"
                    >GeoReport Municipal GIS System</span
                >
            </div>
        </div>

        <!-- Navigation -->
        <header class="border-b bg-card/50 backdrop-blur-xs">
            <div
                class="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6"
            >
                <div class="flex items-center gap-3">
                    <CivicSeal size="md" />
                    <div>
                        <span class="block text-sm font-bold tracking-tight"
                            >GeoReport Loon</span
                        >
                        <span
                            class="hidden text-xs text-muted-foreground sm:block"
                            >Public Service & Community Concern Registry</span
                        >
                    </div>
                </div>

                <nav class="flex items-center gap-2">
                    <Button v-if="$page.props.auth.user" as-child size="sm">
                        <Link :href="dashboard()">
                            Go to Workspace
                            <ArrowRight class="size-4" />
                        </Link>
                    </Button>
                    <template v-else>
                        <Button variant="ghost" size="sm" as-child>
                            <Link :href="login()">Sign in</Link>
                        </Button>
                        <Button size="sm" as-child>
                            <Link :href="register()">Register</Link>
                        </Button>
                    </template>
                </nav>
            </div>
        </header>

        <!-- Hero Section -->
        <main class="flex flex-1 items-center">
            <div
                class="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-12 lg:py-20"
            >
                <div
                    class="flex flex-col justify-center space-y-6 lg:col-span-7"
                >
                    <div class="space-y-3">
                        <Badge
                            variant="outline"
                            class="border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                        >
                            Municipality of Loon · All 67 Barangays
                        </Badge>
                        <h1
                            class="text-3xl font-black tracking-tight sm:text-5xl"
                        >
                            Report local concerns with GPS precision across
                            Loon, Bohol.
                        </h1>
                        <p
                            class="max-w-2xl text-base leading-relaxed text-muted-foreground"
                        >
                            GeoReport connects Loon residents, field engineering
                            responders, and municipal administrators on one
                            unified OpenStreetMap platform for faster public
                            infrastructure and community issue resolution.
                        </p>
                    </div>

                    <div class="flex flex-wrap items-center gap-3">
                        <Button v-if="$page.props.auth.user" size="lg" as-child>
                            <Link :href="dashboard()">
                                Open My Dashboard
                                <ArrowRight class="size-4" />
                            </Link>
                        </Button>
                        <template v-else>
                            <Button size="lg" as-child>
                                <Link :href="register()">
                                    Report a Concern
                                    <ArrowRight class="size-4" />
                                </Link>
                            </Button>
                            <Button variant="outline" size="lg" as-child>
                                <Link :href="login()"
                                    >Sign in to Existing Account</Link
                                >
                            </Button>
                        </template>
                    </div>
                </div>

                <div class="grid gap-4 lg:col-span-5">
                    <div class="rounded-xl border bg-card p-5 shadow-xs">
                        <div class="flex items-start gap-3.5">
                            <div
                                class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            >
                                <MapPin class="size-4.5" />
                            </div>
                            <div class="space-y-1">
                                <h2 class="text-sm font-semibold">
                                    OpenStreetMap Geolocation
                                </h2>
                                <p
                                    class="text-xs leading-relaxed text-muted-foreground"
                                >
                                    Pin exact locations across coastal,
                                    mainland, and upland barangays of Loon with
                                    photo evidence.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div class="rounded-xl border bg-card p-5 shadow-xs">
                        <div class="flex items-start gap-3.5">
                            <div
                                class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400"
                            >
                                <Wrench class="size-4.5" />
                            </div>
                            <div class="space-y-1">
                                <h2 class="text-sm font-semibold">
                                    Field Staff Dispatch
                                </h2>
                                <p
                                    class="text-xs leading-relaxed text-muted-foreground"
                                >
                                    Approved reports are assigned directly to
                                    municipal field staff for on-site inspection
                                    and documented repair.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div class="rounded-xl border bg-card p-5 shadow-xs">
                        <div class="flex items-start gap-3.5">
                            <div
                                class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400"
                            >
                                <CheckCircle2 class="size-4.5" />
                            </div>
                            <div class="space-y-1">
                                <h2 class="text-sm font-semibold">
                                    Transparent Progress Tracking
                                </h2>
                                <p
                                    class="text-xs leading-relaxed text-muted-foreground"
                                >
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

        <footer class="border-t py-5 text-center text-xs text-muted-foreground">
            <div
                class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 sm:px-6"
            >
                <span>Municipal Government of Loon, Province of Bohol</span>
                <span class="flex items-center gap-1.5">
                    <ShieldCheck
                        class="size-3.5 text-emerald-600 dark:text-emerald-400"
                    />
                    Official GeoReport Portal
                </span>
            </div>
        </footer>
    </div>
</template>
