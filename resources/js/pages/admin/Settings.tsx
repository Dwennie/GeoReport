import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';
import { PageHeader } from '@/components/geo';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/AppLayout';

type SettingsPayload = {
    platformName: string;
    supportEmail: string;
    maxPhotos: number;
    autoAssignRadius: number;
    mapLatitude: number;
    mapLongitude: number;
    mapZoom: number;
};

interface SettingsProps {
    settingsData?: SettingsPayload;
}

export default function Settings({
    settingsData = {
        platformName: 'GeoReport — Loon, Bohol',
        supportEmail: 'support@loon.gov.ph',
        maxPhotos: 5,
        autoAssignRadius: 2.5,
        mapLatitude: 9.7997,
        mapLongitude: 123.7925,
        mapZoom: 13,
    },
}: SettingsProps) {
    const form = useForm({
        platformName: settingsData.platformName,
        supportEmail: settingsData.supportEmail,
        maxPhotos: settingsData.maxPhotos,
        autoAssignRadius: settingsData.autoAssignRadius,
        mapLatitude: settingsData.mapLatitude,
        mapLongitude: settingsData.mapLongitude,
        mapZoom: settingsData.mapZoom,
    });

    const saveSettings = (e: React.FormEvent) => {
        e.preventDefault();
        form.put('/admin/settings', {
            preserveScroll: true,
        });
    };

    const breadcrumbs = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Settings', href: '/admin/settings' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Settings" />

            <form
                className="flex h-full flex-1 flex-col gap-4 p-4"
                onSubmit={saveSettings}
            >
                <PageHeader
                    eyebrow="Administration"
                    title="Settings"
                    description="Platform-wide identity, complaint upload rules, and OpenStreetMap viewport defaults for Loon, Bohol."
                    actions={
                        <Button type="submit" disabled={form.processing}>
                            <Save className="size-4" />
                            {form.processing ? 'Saving…' : 'Save settings'}
                        </Button>
                    }
                />

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card className="gap-3">
                        <CardHeader>
                            <CardTitle>Platform identity</CardTitle>
                            <CardDescription>
                                How GeoReport presents itself to citizens and staff.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="platform-name">
                                    Platform name
                                </Label>
                                <Input
                                    id="platform-name"
                                    value={form.data.platformName}
                                    onChange={(e) =>
                                        form.setData('platformName', e.target.value)
                                    }
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    Shown across municipal portals and
                                    notifications.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="support-email">
                                    Support email
                                </Label>
                                <Input
                                    id="support-email"
                                    type="email"
                                    value={form.data.supportEmail}
                                    onChange={(e) =>
                                        form.setData('supportEmail', e.target.value)
                                    }
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    Receives citizen escalations and service
                                    inquiries.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="gap-3">
                        <CardHeader>
                            <CardTitle>Report handling</CardTitle>
                            <CardDescription>
                                Defaults applied to incoming community complaints.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="max-photos">
                                    Max photos per report
                                </Label>
                                <Input
                                    id="max-photos"
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={form.data.maxPhotos}
                                    onChange={(e) =>
                                        form.setData(
                                            'maxPhotos',
                                            Number(e.target.value)
                                        )
                                    }
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    Evidence uploads allowed on the submission form.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="auto-assign-radius">
                                    Dispatch radius (km)
                                </Label>
                                <Input
                                    id="auto-assign-radius"
                                    type="number"
                                    step="0.1"
                                    min="0.5"
                                    max="25"
                                    value={form.data.autoAssignRadius}
                                    onChange={(e) =>
                                        form.setData(
                                            'autoAssignRadius',
                                            Number(e.target.value)
                                        )
                                    }
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    Radius for automatic nearby staff suggestions.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="gap-3 lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Map viewport defaults</CardTitle>
                            <CardDescription>
                                Initial coordinates and zoom for Loon, Bohol GIS
                                views.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="map-lat">Center latitude</Label>
                                <Input
                                    id="map-lat"
                                    type="number"
                                    step="0.0001"
                                    value={form.data.mapLatitude}
                                    onChange={(e) =>
                                        form.setData(
                                            'mapLatitude',
                                            Number(e.target.value)
                                        )
                                    }
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    Default Loon centroid latitude.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="map-lng">Center longitude</Label>
                                <Input
                                    id="map-lng"
                                    type="number"
                                    step="0.0001"
                                    value={form.data.mapLongitude}
                                    onChange={(e) =>
                                        form.setData(
                                            'mapLongitude',
                                            Number(e.target.value)
                                        )
                                    }
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    Default Loon centroid longitude.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="map-zoom">Initial zoom</Label>
                                <Input
                                    id="map-zoom"
                                    type="number"
                                    min="10"
                                    max="18"
                                    value={form.data.mapZoom}
                                    onChange={(e) =>
                                        form.setData(
                                            'mapZoom',
                                            Number(e.target.value)
                                        )
                                    }
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    Zoom level (12–14 fits Loon boundaries).
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </form>
        </AppLayout>
    );
}
