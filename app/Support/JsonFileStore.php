<?php

namespace App\Support;

/**
 * Tiny JSON key-value file store kept in the private `storage/app/private` directory.
 *
 * Writes use an exclusive lock so concurrent requests cannot corrupt the file.
 * Files previously stored directly in `storage/app` are still read as a fallback.
 */
class JsonFileStore
{
    /**
     * @return array<array-key, mixed>
     */
    public static function read(string $name): array
    {
        foreach ([self::path($name), storage_path('app/'.$name)] as $path) {
            if (! is_file($path)) {
                continue;
            }

            $decoded = json_decode((string) file_get_contents($path), true);

            return is_array($decoded) ? $decoded : [];
        }

        return [];
    }

    /**
     * @param  array<array-key, mixed>  $data
     */
    public static function write(string $name, array $data): void
    {
        $path = self::path($name);

        if (! is_dir(dirname($path))) {
            mkdir(dirname($path), 0775, true);
        }

        file_put_contents(
            $path,
            json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES),
            LOCK_EX,
        );
    }

    private static function path(string $name): string
    {
        return storage_path('app/private/'.basename($name));
    }
}
