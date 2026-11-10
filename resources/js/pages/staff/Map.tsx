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
import { complaintStatusMeta, complaintStatuses } from '@/lib/statusMeta';

interface MapPointItem {
    id: number;
    reference?: string;
    title?: string;
    label: string;
    latitude: number;
    longitude: number;
    status: string;
    color?: string;
    barangay?: string;
    address?: string;
}

interface MapProps {
    mapPointsList?: MapPointItem[];
}

export default function Map({ mapPointsList = [] }: MapProps) {
    const [status, setStatus] = useState('all');

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
                    status === 'all' || complaint.status === status
            ),
        [mapPointsList, status]
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
                color: complaint.color ?? '#0284C7',
            })),
        [visible]
    );

    const breadcrumbs = [
        { title: 'Dashboard', href: '/staff/dashboard' },
        { title: 'Field map', href: '/staff/map' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Field map" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <PageHeader
                    eyebrow="Field operations"
                    title="Field map"
                    description="Your assigned work orders plotted on OpenStreetMap for route planning across Loon, Bohol."
                />

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <FilterSelect
                        modelValue={status}
                        onUpdateModelValue={setStatus}
                        options={statusOptions}
                        aria-label="Filter by status"
                    />
                    <p className="text-xs text-muted-foreground">
                        Showing {visible.length} of {mapPointsList.length} assignments
                    </p>
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.75fr_1fr]">
                    <Card className="gap-3">
                        <CardHeader>
                            <CardTitle>Assignment pins</CardTitle>
                            <CardDescription>
                                Interactive OpenStreetMap view of reports assigned to
                                you.
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
                                caption="Municipality of Loon, Bohol · Field Operations OpenStreetMap"
                            />
                        </CardContent>
                    </Card>

                    <Card className="gap-3">
                        <CardHeader>
                            <CardTitle>Visit list</CardTitle>
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
                                                href={`/staff/complaints/${complaint.id}`}
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
                                                    {complaint.address ||
                                                        complaint.barangay ||
                                                        'Loon, Bohol'}
                                                </p>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="py-8 text-center text-sm text-muted-foreground">
                                    No field assignments found for this filter.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
