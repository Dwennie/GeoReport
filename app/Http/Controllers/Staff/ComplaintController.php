<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\Report;
use App\Models\ReportComment;
use App\Models\ReportImage;
use App\Models\ReportUpdate;
use App\Support\GeoTransformer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ComplaintController extends Controller
{
    public function dashboard(Request $request): Response
    {
        $user = $request->user();

        $assigned = Report::where('assigned_to', $user->id)
            ->with(['category', 'user'])
            ->latest()
            ->get();

        $summaries = $assigned->map(fn (Report $r) => GeoTransformer::toSummary($r))->values()->all();

        return Inertia::render('staff/Dashboard', [
            'assignedComplaintsList' => $summaries,
            'staffStats' => [
                'total' => $assigned->count(),
                'newAssignments' => $assigned->where('status', 'assigned')->count(),
                'inProgress' => $assigned->where('status', 'in_progress')->count(),
                'resolved' => $assigned->whereIn('status', ['resolved', 'closed'])->count(),
                'urgent' => $assigned->where('priority', 'urgent')->count(),
            ],
        ]);
    }

    public function index(Request $request): Response
    {
        $user = $request->user();
        $assigned = Report::where('assigned_to', $user->id)
            ->with(['category', 'user'])
            ->latest()
            ->get();

        $summaries = $assigned->map(fn (Report $r) => GeoTransformer::toSummary($r))->values()->all();

        return Inertia::render('staff/complaints/Index', [
            'assignedComplaintsList' => $summaries,
        ]);
    }

    public function show(Request $request, int $id): Response
    {
        $report = Report::where('assigned_to', $request->user()->id)
            ->with(['category', 'user', 'assignedStaff', 'images', 'updates.user', 'comments.user'])
            ->findOrFail($id);

        return Inertia::render('staff/complaints/Show', [
            'complaintId' => $id,
            'complaintData' => GeoTransformer::toDetail($report),
        ]);
    }

    public function updateStatus(Request $request, int $id): RedirectResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:assigned,in_progress,resolved,closed',
            'remarks' => 'nullable|string|max:500',
            'photos' => 'nullable|array|max:5',
            'photos.*' => 'image|mimes:jpg,jpeg,png,webp,gif|max:10240',
        ]);

        $user = $request->user();
        $report = Report::where('assigned_to', $user->id)->findOrFail($id);
        $oldStatus = $report->status;
        $newStatus = $validated['status'];

        $report->status = $newStatus;
        if ($newStatus === 'resolved') {
            $report->resolved_at = now();
        }
        $report->save();

        $statusLabel = ucfirst(str_replace('_', ' ', $newStatus));

        ReportUpdate::create([
            'report_id' => $report->id,
            'user_id' => $user->id,
            'old_status' => $oldStatus,
            'new_status' => $newStatus,
            'remarks' => $validated['remarks'] ?? "Status updated by field staff to {$statusLabel}.",
        ]);

        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $photo) {
                $path = $photo->store('reports/resolution', 'public');
                ReportImage::create([
                    'report_id' => $report->id,
                    'image_path' => $path,
                    'original_filename' => $photo->getClientOriginalName(),
                    'kind' => 'resolution',
                    'uploaded_by' => $user->id,
                ]);
            }
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Report #{$report->reference_number} marked as {$statusLabel}.",
        ]);

        return back()->with('success', "Complaint status updated to {$statusLabel}.");
    }

    public function addNote(Request $request, int $id): RedirectResponse
    {
        $validated = $request->validate([
            'comment' => 'required|string|min:3|max:2000',
            'is_internal' => 'nullable|boolean',
        ]);

        $user = $request->user();
        $report = Report::where('assigned_to', $user->id)->findOrFail($id);

        ReportComment::create([
            'report_id' => $report->id,
            'user_id' => $user->id,
            'comment' => trim($validated['comment']),
            'is_internal' => $validated['is_internal'] ?? true,
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Case note saved.',
        ]);

        return back()->with('success', 'Case note recorded.');
    }

    public function map(Request $request): Response
    {
        $user = $request->user();
        $assigned = Report::where('assigned_to', $user->id)
            ->with('category')
            ->latest()
            ->get();

        $points = $assigned->map(fn (Report $r) => [
            'id' => $r->id,
            'reference' => $r->reference_number,
            'title' => $r->title,
            'label' => "{$r->reference_number} — {$r->title}",
            'latitude' => (float) $r->latitude,
            'longitude' => (float) $r->longitude,
            'status' => $r->status,
            'color' => $r->category->color ?? '#3B82F6',
            'barangay' => $r->barangay,
            'address' => $r->address,
        ])->values()->all();

        return Inertia::render('staff/Map', [
            'mapPointsList' => $points,
        ]);
    }

    public function history(Request $request): Response
    {
        $user = $request->user();
        $resolved = Report::where('assigned_to', $user->id)
            ->whereIn('status', ['resolved', 'closed'])
            ->with(['category', 'user'])
            ->latest('resolved_at')
            ->get();

        $summaries = $resolved->map(fn (Report $r) => GeoTransformer::toSummary($r))->values()->all();

        return Inertia::render('staff/History', [
            'resolvedComplaintsList' => $summaries,
        ]);
    }
}
