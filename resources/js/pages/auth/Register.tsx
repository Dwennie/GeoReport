import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthLayout from '@/layouts/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/register', {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    }

    return (
        <AuthLayout
            title="Create an account"
            description="Register as a Loon resident to file and track local community concerns"
        >
            <Head title="Register · GeoReport" />

            <form onSubmit={submit} className="flex flex-col gap-4">
                <div className="grid gap-1.5">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                        id="name"
                        type="text"
                        required
                        autoFocus
                        autoComplete="name"
                        placeholder="Juan Dela Cruz"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                    />
                    {errors.name && (
                        <p className="text-xs text-destructive">{errors.name}</p>
                    )}
                </div>

                <div className="grid gap-1.5">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                        id="email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="juan@example.com"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    {errors.email && (
                        <p className="text-xs text-destructive">{errors.email}</p>
                    )}
                </div>

                <div className="grid gap-1.5">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        required
                        autoComplete="new-password"
                        placeholder="••••••••"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    {errors.password && (
                        <p className="text-xs text-destructive">{errors.password}</p>
                    )}
                </div>

                <div className="grid gap-1.5">
                    <Label htmlFor="password_confirmation">Confirm Password</Label>
                    <Input
                        id="password_confirmation"
                        type="password"
                        required
                        autoComplete="new-password"
                        placeholder="••••••••"
                        value={data.password_confirmation}
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                    />
                    {errors.password_confirmation && (
                        <p className="text-xs text-destructive">
                            {errors.password_confirmation}
                        </p>
                    )}
                </div>

                <Button type="submit" className="mt-2 w-full" disabled={processing}>
                    {processing ? 'Creating account…' : 'Create account'}
                </Button>

                <div className="text-center text-xs text-muted-foreground mt-2">
                    Already have an account?{' '}
                    <Link
                        href="/login"
                        className="font-semibold text-emerald-600 underline underline-offset-4 hover:text-emerald-500"
                    >
                        Sign in
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
}
