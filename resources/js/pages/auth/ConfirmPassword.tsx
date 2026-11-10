import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthLayout from '@/layouts/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/user/confirm-password', {
            onFinish: () => reset('password'),
        });
    }

    return (
        <AuthLayout
            title="Confirm password"
            description="Please confirm your password before continuing."
        >
            <Head title="Confirm Password" />

            <form onSubmit={submit} className="flex flex-col gap-4">
                <div className="grid gap-1.5">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        required
                        autoFocus
                        placeholder="••••••••"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    {errors.password && (
                        <p className="text-xs text-destructive">{errors.password}</p>
                    )}
                </div>

                <Button type="submit" className="w-full" disabled={processing}>
                    {processing ? 'Confirming…' : 'Confirm'}
                </Button>
            </form>
        </AuthLayout>
    );
}
