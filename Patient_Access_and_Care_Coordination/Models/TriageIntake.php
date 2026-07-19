<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TriageIntake extends Model
{
    protected $fillable = ['code', 'patient_name', 'complaint', 'level', 'vitals', 'symptoms'];

    protected $casts = [
        'vitals'   => 'array',
        'symptoms' => 'array',
    ];

    public function toFrontend(): array
    {
        return [
            'id'        => $this->code,
            'name'      => $this->patient_name,
            'complaint' => $this->complaint,
            'level'     => $this->level,
            'wait'      => $this->created_at->diffForHumans(),
            'vitals'    => $this->vitals,
        ];
    }
}