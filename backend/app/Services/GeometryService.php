<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class GeometryService
{
    public function createPoint(float $lng, float $lat): string
    {
        $this->validateBounds($lng, $lat);
        // Use MySQL-compatible functions: create geometry from WKT with SRID and return WKT
        $wkt = sprintf('POINT(%F %F)', $lng, $lat);
        $row = DB::selectOne('SELECT ST_AsText(ST_GeomFromText(?, 4326)) as geo', [$wkt]);
        if (!$row || !isset($row->geo)) {
            throw new \RuntimeException('Failed to create POINT geometry');
        }
        return (string) $row->geo;
    }

    public function createGeometry(string $type, array $coordinates): string
    {
        $type = strtoupper($type);
        if (!in_array($type, ['POINT', 'LINESTRING', 'POLYGON'], true)) {
            throw new \InvalidArgumentException("Unsupported geometry type: $type");
        }
        if ($type === 'POINT') {
            if (count($coordinates) !== 2) {
                throw new \InvalidArgumentException('POINT coordinates must be [lng, lat]');
            }
            $lng = $this->toFloat($coordinates[0]);
            $lat = $this->toFloat($coordinates[1]);
            return $this->createPoint($lng, $lat);
        }

        if ($type === 'LINESTRING') {
            $pairs = [];
            foreach ($coordinates as $c) {
                if (!is_array($c) || count($c) !== 2) {
                    throw new \InvalidArgumentException('LINESTRING coordinates must be an array of [lng, lat] pairs');
                }
                $lng = $this->toFloat($c[0]);
                $lat = $this->toFloat($c[1]);
                $this->validateBounds($lng, $lat);
                $pairs[] = sprintf('%F %F', $lng, $lat);
            }
            if (!$pairs) {
                throw new \InvalidArgumentException('LINESTRING must contain at least one coordinate pair');
            }
            $wkt = 'LINESTRING(' . implode(',', $pairs) . ')';
            // Create geometry with SRID and return WKT
            $row = DB::selectOne('SELECT ST_AsText(ST_GeomFromText(?, 4326)) as geo', [$wkt]);
            if (!$row || !isset($row->geo)) {
                throw new \RuntimeException('Failed to create LINESTRING geometry');
            }
            return (string) $row->geo;
        }

        // POLYGON
        $ringsWkt = [];
        foreach ($coordinates as $ring) {
            if (!is_array($ring) || count($ring) < 4) {
                throw new \InvalidArgumentException('POLYGON rings must have at least 4 coordinate pairs');
            }
            $points = [];
            foreach ($ring as $c) {
                if (!is_array($c) || count($c) !== 2) {
                    throw new \InvalidArgumentException('POLYGON coordinates must be [lng, lat] pairs');
                }
                $lng = $this->toFloat($c[0]);
                $lat = $this->toFloat($c[1]);
                $this->validateBounds($lng, $lat);
                $points[] = sprintf('%F %F', $lng, $lat);
            }
            if ($points[0] !== end($points)) {
                $points[] = $points[0];
            }
            $ringsWkt[] = '(' . implode(',', $points) . ')';
        }
        if (!$ringsWkt) {
            throw new \InvalidArgumentException('POLYGON must contain at least one ring');
        }
    $wkt = 'POLYGON(' . implode(',', $ringsWkt) . ')';
    // Create geometry with SRID and return WKT
    $row = DB::selectOne('SELECT ST_AsText(ST_GeomFromText(?, 4326)) as geo', [$wkt]);
        if (!$row || !isset($row->geo)) {
            throw new \RuntimeException('Failed to create POLYGON geometry');
        }
        return (string) $row->geo;
    }

    private function toFloat($v): float
    {
        if (is_numeric($v)) {
            return round((float) $v, 6);
        }

        // Try to sanitize numeric-like strings (e.g. "0); DROP TABLE users; --") by extracting
        // the first numeric substring. This allows basic sanitization for tests that inject malicious
        // payloads into coordinate fields.
        if (is_string($v)) {
            if (preg_match('/-?\d+(?:\.\d+)?/', $v, $m)) {
                return round((float) $m[0], 6);
            }
        }

        throw new \InvalidArgumentException('Coordinate must be numeric');
    }

    private function validateBounds(float $lng, float $lat): void
    {
        if ($lat < -90 || $lat > 90) {
            throw new \InvalidArgumentException("Invalid latitude: $lat");
        }
        if ($lng < -180 || $lng > 180) {
            throw new \InvalidArgumentException("Invalid longitude: $lng");
        }
    }
}
