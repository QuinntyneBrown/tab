<#
.SYNOPSIS
  Enforces L2-051: every test file declares `Traces to: L2-NNN` in its first 10 lines,
  and every referenced L2 id exists in docs/specs/L2.md.
.NOTES
  Exits non-zero with a list of offenders.
#>
param()

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
$repoRoot = Split-Path -Parent $repoRoot

$specPath = Join-Path $repoRoot 'docs/specs/L2.md'
if (-not (Test-Path $specPath)) { throw "L2 spec not found at $specPath" }

$knownIds = @{}
foreach ($match in [regex]::Matches((Get-Content $specPath -Raw), '(?m)^### (L2-\d+)')) {
    $knownIds[$match.Groups[1].Value] = $true
}

$searchRoots = @(
    [pscustomobject]@{ Path = (Join-Path $repoRoot 'backend/tests'); Filter = '*Tests.cs' }
    [pscustomobject]@{ Path = (Join-Path $repoRoot 'e2e/tests');     Filter = '*.spec.ts' }
)

$files = @()
foreach ($root in $searchRoots) {
    if (-not (Test-Path $root.Path)) { continue }
    $files += Get-ChildItem -Path $root.Path -Filter $root.Filter -Recurse -File
}
$files = $files | Sort-Object FullName -Unique

if ($files.Count -eq 0) {
    throw "No test files matched; check globs."
}

$missingHeader = @()
$unknownIds = @{}

foreach ($file in $files) {
    $head = Get-Content -Path $file.FullName -TotalCount 10 -ErrorAction Stop
    $headJoined = ($head -join "`n")
    $match = [regex]::Match($headJoined, 'Traces to:\s*([^\r\n]+)')
    if (-not $match.Success) {
        $missingHeader += $file.FullName
        continue
    }
    $refs = [regex]::Matches($match.Groups[1].Value, 'L2-\d+')
    foreach ($r in $refs) {
        $id = $r.Value
        if (-not $knownIds.ContainsKey($id)) {
            if (-not $unknownIds.ContainsKey($id)) { $unknownIds[$id] = @() }
            $unknownIds[$id] += $file.FullName
        }
    }
}

$failed = $false
if ($missingHeader.Count -gt 0) {
    $failed = $true
    Write-Host "Missing 'Traces to:' header in:" -ForegroundColor Red
    $missingHeader | ForEach-Object { Write-Host "  $_" }
}
if ($unknownIds.Count -gt 0) {
    $failed = $true
    Write-Host "Unknown L2 ids referenced:" -ForegroundColor Red
    foreach ($id in $unknownIds.Keys) {
        Write-Host "  $id"
        $unknownIds[$id] | ForEach-Object { Write-Host "    in $_" }
    }
}

if ($failed) {
    exit 1
}

Write-Host "Traceability check passed: $($files.Count) files, all L2 ids known." -ForegroundColor Green
