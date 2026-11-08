<script setup lang="ts">
import { Head, useForm } from '@inertiajs/vue3';
import { Save } from '@lucide/vue';
import InputError from '@/components/InputError.vue';
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
import { Spinner } from '@/components/ui/spinner';

type SettingsPayload = {
    platformName: string;
    supportEmail: string;
    maxPhotos: number;
    autoAssignRadius: number;
    mapLatitude: number;
    mapLongitude: number;
    mapZoom: number;
};

const props = withDefaults(
    defineProps<{
        settingsData?: SettingsPayload;
    }>(),
    {
        settingsData: () => ({
            platformName: 'GeoReport — Loon, Bohol',
            supportEmail: 'support@loon.gov.ph',
            maxPhotos: 5,
            autoAssignRadius: 2.5,
            mapLatitude: 9.7997,
            mapLongitude: 123.7925,
            mapZoom: 13,
        }),
    },
);

defineOptions({
    layout: {
        breadcrumbs: [
            { title: 'Dashboard', href: '/admin/dashboard' },
            { title: 'Settings', href: '/admin/settings' },
        ],
    },
});

const form = useForm({
    platformName: props.settingsData.platformName,
    supportEmail: props.settingsData.supportEmail,
    maxPhotos: props.settingsData.maxPhotos,
    autoAssignRadius: props.settingsData.autoAssignRadius,
    mapLatitude: props.settingsData.mapLatitude,
    mapLongitude: props.settingsData.mapLongitude,
    mapZoom: props.settingsData.mapZoom,
});

function saveSettings(): void {
    form.put('/admin/settings', {
        preserveScroll: true,
    });
}
</script>

<template>
    <Head title="Settings" />

    <form
        class="flex h-full flex-1 flex-col gap-4 p-4"
        @submit.prevent="saveSettings"
    >
        <PageHeader
            eyebrow="Administration"
            title="Settings"
            description="Platform-wide identity, complaint upload rules, and OpenStreetMap viewport defaults for Loon, Bohol."
        />

        <div class="grid gap-4 lg:grid-cols-2">
            <Card class="gap-3">
                <CardHeader>
                    <CardTitle>Platform identity</CardTitle>
                    <CardDescription>
                        How GeoReport presents itself to citizens and staff.
                    </CardDescription>
                </CardHeader>
                <CardContent class="grid gap-4 sm:grid-cols-2">
                    <div class="space-y-2">
                        <Label for="platform-name">Platform name</Label>
                        <Input
                            id="platform-name"
                            v-model="form.platformName"
                            required
                        />
                        <InputError :message="form.errors.platformName" />
                        <p class="text-xs text-muted-foreground">
                            Shown across municipal portals and notifications.
                        </p>
                    </div>

                    <div class="space-y-2">
                        <Label for="support-email">Support email</Label>
                        <Input
                            id="support-email"
                            v-model="form.supportEmail"
                            type="email"
                            required
                        />
                        <InputError :message="form.errors.supportEmail" />
                        <p class="text-xs text-muted-foreground">
                            Receives citizen escalations and service inquiries.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card class="gap-3">
                <CardHeader>
                    <CardTitle>Report handling</CardTitle>
                    <CardDescription>
                        Defaults applied to incoming community complaints.
                    </CardDescription>
                </CardHeader>
                <CardContent class="grid gap-4 sm:grid-cols-2">
                    <div class="space-y-2">
                        <Label for="max-photos">Max photos per report</Label>
                        <Input
                            id="max-photos"
                            v-model.number="form.maxPhotos"
                            type="number"
                            min="1"
                            max="10"
                            required
                        />
                        <InputError :message="form.errors.maxPhotos" />
                        <p class="text-xs text-muted-foreground">
                            Evidence uploads allowed on the submission form.
                        </p>
                    </div>

                    <div class="space-y-2">
                        <Label for="auto-assign-radius"
                            >Dispatch radius (km)</Label
                        >
                        <Input
                            id="auto-assign-radius"
                            v-model.number="form.autoAssignRadius"
                            type="number"
                            step="0.1"
                            min="0.5"
                            max="50"
                            required
                        />
                        <InputError :message="form.errors.autoAssignRadius" />
                        <p class="text-xs text-muted-foreground">
                            Reference radius for nearby field staff coverage.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card class="gap-3 lg:col-span-2">
                <CardHeader>
                    <CardTitle>Map defaults</CardTitle>
                    <CardDescription>
                        Initial OpenStreetMap center and zoom for Loon, Bohol.
                    </CardDescription>
                </CardHeader>
                <CardContent class="grid gap-4 sm:grid-cols-3">
                    <div class="space-y-2">
                        <Label for="map-lat">Default latitude</Label>
                        <Input
                            id="map-lat"
                            v-model.number="form.mapLatitude"
                            type="number"
                            step="0.0001"
                            required
                        />
                        <InputError :message="form.errors.mapLatitude" />
                        <p class="text-xs text-muted-foreground">
                            Loon Municipal Hall area, Moto Sur.
                        </p>
                    </div>

                    <div class="space-y-2">
                        <Label for="map-lng">Default longitude</Label>
                        <Input
                            id="map-lng"
                            v-model.number="form.mapLongitude"
                            type="number"
                            step="0.0001"
                            required
                        />
                        <InputError :message="form.errors.mapLongitude" />
                        <p class="text-xs text-muted-foreground">
                            Eastern longitude in decimal degrees.
                        </p>
                    </div>

                    <div class="space-y-2">
                        <Label for="map-zoom">Default zoom</Label>
                        <Input
                            id="map-zoom"
                            v-model.number="form.mapZoom"
                            type="number"
                            min="8"
                            max="18"
                            required
                        />
                        <InputError :message="form.errors.mapZoom" />
                        <p class="text-xs text-muted-foreground">
                            Used by the community, field, and GIS maps.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>

        <div class="flex items-center gap-3">
            <Button type="submit" :disabled="form.processing">
                <Spinner v-if="form.processing" class="size-4" />
                <Save v-else class="size-4" />
                Save changes
            </Button>
            <p
                v-if="form.recentlySuccessful"
                class="text-xs text-emerald-600 dark:text-emerald-400"
            >
                Configuration saved.
            </p>
        </div>
    </form>
</template>
