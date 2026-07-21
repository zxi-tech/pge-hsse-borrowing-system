<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\Item;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Chart\Chart;
use PhpOffice\PhpSpreadsheet\Chart\DataSeries;
use PhpOffice\PhpSpreadsheet\Chart\DataSeriesValues;
use PhpOffice\PhpSpreadsheet\Chart\Legend;
use PhpOffice\PhpSpreadsheet\Chart\PlotArea;
use PhpOffice\PhpSpreadsheet\Chart\Title;

class StatisticsController extends Controller
{
    public function index(Request $request)
    {
        $totalPeminjaman = Transaction::count();

        $startDate = Carbon::now()->subDays(6)->startOfDay();
        $transactionsWeek = Transaction::where('created_at', '>=', $startDate)->get();

        $miniLineData = [];
        $totalMingguIni = 0;
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $count = $transactionsWeek->whereBetween('created_at', [$date->copy()->startOfDay(), $date->copy()->endOfDay()])->count();
            $dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
            $miniLineData[] = ['day' => $dayNames[$date->dayOfWeek], 'val' => $count];
            $totalMingguIni += $count;
        }

        $departments = [
            'Operation' => 'Operasional',
            'Business Support' => 'Bus. Support',
            'Maintenance' => 'Maintenance',
            'Healthy, Safety, Security, Environment (HSSE)' => 'HSSE',
            'GPR' => 'GPR'
        ];

        $deptDataRaw = [];
        foreach ($departments as $dbName => $shortName) {
            $deptDataRaw[$dbName] = [
                'name' => $shortName, 
                'dipinjam' => 0,
                'menunggu' => 0,
                'selesai' => 0, 
                'ditolak' => 0,
                'terlambat' => 0
            ];
        }

        $deptStats = DB::table('transactions')
            ->join('users', 'transactions.user_id', '=', 'users.id')
            ->select('users.department', 'transactions.status', DB::raw('count(*) as total'))
            ->groupBy('users.department', 'transactions.status')
            ->get();

        foreach ($deptStats as $stat) {
            $dept = $stat->department;
            
            if (isset($deptDataRaw[$dept])) {
                $statusTrx = strtolower($stat->status);

                if (array_key_exists($statusTrx, $deptDataRaw[$dept])) {
                     $deptDataRaw[$dept][$statusTrx] += $stat->total;
                }
            }
        }
        $deptData = array_values($deptDataRaw);

        $itemStatsQuery = DB::table('item_sizes')->select('item_id', 'status', DB::raw('SUM(stock) as total_stock'))->groupBy('item_id', 'status')->get();
        $itemStats = ['all' => ['available' => 0, 'laundry' => 0, 'maintenance' => 0]];
        foreach ($itemStatsQuery as $stat) {
            $itemId = $stat->item_id;
            $status = $stat->status ?: 'available'; 
            if (!isset($itemStats[$itemId])) $itemStats[$itemId] = ['available' => 0, 'laundry' => 0, 'maintenance' => 0];
            $itemStats[$itemId][$status] += $stat->total_stock;
            $itemStats['all'][$status] += $stat->total_stock;
        }

        $items = Item::with('sizes')->get();
        
        $dropdownItems = [];
        $globalChartLabels = [];
        $globalChartDataArr = [];
        $globalChartColors = [];
        $sizesChartData = [];
        
        $colorPalette = ['#21409A', '#00A651', '#F59E0B', '#EF4444', '#0EA5E9', '#8B5CF6', '#EC4899', '#14B8A6'];
        
        foreach($items as $index => $item) {
            $dropdownItems[] = ['id' => $item->id, 'name' => $item->name];
            
            $totalStock = $item->sizes->sum('stock');
            
            $globalChartLabels[] = $item->name;
            $globalChartDataArr[] = $totalStock > 0 ? $totalStock : 0;
            $globalChartColors[] = $colorPalette[$index % count($colorPalette)];
            
            $specLabels = [];
            $specData = [];
            $specColors = [];
            
            foreach($item->sizes as $sIdx => $size) {
                $specLabels[] = $size->size_name;
                $specData[] = $size->stock;
                $specColors[] = $colorPalette[$sIdx % count($colorPalette)];
            }
            
            $sizesChartData[$item->id] = [
                'labels' => $specLabels,
                'data' => $specData,
                'colors' => $specColors,
                'total' => $totalStock
            ];
        }   

        $latestActivitiesQuery = Transaction::with('user') 
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        $latestActivities = $latestActivitiesQuery->map(function($trx) {
            $statusStr = strtolower($trx->status);
            
            if ($statusStr === 'selesai') {
                $badge = 'bg-green-50 text-green-600';
            } elseif ($statusStr === 'ditolak') {
                $badge = 'bg-red-50 text-red-600';
            } elseif ($statusStr === 'menunggu') {
                $badge = 'bg-yellow-50 text-yellow-600';
            } elseif ($statusStr === 'terlambat') {
                $badge = 'bg-orange-50 text-orange-600';
            } else { 
                $badge = 'bg-blue-50 text-blue-600';
            }

            $startDate = $trx->start_date ? Carbon::parse($trx->start_date) : $trx->created_at;
            
            if ($trx->end_date) {
                $endDate = Carbon::parse($trx->end_date);
                if ($startDate->year !== $endDate->year) {
                     $timeString = $startDate->format('d M Y') . ' - ' . $endDate->format('d M Y');
                } else {
                     $timeString = $startDate->format('d M') . ' - ' . $endDate->format('d M Y');
                }
            } else {
                $timeString = $startDate->format('d M Y');
            }

            $totalItems = DB::table('transaction_details')
                ->where('transaction_id', $trx->id)
                ->sum('quantity');

            return [
                'name' => $trx->user ? $trx->user->name : 'Pekerja Tidak Dikenal',
                'status' => ucfirst($trx->status),
                'badge' => $badge,
                'time' => $timeString,
                'items' => $totalItems > 0 ? $totalItems : '-', 
            ];
        });

        $monthsSkeleton = [];
        for ($i = 5; $i >= 0; $i--) {
            $m = Carbon::now()->subMonths($i);
            $mKey = $m->format('Y-m'); 
            $monthsSkeleton[$mKey] = [
                'name' => $m->translatedFormat('M'),
                'pinjam' => 0, 
                'kembali' => 0
            ];
        }

        $activityStatsRaw = ['all' => $monthsSkeleton];
        foreach ($items as $item) {
            $activityStatsRaw[$item->id] = $monthsSkeleton;
        }

        $sixMonthsAgo = Carbon::now()->subMonths(5)->startOfMonth();
        
        $trxDetails = DB::table('transaction_details')
            ->join('transactions', 'transaction_details.transaction_id', '=', 'transactions.id')
            ->join('item_sizes', 'transaction_details.item_size_id', '=', 'item_sizes.id')
            ->select(
                'item_sizes.item_id',
                'transactions.created_at as start_date', 
                'transactions.end_date',
                'transactions.status',
                'transaction_details.quantity'
            )
            ->where('transactions.created_at', '>=', $sixMonthsAgo) 
            ->get();

        foreach ($trxDetails as $detail) {
            $startDate = Carbon::parse($detail->start_date);
            $startKey = $startDate->format('Y-m');
            $qty = $detail->quantity;
            $itemId = $detail->item_id;

            if (isset($activityStatsRaw['all'][$startKey])) {
                $activityStatsRaw['all'][$startKey]['pinjam'] += $qty;
                if (isset($activityStatsRaw[$itemId])) {
                    $activityStatsRaw[$itemId][$startKey]['pinjam'] += $qty;
                }
            }

            $status = strtolower($detail->status);
            if (in_array($status, ['selesai', 'dikembalikan']) && $detail->end_date) {
                $endDate = Carbon::parse($detail->end_date);
                $endKey = $endDate->format('Y-m');
                
                if (isset($activityStatsRaw['all'][$endKey])) {
                    $activityStatsRaw['all'][$endKey]['kembali'] += $qty;
                    if (isset($activityStatsRaw[$itemId])) {
                        $activityStatsRaw[$itemId][$endKey]['kembali'] += $qty;
                    }
                }
            }
        }

        $activityStatsBackend = [];
        foreach ($activityStatsRaw as $key => $data) {
            $activityStatsBackend[$key] = array_values($data);
        }

        return Inertia::render('Dashboard/Statistics', [
            'totalPeminjaman' => $totalPeminjaman,
            'miniLineData'    => $miniLineData,
            'totalMingguIni'  => $totalMingguIni,
            'deptDataBackend' => $deptData,
            'itemStatsBackend'=> $itemStats,
            'dropdownItems'   => $dropdownItems,
            'globalChart'     => [
                'labels' => $globalChartLabels, 
                'data' => $globalChartDataArr, 
                'colors' => $globalChartColors, 
                'total' => array_sum($globalChartDataArr)
            ],
            'sizesChartData'  => $sizesChartData,
            'latestActivities'=> $latestActivities,
            'activityStatsBackend' => $activityStatsBackend,
        ]);
    }

    // FUNGSI EXPORT EXCEL DENGAN CHART NATIVE 
    public function export(Request $request)
    {
        $itemId = $request->query('item_id', 'all');
        $timeRange = $request->query('time_range', 'all'); // Tangkap Waktu
        $itemName = 'Semua APD (Global)';
        
        if ($itemId !== 'all') {
            $item = Item::find($itemId);
            if ($item) $itemName = $item->name;
        }

        // 1. DATA PIE CHART: Ambil Data Kondisi (Status Stok Terkini)
        $queryKondisi = DB::table('item_sizes')->select('status', DB::raw('SUM(stock) as total'));
        if ($itemId !== 'all') $queryKondisi->where('item_id', $itemId);
        $stokKondisi = $queryKondisi->groupBy('status')->get();

        $kondisiBaik = 0; $kondisiLaundry = 0; $kondisiPerbaikan = 0;
        foreach($stokKondisi as $stok) {
            if (!$stok->status || $stok->status === 'available') $kondisiBaik = $stok->total;
            elseif ($stok->status === 'laundry') $kondisiLaundry = $stok->total;
            elseif ($stok->status === 'maintenance') $kondisiPerbaikan = $stok->total;
        }

        // 2. DATA BAR CHART: Siapkan Rentang Waktu
        $formatKey = 'Y-m-d';
        $startDate = null;

        if ($timeRange === '7') {
            $startDate = Carbon::now()->subDays(6)->startOfDay();
            $formatKey = 'Y-m-d'; // Harian
        } elseif ($timeRange === '30') {
            $startDate = Carbon::now()->subDays(29)->startOfDay();
            $formatKey = 'Y-m-d'; // Harian
        } elseif ($timeRange === '180') {
            $startDate = Carbon::now()->subMonths(5)->startOfMonth();
            $formatKey = 'Y-m'; // Bulanan
        } else {
            $oldest = Transaction::orderBy('created_at', 'asc')->first();
            $startDate = $oldest ? Carbon::parse($oldest->created_at)->startOfMonth() : Carbon::now()->startOfMonth();
            $formatKey = 'Y-m'; // Bulanan
        }

        // Kerangka Array Waktu (Agar tanggal/bulan yang kosong tetap ada nilainya 0)
        $aggregatedData = [];
        if ($timeRange === '7' || $timeRange === '30') {
            $daysCount = $timeRange === '7' ? 6 : 29;
            for ($i = $daysCount; $i >= 0; $i--) {
                $date = Carbon::now()->subDays($i);
                $aggregatedData[$date->format('Y-m-d')] = ['label' => $date->format('d M'), 'pinjam' => 0, 'kembali' => 0];
            }
        } else {
            $start = $startDate->copy();
            $end = Carbon::now();
            while ($start <= $end) {
                $aggregatedData[$start->format('Y-m')] = ['label' => $start->translatedFormat('M Y'), 'pinjam' => 0, 'kembali' => 0];
                $start->addMonth();
            }
        }

        // Query Data Transaksi untuk Bar Chart
        $queryTrx = DB::table('transaction_details')
            ->join('transactions', 'transaction_details.transaction_id', '=', 'transactions.id')
            ->join('item_sizes', 'transaction_details.item_size_id', '=', 'item_sizes.id')
            ->select('transactions.created_at', 'transactions.end_date', 'transactions.status', 'transaction_details.quantity');

        if ($itemId !== 'all') $queryTrx->where('item_sizes.item_id', $itemId);
        if ($startDate) $queryTrx->where('transactions.created_at', '>=', $startDate);
        $transactionsList = $queryTrx->get();

        // Hitung Pinjam & Kembali berdasarkan waktu
        foreach ($transactionsList as $trx) {
            $pinjamKey = Carbon::parse($trx->created_at)->format($formatKey);
            if (isset($aggregatedData[$pinjamKey])) {
                $aggregatedData[$pinjamKey]['pinjam'] += $trx->quantity;
            }

            if (in_array(strtolower($trx->status), ['selesai', 'dikembalikan']) && $trx->end_date) {
                $kembaliKey = Carbon::parse($trx->end_date)->format($formatKey);
                if (isset($aggregatedData[$kembaliKey])) {
                    $aggregatedData[$kembaliKey]['kembali'] += $trx->quantity;
                }
            }
        }

        // 3. INISIASI EXCEL
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Statistik'); 

        // TULIS TABEL 1: KONDISI BARANG
        $sheet->setCellValue('A1', 'Status Barang');
        $sheet->setCellValue('B1', 'Total (Pcs)');
        $sheet->setCellValue('A2', 'Kondisi Baik'); $sheet->setCellValue('B2', $kondisiBaik);
        $sheet->setCellValue('A3', 'Di Laundry'); $sheet->setCellValue('B3', $kondisiLaundry);
        $sheet->setCellValue('A4', 'Perbaikan'); $sheet->setCellValue('B4', $kondisiPerbaikan);
        $sheet->getStyle('A1:B1')->getFont()->setBold(true);

        // TULIS TABEL 2: AKTIVITAS PEMINJAMAN
        $startRow = 7;
        $sheet->setCellValue('A' . $startRow, 'Waktu (' . ($timeRange == '7' || $timeRange == '30' ? 'Harian' : 'Bulanan') . ')');
        $sheet->setCellValue('B' . $startRow, 'Dipinjam');
        $sheet->setCellValue('C' . $startRow, 'Dikembalikan');
        $sheet->getStyle('A'.$startRow.':C'.$startRow)->getFont()->setBold(true);

        $currentRow = $startRow + 1;
        foreach ($aggregatedData as $data) {
            $sheet->setCellValue('A' . $currentRow, $data['label']);
            $sheet->setCellValue('B' . $currentRow, $data['pinjam']);
            $sheet->setCellValue('C' . $currentRow, $data['kembali']);
            $currentRow++;
        }
        $endRow = $currentRow - 1;
        $rowCount = count($aggregatedData);

        // Styling kolom
        $sheet->getColumnDimension('A')->setAutoSize(true);
        $sheet->getColumnDimension('B')->setAutoSize(true);
        $sheet->getColumnDimension('C')->setAutoSize(true);
        
        // CHART 1: PIE CHART (Kondisi)
        $dataSeriesLabelsPie = [new DataSeriesValues(DataSeriesValues::DATASERIES_TYPE_STRING, 'Statistik!$B$1', null, 1)];
        $xAxisTickValuesPie = [new DataSeriesValues(DataSeriesValues::DATASERIES_TYPE_STRING, 'Statistik!$A$2:$A$4', null, 3)];
        $dataSeriesValuesPie = [new DataSeriesValues(DataSeriesValues::DATASERIES_TYPE_NUMBER, 'Statistik!$B$2:$B$4', null, 3)];

        $seriesPie = new DataSeries(
            DataSeries::TYPE_PIECHART, null, range(0, count($dataSeriesValuesPie) - 1), 
            $dataSeriesLabelsPie, $xAxisTickValuesPie, $dataSeriesValuesPie
        );

        $layoutPie = new \PhpOffice\PhpSpreadsheet\Chart\Layout();
        $layoutPie->setShowVal(true); $layoutPie->setShowPercent(true); 
        $plotAreaPie = new PlotArea($layoutPie, [$seriesPie]);
        $chartPie = new Chart('chart_kondisi', new Title('Kondisi Fisik: ' . $itemName), new Legend(Legend::POSITION_RIGHT, null, false), $plotAreaPie);
        $chartPie->setTopLeftPosition('E1');
        $chartPie->setBottomRightPosition('K12');
        $sheet->addChart($chartPie);

        // CHART 2: BAR CHART (Aktivitas Peminjaman)
        // Label Series: "Dipinjam" & "Dikembalikan"
        $dataSeriesLabelsBar = [
            new DataSeriesValues(DataSeriesValues::DATASERIES_TYPE_STRING, 'Statistik!$B$'.$startRow, null, 1),
            new DataSeriesValues(DataSeriesValues::DATASERIES_TYPE_STRING, 'Statistik!$C$'.$startRow, null, 1),
        ];
        // Label Kategori (Tanggal/Bulan di sumbu X)
        $xAxisTickValuesBar = [
            new DataSeriesValues(DataSeriesValues::DATASERIES_TYPE_STRING, 'Statistik!$A$'.($startRow+1).':$A$'.$endRow, null, $rowCount)
        ];
        // Nilai Data (Sumbu Y)
        $dataSeriesValuesBar = [
            new DataSeriesValues(DataSeriesValues::DATASERIES_TYPE_NUMBER, 'Statistik!$B$'.($startRow+1).':$B$'.$endRow, null, $rowCount),
            new DataSeriesValues(DataSeriesValues::DATASERIES_TYPE_NUMBER, 'Statistik!$C$'.($startRow+1).':$C$'.$endRow, null, $rowCount),
        ];

        $seriesBar = new DataSeries(
            DataSeries::TYPE_BARCHART, 
            DataSeries::GROUPING_CLUSTERED, 
            range(0, count($dataSeriesValuesBar) - 1), 
            $dataSeriesLabelsBar, 
            $xAxisTickValuesBar, 
            $dataSeriesValuesBar
        );

        $layoutBar = new \PhpOffice\PhpSpreadsheet\Chart\Layout();
        $layoutBar->setShowVal(true);
        $plotAreaBar = new PlotArea($layoutBar, [$seriesBar]);
        $titleText = 'Aktivitas ' . ($timeRange == 'all' ? 'Sepanjang Waktu' : ($timeRange == '180' ? '6 Bulan Terakhir' : $timeRange . ' Hari Terakhir'));
        $chartBar = new Chart('chart_aktivitas', new Title($titleText), new Legend(Legend::POSITION_RIGHT, null, false), $plotAreaBar);
        
        $chartBar->setTopLeftPosition('E14');
        $chartBar->setBottomRightPosition('O28');
        $sheet->addChart($chartBar);

        $fileName = 'Laporan_' . str_replace(' ', '_', $itemName) . '_' . date('Ymd_Hi') . '.xlsx';
        $tempFile = storage_path('app/' . $fileName);

        $writer = new Xlsx($spreadsheet);
        $writer->setIncludeCharts(true); 
        $writer->save($tempFile);

        return response()->download($tempFile)->deleteFileAfterSend(true);
    }
}