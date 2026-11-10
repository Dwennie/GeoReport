import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthLayout from '@/layouts/AuthLayout';
import { Button } from '@/components/ui/button';

interface VerifyEmailProps {
    status?: string;
}

export default function VerifyEmail({ status }: VerifyEmailProps) {
    const { post, processing } = useForm({});

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/email/verification-notification');
    }

    return (
        <AuthLayout
            title="Verify Email"
            description="Thanks for signing up! Before getting started, could you verify your email address by clicking on the link we just emailed to you?"
        >
            <Head title="Email Verification" />

            {status === 'verification-link-sent' && (
                <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-medium text-emerald-700 dark:text-emerald-300 text-center">
                    A new verification link has been sent to the email address
                    you provided during registration.
                </div>
            )}

            <form onSubmit={submit} className="flex flex-col gap-4">
                <Button type="submit" className="w-full" disabled={processing}>
                    {processing ? 'Resending…' : 'Resend verification email'}
                </Button>

                <div className="text-center text-xs">
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="font-medium text-muted-foreground hover:underline"
                    >
                        Log out
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
}
