<?php

namespace App\Exports;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;

class ChantiersExport implements FromView
{
    public function __construct(public $chantiers) {}

    public function view(): View
    {
        return view('exports.chantiers', ['chantiers' => $this->chantiers]);
    }
}
