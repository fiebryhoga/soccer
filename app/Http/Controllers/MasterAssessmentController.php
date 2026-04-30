<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AssessmentCategory;
use App\Models\AssessmentMetric;
use Inertia\Inertia;

class MasterAssessmentController extends Controller
{
    // 1. Tampilkan Halaman Master
    public function index()
    {
        $categories = AssessmentCategory::with('metrics')->get();
        return Inertia::render('Admin/MasterAssessment', [
            'categories' => $categories
        ]);
    }

    // 2. Simpan atau Update Kategori & Periodisasi
    public function storeCategory(Request $request)
    {
        $request->validate([
            'id' => 'nullable|exists:assessment_categories,id',
            'name' => 'required|string',
            'body_part' => 'required|string',
            'periodization_rules' => 'required|array'
        ]);

        AssessmentCategory::updateOrCreate(
            ['id' => $request->id],
            [
                'name' => $request->name,
                'body_part' => $request->body_part,
                'periodization_rules' => $request->periodization_rules
            ]
        );

        return back()->with('success', 'Kategori & Aturan Periodisasi berhasil disimpan!');
    }

    // 3. Hapus Kategori
    public function destroyCategory($id)
    {
        AssessmentCategory::findOrFail($id)->delete();
        return back()->with('success', 'Kategori berhasil dihapus!');
    }

    // 4. Simpan atau Update Item Tes (Metrik)
    public function storeMetric(Request $request)
    {
        $request->validate([
            'id' => 'nullable|exists:assessment_metrics,id',
            'category_id' => 'required|exists:assessment_categories,id',
            'name' => 'required|string',
            'unit' => 'required|string',
            'target_value' => 'required|numeric',
            'is_lower_better' => 'required|boolean'
        ]);

        AssessmentMetric::updateOrCreate(
            ['id' => $request->id],
            $request->all()
        );

        return back()->with('success', 'Item Tes berhasil disimpan!');
    }

    // 5. Hapus Item Tes (Metrik)
    public function destroyMetric($id)
    {
        AssessmentMetric::findOrFail($id)->delete();
        return back()->with('success', 'Item Tes berhasil dihapus!');
    }
}