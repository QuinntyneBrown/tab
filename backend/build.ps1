<#
.SYNOPSIS
  Single-entry build/test/lint/format/migrate/e2e script for the Tab solution.
#>
param(
    [Parameter(Position = 0)]
    [ValidateSet('build', 'test', 'lint', 'lint:fe', 'format', 'migrate', 'restore', 'clean', 'e2e', 'perf', 'traces', 'invariants', 'ship')]
    [string]$Target = 'build',

    [string]$Configuration = 'Debug',

    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$Rest
)

$ErrorActionPreference = 'Stop'
$backendRoot = $PSScriptRoot
$repoRoot = Split-Path -Parent $backendRoot
$frontendRoot = Join-Path $repoRoot 'frontend'
$e2eRoot = Join-Path $repoRoot 'e2e'
$sln = Join-Path $backendRoot 'Tab.sln'

function Invoke-Dotnet {
    param([Parameter(ValueFromRemainingArguments)] [string[]]$Args)
    Write-Host "> dotnet $($Args -join ' ')" -ForegroundColor Cyan
    & dotnet @Args
    if ($LASTEXITCODE -ne 0) { throw "dotnet $($Args -join ' ') failed with exit code $LASTEXITCODE" }
}

function Wait-Endpoint {
    param(
        [string]$Url,
        [int]$TimeoutSeconds = 120
    )
    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        try {
            $resp = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
            if ($resp.StatusCode -lt 500) { return $true }
        } catch { Start-Sleep -Seconds 2 }
    }
    throw "Endpoint $Url did not respond within $TimeoutSeconds seconds"
}

function Stop-ProcessTree {
    param([System.Diagnostics.Process]$Process)
    if (-not $Process) { return }
    if ($Process.HasExited) { return }
    try {
        & taskkill /PID $Process.Id /T /F | Out-Null
    } catch { }
}

switch ($Target) {
    'restore' { Invoke-Dotnet restore $sln }
    'build'   { Invoke-Dotnet build $sln -c $Configuration --nologo }
    'test'    { Invoke-Dotnet test $sln -c $Configuration --nologo --no-restore:$false }
    'lint'    { Invoke-Dotnet format $sln --verify-no-changes --severity warn }
    'traces'  {
        & pwsh -NoProfile -File (Join-Path $backendRoot 'Scripts/Verify-Traces.ps1')
        if ($LASTEXITCODE -ne 0) { throw "Verify-Traces.ps1 failed" }
    }
    'invariants' {
        & pwsh -NoProfile -File (Join-Path $backendRoot 'Scripts/Verify-Invariants.ps1')
        if ($LASTEXITCODE -ne 0) { throw "Verify-Invariants.ps1 failed" }
    }
    'perf'    {
        $perfCsproj = Join-Path $backendRoot 'tests/perf/Tab.Perf.csproj'
        Invoke-Dotnet run --no-launch-profile --project $perfCsproj -c Release
    }
    'lint:fe' {
        Push-Location $frontendRoot
        try {
            & npx tsx (Join-Path $frontendRoot 'projects/api/scripts/check-public-surface.ts')
            if ($LASTEXITCODE -ne 0) { throw "check-public-surface.ts failed" }
            & npx tsx (Join-Path $frontendRoot 'projects/tab/scripts/check-app-structure.ts')
            if ($LASTEXITCODE -ne 0) { throw "check-app-structure.ts failed" }
        } finally {
            Pop-Location
        }
    }
    'ship' {
        Invoke-Dotnet build $sln -c $Configuration --nologo
        Invoke-Dotnet test  $sln -c $Configuration --nologo --no-restore:$false
        Invoke-Dotnet format $sln --verify-no-changes --severity warn
        & pwsh -NoProfile -File (Join-Path $backendRoot 'Scripts/Verify-Traces.ps1')
        if ($LASTEXITCODE -ne 0) { throw "Verify-Traces.ps1 failed" }
        & pwsh -NoProfile -File (Join-Path $backendRoot 'Scripts/Verify-Invariants.ps1')
        if ($LASTEXITCODE -ne 0) { throw "Verify-Invariants.ps1 failed" }
        Push-Location $frontendRoot
        try {
            & npx tsx (Join-Path $frontendRoot 'projects/api/scripts/check-public-surface.ts')
            if ($LASTEXITCODE -ne 0) { throw "check-public-surface.ts failed" }
            & npx tsx (Join-Path $frontendRoot 'projects/tab/scripts/check-app-structure.ts')
            if ($LASTEXITCODE -ne 0) { throw "check-app-structure.ts failed" }
            & npx ng build api
            if ($LASTEXITCODE -ne 0) { throw "ng build api failed" }
            & npx ng build components
            if ($LASTEXITCODE -ne 0) { throw "ng build components failed" }
            & npx ng build tab
            if ($LASTEXITCODE -ne 0) { throw "ng build tab failed" }
        } finally {
            Pop-Location
        }
        Write-Host "ship: green." -ForegroundColor Green
    }
    'format'  { Invoke-Dotnet format $sln }
    'clean'   { Invoke-Dotnet clean $sln -c $Configuration }
    'migrate' {
        Invoke-Dotnet ef database update `
            --project (Join-Path $backendRoot 'src/Tab.Infrastructure/Tab.Infrastructure.csproj') `
            --startup-project (Join-Path $backendRoot 'src/Tab.Api/Tab.Api.csproj')
    }
    'e2e' {
        $apiCsproj = Join-Path $backendRoot 'src/Tab.Api/Tab.Api.csproj'
        $cliCsproj = Join-Path $backendRoot 'src/Tab.Cli/Tab.Cli.csproj'
        $apiUrl = 'http://localhost:5147'
        $ngUrl = 'http://localhost:4200'

        Write-Host "> Applying migrations + seeding demo users" -ForegroundColor Cyan
        Invoke-Dotnet run --no-launch-profile --project $cliCsproj -- db migrate
        Invoke-Dotnet run --no-launch-profile --project $cliCsproj -- users seed

        Write-Host "> Starting API at $apiUrl" -ForegroundColor Cyan
        $apiProcess = Start-Process -PassThru -FilePath 'dotnet' `
            -ArgumentList @('run','--no-launch-profile','--project', $apiCsproj, '--urls', $apiUrl) `
            -WorkingDirectory $backendRoot

        $ngProcess = $null
        try {
            Write-Host "> Waiting for API to come up" -ForegroundColor Cyan
            Wait-Endpoint "$apiUrl/swagger/v1/swagger.json" -TimeoutSeconds 180

            Write-Host "> Starting Angular dev server at $ngUrl" -ForegroundColor Cyan
            $ngProcess = Start-Process -PassThru -FilePath 'npm' `
                -ArgumentList @('start') `
                -WorkingDirectory $frontendRoot

            Wait-Endpoint $ngUrl -TimeoutSeconds 240

            Write-Host "> Running Playwright tests" -ForegroundColor Cyan
            Push-Location $e2eRoot
            try {
                $env:E2E_BASE_URL = $ngUrl
                $pwArgs = @('test') + ($Rest | ForEach-Object { $_ })
                & npx playwright @pwArgs
                if ($LASTEXITCODE -ne 0) { throw "playwright test failed with exit code $LASTEXITCODE" }
            } finally {
                Pop-Location
            }
        } finally {
            Stop-ProcessTree -Process $ngProcess
            Stop-ProcessTree -Process $apiProcess
        }
    }
}
