<?php

namespace Tests\Feature;

use App\Models\Report;
use Illuminate\Http\Request;
use Tests\TestCase;

class ReportFilteringTest extends TestCase
{
    public function test_scope_apply_filters_exists()
    {
        $this->assertTrue(method_exists(new Report(), 'scopeApplyFilters'));
    }
}
