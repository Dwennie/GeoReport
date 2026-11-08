<?php

namespace App\Support;

use App\Models\Barangay;
use App\Models\Category;
use App\Models\Report;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class GeoCatalog
{
    /**
     * Cached metadata keyed by official barangay name.
     *
     * @var array<string, array{name: string, district: string, psgcCode: string|null, areaSqKm: float|null, latitude: float, longitude: float}>|null
     */
    protected static ?array $cachedBarangayMeta = null;

    /**
     * Avoid running ensureSeeded checks more than once per PHP-FPM request lifecycle.
     */
    protected static bool $checkedThisRequest = false;

    /**
     * Geographic sector assignment for all 67 official PSGC barangays of Loon, Bohol.
     *
     * @return array<string, string>
     */
    public static function barangayDistricts(): array
    {
        return [
            // Poblacion (Town Center)
            'Moto Sur (Pob.)' => 'Poblacion',
            'Moto Norte (Pob.)' => 'Poblacion',
            'Cogon Norte (Pob.)' => 'Poblacion',
            'Cogon Sur' => 'Poblacion',
            'Napo (Pob.)' => 'Poblacion',

            // North Coastal & Cruise Port Sector
            'Basac' => 'North Coastal',
            'Biasong' => 'North Coastal',
            'Canhangdon Occidental' => 'North Coastal',
            'Canhangdon Oriental' => 'North Coastal',
            'Cantumocad' => 'North Coastal',
            'Catagbacan Handig' => 'North Coastal',
            'Catagbacan Norte' => 'North Coastal',
            'Catagbacan Sur' => 'North Coastal',
            'Pondol' => 'North Coastal',
            'Ubayon' => 'North Coastal',

            // South Coastal Highway Sector
            'Basdacu' => 'South Coastal',
            'Cuasi' => 'South Coastal',
            'Lintuan' => 'South Coastal',
            'Pig-ot' => 'South Coastal',
            'Song-on' => 'South Coastal',
            'Tangnan' => 'South Coastal',
            'Taytay' => 'South Coastal',
            'Tontonan' => 'South Coastal',

            // Cabilao Island Sector
            'Cabacongan' => 'Cabilao Island',
            'Cambaquiz' => 'Cabilao Island',
            'Looc' => 'Cabilao Island',
            'Pantudlan' => 'Cabilao Island',
            'Talisay' => 'Cabilao Island',

            // Sandingan Island Sector
            'Basdio' => 'Sandingan Island',
            'Calayugan Norte' => 'Sandingan Island',
            'Calayugan Sur' => 'Sandingan Island',
            'Canigaan' => 'Sandingan Island',
            'Mocpoc Norte' => 'Sandingan Island',
            'Mocpoc Sur' => 'Sandingan Island',
            'Sondol' => 'Sandingan Island',
            'Ubojan' => 'Sandingan Island',

            // North Uplands & Interior Sector
            'Bagacay Katipunan' => 'North Uplands',
            'Bagacay Kawayan' => 'North Uplands',
            'Bagacay Saong' => 'North Uplands',
            'Bahi' => 'North Uplands',
            'Campatud' => 'North Uplands',
            'Candaigan' => 'North Uplands',
            'Canmaag' => 'North Uplands',
            'Cansuagwit' => 'North Uplands',
            'Cantam-is Bago' => 'North Uplands',
            'Cantam-is Baslay' => 'North Uplands',
            'Cantaongon' => 'North Uplands',
            'Genomoan' => 'North Uplands',
            'Nueva Vida' => 'North Uplands',
            'Panangquilon' => 'North Uplands',
            'Ticugan' => 'North Uplands',

            // South Uplands & Interior Sector
            'Agsoso' => 'South Uplands',
            'Badbad Occidental' => 'South Uplands',
            'Badbad Oriental' => 'South Uplands',
            'Bongco' => 'South Uplands',
            'Bugho' => 'South Uplands',
            'Cabadug' => 'South Uplands',
            'Cabug' => 'South Uplands',
            'Canmanoc' => 'South Uplands',
            'Cansubayon' => 'South Uplands',
            'Nagtuang' => 'South Uplands',
            'Quinobcoban' => 'South Uplands',
            'Tan-awan' => 'South Uplands',
            'Tiwi' => 'South Uplands',
            'Tubodacu' => 'South Uplands',
            'Tubodio' => 'South Uplands',
            'Tubuan' => 'South Uplands',
        ];
    }

    /**
     * Official geographic sectors in Loon, Bohol.
     *
     * @return list<string>
     */
    public static function sectors(): array
    {
        return [
            'Poblacion',
            'North Coastal',
            'South Coastal',
            'Cabilao Island',
            'Sandingan Island',
            'North Uplands',
            'South Uplands',
        ];
    }

    /**
     * Return all 67 official Loon barangays enriched with GeoJSON PSGC code, area, and centroid coordinates.
     *
     * @return array<string, array{name: string, district: string, psgcCode: string|null, areaSqKm: float|null, latitude: float, longitude: float}>
     */
    public static function officialBarangaysMeta(): array
    {
        if (self::$cachedBarangayMeta !== null) {
            return self::$cachedBarangayMeta;
        }

        $districts = self::barangayDistricts();
        $meta = [];

        foreach ($districts as $name => $district) {
            $meta[$name] = [
                'name' => $name,
                'district' => $district,
                'psgcCode' => null,
                'areaSqKm' => null,
                'latitude' => 9.7997,
                'longitude' => 123.7925,
            ];
        }

        $path = storage_path('app/geojson/loon_bohol.geojson');
        if (! is_file($path) && Storage::disk('local')->exists('geojson/loon_bohol.geojson')) {
            $path = Storage::disk('local')->path('geojson/loon_bohol.geojson');
        }

        if (is_file($path)) {
            $decoded = json_decode((string) file_get_contents($path), true);
            if (is_array($decoded) && isset($decoded['features']) && is_array($decoded['features'])) {
                foreach ($decoded['features'] as $feature) {
                    $props = $feature['properties'] ?? [];
                    $name = $props['ADM4_EN'] ?? null;
                    if (! is_string($name) || $name === '') {
                        continue;
                    }

                    [$lat, $lon] = self::computeCentroid($feature['geometry']['coordinates'] ?? []);

                    $meta[$name] = [
                        'name' => $name,
                        'district' => $districts[$name] ?? 'Mainland',
                        'psgcCode' => $props['ADM4_PCODE'] ?? null,
                        'areaSqKm' => isset($props['AREA_SQKM']) ? round((float) $props['AREA_SQKM'], 2) : null,
                        'latitude' => $lat,
                        'longitude' => $lon,
                    ];
                }
            }
        }

        ksort($meta);
        self::$cachedBarangayMeta = $meta;

        return self::$cachedBarangayMeta;
    }

    /**
     * Standard municipal complaint categories for LGU Loon, Bohol.
     *
     * @return list<array{name: string, slug: string, description: string, icon: string, color: string, is_active: bool}>
     */
    public static function defaultCategories(): array
    {
        return [
            [
                'name' => 'Roads & Infrastructure',
                'slug' => 'roads-infrastructure',
                'description' => 'Potholes, damaged pavements, broken bridges, guardrails, and barangay road hazards.',
                'icon' => 'Construction',
                'color' => '#EF4444',
                'is_active' => true,
            ],
            [
                'name' => 'Street Lighting & Power',
                'slug' => 'street-lighting-power',
                'description' => 'Non-functioning solar or electric streetlamps, dark roads, and low-hanging utility lines.',
                'icon' => 'Lightbulb',
                'color' => '#F59E0B',
                'is_active' => true,
            ],
            [
                'name' => 'Solid Waste & Sanitation',
                'slug' => 'solid-waste-sanitation',
                'description' => 'Uncollected garbage, illegal dumpsites, overflowing bins, and market or coastal litter.',
                'icon' => 'Trash2',
                'color' => '#10B981',
                'is_active' => true,
            ],
            [
                'name' => 'Drainage & Flood Control',
                'slug' => 'drainage-flood-control',
                'description' => 'Clogged storm canals, damaged culverts, missing manhole covers, and street flooding.',
                'icon' => 'Waves',
                'color' => '#0284C7',
                'is_active' => true,
            ],
            [
                'name' => 'Water Supply & Utilities',
                'slug' => 'water-supply-utilities',
                'description' => 'Leaking mainlines, damaged barangay waterworks pipes, and prolonged water interruptions.',
                'icon' => 'Droplets',
                'color' => '#06B6D4',
                'is_active' => true,
            ],
            [
                'name' => 'Public Safety & Hazards',
                'slug' => 'public-safety-hazards',
                'description' => 'Fallen trees, landslide-prone slopes, unsafe structures, and road obstructions.',
                'icon' => 'AlertTriangle',
                'color' => '#DC2626',
                'is_active' => true,
            ],
            [
                'name' => 'Coastal & Marine Protection',
                'slug' => 'coastal-marine-protection',
                'description' => 'Damaged seawalls, port hazards, marine sanctuary violations, and coastal erosion.',
                'icon' => 'Anchor',
                'color' => '#2563EB',
                'is_active' => true,
            ],
            [
                'name' => 'Public Facilities & Parks',
                'slug' => 'public-facilities-parks',
                'description' => 'Maintenance concerns in plazas, barangay halls, covered courts, markets, and health centers.',
                'icon' => 'Building2',
                'color' => '#8B5CF6',
                'is_active' => true,
            ],
        ];
    }

    /**
     * Automatically ensure baseline categories and Loon's 67 official barangays exist when tables are empty
     * or still hold legacy pre-GeoJSON placeholder barangays.
     */
    public static function ensureSeeded(): void
    {
        if (self::$checkedThisRequest) {
            return;
        }
        self::$checkedThisRequest = true;

        try {
            if (Category::count() === 0) {
                self::syncDefaultCategories();
            }

            $barangayCount = Barangay::count();
            if ($barangayCount === 0) {
                self::syncOfficialBarangays(false);
            } elseif (Barangay::whereIn('name', ['Agsao', 'Cabackalan', 'Suello'])->exists()) {
                self::syncOfficialBarangays(true);
            }
        } catch (\Throwable) {
            // Silently skip if database connection or tables are not yet ready.
        }
    }

    /**
     * Sync all 67 official PSGC barangays of Loon, Bohol from the GeoJSON dataset.
     */
    public static function syncOfficialBarangays(bool $pruneUnusedNonOfficial = false): int
    {
        $official = self::officialBarangaysMeta();
        $officialNames = array_keys($official);

        foreach ($official as $item) {
            Barangay::updateOrCreate(
                ['name' => $item['name']],
                ['district' => $item['district']],
            );
        }

        if ($pruneUnusedNonOfficial) {
            $usedInReports = Report::distinct()->pluck('barangay')->filter()->all();
            $usedInUsers = User::whereNotNull('barangay')->distinct()->pluck('barangay')->filter()->all();
            $protectedNames = array_unique(array_merge($officialNames, $usedInReports, $usedInUsers));

            Barangay::whereNotIn('name', $protectedNames)->delete();
        }

        return count($official);
    }

    /**
     * Ensure all standard municipal categories exist without overwriting user edits.
     */
    public static function syncDefaultCategories(): int
    {
        $added = 0;

        foreach (self::defaultCategories() as $cat) {
            $existing = Category::where('slug', $cat['slug'])
                ->orWhere('name', $cat['name'])
                ->first();

            if (! $existing) {
                Category::create($cat);
                $added++;
            }
        }

        return $added;
    }

    /**
     * Generate a unique slug for a category name.
     */
    public static function uniqueCategorySlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name) ?: 'category';
        $slug = $base;
        $counter = 2;

        while (
            Category::where('slug', $slug)
                ->when($ignoreId !== null, fn ($q) => $q->where('id', '!=', $ignoreId))
                ->exists()
        ) {
            $slug = "{$base}-{$counter}";
            $counter++;
        }

        return $slug;
    }

    /**
     * Compute approximate [latitude, longitude] centroid of a GeoJSON Polygon/MultiPolygon coordinate array.
     *
     * @param  array<int|string, mixed>  $coordinates
     * @return array{0: float, 1: float}
     */
    protected static function computeCentroid(array $coordinates): array
    {
        $lons = [];
        $lats = [];
        $index = 0;

        array_walk_recursive($coordinates, function ($value) use (&$lons, &$lats, &$index) {
            if (is_numeric($value)) {
                if ($index % 2 === 0) {
                    $lons[] = (float) $value;
                } else {
                    $lats[] = (float) $value;
                }
                $index++;
            }
        });

        if (empty($lats) || empty($lons)) {
            return [9.7997, 123.7925];
        }

        return [
            round(array_sum($lats) / count($lats), 6),
            round(array_sum($lons) / count($lons), 6),
        ];
    }
}
