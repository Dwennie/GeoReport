<?php

namespace App\Http\Controllers\Citizen;

use App\Http\Controllers\Controller;
use App\Models\Barangay;
use App\Models\Category;
use App\Models\Report;
use App\Models\ReportComment;
use App\Models\ReportImage;
use App\Models\ReportUpdate;
use App\Support\GeoCatalog;
use App\Support\GeoTransformer;
use App\Support\JsonFileStore;
use App\Support\PlatformSettings;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ComplaintController extends Controller
{
    public function dashboard(Request $request): Response
    {
        $user = $request->user();
        $reports = Report::where('user_id', $user->id)
            ->with(['category', 'assignedStaff'])
            ->latest()
            ->get();

        $summaries = $reports->map(fn (Report $r) => GeoTransformer::toSummary($r))->values()->all();

        $communityPoints = Report::publicView()
            ->with('category')
            ->latest()
            ->get()
            ->map(fn (Report $r) => [
                'id' => $r->id,
                'label' => "{$r->reference_number} — {$r->title}",
                'latitude' => (float) $r->latitude,
                'longitude' => (float) $r->longitude,
                'status' => $r->status,
                'color' => $r->category->color ?? '#10B981',
                'barangay' => $r->barangay,
            ])
            ->values()
            ->all();

        return Inertia::render('citizen/Dashboard', [
            'initialComplaints' => $summaries,
            'communityMapPoints' => $communityPoints,
            'userStats' => [
                'total' => $reports->count(),
                'pending' => $reports->where('status', 'pending')->count(),
                'inProgress' => $reports->whereIn('status', ['assigned', 'in_progress'])->count(),
                'resolved' => $reports->whereIn('status', ['resolved', 'closed'])->count(),
            ],
        ]);
    }

    public function index(Request $request): Response
    {
        $user = $request->user();
        $reports = Report::where('user_id', $user->id)
            ->with(['category', 'assignedStaff'])
            ->latest()
            ->get();

        $summaries = $reports->map(fn (Report $r) => GeoTransformer::toSummary($r))->values()->all();

        return Inertia::render('citizen/complaints/Index', [
            'complaintsList' => $summaries,
        ]);
    }

    public function create(): Response
    {
        GeoCatalog::ensureSeeded();

        $categories = Category::where('is_active', true)
            ->withCount('reports')
            ->orderBy('name')
            ->get()
            ->map(fn (Category $c) => GeoTransformer::toCategory($c))
            ->values()
            ->all();

        $geoMeta = GeoCatalog::officialBarangaysMeta();
        $barangayRecords = Barangay::orderBy('name')->get();
        $barangaysList = $barangayRecords
            ->map(fn (Barangay $b) => GeoTransformer::toBarangay($b, [], $geoMeta))
            ->values()
            ->all();

        return Inertia::render('citizen/complaints/Create', [
            'categoriesList' => $categories,
            'barangaysList' => $barangaysList,
            'barangayOptions' => $barangayRecords->pluck('name')->values()->all(),
            'maxPhotos' => PlatformSettings::maxPhotos(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        GeoCatalog::ensureSeeded();

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'barangay' => 'required|string|max:100|exists:barangays,name',
            'address' => 'nullable|string|max:255',
            'description' => 'required|string|min:15|max:5000',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'photos' => 'nullable|array|max:'.PlatformSettings::maxPhotos(),
            'photos.*' => 'image|mimes:jpg,jpeg,png,webp,gif|max:10240',
        ]);

        $user = $request->user();
        $geoMeta = GeoCatalog::officialBarangaysMeta();
        $fallbackLat = $geoMeta[$validated['barangay']]['latitude'] ?? 9.7997000;
        $fallbackLng = $geoMeta[$validated['barangay']]['longitude'] ?? 123.7925000;

        $address = filled($validated['address'] ?? null)
            ? trim((string) $validated['address'])
            : "{$validated['barangay']}, Loon, Bohol";

        $report = Report::create([
            'user_id' => $user->id,
            'category_id' => $validated['category_id'],
            'title' => trim($validated['title']),
            'barangay' => $validated['barangay'],
            'address' => $address,
            'description' => trim($validated['description']),
            'latitude' => $validated['latitude'] ?? $fallbackLat,
            'longitude' => $validated['longitude'] ?? $fallbackLng,
            'priority' => 'medium',
            'status' => 'pending',
            'is_public' => true,
            'incident_date' => now(),
        ]);

        ReportUpdate::create([
            'report_id' => $report->id,
            'user_id' => $user->id,
            'old_status' => null,
            'new_status' => 'pending',
            'remarks' => 'Complaint submitted via Citizen Portal.',
        ]);

        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $photo) {
                $path = $photo->store('reports/evidence', 'public');
                ReportImage::create([
                    'report_id' => $report->id,
                    'image_path' => $path,
                    'original_filename' => $photo->getClientOriginalName(),
                    'kind' => 'evidence',
                    'uploaded_by' => $user->id,
                ]);
            }
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Complaint submitted! Reference: #{$report->reference_number}",
        ]);

        return redirect()->route('citizen.complaints.show', $report->id)
            ->with('success', "Complaint submitted successfully! Reference: #{$report->reference_number}");
    }

    public function show(Request $request, int $id): Response
    {
        $user = $request->user();

        // Citizens may open their own reports, or community reports that are publicly listed.
        $report = Report::where(function ($query) use ($user) {
            $query->where('user_id', $user->id)
                ->orWhere(fn ($public) => $public->publicView());
        })
            ->with(['category', 'user', 'assignedStaff', 'images', 'updates.user', 'comments.user'])
            ->findOrFail($id);

        return Inertia::render('citizen/complaints/Show', [
            'complaintId' => $id,
            // Internal staff notes never leave the server for citizen viewers.
            'complaintData' => GeoTransformer::toDetail($report, includeInternalNotes: false),
        ]);
    }

    public function map(): Response
    {
        $reports = Report::publicView()
            ->with('category')
            ->latest()
            ->get();

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
        ])->values()->all();

        return Inertia::render('citizen/Map', [
            'mapPointsList' => $points,
        ]);
    }

    public function notifications(Request $request): Response
    {
        $user = $request->user();
        $readIds = $this->readNotificationIds((int) $user->id);

        $updates = ReportUpdate::query()
            ->whereHas('report', fn ($q) => $q->where('user_id', $user->id))
            ->where(function ($q) use ($user) {
                $q->where('user_id', '!=', $user->id)
                    ->orWhereNotNull('old_status');
            })
            ->with(['report', 'user'])
            ->latest()
            ->limit(40)
            ->get()
            ->map(function (ReportUpdate $update) use ($readIds) {
                $key = "update-{$update->id}";
                $statusLabel = ucfirst(str_replace('_', ' ', (string) $update->new_status));
                $reference = $update->report?->reference_number;

                return [
                    'id' => $key,
                    'title' => $reference
                        ? "Report {$reference} marked {$statusLabel}"
                        : "Report status updated to {$statusLabel}",
                    'body' => $update->remarks ?: "Your report status was updated to {$statusLabel}.",
                    'complaintReference' => $reference,
                    'complaintId' => $update->report_id,
                    'read' => in_array($key, $readIds, true),
                    'createdAt' => $update->created_at?->toISOString() ?? now()->toISOString(),
                ];
            });

        $publicNotes = ReportComment::query()
            ->where('is_internal', false)
            ->where('user_id', '!=', $user->id)
            ->whereHas('report', fn ($q) => $q->where('user_id', $user->id))
            ->with(['report', 'user'])
            ->latest()
            ->limit(20)
            ->get()
            ->map(function (ReportComment $comment) use ($readIds) {
                $key = "note-{$comment->id}";
                $reference = $comment->report?->reference_number;
                $author = $comment->user !== null ? $comment->user->name : 'Municipal Staff';

                return [
                    'id' => $key,
                    'title' => $reference
                        ? "New public note on {$reference}"
                        : 'New public note from municipal staff',
                    'body' => "{$author}: {$comment->comment}",
                    'complaintReference' => $reference,
                    'complaintId' => $comment->report_id,
                    'read' => in_array($key, $readIds, true),
                    'createdAt' => $comment->created_at?->toISOString() ?? now()->toISOString(),
                ];
            });

        $items = $updates
            ->concat($publicNotes)
            ->sortByDesc('createdAt')
            ->values()
            ->take(40)
            ->all();

        return Inertia::render('citizen/Notifications', [
            'notificationsList' => $items,
        ]);
    }

    public function markNotificationsRead(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1|max:100',
            'ids.*' => ['string', 'max:50', 'regex:/^(update|note)-\d+$/'],
        ]);

        $userKey = 'u_'.(string) $request->user()->id;
        $store = $this->loadNotificationReadStore();
        $existing = array_key_exists($userKey, $store) ? $store[$userKey] : [];
        $merged = array_values(array_unique(array_merge($existing, $validated['ids'])));
        // Keep only the most recent read markers so the store cannot grow without bound.
        $store[$userKey] = array_slice($merged, -500);

        JsonFileStore::write('notifications_read.json', $store);

        return back();
    }

    /**
     * @return list<string>
     */
    private function readNotificationIds(int $userId): array
    {
        $store = $this->loadNotificationReadStore();
        $userKey = 'u_'.(string) $userId;
        $legacyKey = (string) $userId;

        if (array_key_exists($userKey, $store)) {
            return $store[$userKey];
        }

        if (array_key_exists($legacyKey, $store)) {
            return $store[$legacyKey];
        }

        return [];
    }

    /**
     * @return array<string, list<string>>
     */
    private function loadNotificationReadStore(): array
    {
        $decoded = JsonFileStore::read('notifications_read.json');

        $normalized = [];
        foreach ($decoded as $key => $ids) {
            if (! is_array($ids)) {
                continue;
            }

            $cleanIds = [];
            foreach ($ids as $id) {
                if (is_string($id)) {
                    $cleanIds[] = $id;
                }
            }

            $normalized[(string) $key] = $cleanIds;
        }

        return $normalized;
    }
}
