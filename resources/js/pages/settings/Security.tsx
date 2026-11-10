import React, { FormEvent } from 'react';
import { Head, useForm } from '@inertiajs/react';
import Heading from '@/components/Heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SettingsLayout from '@/layouts/settings/Layout';

interface SecurityProps {
    passwordRules?: string;
    canManageTwoFactor?: boolean;
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
    canManagePasskeys?: boolean;
    passkeys?: unknown[];
}

export default function Security({
    passwordRules,
    canManageTwoFactor,
    twoFactorEnabled,
    canManagePasskeys,
}: SecurityProps) {
    const { data, setData, put, errors, processing, recentlySuccessful, reset } =
        useForm({
            current_password: '',
            password: '',
            password_confirmation: '',
        });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        put('/settings/password', {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <SettingsLayout>
            <Head title="Security settings" />

            <h1 className="sr-only">Security settings</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Update password"
                    description="Ensure your account is using a long, random password to stay secure"
                />

                <form onSubmit={submit} className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="current_password">Current password</Label>
                        <Input
                            id="current_password"
                            type="password"
                            className="mt-1 block w-full"
                            value={data.current_password}
                            onChange={(e) =>
                                setData('current_password', e.target.value)
                            }
                            autoComplete="current-password"
                            placeholder="Current password"
                        />
                        {errors.current_password && (
                            <p className="text-xs text-destructive">
                                {errors.current_password}
                            </p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">New password</Label>
                        <Input
                            id="password"
                            type="password"
                            className="mt-1 block w-full"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            autoComplete="new-password"
                            placeholder="New password"
                        />
                        {errors.password && (
                            <p className="text-xs text-destructive">
                                {errors.password}
                            </p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">
                            Confirm password
                        </Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            className="mt-1 block w-full"
                            value={data.password_confirmation}
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                            autoComplete="new-password"
                            placeholder="Confirm password"
                        />
                        {errors.password_confirmation && (
                            <p className="text-xs text-destructive">
                                {errors.password_confirmation}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            disabled={processing}
                            data-test="update-password-button"
                        >
                            Save
                        </Button>
                        {recentlySuccessful && (
                            <p className="text-sm text-muted-foreground">Saved.</p>
                        )}
                    </div>
                </form>

                {canManageTwoFactor && (
                    <div className="space-y-4 pt-6 border-t">
                        <Heading
                            variant="small"
                            title="Two-Factor Authentication"
                            description="Add additional security to your account using two-factor authentication."
                        />
                        <p className="text-sm text-muted-foreground">
                            Two-factor authentication is currently{' '}
                            <span className="font-medium text-foreground">
                                {twoFactorEnabled ? 'enabled' : 'disabled'}
                            </span>
                            .
                        </p>
                    </div>
                )}
            </div>
        </SettingsLayout>
    );
}
