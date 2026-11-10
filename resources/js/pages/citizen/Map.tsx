import React, { useMemo, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { MapPin } from 'lucide-react';
import OpenStreetMap, { type MapMarker } from '@/components/OpenStreetMap';
import { FilterSelect, PageHeader, StatusBadge } from '@/components/geo';
import type { FilterOption } from '@/components/geo';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/AppLayout';
import { useTaxonomy } from '@/lib/taxonomy';

interface MapPointItem {
    id: number;
    reference?: string;
    title?: string;
    label: string;
    latitude: number;
    longitude: number;
    status: string;
    color?: string;
    categoryId?: number;
    barangay?: string;
    address?: string;
}

interface MapProps {
    mapPointsList?: MapPointItem[];
}

export default function Map({ mapPointsList = [] }: MapProps) {
    const { categories: liveCategories } = useTaxonomy();
    const [category, setCategory] = useState('all');

    const categoryOptions = useMemo<FilterOption[]>(
        () => [
            { value: 'all', label: 'All categories' },
            ...liveCategories.map((item) => ({
                value: String(item.id),
                label: item.name,
            })),
        ],
        [liveCategories]
    );

    const visible = useMemo(
        () =>
            mapPointsList.filter(
                (complaint) =>
                    category === 'all' ||
                    (complaint.categoryId &&
                        String(complaint.categoryId) === category)
            ),
        [mapPointsList, category]
    );

    const liveMarkers = useMemo<MapMarker[]>(
        () =>
            visible.map((complaint) => ({
                id: complaint.id,
                latitude: complaint.latitude,
                longitude: complaint.longitude,
                title: complaint.label,
                description:
                    complaint.address || complaint.barangay || 'Loon, Bohol',
                color: complaint.color ?? '#10B981',
            })),
        [visible]
    );

    const breadcrumbs = [
        { title: 'Dashboard', href: '/citizen/dashboard' },
        { title: 'Community map', href: '/citizen/map' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Community map" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <PageHeader
                    eyebrow="Community"
                    title="Community map"
                    description="Approved reports plotted across the Municipality of Loon, Bohol."
                />

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <FilterSelect
                        modelValue={category}
                        onUpdateModelValue={setCategory}
                        options={categoryOptions}
                        aria-label="Filter by category"
                    />
                    <p className="text-xs text-muted-foreground">
                        Showing {visible.length} of {mapPointsList.length} approved
                        reports
                    </p>
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.75fr_1fr]">
                    <Card className="gap-3">
                        <CardHeader>
                            <CardTitle>Approved reports</CardTitle>
                            <CardDescription>
                                Interactive OpenStreetMap view of public concerns
                                approved for action across Loon, Bohol.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <OpenStreetMap
                                latitude={9.8}
                                longitude={123.8}
                                zoom={13}
                                height="h-[460px]"
                                markers={liveMarkers}
                                selectable={false}
                                showBarangays={false}
                                showLegend={false}
                                caption="Municipality of Loon, Bohol · Community OpenStreetMap"
                            />
                        </CardContent>
                    </Card>

                    <Card className="gap-3">
                        <CardHeader>
                            <CardTitle>Report list</CardTitle>
                            <CardDescription>Newest first.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {visible.length > 0 ? (
                                <ul className="max-h-[460px] divide-y overflow-y-auto pr-1">
                                    {visible.map((complaint) => (
                                        <li
                                            key={complaint.id}
                                            className="py-3 first:pt-0"
                                        >
                                            <Link
                                                href={`/citizen/complaints/${complaint.id}`}
                                                className="block space-y-1.5"
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="font-mono text-xs text-muted-foreground">
                                                        {complaint.reference ??
                                                            `#${complaint.id}`}
                                                    </span>
                                                    <StatusBadge
                                                        status={complaint.status as any}
                                                        dot={false}
                                                    />
                                                </div>
                                                <p className="text-sm font-medium leading-snug">
                                                    {complaint.title ??
                                                        complaint.label}
                                                </p>
                                                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <MapPin className="size-3" />
                                                    {complaint.barangay ||
                                                        'Loon, Bohol'}
                                                </p>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="py-8 text-center text-sm text-muted-foreground">
                                    No public reports recorded yet.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
