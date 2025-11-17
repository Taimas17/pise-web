$base = 'http://localhost:8000'
$s = New-Object Microsoft.PowerShell.Commands.WebRequestSession

function Dump-Cookies($session, $uri) {
    $cookies = $session.Cookies.GetCookies($uri) | ForEach-Object { "{0}={1}; Domain={2}; Path={3}; HttpOnly={4}; Secure={5}" -f $_.Name, $_.Value, $_.Domain, $_.Path, $_.HttpOnly, $_.Secure }
    if ($cookies) { $cookies } else { "<no cookies>" }
}

function Dump-Response($resp) {
    Write-Output "Status: $($resp.StatusCode)"
    Write-Output "Headers:"; $resp.Headers | ForEach-Object { "$($_.Name): $($_.Value)" }
    if ($resp.RawContentLength -ne $null) { Write-Output "Content-Length: $($resp.RawContentLength)" }
    try { $body = $resp.Content; if ($body) { Write-Output "Body:`n$body" } } catch {}
}

Write-Output "--- CSRF cookie (GET /sanctum/csrf-cookie) ---"
$csrfResp = Invoke-WebRequest -Uri "$base/sanctum/csrf-cookie" -Method GET -WebSession $s -UseBasicParsing -ErrorAction Stop
Dump-Response $csrfResp
Write-Output "Cookies after CSRF:"; Dump-Cookies $s $base

Write-Output "`n--- GET /api/health ---"
$h = Invoke-WebRequest -Uri "$base/api/health" -Method GET -WebSession $s -UseBasicParsing -ErrorAction Stop
Dump-Response $h

# Extract XSRF-TOKEN cookie value (unescape)
$xsrf = $null
$cookie = $s.Cookies.GetCookies($base) | Where-Object { $_.Name -eq 'XSRF-TOKEN' }
if ($cookie) { $xsrf = [System.Uri]::UnescapeDataString($cookie.Value) }
Write-Output "XSRF token: $xsrf"

Write-Output "`n--- POST /api/auth/login ---"
$loginPayload = @{ email = 'admin@pise.local'; password = 'password' }
$loginHeaders = @{ 'Accept' = 'application/json' }
if ($xsrf) { $loginHeaders['X-XSRF-TOKEN'] = $xsrf }
try {
    $loginResp = Invoke-WebRequest -Uri "$base/api/auth/login" -Method POST -Body $loginPayload -WebSession $s -UseBasicParsing -Headers $loginHeaders -ErrorAction Stop
    Dump-Response $loginResp
} catch {
    Write-Output "Login failed: $($_.Exception.Message)"
    if ($_.Exception.Response) { Dump-Response $_.Exception.Response }
    exit 1
}
Write-Output "Cookies after login:"; Dump-Cookies $s $base

Write-Output "`n--- GET /api/auth/me (authenticated) ---"
$meHeaders = @{ 'Accept' = 'application/json' }
$me = Invoke-WebRequest -Uri "$base/api/auth/me" -Method GET -WebSession $s -UseBasicParsing -Headers $meHeaders -ErrorAction Stop
Dump-Response $me

Write-Output "`n--- POST /api/auth/logout ---"
$logoutHeaders = @{ 'Accept'='application/json' }
if ($xsrf) { $logoutHeaders['X-XSRF-TOKEN'] = $xsrf }
try {
    $lo = Invoke-WebRequest -Uri "$base/api/auth/logout" -Method POST -WebSession $s -UseBasicParsing -Headers $logoutHeaders -ErrorAction Stop
    Dump-Response $lo
} catch {
    Write-Output "Logout failed: $($_.Exception.Message)"
    if ($_.Exception.Response) { Dump-Response $_.Exception.Response }
}
Write-Output "Cookies after logout:"; Dump-Cookies $s $base

Write-Output "`n--- GET /api/auth/me (after logout) ---"
try {
    $me2 = Invoke-WebRequest -Uri "$base/api/auth/me" -Method GET -WebSession $s -UseBasicParsing -Headers @{ 'Accept'='application/json' } -ErrorAction Stop
    Dump-Response $me2
} catch {
    Write-Output "Expected unauthenticated response: $($_.Exception.Message)"
    if ($_.Exception.Response) { Dump-Response $_.Exception.Response }
}
