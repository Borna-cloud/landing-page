$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

$port = 5174

Write-Host "Starting Mortgage Strategy Website at http://localhost:$port"
Write-Host "Press Ctrl+C to stop the server."

if (Get-Command node -ErrorAction SilentlyContinue) {
  node "$PSScriptRoot/server.mjs" $port
} else {
  throw "Node.js was not found. You can still open index.html directly in your browser."
}
