<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Patient extends Model
{
    use HasFactory;

    protected $fillable = ['code', 'first_name', 'last_name', 'age', 'sex', 'contact', 'status'];

    // Shapes the API response to exactly what the frontend table expects
    public function toFrontend(): array
    {
        return [
            'id'      => $this->code,
            'name'    => trim($this->first_name . ' ' . $this->last_name),
            'age'     => $this->age ?? '—',
            'sex'     => $this->sex ? substr($this->sex, 0, 1) : '—',
            'contact' => $this->contact ?: '—',
            'date'    => $this->created_at->diffForHumans(),
            'status'  => $this->status,
        ];
    }
}