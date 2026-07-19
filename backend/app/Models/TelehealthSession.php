<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TelehealthSession extends Model
{
    protected $fillable = ['room_url', 'room_name', 'status'];
}
