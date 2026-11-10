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
import { formatRelative } from '@/lib/format';
import { complaintStatusMeta, complaintStatuses } from '@/lib/statusMeta';
import { useTaxonomy } from '@/lib/taxonomy';

type ReportPoint = {
    id: number;
    reference: string;
    title: string;
    label: string;
    latitude: number;
    longitude: number;
    status: string;
    color?: string;
    categoryId?: number;
    barangay?: string;
    address?: string;
    submittedAt?: string;
};

interface MapProps {
    mapPointsList?: ReportPoint[];
}

export default function Map({ mapPointsList = [] }: MapProps) {
    const { categories: liveCategories } = useTaxonomy();
    const [category, setCategory] = useState('all');
    const [status, setStatus] = useState('all');

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

    const statusOptions: FilterOption[] = useMemo(
        () => [
            { value: 'all', label: 'All statuses' },
            ...complaintStatuses.map((value) => ({
                value,
                label: complaintStatusMeta[value].label,
            })),
        ],
        []
    );

    const visible = useMemo(
        () =>
            mapPointsList.filter(
                (complaint) =>
                    (category === 'all' ||
                        (complaint.categoryId &&
                            String(complaint.categoryId) === category)) &&
                    (status === 'all' || complaint.status === status)
            ),
        [mapPointsList, category, status]
    );

    const liveMarkers = useMemo<MapMarker[]>(
        () =>
            visible.map((p) => ({
                id: p.id,
                latitude: p.latitude,
                longitude: p.longitude,
                title: p.label,
                color: p.color ?? '#DC2626',
            })),
        [visible]
    );

    const breadcrumbs = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'GIS map', href: '/admin/map' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="GIS map" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <PageHeader
                    eyebrow="Administration"
                    title="GIS map"
                    description="Interactive municipal GIS registry map across Loon, Bohol powered by OpenStreetMap and Leaflet."
                />

                <div className="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2.5 text-xs text-emerald-800 shadow-xs dark:text-emerald-300">
                    <div className="flex items-center gap-2">
                        <span className="size-2 animate-pulse rounded-full bg-emerald-500" />
                        <span className="font-bold">
                            Live OpenStreetMap GIS Engine Active
                        </span>
                        <span className="text-emerald-600 dark:text-emerald-400">
                            • Centered on the Municipality of Loon, Province of
                            Bohol (9.80° N, 123.80° E).
                        </span>
                    </div>
                    <span className="hidden font-mono text-[11px] text-emerald-700 sm:inline dark:text-emerald-300">
                        OSM Standard Tiles · EPSG:3857
                    </span>
                </div>

                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                    <div className="grid grid-cols-2 gap-2 lg:flex">
                        <FilterSelect
                            modelValue={category}
                            onUpdateModelValue={setCategory}
                            options={categoryOptions}
                            aria-label="Filter by category"
                        />
                        <FilterSelect
                            modelValue={status}
                            onUpdateModelValue={setStatus}
                            options={statusOptions}
                            aria-label="Filter by status"
                        />
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Showing {visible.length} of {mapPointsList.length} reports
                    </p>
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.8fr_1fr]">
                    <Card className="gap-3">
                        <CardHeader>
                            <CardTitle>Loon Municipal GIS</CardTitle>
                            <CardDescription>
                                Official OpenStreetMap with all reported citizen
                                concerns and verified barangay boundaries.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <OpenStreetMap
                                latitude={9.8}
                                longitude={123.8}
                                zoom={12}
                                height="h-[480px]"
                                markers={liveMarkers}
                                selectable={false}
                                showBarangays={true}
                                showLegend={true}
                                caption="Municipality of Loon, Bohol · Comprehensive OpenStreetMap"
                            />
                        </CardContent>
                    </Card>

                    <Card className="gap-3">
                        <CardHeader>
                            <CardTitle>Plotted reports</CardTitle>
                            <CardDescription>
                                Matching current filters.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {visible.length > 0 ? (
                                <ul className="max-h-[480px] divide-y overflow-y-auto pr-1">
                                    {visible.map((p) => (
                                        <li
                                            key={p.id}
                                            className="py-3 first:pt-0"
                                        >
                                            <Link
                                                href={`/admin/complaints/${p.id}`}
                                                className="block space-y-1.5"
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="font-mono text-xs text-muted-foreground">
                                                        {p.reference}
                                                    </span>
                                                    <StatusBadge
                                                        status={p.status as any}
                                                        dot={false}
                                                    />
                                                </div>
                                                <p className="text-sm font-medium leading-snug">
                                                    {p.title}
                                                </p>
                                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="size-3" />
                                                        {p.barangay}
                                                    </span>
                                                    {p.submittedAt && (
                                                        <span>
                                                            {formatRelative(
                                                                p.submittedAt
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="py-8 text-center text-sm text-muted-foreground">
                                    No reports match the selected filters.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
