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
        $apiProjDir = Join-Path $backendRoot 'src/Tab.Api'
        $cliProjDir = Join-Path $backendRoot 'src/Tab.Cli'
        $apiCsproj = Join-Path $apiProjDir 'Tab.Api.csproj'
        $cliCsproj = Join-Path $cliProjDir 'Tab.Cli.csproj'
        $apiUrl = 'http://localhost:5147'
        $ngUrl = 'http://localhost:4200'

        # Use the E2E environment everywhere — appsettings.E2E.json switches the
        # DB provider to SQLite so the harness doesn't need LocalDB / SQL Server.
        $env:ASPNETCORE_ENVIRONMENT = 'E2E'
        $env:DOTNET_ENVIRONMENT = 'E2E'

        # Point the CLI and the API at the same absolute SQLite file so seeding
        # and serving don't end up on different relative-path databases.
        $e2eDbPath = Join-Path $backendRoot 'tab-e2e.db'
        $e2eConn = "Data Source=$e2eDbPath"
        $env:ConnectionStrings__Tab = $e2eConn      # Picked up by Tab.Api (WebApplication.CreateBuilder).
        $env:TAB_ConnectionStrings__Tab = $e2eConn  # Picked up by Tab.Cli (env-var prefix TAB_).

        Write-Host "> Applying migrations + seeding demo users + ledger" -ForegroundColor Cyan
        Push-Location $cliProjDir
        try {
            Invoke-Dotnet run --no-launch-profile --project $cliCsproj -- db migrate
            Invoke-Dotnet run --no-launch-profile --project $cliCsproj -- users seed
            # Seed the primary fixture user's ledger with the mock-faithful
            # entries DemoDatabaseSeeder produces so visual.spec.ts can compare
            # the live render against docs/mocks/*.html on the same data.
            Invoke-Dotnet run --no-launch-profile --project $cliCsproj -- db seed --user quinntynebrown@gmail.com
        } finally {
            Pop-Location
        }

        Write-Host "> Starting API at $apiUrl" -ForegroundColor Cyan
        $apiProcess = Start-Process -PassThru -FilePath 'dotnet' `
            -ArgumentList @('run','--no-launch-profile','--project', $apiCsproj, '--urls', $apiUrl) `
            -WorkingDirectory $apiProjDir

        $ngProcess = $null
        try {
            Write-Host "> Waiting for API to come up" -ForegroundColor Cyan
            Wait-Endpoint "$apiUrl/swagger/v1/swagger.json" -TimeoutSeconds 180

            Write-Host "> Starting Angular dev server at $ngUrl" -ForegroundColor Cyan
            # `Start-Process -FilePath 'npm'` doesn't resolve npm.cmd on Windows
            # (Win32 process launch ignores PATHEXT). Spawn via cmd /c so the
            # .cmd extension is found, and so taskkill /T can still walk the
            # child tree when we stop the server.
            $ngProcess = Start-Process -PassThru -FilePath 'cmd' `
                -ArgumentList @('/c','npm','start') `
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
