# =========================================================
# DataGenerator.ps1
# CPC Dashboard Data Generator
# =========================================================

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================================="
Write-Host "        CPC DASHBOARD DATA GENERATOR"
Write-Host "========================================================="
Write-Host ""

# =========================================================
# 1. PATHS
# =========================================================

$BaseFolder = Split-Path -Parent $MyInvocation.MyCommand.Path

$CsvFile  = Join-Path $BaseFolder "data.csv"
$OutputJS = Join-Path $BaseFolder "dashboardData.js"

Write-Host "Base Folder:"
Write-Host $BaseFolder
Write-Host ""

Write-Host "CSV File:"
Write-Host $CsvFile
Write-Host ""

Write-Host "Output File:"
Write-Host $OutputJS
Write-Host ""


# =========================================================
# 2. CHECK CSV FILE
# =========================================================

if (!(Test-Path -LiteralPath $CsvFile)) {

    Write-Host ""
    Write-Host "ERROR: data.csv was not found."
    Write-Host ""
    Write-Host "Expected location:"
    Write-Host $CsvFile
    Write-Host ""

    exit 1
}


# =========================================================
# 3. READ CSV
# =========================================================

Write-Host "Reading data.csv..."
Write-Host ""

$Rows = Import-Csv -LiteralPath $CsvFile

if ($null -eq $Rows -or $Rows.Count -eq 0) {

    Write-Host ""
    Write-Host "ERROR: data.csv contains no records."
    Write-Host ""

    exit 1
}

Write-Host "CSV loaded successfully."
Write-Host "Records : $($Rows.Count)"
Write-Host ""


# =========================================================
# 4. COLUMN MAPPING
# =========================================================

$Col = @{

    HOF            = "HOF"
    Member         = "Family Members"
    Relationship   = "Relationship"
    Leikai         = "Leikai"

    FreeWill       = "FreeWill"
    FaithPromise   = "FaithPromise"

    Phase1         = "Phase 1"
    Phase2         = "Phase 2"
    Phase3         = "Phase 3 (50%)"
    Phase4         = "Phase 4 (50%)"
    Phase5         = "Phase 5 (40%)"

    PhaseA         = "Phase A"
    PhaseB         = "Phase B"
    PhaseC         = "Phase C (50%)"
    PhaseD         = "Phase D (50%)"
    PhaseE         = "Phase E (Cate. A/B)"

    Windows        = "Windows"
    CPC            = "CPC Subscription"
    Pillars        = "Pillars"
    Tiles          = "Tiles"
    SavingBox      = "Saving Box"
}


# =========================================================
# 5. CHECK REQUIRED CSV COLUMNS
# =========================================================

$CsvColumns = $Rows[0].PSObject.Properties.Name

foreach ($Key in $Col.Keys) {

    $RequiredColumn = $Col[$Key]

    if ($CsvColumns -notcontains $RequiredColumn) {

        Write-Host ""
        Write-Host "ERROR: Required CSV column not found:"
        Write-Host $RequiredColumn
        Write-Host ""

        exit 1
    }
}

Write-Host "CSV column check completed successfully."
Write-Host ""


# =========================================================
# 6. NUMBER CONVERTER
# =========================================================

function NumberValue {

    param(
        $Value
    )

    if ($null -eq $Value) {
        return [decimal]0
    }

    $Text = $Value.ToString().Trim()

    if ([string]::IsNullOrWhiteSpace($Text)) {
        return [decimal]0
    }

    # Remove commas and currency symbols
    
	$Text = $Text -replace '[^0-9.-]', ''
	
    try {
        return [decimal]$Text
    }
    catch {
        return [decimal]0
    }
}

function NumberValue {

    param(
        [object]$Value
    )

    if ($null -eq $Value -or $Value -eq "") {
        return 0
    }

    $Text = [string]$Value

    $Text = $Text -replace '[^0-9.-]', ''

    if ($Text -eq "" -or $Text -eq "-") {
        return 0
    }

    return [decimal]$Text
}

# =========================================================
# 7. BUILD FAMILY COLLECTION
# =========================================================

Write-Host "Building family collection..."
Write-Host ""

$Families = @()

$currentFamily = $null

foreach ($row in $Rows) {

    $HofValue = $row.($Col.HOF)

    if ($null -eq $HofValue) {
        $hof = ""
    }
    else {
        $hof = $HofValue.ToString().Trim()
    }


    # -----------------------------------------------------
    # New family starts when HOF has a value
    # -----------------------------------------------------

    if ($hof -ne "") {

        $LeikaiValue = $row.($Col.Leikai)

        if ($null -eq $LeikaiValue) {
            $LeikaiValue = ""
        }
        else {
            $LeikaiValue = $LeikaiValue.ToString().Trim()
        }


        $currentFamily = [PSCustomObject]@{

            Head       = $hof
            Leikai     = $LeikaiValue

            Members    = @()

            SavingBox  = [decimal]0
            Tiles      = [decimal]0
            Total      = [decimal]0

        }

        $Families += $currentFamily
    }


    # -----------------------------------------------------
    # Ignore rows before first family
    # -----------------------------------------------------

    if ($null -eq $currentFamily) {
        continue
    }


    # -----------------------------------------------------
    # Add CSV row to current family
    # -----------------------------------------------------

    $currentFamily.Members += $row
}


# =========================================================
# 8. CALCULATE FAMILY TOTALS
# =========================================================

$totalFamilies = $Families.Count
$totalMembers  = 0


foreach ($family in $Families) {

    $familyMemberCount = $family.Members.Count

    $totalMembers += $familyMemberCount


    foreach ($member in $family.Members) {

        # Saving Box
        $family.SavingBox += NumberValue $member.($Col.SavingBox)

        # Tiles
        $family.Tiles += NumberValue $member.($Col.Tiles)


        # -------------------------------------------------
        # Member total
        # -------------------------------------------------

        $memberTotal = [decimal]0

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


        # Add member total to family
        $family.Total += $memberTotal
    }


    # Save member count
    $family | Add-Member `
        -NotePropertyName MemberCount `
        -NotePropertyValue $familyMemberCount `
        -Force
}


# =========================================================
# 9. DASHBOARD OBJECT
# =========================================================

$dashboard = [ordered]@{

    totalFamilies = $totalFamilies
    totalMembers  = $totalMembers

    grandTotal = [decimal]0

    freeWill     = [decimal]0
    faithPromise = [decimal]0

    employeeSubscription    = [decimal]0
    nonEmployeeSubscription = [decimal]0

    phase1 = [decimal]0
    phase2 = [decimal]0
    phase3 = [decimal]0
    phase4 = [decimal]0
    phase5 = [decimal]0

    phaseA = [decimal]0
    phaseB = [decimal]0
    phaseC = [decimal]0
    phaseD = [decimal]0
    phaseE = [decimal]0

    windows   = [decimal]0
    cpc       = [decimal]0
    pillars   = [decimal]0
    tiles     = [decimal]0
    savingBox = [decimal]0

    families = @()

    memberDirectory = @()
}


# =========================================================
# 10. CALCULATE DASHBOARD TOTALS
# =========================================================

Write-Host "Calculating dashboard totals..."
Write-Host ""


foreach ($family in $Families) {

    foreach ($member in $family.Members) {


        # -------------------------------------------------
        # Basic contributions
        # -------------------------------------------------

        $dashboard.freeWill += NumberValue `
            $member.($Col.FreeWill)

        $dashboard.faithPromise += NumberValue `
            $member.($Col.FaithPromise)


        # -------------------------------------------------
        # Employee subscription phases
        # -------------------------------------------------

        $dashboard.phase1 += NumberValue `
            $member.($Col.Phase1)

        $dashboard.phase2 += NumberValue `
            $member.($Col.Phase2)

        $dashboard.phase3 += NumberValue `
            $member.($Col.Phase3)

        $dashboard.phase4 += NumberValue `
            $member.($Col.Phase4)

        $dashboard.phase5 += NumberValue `
            $member.($Col.Phase5)


        # -------------------------------------------------
        # Non-employee subscription phases
        # -------------------------------------------------

        $dashboard.phaseA += NumberValue `
            $member.($Col.PhaseA)

        $dashboard.phaseB += NumberValue `
            $member.($Col.PhaseB)

        $dashboard.phaseC += NumberValue `
            $member.($Col.PhaseC)

        $dashboard.phaseD += NumberValue `
            $member.($Col.PhaseD)

        $dashboard.phaseE += NumberValue `
            $member.($Col.PhaseE)


        # -------------------------------------------------
        # Other contributions
        # -------------------------------------------------

        $dashboard.windows += NumberValue `
            $member.($Col.Windows)

        $dashboard.cpc += NumberValue `
            $member.($Col.CPC)

        $dashboard.pillars += NumberValue `
            $member.($Col.Pillars)

        $dashboard.tiles += NumberValue `
            $member.($Col.Tiles)

        $dashboard.savingBox += NumberValue `
            $member.($Col.SavingBox)
    }
}


# =========================================================
# 11. CALCULATE SUBSCRIPTION TOTALS
# =========================================================

# Employee Subscription
$dashboard.employeeSubscription =

    $dashboard.phase1 +
    $dashboard.phase2 +
    $dashboard.phase3 +
    $dashboard.phase4 +
    $dashboard.phase5


# Non-Employee Subscription
$dashboard.nonEmployeeSubscription =

    $dashboard.phaseA +
    $dashboard.phaseB +
    $dashboard.phaseC +
    $dashboard.phaseD +
    $dashboard.phaseE


# =========================================================
# 12. CALCULATE GRAND TOTAL
# =========================================================

$dashboard.grandTotal =

    $dashboard.freeWill +
    $dashboard.faithPromise +

    $dashboard.employeeSubscription +

    $dashboard.nonEmployeeSubscription +

    $dashboard.windows +
    $dashboard.cpc +
    $dashboard.pillars +
    $dashboard.tiles +
    $dashboard.savingBox


# =========================================================
# 13. BUILD FAMILY ARRAY
# =========================================================

foreach ($family in $Families) {

    $dashboard.families += [ordered]@{

        leikai = $family.Leikai

        head = $family.Head

        members = $family.MemberCount

        savingBox = $family.SavingBox

        tiles = $family.Tiles

        total = $family.Total
    }
}


# =========================================================
# 14. BUILD MEMBER DIRECTORY
# =========================================================

foreach ($family in $Families) {

    foreach ($member in $family.Members) {

        $dashboard.memberDirectory += [ordered]@{

            head = $family.Head

            leikai = $family.Leikai

            member = $member.($Col.Member)

            relationship = $member.($Col.Relationship)

            freeWill =
                NumberValue $member.($Col.FreeWill)

            faithPromise =
                NumberValue $member.($Col.FaithPromise)

            phase1 =
                NumberValue $member.($Col.Phase1)

            phase2 =
                NumberValue $member.($Col.Phase2)

            phase3 =
                NumberValue $member.($Col.Phase3)

            phase4 =
                NumberValue $member.($Col.Phase4)

            phase5 =
                NumberValue $member.($Col.Phase5)

            phaseA =
                NumberValue $member.($Col.PhaseA)

            phaseB =
                NumberValue $member.($Col.PhaseB)

            phaseC =
                NumberValue $member.($Col.PhaseC)

            phaseD =
                NumberValue $member.($Col.PhaseD)

            phaseE =
                NumberValue $member.($Col.PhaseE)

            windows =
                NumberValue $member.($Col.Windows)

            cpc =
                NumberValue $member.($Col.CPC)

            pillars =
                NumberValue $member.($Col.Pillars)

            tiles =
                NumberValue $member.($Col.Tiles)

            savingBox =
                NumberValue $member.($Col.SavingBox)
        }
    }
}


# =========================================================
# 15. DISPLAY RESULTS
# =========================================================

Write-Host ""
Write-Host "========================================================="
Write-Host "             DASHBOARD TOTALS"
Write-Host "========================================================="
Write-Host ""

Write-Host ("Families              : {0}" -f $dashboard.totalFamilies)
Write-Host ("Members               : {0}" -f $dashboard.totalMembers)

Write-Host ""

Write-Host ("Free Will             : {0}" -f $dashboard.freeWill)
Write-Host ("Faith Promise         : {0}" -f $dashboard.faithPromise)

Write-Host ""

Write-Host ("Employee Subscription : {0}" -f `
    $dashboard.employeeSubscription)

Write-Host ("Non-Employee Sub.     : {0}" -f `
    $dashboard.nonEmployeeSubscription)

Write-Host ""

Write-Host ("Phase 1               : {0}" -f $dashboard.phase1)
Write-Host ("Phase 2               : {0}" -f $dashboard.phase2)
Write-Host ("Phase 3               : {0}" -f $dashboard.phase3)
Write-Host ("Phase 4               : {0}" -f $dashboard.phase4)
Write-Host ("Phase 5               : {0}" -f $dashboard.phase5)

Write-Host ""

Write-Host ("Phase A               : {0}" -f $dashboard.phaseA)
Write-Host ("Phase B               : {0}" -f $dashboard.phaseB)
Write-Host ("Phase C               : {0}" -f $dashboard.phaseC)
Write-Host ("Phase D               : {0}" -f $dashboard.phaseD)
Write-Host ("Phase E               : {0}" -f $dashboard.phaseE)

Write-Host ""

Write-Host ("Windows               : {0}" -f $dashboard.windows)
Write-Host ("CPC                   : {0}" -f $dashboard.cpc)
Write-Host ("Pillars               : {0}" -f $dashboard.pillars)
Write-Host ("Tiles                 : {0}" -f $dashboard.tiles)
Write-Host ("Saving Box            : {0}" -f $dashboard.savingBox)

Write-Host ""

Write-Host ("GRAND TOTAL           : {0}" -f `
    $dashboard.grandTotal)

Write-Host ""


# =========================================================
# 16. CONVERT TO JSON
# =========================================================

Write-Host "Generating dashboardData.js..."

$json = $dashboard | ConvertTo-Json -Depth 10


# =========================================================
# 17. CREATE JAVASCRIPT
# =========================================================

$javascript = @"
// =========================================================
// CPC DASHBOARD
// AUTO GENERATED FILE
// Do NOT edit this file manually.
// Generated from data.csv
// =========================================================

const dashboardData =

$json;

"@


# =========================================================
# 18. WRITE dashboardData.js
# =========================================================

Set-Content `
    -LiteralPath $OutputJS `
    -Value $javascript `
    -Encoding UTF8


# =========================================================
# 19. VERIFY OUTPUT
# =========================================================

if (!(Test-Path -LiteralPath $OutputJS)) {

    Write-Host ""
    Write-Host "ERROR: dashboardData.js was not created."
    Write-Host ""

    exit 1
}


# =========================================================
# 20. SUCCESS
# =========================================================

Write-Host ""
Write-Host "========================================================="
Write-Host "       dashboardData.js GENERATED SUCCESSFULLY"
Write-Host "========================================================="
Write-Host ""

Write-Host "Output:"
Write-Host $OutputJS
Write-Host ""

Write-Host ("Families    : {0}" -f $dashboard.totalFamilies)
Write-Host ("Members     : {0}" -f $dashboard.totalMembers)
Write-Host ("Grand Total : {0}" -f $dashboard.grandTotal)

Write-Host ""
Write-Host "PowerShell generation completed successfully."
Write-Host ""

exit 0