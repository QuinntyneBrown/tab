<#
.SYNOPSIS
  Enforces architectural invariants from docs/specs/L2.md:
    L2-040: projects/components imports no HttpClient, no Router, no @tab/api.
    L2-043: Tab.Application handlers depend on ITabDbContext, never TabDbContext.
    L2-044: no IRepository pattern anywhere in src/.
    L2-045: every public C# type has a filename matching its name.
#>
param()

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
$repoRoot = Split-Path -Parent $repoRoot

$violations = @()

function Test-NoMatch {
    param(
        [string]$Root,
        [string]$Filter,
        [string]$Pattern,
        [string]$Description
    )
    if (-not (Test-Path $Root)) { return }
    Get-ChildItem -Path $Root -Filter $Filter -Recurse -File | ForEach-Object {
        $content = Get-Content $_.FullName -Raw
        if ($content -match $Pattern) {
            $script:violations += "[$Description] $($_.FullName)"
        }
    }
}

# L2-040: components lib must not import HttpClient, Router, or @tab/api (api lib).
$componentsLib = Join-Path $repoRoot 'frontend/projects/components/src'
Test-NoMatch -Root $componentsLib -Filter '*.ts' -Pattern "from '@angular/common/http'" -Description 'L2-040 HttpClient in components'
Test-NoMatch -Root $componentsLib -Filter '*.ts' -Pattern "from '@angular/router'"        -Description 'L2-040 Router in components'
Test-NoMatch -Root $componentsLib -Filter '*.ts' -Pattern "from 'api'"                    -Description 'L2-040 api lib in components'

# L2-043: handlers must depend on the ITabDbContext interface, not the concrete TabDbContext.
$applicationLib = Join-Path $repoRoot 'backend/src/Tab.Application'
Test-NoMatch -Root $applicationLib -Filter '*.cs' -Pattern '\bTabDbContext\b(?!\s*[,\)])' -Description 'L2-043 concrete TabDbContext in Application'

# L2-044: no IRepository pattern anywhere under src/.
$backendSrc = Join-Path $repoRoot 'backend/src'
Test-NoMatch -Root $backendSrc -Filter '*.cs' -Pattern '\bI[A-Z]\w*Repository\b' -Description 'L2-044 IRepository found'

# L2-045: every public class/record/interface in src/ has a filename matching its name.
if (Test-Path $backendSrc) {
    Get-ChildItem -Path $backendSrc -Filter '*.cs' -Recurse -File |
        Where-Object { $_.FullName -notmatch '\\obj\\' -and $_.FullName -notmatch '\\bin\\' -and $_.FullName -notmatch '\\Migrations\\' } |
        ForEach-Object {
            $content = Get-Content $_.FullName -Raw
            $expected = [System.IO.Path]::GetFileNameWithoutExtension($_.FullName)
            $types = [regex]::Matches($content, '(?m)^\s*public\s+(?:sealed\s+|abstract\s+|partial\s+|static\s+)?(class|record|interface|struct|enum)\s+([A-Za-z_]\w*)')
            $publicNames = @($types | ForEach-Object { $_.Groups[2].Value } | Select-Object -Unique)
            if ($publicNames.Count -gt 1) {
                $script:violations += "[L2-045] $($_.FullName) declares multiple public types: $($publicNames -join ', ')"
            } elseif ($publicNames.Count -eq 1 -and $publicNames[0] -ne $expected) {
                $script:violations += "[L2-045] $($_.FullName) declares public $($publicNames[0]) which does not match filename $expected"
            }
        }
}

if ($violations.Count -gt 0) {
    Write-Host "Architectural invariant violations:" -ForegroundColor Red
    $violations | ForEach-Object { Write-Host "  $_" }
    exit 1
}

Write-Host "Architectural invariants ok." -ForegroundColor Green
