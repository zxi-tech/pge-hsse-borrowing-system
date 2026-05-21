<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Item;
use App\Models\ItemSize;

class ItemSeeder extends Seeder
{
    public function run(): void
    {
        // Barang Asset tanpa varian ukuran spesifik (Helm)
        $helm = Item::create([
            'name' => 'Helm Safety Pertamina PGE',
            'type' => 'asset',
            'description' => 'Helm pelindung standar area operasional geothermal.',
            'photo_path' => null,
            'model_3d_path' => null,
        ]);
        
        ItemSize::create([
            'item_id' => $helm->id,
            'size_name' => 'All Size',
            'stock' => 50,
        ]);

        // Barang Asset dengan varian ukuran (Sepatu Safety)
        $sepatu = Item::create([
            'name' => 'Sepatu Safety Cheetah',
            'type' => 'asset',
            'description' => 'Sepatu safety anti-slip dan anti-statis.',
            'photo_path' => null,
            'model_3d_path' => null,
        ]);

        // Menambahkan varian ukuran beserta stoknya
        $ukuranSepatu = [
            ['size' => '39', 'stock' => 10],
            ['size' => '40', 'stock' => 15],
            ['size' => '41', 'stock' => 20],
            ['size' => '42', 'stock' => 15],
            ['size' => '43', 'stock' => 5],
        ];

        foreach ($ukuranSepatu as $ukuran) {
            ItemSize::create([
                'item_id' => $sepatu->id,
                'size_name' => $ukuran['size'],
                'stock' => $ukuran['stock'],
            ]);
        }

        // Barang Consumable (Habis Pakai)
        $earplug = Item::create([
            'name' => 'Ear Plug 3M',
            'type' => 'consumable',
            'description' => 'Pelindung telinga sekali pakai untuk area bising (Turbin/Genset).',
            'photo_path' => null,
            'model_3d_path' => null,
        ]);

        ItemSize::create([
            'item_id' => $earplug->id,
            'size_name' => 'All Size',
            'stock' => 200,
        ]);
    }
}