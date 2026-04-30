<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AssessmentCategory;
use App\Models\AssessmentMetric;
use Inertia\Inertia;

class MasterAssessmentController extends Controller
{
    public function index()
    {
        $categories = AssessmentCategory::with('metrics')->get();
        return Inertia::render('Admin/MasterAssessment', [
            'categories' => $categories
        ]);
    }

    // HANYA MENGUPDATE ATURAN PERIODISASI (Kategori tidak bisa ditambah/dihapus/diganti nama)
    public function updatePeriodization(Request $request, $id)
    {
        $request->validate([
            'periodization_rules' => 'required|array'
        ]);

        $category = AssessmentCategory::findOrFail($id);
        $category->update([
            'periodization_rules' => $request->periodization_rules
        ]);

        return back()->with('success', 'Aturan Periodisasi berhasil diperbarui!');
    }

    // SIMPAN / EDIT ITEM TES
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

    // HAPUS ITEM TES
    public function destroyMetric($id)
    {
        AssessmentMetric::findOrFail($id)->delete();
        return back()->with('success', 'Item Tes berhasil dihapus!');
    }
}