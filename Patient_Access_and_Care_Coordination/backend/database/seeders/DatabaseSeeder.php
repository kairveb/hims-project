<?php

namespace Database\Seeders;

use App\Models\Bed;
use App\Models\User;
use App\Models\Ward;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        $wards = [
            ['code' => 'A', 'name' => 'Ward A · General Medicine', 'size' => 24],
            ['code' => 'B', 'name' => 'Ward B · Surgical', 'size' => 20],
            ['code' => 'C', 'name' => 'Ward C · Pediatrics', 'size' => 16],
            ['code' => 'I', 'name' => 'ICU', 'size' => 12],
        ];

        foreach ($wards as $wardData) {
            $ward = Ward::firstOrCreate(
                ['code' => $wardData['code']],
                ['name' => $wardData['name'], 'size' => $wardData['size']]
            );

            for ($i = 1; $i <= $wardData['size']; $i++) {
                $bedCode = $ward->code . '-' . str_pad((string) $i, 2, '0', STR_PAD_LEFT);
                Bed::firstOrCreate(
                    ['code' => $bedCode],
                    [
                        'ward_id' => $ward->id,
                        'status' => $i <= 3 ? 'available' : 'occupied',
                        'patient_name' => $i <= 3 ? null : 'Sample Patient',
                        'note' => null,
                    ]
                );
            }
        }
    }
}
