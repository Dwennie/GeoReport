import React, { FormEvent, useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import Heading from '@/components/Heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import SettingsLayout from '@/layouts/settings/Layout';
import type { User } from '@/types';

export default function Profile() {
    const page = usePage<{ auth?: { user?: User } }>();
    const user = page.props.auth?.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user?.name ?? '',
            email: user?.email ?? '',
        });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        patch('/settings/profile');
    };

    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const deleteForm = useForm({
        password: '',
    });

    const deleteUser = (e: FormEvent) => {
        e.preventDefault();
        deleteForm.delete('/settings/profile', {
            preserveScroll: true,
            onSuccess: () => setConfirmingUserDeletion(false),
        });
    };

    return (
        <SettingsLayout>
            <Head title="Profile settings" />

            <h1 className="sr-only">Profile settings</h1>

            <div className="flex flex-col space-y-6">
                <Heading
                    variant="small"
                    title="Profile"
                    description="Update your name and email address"
                />

                <form onSubmit={submit} className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            className="mt-1 block w-full"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            autoComplete="name"
                            placeholder="Full name"
                        />
                        {errors.name && (
                            <p className="text-xs text-destructive">{errors.name}</p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            className="mt-1 block w-full"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoComplete="username"
                            placeholder="Email address"
                        />
                        {errors.email && (
                            <p className="text-xs text-destructive">{errors.email}</p>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <Button disabled={processing} data-test="update-profile-button">
                            Save
                        </Button>
                        {recentlySuccessful && (
                            <p className="text-sm text-muted-foreground">Saved.</p>
                        )}
                    </div>
                </form>

                <div className="space-y-6 pt-6 border-t">
                    <Heading
                        variant="small"
                        title="Delete account"
                        description="Delete your account and all of its resources"
                    />
                    <div className="space-y-4 rounded-lg border border-red-100 bg-red-50 p-4 dark:border-red-200/10 dark:bg-red-700/10">
                        <div className="relative space-y-0.5 text-red-600 dark:text-red-100">
                            <p className="font-medium">Warning</p>
                            <p className="text-sm">
                                Please proceed with caution, this cannot be undone.
                            </p>
                        </div>
                        <Dialog
                            open={confirmingUserDeletion}
                            onOpenChange={setConfirmingUserDeletion}
                        >
                            <DialogTrigger asChild>
                                <Button
                                    variant="destructive"
                                    data-test="delete-user-button"
                                >
                                    Delete account
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <form onSubmit={deleteUser} className="space-y-6">
                                    <DialogHeader className="space-y-3">
                                        <DialogTitle>
                                            Are you sure you want to delete your account?
                                        </DialogTitle>
                                        <DialogDescription>
                                            Once your account is deleted, all of its
                                            resources and data will also be permanently
                                            deleted. Please enter your password to
                                            confirm you would like to permanently delete
                                            your account.
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="grid gap-2">
                                        <Label htmlFor="password" className="sr-only">
                                            Password
                                        </Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={deleteForm.data.password}
                                            onChange={(e) =>
                                                deleteForm.setData(
                                                    'password',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Password"
                                        />
                                        {deleteForm.errors.password && (
                                            <p className="text-xs text-destructive">
                                                {deleteForm.errors.password}
                                            </p>
                                        )}
                                    </div>

                                    <DialogFooter className="gap-2">
                                        <DialogClose asChild>
                                            <Button
                                                variant="secondary"
                                                onClick={() => {
                                                    deleteForm.clearErrors();
                                                    deleteForm.reset();
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                        </DialogClose>
                                        <Button
                                            type="submit"
                                            variant="destructive"
                                            disabled={deleteForm.processing}
                                        >
                                            Delete account
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>
        </SettingsLayout>
    );
}
