import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthLayout from '@/layouts/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ForgotPasswordProps {
    status?: string;
}

export default function ForgotPassword({ status }: ForgotPasswordProps) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/forgot-password');
    }

    return (
        <AuthLayout
            title="Forgot password"
            description="Enter your email to receive a password reset link"
        >
            <Head title="Forgot Password" />

            {status && (
                <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-medium text-emerald-700 dark:text-emerald-300 text-center">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="flex flex-col gap-4">
                <div className="grid gap-1.5">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                        id="email"
                        type="email"
                        required
                        autoFocus
                        placeholder="name@example.com"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    {errors.email && (
                        <p className="text-xs text-destructive">{errors.email}</p>
                    )}
                </div>

                <Button type="submit" className="w-full" disabled={processing}>
                    {processing ? 'Sending link…' : 'Email password reset link'}
                </Button>

                <div className="text-center text-xs text-muted-foreground mt-2">
                    <Link
                        href="/login"
                        className="font-medium hover:underline text-muted-foreground"
                    >
                        Back to sign in
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
}
