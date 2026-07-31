# Run Android from C:\bfa junction (short path) to fix Windows 260-char limit.
# Usage:  .\scripts\run-android-short-path.ps1

$longPath  = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$shortPath = "C:\bfa"

# Create junction C:\bfa -> project root (no admin needed)
if (-not (Test-Path $shortPath)) {
  cmd /c mklink /J $shortPath $longPath
  Write-Host "Created junction: $shortPath -> $longPath"
} else {
  Write-Host "Using junction: $shortPath"
}

Write-Host "Building from $shortPath\source ..."
Write-Host ""

Set-Location "$shortPath\source"

# Clean stale native build cache from long path
if (Test-Path "android\app\.cxx") {
  Remove-Item -Recurse -Force "android\app\.cxx"
}

npx react-native run-android
