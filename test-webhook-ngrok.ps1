# Call this script in a PowerShell terminal to route app through ngrok.
# Usage:
#   ./test-webhook-ngrok.ps1                     # reads NGROK_HOST from .env.local or .env
#   ./test-webhook-ngrok.ps1 -HostName foo.ngrok-free.dev
# Then initialize ngrok in another Powershell terminal

param(
    [string]$HostName
)

function Get-DotEnvValue {
    param(
        [string]$Key,
        [string[]]$CandidateFiles
    )

    foreach ($file in $CandidateFiles) {
        if (-not (Test-Path $file)) { continue }
        foreach ($line in Get-Content $file) {
            if ($line -match '^\s*#' -or $line -match '^\s*$') { continue }
            $parts = $line -split '=', 2
            if ($parts.Length -ne 2) { continue }
            $name = $parts[0].Trim()
            if ($name -ne $Key) { continue }
            $rawValue = $parts[1].Trim()
            # Strip optional surrounding quotes
            if (($rawValue.StartsWith('"') -and $rawValue.EndsWith('"')) -or
                ($rawValue.StartsWith("'") -and $rawValue.EndsWith("'"))) {
                $rawValue = $rawValue.Substring(1, $rawValue.Length - 2)
            }
            return $rawValue
        }
    }

    return $null
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$candidateEnvFiles = @(
    [System.IO.Path]::Combine($scriptDir, ".env.local"),
    [System.IO.Path]::Combine($scriptDir, ".env")
)

if (-not $HostName) {
    $HostName = $env:NGROK_HOST
}
if (-not $HostName) {
    $HostName = Get-DotEnvValue -Key "NGROK_HOST" -CandidateFiles $candidateEnvFiles
}

if (-not $HostName) {
    Write-Error "Unable to determine ngrok hostname. Pass -HostName, set NGROK_HOST env var, or add it to .env.local."
    exit 1
}

$env:__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS = $HostName

try {
    npm run dev:ssr
} finally {
    Remove-Item Env:__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS -ErrorAction SilentlyContinue
}
