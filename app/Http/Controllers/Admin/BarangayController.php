<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Barangay;
use App\Models\Report;
use App\Models\User;
use App\Support\GeoCatalog;
use App\Support\GeoTransformer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BarangayController extends Controller
{
    public function index(): Response
    {
        GeoCatalog::ensureSeeded();

        $reportCounts = Report::query()
            ->selectRaw('barangay, count(*) as aggregate')
            ->groupBy('barangay')
            ->pluck('aggregate', 'barangay')
            ->map(fn ($v) => (int) $v)
            ->all();

        $geoMeta = GeoCatalog::officialBarangaysMeta();

        $barangays = Barangay::orderBy('name')
            ->get()
            ->map(fn (Barangay $b) => GeoTransformer::toBarangay($b, $reportCounts, $geoMeta))
            ->values()
            ->all();

        return Inertia::render('admin/Barangays', [
            'barangaysList' => $barangays,
            'sectorsList' => GeoCatalog::sectors(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:120|unique:barangays,name',
            'district' => 'required|string|max:100',
        ]);

        $barangay = Barangay::create([
            'name' => trim($validated['name']),
            'district' => trim($validated['district']),
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Barangay \"{$barangay->name}\" added to the registry.",
        ]);

        return back();
    }

    public function update(Request $request, Barangay $barangay): RedirectResponse
    {
        $validated = $request->validate([
            'name' => "required|string|max:120|unique:barangays,name,{$barangay->id}",
            'district' => 'required|string|max:100',
        ]);

        $oldName = $barangay->name;
        $newName = trim($validated['name']);

        $barangay->update([
            'name' => $newName,
            'district' => trim($validated['district']),
        ]);

        if ($oldName !== $newName) {
            Report::where('barangay', $oldName)->update(['barangay' => $newName]);
            User::where('barangay', $oldName)->update(['barangay' => $newName]);
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Barangay \"{$barangay->name}\" updated.",
        ]);

        return back();
    }

    public function destroy(Barangay $barangay): RedirectResponse
    {
        $reportCount = Report::where('barangay', $barangay->name)->count();
        if ($reportCount > 0) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => "Cannot delete Barangay \"{$barangay->name}\" because {$reportCount} report(s) reference it.",
            ]);

            return back();
        }

        $name = $barangay->name;
        $barangay->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Barangay \"{$name}\" removed from the registry.",
        ]);

        return back();
    }

    public function sync(): RedirectResponse
    {
        $count = GeoCatalog::syncOfficialBarangays(true);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Synced all {$count} official PSA Barangays of Loon, Bohol.",
        ]);

        return back();
    }
}
