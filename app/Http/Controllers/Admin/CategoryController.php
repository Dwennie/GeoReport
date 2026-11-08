<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Support\GeoCatalog;
use App\Support\GeoTransformer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(): Response
    {
        GeoCatalog::ensureSeeded();

        $categories = Category::withCount('reports')
            ->orderBy('name')
            ->get()
            ->map(fn (Category $c) => GeoTransformer::toCategory($c))
            ->values()
            ->all();

        return Inertia::render('admin/Categories', [
            'categoriesList' => $categories,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:120|unique:categories,name',
            'description' => 'nullable|string|max:500',
            'color' => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'is_active' => 'boolean',
        ]);

        $category = Category::create([
            'name' => trim($validated['name']),
            'slug' => GeoCatalog::uniqueCategorySlug($validated['name']),
            'description' => trim((string) ($validated['description'] ?? '')),
            'icon' => 'Tags',
            'color' => strtoupper($validated['color']),
            'is_active' => $validated['is_active'] ?? true,
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Category \"{$category->name}\" created.",
        ]);

        return back();
    }

    public function update(Request $request, Category $category): RedirectResponse
    {
        $validated = $request->validate([
            'name' => "required|string|max:120|unique:categories,name,{$category->id}",
            'description' => 'nullable|string|max:500',
            'color' => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'is_active' => 'boolean',
        ]);

        $newName = trim($validated['name']);
        if ($category->name !== $newName) {
            $category->slug = GeoCatalog::uniqueCategorySlug($newName, $category->id);
        }

        $category->name = $newName;
        $category->description = trim((string) ($validated['description'] ?? ''));
        $category->color = strtoupper($validated['color']);
        if (array_key_exists('is_active', $validated)) {
            $category->is_active = (bool) $validated['is_active'];
        }
        $category->save();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Category \"{$category->name}\" updated.",
        ]);

        return back();
    }

    public function toggle(Category $category): RedirectResponse
    {
        $category->is_active = ! $category->is_active;
        $category->save();

        $state = $category->is_active ? 'activated' : 'deactivated';
        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Category \"{$category->name}\" {$state}.",
        ]);

        return back();
    }

    public function destroy(Category $category): RedirectResponse
    {
        $reportCount = $category->reports()->count();
        if ($reportCount > 0) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => "Cannot delete \"{$category->name}\" while {$reportCount} report(s) use it. Deactivate it instead.",
            ]);

            return back();
        }

        $name = $category->name;
        $category->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Category \"{$name}\" deleted.",
        ]);

        return back();
    }

    public function seedDefaults(): RedirectResponse
    {
        $added = GeoCatalog::syncDefaultCategories();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $added > 0
                ? "Restored {$added} default municipal category(ies)."
                : 'All standard municipal categories are already configured.',
        ]);

        return back();
    }
}
