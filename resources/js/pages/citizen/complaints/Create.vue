<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Head, Link, router } from '@inertiajs/vue3';
import { ArrowLeft, MapPin, Send } from '@lucide/vue';
import OpenStreetMap from '@/components/OpenStreetMap.vue';
import {
    ConfirmDialog,
    FilterSelect,
    ImageUploadPreview,
    PageHeader,
} from '@/components/geo';
import type { FilterOption, ImagePreview } from '@/components/geo';
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
import { Textarea } from '@/components/ui/textarea';
import { formatCoordinates } from '@/lib/format';
import { useTaxonomy } from '@/lib/taxonomy';
import type { Barangay } from '@/types/geo';

const props = defineProps<{
    categoriesList?: Array<{
        id: number;
        name: string;
        color: string;
        isActive: boolean;
    }>;
    barangaysList?: Barangay[];
    barangayOptions?: string[];
}>();

defineOptions({
    layout: {
        breadcrumbs: [
            { title: 'Dashboard', href: '/citizen/dashboard' },
            { title: 'My reports', href: '/citizen/complaints' },
            { title: 'Report a concern', href: '/citizen/complaints/create' },
        ],
    },
});

const { activeCategories: sharedActiveCategories, barangays: sharedBarangays } =
    useTaxonomy();

const title = ref('');
const categoryId = ref('');
const barangay = ref('');
const address = ref('');
const description = ref('');
const photos = ref<ImagePreview[]>([]);

const selectedLatitude = ref<number | null>(null);
const selectedLongitude = ref<number | null>(null);
const mapCenterLatitude = ref(9.8);
const mapCenterLongitude = ref(123.8);
const mapZoom = ref(13);

const confirmOpen = ref(false);
const isSubmitting = ref(false);

const availableCategories = computed(() =>
    props.categoriesList && props.categoriesList.length > 0
        ? props.categoriesList
        : sharedActiveCategories.value,
);

const availableBarangayRecords = computed<Barangay[]>(() => {
    if (props.barangaysList && props.barangaysList.length > 0) {
        return props.barangaysList;
    }
    if (sharedBarangays.value.length > 0) {
        return sharedBarangays.value;
    }
    return (props.barangayOptions ?? []).map((name, idx) => ({
        id: idx + 1,
        name,
        district: 'Loon',
    }));
});

const categoryOptions = computed<FilterOption[]>(() =>
    availableCategories.value
        .filter((category) => category.isActive)
        .map((category) => ({
            value: String(category.id),
            label: category.name,
        })),
);

const barangayOptionsComputed = computed<FilterOption[]>(() =>
    availableBarangayRecords.value.map((item) => ({
        value: item.name,
        label: item.district ? `${item.name} · ${item.district}` : item.name,
    })),
);

const selectedBarangayRecord = computed(() =>
    availableBarangayRecords.value.find((item) => item.name === barangay.value),
);

// When user selects a barangay from the dropdown, pan the map and place the pin at its center
watch(barangay, (newName) => {
    const record = availableBarangayRecords.value.find(
        (item) => item.name === newName,
    );
    if (record?.latitude != null && record?.longitude != null) {
        mapCenterLatitude.value = record.latitude;
        mapCenterLongitude.value = record.longitude;
        mapZoom.value = 15;
        selectedLatitude.value = record.latitude;
        selectedLongitude.value = record.longitude;
    }
});

const errors = computed(() => {
    const messages: Record<string, string> = {};

    if (title.value.trim() === '') {
        messages.title = 'Give the concern a short title.';
    }

    if (categoryId.value === '') {
        messages.categoryId = 'Pick the category that fits best.';
    }

    if (barangay.value === '') {
        messages.barangay = 'Choose the barangay where the issue is located.';
    }

    if (description.value.trim().length < 20) {
        messages.description =
            'Describe what is happening in at least 20 characters.';
    }

    return messages;
});

const isValid = computed(() => Object.keys(errors.value).length === 0);

function openConfirm(): void {
    confirmOpen.value = true;
}

function confirmSubmit(): void {
    confirmOpen.value = false;
    isSubmitting.value = true;

    const uploadedFiles = photos.value
        .map((preview) => preview.file)
        .filter((file): file is File => Boolean(file));

    const lat =
        selectedLatitude.value ??
        selectedBarangayRecord.value?.latitude ??
        9.7997;
    const lng =
        selectedLongitude.value ??
        selectedBarangayRecord.value?.longitude ??
        123.7925;

    router.post(
        '/citizen/complaints',
        {
            title: title.value.trim(),
            category_id: Number(categoryId.value),
            barangay: barangay.value,
            address: address.value.trim(),
            description: description.value.trim(),
            latitude: lat,
            longitude: lng,
            photos: uploadedFiles,
        },
        {
            forceFormData: uploadedFiles.length > 0,
            onFinish: () => {
                isSubmitting.value = false;
            },
        },
    );
}
</script>

<template>
    <Head title="Report a concern" />

    <div class="flex h-full flex-1 flex-col gap-4 p-4">
        <PageHeader
            eyebrow="Community"
            title="Report a concern"
            description="Tell us what is wrong and where across Loon, Bohol. Municipal staff review every report before field dispatch."
        >
            <template #actions>
                <Button variant="ghost" as-child>
                    <Link href="/citizen/complaints">
                        <ArrowLeft class="size-4" />
                        Back to my reports
                    </Link>
                </Button>
            </template>
        </PageHeader>

        <div class="grid gap-4 lg:grid-cols-[1.45fr_1.05fr]">
            <Card class="gap-4">
                <CardHeader>
                    <CardTitle>What is the concern?</CardTitle>
                    <CardDescription>
                        All fields except the landmark and photos are required.
                    </CardDescription>
                </CardHeader>
                <CardContent class="space-y-5">
                    <div class="space-y-2">
                        <Label for="title">Title</Label>
                        <Input
                            id="title"
                            v-model="title"
                            placeholder="e.g. Broken street lamp near the barangay hall"
                            :aria-invalid="Boolean(errors.title)"
                        />
                        <p v-if="errors.title" class="text-xs text-destructive">
                            {{ errors.title }}
                        </p>
                    </div>

                    <div class="grid gap-4 sm:grid-cols-2">
                        <div class="space-y-2">
                            <Label for="category">Category</Label>
                            <FilterSelect
                                id="category"
                                v-model="categoryId"
                                :options="categoryOptions"
                                placeholder="Select a category"
                                aria-label="Category"
                                class="w-full"
                            />
                            <p
                                v-if="errors.categoryId"
                                class="text-xs text-destructive"
                            >
                                {{ errors.categoryId }}
                            </p>
                        </div>

                        <div class="space-y-2">
                            <Label for="barangay">Barangay</Label>
                            <FilterSelect
                                id="barangay"
                                v-model="barangay"
                                :options="barangayOptionsComputed"
                                placeholder="Select a barangay"
                                aria-label="Barangay"
                                class="w-full"
                            />
                            <p
                                v-if="errors.barangay"
                                class="text-xs text-destructive"
                            >
                                {{ errors.barangay }}
                            </p>
                        </div>
                    </div>

                    <div class="space-y-2">
                        <Label for="address"
                            >Street or nearest landmark (optional)</Label
                        >
                        <Input
                            id="address"
                            v-model="address"
                            placeholder="e.g. National Highway, near Loon Municipal Plaza"
                        />
                    </div>

                    <div class="space-y-2">
                        <Label for="description">Description</Label>
                        <Textarea
                            id="description"
                            v-model="description"
                            :rows="5"
                            placeholder="What is happening, since when, and who is affected?"
                            :aria-invalid="Boolean(errors.description)"
                        />
                        <p
                            v-if="errors.description"
                            class="text-xs text-destructive"
                        >
                            {{ errors.description }}
                        </p>
                    </div>

                    <div class="space-y-2">
                        <Label>Photos</Label>
                        <ImageUploadPreview v-model="photos" />
                    </div>

                    <div class="flex justify-end gap-2 border-t pt-4">
                        <Button
                            :disabled="!isValid || isSubmitting"
                            @click="openConfirm"
                        >
                            <Send class="size-4" />
                            {{ isSubmitting ? 'Submitting…' : 'Submit report' }}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div class="space-y-4">
                <Card class="gap-3">
                    <CardHeader>
                        <CardTitle>Pin exact location</CardTitle>
                        <CardDescription>
                            Click or drag the pin on the OpenStreetMap to mark
                            the exact location of your concern.
                        </CardDescription>
                    </CardHeader>
                    <CardContent class="space-y-3">
                        <OpenStreetMap
                            :latitude="mapCenterLatitude"
                            :longitude="mapCenterLongitude"
                            :zoom="mapZoom"
                            height="h-[340px]"
                            :selectable="true"
                            :show-barangays="false"
                            :show-legend="false"
                            v-model:selected-latitude="selectedLatitude"
                            v-model:selected-longitude="selectedLongitude"
                            caption="Click anywhere on the street map or drag the pin to refine coordinates."
                        />

                        <div
                            v-if="
                                selectedLatitude !== null &&
                                selectedLongitude !== null
                            "
                            class="flex items-center justify-between rounded-lg border bg-muted/40 px-3 py-2 text-xs"
                        >
                            <span
                                class="flex items-center gap-1.5 text-muted-foreground"
                            >
                                <MapPin
                                    class="size-3.5 text-emerald-600 dark:text-emerald-400"
                                />
                                {{ barangay || 'Pinned coordinate' }}
                            </span>
                            <span class="font-mono font-medium tabular-nums">
                                {{
                                    formatCoordinates(
                                        selectedLatitude,
                                        selectedLongitude,
                                    )
                                }}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card class="gap-3">
                    <CardHeader>
                        <CardTitle>What happens next</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ol class="space-y-2 text-sm text-muted-foreground">
                            <li>1. An administrator reviews your report.</li>
                            <li>
                                2. Once approved, it is dispatched to municipal
                                field staff.
                            </li>
                            <li>
                                3. You can track status updates and resolution
                                proof in My reports.
                            </li>
                        </ol>
                    </CardContent>
                </Card>
            </div>
        </div>

        <ConfirmDialog
            v-model:open="confirmOpen"
            title="Submit this report?"
            description="Review your entries one more time. Reports go to the municipal administrator for verification before field staff are dispatched."
            confirm-label="Submit report"
            @confirm="confirmSubmit"
        />
    </div>
</template>
