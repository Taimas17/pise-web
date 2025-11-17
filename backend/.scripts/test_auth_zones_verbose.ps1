$s = New-Object Microsoft.PowerShell.Commands.WebRequestSession
# Use hostname that matches SESSION_DOMAIN and SANCTUM_STATEFUL_DOMAINS in .env
$base = 'http://localhost:8000'
Invoke-WebRequest -Uri "$base/sanctum/csrf-cookie" -WebSession $s -UseBasicParsing -Method GET | Out-Null

# Extract XSRF-TOKEN cookie and send as header (like browser/axios does)
$cookies = $s.Cookies.GetCookies('http://127.0.0.1:8000')
$xsrfCookie = $cookies | Where-Object { $_.Name -eq 'XSRF-TOKEN' }
$xsrf = $null
if ($xsrfCookie -ne $null) { $xsrf = [System.Uri]::UnescapeDataString($xsrfCookie.Value) }

# Perform login using the same session (cookies set by csrf-cookie) and include X-XSRF-TOKEN header
$headers = @{}
if ($xsrf) { $headers['X-XSRF-TOKEN'] = $xsrf }
$headers['Accept'] = 'application/json'

Invoke-RestMethod -Uri "$base/api/auth/login" -Method POST -Body @{email='admin@pise.local'; password='password'} -WebSession $s -UseBasicParsing -Headers $headers

try {
	$r = Invoke-WebRequest -Uri "$base/api/zones" -WebSession $s -UseBasicParsing -Method GET -ErrorAction Stop
	Write-Output "Status: $($r.StatusCode)"
	Write-Output $r.Content
} catch {
	Write-Output "Request failed with exception: $($_.Exception.Message)"
	if ($_.Exception.Response -ne $null) {
		$respStream = $_.Exception.Response.GetResponseStream()
		$reader = New-Object System.IO.StreamReader($respStream)
		$body = $reader.ReadToEnd()
		Write-Output "Response body:";
		Write-Output $body
	} else {
		Write-Output "No response body available on exception."
	}
}
