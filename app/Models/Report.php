<?php

namespace App\Models;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

/**
 * @property CarbonInterface|null $incident_date
 * @property CarbonInterface|null $resolved_at
 */
class Report extends Model
{
    protected $fillable = [
        'reference_number',
        'user_id',
        'category_id',
        'assigned_to',
        'title',
        'description',
        'latitude',
        'longitude',
        'address',
        'barangay',
        'priority',
        'status',
        'is_public',
        'incident_date',
        'resolved_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'latitude' => 'float',
            'longitude' => 'float',
            'is_public' => 'boolean',
            'incident_date' => 'datetime',
            'resolved_at' => 'datetime',
        ];
    }

    public static function booted(): void
    {
        static::creating(function (Report $report) {
            if (empty($report->reference_number)) {
                $year = date('Y');
                $random = strtoupper(Str::random(5));
                $report->reference_number = "LOON-{$year}-{$random}";
            }
        });
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * @return BelongsTo<Category, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function assignedStaff(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * @return HasMany<ReportImage, $this>
     */
    public function images(): HasMany
    {
        return $this->hasMany(ReportImage::class);
    }

    /**
     * @return HasMany<ReportImage, $this>
     */
    public function evidenceImages(): HasMany
    {
        return $this->hasMany(ReportImage::class)->where('kind', 'evidence');
    }

    /**
     * @return HasMany<ReportImage, $this>
     */
    public function resolutionImages(): HasMany
    {
        return $this->hasMany(ReportImage::class)->where('kind', 'resolution');
    }

    /**
     * @return HasMany<ReportUpdate, $this>
     */
    public function updates(): HasMany
    {
        return $this->hasMany(ReportUpdate::class)->latest();
    }

    /**
     * @return HasMany<ReportComment, $this>
     */
    public function comments(): HasMany
    {
        return $this->hasMany(ReportComment::class)->oldest();
    }

    /**
     * @return HasMany<ReportComment, $this>
     */
    public function publicComments(): HasMany
    {
        return $this->hasMany(ReportComment::class)->where('is_internal', false)->oldest();
    }

    /**
     * @param  Builder<Report>  $query
     * @return Builder<Report>
     */
    public function scopePublicView(Builder $query): Builder
    {
        return $query->where('is_public', true)
            ->whereNotIn('status', ['rejected']);
    }

    /**
     * @param  Builder<Report>  $query
     * @return Builder<Report>
     */
    public function scopePendingReview(Builder $query): Builder
    {
        return $query->where('status', 'pending');
    }

    /**
     * @param  Builder<Report>  $query
     * @return Builder<Report>
     */
    public function scopeInField(Builder $query): Builder
    {
        return $query->whereIn('status', ['assigned', 'in_progress']);
    }

    /**
     * @param  Builder<Report>  $query
     * @return Builder<Report>
     */
    public function scopeResolved(Builder $query): Builder
    {
        return $query->whereIn('status', ['resolved', 'closed']);
    }
}
