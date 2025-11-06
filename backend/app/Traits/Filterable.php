<?php

namespace App\Traits;

use App\Services\ZoneService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

trait Filterable
{
    public function scopeApplyFilters(Builder $query, Request $request): Builder
    {
        $query = $this->applyStandardFilters($query, $request);
        $query = $this->applyDateRangeFilters($query, $request);
        $query = $this->applyZoneFilters($query, $request);
        $query = $this->applySearchFilter($query, $request);
        return $query;
    }

    protected function applyStandardFilters(Builder $query, Request $request): Builder
    {
        $filterMap = $this->getFilterMap();
        foreach ($filterMap as $param => $column) {
            $value = $request->input($param);
            if ($value !== null && $value !== '') {
                $query->where($column, $value);
            }
        }
        return $query;
    }

    protected function applyDateRangeFilters(Builder $query, Request $request): Builder
    {
        if ($from = $request->input('from')) {
            $query->whereDate('created_at', '>=', $from);
        }
        if ($to = $request->input('to')) {
            $query->whereDate('created_at', '<=', $to);
        }
        return $query;
    }

    protected function applyZoneFilters(Builder $query, Request $request): Builder
    {
        if ($quartier = $request->input('quartier_id')) {
            $query->where('zone_id', $quartier);
        } elseif ($arrondissement = $request->input('arrondissement_id')) {
            $zoneIds = app(ZoneService::class)->getZoneWithChildren((int) $arrondissement);
            $query->whereIn('zone_id', $zoneIds);
        } elseif ($commune = $request->input('commune_id')) {
            $zoneIds = app(ZoneService::class)->getZoneWithChildren((int) $commune);
            $query->whereIn('zone_id', $zoneIds);
        } elseif ($zone = $request->input('zone_id')) {
            $query->where('zone_id', $zone);
        }
        return $query;
    }

    protected function applySearchFilter(Builder $query, Request $request): Builder
    {
        $q = trim((string) $request->input('q', ''));
        if ($q !== '') {
            $searchColumns = $this->getSearchableColumns();
            if (!empty($searchColumns)) {
                $query->where(function ($subQuery) use ($q, $searchColumns) {
                    $like = '%' . str_replace(['%','_'], ['\\%','\\_'], $q) . '%';
                    foreach ($searchColumns as $column) {
                        $subQuery->orWhere($column, 'like', $like);
                    }
                });
            }
        }
        return $query;
    }

    abstract protected function getFilterMap(): array;

    abstract protected function getSearchableColumns(): array;
}
