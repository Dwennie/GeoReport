<script setup lang="ts">
import { computed, ref } from 'vue';
import { Head, router, useForm, usePage } from '@inertiajs/vue3';
import {
    HardHat,
    Plus,
    ShieldCheck,
    UserCheck,
    UserCog,
    Users as UsersIcon,
} from '@lucide/vue';
import {
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
import { formatDate, formatNumber } from '@/lib/format';
import { roleMeta } from '@/lib/statusMeta';
import { useTaxonomy } from '@/lib/taxonomy';
import type { GeoRole, ManagedUser } from '@/types/geo';

const props = withDefaults(
    defineProps<{
        usersList?: ManagedUser[];
    }>(),
    {
        usersList: () => [],
    },
);

defineOptions({
    layout: {
        breadcrumbs: [
            { title: 'Dashboard', href: '/admin/dashboard' },
            { title: 'Users', href: '/admin/users' },
        ],
    },
});

const page = usePage();
const currentUserId = computed(() => page.props.auth?.user?.id ?? null);
const { barangays: liveBarangays } = useTaxonomy();

const search = ref('');
const role = ref('all');

const users = computed(() => props.usersList);

const roleFilterOptions: FilterOption[] = [
    { value: 'all', label: 'All roles' },
    ...(Object.keys(roleMeta) as GeoRole[]).map((value) => ({
        value,
        label: roleMeta[value].label,
    })),
];

const roleFormOptions: FilterOption[] = [
    { value: 'citizen', label: 'Citizen (Community reporter)' },
    { value: 'staff', label: 'Field Staff (Operations & Engineering)' },
    { value: 'administrator', label: 'Administrator (Municipal Command)' },
];

const statusFormOptions: FilterOption[] = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
];

const barangayFormOptions = computed<FilterOption[]>(() => {
    if (liveBarangays.value.length === 0) {
        return [{ value: 'Moto Sur (Pob.)', label: 'Moto Sur (Pob.)' }];
    }

    return liveBarangays.value.map((item) => ({
        value: item.name,
        label: item.district ? `${item.name} · ${item.district}` : item.name,
    }));
});

const filtered = computed(() => {
    const term = search.value.trim().toLowerCase();

    return users.value.filter((user) => {
        if (role.value !== 'all' && user.role !== role.value) {
            return false;
        }

        if (term === '') {
            return true;
        }

        return (
            user.name.toLowerCase().includes(term) ||
            user.email.toLowerCase().includes(term) ||
            user.barangay.toLowerCase().includes(term)
        );
    });
});

const counts = computed<Record<GeoRole, number>>(() => ({
    citizen: users.value.filter((user) => user.role === 'citizen').length,
    staff: users.value.filter((user) => user.role === 'staff').length,
    administrator: users.value.filter((user) => user.role === 'administrator')
        .length,
}));

function roleBadgeClass(value: GeoRole): string {
    return roleMeta[value].badge;
}

function initials(user: ManagedUser): string {
    return user.name
        .split(' ')
        .map((part) => part.charAt(0))
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

// One-click quick upgrade (e.g. Citizen -> Field Staff)
const upgradingId = ref<number | null>(null);

function quickUpgradeToStaff(user: ManagedUser): void {
    upgradingId.value = user.id;
    router.patch(
        `/admin/users/${user.id}/role`,
        {
            role: 'staff',
            status: user.status,
            barangay: user.barangay,
        },
        {
            preserveScroll: true,
            onFinish: () => {
                upgradingId.value = null;
            },
        },
    );
}

// Manage Role & Account Modal
const manageDialogOpen = ref(false);
const editingUser = ref<ManagedUser | null>(null);

const isEditingSelf = computed(
    () =>
        editingUser.value !== null &&
        currentUserId.value !== null &&
        editingUser.value.id === currentUserId.value,
);

const manageForm = useForm({
    role: 'citizen' as GeoRole,
    barangay: 'Moto Sur (Pob.)',
    status: 'active' as 'active' | 'inactive',
});

function openManageDialog(user: ManagedUser): void {
    editingUser.value = user;
    manageForm.clearErrors();
    manageForm.role = user.role;
    manageForm.barangay = user.barangay || 'Moto Sur (Pob.)';
    manageForm.status = user.status;
    manageDialogOpen.value = true;
}

function submitManageForm(): void {
    if (!editingUser.value) {
        return;
    }

    manageForm.patch(`/admin/users/${editingUser.value.id}/role`, {
        preserveScroll: true,
        onSuccess: () => {
            manageDialogOpen.value = false;
            editingUser.value = null;
        },
    });
}

// Create New User Modal
const createDialogOpen = ref(false);

const createForm = useForm({
    name: '',
    email: '',
    password: '',
    role: 'staff' as GeoRole,
    barangay: 'Moto Sur (Pob.)',
    status: 'active' as 'active' | 'inactive',
});

function openCreateDialog(): void {
    createForm.reset();
    createForm.clearErrors();
    createForm.role = 'staff';
    createForm.barangay = 'Moto Sur (Pob.)';
    createForm.status = 'active';
    createDialogOpen.value = true;
}

function submitCreateForm(): void {
    createForm.post('/admin/users', {
        preserveScroll: true,
        onSuccess: () => {
            createDialogOpen.value = false;
            createForm.reset();
        },
    });
}
</script>

<template>
    <Head title="Users" />

    <div class="flex h-full flex-1 flex-col gap-4 p-4">
        <PageHeader
            eyebrow="Configuration"
            title="Users & roles"
            description="Manage citizen, field staff, and administrator accounts across Loon, Bohol. Upgrade citizen accounts to Field Staff to dispatch them to complaints."
        >
            <template #actions>
                <Button size="sm" @click="openCreateDialog">
                    <Plus class="size-4" />
                    Add user
                </Button>
            </template>
        </PageHeader>

        <div class="grid gap-4 sm:grid-cols-3">
            <StatCard
                label="Citizens"
                :value="formatNumber(counts.citizen)"
                hint="Registered community reporters"
                :icon="UsersIcon"
            />
            <StatCard
                label="Field staff"
                :value="formatNumber(counts.staff)"
                hint="Assignable field responders"
                :icon="HardHat"
            />
            <StatCard
                label="Administrators"
                :value="formatNumber(counts.administrator)"
                hint="Municipal command accounts"
                :icon="ShieldCheck"
            />
        </div>

        <Card class="gap-3">
            <CardHeader>
                <CardTitle>Account directory</CardTitle>
                <CardDescription>
                    {{ formatNumber(filtered.length) }} of
                    {{ formatNumber(users.length) }} accounts match the current
                    filters.
                </CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
                <div class="flex flex-col gap-2 sm:flex-row">
                    <SearchInput
                        v-model="search"
                        placeholder="Search by name, email or barangay"
                        class="sm:max-w-sm"
                    />
                    <FilterSelect
                        v-model="role"
                        :options="roleFilterOptions"
                        aria-label="Filter by role"
                    />
                </div>

                <!-- Mobile Directory -->
                <ul class="divide-y md:hidden">
                    <li
                        v-for="user in filtered"
                        :key="user.id"
                        class="space-y-2.5 py-3.5 first:pt-0"
                    >
                        <div class="flex items-start justify-between gap-2">
                            <div class="min-w-0">
                                <div class="flex items-center gap-1.5">
                                    <p class="truncate text-sm font-medium">
                                        {{ user.name }}
                                    </p>
                                    <Badge
                                        v-if="user.id === currentUserId"
                                        variant="secondary"
                                        class="text-[10px]"
                                    >
                                        You
                                    </Badge>
                                </div>
                                <p
                                    class="truncate text-xs text-muted-foreground"
                                >
                                    {{ user.email }}
                                </p>
                            </div>
                            <Badge :class="roleBadgeClass(user.role)">
                                {{ roleMeta[user.role].label }}
                            </Badge>
                        </div>

                        <div
                            class="flex flex-wrap items-center justify-between gap-2 text-xs"
                        >
                            <span class="text-muted-foreground">
                                {{ user.barangay }} · joined
                                {{ formatDate(user.joinedAt) }}
                            </span>
                            <div class="flex items-center gap-1.5">
                                <Button
                                    v-if="user.role === 'citizen'"
                                    size="sm"
                                    variant="outline"
                                    :disabled="upgradingId === user.id"
                                    @click="quickUpgradeToStaff(user)"
                                >
                                    <UserCheck class="size-3.5" />
                                    Promote to Staff
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    @click="openManageDialog(user)"
                                >
                                    <UserCog class="size-3.5" />
                                    Manage
                                </Button>
                            </div>
                        </div>
                    </li>
                </ul>

                <!-- Desktop Table -->
                <Table class="hidden md:table">
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Barangay</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead class="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow v-for="user in filtered" :key="user.id">
                            <TableCell>
                                <div class="flex items-center gap-3">
                                    <span
                                        class="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground"
                                    >
                                        {{ initials(user) }}
                                    </span>
                                    <span class="flex min-w-0 flex-col">
                                        <span class="flex items-center gap-1.5">
                                            <span class="truncate font-medium">
                                                {{ user.name }}
                                            </span>
                                            <Badge
                                                v-if="user.id === currentUserId"
                                                variant="secondary"
                                                class="px-1.5 py-0 text-[10px]"
                                            >
                                                You
                                            </Badge>
                                        </span>
                                        <span
                                            class="truncate text-xs text-muted-foreground"
                                        >
                                            {{ user.email }}
                                        </span>
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge :class="roleBadgeClass(user.role)">
                                    {{ roleMeta[user.role].label }}
                                </Badge>
                            </TableCell>
                            <TableCell class="text-muted-foreground">
                                {{ user.barangay }}
                            </TableCell>
                            <TableCell
                                class="whitespace-nowrap text-muted-foreground"
                            >
                                {{ formatDate(user.joinedAt) }}
                            </TableCell>
                            <TableCell>
                                <span
                                    class="flex items-center gap-1.5 text-xs"
                                    :class="
                                        user.status === 'active'
                                            ? 'text-emerald-600 dark:text-emerald-400'
                                            : 'text-muted-foreground'
                                    "
                                >
                                    <span
                                        class="size-1.5 rounded-full"
                                        :class="
                                            user.status === 'active'
                                                ? 'bg-emerald-500'
                                                : 'bg-muted-foreground/40'
                                        "
                                    />
                                    {{
                                        user.status === 'active'
                                            ? 'Active'
                                            : 'Inactive'
                                    }}
                                </span>
                            </TableCell>
                            <TableCell class="text-right">
                                <div
                                    class="flex items-center justify-end gap-1.5"
                                >
                                    <Button
                                        v-if="user.role === 'citizen'"
                                        size="sm"
                                        variant="outline"
                                        :disabled="upgradingId === user.id"
                                        @click="quickUpgradeToStaff(user)"
                                    >
                                        <UserCheck class="size-3.5" />
                                        Promote to Staff
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        @click="openManageDialog(user)"
                                    >
                                        <UserCog class="size-3.5" />
                                        Manage role
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>

                <p
                    v-if="filtered.length === 0"
                    class="py-6 text-center text-sm text-muted-foreground"
                >
                    No accounts match these filters.
                </p>
            </CardContent>
        </Card>

        <!-- Manage Role & Account Dialog -->
        <Dialog v-model:open="manageDialogOpen">
            <DialogContent class="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Manage user role</DialogTitle>
                    <DialogDescription v-if="editingUser">
                        Update system permissions and barangay assignment for
                        <span class="font-medium text-foreground">{{
                            editingUser.name
                        }}</span>
                        ({{ editingUser.email }}).
                    </DialogDescription>
                </DialogHeader>

                <form class="space-y-4" @submit.prevent="submitManageForm">
                    <div class="space-y-2">
                        <Label for="manage-role">Assigned role</Label>
                        <FilterSelect
                            id="manage-role"
                            v-model="manageForm.role"
                            :options="roleFormOptions"
                            :disabled="isEditingSelf"
                            aria-label="Assigned role"
                            class="w-full"
                        />
                        <p
                            v-if="isEditingSelf"
                            class="text-xs text-muted-foreground"
                        >
                            Your own administrator role cannot be downgraded so
                            you are never locked out.
                        </p>
                        <p
                            v-else-if="manageForm.role === 'staff'"
                            class="text-xs text-muted-foreground"
                        >
                            Field Staff appear in complaint dispatch dropdowns
                            and can investigate and resolve assigned reports.
                        </p>
                        <p
                            v-else-if="manageForm.role === 'administrator'"
                            class="text-xs text-muted-foreground"
                        >
                            Administrators have full executive access to approve
                            reports, dispatch staff, and configure Loon GIS
                            data.
                        </p>
                        <InputError :message="manageForm.errors.role" />
                    </div>

                    <div class="space-y-2">
                        <Label for="manage-barangay">Home barangay</Label>
                        <FilterSelect
                            id="manage-barangay"
                            v-model="manageForm.barangay"
                            :options="barangayFormOptions"
                            aria-label="Home barangay"
                            class="w-full"
                        />
                        <InputError :message="manageForm.errors.barangay" />
                    </div>

                    <div class="space-y-2">
                        <Label for="manage-status">Account status</Label>
                        <FilterSelect
                            id="manage-status"
                            v-model="manageForm.status"
                            :options="statusFormOptions"
                            :disabled="isEditingSelf"
                            aria-label="Account status"
                            class="w-full"
                        />
                        <InputError :message="manageForm.errors.status" />
                    </div>

                    <DialogFooter class="gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            @click="manageDialogOpen = false"
                        >
                            Cancel
                        </Button>
                        <Button type="submit" :disabled="manageForm.processing">
                            Save changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>

        <!-- Create New User / Staff Dialog -->
        <Dialog v-model:open="createDialogOpen">
            <DialogContent class="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add user account</DialogTitle>
                    <DialogDescription>
                        Register a new Field Staff officer, Administrator, or
                        Citizen account directly.
                    </DialogDescription>
                </DialogHeader>

                <form class="space-y-4" @submit.prevent="submitCreateForm">
                    <div class="space-y-2">
                        <Label for="create-name">Full name</Label>
                        <Input
                            id="create-name"
                            v-model="createForm.name"
                            required
                            placeholder="e.g. Engr. Maria Santos"
                        />
                        <InputError :message="createForm.errors.name" />
                    </div>

                    <div class="space-y-2">
                        <Label for="create-email">Email address</Label>
                        <Input
                            id="create-email"
                            v-model="createForm.email"
                            type="email"
                            required
                            placeholder="maria.santos@loon.gov.ph"
                        />
                        <InputError :message="createForm.errors.email" />
                    </div>

                    <div class="space-y-2">
                        <Label for="create-password">Temporary password</Label>
                        <Input
                            id="create-password"
                            v-model="createForm.password"
                            type="password"
                            required
                            placeholder="Minimum 8 characters"
                        />
                        <InputError :message="createForm.errors.password" />
                    </div>

                    <div class="grid gap-4 sm:grid-cols-2">
                        <div class="space-y-2">
                            <Label for="create-role">Role</Label>
                            <FilterSelect
                                id="create-role"
                                v-model="createForm.role"
                                :options="roleFormOptions"
                                aria-label="Role"
                                class="w-full"
                            />
                            <InputError :message="createForm.errors.role" />
                        </div>

                        <div class="space-y-2">
                            <Label for="create-barangay">Barangay</Label>
                            <FilterSelect
                                id="create-barangay"
                                v-model="createForm.barangay"
                                :options="barangayFormOptions"
                                aria-label="Barangay"
                                class="w-full"
                            />
                            <InputError :message="createForm.errors.barangay" />
                        </div>
                    </div>

                    <DialogFooter class="gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            @click="createDialogOpen = false"
                        >
                            Cancel
                        </Button>
                        <Button type="submit" :disabled="createForm.processing">
                            Create account
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    </div>
</template>
