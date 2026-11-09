<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Report;
use App\Models\ReportUpdate;
use App\Models\User;
use App\Support\GeoTransformer;
use App\Support\PlatformSettings;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class ComplaintController extends Controller
{
    public function dashboard(): Response
    {
        $all = Report::with(['category', 'user', 'assignedStaff'])->latest()->get();
        $pending = $all->where('status', 'pending');

        $summaries = $all->map(fn (Report $r) => GeoTransformer::toSummary($r))->values()->all();
        $pendingSummaries = $pending->map(fn (Report $r) => GeoTransformer::toSummary($r))->values()->all();

        $resolved = $all->whereIn('status', ['resolved', 'closed']);
        $totalCount = $all->count();
        $resolvedCount = $resolved->count();
        $resolutionRate = $totalCount > 0 ? round(($resolvedCount / $totalCount) * 100) : 0;

        $categoriesBreakdown = Category::withCount('reports')
            ->orderByDesc('reports_count')
            ->get()
            ->map(fn (Category $c) => [
                'label' => $c->name,
                'value' => $c->reports_count,
            ])
            ->values()
            ->all();

        $monthlyTrend = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = now()->subMonths($i);
            $monthLabel = $month->format('M');
            $submittedInMonth = $all->filter(fn (Report $r) => $r->created_at && $r->created_at->format('Y-m') === $month->format('Y-m'))->count();
            $resolvedInMonth = $resolved->filter(fn (Report $r) => $r->updated_at && $r->updated_at->format('Y-m') === $month->format('Y-m'))->count();

            $monthlyTrend[] = [
                'label' => $monthLabel,
                'submitted' => $submittedInMonth,
                'resolved' => $resolvedInMonth,
            ];
        }

        return Inertia::render('admin/Dashboard', [
            'allComplaintsList' => $summaries,
            'reviewQueueList' => $pendingSummaries,
            'totals' => [
                'total' => $totalCount,
                'pending' => $pending->count(),
                'assigned' => $all->where('status', 'assigned')->count(),
                'inProgress' => $all->where('status', 'in_progress')->count(),
                'resolved' => $resolvedCount,
                'resolutionRate' => $resolutionRate,
                'avgResolutionDays' => $this->averageResolutionDays($resolved),
            ],
            'categoriesBreakdown' => $categoriesBreakdown,
            'monthlyTrend' => $monthlyTrend,
        ]);
    }

    public function index(): Response
    {
        $reports = Report::with(['category', 'user', 'assignedStaff'])->latest()->get();
        $summaries = $reports->map(fn (Report $r) => GeoTransformer::toSummary($r))->values()->all();

        return Inertia::render('admin/complaints/Index', [
            'complaintsList' => $summaries,
        ]);
    }

    public function show(int $id): Response
    {
        $report = Report::with(['category', 'user', 'assignedStaff', 'images', 'updates.user', 'comments.user'])
            ->findOrFail($id);

        $staffMembers = $this->activeStaffMembers();

        return Inertia::render('admin/complaints/Show', [
            'complaintId' => $id,
            'complaintData' => GeoTransformer::toDetail($report),
            'staffOptions' => $staffMembers,
        ]);
    }

    public function approve(Request $request, int $id): RedirectResponse
    {
        $report = Report::findOrFail($id);
        $user = $request->user();

        $oldStatus = $report->status;
        $report->status = 'approved';
        $report->is_public = true;
        $report->save();

        ReportUpdate::create([
            'report_id' => $report->id,
            'user_id' => $user->id,
            'old_status' => $oldStatus,
            'new_status' => 'approved',
            'remarks' => $request->input('remarks', 'Approved by Local Government Unit for action.'),
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Report #{$report->reference_number} approved.",
        ]);

        return back()->with('success', "Report #{$report->reference_number} approved.");
    }

    public function reject(Request $request, int $id): RedirectResponse
    {
        $report = Report::findOrFail($id);
        $user = $request->user();

        $oldStatus = $report->status;
        $report->status = 'rejected';
        $report->is_public = false;
        $report->save();

        ReportUpdate::create([
            'report_id' => $report->id,
            'user_id' => $user->id,
            'old_status' => $oldStatus,
            'new_status' => 'rejected',
            'remarks' => $request->input('remarks', 'Report rejected: Outside LGU jurisdiction or insufficient evidence.'),
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Report #{$report->reference_number} rejected.",
        ]);

        return back()->with('success', "Report #{$report->reference_number} rejected.");
    }

    public function assign(Request $request, int $id): RedirectResponse
    {
        $validated = $request->validate([
            'staff_id' => 'required|exists:users,id',
            'remarks' => 'nullable|string|max:500',
        ]);

        $report = Report::findOrFail($id);
        $user = $request->user();
        $staff = User::query()->findOrFail((int) $validated['staff_id']);

        if (! $staff->isStaff()) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Only Field Staff accounts can be assigned to reports.',
            ]);

            return back();
        }

        $oldStatus = $report->status;
        $report->assigned_to = $staff->id;
        $report->status = 'assigned';
        $report->save();

        ReportUpdate::create([
            'report_id' => $report->id,
            'user_id' => $user->id,
            'old_status' => $oldStatus,
            'new_status' => 'assigned',
            'remarks' => $validated['remarks'] ?? "Assigned to {$staff->name} for ocular inspection and action.",
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Report #{$report->reference_number} assigned to {$staff->name}.",
        ]);

        return back()->with('success', "Report #{$report->reference_number} assigned to {$staff->name}.");
    }

    public function close(Request $request, int $id): RedirectResponse
    {
        $report = Report::findOrFail($id);
        $user = $request->user();

        $oldStatus = $report->status;
        $report->status = 'closed';
        $report->resolved_at ??= now();
        $report->save();

        ReportUpdate::create([
            'report_id' => $report->id,
            'user_id' => $user->id,
            'old_status' => $oldStatus,
            'new_status' => 'closed',
            'remarks' => $request->input('remarks', 'Resolution verified and case closed by Administrator.'),
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Report #{$report->reference_number} closed.",
        ]);

        return back()->with('success', "Report #{$report->reference_number} closed.");
    }

    public function bulkStatus(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:reports,id',
            'action' => 'required|in:approve,reject',
        ]);

        $user = $request->user();
        $newStatus = $validated['action'] === 'approve' ? 'approved' : 'rejected';
        $isPublic = $newStatus === 'approved';
        $remarks = $newStatus === 'approved'
            ? 'Approved by Local Government Unit via batch review.'
            : 'Rejected by Local Government Unit via batch review.';

        $reports = Report::whereIn('id', $validated['ids'])->get();

        foreach ($reports as $report) {
            $oldStatus = $report->status;
            $report->status = $newStatus;
            $report->is_public = $isPublic;
            $report->save();

            ReportUpdate::create([
                'report_id' => $report->id,
                'user_id' => $user->id,
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
                'remarks' => $remarks,
            ]);
        }

        $count = $reports->count();
        $verb = $newStatus === 'approved' ? 'approved' : 'rejected';

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "{$count} ".($count === 1 ? 'report' : 'reports')." {$verb}.",
        ]);

        return back();
    }

    public function map(): Response
    {
        $reports = Report::with('category')->latest()->get();

        $points = $reports->map(fn (Report $r) => [
            'id' => $r->id,
            'reference' => $r->reference_number,
            'title' => $r->title,
            'label' => "{$r->reference_number} — {$r->title}",
            'latitude' => (float) $r->latitude,
            'longitude' => (float) $r->longitude,
            'status' => $r->status,
            'color' => $r->category->color ?? '#EF4444',
            'categoryId' => $r->category_id,
            'barangay' => $r->barangay,
            'address' => $r->address,
            'submittedAt' => $r->created_at?->toISOString() ?? now()->toISOString(),
        ])->values()->all();

        return Inertia::render('admin/Map', [
            'mapPointsList' => $points,
        ]);
    }

    public function assignments(): Response
    {
        $staffMembers = $this->activeStaffMembers();

        $allReports = Report::with(['category', 'assignedStaff'])->latest()->get();
        $summaries = $allReports->map(fn (Report $r) => GeoTransformer::toSummary($r))->values()->all();

        return Inertia::render('admin/Assignments', [
            'staffList' => $staffMembers,
            'complaintsList' => $summaries,
        ]);
    }

    public function analytics(): Response
    {
        $all = Report::with(['category'])->latest()->get();
        $resolved = $all->whereIn('status', ['resolved', 'closed']);
        $totalCount = $all->count();
        $resolvedCount = $resolved->count();
        $resolutionRate = $totalCount > 0 ? round(($resolvedCount / $totalCount) * 100) : 0;

        $categoriesBreakdown = Category::withCount('reports')
            ->orderByDesc('reports_count')
            ->get()
            ->map(fn (Category $c) => [
                'label' => $c->name,
                'value' => $c->reports_count,
            ])
            ->values()
            ->all();

        $monthlyTrend = [];
        for ($i = 11; $i >= 0; $i--) {
            $month = now()->subMonths($i);
            $monthLabel = $month->format('M');
            $submittedInMonth = $all->filter(fn (Report $r) => $r->created_at && $r->created_at->format('Y-m') === $month->format('Y-m'))->count();
            $resolvedInMonth = $resolved->filter(fn (Report $r) => $r->updated_at && $r->updated_at->format('Y-m') === $month->format('Y-m'))->count();

            $monthlyTrend[] = [
                'label' => $monthLabel,
                'submitted' => $submittedInMonth,
                'resolved' => $resolvedInMonth,
            ];
        }

        $byBarangay = $all->groupBy('barangay')
            ->map(fn ($group, $name) => [
                'label' => $name,
                'value' => $group->count(),
            ])
            ->sortByDesc('value')
            ->values()
            ->take(5)
            ->all();

        $byPriority = [
            ['label' => 'Low', 'value' => $all->where('priority', 'low')->count()],
            ['label' => 'Medium', 'value' => $all->where('priority', 'medium')->count()],
            ['label' => 'High', 'value' => $all->where('priority', 'high')->count()],
            ['label' => 'Urgent', 'value' => $all->where('priority', 'urgent')->count()],
        ];

        return Inertia::render('admin/Analytics', [
            'totals' => [
                'total' => $totalCount,
                'pending' => $all->where('status', 'pending')->count(),
                'assigned' => $all->where('status', 'assigned')->count(),
                'inProgress' => $all->where('status', 'in_progress')->count(),
                'resolved' => $resolvedCount,
                'resolutionRate' => $resolutionRate,
                'avgResolutionDays' => $this->averageResolutionDays($resolved),
            ],
            'analyticsData' => [
                'monthlyTrend' => $monthlyTrend,
                'byCategory' => $categoriesBreakdown,
                'byBarangay' => $byBarangay,
                'byPriority' => $byPriority,
            ],
        ]);
    }

    public function settings(): Response
    {
        return Inertia::render('admin/Settings', [
            'settingsData' => PlatformSettings::all(),
        ]);
    }

    public function updateSettings(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'platformName' => 'required|string|max:120',
            'supportEmail' => 'required|email|max:120',
            'maxPhotos' => 'required|integer|min:1|max:10',
            'autoAssignRadius' => 'required|numeric|min:0.5|max:50',
            'mapLatitude' => 'required|numeric|between:-90,90',
            'mapLongitude' => 'required|numeric|between:-180,180',
            'mapZoom' => 'required|integer|min:8|max:18',
        ]);

        $payload = [
            'platformName' => trim($validated['platformName']),
            'supportEmail' => trim($validated['supportEmail']),
            'maxPhotos' => (int) $validated['maxPhotos'],
            'autoAssignRadius' => round((float) $validated['autoAssignRadius'], 2),
            'mapLatitude' => round((float) $validated['mapLatitude'], 6),
            'mapLongitude' => round((float) $validated['mapLongitude'], 6),
            'mapZoom' => (int) $validated['mapZoom'],
        ];

        PlatformSettings::save($payload);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Platform settings saved.',
        ]);

        return back()->with('success', 'Platform settings saved.');
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function activeStaffMembers(): array
    {
        return array_values(
            User::query()
                ->where('status', 'active')
                ->where(function ($query) {
                    $query->where('role', 'staff')
                        ->orWhereHas('roles', fn ($q) => $q->where('name', 'staff'));
                })
                ->orderBy('name')
                ->get()
                ->map(fn (User $u) => GeoTransformer::toStaff($u))
                ->all(),
        );
    }

    /**
     * @param  Collection<int, Report>  $resolved
     */
    private function averageResolutionDays($resolved): float
    {
        $durations = $resolved
            ->filter(fn (Report $r) => $r->created_at !== null && ($r->resolved_at !== null || $r->updated_at !== null))
            ->map(function (Report $r) {
                $end = $r->resolved_at ?? $r->updated_at;

                return max(0, $r->created_at->diffInHours($end) / 24);
            });

        if ($durations->isEmpty()) {
            return 0;
        }

        return round((float) $durations->avg(), 1);
    }
}
