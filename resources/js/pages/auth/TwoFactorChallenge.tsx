import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthLayout from '@/layouts/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function TwoFactorChallenge() {
    const [recovery, setRecovery] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        code: '',
        recovery_code: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/two-factor-challenge');
    }

    return (
        <AuthLayout
            title="Two-Factor Authentication"
            description={
                recovery
                    ? 'Please confirm access by entering one of your emergency recovery codes.'
                    : 'Please confirm access to your account by entering the authentication code provided by your authenticator app.'
            }
        >
            <Head title="Two-Factor Authentication" />

            <form onSubmit={submit} className="flex flex-col gap-4">
                {!recovery ? (
                    <div className="grid gap-1.5">
                        <Label htmlFor="code">Authentication Code</Label>
                        <Input
                            id="code"
                            type="text"
                            inputMode="numeric"
                            autoFocus
                            placeholder="6-digit code"
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value)}
                        />
                        {errors.code && (
                            <p className="text-xs text-destructive">{errors.code}</p>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-1.5">
                        <Label htmlFor="recovery_code">Recovery Code</Label>
                        <Input
                            id="recovery_code"
                            type="text"
                            autoFocus
                            placeholder="Recovery code"
                            value={data.recovery_code}
                            onChange={(e) =>
                                setData('recovery_code', e.target.value)
                            }
                        />
                        {errors.recovery_code && (
                            <p className="text-xs text-destructive">
                                {errors.recovery_code}
                            </p>
                        )}
                    </div>
                )}

                <Button type="submit" className="w-full" disabled={processing}>
                    {processing ? 'Logging in…' : 'Log in'}
                </Button>

                <button
                    type="button"
                    className="text-xs text-muted-foreground hover:underline text-center"
                    onClick={() => {
                        setRecovery(!recovery);
                        setData({ code: '', recovery_code: '' });
                    }}
                >
                    {recovery
                        ? 'Use an authenticator code instead'
                        : 'Use a recovery code instead'}
                </button>
            </form>
        </AuthLayout>
    );
}
