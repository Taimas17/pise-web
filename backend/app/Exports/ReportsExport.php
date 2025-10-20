<?php

namespace App\Exports;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;

class ReportsExport implements FromView
{
    public function __construct(public $reports) {}

    public function view(): View
    {
        return view('exports.reports', ['reports' => $this->reports]);
    }
}
