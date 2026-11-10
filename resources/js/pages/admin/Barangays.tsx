import React, { useEffect, useMemo, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Compass,
    Layers,
    MapPin,
    Pencil,
    Plus,
    RefreshCw,
    Trash2,
} from 'lucide-react';
import {
    ConfirmDialog,
    EmptyState,
    FilterSelect,
    PageHeader,
    SearchInput,
    StatCard,
    TablePagination,
} from '@/components/geo';
import type { FilterOption } from '@/components/geo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/AppLayout';
import { formatCoordinates, formatNumber } from '@/lib/format';
import type { Barangay } from '@/types/geo';

interface BarangaysProps {
    barangaysList?: Barangay[];
    sectorsList?: string[];
}

export default function Barangays({
    barangaysList = [],
    sectorsList = [
        'Poblacion',
        'North Coastal',
        'South Coastal',
        'Cabilao Island',
        'Sandingan Island',
        'North Uplands',
        'South Uplands',
    ],
}: BarangaysProps) {
    const perPage = 15;
    const [search, setSearch] = useState('');
    const [sector, setSector] = useState('all');
    const [page, setPage] = useState(1);

    const availableSectors = useMemo(() => {
        const set = new Set<string>(sectorsList);
        for (const item of barangaysList) {
            if (item.district) {
                set.add(item.district);
            }
        }
        return Array.from(set);
    }, [sectorsList, barangaysList]);

    const sectorFilterOptions = useMemo<FilterOption[]>(
        () => [
            { value: 'all', label: 'All geographic sectors' },
            ...availableSectors.map((value) => ({
                value,
                label: value,
            })),
        ],
        [availableSectors]
    );

    const sectorFormOptions = useMemo<FilterOption[]>(
        () =>
            availableSectors.map((value) => ({
                value,
                label: value,
            })),
        [availableSectors]
    );

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();

        return barangaysList.filter((item) => {
            if (sector !== 'all' && item.district !== sector) {
                return false;
            }

            if (term === '') {
                return true;
            }

            return (
                item.name.toLowerCase().includes(term) ||
                item.district.toLowerCase().includes(term) ||
                (item.psgcCode ?? '').toLowerCase().includes(term)
            );
        });
    }, [barangaysList, sector, search]);

    const paged = useMemo(
        () => filtered.slice((page - 1) * perPage, page * perPage),
        [filtered, page, perPage]
    );

    useEffect(() => {
        setPage(1);
    }, [search, sector]);

    const totalLandArea = useMemo(
        () => barangaysList.reduce((sum, item) => sum + (item.areaSqKm ?? 0), 0),
        [barangaysList]
    );

    const totalReports = useMemo(
        () =>
            barangaysList.reduce((sum, item) => sum + (item.complaintCount ?? 0), 0),
        [barangaysList]
    );

    // Create / Edit Modal
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingBarangay, setEditingBarangay] = useState<Barangay | null>(null);

    const form = useForm({
        name: '',
        district: 'Poblacion',
    });

    const openCreateDialog = () => {
        setEditingBarangay(null);
        form.reset();
        form.clearErrors();
        form.setData({
            name: '',
            district: availableSectors[0] ?? 'Poblacion',
        });
        setDialogOpen(true);
    };

    const openEditDialog = (item: Barangay) => {
        setEditingBarangay(item);
        form.clearErrors();
        form.setData({
            name: item.name,
            district: item.district || 'Poblacion',
        });
        setDialogOpen(true);
    };

    const submitBarangayForm = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingBarangay) {
            form.put(`/admin/barangays/${editingBarangay.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setDialogOpen(false);
                    setEditingBarangay(null);
                },
            });
        } else {
            form.post('/admin/barangays', {
                preserveScroll: true,
                onSuccess: () => {
                    setDialogOpen(false);
                    form.reset();
                },
            });
        }
    };

    // Sync official PSA barangays
    const [isSyncing, setIsSyncing] = useState(false);

    const syncOfficialBarangays = () => {
        setIsSyncing(true);
        router.post(
            '/admin/barangays/sync',
            {},
            {
                preserveScroll: true,
                onFinish: () => {
                    setIsSyncing(false);
                },
            }
        );
    };

    // Delete Confirmation
    const [deletingBarangay, setDeletingBarangay] = useState<Barangay | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const promptDelete = (item: Barangay) => {
        setDeletingBarangay(item);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (!deletingBarangay) {
            return;
        }

        const targetId = deletingBarangay.id;
        setDeleteDialogOpen(false);

        router.delete(`/admin/barangays/${targetId}`, {
            preserveScroll: true,
            onFinish: () => {
                setDeletingBarangay(null);
            },
        });
    };

    const breadcrumbs = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Barangays', href: '/admin/barangays' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Barangays" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <PageHeader
                    eyebrow="Configuration"
                    title="Barangays of Loon, Bohol"
                    description="Official PSA / NAMRIA administrative registry of barangays, geographic sectors, and GIS centroids."
                    actions={
                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={isSyncing}
                                onClick={syncOfficialBarangays}
                            >
                                <RefreshCw
                                    className={`size-4 ${
                                        isSyncing ? 'animate-spin' : ''
                                    }`}
                                />
                                Sync 67 PSA barangays
                            </Button>
                            <Button size="sm" onClick={openCreateDialog}>
                                <Plus className="size-4" />
                                Add barangay
                            </Button>
                        </div>
                    }
                />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        label="Registered barangays"
                        value={formatNumber(barangaysList.length)}
                        hint="Municipality of Loon (PSGC 0701230000)"
                        icon={MapPin}
                    />
                    <StatCard
                        label="Geographic sectors"
                        value={formatNumber(availableSectors.length)}
                        hint="Mainland coastal, upland & island clusters"
                        icon={Layers}
                    />
                    <StatCard
                        label="Mapped land area"
                        value={`${totalLandArea.toFixed(2)} km²`}
                        hint="Computed from NAMRIA / PSA polygons"
                        icon={Compass}
                    />
                    <StatCard
                        label="Reports filed"
                        value={formatNumber(totalReports)}
                        hint="Across all Loon barangays"
                        icon={MapPin}
                    />
                </div>

                <Card className="gap-3">
                    <CardHeader>
                        <CardTitle>Barangay directory</CardTitle>
                        <CardDescription>
                            Showing {formatNumber(filtered.length)} of{' '}
                            {formatNumber(barangaysList.length)} barangays. Renaming a
                            barangay automatically updates linked reports and citizen
                            profiles.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <SearchInput
                                modelValue={search}
                                onUpdateModelValue={setSearch}
                                placeholder="Search by barangay name, PSGC code or sector"
                                className="sm:max-w-sm"
                            />
                            <FilterSelect
                                modelValue={sector}
                                onUpdateModelValue={setSector}
                                options={sectorFilterOptions}
                                aria-label="Filter by geographic sector"
                            />
                        </div>

                        {filtered.length === 0 ? (
                            <EmptyState
                                title="No barangays match your search"
                                description="Clear the search filter or sync the 67 official PSA barangays of Loon, Bohol."
                                icon={MapPin}
                            >
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={syncOfficialBarangays}
                                >
                                    <RefreshCw className="size-4" />
                                    Sync 67 PSA barangays
                                </Button>
                            </EmptyState>
                        ) : (
                            <>
                                {/* Mobile View */}
                                <ul className="divide-y md:hidden">
                                    {paged.map((item) => (
                                        <li
                                            key={item.id}
                                            className="space-y-2 py-3 first:pt-0 last:pb-0"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        {item.name}
                                                    </p>
                                                    <p className="font-mono text-[11px] text-muted-foreground">
                                                        {item.psgcCode ??
                                                            'Custom entry'}
                                                        {item.areaSqKm && (
                                                            <>
                                                                {' '}
                                                                ·{' '}
                                                                {item.areaSqKm.toFixed(
                                                                    2
                                                                )}{' '}
                                                                km²
                                                            </>
                                                        )}
                                                    </p>
                                                </div>
                                                <Badge variant="outline">
                                                    {item.district}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-muted-foreground tabular-nums">
                                                    {formatNumber(
                                                        item.complaintCount ?? 0
                                                    )}{' '}
                                                    {(item.complaintCount ?? 0) === 1
                                                        ? 'report'
                                                        : 'reports'}
                                                </span>
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="size-8"
                                                        title={`Edit ${item.name}`}
                                                        onClick={() =>
                                                            openEditDialog(item)
                                                        }
                                                    >
                                                        <Pencil className="size-3.5" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="size-8 text-destructive hover:text-destructive"
                                                        disabled={
                                                            (item.complaintCount ??
                                                                0) > 0
                                                        }
                                                        title={
                                                            (item.complaintCount ??
                                                                0) > 0
                                                                ? 'Cannot delete a barangay with filed reports'
                                                                : `Delete ${item.name}`
                                                        }
                                                        onClick={() =>
                                                            promptDelete(item)
                                                        }
                                                    >
                                                        <Trash2 className="size-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>

                                {/* Desktop Table View */}
                                <div className="hidden md:block">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Barangay</TableHead>
                                                <TableHead>PSGC Code</TableHead>
                                                <TableHead>
                                                    Geographic Sector
                                                </TableHead>
                                                <TableHead>Land Area</TableHead>
                                                <TableHead>GIS Centroid</TableHead>
                                                <TableHead className="text-right">
                                                    Reports
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    Actions
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {paged.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell className="font-medium">
                                                        {item.name}
                                                    </TableCell>
                                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                                        {item.psgcCode ?? 'Custom'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant="outline"
                                                            className="font-normal"
                                                        >
                                                            {item.district}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="font-mono text-xs text-muted-foreground tabular-nums">
                                                        {item.areaSqKm != null
                                                            ? `${item.areaSqKm.toFixed(
                                                                  2
                                                              )} km²`
                                                            : '—'}
                                                    </TableCell>
                                                    <TableCell className="font-mono text-xs text-muted-foreground tabular-nums">
                                                        {item.latitude != null &&
                                                        item.longitude != null
                                                            ? formatCoordinates(
                                                                  item.latitude,
                                                                  item.longitude
                                                              )
                                                            : '—'}
                                                    </TableCell>
                                                    <TableCell className="text-right font-mono text-xs tabular-nums">
                                                        {formatNumber(
                                                            item.complaintCount ?? 0
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="size-8"
                                                                title={`Edit ${item.name}`}
                                                                onClick={() =>
                                                                    openEditDialog(
                                                                        item
                                                                    )
                                                                }
                                                            >
                                                                <Pencil className="size-3.5" />
                                                            </Button>
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="size-8 text-destructive hover:text-destructive"
                                                                disabled={
                                                                    (item.complaintCount ??
                                                                        0) > 0
                                                                }
                                                                title={
                                                                    (item.complaintCount ??
                                                                        0) > 0
                                                                        ? 'Cannot delete a barangay with filed reports'
                                                                        : `Delete ${item.name}`
                                                                }
                                                                onClick={() =>
                                                                    promptDelete(
                                                                        item
                                                                    )
                                                                }
                                                            >
                                                                <Trash2 className="size-3.5" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {filtered.length > perPage && (
                                    <TablePagination
                                        page={page}
                                        perPage={perPage}
                                        total={filtered.length}
                                        onUpdatePage={setPage}
                                    />
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Create / Edit Barangay Modal */}
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>
                                {editingBarangay
                                    ? 'Edit barangay'
                                    : 'Add barangay'}
                            </DialogTitle>
                            <DialogDescription>
                                {editingBarangay
                                    ? 'Update this barangay name or geographic sector. Linked reports and accounts will automatically stay in sync.'
                                    : 'Register a barangay in the Municipality of Loon, Bohol.'}
                            </DialogDescription>
                        </DialogHeader>

                        <form className="space-y-4" onSubmit={submitBarangayForm}>
                            <div className="space-y-2">
                                <Label htmlFor="brgy-name">Barangay name</Label>
                                <Input
                                    id="brgy-name"
                                    value={form.data.name}
                                    onChange={(e) =>
                                        form.setData('name', e.target.value)
                                    }
                                    required
                                    placeholder="e.g. Moto Sur (Pob.)"
                                />
                                {form.errors.name && (
                                    <p className="text-xs text-destructive">
                                        {form.errors.name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="brgy-sector">Geographic sector</Label>
                                <FilterSelect
                                    id="brgy-sector"
                                    modelValue={form.data.district}
                                    onUpdateModelValue={(val) =>
                                        form.setData('district', val)
                                    }
                                    options={sectorFormOptions}
                                    placeholder="Select a sector"
                                    aria-label="Geographic sector"
                                    className="w-full"
                                />
                                {form.errors.district && (
                                    <p className="text-xs text-destructive">
                                        {form.errors.district}
                                    </p>
                                )}
                            </div>

                            <DialogFooter className="gap-2 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={form.processing}>
                                    {editingBarangay
                                        ? 'Save changes'
                                        : 'Add barangay'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Delete Barangay Confirmation */}
                <ConfirmDialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                    title={`Remove Barangay "${deletingBarangay?.name ?? ''}"?`}
                    description="This removes the barangay from the municipal dropdowns. Barangays with existing reports cannot be deleted."
                    confirmLabel="Remove barangay"
                    destructive
                    onConfirm={confirmDelete}
                />
            </div>
        </AppLayout>
    );
}
