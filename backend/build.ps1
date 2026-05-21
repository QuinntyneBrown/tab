<#
.SYNOPSIS
  Single-entry build/test/lint/format/migrate script for the Tab backend.
#>
param(
    [Parameter(Position = 0)]
    [ValidateSet('build', 'test', 'lint', 'format', 'migrate', 'restore', 'clean')]
    [string]$Target = 'build',

    [string]$Configuration = 'Debug'
)

$ErrorActionPreference = 'Stop'
$backendRoot = $PSScriptRoot
$sln = Join-Path $backendRoot 'Tab.sln'

function Invoke-Dotnet {
    param([Parameter(ValueFromRemainingArguments)] [string[]]$Args)
    Write-Host "> dotnet $($Args -join ' ')" -ForegroundColor Cyan
    & dotnet @Args
    if ($LASTEXITCODE -ne 0) { throw "dotnet $($Args -join ' ') failed with exit code $LASTEXITCODE" }
}

switch ($Target) {
    'restore' { Invoke-Dotnet restore $sln }
    'build'   { Invoke-Dotnet build $sln -c $Configuration --nologo }
    'test'    { Invoke-Dotnet test $sln -c $Configuration --nologo --no-restore:$false }
    'lint'    { Invoke-Dotnet format $sln --verify-no-changes --severity warn }
    'format'  { Invoke-Dotnet format $sln }
    'clean'   { Invoke-Dotnet clean $sln -c $Configuration }
    'migrate' {
        Invoke-Dotnet ef database update `
            --project (Join-Path $backendRoot 'src/Tab.Infrastructure/Tab.Infrastructure.csproj') `
            --startup-project (Join-Path $backendRoot 'src/Tab.Api/Tab.Api.csproj')
    }
}
