param()
$ErrorActionPreference = "Stop"
$root = (Resolve-Path "$PSScriptRoot/../..").Path
$backend = Join-Path $root "backend"
$web = Join-Path $root "web"
function Set-EnvLine { param($path,$key,$value)
  if(!(Test-Path $path)){New-Item -ItemType File -Path $path -Force | Out-Null}
  $text = Get-Content -Raw -Path $path
  if([string]::IsNullOrEmpty($text)){ $new="$key=$value`r`n"; Set-Content -Path $path -Value $new -NoNewline; return }
  $pattern = "(?m)^[\s]*" + [regex]::Escape($key) + "\s*=.*$"
  if([regex]::IsMatch($text,$pattern)){
    $text = [regex]::Replace($text,$pattern,"$key=$value")
  } else {
    if(!$text.EndsWith("`n")){ $text += "`r`n" }
    $text += "$key=$value`r`n"
  }
  Set-Content -Path $path -Value $text -NoNewline
}
function Get-EnvValue { param($path,$key)
  if(!(Test-Path $path)){ return "" }
  $m = Select-String -Path $path -Pattern ("(?m)^[\s]*" + [regex]::Escape($key) + "\s*=(.*)$") | Select-Object -First 1
  if($m){ return ($m.Matches[0].Groups[1].Value).Trim() } else { return "" }
}
Write-Host "Validating prerequisites"
$phpOk=$false;$composerOk=$false;$bunOk=$false
if(Get-Command php -ErrorAction SilentlyContinue){ $v=& php -r "echo PHP_MAJOR_VERSION.'.'.PHP_MINOR_VERSION;"; if([version]$v -ge [version]"8.2"){ $phpOk=$true } }
if(Get-Command composer -ErrorAction SilentlyContinue){ $composerOk=$true }
if(Get-Command bun -ErrorAction SilentlyContinue){ $bunOk=$true }
if(Get-Command mysql -ErrorAction SilentlyContinue){ & mysql --version | Out-Null }
Write-Host ("PHP >=8.2: " + ($phpOk))
Write-Host ("Composer: " + ($composerOk))
Write-Host ("Bun: " + ($bunOk))
$backendEnv = Join-Path $backend ".env"
$webEnv = Join-Path $web ".env"
if(!(Test-Path $backendEnv)){ Copy-Item (Join-Path $backend ".env.example") $backendEnv -Force }
if(!(Test-Path $webEnv)){ Copy-Item (Join-Path $web ".env.example") $webEnv -Force }
Set-EnvLine $backendEnv "APP_URL" "http://localhost:8000"
Set-EnvLine $backendEnv "SESSION_DOMAIN" "localhost"
Set-EnvLine $backendEnv "SANCTUM_STATEFUL_DOMAINS" "localhost:5173"
Set-EnvLine $backendEnv "CORS_ALLOWED_ORIGINS" "http://localhost:5173"
Set-EnvLine $backendEnv "DB_HOST" "127.0.0.1"
Set-EnvLine $backendEnv "DB_PORT" "3306"
Set-EnvLine $backendEnv "DB_DATABASE" "pise"
Set-EnvLine $backendEnv "DB_USERNAME" "root"
Set-EnvLine $backendEnv "DB_PASSWORD" "\"\""
Set-EnvLine $webEnv "VITE_API_URL" "http://localhost:8000"
$vendorDir = Join-Path $backend "vendor"
if(!(Test-Path $vendorDir)){
  if(-not $composerOk){ throw "Composer not found" }
  Push-Location $backend
  composer install --no-interaction
  Pop-Location
}
$colKey = Get-EnvValue $backendEnv "COLUMN_ENCRYPTION_KEY"
if([string]::IsNullOrWhiteSpace($colKey)){
  $gen = & php -r "echo 'base64:' . base64_encode(random_bytes(32));"
  Set-EnvLine $backendEnv "COLUMN_ENCRYPTION_KEY" $gen
}
$appKey = Get-EnvValue $backendEnv "APP_KEY"
if([string]::IsNullOrWhiteSpace($appKey)){
  Push-Location $backend
  php artisan key:generate --force
  Pop-Location
}
Push-Location $backend
php artisan migrate --seed --force
try { php artisan storage:link } catch {}
Pop-Location
Write-Host ""
Write-Host "Next steps"
Write-Host ".\\scripts\\windows\\start-backend.ps1"
Write-Host ".\\scripts\\windows\\start-frontend.ps1"
Write-Host ""
Write-Host "Common issues"
Write-Host "- If storage:link fails, run PowerShell as Administrator or enable Windows Developer Mode"
Write-Host "- Ensure MySQL is running and database 'pise' exists"
Write-Host "- Clear caches: php artisan config:clear; php artisan route:clear"
