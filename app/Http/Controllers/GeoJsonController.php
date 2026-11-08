<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class GeoJsonController extends Controller
{
    protected static ?string $cachedGeoJson = null;

    /**
     * Return the prepared Loon, Bohol barangay GeoJSON dataset.
     */
    public function loonBarangays(): Response|JsonResponse
    {
        $filePath = storage_path('app/geojson/loon_bohol.geojson');

        if (! file_exists($filePath)) {
            return response()->json([
                'error' => 'Loon Bohol GeoJSON dataset not found.',
            ], 404);
        }

        if (static::$cachedGeoJson === null) {
            $contents = file_get_contents($filePath);
            if ($contents === false) {
                return response()->json([
                    'error' => 'Unable to read Loon Bohol GeoJSON dataset.',
                ], 500);
            }

            static::$cachedGeoJson = $contents;
        }

        return new Response(static::$cachedGeoJson, 200, [
            'Content-Type' => 'application/geo+json; charset=utf-8',
            'Cache-Control' => 'public, max-age=86400, stale-while-revalidate=604800',
        ]);
    }
}
