<?php

namespace App\Support;

use App\Models\Barangay;
use App\Models\Category;
use App\Models\Report;
use App\Models\ReportComment;
use App\Models\ReportImage;
use App\Models\ReportUpdate;
use App\Models\User;

class GeoTransformer
{
    /**
     * @return array<string, mixed>
     */
    public static function toSummary(Report $report): array
    {
        $createdIso = $report->created_at?->toISOString() ?? now()->toISOString();

        return [
            'id' => $report->id,
            'reference' => $report->reference_number,
            'title' => $report->title,
            'categoryId' => $report->category_id,
            'category' => $report->relationLoaded('category') && $report->category ? [
                'id' => $report->category->id,
                'name' => $report->category->name,
                'color' => $report->category->color,
                'slug' => $report->category->slug,
            ] : null,
            'status' => $report->status,
            'priority' => $report->priority,
            'barangay' => $report->barangay,
            'address' => $report->address,
            'latitude' => (float) $report->latitude,
            'longitude' => (float) $report->longitude,
            'reporterName' => $report->relationLoaded('user') && $report->user ? $report->user->name : 'Citizen',
            'assignedStaffName' => $report->relationLoaded('assignedStaff') && $report->assignedStaff ? $report->assignedStaff->name : null,
            'createdAt' => $createdIso,
            'submittedAt' => $createdIso,
            'updatedAt' => $report->updated_at?->toISOString() ?? now()->toISOString(),
            'assignedTo' => $report->assignedStaff ? [
                'id' => $report->assignedStaff->id,
                'name' => $report->assignedStaff->name,
                'department' => 'Loon Municipal Engineering Office',
            ] : null,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function toDetail(Report $report, bool $includeInternalNotes = true): array
    {
        $summary = self::toSummary($report);

        $evidence = $report->images
            ->where('kind', 'evidence')
            ->map(fn (ReportImage $img) => [
                'id' => $img->id,
                'kind' => 'evidence',
                'name' => $img->original_filename ?? 'Evidence Photo',
                'url' => str_starts_with($img->image_path, 'http') ? $img->image_path : asset('storage/'.$img->image_path),
            ])->values()->all();

        $resolutionEvidence = $report->images
            ->where('kind', 'resolution')
            ->map(fn (ReportImage $img) => [
                'id' => $img->id,
                'kind' => 'resolution',
                'name' => $img->original_filename ?? 'Resolution Proof',
                'url' => str_starts_with($img->image_path, 'http') ? $img->image_path : asset('storage/'.$img->image_path),
            ])->values()->all();

        $comments = $includeInternalNotes
            ? $report->comments
            : $report->comments->reject(fn (ReportComment $c) => (bool) $c->is_internal);

        $notes = $comments->map(fn (ReportComment $c) => [
            'id' => $c->id,
            'authorName' => $c->user->name ?? 'System Officer',
            'authorRole' => $c->user->role ?? 'staff',
            'body' => $c->comment,
            'isInternal' => $c->is_internal,
            'createdAt' => $c->created_at?->toISOString() ?? now()->toISOString(),
        ])->values()->all();

        $statusLabels = [
            'pending' => 'Pending Review',
            'approved' => 'Approved for Action',
            'assigned' => 'Assigned to Field Staff',
            'in_progress' => 'Under Investigation',
            'resolved' => 'Resolved',
            'rejected' => 'Rejected',
            'closed' => 'Closed',
        ];

        $timeline = $report->updates->map(fn (ReportUpdate $u) => [
            'id' => $u->id,
            'status' => $u->new_status,
            'label' => $statusLabels[$u->new_status] ?? ucfirst($u->new_status),
            'note' => $u->remarks,
            'actorName' => $u->user->name ?? 'System',
            'createdAt' => $u->created_at?->toISOString() ?? now()->toISOString(),
        ])->values()->all();

        return array_merge($summary, [
            'description' => $report->description,
            'address' => $report->address,
            'latitude' => (float) $report->latitude,
            'longitude' => (float) $report->longitude,
            'reporterId' => $report->user_id,
            'reporterName' => $report->user->name ?? 'Citizen',
            'isPublic' => (bool) $report->is_public,
            'resolvedAt' => $report->resolved_at?->toISOString(),
            'evidence' => $evidence,
            'resolutionEvidence' => $resolutionEvidence,
            'notes' => $notes,
            'timeline' => $timeline,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public static function toCategory(Category $category): array
    {
        return [
            'id' => $category->id,
            'name' => $category->name,
            'slug' => $category->slug,
            'description' => $category->description ?? '',
            'icon' => $category->icon ?? 'Tags',
            'color' => $category->color,
            'isActive' => (bool) $category->is_active,
            'complaintCount' => isset($category->reports_count)
                ? (int) $category->reports_count
                : $category->reports()->count(),
        ];
    }

    /**
     * @param  array<string, int>  $reportCounts
     * @param  array<string, array{name: string, district: string, psgcCode: string|null, areaSqKm: float|null, latitude: float, longitude: float}>  $geoMeta
     * @return array<string, mixed>
     */
    public static function toBarangay(Barangay $barangay, array $reportCounts = [], array $geoMeta = []): array
    {
        $meta = $geoMeta[$barangay->name] ?? null;

        return [
            'id' => $barangay->id,
            'name' => $barangay->name,
            'district' => $barangay->district,
            'psgcCode' => $meta['psgcCode'] ?? null,
            'areaSqKm' => $meta['areaSqKm'] ?? null,
            'latitude' => $meta['latitude'] ?? 9.7997,
            'longitude' => $meta['longitude'] ?? 123.7925,
            'complaintCount' => $reportCounts[$barangay->name] ?? 0,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function toStaff(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'department' => 'Loon Municipal Engineering Office',
            'activeAssignments' => $user->assignedReports()->whereIn('status', ['assigned', 'in_progress'])->count(),
            'resolvedCount' => $user->assignedReports()->whereIn('status', ['resolved', 'closed'])->count(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function toUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'barangay' => $user->barangay ?? 'Moto Sur (Pob.)',
            'status' => $user->status ?? 'active',
            'joinedAt' => $user->created_at?->toISOString() ?? now()->toISOString(),
        ];
    }
}
