<?php

namespace App\Services;

use App\Models\Zone;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

class ZoneService
{
    public function getZoneWithChildren(int $zoneId): array
    {
        return Cache::remember("zone_hierarchy_{$zoneId}", 3600, function () use ($zoneId) {
            return $this->collectZoneAndChildrenIds($zoneId);
        });
    }

    private function collectZoneAndChildrenIds(int $parentId): array
    {
        $ids = [$parentId];
        $children = Zone::where('parent_id', $parentId)->pluck('id')->all();
        foreach ($children as $childId) {
            $ids = array_merge($ids, $this->collectZoneAndChildrenIds($childId));
        }
        return array_values(array_unique($ids));
    }

    public function getZonesByLevel(string $level): Collection
    {
        return Cache::remember("zones_by_level_{$level}", 3600, function () use ($level) {
            return Zone::where('level', $level)->orderBy('name')->get();
        });
    }

    public function clearCache(): void
    {
        Cache::forget('zones_by_level_commune');
        Cache::forget('zones_by_level_arrondissement');
        Cache::forget('zones_by_level_quartier');
    }
}
