<?php

namespace App\Exports;

use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class TransactionsExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    use Exportable;

    protected $transactions;

    // Inject data transaksi yang udah difilter/diproses dari Controller.
    public function __construct($transactions)
    {
        $this->transactions = $transactions;
    }

    // Pass data collection ke engine Maatwebsite Excel
    public function collection()
    {
        return $this->transactions;
    }

    public function headings(): array
    {
        return [
            'ID Transaksi',
            'Nama Peminjam',
            'NIP',
            'Item Transaksi',
            'Tanggal Pinjam',
            'Tanggal Kembali',
            'Status Akhir'
        ];
    }

    // Format value per baris sebelum di-insert ke cell Excel
    public function map($trx): array
    {
        // Format custom ID: HSSE-[Tahun][ID 3 digit] -> contoh: HSSE-2026001
        $idTrx = 'HSSE-' . Carbon::parse($trx->created_at)->format('Y') . str_pad($trx->id, 3, '0', STR_PAD_LEFT);
        
        $peminjam = $trx->user->name ?? 'User Dihapus';
        $nip = $trx->user->nip ?? '-';

        // Extract relasi details ke array, lalu flat jadi satu string pakai separator koma
        $itemsList = $trx->details ? $trx->details->map(function ($detail) {
            $itemName = $detail->itemSize->item->name ?? 'Barang Dihapus';
            return "{$itemName} (x{$detail->quantity})";
        })->join(', ') : '-';

        return [
            $idTrx,
            $peminjam,
            $nip,
            $itemsList,
            Carbon::parse($trx->start_date)->format('d M Y'),
            Carbon::parse($trx->end_date)->format('d M Y'),
            strtoupper($trx->status),
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true, 'size' => 12]],
        ];
    }
}