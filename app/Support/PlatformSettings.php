<?php

namespace App\Support;

/**
 * Administrator-managed platform settings persisted as JSON.
 */
class PlatformSettings
{
    private const FILE = 'settings.json';

    /**
     * @return array<string, int|float|string>
     */
    public static function defaults(): array
    {
        return [
            'platformName' => 'GeoReport — Loon, Bohol',
            'supportEmail' => 'support@loon.gov.ph',
            'maxPhotos' => 5,
            'autoAssignRadius' => 2.5,
            'mapLatitude' => 9.7997,
            'mapLongitude' => 123.7925,
            'mapZoom' => 13,
        ];
    }

    /**
     * @return array<string, int|float|string>
     */
    public static function all(): array
    {
        $defaults = self::defaults();

        /** @var array<string, int|float|string> $stored */
        $stored = array_intersect_key(JsonFileStore::read(self::FILE), $defaults);

        return array_merge($defaults, $stored);
    }

    /**
     * @param  array<string, int|float|string>  $settings
     */
    public static function save(array $settings): void
    {
        JsonFileStore::write(self::FILE, array_intersect_key($settings, self::defaults()));
    }

    public static function maxPhotos(): int
    {
        return max(1, min(10, (int) self::all()['maxPhotos']));
    }
}
