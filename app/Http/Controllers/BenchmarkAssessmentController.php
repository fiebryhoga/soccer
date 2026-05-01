<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AssessmentCategory;
use App\Models\AssessmentTestItem;
use Inertia\Inertia;

class BenchmarkAssessmentController extends Controller
{
    // 1. Tampilkan Halaman Master Assessment
    public function index()
    {
        // Ambil semua kategori beserta item tes-nya
        $categories = AssessmentCategory::with('testItems')->get();
        return Inertia::render('Benchmarks/Assessments/Index', [
            'categories' => $categories
        ]);
    }

    // 2. Update Tahapan Biomotorik (JSON)
    public function updateBiomotor(Request $request, $id)
    {
        $request->validate([
            'biomotor_stages' => 'nullable|array'
        ]);

        $category = AssessmentCategory::findOrFail($id);
        $category->update([
            'biomotor_stages' => $request->biomotor_stages
        ]);

        return back()->with('message', 'Tahapan Biomotorik berhasil diperbarui!');
    }

    // 3. Simpan atau Update Item Tes
    // 3. Simpan atau Update Item Tes (Dengan Logika Otomatis)
    public function storeTestItem(Request $request)
    {
        $request->validate([
            'id' => 'nullable|exists:assessment_test_items,id',
            'category_id' => 'required|exists:assessment_categories,id',
            'name' => 'required|string|max:255',
            'parameter_type' => 'required|in:points,reps,cm,s,vo2max,m,min,kg',
            'target_benchmark' => 'required|numeric',
            // is_lower_better tidak perlu divalidasi lagi karena kita hitung di backend
        ]);

        // LOGIKA PINTAR: Jika satuannya detik (s) atau menit (min), maka makin kecil makin bagus
        $isLowerBetter = in_array($request->parameter_type, ['s', 'min']);

        AssessmentTestItem::updateOrCreate(
            ['id' => $request->id],
            [
                'category_id' => $request->category_id,
                'name' => $request->name,
                'parameter_type' => $request->parameter_type,
                'target_benchmark' => $request->target_benchmark,
                'is_lower_better' => $isLowerBetter
            ]
        );

        return back()->with('message', 'Item Tes berhasil disimpan!');
    }

    // 4. Hapus Item Tes
    public function destroyTestItem($id)
    {
        AssessmentTestItem::findOrFail($id)->delete();
        return back()->with('message', 'Item Tes berhasil dihapus!');
    }
}