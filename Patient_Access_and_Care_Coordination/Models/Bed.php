<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bed extends Model
{
    protected $fillable = ['ward_id', 'code', 'status', 'patient_name', 'note'];

    public function ward()
    {
        return $this->belongsTo(Ward::class);
    }

    public function toFrontend(): array
    {
        return [
            'dbId'    => $this->id,
            'id'      => $this->code,
            'status'  => $this->status,
            'patient' => $this->patient_name,
            'note'    => $this->note,
        ];
    }
}