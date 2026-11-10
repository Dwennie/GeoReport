import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRight,
    Eye,
    EyeOff,
    Lock,
    MapPin,
    PhoneCall,
    Scale,
    ShieldCheck,
} from 'lucide-react';
import CivicSeal from '@/components/CivicSeal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LoginProps {
    status?: string;
    canResetPassword?: boolean;
}

export default function Login({ status, canResetPassword = true }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/login', {
            onFinish: () => reset('password'),
        });
    }

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background font-sans text-foreground">
            <Head title="Official Portal of the Municipality of Loon, Province of Bohol · GeoReport Sign In" />

            {/* Top GovPH Official Government Ribbon */}
            <div className="relative z-30 border-b border-slate-800 bg-[#0B1528] text-[11px] text-zinc-300">
                <div className="flex h-1 w-full">
                    <div className="h-full w-1/3 bg-[#0038A8]" />
                    <div className="h-full w-1/3 bg-[#FCD116]" />
                    <div className="h-full w-1/3 bg-[#CE1126]" />
                </div>

                <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2 sm:px-6">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span className="font-bold tracking-wider text-white uppercase">
                            Republic of the Philippines
                        </span>
                        <span className="hidden text-slate-500 sm:inline">•</span>
                        <span className="text-slate-300">
                            Municipal Government of Loon, Province of Bohol
                        </span>
                        <span className="hidden text-slate-500 md:inline">•</span>
                        <span className="hidden font-medium text-amber-400/90 md:inline">
                            Official Complaints & Infrastructure Portal
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 font-mono text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                            <PhoneCall className="size-3 text-emerald-400" />
                            <span>
                                Loon Hotline:{' '}
                                <strong className="text-white">
                                    (038) 505-8000 / 911
                                </strong>
                            </span>
                        </span>
                        <span className="text-slate-600">|</span>
                        <span className="text-emerald-400">loon.gov.ph</span>
                    </div>
                </div>
            </div>

            <div className="w-full flex-1 lg:grid lg:grid-cols-12">
                {/* Left Side: Official LGU Seal & Government Mandate */}
                <div className="relative hidden flex-col justify-between overflow-hidden border-r border-slate-800 bg-[#08101E] p-12 text-white lg:col-span-6 lg:flex xl:col-span-7 xl:p-16">
                    <div className="relative z-10 flex items-center gap-4">
                        <CivicSeal size="lg" className="shrink-0 drop-shadow-md" />
                        <div>
                            <div className="font-mono text-[11px] font-bold tracking-widest text-amber-400 uppercase">
                                Local Government of Loon, Bohol
                            </div>
                            <h2 className="font-sans text-2xl font-black tracking-tight text-white uppercase">
                                Municipality of Loon
                            </h2>
                            <div className="text-xs font-medium text-slate-400">
                                Public Complaints, MDRRMO, and Infrastructure Office
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 my-auto max-w-xl space-y-6 py-8">
                        <div className="space-y-3">
                            <Badge
                                variant="outline"
                                className="border-amber-400/40 bg-amber-400/10 px-3.5 py-1 text-xs font-medium tracking-wide text-amber-300 uppercase w-fit"
                            >
                                Executive Order No. 2026-LBN · LGU Loon GIS Portal
                            </Badge>
                            <h1 className="text-4xl leading-[1.12] font-black tracking-tight text-white xl:text-5xl">
                                Every Citizen Report in Loon, <br />
                                <span className="text-amber-400 underline decoration-amber-500/50 underline-offset-8">
                                    Action and Resolution.
                                </span>
                            </h1>
                            <p className="text-sm leading-relaxed text-slate-300 xl:text-base">
                                The official unified reporting system of the
                                Municipality of Loon, Province of Bohol for rapid
                                reporting of road hazards, clogged drainage,
                                streetlights, and public services using real-time
                                coordinates.
                            </p>
                        </div>

                        <div className="grid gap-3 pt-2">
                            <div className="flex items-start gap-3.5 rounded-xl border border-slate-800 bg-slate-900/70 p-4 backdrop-blur-md">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/15 text-emerald-400">
                                    <Scale className="size-4.5" />
                                </div>
                                <div className="text-xs xl:text-sm">
                                    <div className="flex items-center gap-2 font-bold text-slate-100">
                                        <span>Republic Act No. 11032 Compliance</span>
                                        <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 font-mono text-[10px] text-emerald-300">
                                            ARTA
                                        </span>
                                    </div>
                                    <div className="mt-0.5 text-xs text-slate-400">
                                        Strictly compliant with the 3-7-20 working
                                        day SLA for prompt government service
                                        delivery.
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-3.5 rounded-xl border border-slate-800 bg-slate-900/70 p-4 backdrop-blur-md">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/15 text-blue-400">
                                    <MapPin className="size-4.5" />
                                </div>
                                <div className="text-xs xl:text-sm">
                                    <div className="flex items-center gap-2 font-bold text-slate-100">
                                        <span>Loon GIS Command Grid (67 Barangays)</span>
                                        <span className="rounded bg-blue-500/20 px-1.5 py-0.5 font-mono text-[10px] text-blue-300">
                                            9.80° N, 123.79° E
                                        </span>
                                    </div>
                                    <div className="mt-0.5 text-xs text-slate-400">
                                        Automated report routing to Loon Municipal
                                        Engineering Office, MDRRMO Loon, and
                                        respective Barangay Councils.
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-3.5 rounded-xl border border-slate-800 bg-slate-900/70 p-4 backdrop-blur-md">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/15 text-amber-400">
                                    <ShieldCheck className="size-4.5" />
                                </div>
                                <div className="text-xs xl:text-sm">
                                    <div className="flex items-center gap-2 font-bold text-slate-100">
                                        <span>Data Privacy Act of 2012 (RA 10173)</span>
                                        <span className="rounded bg-amber-500/20 px-1.5 py-0.5 font-mono text-[10px] text-amber-300">
                                            NPC CERTIFIED
                                        </span>
                                    </div>
                                    <div className="mt-0.5 text-xs text-slate-400">
                                        Citizen identity protected via
                                        government-grade security and encryption
                                        standards.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 flex items-center justify-between border-t border-slate-800/80 pt-6 text-xs text-slate-500">
                        <span className="font-medium text-slate-400 italic">
                            "Committed to Progress and Peace in the Municipality of Loon"
                        </span>
                        <span className="font-mono text-[11px] text-slate-500">
                            LBN-GOV-ID: #LBN2026-LGU-SEC
                        </span>
                    </div>
                </div>

                {/* Right Side: Login Form */}
                <div className="flex flex-col justify-center bg-card/60 px-6 py-10 backdrop-blur-xs sm:px-12 lg:col-span-6 xl:col-span-5 xl:px-16">
                    <div className="mx-auto w-full max-w-md space-y-5">
                        {/* Mobile View Header */}
                        <div className="flex items-center justify-between border-b border-border pb-3 lg:hidden">
                            <div className="flex items-center gap-2.5">
                                <CivicSeal size="sm" />
                                <div>
                                    <span className="block text-sm leading-none font-bold uppercase">
                                        Municipality of Loon
                                    </span>
                                    <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
                                        GeoReport • loon.gov.ph
                                    </span>
                                </div>
                            </div>
                            <Badge
                                variant="outline"
                                className="border-amber-500/40 text-[10px] text-amber-600 dark:text-amber-400"
                            >
                                LGU Portal
                            </Badge>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2 font-mono text-xs font-bold tracking-wider text-amber-600 uppercase dark:text-amber-400">
                                <Lock className="size-3.5" />
                                <span>Official Single Sign-On (Loon-SSO)</span>
                            </div>
                            <h2 className="text-2xl font-black tracking-tight text-foreground">
                                Sign In to Portal
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Enter your registered email and password to access
                                your workspace.
                            </p>
                        </div>

                        {status && (
                            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-center text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-4">
                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="email"
                                    className="text-xs font-bold tracking-wider text-muted-foreground uppercase"
                                >
                                    Email Address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    autoComplete="email"
                                    placeholder="name@example.com"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="h-10 border-input font-medium"
                                />
                                {errors.email && (
                                    <p className="text-xs text-destructive mt-1 font-medium">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label
                                        htmlFor="password"
                                        className="text-xs font-bold tracking-wider text-muted-foreground uppercase"
                                    >
                                        Password
                                    </Label>
                                    {canResetPassword && (
                                        <Link
                                            href="/forgot-password"
                                            className="text-xs text-muted-foreground hover:text-foreground"
                                        >
                                            Forgot password?
                                        </Link>
                                    )}
                                </div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        required
                                        autoComplete="current-password"
                                        placeholder="••••••••"
                                        value={data.password}
                                        onChange={(e) =>
                                            setData('password', e.target.value)
                                        }
                                        className="h-10 pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        aria-label={
                                            showPassword
                                                ? 'Hide password'
                                                : 'Show password'
                                        }
                                    >
                                        {showPassword ? (
                                            <EyeOff className="size-4" />
                                        ) : (
                                            <Eye className="size-4" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-xs text-destructive mt-1 font-medium">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center justify-between pt-0.5">
                                <label
                                    htmlFor="remember"
                                    className="flex cursor-pointer items-center gap-2 text-xs font-medium text-muted-foreground"
                                >
                                    <Checkbox
                                        id="remember"
                                        checked={data.remember}
                                        onCheckedChange={(checked) =>
                                            setData('remember', Boolean(checked))
                                        }
                                    />
                                    <span>Keep me signed in on this device</span>
                                </label>
                            </div>

                            <Button
                                type="submit"
                                className="h-11 w-full border border-slate-700/50 bg-[#0F284E] text-sm font-bold tracking-wide text-white shadow-sm hover:bg-[#163768]"
                                disabled={processing}
                            >
                                <span className="flex items-center gap-2">
                                    <span>
                                        {processing
                                            ? 'Signing in…'
                                            : 'Sign In to Portal'}
                                    </span>
                                    <ArrowRight className="size-4" />
                                </span>
                            </Button>
                        </form>

                        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
                            <div className="mb-1 flex items-center gap-1.5 font-bold">
                                <AlertTriangle className="size-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                                <span>GOVERNMENT SECURITY WARNING</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                                This is an official computer system of the Municipal
                                Government of Loon, Province of Bohol. Unauthorized
                                access, tampering, or fraudulent submissions are
                                strictly prohibited and punishable under{' '}
                                <strong>
                                    R.A. 10175 (Cybercrime Prevention Act of 2012)
                                </strong>
                                .
                            </p>
                        </div>

                        <div className="pt-1 text-center text-xs">
                            <p className="text-muted-foreground">
                                Don't have an account yet?
                                <Link
                                    href="/register"
                                    className="ml-1 font-bold text-emerald-600 underline underline-offset-4 hover:text-emerald-500 dark:text-emerald-400"
                                >
                                    Register as a Citizen
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
