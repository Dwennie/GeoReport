<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Head, router, useForm } from '@inertiajs/vue3';
import {
    Compass,
    Layers,
    MapPin,
    Pencil,
    Plus,
    RefreshCw,
    Trash2,
} from '@lucide/vue';
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
import { formatCoordinates, formatNumber } from '@/lib/format';
import type { Barangay } from '@/types/geo';

const props = withDefaults(
    defineProps<{
        barangaysList?: Barangay[];
        sectorsList?: string[];
    }>(),
    {
        barangaysList: () => [],
        sectorsList: () => [
            'Poblacion',
            'North Coastal',
            'South Coastal',
            'Cabilao Island',
            'Sandingan Island',
            'North Uplands',
            'South Uplands',
        ],
    },
);

defineOptions({
    layout: {
        breadcrumbs: [
            { title: 'Dashboard', href: '/admin/dashboard' },
            { title: 'Barangays', href: '/admin/barangays' },
        ],
    },
});

const perPage = 15;
const search = ref('');
const sector = ref('all');
const page = ref(1);

const barangays = computed(() => props.barangaysList);

const availableSectors = computed(() => {
    const set = new Set<string>(props.sectorsList);
    for (const item of barangays.value) {
        if (item.district) {
            set.add(item.district);
        }
    }
    return Array.from(set);
});

const sectorFilterOptions = computed<FilterOption[]>(() => [
    { value: 'all', label: 'All geographic sectors' },
    ...availableSectors.value.map((value) => ({
        value,
        label: value,
    })),
]);

const sectorFormOptions = computed<FilterOption[]>(() =>
    availableSectors.value.map((value) => ({
        value,
        label: value,
    })),
);

const filtered = computed(() => {
    const term = search.value.trim().toLowerCase();

    return barangays.value.filter((item) => {
        if (sector.value !== 'all' && item.district !== sector.value) {
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
});

const paged = computed(() =>
    filtered.value.slice((page.value - 1) * perPage, page.value * perPage),
);

watch([search, sector], () => {
    page.value = 1;
});

const totalLandArea = computed(() =>
    barangays.value.reduce((sum, item) => sum + (item.areaSqKm ?? 0), 0),
);

const totalReports = computed(() =>
    barangays.value.reduce((sum, item) => sum + (item.complaintCount ?? 0), 0),
);

// Create / Edit Modal
const dialogOpen = ref(false);
const editingBarangay = ref<Barangay | null>(null);

const form = useForm({
    name: '',
    district: 'Poblacion',
});

function openCreateDialog(): void {
    editingBarangay.value = null;
    form.reset();
    form.clearErrors();
    form.name = '';
    form.district = availableSectors.value[0] ?? 'Poblacion';
    dialogOpen.value = true;
}

function openEditDialog(item: Barangay): void {
    editingBarangay.value = item;
    form.clearErrors();
    form.name = item.name;
    form.district = item.district || 'Poblacion';
    dialogOpen.value = true;
}

function submitBarangayForm(): void {
    if (editingBarangay.value) {
        form.put(`/admin/barangays/${editingBarangay.value.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                dialogOpen.value = false;
                editingBarangay.value = null;
            },
        });
    } else {
        form.post('/admin/barangays', {
            preserveScroll: true,
            onSuccess: () => {
                dialogOpen.value = false;
                form.reset();
            },
        });
    }
}

// Sync 67 official PSA barangays
const isSyncing = ref(false);

function syncOfficialBarangays(): void {
    isSyncing.value = true;
    router.post(
        '/admin/barangays/sync',
        {},
        {
            preserveScroll: true,
            onFinish: () => {
                isSyncing.value = false;
            },
        },
    );
}

// Delete Confirmation
const deletingBarangay = ref<Barangay | null>(null);
const deleteDialogOpen = ref(false);

function promptDelete(item: Barangay): void {
    deletingBarangay.value = item;
    deleteDialogOpen.value = true;
}

function confirmDelete(): void {
    if (!deletingBarangay.value) {
        return;
    }

    const targetId = deletingBarangay.value.id;
    deleteDialogOpen.value = false;

    router.delete(`/admin/barangays/${targetId}`, {
        preserveScroll: true,
        onFinish: () => {
            deletingBarangay.value = null;
        },
    });
}
</script>

<template>
    <Head title="Barangays" />

    <div class="flex h-full flex-1 flex-col gap-4 p-4">
        <PageHeader
            eyebrow="Configuration"
            title="Barangays of Loon, Bohol"
            description="Official PSA / NAMRIA administrative registry of barangays, geographic sectors, and GIS centroids."
        >
            <template #actions>
                <div class="flex flex-wrap items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        :disabled="isSyncing"
                        @click="syncOfficialBarangays"
                    >
                        <RefreshCw
                            class="size-4"
                            :class="{ 'animate-spin': isSyncing }"
                        />
                        Sync 67 PSA barangays
                    </Button>
                    <Button size="sm" @click="openCreateDialog">
                        <Plus class="size-4" />
                        Add barangay
                    </Button>
                </div>
            </template>
        </PageHeader>

        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
                label="Registered barangays"
                :value="formatNumber(barangays.length)"
                hint="Municipality of Loon (PSGC 0701230000)"
                :icon="MapPin"
            />
            <StatCard
                label="Geographic sectors"
                :value="formatNumber(availableSectors.length)"
                hint="Mainland coastal, upland & island clusters"
                :icon="Layers"
            />
            <StatCard
                label="Mapped land area"
                :value="`${totalLandArea.toFixed(2)} km²`"
                hint="Computed from NAMRIA / PSA polygons"
                :icon="Compass"
            />
            <StatCard
                label="Reports filed"
                :value="formatNumber(totalReports)"
                hint="Across all Loon barangays"
                :icon="MapPin"
            />
        </div>

        <Card class="gap-3">
            <CardHeader>
                <CardTitle>Barangay directory</CardTitle>
                <CardDescription>
                    Showing {{ formatNumber(filtered.length) }} of
                    {{ formatNumber(barangays.length) }} barangays. Renaming a
                    barangay automatically updates linked reports and citizen
                    profiles.
                </CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
                <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <SearchInput
                        v-model="search"
                        placeholder="Search by barangay name, PSGC code or sector"
                        class="sm:max-w-sm"
                    />
                    <FilterSelect
                        v-model="sector"
                        :options="sectorFilterOptions"
                        aria-label="Filter by geographic sector"
                    />
                </div>

                <EmptyState
                    v-if="filtered.length === 0"
                    title="No barangays match your search"
                    description="Clear the search filter or sync the 67 official PSA barangays of Loon, Bohol."
                    :icon="MapPin"
                >
                    <Button
                        variant="outline"
                        size="sm"
                        @click="syncOfficialBarangays"
                    >
                        <RefreshCw class="size-4" />
                        Sync 67 PSA barangays
                    </Button>
                </EmptyState>

                <template v-else>
                    <!-- Mobile View -->
                    <ul class="divide-y md:hidden">
                        <li
                            v-for="item in paged"
                            :key="item.id"
                            class="space-y-2 py-3 first:pt-0 last:pb-0"
                        >
                            <div class="flex items-start justify-between gap-2">
                                <div>
                                    <p class="text-sm font-medium">
                                        {{ item.name }}
                                    </p>
                                    <p
                                        class="font-mono text-[11px] text-muted-foreground"
                                    >
                                        {{ item.psgcCode ?? 'Custom entry' }}
                                        <template v-if="item.areaSqKm">
                                            · {{ item.areaSqKm.toFixed(2) }} km²
                                        </template>
                                    </p>
                                </div>
                                <Badge variant="outline">
                                    {{ item.district }}
                                </Badge>
                            </div>
                            <div
                                class="flex items-center justify-between text-xs"
                            >
                                <span
                                    class="text-muted-foreground tabular-nums"
                                >
                                    {{ formatNumber(item.complaintCount ?? 0) }}
                                    {{
                                        (item.complaintCount ?? 0) === 1
                                            ? 'report'
                                            : 'reports'
                                    }}
                                </span>
                                <div class="flex items-center gap-1">
                                    <Button
                                        size="icon-sm"
                                        variant="ghost"
                                        :title="`Edit ${item.name}`"
                                        @click="openEditDialog(item)"
                                    >
                                        <Pencil class="size-3.5" />
                                    </Button>
                                    <Button
                                        size="icon-sm"
                                        variant="ghost"
                                        class="text-destructive hover:text-destructive"
                                        :disabled="
                                            (item.complaintCount ?? 0) > 0
                                        "
                                        :title="
                                            (item.complaintCount ?? 0) > 0
                                                ? 'Cannot delete a barangay with filed reports'
                                                : `Delete ${item.name}`
                                        "
                                        @click="promptDelete(item)"
                                    >
                                        <Trash2 class="size-3.5" />
                                    </Button>
                                </div>
                            </div>
                        </li>
                    </ul>

                    <!-- Desktop Table View -->
                    <div class="hidden md:block">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Barangay</TableHead>
                                    <TableHead>PSGC Code</TableHead>
                                    <TableHead>Geographic Sector</TableHead>
                                    <TableHead>Land Area</TableHead>
                                    <TableHead>GIS Centroid</TableHead>
                                    <TableHead class="text-right"
                                        >Reports</TableHead
                                    >
                                    <TableHead class="text-right"
                                        >Actions</TableHead
                                    >
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow v-for="item in paged" :key="item.id">
                                    <TableCell class="font-medium">
                                        {{ item.name }}
                                    </TableCell>
                                    <TableCell
                                        class="font-mono text-xs text-muted-foreground"
                                    >
                                        {{ item.psgcCode ?? 'Custom' }}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            class="font-normal"
                                        >
                                            {{ item.district }}
                                        </Badge>
                                    </TableCell>
                                    <TableCell
                                        class="font-mono text-xs text-muted-foreground tabular-nums"
                                    >
                                        {{
                                            item.areaSqKm != null
                                                ? `${item.areaSqKm.toFixed(2)} km²`
                                                : '—'
                                        }}
                                    </TableCell>
                                    <TableCell
                                        class="font-mono text-xs text-muted-foreground tabular-nums"
                                    >
                                        {{
                                            item.latitude != null &&
                                            item.longitude != null
                                                ? formatCoordinates(
                                                      item.latitude,
                                                      item.longitude,
                                                  )
                                                : '—'
                                        }}
                                    </TableCell>
                                    <TableCell
                                        class="text-right font-mono text-xs tabular-nums"
                                    >
                                        {{
                                            formatNumber(
                                                item.complaintCount ?? 0,
                                            )
                                        }}
                                    </TableCell>
                                    <TableCell class="text-right">
                                        <div
                                            class="flex items-center justify-end gap-1"
                                        >
                                            <Button
                                                size="icon-sm"
                                                variant="ghost"
                                                :title="`Edit ${item.name}`"
                                                @click="openEditDialog(item)"
                                            >
                                                <Pencil class="size-3.5" />
                                            </Button>
                                            <Button
                                                size="icon-sm"
                                                variant="ghost"
                                                class="text-destructive hover:text-destructive"
                                                :disabled="
                                                    (item.complaintCount ?? 0) >
                                                    0
                                                "
                                                :title="
                                                    (item.complaintCount ?? 0) >
                                                    0
                                                        ? 'Cannot delete a barangay with filed reports'
                                                        : `Delete ${item.name}`
                                                "
                                                @click="promptDelete(item)"
                                            >
                                                <Trash2 class="size-3.5" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>

                    <TablePagination
                        v-if="filtered.length > perPage"
                        :page="page"
                        :per-page="perPage"
                        :total="filtered.length"
                        @update:page="page = $event"
                    />
                </template>
            </CardContent>
        </Card>

        <!-- Create / Edit Barangay Modal -->
        <Dialog v-model:open="dialogOpen">
            <DialogContent class="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {{ editingBarangay ? 'Edit barangay' : 'Add barangay' }}
                    </DialogTitle>
                    <DialogDescription>
                        {{
                            editingBarangay
                                ? 'Update this barangay name or geographic sector. Linked reports and accounts will automatically stay in sync.'
                                : 'Register a barangay in the Municipality of Loon, Bohol.'
                        }}
                    </DialogDescription>
                </DialogHeader>

                <form class="space-y-4" @submit.prevent="submitBarangayForm">
                    <div class="space-y-2">
                        <Label for="brgy-name">Barangay name</Label>
                        <Input
                            id="brgy-name"
                            v-model="form.name"
                            required
                            placeholder="e.g. Moto Sur (Pob.)"
                        />
                        <InputError :message="form.errors.name" />
                    </div>

                    <div class="space-y-2">
                        <Label for="brgy-sector">Geographic sector</Label>
                        <FilterSelect
                            id="brgy-sector"
                            v-model="form.district"
                            :options="sectorFormOptions"
                            placeholder="Select a sector"
                            aria-label="Geographic sector"
                            class="w-full"
                        />
                        <InputError :message="form.errors.district" />
                    </div>

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
                                editingBarangay
                                    ? 'Save changes'
                                    : 'Add barangay'
                            }}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>

        <!-- Delete Barangay Confirmation -->
        <ConfirmDialog
            v-model:open="deleteDialogOpen"
            :title="`Remove Barangay &quot;${deletingBarangay?.name ?? ''}&quot;?`"
            description="This removes the barangay from the municipal dropdowns. Barangays with existing reports cannot be deleted."
            confirm-label="Remove barangay"
            destructive
            @confirm="confirmDelete"
        />
    </div>
</template>
