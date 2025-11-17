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

# Verify authenticated me
Write-Output "Calling /api/auth/me (should return user)..."
try {
    $me = Invoke-RestMethod -Uri "$base/api/auth/me" -Method GET -WebSession $s -UseBasicParsing -Headers @{ 'Accept' = 'application/json' }
    Write-Output "/api/auth/me returned: $($me.email)"
} catch {
    Write-Output "/api/auth/me failed before logout: $($_.Exception.Message)"
}

# Call logout
Write-Output "Calling POST /api/auth/logout..."
try {
    $resp = Invoke-RestMethod -Uri "$base/api/auth/logout" -Method POST -WebSession $s -UseBasicParsing -Headers @{ 'Accept' = 'application/json'; 'X-XSRF-TOKEN' = $xsrf }
    Write-Output "Logout response: $(ConvertTo-Json $resp -Depth 3)"
} catch {
    Write-Output "Logout failed: $($_.Exception.Message)"
    if ($_.Exception.Response -ne $null) {
        $respStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($respStream)
        Write-Output $reader.ReadToEnd()
    }
}

# Verify authenticated me after logout
Write-Output "Calling /api/auth/me after logout (should be 401)..."
try {
    $me2 = Invoke-RestMethod -Uri "$base/api/auth/me" -Method GET -WebSession $s -UseBasicParsing -Headers @{ 'Accept' = 'application/json' }
    Write-Output "/api/auth/me after logout returned: $($me2 | ConvertTo-Json -Depth 3)"
} catch {
    Write-Output "/api/auth/me after logout failed as expected: $($_.Exception.Message)"
    if ($_.Exception.Response -ne $null) {
        $respStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($respStream)
        $body = $reader.ReadToEnd()
        Write-Output "Response body:"
        Write-Output $body
    }
}
