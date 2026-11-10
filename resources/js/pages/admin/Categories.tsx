import React, { useMemo, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, Plus, RotateCcw, Tags, Trash2 } from 'lucide-react';
import {
    ConfirmDialog,
    EmptyState,
    FilterSelect,
    PageHeader,
    SearchInput,
    StatCard,
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
import { Checkbox } from '@/components/ui/checkbox';
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
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/AppLayout';
import { formatNumber } from '@/lib/format';
import type { Category } from '@/types/geo';

interface CategoriesProps {
    categoriesList?: Category[];
}

const PRESET_COLORS = [
    '#DC2626',
    '#EA580C',
    '#F59E0B',
    '#10B981',
    '#0D9488',
    '#0284C7',
    '#2563EB',
    '#6366F1',
    '#8B5CF6',
    '#EC4899',
];

export default function Categories({ categoriesList = [] }: CategoriesProps) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>(
        'all'
    );

    const statusOptions: FilterOption[] = [
        { value: 'all', label: 'All statuses' },
        { value: 'active', label: 'Active only' },
        { value: 'inactive', label: 'Inactive only' },
    ];

    const filteredCategories = useMemo(() => {
        const term = search.trim().toLowerCase();

        return categoriesList.filter((category) => {
            if (statusFilter === 'active' && !category.isActive) {
                return false;
            }
            if (statusFilter === 'inactive' && category.isActive) {
                return false;
            }
            if (term === '') {
                return true;
            }

            return (
                category.name.toLowerCase().includes(term) ||
                category.slug.toLowerCase().includes(term) ||
                (category.description ?? '').toLowerCase().includes(term)
            );
        });
    }, [categoriesList, statusFilter, search]);

    const activeCount = useMemo(
        () => categoriesList.filter((category) => category.isActive).length,
        [categoriesList]
    );

    const totalReports = useMemo(
        () =>
            categoriesList.reduce(
                (sum, category) => sum + (category.complaintCount ?? 0),
                0
            ),
        [categoriesList]
    );

    const peakCount = useMemo(
        () =>
            Math.max(
                ...categoriesList.map(
                    (category) => category.complaintCount ?? 0
                ),
                1
            ),
        [categoriesList]
    );

    // Create / Edit Dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const form = useForm({
        name: '',
        description: '',
        color: '#10B981',
        is_active: true,
    });

    const openCreateDialog = () => {
        setEditingCategory(null);
        form.reset();
        form.clearErrors();
        form.setData({
            name: '',
            description: '',
            color: '#10B981',
            is_active: true,
        });
        setDialogOpen(true);
    };

    const openEditDialog = (category: Category) => {
        setEditingCategory(category);
        form.clearErrors();
        form.setData({
            name: category.name,
            description: category.description ?? '',
            color: category.color || '#10B981',
            is_active: category.isActive,
        });
        setDialogOpen(true);
    };

    const submitCategoryForm = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCategory) {
            form.put(`/admin/categories/${editingCategory.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setDialogOpen(false);
                    setEditingCategory(null);
                },
            });
        } else {
            form.post('/admin/categories', {
                preserveScroll: true,
                onSuccess: () => {
                    setDialogOpen(false);
                    form.reset();
                },
            });
        }
    };

    // Reset defaults
    const [resetDialogOpen, setResetDialogOpen] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    const confirmReset = () => {
        setResetDialogOpen(false);
        setIsResetting(true);
        router.post(
            '/admin/categories/reset',
            {},
            {
                preserveScroll: true,
                onFinish: () => {
                    setIsResetting(false);
                },
            }
        );
    };

    // Delete confirmation
    const [deletingCategory, setDeletingCategory] = useState<Category | null>(
        null
    );
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const promptDelete = (category: Category) => {
        setDeletingCategory(category);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (!deletingCategory) return;
        const targetId = deletingCategory.id;
        setDeleteDialogOpen(false);

        router.delete(`/admin/categories/${targetId}`, {
            preserveScroll: true,
            onFinish: () => {
                setDeletingCategory(null);
            },
        });
    };

    const breadcrumbs = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Categories', href: '/admin/categories' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categories" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <PageHeader
                    eyebrow="Configuration"
                    title="Complaint categories"
                    description="Taxonomy and map-pin color coding used for community report intake."
                    actions={
                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={isResetting}
                                onClick={() => setResetDialogOpen(true)}
                            >
                                <RotateCcw className="size-4" />
                                Reset defaults
                            </Button>
                            <Button size="sm" onClick={openCreateDialog}>
                                <Plus className="size-4" />
                                Add category
                            </Button>
                        </div>
                    }
                />

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        label="Total categories"
                        value={formatNumber(categoriesList.length)}
                        hint="Taxonomy items registered"
                        icon={Tags}
                    />
                    <StatCard
                        label="Active categories"
                        value={formatNumber(activeCount)}
                        hint="Available on citizen intake"
                        icon={Tags}
                    />
                    <StatCard
                        label="Reports filed"
                        value={formatNumber(totalReports)}
                        hint="Categorized complaints"
                        icon={Tags}
                    />
                    <StatCard
                        label="Inactive"
                        value={formatNumber(categoriesList.length - activeCount)}
                        hint="Hidden from intake"
                        icon={Tags}
                    />
                </div>

                <Card className="gap-3">
                    <CardHeader>
                        <CardTitle>Category list</CardTitle>
                        <CardDescription>
                            Showing {filteredCategories.length} of{' '}
                            {categoriesList.length} categories.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <SearchInput
                                modelValue={search}
                                onUpdateModelValue={setSearch}
                                placeholder="Search by name, slug or description"
                                className="sm:max-w-sm"
                            />
                            <FilterSelect
                                modelValue={statusFilter}
                                onUpdateModelValue={(v) =>
                                    setStatusFilter(v as any)
                                }
                                options={statusOptions}
                                aria-label="Filter by status"
                            />
                        </div>

                        {filteredCategories.length === 0 ? (
                            <EmptyState
                                title="No categories found"
                                description="Try adjusting your search or reset the municipal default categories."
                                icon={Tags}
                            />
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {filteredCategories.map((cat) => (
                                    <div
                                        key={cat.id}
                                        className="flex flex-col justify-between rounded-lg border p-4 space-y-3"
                                    >
                                        <div className="space-y-2">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className="size-3 rounded-full"
                                                        style={{
                                                            backgroundColor:
                                                                cat.color,
                                                        }}
                                                    />
                                                    <p className="font-semibold text-sm">
                                                        {cat.name}
                                                    </p>
                                                </div>
                                                <Badge
                                                    variant={
                                                        cat.isActive
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                >
                                                    {cat.isActive
                                                        ? 'Active'
                                                        : 'Inactive'}
                                                </Badge>
                                            </div>

                                            {cat.description && (
                                                <p className="text-xs text-muted-foreground line-clamp-2">
                                                    {cat.description}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between border-t pt-2 text-xs">
                                            <span className="text-muted-foreground font-mono">
                                                {formatNumber(
                                                    cat.complaintCount ?? 0
                                                )}{' '}
                                                reports
                                            </span>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="size-8"
                                                    onClick={() =>
                                                        openEditDialog(cat)
                                                    }
                                                >
                                                    <Pencil className="size-3.5" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="size-8 text-destructive hover:text-destructive"
                                                    disabled={
                                                        (cat.complaintCount ?? 0) >
                                                        0
                                                    }
                                                    onClick={() =>
                                                        promptDelete(cat)
                                                    }
                                                >
                                                    <Trash2 className="size-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Create / Edit Dialog */}
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>
                                {editingCategory
                                    ? 'Edit category'
                                    : 'Add category'}
                            </DialogTitle>
                            <DialogDescription>
                                Set name, pin color, and availability for citizen
                                intake.
                            </DialogDescription>
                        </DialogHeader>

                        <form className="space-y-4" onSubmit={submitCategoryForm}>
                            <div className="space-y-2">
                                <Label htmlFor="cat-name">Category name</Label>
                                <Input
                                    id="cat-name"
                                    value={form.data.name}
                                    onChange={(e) =>
                                        form.setData('name', e.target.value)
                                    }
                                    required
                                    placeholder="e.g. Roads & Drainage"
                                />
                                {form.errors.name && (
                                    <p className="text-xs text-destructive">
                                        {form.errors.name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="cat-desc">
                                    Description (optional)
                                </Label>
                                <Textarea
                                    id="cat-desc"
                                    value={form.data.description}
                                    onChange={(e) =>
                                        form.setData(
                                            'description',
                                            e.target.value
                                        )
                                    }
                                    rows={2}
                                    placeholder="What issues fall under this category?"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Marker & Badge Color</Label>
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {PRESET_COLORS.map((c) => (
                                        <button
                                            key={c}
                                            type="button"
                                            className={`size-6 rounded-full border-2 transition-transform ${
                                                form.data.color === c
                                                    ? 'scale-110 border-foreground'
                                                    : 'border-transparent'
                                            }`}
                                            style={{ backgroundColor: c }}
                                            onClick={() =>
                                                form.setData('color', c)
                                            }
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <Checkbox
                                    id="cat-active"
                                    checked={form.data.is_active}
                                    onCheckedChange={(checked) =>
                                        form.setData(
                                            'is_active',
                                            Boolean(checked)
                                        )
                                    }
                                />
                                <Label
                                    htmlFor="cat-active"
                                    className="text-xs font-normal"
                                >
                                    Active (available for citizens to select)
                                </Label>
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
                                    {editingCategory
                                        ? 'Save changes'
                                        : 'Add category'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Reset Confirmation */}
                <ConfirmDialog
                    open={resetDialogOpen}
                    onOpenChange={setResetDialogOpen}
                    title="Reset to default categories?"
                    description="This restores the standard municipal categories. Existing reports will retain their references."
                    confirmLabel="Reset categories"
                    onConfirm={confirmReset}
                />

                {/* Delete Confirmation */}
                <ConfirmDialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                    title={`Delete category "${deletingCategory?.name ?? ''}"?`}
                    description="Categories with existing reports cannot be deleted."
                    confirmLabel="Delete category"
                    destructive
                    onConfirm={confirmDelete}
                />
            </div>
        </AppLayout>
    );
}
