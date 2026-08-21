#=========================================================
# DashboardDataGenerator.ps1
# MODULE 1
#=========================================================

$ErrorActionPreference = "Stop"

#---------------------------------------------------------
# Paths
#---------------------------------------------------------

$BaseFolder = Split-Path -Parent $MyInvocation.MyCommand.Path

$CsvFile = Join-Path $BaseFolder "data.csv"

$OutputJS = Join-Path $BaseFolder "dashboardData.js"

#---------------------------------------------------------
# Check CSV
#---------------------------------------------------------

if(!(Test-Path $CsvFile))
{
    Write-Host ""
    Write-Host "CSV file not found."
    Write-Host $CsvFile
    pause
    exit
}

#---------------------------------------------------------
# Read CSV
#---------------------------------------------------------

$Rows = Import-Csv $CsvFile


Write-Host ""
Write-Host "===== FIRST ROW VALUES ====="

$Rows[0].PSObject.Properties | ForEach-Object {
    Write-Host "$($_.Name) = [$($_.Value)]"
}

Write-Host ""
Pause


if($Rows.Count -eq 0)
{
    Write-Host "CSV contains no records."
    pause
    exit
}

Write-Host ""
Write-Host "CSV Loaded Successfully"
Write-Host "Records : $($Rows.Count)"

#---------------------------------------------------------
# Column Mapping
#---------------------------------------------------------

$Col = @{

    HOF = "HOF"

    Member = "Family Members"

    Relationship = "Relationship"

    Leikai = "Leikai"

    FreeWill = "FreeWill"

    FaithPromise = "FaithPromise"

    Phase1 = "Phase 1"

    Phase2 = "Phase 2"

    Phase3 = "Phase 3 (50%)"

    Phase4 = "Phase 4 (50%)"

    Phase5 = "Phase 5 (40%)"

    PhaseA = "Phase A"

    PhaseB = "Phase B"

    PhaseC = "Phase C (50%)"

    PhaseD = "Phase D (50%)"

    PhaseE = "Phase E (Cate. A/B)"

    Windows = "Windows"

    CPC = "CPC Subscription"

    Pillars = "Pillars"

    Tiles = "Tiles"

    SavingBox = "Saving Box"

}

#---------------------------------------------------------
# Number Converter
#---------------------------------------------------------

function NumberValue($Value)
{
    if([string]::IsNullOrWhiteSpace($Value))
    {
        return 0
    }

    $Value = $Value.ToString().Replace(",","").Trim()

    try
    {
        return [decimal]$Value
    }
    catch
    {
        return 0
    }
}

Write-Host ""
Write-Host "Module 1 completed successfully."

#=========================================================
# MODULE 2
# Build Family Collection
#=========================================================

Write-Host ""
Write-Host "Building family collection..."

$Families = @()

$currentFamily = $null

foreach($row in $Rows)

{
	Write-Host "HOF=[$($row.($Col.HOF))]  Member=[$($row.($Col.Member))]"

    $hof = ($row.($Col.HOF)).Trim()

    #-----------------------------------------------------
    # New family starts whenever HOF column has a value
    #-----------------------------------------------------

    if($hof -ne "")
    {
        $currentFamily = [PSCustomObject]@{

            Head       = $hof

            Leikai     = ($row.($Col.Leikai)).Trim()

            Members    = @()

            SavingBox  = 0

            Tiles      = 0

            Total      = 0

        }

        $Families += $currentFamily
    }

    if($null -eq $currentFamily)
    {
        continue
    }

    #-----------------------------------------------------
    # Store original CSV row
    #-----------------------------------------------------

    $currentFamily.Members += $row
}

#---------------------------------------------------------
# Calculate family information
#---------------------------------------------------------

$totalFamilies = $Families.Count
$totalMembers  = 0

foreach($family in $Families)
{
	
   $familyMemberCount = $family.Members.Count

    $totalMembers += $familyMemberCount

    
    foreach($member in $family.Members)
    {
        $family.SavingBox += NumberValue $member.($Col.SavingBox)

        $family.Tiles += NumberValue $member.($Col.Tiles)

        $memberTotal = 0

$memberTotal += NumberValue $member.($Col.FreeWill)
$memberTotal += NumberValue $member.($Col.FaithPromise)

$memberTotal += NumberValue $member.($Col.Phase1)
$memberTotal += NumberValue $member.($Col.Phase2)
$memberTotal += NumberValue $member.($Col.Phase3)
$memberTotal += NumberValue $member.($Col.Phase4)
$memberTotal += NumberValue $member.($Col.Phase5)

$memberTotal += NumberValue $member.($Col.PhaseA)
$memberTotal += NumberValue $member.($Col.PhaseB)
$memberTotal += NumberValue $member.($Col.PhaseC)
$memberTotal += NumberValue $member.($Col.PhaseD)
$memberTotal += NumberValue $member.($Col.PhaseE)

$memberTotal += NumberValue $member.($Col.Windows)
$memberTotal += NumberValue $member.($Col.CPC)
$memberTotal += NumberValue $member.($Col.Pillars)

$memberTotal += NumberValue $member.($Col.Tiles)
$memberTotal += NumberValue $member.($Col.SavingBox)

$family.Total += $memberTotal
    
	Write-Host "$($member.($Col.Member)) = $memberTotal"
	}
    # Save member count as a property for later use
    $family | Add-Member -NotePropertyName MemberCount -NotePropertyValue $familyMemberCount -Force
}

Write-Host ""
Write-Host "Families : $totalFamilies"
Write-Host "Members  : $totalMembers"

Write-Host ""
Write-Host "First family preview:"
Write-Host "Head      : $($Families[0].Head)"
Write-Host "Leikai    : $($Families[0].Leikai)"
Write-Host "Members   : $($Families[0].MemberCount)"
Write-Host "Total     : $($Families[0].Total)"
Write-Host "SavingBox : $($Families[0].SavingBox)"
Write-Host "Tiles     : $($Families[0].Tiles)"


#=========================================================
# MODULE 3
# Calculate Dashboard Totals
#=========================================================

Write-Host ""
Write-Host "Calculating dashboard totals..."

#---------------------------------------------------------
# Dashboard Object
#---------------------------------------------------------

$dashboard = [ordered]@{

    totalFamilies = 0

    totalMembers = 0

    grandTotal = 0

    freeWill = 0

    faithPromise = 0

    employeeSubscription = 0

    nonEmployeeSubscription = 0
	
	phase1 = 0
phase2 = 0
phase3 = 0
phase4 = 0
phase5 = 0

phaseA = 0
phaseB = 0
phaseC = 0
phaseD = 0
phaseE = 0

    windows = 0

    cpc = 0

    pillars = 0

    tiles = 0

    savingBox = 0

    families = @()

}

#---------------------------------------
# Dashboard Counts
#---------------------------------------

$dashboard.totalFamilies = $Families.Count

$dashboard.totalMembers = $totalMembers

foreach($family in $Families)
{
   

    foreach($member in $family.Members)
    {
		
        $dashboard.freeWill     += NumberValue $member.($Col.FreeWill)
        $dashboard.faithPromise += NumberValue $member.($Col.FaithPromise)
		

$dashboard.employeeSubscription =
    $dashboard.phase1 +
    $dashboard.phase2 +
    $dashboard.phase3 +
    $dashboard.phase4 +
    $dashboard.phase5

$dashboard.nonEmployeeSubscription =
    $dashboard.phaseA +
    $dashboard.phaseB +
    $dashboard.phaseC +
    $dashboard.phaseD +
    $dashboard.phaseE
	
	
		$dashboard.nonEmployeeSubscription +=
    NumberValue $member.'Phase A' +
    NumberValue $member.'Phase B' +
    NumberValue $member.'Phase C (50%)' +
    NumberValue $member.'Phase D (50%)' +
    NumberValue $member.'Phase E (Cate. A/B)'
	
        $dashboard.phase1 += NumberValue $member.($Col.Phase1)
        $dashboard.phase2 += NumberValue $member.($Col.Phase2)
        $dashboard.phase3 += NumberValue $member.($Col.Phase3)
        $dashboard.phase4 += NumberValue $member.($Col.Phase4)
        $dashboard.phase5 += NumberValue $member.($Col.Phase5)

        $dashboard.phaseA += NumberValue $member.($Col.PhaseA)
        $dashboard.phaseB += NumberValue $member.($Col.PhaseB)
        $dashboard.phaseC += NumberValue $member.($Col.PhaseC)
        $dashboard.phaseD += NumberValue $member.($Col.PhaseD)
        $dashboard.phaseE += NumberValue $member.($Col.PhaseE)

        $dashboard.windows += NumberValue $member.($Col.Windows)
        $dashboard.cpc      += NumberValue $member.($Col.CPC)
        $dashboard.pillars  += NumberValue $member.($Col.Pillars)

        $dashboard.tiles     += NumberValue $member.($Col.Tiles)
        $dashboard.savingBox += NumberValue $member.($Col.SavingBox)
    	
	Write-Host "$($family.Head) : $($family.Total)"
	}
	
    $dashboard.grandTotal =
    $dashboard.freeWill +
    $dashboard.faithPromise +

    $dashboard.phase1 +
    $dashboard.phase2 +
    $dashboard.phase3 +
    $dashboard.phase4 +
    $dashboard.phase5 +

    $dashboard.phaseA +
    $dashboard.phaseB +
    $dashboard.phaseC +
    $dashboard.phaseD +
    $dashboard.phaseE +

    $dashboard.windows +
    $dashboard.cpc +
    $dashboard.pillars +

    $dashboard.tiles +
    $dashboard.savingBox
}

#---------------------------------------------------------
# Build Family List
#---------------------------------------------------------

foreach($family in $Families)
{
    $dashboard.families += [ordered]@{

        leikai = $family.Leikai

        head = $family.Head

        members = $family.MemberCount

        savingBox = $family.SavingBox

        tiles = $family.Tiles

        total = $family.Total

    }
}

#---------------------------------------------------------
# Display Totals
#---------------------------------------------------------

Write-Host ""
Write-Host "============= DASHBOARD TOTALS ============="

Write-Host ("Families       : {0}" -f $dashboard.totalFamilies)
Write-Host ("Members        : {0}" -f $dashboard.totalMembers)

Write-Host ("Free Will      : {0}" -f $dashboard.freeWill)
Write-Host ("Faith Promise  : {0}" -f $dashboard.faithPromise)

Write-Host ("Phase 1        : {0}" -f $dashboard.phase1)
Write-Host ("Phase 2        : {0}" -f $dashboard.phase2)
Write-Host ("Phase 3        : {0}" -f $dashboard.phase3)
Write-Host ("Phase 4        : {0}" -f $dashboard.phase4)
Write-Host ("Phase 5        : {0}" -f $dashboard.phase5)

Write-Host ("Phase A        : {0}" -f $dashboard.phaseA)
Write-Host ("Phase B        : {0}" -f $dashboard.phaseB)
Write-Host ("Phase C        : {0}" -f $dashboard.phaseC)
Write-Host ("Phase D        : {0}" -f $dashboard.phaseD)
Write-Host ("Phase E        : {0}" -f $dashboard.phaseE)

Write-Host ("Windows        : {0}" -f $dashboard.windows)
Write-Host ("CPC            : {0}" -f $dashboard.cpc)
Write-Host ("Pillars        : {0}" -f $dashboard.pillars)

Write-Host ("Tiles          : {0}" -f $dashboard.tiles)
Write-Host ("Saving Box     : {0}" -f $dashboard.savingBox)

Write-Host ("Grand Total    : {0}" -f $dashboard.grandTotal)

Write-Host ""

Write-Host "Employee Subscription     : $($dashboard.employeeSubscription)"

Write-Host "Non-Employee Subscription : $($dashboard.nonEmployeeSubscription)"



#=========================================================
# MODULE 4
# Generate dashboardData.js
#=========================================================

Write-Host ""
Write-Host "Generating dashboardData.js..."

#---------------------------------------------------------
# Convert Dashboard Object to JSON
#---------------------------------------------------------

$json = $dashboard | ConvertTo-Json -Depth 10

#---------------------------------------------------------
# Create JavaScript
#---------------------------------------------------------

$js = @"
//=========================================================
// AUTO GENERATED
// Do not edit manually
//=========================================================

const dashboardData =

$json;

"@

#---------------------------------------------------------
# Save File
#---------------------------------------------------------

Set-Content `
    -Path $OutputJS `
    -Value $js `
    -Encoding UTF8

Write-Host ""
Write-Host "dashboardData.js generated successfully."

Write-Host ""
Write-Host "Location:"
Write-Host $OutputJS

Write-Host ""
Write-Host "Families : $($dashboard.totalFamilies)"
Write-Host "Members  : $($dashboard.totalMembers)"
Write-Host "Grand Total : $($dashboard.grandTotal)"

pause

#=========================================================
# MODULE 4
# Generate dashboardData.js
#=========================================================

Write-Host ""
Write-Host "Generating dashboardData.js..."

#---------------------------------------------------------
# Build Family Array
#---------------------------------------------------------

$dashboard.families = @()

foreach($family in $Families)
{
    $dashboard.families += [ordered]@{

        leikai = $family.Leikai

        head = $family.Head

        members = $family.MemberCount

        savingBox = $family.SavingBox

        tiles = $family.Tiles

        total = $family.Total

    }
	
	$dashboard.memberDirectory = @()

foreach($family in $Families)
{
    foreach($member in $family.Members)
    {
        $dashboard.memberDirectory += [ordered]@{

            head = $family.Head

            leikai = $family.Leikai

            member = $member.($Col.Member)

            relationship = $member.($Col.Relationship)

            freeWill = NumberValue $member.($Col.FreeWill)

            faithPromise = NumberValue $member.($Col.FaithPromise)

            phase1 = NumberValue $member.($Col.Phase1)

            phase2 = NumberValue $member.($Col.Phase2)

            phase3 = NumberValue $member.($Col.Phase3)

            phase4 = NumberValue $member.($Col.Phase4)

            phase5 = NumberValue $member.($Col.Phase5)

            phaseA = NumberValue $member.($Col.PhaseA)

            phaseB = NumberValue $member.($Col.PhaseB)

            phaseC = NumberValue $member.($Col.PhaseC)

            phaseD = NumberValue $member.($Col.PhaseD)

            phaseE = NumberValue $member.($Col.PhaseE)

            windows = NumberValue $member.($Col.Windows)

            cpc = NumberValue $member.($Col.CPC)

            pillars = NumberValue $member.($Col.Pillars)

            tiles = NumberValue $member.($Col.Tiles)

            savingBox = NumberValue $member.($Col.SavingBox)

        }
    }
}
	
}

#---------------------------------------------------------
# Convert to JSON
#---------------------------------------------------------

$json = $dashboard | ConvertTo-Json -Depth 10

#---------------------------------------------------------
# JavaScript File
#---------------------------------------------------------

$javascript = @"
//=====================================================
// Church Contribution Dashboard
// Auto Generated
//=====================================================

const dashboardData =

$json;

"@

#---------------------------------------------------------
# Save dashboardData.js
#---------------------------------------------------------

Set-Content `
    -Path $OutputJS `
    -Value $javascript `
    -Encoding UTF8

Write-Host ""
Write-Host "dashboardData.js generated successfully."

Write-Host ""
Write-Host "Saved to:"
Write-Host $OutputJS

Write-Host ""

Write-Host "Total Families : $($dashboard.totalFamilies)"
Write-Host "Total Members  : $($dashboard.totalMembers)"
Write-Host "Grand Total    : $($dashboard.grandTotal)"

pause