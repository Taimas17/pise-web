$base = 'http://localhost:8000'
$s = New-Object Microsoft.PowerShell.Commands.WebRequestSession

Write-Output "Fetching CSRF cookie..."
Invoke-WebRequest -Uri "$base/sanctum/csrf-cookie" -WebSession $s -UseBasicParsing -Method GET | Out-Null

# Extract XSRF-TOKEN cookie
$cookies = $s.Cookies.GetCookies($base)
$xsrfCookie = $cookies | Where-Object { $_.Name -eq 'XSRF-TOKEN' }
$xsrf = $null
if ($xsrfCookie -ne $null) { $xsrf = [System.Uri]::UnescapeDataString($xsrfCookie.Value) }

$headers = @{ 'Accept' = 'application/json' }
if ($xsrf) { $headers['X-XSRF-TOKEN'] = $xsrf }

Write-Output "Logging in as admin@pise.local..."
try {
    $user = Invoke-RestMethod -Uri "$base/api/auth/login" -Method POST -Body @{email='admin@pise.local'; password='password'} -WebSession $s -UseBasicParsing -Headers $headers
    Write-Output "Login OK: $($user.name) <$($user.email)>"
} catch {
    Write-Output "Login failed: $($_.Exception.Message)"
    if ($_.Exception.Response -ne $null) {
        $respStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($respStream)
        Write-Output $reader.ReadToEnd()
    }
    exit 1
}

$endpoints = @(
    '/api/zones',
    '/api/infrastructure-types',
    '/api/reports',
    '/api/reports/stats'
)

foreach ($ep in $endpoints) {
    $url = "$base$ep"
    Write-Output "\n=== GET $ep ==="
    try {
        $r = Invoke-WebRequest -Uri $url -WebSession $s -UseBasicParsing -Method GET -ErrorAction Stop -Headers @{ 'Accept' = 'application/json' }
        Write-Output "Status: $($r.StatusCode)"
        $content = $r.Content
        if ($content.Length -gt 2000) {
            Write-Output "Body (truncated 2000 chars):"
            Write-Output $content.Substring(0,2000)
        } else {
            Write-Output "Body:"
            Write-Output $content
        }
    } catch {
        Write-Output "Request failed: $($_.Exception.Message)"
        if ($_.Exception.Response -ne $null) {
            $respStream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($respStream)
            $body = $reader.ReadToEnd()
            Write-Output "Response body:";
            Write-Output $body
        }
    }
}

Write-Output "\nAll endpoints tested."
