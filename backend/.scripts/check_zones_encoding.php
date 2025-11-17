<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Zone;

$zones = Zone::all();
foreach ($zones as $z) {
    $name = $z->name;
    $props = $z->properties;
    $okName = mb_check_encoding($name, 'UTF-8') ? 1 : 0;
    $propsJson = null;
    try {
        $propsJson = json_encode($props);
    } catch (\Throwable $e) {
        $propsJson = false;
    }
    $okProps = ($propsJson !== false && $propsJson !== null) ? 1 : 0;
    echo "id:{$z->id} name_ok:{$okName} props_ok:{$okProps} name:".($name ?? 'null')."\n";
    if (!$okName) {
        echo "BAD_NAME_HEX: " . bin2hex($name) . "\n";
    }
    if (!$okProps) {
        echo "BAD_PROPS_RAW: ";
        var_export($props);
        echo "\n";
    }
}
