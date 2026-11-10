import React, { useMemo, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, MapPin, Send } from 'lucide-react';
import OpenStreetMap from '@/components/OpenStreetMap';
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
import AppLayout from '@/layouts/AppLayout';
import { formatCoordinates } from '@/lib/format';
import { useTaxonomy } from '@/lib/taxonomy';
import type { Barangay } from '@/types/geo';

interface CreateProps {
    categoriesList?: Array<{
        id: number;
        name: string;
        color: string;
        isActive: boolean;
    }>;
    barangaysList?: Barangay[];
    barangayOptions?: string[];
    maxPhotos?: number;
}

export default function Create({
    categoriesList,
    barangaysList,
    barangayOptions,
    maxPhotos = 5,
}: CreateProps) {
    const { activeCategories: sharedActiveCategories, barangays: sharedBarangays } =
        useTaxonomy();

    const [title, setTitle] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [barangay, setBarangay] = useState('');
    const [address, setAddress] = useState('');
    const [description, setDescription] = useState('');
    const [photos, setPhotos] = useState<ImagePreview[]>([]);

    const [selectedLatitude, setSelectedLatitude] = useState<number | null>(null);
    const [selectedLongitude, setSelectedLongitude] = useState<number | null>(null);
    const [mapCenterLatitude, setMapCenterLatitude] = useState(9.8);
    const [mapCenterLongitude, setMapCenterLongitude] = useState(123.8);
    const [mapZoom, setMapZoom] = useState(13);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const availableCategories = useMemo(
        () =>
            categoriesList && categoriesList.length > 0
                ? categoriesList
                : sharedActiveCategories,
        [categoriesList, sharedActiveCategories]
    );

    const availableBarangayRecords = useMemo<Barangay[]>(() => {
        if (barangaysList && barangaysList.length > 0) {
            return barangaysList;
        }
        if (sharedBarangays.length > 0) {
            return sharedBarangays;
        }
        return (barangayOptions ?? []).map((name, idx) => ({
            id: idx + 1,
            name,
            district: 'Loon',
        }));
    }, [barangaysList, sharedBarangays, barangayOptions]);

    const categoryOptions = useMemo<FilterOption[]>(
        () =>
            availableCategories
                .filter((category) => category.isActive)
                .map((category) => ({
                    value: String(category.id),
                    label: category.name,
                })),
        [availableCategories]
    );

    const barangayOptionsComputed = useMemo<FilterOption[]>(
        () =>
            availableBarangayRecords.map((item) => ({
                value: item.name,
                label: item.district ? `${item.name} · ${item.district}` : item.name,
            })),
        [availableBarangayRecords]
    );

    const selectedBarangayRecord = useMemo(
        () => availableBarangayRecords.find((item) => item.name === barangay),
        [availableBarangayRecords, barangay]
    );

    const handleBarangayChange = (newName: string) => {
        setBarangay(newName);
        const record = availableBarangayRecords.find((item) => item.name === newName);
        if (record?.latitude != null && record?.longitude != null) {
            setMapCenterLatitude(record.latitude);
            setMapCenterLongitude(record.longitude);
            setMapZoom(15);
            setSelectedLatitude(record.latitude);
            setSelectedLongitude(record.longitude);
        }
    };

    const errors = useMemo(() => {
        const messages: Record<string, string> = {};

        if (title.trim() === '') {
            messages.title = 'Give the concern a short title.';
        }

        if (categoryId === '') {
            messages.categoryId = 'Pick the category that fits best.';
        }

        if (barangay === '') {
            messages.barangay = 'Choose the barangay where the issue is located.';
        }

        if (description.trim().length < 20) {
            messages.description =
                'Describe what is happening in at least 20 characters.';
        }

        return messages;
    }, [title, categoryId, barangay, description]);

    const isValid = Object.keys(errors).length === 0;

    const confirmSubmit = () => {
        setConfirmOpen(false);
        setIsSubmitting(true);

        const uploadedFiles = photos
            .map((preview) => preview.file)
            .filter((file): file is File => Boolean(file));

        const lat =
            selectedLatitude ??
            selectedBarangayRecord?.latitude ??
            9.7997;
        const lng =
            selectedLongitude ??
            selectedBarangayRecord?.longitude ??
            123.7925;

        router.post(
            '/citizen/complaints',
            {
                title: title.trim(),
                category_id: Number(categoryId),
                barangay: barangay,
                address: address.trim(),
                description: description.trim(),
                latitude: lat,
                longitude: lng,
                photos: uploadedFiles,
            },
            {
                forceFormData: uploadedFiles.length > 0,
                onFinish: () => {
                    setIsSubmitting(false);
                },
            }
        );
    };

    const breadcrumbs = [
        { title: 'Dashboard', href: '/citizen/dashboard' },
        { title: 'My reports', href: '/citizen/complaints' },
        { title: 'Report a concern', href: '/citizen/complaints/create' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Report a concern" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <PageHeader
                    eyebrow="Community"
                    title="Report a concern"
                    description="Tell us what is wrong and where across Loon, Bohol. Municipal staff review every report before field dispatch."
                    actions={
                        <Button variant="ghost" asChild>
                            <Link href="/citizen/complaints">
                                <ArrowLeft className="size-4" />
                                Back to my reports
                            </Link>
                        </Button>
                    }
                />

                <div className="grid gap-4 lg:grid-cols-[1.45fr_1.05fr]">
                    <Card className="gap-4">
                        <CardHeader>
                            <CardTitle>What is the concern?</CardTitle>
                            <CardDescription>
                                All fields except the landmark and photos are required.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Broken street lamp near the barangay hall"
                                    aria-invalid={Boolean(errors.title)}
                                />
                                {errors.title && (
                                    <p className="text-xs text-destructive">
                                        {errors.title}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <FilterSelect
                                        id="category"
                                        modelValue={categoryId}
                                        onUpdateModelValue={setCategoryId}
                                        options={categoryOptions}
                                        placeholder="Select a category"
                                        aria-label="Category"
                                        className="w-full"
                                    />
                                    {errors.categoryId && (
                                        <p className="text-xs text-destructive">
                                            {errors.categoryId}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="barangay">Barangay</Label>
                                    <FilterSelect
                                        id="barangay"
                                        modelValue={barangay}
                                        onUpdateModelValue={handleBarangayChange}
                                        options={barangayOptionsComputed}
                                        placeholder="Select a barangay"
                                        aria-label="Barangay"
                                        className="w-full"
                                    />
                                    {errors.barangay && (
                                        <p className="text-xs text-destructive">
                                            {errors.barangay}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">
                                    Street or nearest landmark (optional)
                                </Label>
                                <Input
                                    id="address"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="e.g. National Highway, near Loon Municipal Plaza"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={5}
                                    placeholder="What is happening, since when, and who is affected?"
                                    aria-invalid={Boolean(errors.description)}
                                />
                                {errors.description && (
                                    <p className="text-xs text-destructive">
                                        {errors.description}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Photos</Label>
                                <ImageUploadPreview
                                    modelValue={photos}
                                    onUpdateModelValue={setPhotos}
                                    max={maxPhotos}
                                />
                            </div>

                            <div className="flex justify-end gap-2 border-t pt-4">
                                <Button
                                    disabled={!isValid || isSubmitting}
                                    onClick={() => setConfirmOpen(true)}
                                >
                                    <Send className="size-4" />
                                    {isSubmitting ? 'Submitting…' : 'Submit report'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-4">
                        <Card className="gap-3">
                            <CardHeader>
                                <CardTitle>Pin exact location</CardTitle>
                                <CardDescription>
                                    Click or drag the pin on the OpenStreetMap to mark
                                    the exact location of your concern.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <OpenStreetMap
                                    latitude={mapCenterLatitude}
                                    longitude={mapCenterLongitude}
                                    zoom={mapZoom}
                                    height="h-[340px]"
                                    selectable={true}
                                    showBarangays={false}
                                    showLegend={false}
                                    selectedLatitude={selectedLatitude}
                                    selectedLongitude={selectedLongitude}
                                    onSelectCoordinates={(lat, lng) => {
                                        setSelectedLatitude(lat);
                                        setSelectedLongitude(lng);
                                    }}
                                    caption="Click anywhere on the street map or drag the pin to refine coordinates."
                                />

                                {selectedLatitude !== null &&
                                    selectedLongitude !== null && (
                                        <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-3 py-2 text-xs">
                                            <span className="flex items-center gap-1.5 text-muted-foreground">
                                                <MapPin className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                                                {barangay || 'Pinned coordinate'}
                                            </span>
                                            <span className="font-mono font-medium tabular-nums">
                                                {formatCoordinates(
                                                    selectedLatitude,
                                                    selectedLongitude
                                                )}
                                            </span>
                                        </div>
                                    )}
                            </CardContent>
                        </Card>

                        <Card className="gap-3">
                            <CardHeader>
                                <CardTitle>What happens next</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ol className="space-y-2 text-sm text-muted-foreground">
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
                    open={confirmOpen}
                    onOpenChange={setConfirmOpen}
                    title="Submit this report?"
                    description="Review your entries one more time. Reports go to the municipal administrator for verification before field staff are dispatched."
                    confirmLabel="Submit report"
                    onConfirm={confirmSubmit}
                />
            </div>
        </AppLayout>
    );
}
