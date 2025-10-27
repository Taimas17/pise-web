param([switch]$WithQueue)
$root = (Resolve-Path "$PSScriptRoot/../..").Path
$backend = Join-Path $root "backend"
if($WithQueue){ Start-Process powershell -ArgumentList "-NoExit","-Command","php artisan queue:listen --tries=1" -WorkingDirectory $backend }
Push-Location $backend
php artisan serve --host=localhost --port=8000
Pop-Location
