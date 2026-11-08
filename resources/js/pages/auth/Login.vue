<script setup lang="ts">
import { Head, Link, useForm } from '@inertiajs/vue3';
import {
    AlertTriangle,
    ArrowRight,
    Lock,
    MapPin,
    PhoneCall,
    Scale,
    ShieldCheck,
} from '@lucide/vue';
import CivicSeal from '@/components/CivicSeal.vue';
import InputError from '@/components/InputError.vue';
import PasskeyVerify from '@/components/PasskeyVerify.vue';
import PasswordInput from '@/components/PasswordInput.vue';
import TextLink from '@/components/TextLink.vue';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { request } from '@/routes/password';

defineProps<{
    status?: string;
    canResetPassword?: boolean;
}>();

const form = useForm({
    email: '',
    password: '',
    remember: false,
});

function submit() {
    form.post('/login', {
        onFinish: () => form.reset('password'),
    });
}
</script>

<template>
    <Head
        title="Official Portal of the Municipality of Loon, Province of Bohol · GeoReport Sign In"
    />

    <div
        class="relative flex min-h-screen w-full flex-col bg-background font-sans"
    >
        <!-- Top GovPH Official Government Ribbon -->
        <div
            class="relative z-30 border-b border-slate-800 bg-[#0B1528] text-[11px] text-zinc-300"
        >
            <!-- Philippine Flag Tri-Color Accent Line -->
            <div class="flex h-1 w-full">
                <div class="h-full w-1/3 bg-[#0038A8]" />
                <div class="h-full w-1/3 bg-[#FCD116]" />
                <div class="h-full w-1/3 bg-[#CE1126]" />
            </div>

            <div
                class="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2 sm:px-6"
            >
                <div class="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span class="font-bold tracking-wider text-white uppercase"
                        >Republic of the Philippines</span
                    >
                    <span class="hidden text-slate-500 sm:inline">•</span>
                    <span class="text-slate-300"
                        >Municipal Government of Loon, Province of Bohol</span
                    >
                    <span class="hidden text-slate-500 md:inline">•</span>
                    <span class="hidden font-medium text-amber-400/90 md:inline"
                        >Official Complaints & Infrastructure Portal</span
                    >
                </div>

                <div
                    class="flex flex-wrap items-center gap-x-3 gap-y-0.5 font-mono text-[11px] text-slate-400"
                >
                    <span class="flex items-center gap-1">
                        <PhoneCall class="size-3 text-emerald-400" />
                        <span
                            >Loon Hotline:
                            <strong class="text-white"
                                >(038) 505-8000 / 911</strong
                            ></span
                        >
                    </span>
                    <span class="text-slate-600">|</span>
                    <span class="text-emerald-400">loon.gov.ph</span>
                </div>
            </div>
        </div>

        <div class="w-full flex-1 lg:grid lg:grid-cols-12">
            <!-- Left Side: Official LGU Seal & Government Mandate (lg screens) -->
            <div
                class="relative hidden flex-col justify-between overflow-hidden border-r border-slate-800 bg-[#08101E] p-12 text-white lg:col-span-6 lg:flex xl:col-span-7 xl:p-16"
            >
                <!-- Watermark Government Grid -->
                <div
                    class="pointer-events-none absolute inset-0 opacity-[0.08]"
                    :style="{
                        backgroundImage:
                            'radial-gradient(#F59E0B 1px, transparent 1px), linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
                        backgroundSize: '48px 48px, 48px 48px, 48px 48px',
                    }"
                />

                <!-- Top Header: City Brand -->
                <div class="relative z-10 flex items-center gap-4">
                    <CivicSeal size="lg" class="shrink-0 drop-shadow-md" />
                    <div>
                        <div
                            class="font-mono text-[11px] font-bold tracking-widest text-amber-400 uppercase"
                        >
                            Local Government of Loon, Bohol
                        </div>
                        <h2
                            class="font-sans text-2xl font-black tracking-tight text-white uppercase"
                        >
                            Municipality of Loon
                        </h2>
                        <div class="text-xs font-medium text-slate-400">
                            Public Complaints, MDRRMO, and Infrastructure Office
                        </div>
                    </div>
                </div>

                <!-- Center: Statutory & GovTech Mandate -->
                <div class="relative z-10 my-auto max-w-xl space-y-6 py-8">
                    <div class="space-y-3">
                        <Badge
                            variant="outline"
                            class="border-amber-400/40 bg-amber-400/10 px-3.5 py-1 text-xs font-medium tracking-wide text-amber-300 uppercase"
                        >
                            Executive Order No. 2026-LBN · LGU Loon GIS Portal
                        </Badge>
                        <h1
                            class="text-4xl leading-[1.12] font-black tracking-tight text-white xl:text-5xl"
                        >
                            Every Citizen Report in Loon, <br />
                            <span
                                class="text-amber-400 underline decoration-amber-500/50 underline-offset-8"
                                >Action and Resolution.</span
                            >
                        </h1>
                        <p
                            class="text-sm leading-relaxed text-slate-300 xl:text-base"
                        >
                            The official unified reporting system of the
                            Municipality of Loon, Province of Bohol for rapid
                            reporting of road hazards, clogged drainage,
                            streetlights, and public services using real-time
                            coordinates.
                        </p>
                    </div>

                    <!-- Statutory Badges / Pillars -->
                    <div class="grid gap-3 pt-2">
                        <div
                            class="flex items-start gap-3.5 rounded-xl border border-slate-800 bg-slate-900/70 p-4 backdrop-blur-md"
                        >
                            <div
                                class="flex size-9 shrink-0 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/15 text-emerald-400"
                            >
                                <Scale class="size-4.5" />
                            </div>
                            <div class="text-xs xl:text-sm">
                                <div
                                    class="flex items-center gap-2 font-bold text-slate-100"
                                >
                                    <span
                                        >Republic Act No. 11032 Compliance</span
                                    >
                                    <span
                                        class="rounded bg-emerald-500/20 px-1.5 py-0.5 font-mono text-[10px] text-emerald-300"
                                        >ARTA</span
                                    >
                                </div>
                                <div class="mt-0.5 text-xs text-slate-400">
                                    Strictly compliant with the 3-7-20 working
                                    day SLA for prompt government service
                                    delivery.
                                </div>
                            </div>
                        </div>

                        <div
                            class="flex items-start gap-3.5 rounded-xl border border-slate-800 bg-slate-900/70 p-4 backdrop-blur-md"
                        >
                            <div
                                class="flex size-9 shrink-0 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/15 text-blue-400"
                            >
                                <MapPin class="size-4.5" />
                            </div>
                            <div class="text-xs xl:text-sm">
                                <div
                                    class="flex items-center gap-2 font-bold text-slate-100"
                                >
                                    <span
                                        >Loon GIS Command Grid (67
                                        Barangays)</span
                                    >
                                    <span
                                        class="rounded bg-blue-500/20 px-1.5 py-0.5 font-mono text-[10px] text-blue-300"
                                        >9.80° N, 123.79° E</span
                                    >
                                </div>
                                <div class="mt-0.5 text-xs text-slate-400">
                                    Automated report routing to Loon Municipal
                                    Engineering Office, MDRRMO Loon, and
                                    respective Barangay Councils.
                                </div>
                            </div>
                        </div>

                        <div
                            class="flex items-start gap-3.5 rounded-xl border border-slate-800 bg-slate-900/70 p-4 backdrop-blur-md"
                        >
                            <div
                                class="flex size-9 shrink-0 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/15 text-amber-400"
                            >
                                <ShieldCheck class="size-4.5" />
                            </div>
                            <div class="text-xs xl:text-sm">
                                <div
                                    class="flex items-center gap-2 font-bold text-slate-100"
                                >
                                    <span
                                        >Data Privacy Act of 2012 (RA
                                        10173)</span
                                    >
                                    <span
                                        class="rounded bg-amber-500/20 px-1.5 py-0.5 font-mono text-[10px] text-amber-300"
                                        >NPC CERTIFIED</span
                                    >
                                </div>
                                <div class="mt-0.5 text-xs text-slate-400">
                                    Citizen identity protected via
                                    government-grade security and encryption
                                    standards.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Footer Motto -->
                <div
                    class="relative z-10 flex items-center justify-between border-t border-slate-800/80 pt-6 text-xs text-slate-500"
                >
                    <span class="font-medium text-slate-400 italic"
                        >"Committed to Progress and Peace in the Municipality of
                        Loon"</span
                    >
                    <span class="font-mono text-[11px] text-slate-500"
                        >LBN-GOV-ID: #LBN2026-LGU-SEC</span
                    >
                </div>
            </div>

            <!-- Right Side: Official GovTech Login Form -->
            <div
                class="flex flex-col justify-center bg-card/60 px-6 py-10 backdrop-blur-xs sm:px-12 lg:col-span-6 xl:col-span-5 xl:px-16"
            >
                <div class="mx-auto w-full max-w-md space-y-5">
                    <!-- Mobile View Header -->
                    <div
                        class="flex items-center justify-between border-b border-border pb-3 lg:hidden"
                    >
                        <div class="flex items-center gap-2.5">
                            <CivicSeal size="sm" />
                            <div>
                                <span
                                    class="block text-sm leading-none font-bold uppercase"
                                    >Municipality of Loon</span
                                >
                                <span
                                    class="font-mono text-[10px] text-emerald-600 dark:text-emerald-400"
                                    >GeoReport • loon.gov.ph</span
                                >
                            </div>
                        </div>
                        <Badge
                            variant="outline"
                            class="border-amber-500/40 text-[10px] text-amber-600 dark:text-amber-400"
                        >
                            LGU Portal
                        </Badge>
                    </div>

                    <!-- Card Header -->
                    <div class="space-y-1">
                        <div
                            class="flex items-center gap-2 font-mono text-xs font-bold tracking-wider text-amber-600 uppercase dark:text-amber-400"
                        >
                            <Lock class="size-3.5" />
                            <span>Official Single Sign-On (Loon-SSO)</span>
                        </div>
                        <h2
                            class="text-2xl font-black tracking-tight text-foreground"
                        >
                            Sign In to Portal
                        </h2>
                        <p class="text-xs text-muted-foreground">
                            Enter your registered email and password to access
                            your workspace.
                        </p>
                    </div>

                    <!-- Flash Status -->
                    <div
                        v-if="status"
                        class="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-center text-xs font-semibold text-emerald-700 dark:text-emerald-300"
                    >
                        {{ status }}
                    </div>

                    <!-- Passkey Verification Support -->
                    <PasskeyVerify />

                    <!-- The Login Form -->
                    <form @submit.prevent="submit" class="space-y-4">
                        <div class="space-y-1.5">
                            <Label
                                for="email"
                                class="text-xs font-bold tracking-wider text-muted-foreground uppercase"
                            >
                                Email Address
                            </Label>
                            <Input
                                id="email"
                                v-model="form.email"
                                type="email"
                                name="email"
                                required
                                autofocus
                                autocomplete="email"
                                placeholder="name@example.com"
                                class="h-10 border-input font-medium"
                                :class="{
                                    'border-destructive ring-destructive/20':
                                        form.errors.email,
                                }"
                            />
                            <InputError :message="form.errors.email" />
                        </div>

                        <div class="space-y-1.5">
                            <div class="flex items-center justify-between">
                                <Label
                                    for="password"
                                    class="text-xs font-bold tracking-wider text-muted-foreground uppercase"
                                >
                                    Password
                                </Label>
                                <TextLink
                                    v-if="canResetPassword"
                                    :href="request()"
                                    class="text-xs text-muted-foreground hover:text-foreground"
                                >
                                    Forgot password?
                                </TextLink>
                            </div>
                            <PasswordInput
                                id="password"
                                v-model="form.password"
                                name="password"
                                required
                                autocomplete="current-password"
                                placeholder="••••••••"
                                class="h-10"
                                :class="{
                                    'border-destructive ring-destructive/20':
                                        form.errors.password,
                                }"
                            />
                            <InputError :message="form.errors.password" />
                        </div>

                        <div class="flex items-center justify-between pt-0.5">
                            <Label
                                for="remember"
                                class="flex cursor-pointer items-center gap-2 text-xs font-medium text-muted-foreground"
                            >
                                <Checkbox
                                    id="remember"
                                    :checked="form.remember"
                                    @update:checked="
                                        (val: boolean) =>
                                            (form.remember = !!val)
                                    "
                                />
                                <span>Keep me signed in on this device</span>
                            </Label>
                        </div>

                        <!-- Formal Government Action Button -->
                        <Button
                            type="submit"
                            class="h-11 w-full border border-slate-700/50 bg-[#0F284E] text-sm font-bold tracking-wide text-white shadow-sm hover:bg-[#163768]"
                            :disabled="form.processing"
                        >
                            <Spinner
                                v-if="form.processing"
                                class="mr-2 size-4"
                            />
                            <span v-else class="flex items-center gap-2">
                                <span>Sign In to Portal</span>
                                <ArrowRight class="size-4" />
                            </span>
                        </Button>
                    </form>

                    <!-- Official Government Warning Box -->
                    <div
                        class="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-[11px] leading-relaxed text-amber-800 dark:text-amber-300"
                    >
                        <div class="mb-1 flex items-center gap-1.5 font-bold">
                            <AlertTriangle
                                class="size-3.5 shrink-0 text-amber-600 dark:text-amber-400"
                            />
                            <span>GOVERNMENT SECURITY WARNING</span>
                        </div>
                        <p class="text-[10px] text-muted-foreground">
                            This is an official computer system of the Municipal
                            Government of Loon, Province of Bohol. Unauthorized
                            access, tampering, or fraudulent submissions are
                            strictly prohibited and punishable under
                            <strong
                                >R.A. 10175 (Cybercrime Prevention Act of
                                2012)</strong
                            >.
                        </p>
                    </div>

                    <!-- Register Link -->
                    <div class="pt-1 text-center text-xs">
                        <p class="text-muted-foreground">
                            Don't have an account yet?
                            <Link
                                :href="register()"
                                class="ml-1 font-bold text-emerald-600 underline underline-offset-4 hover:text-emerald-500 dark:text-emerald-400"
                            >
                                Register as a Citizen
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
