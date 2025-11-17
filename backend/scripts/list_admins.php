<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;

$admins = User::where('role', 'admin')->pluck('id')->all();
if (empty($admins)) {
    echo "No admin users found.\n";
    exit(0);
}
foreach ($admins as $id) {
    echo $id . PHP_EOL;
}
