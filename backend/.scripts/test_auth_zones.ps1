$s = New-Object Microsoft.PowerShell.Commands.WebRequestSession
Invoke-RestMethod -Uri 'http://127.0.0.1:8000/api/auth/login' -Method POST -Body @{email='admin@pise.local'; password='password'} -WebSession $s -UseBasicParsing
$response = Invoke-RestMethod -Uri 'http://127.0.0.1:8000/api/zones' -WebSession $s -UseBasicParsing
$response | ConvertTo-Json -Depth 4
