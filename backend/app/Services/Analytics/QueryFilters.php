<?php

namespace App\Services\Analytics;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class QueryFilters
{
    public static function apply(Builder $query, array $params): Builder
    {
        if (!empty($params['type_id'])) {
            $query->where('infrastructure_type_id', $params['type_id']);
        }
        if (!empty($params['status'])) {
            $query->where('status', $params['status']);
        }
        if (!empty($params['criticality'])) {
            $query->where('criticality', $params['criticality']);
        }
        if (!empty($params['zone_id'])) {
            $query->where('zone_id', $params['zone_id']);
        }
        if (!empty($params['agent_id'])) {
            $query->whereHas('assignments', function ($q) use ($params) {
                $q->where('assigned_to_user_id', $params['agent_id']);
            });
        }
        if (!empty($params['from'])) {
            $query->whereDate('created_at', '>=', $params['from']);
        }
        if (!empty($params['to'])) {
            $query->whereDate('created_at', '<=', $params['to']);
        }
        return $query;
    }
}
