<script setup lang="ts">
import { computed, ref } from 'vue';
import { Head, router, useForm } from '@inertiajs/vue3';
import { Pencil, Plus, RotateCcw, Tags, Trash2 } from '@lucide/vue';
import {
    ConfirmDialog,
    EmptyState,
    FilterSelect,
    PageHeader,
    SearchInput,
    StatCard,
} from '@/components/geo';
import type { FilterOption } from '@/components/geo';
import InputError from '@/components/InputError.vue';
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
import { formatNumber } from '@/lib/format';
import type { Category } from '@/types/geo';

const props = withDefaults(
    defineProps<{
        categoriesList?: Category[];
    }>(),
    {
        categoriesList: () => [],
    },
);

defineOptions({
    layout: {
        breadcrumbs: [
            { title: 'Dashboard', href: '/admin/dashboard' },
            { title: 'Categories', href: '/admin/categories' },
        ],
    },
});

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

const search = ref('');
const statusFilter = ref<'all' | 'active' | 'inactive'>('all');

const statusOptions: FilterOption[] = [
    { value: 'all', label: 'All statuses' },
    { value: 'active', label: 'Active only' },
    { value: 'inactive', label: 'Inactive only' },
];

const categories = computed(() => props.categoriesList);

const filteredCategories = computed(() => {
    const term = search.value.trim().toLowerCase();

    return categories.value.filter((category) => {
        if (statusFilter.value === 'active' && !category.isActive) {
            return false;
        }
        if (statusFilter.value === 'inactive' && category.isActive) {
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
});

const activeCount = computed(
    () => categories.value.filter((category) => category.isActive).length,
);

const totalReports = computed(() =>
    categories.value.reduce(
        (sum, category) => sum + (category.complaintCount ?? 0),
        0,
    ),
);

const peakCount = computed(() =>
    Math.max(
        ...categories.value.map((category) => category.complaintCount ?? 0),
        1,
    ),
);

// Create / Edit Dialog state
const dialogOpen = ref(false);
const editingCategory = ref<Category | null>(null);

const form = useForm({
    name: '',
    description: '',
    color: '#10B981',
    is_active: true,
});

function openCreateDialog(): void {
    editingCategory.value = null;
    form.reset();
    form.clearErrors();
    form.name = '';
    form.description = '';
    form.color = '#10B981';
    form.is_active = true;
    dialogOpen.value = true;
}

function openEditDialog(category: Category): void {
    editingCategory.value = category;
    form.clearErrors();
    form.name = category.name;
    form.description = category.description ?? '';
    form.color = category.color || '#10B981';
    form.is_active = category.isActive;
    dialogOpen.value = true;
}

function submitCategoryForm(): void {
    if (editingCategory.value) {
        form.put(`/admin/categories/${editingCategory.value.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                dialogOpen.value = false;
                editingCategory.value = null;
            },
        });
    } else {
        form.post('/admin/categories', {
            preserveScroll: true,
            onSuccess: () => {
                dialogOpen.value = false;
                form.reset();
            },
        });
    }
}

// Toggle Active / Inactive state
const togglingId = ref<number | null>(null);

function toggleCategory(category: Category): void {
    togglingId.value = category.id;
    router.patch(
        `/admin/categories/${category.id}/toggle`,
        {},
        {
            preserveScroll: true,
            onFinish: () => {
                togglingId.value = null;
            },
        },
    );
}

// Restore defaults
const isSeedingDefaults = ref(false);

function restoreDefaults(): void {
    isSeedingDefaults.value = true;
    router.post(
        '/admin/categories/seed-defaults',
        {},
        {
            preserveScroll: true,
            onFinish: () => {
                isSeedingDefaults.value = false;
            },
        },
    );
}

// Delete Confirmation state
const deletingCategory = ref<Category | null>(null);
const deleteDialogOpen = ref(false);

function promptDelete(category: Category): void {
    deletingCategory.value = category;
    deleteDialogOpen.value = true;
}

function confirmDelete(): void {
    if (!deletingCategory.value) {
        return;
    }

    const targetId = deletingCategory.value.id;
    deleteDialogOpen.value = false;

    router.delete(`/admin/categories/${targetId}`, {
        preserveScroll: true,
        onFinish: () => {
            deletingCategory.value = null;
        },
    });
}
</script>

<template>
    <Head title="Categories" />

    <div class="flex h-full flex-1 flex-col gap-4 p-4">
        <PageHeader
            eyebrow="Configuration"
            title="Categories"
            description="Manage the official municipal complaint classifications citizens can select across Loon, Bohol."
        >
            <template #actions>
                <div class="flex flex-wrap items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        :disabled="isSeedingDefaults"
                        @click="restoreDefaults"
                    >
                        <RotateCcw class="size-4" />
                        Restore defaults
                    </Button>
                    <Button size="sm" @click="openCreateDialog">
                        <Plus class="size-4" />
                        Add category
                    </Button>
                </div>
            </template>
        </PageHeader>

        <div class="grid gap-4 sm:grid-cols-3">
            <StatCard
                label="Categories"
                :value="formatNumber(categories.length)"
                hint="Configured in database"
                :icon="Tags"
            />
            <StatCard
                label="Accepting reports"
                :value="formatNumber(activeCount)"
                hint="Visible on the citizen report form"
                :icon="Tags"
            />
            <StatCard
                label="Reports filed"
                :value="formatNumber(totalReports)"
                hint="Municipality-wide across all categories"
                :icon="Tags"
            />
        </div>

        <Card class="gap-3">
            <CardHeader>
                <CardTitle>Category registry</CardTitle>
                <CardDescription>
                    Create, edit, activate, or retire concern classifications
                    and monitor filed report volume.
                </CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
                <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <SearchInput
                        v-model="search"
                        placeholder="Search categories by name or description"
                        class="sm:max-w-sm"
                    />
                    <FilterSelect
                        v-model="statusFilter"
                        :options="statusOptions"
                        aria-label="Filter categories by status"
                    />
                </div>

                <EmptyState
                    v-if="filteredCategories.length === 0"
                    title="No categories found"
                    description="Add a new category, adjust your filters, or restore the standard municipal defaults."
                    :icon="Tags"
                >
                    <Button size="sm" @click="openCreateDialog">
                        <Plus class="size-4" />
                        Add category
                    </Button>
                </EmptyState>

                <ul v-else class="grid gap-3 lg:grid-cols-2">
                    <li
                        v-for="category in filteredCategories"
                        :key="category.id"
                        class="flex flex-col justify-between rounded-lg border bg-card p-4 transition-opacity"
                        :class="{ 'opacity-65': !category.isActive }"
                    >
                        <div class="flex items-start justify-between gap-3">
                            <div class="flex min-w-0 items-start gap-3">
                                <span
                                    class="mt-1 size-3.5 shrink-0 rounded-full ring-2 ring-offset-2 ring-offset-background"
                                    :style="{
                                        backgroundColor: category.color,
                                        '--tw-ring-color': `${category.color}40`,
                                    }"
                                />
                                <div class="min-w-0">
                                    <div
                                        class="flex flex-wrap items-center gap-2"
                                    >
                                        <p class="text-sm font-medium">
                                            {{ category.name }}
                                        </p>
                                        <span
                                            class="font-mono text-[11px] text-muted-foreground"
                                        >
                                            {{ category.color }}
                                        </span>
                                    </div>
                                    <p
                                        class="mt-0.5 text-xs leading-snug text-muted-foreground"
                                    >
                                        {{
                                            category.description ||
                                            'No description provided.'
                                        }}
                                    </p>
                                </div>
                            </div>
                            <Badge
                                :variant="
                                    category.isActive ? 'outline' : 'secondary'
                                "
                                class="shrink-0"
                            >
                                {{ category.isActive ? 'Active' : 'Inactive' }}
                            </Badge>
                        </div>

                        <div class="mt-4 space-y-2.5">
                            <div
                                class="h-1.5 overflow-hidden rounded-full bg-muted"
                            >
                                <div
                                    class="h-full rounded-full transition-all"
                                    :style="{
                                        width: `${totalReports > 0 ? Math.round(((category.complaintCount ?? 0) / peakCount) * 100) : 0}%`,
                                        backgroundColor: category.color,
                                    }"
                                />
                            </div>
                            <div
                                class="flex flex-wrap items-center justify-between gap-2"
                            >
                                <p
                                    class="text-xs text-muted-foreground tabular-nums"
                                >
                                    {{
                                        formatNumber(
                                            category.complaintCount ?? 0,
                                        )
                                    }}
                                    {{
                                        (category.complaintCount ?? 0) === 1
                                            ? 'report'
                                            : 'reports'
                                    }}
                                </p>
                                <div class="flex items-center gap-1.5">
                                    <Button
                                        size="sm"
                                        :variant="
                                            category.isActive
                                                ? 'outline'
                                                : 'default'
                                        "
                                        :disabled="togglingId === category.id"
                                        @click="toggleCategory(category)"
                                    >
                                        {{
                                            category.isActive
                                                ? 'Deactivate'
                                                : 'Activate'
                                        }}
                                    </Button>
                                    <Button
                                        size="icon-sm"
                                        variant="ghost"
                                        :title="`Edit ${category.name}`"
                                        @click="openEditDialog(category)"
                                    >
                                        <Pencil class="size-3.5" />
                                    </Button>
                                    <Button
                                        size="icon-sm"
                                        variant="ghost"
                                        class="text-destructive hover:text-destructive"
                                        :disabled="
                                            (category.complaintCount ?? 0) > 0
                                        "
                                        :title="
                                            (category.complaintCount ?? 0) > 0
                                                ? 'Categories with filed reports cannot be deleted — deactivate instead'
                                                : `Delete ${category.name}`
                                        "
                                        @click="promptDelete(category)"
                                    >
                                        <Trash2 class="size-3.5" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </li>
                </ul>
            </CardContent>
        </Card>

        <!-- Create / Edit Category Modal -->
        <Dialog v-model:open="dialogOpen">
            <DialogContent class="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {{ editingCategory ? 'Edit category' : 'Add category' }}
                    </DialogTitle>
                    <DialogDescription>
                        {{
                            editingCategory
                                ? 'Update this complaint category. Changes immediately reflect across forms, tables, and GIS map pins.'
                                : 'Create a new complaint classification for citizens in Loon, Bohol.'
                        }}
                    </DialogDescription>
                </DialogHeader>

                <form class="space-y-4" @submit.prevent="submitCategoryForm">
                    <div class="space-y-2">
                        <Label for="cat-name">Category name</Label>
                        <Input
                            id="cat-name"
                            v-model="form.name"
                            required
                            placeholder="e.g. Roads & Infrastructure"
                        />
                        <InputError :message="form.errors.name" />
                    </div>

                    <div class="space-y-2">
                        <Label for="cat-description">Description</Label>
                        <Textarea
                            id="cat-description"
                            v-model="form.description"
                            :rows="3"
                            placeholder="Briefly describe what concerns belong under this category."
                        />
                        <InputError :message="form.errors.description" />
                    </div>

                    <div class="space-y-2">
                        <Label for="cat-color">Map pin & badge color</Label>
                        <div class="flex items-center gap-2">
                            <input
                                type="color"
                                :value="form.color"
                                class="h-9 w-12 cursor-pointer rounded border bg-transparent p-1"
                                aria-label="Pick color"
                                @input="
                                    form.color = (
                                        $event.target as HTMLInputElement
                                    ).value.toUpperCase()
                                "
                            />
                            <Input
                                id="cat-color"
                                v-model="form.color"
                                placeholder="#10B981"
                                class="font-mono uppercase"
                            />
                        </div>
                        <div class="flex flex-wrap gap-1.5 pt-1">
                            <button
                                v-for="swatch in PRESET_COLORS"
                                :key="swatch"
                                type="button"
                                class="size-6 rounded-full border-2 transition-transform hover:scale-110"
                                :class="
                                    form.color.toUpperCase() === swatch
                                        ? 'scale-110 border-foreground'
                                        : 'border-transparent'
                                "
                                :style="{ backgroundColor: swatch }"
                                :title="swatch"
                                @click="form.color = swatch"
                            />
                        </div>
                        <InputError :message="form.errors.color" />
                    </div>

                    <Label class="flex items-center gap-2 text-sm font-normal">
                        <Checkbox
                            :model-value="form.is_active"
                            @update:model-value="
                                form.is_active = Boolean($event)
                            "
                        />
                        Active (visible to citizens on the report submission
                        form)
                    </Label>

                    <DialogFooter class="gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            @click="dialogOpen = false"
                        >
                            Cancel
                        </Button>
                        <Button type="submit" :disabled="form.processing">
                            {{
                                editingCategory
                                    ? 'Save changes'
                                    : 'Create category'
                            }}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>

        <!-- Delete Category Confirmation -->
        <ConfirmDialog
            v-model:open="deleteDialogOpen"
            :title="`Delete &quot;${deletingCategory?.name ?? 'category'}&quot;?`"
            description="This permanently removes the category from the database. Categories with existing reports cannot be deleted."
            confirm-label="Delete category"
            destructive
            @confirm="confirmDelete"
        />
    </div>
</template>
