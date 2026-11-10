import React, { useMemo, useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    HardHat,
    Plus,
    ShieldCheck,
    UserCheck,
    UserCog,
    Users as UsersIcon,
} from 'lucide-react';
import {
    ConfirmDialog,
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
import { formatDate, formatNumber } from '@/lib/format';
import { roleMeta } from '@/lib/statusMeta';
import { useTaxonomy } from '@/lib/taxonomy';
import type { GeoRole, ManagedUser } from '@/types/geo';

interface UsersProps {
    usersList?: ManagedUser[];
}

export default function Users({ usersList = [] }: UsersProps) {
    const page = usePage<{ auth?: { user?: { id?: number } } }>();
    const currentUserId = page.props.auth?.user?.id ?? null;
    const { barangays: liveBarangays } = useTaxonomy();

    const [search, setSearch] = useState('');
    const [role, setRole] = useState('all');

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

    const barangayFormOptions = useMemo<FilterOption[]>(() => {
        if (liveBarangays.length === 0) {
            return [{ value: 'Moto Sur (Pob.)', label: 'Moto Sur (Pob.)' }];
        }
        return liveBarangays.map((item) => ({
            value: item.name,
            label: item.district ? `${item.name} · ${item.district}` : item.name,
        }));
    }, [liveBarangays]);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();

        return usersList.filter((user) => {
            if (role !== 'all' && user.role !== role) {
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
    }, [usersList, role, search]);

    const counts = useMemo(
        () => ({
            citizen: usersList.filter((u) => u.role === 'citizen').length,
            staff: usersList.filter((u) => u.role === 'staff').length,
            administrator: usersList.filter((u) => u.role === 'administrator')
                .length,
        }),
        [usersList]
    );

    // Modal state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);

    const form = useForm({
        name: '',
        email: '',
        role: 'citizen' as GeoRole,
        barangay: 'Moto Sur (Pob.)',
        password: '',
    });

    const openCreateDialog = () => {
        setEditingUser(null);
        form.reset();
        form.clearErrors();
        form.setData({
            name: '',
            email: '',
            role: 'citizen',
            barangay: barangayFormOptions[0]?.value ?? 'Moto Sur (Pob.)',
            password: '',
        });
        setDialogOpen(true);
    };

    const openEditDialog = (u: ManagedUser) => {
        setEditingUser(u);
        form.clearErrors();
        form.setData({
            name: u.name,
            email: u.email,
            role: u.role,
            barangay: u.barangay,
            password: '',
        });
        setDialogOpen(true);
    };

    const submitUserForm = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingUser) {
            form.put(`/admin/users/${editingUser.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setDialogOpen(false);
                    setEditingUser(null);
                },
            });
        } else {
            form.post('/admin/users', {
                preserveScroll: true,
                onSuccess: () => {
                    setDialogOpen(false);
                    form.reset();
                },
            });
        }
    };

    const quickChangeRole = (userId: number, newRole: GeoRole) => {
        router.post(
            `/admin/users/${userId}/role`,
            { role: newRole },
            { preserveScroll: true }
        );
    };

    const breadcrumbs = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Users', href: '/admin/users' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <PageHeader
                    eyebrow="Administration"
                    title="User management"
                    description="User directory and role-based access control for citizens, field staff, and municipal administrators."
                    actions={
                        <Button size="sm" onClick={openCreateDialog}>
                            <Plus className="size-4" />
                            Add user
                        </Button>
                    }
                />

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        label="Total users"
                        value={formatNumber(usersList.length)}
                        hint="All registered accounts"
                        icon={UsersIcon}
                    />
                    <StatCard
                        label="Citizens"
                        value={formatNumber(counts.citizen)}
                        hint="Community reporters"
                        icon={UserCheck}
                    />
                    <StatCard
                        label="Field staff"
                        value={formatNumber(counts.staff)}
                        hint="Operations personnel"
                        icon={HardHat}
                    />
                    <StatCard
                        label="Administrators"
                        value={formatNumber(counts.administrator)}
                        hint="Municipal command"
                        icon={ShieldCheck}
                    />
                </div>

                <Card className="gap-3">
                    <CardHeader>
                        <CardTitle>Directory</CardTitle>
                        <CardDescription>
                            Showing {filtered.length} of {usersList.length} users.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <SearchInput
                                modelValue={search}
                                onUpdateModelValue={setSearch}
                                placeholder="Search by name, email or barangay"
                                className="sm:max-w-sm"
                            />
                            <FilterSelect
                                modelValue={role}
                                onUpdateModelValue={setRole}
                                options={roleFilterOptions}
                                aria-label="Filter by role"
                            />
                        </div>

                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Barangay</TableHead>
                                        <TableHead>Joined</TableHead>
                                        <TableHead className="text-right">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filtered.map((u) => {
                                        const isSelf = u.id === currentUserId;
                                        return (
                                            <TableRow key={u.id}>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-sm">
                                                            {u.name}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground font-mono">
                                                            {u.email}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            u.role ===
                                                            'administrator'
                                                                ? 'default'
                                                                : u.role === 'staff'
                                                                  ? 'secondary'
                                                                  : 'outline'
                                                        }
                                                    >
                                                        {roleMeta[u.role]?.label ??
                                                            u.role}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-xs">
                                                    {u.barangay}
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    {formatDate(u.joinedAt)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        {u.role === 'citizen' && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-7 text-xs"
                                                                onClick={() =>
                                                                    quickChangeRole(
                                                                        u.id,
                                                                        'staff'
                                                                    )
                                                                }
                                                            >
                                                                Promote to Staff
                                                            </Button>
                                                        )}
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="size-8"
                                                            onClick={() =>
                                                                openEditDialog(u)
                                                            }
                                                        >
                                                            <UserCog className="size-3.5" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Create / Edit User Dialog */}
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>
                                {editingUser ? 'Edit user' : 'Add new user'}
                            </DialogTitle>
                            <DialogDescription>
                                Set profile details and assigned role.
                            </DialogDescription>
                        </DialogHeader>

                        <form className="space-y-4" onSubmit={submitUserForm}>
                            <div className="space-y-2">
                                <Label htmlFor="u-name">Full name</Label>
                                <Input
                                    id="u-name"
                                    value={form.data.name}
                                    onChange={(e) =>
                                        form.setData('name', e.target.value)
                                    }
                                    required
                                    placeholder="Juan Dela Cruz"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="u-email">Email address</Label>
                                <Input
                                    id="u-email"
                                    type="email"
                                    value={form.data.email}
                                    onChange={(e) =>
                                        form.setData('email', e.target.value)
                                    }
                                    required
                                    placeholder="user@example.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="u-role">Role</Label>
                                <FilterSelect
                                    id="u-role"
                                    modelValue={form.data.role}
                                    onUpdateModelValue={(v) =>
                                        form.setData('role', v as GeoRole)
                                    }
                                    options={roleFormOptions}
                                    aria-label="Role"
                                    className="w-full"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="u-barangay">Barangay</Label>
                                <FilterSelect
                                    id="u-barangay"
                                    modelValue={form.data.barangay}
                                    onUpdateModelValue={(v) =>
                                        form.setData('barangay', v)
                                    }
                                    options={barangayFormOptions}
                                    aria-label="Barangay"
                                    className="w-full"
                                />
                            </div>

                            {!editingUser && (
                                <div className="space-y-2">
                                    <Label htmlFor="u-password">
                                        Initial password
                                    </Label>
                                    <Input
                                        id="u-password"
                                        type="password"
                                        value={form.data.password}
                                        onChange={(e) =>
                                            form.setData('password', e.target.value)
                                        }
                                        required
                                        placeholder="••••••••"
                                    />
                                </div>
                            )}

                            <DialogFooter className="gap-2 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={form.processing}>
                                    {editingUser ? 'Save changes' : 'Create user'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
