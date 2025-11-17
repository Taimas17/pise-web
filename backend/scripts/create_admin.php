<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;

// Usage: php create_admin.php [email] [name] [password]
$email = $argv[1] ?? null;
$name = $argv[2] ?? null;
$pass = $argv[3] ?? null;

if (!$email) {
    $email = 'admin+' . Str::random(6) . '@example.com';
}
if (!$name) {
    $name = 'Admin';
}
if (!$pass) {
    $pass = substr(bin2hex(random_bytes(6)), 0, 12);
}

// Ensure unique email
$existing = User::where('email', $email)->first();
if ($existing) {
    echo "User with email $email already exists (id={$existing->id}).\n";
    exit(0);
}

$user = User::create([
    'name' => $name,
    'email' => $email,
    'password' => Hash::make($pass),
    'role' => 'admin',
]);

if ($user) {
    echo "Created admin user:\n";
    echo "id: " . $user->id . PHP_EOL;
    echo "email: " . $user->email . PHP_EOL;
    echo "password: " . $pass . PHP_EOL;
    exit(0);
}

echo "Failed to create admin user.\n";
exit(1);
