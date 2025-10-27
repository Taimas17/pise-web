$root = (Resolve-Path "$PSScriptRoot/../..").Path
$web = Join-Path $root "web"
$nodeModules = Join-Path $web "node_modules"
if(!(Test-Path $nodeModules)){
  Push-Location $web
  bun install
  Pop-Location
}
Push-Location $web
bun dev
Pop-Location
