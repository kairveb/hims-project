<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    use HasFactory;

    protected $fillable = ['code', 'patient_name', 'patient_id', 'physician', 'visit_type', 'appt_date', 'appt_time'];

    protected $casts = [
        'appt_date' => 'date:Y-m-d',
    ];

    public function toFrontend(): array
    {
        return [
            'id'        => $this->code,
            'patient'   => $this->patient_name,
            'physician' => $this->physician,
            'visitType' => $this->visit_type,
            'date'      => $this->appt_date->format('Y-m-d'),
            'time'      => substr($this->appt_time, 0, 5),
            'createdAt' => $this->created_at->timestamp * 1000,
        ];
    }
}
