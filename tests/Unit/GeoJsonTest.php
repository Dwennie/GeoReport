<?php

use App\Http\Controllers\GeoJsonController;
use Tests\TestCase;

uses(TestCase::class);

test('loon bohol geojson file exists and is valid geojson with 67 barangays', function () {
    $filePath = storage_path('app/geojson/loon_bohol.geojson');
    expect(file_exists($filePath))->toBeTrue();

    $content = file_get_contents($filePath);
    $data = json_decode($content, true);

    expect($data)->toBeArray();
    expect($data['type'])->toBe('FeatureCollection');
    expect($data['features'])->toHaveCount(67);

    // Verify all 67 barangays have valid geometries and belong to Loon (PH0701230)
    foreach ($data['features'] as $feature) {
        expect($feature['type'])->toBe('Feature');
        expect(in_array($feature['geometry']['type'], ['Polygon', 'MultiPolygon']))->toBeTrue();
        expect($feature['properties']['ADM3_PCODE'])->toBe('PH0701230');
        expect($feature['properties']['ADM2_EN'])->toBe('Bohol');
        expect($feature['properties']['ADM4_PCODE'])->toStartWith('PH0701230');
    }
});

test('geojson controller returns 200 with proper content type and headers', function () {
    $controller = new GeoJsonController;
    $response = $controller->loonBarangays();

    expect($response->getStatusCode())->toBe(200);
    expect($response->headers->get('Content-Type'))->toContain('application/geo+json');

    $data = json_decode($response->getContent(), true);
    expect($data['type'])->toBe('FeatureCollection');
    expect($data['features'])->toHaveCount(67);
});
