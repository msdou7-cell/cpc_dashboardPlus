/*=============================================================
    Dashboard Version 2.0
    MODULE 1
    APPLICATION CORE
=============================================================*/

"use strict";

/*=============================================================
    APPLICATION INFORMATION
=============================================================*/

const APP = {

    name        : "Church Member's Contribution Dashboard",

    version     : ",CPC",

    developer   : "Moshildou Dangsha",

    buildDate	: "August 2026"

};


/*=============================================================
    APPLICATION STATE
=============================================================*/

const App = {

    data        : null,

    currentView : "dashboard",

    currentData : [],

    selectedLeikai : "",

    searchText  : ""

};


/*=============================================================
    DOM CACHE
=============================================================*/

const Cache = {

    appContainer    : null,

    dashboardCards  : null,

    summaryPanel    : null,

    toolbarPanel    : null,

    detailTable     : null,

    statusBar       : null,

    dashboardTitle  : null,

    dashboardVersion: null

};

const Report = {

    churchName: "WAITHOU PHUNAL BAPTIST CHURCH, MNBA",

    reportTitle: "",

    generated: "",

    records: 0,

    total: 0

};

/*=============================================================
    INITIALISE APPLICATION
=============================================================*/

document.addEventListener(
    "DOMContentLoaded",
    initialiseApplication
);


function initialiseApplication()
{
    cacheControls();

    loadDashboardData();

    registerGlobalEvents();

    showApplicationInformation();

	buildDashboard();

    console.log(
        APP.name +
        " Data Source: Technical_Team " +
        APP.version +
        " loaded successfully."
    );
}


/*=============================================================
    CACHE HTML CONTROLS
=============================================================*/

const DOM = {

    appContainer     : "appContainer",

    kpiSection       : "kpiSection",

    summaryPanel     : "summaryPanel",

    toolbarPanel     : "toolbarPanel",

    detailTable      : "detailTable",

    statusBar        : "statusBar",

    dashboardTitle   : "dashboardTitle",

    dashboardVersion : "dashboardVersion"

};

function cacheControls()
{
    Object.keys(DOM).forEach(key =>
    {
        Cache[key] = document.getElementById(DOM[key]);
    });
}

/*=============================================================
    LOAD DASHBOARD DATA
=============================================================*/

function loadDashboardData()
{
    if(typeof dashboardData === "undefined")
    {
        alert(
            "dashboardData.js could not be loaded."
        );

        return;
    }

    App.data = dashboardData;
}


/*=============================================================
    GLOBAL EVENTS
=============================================================*/

function registerGlobalEvents()
{
    window.addEventListener(
        "resize",
        function()
        {
            console.log(
                "Window resized."
            );
        }
    );
}


/*=============================================================
    APPLICATION HEADER
=============================================================*/

function showApplicationInformation()
{
    if(Cache.dashboardTitle)
    {
        Cache.dashboardTitle.textContent =
            APP.name;
    }

   
}


/*=============================================================
    INDIAN NUMBER FORMAT
=============================================================*/

function formatNumber(value)
{
    value = Number(value) || 0;

    return value.toLocaleString(
        "en-IN",
        {
            maximumFractionDigits: 0
        }
    );
}


/*=============================================================
    CURRENCY FORMAT
=============================================================*/

function formatCurrency(value)
{
    return "₹ " + formatNumber(value);
}


/*=============================================================
    SAFE STRING
=============================================================*/

function safeText(value)
{
    if(value === null || value === undefined)
        return "";

    return String(value).trim();
}


/*=============================================================
    SAFE NUMBER
=============================================================*/

function safeNumber(value)
{
    value = Number(value);

    return isNaN(value) ? 0 : value;
}


/*=============================================================
    ESCAPE HTML
=============================================================*/

function escapeHTML(text)
{
    return safeText(text)

        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#39;");
}


/*=============================================================
    UPDATE STATUS BAR
=============================================================*/

function updateStatusBar(showing,total,label)
{
    Cache.statusBar.innerHTML =

        `Showing ${formatNumber(showing)} of ${formatNumber(total)} ${label}`;
}


/*=============================================================
    CLEAR TOOLBAR
=============================================================*/

function clearToolbar()
{
    Cache.toolbarPanel.innerHTML = "";
}


/*=============================================================
    CLEAR TABLE
=============================================================*/

function clearTable()
{
    Cache.detailTable.innerHTML = "";
}


/*=============================================================
    SHOW LOADING
=============================================================*/

function showLoading(message="Loading...")
{
    Cache.detailTable.innerHTML = `

        <tbody>

            <tr>

                <td colspan="20"
                    style="text-align:center;padding:40px;">

                    ${escapeHTML(message)}

                </td>

            </tr>

        </tbody>

    `;
}


/*=============================================================
    DOWNLOAD CSV
=============================================================*/

function downloadCSV(fileName,csvText)
{
    const blob = new Blob(
        [csvText],
        {
            type:"text/csv;charset=utf-8;"
        }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = fileName;

    link.click();

    URL.revokeObjectURL(url);
}


/*=============================================================
    PRINT CURRENT VIEW
=============================================================*/

function printCurrentView()
{
    window.print();
}


/*=============================================================
    SORT HELPERS
=============================================================*/

function sortAZ(list,field)
{
    return list.sort((a,b)=>

        safeText(a[field])

        .localeCompare(

            safeText(b[field])

        )

    );
}

function sortZA(list,field)
{
    return list.sort((a,b)=>

        safeText(b[field])

        .localeCompare(

            safeText(a[field])

        )

    );
}


/*=============================================================
    SEARCH HELPER
=============================================================*/

function contains(text,search)
{
    return safeText(text)

        .toLowerCase()

        .includes(

            safeText(search)

            .toLowerCase()

        );
}

function exportExcel()
{
    let csv="";

    csv += ExportEngine.title + "\n\n";

    csv += ExportEngine.columns
        .map(c=>c.title)
        .join(",");

    csv+="\n";

    ExportEngine.rows.forEach(r=>{

        csv += ExportEngine.columns
            .map(c=>{

                return '"' + (r[c.field] ?? "") + '"';

            })
            .join(",");

        csv+="\n";

    });

    csv+="\n";

    csv+="Records,"+ExportEngine.rows.length+"\n";

    csv+="Total Amount,"+ExportEngine.totalAmount;

    const blob=new Blob([csv],{

        type:"text/csv"

    });

    const url=URL.createObjectURL(blob);

    const a=document.createElement("a");

    a.href=url;

    a.download=ExportEngine.title+".csv";

    a.click();

    URL.revokeObjectURL(url);
}


function printView()
{
    buildPrintReport();

    const report =
        document.getElementById("printReport");

    if (!report)
    {
        console.error("printReport not found.");
        return;
    }

    const table =
        report.querySelector(".print-table");

    if (!table)
    {
        console.error("Report table not found.");
        return;
    }


    /* ==========================================
       REPORT TYPE
    ========================================== */
const reportTitle =
    View.title || "Report";	

const reportTitleLower =
    reportTitle.toLowerCase();
    

const isGrandTotal =
    reportTitleLower.includes("grand total");

const isEmployeeSubscription =
    reportTitleLower.includes("employee subscription");

const isNonEmployeeSubscription =
    reportTitleLower.includes("non-employee subscription");

const pageOrientation =
    (
        isGrandTotal ||
        isEmployeeSubscription ||
        isNonEmployeeSubscription
    )
        ? "landscape"
        : "portrait";


    /* ==========================================
       CURRENT DATE
    ========================================== */

    const today =
        getTodayDate();


    const generated =
        new Date().toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
            }
        );


    /* ==========================================
       OPEN PRINT WINDOW
    ========================================== */

    const printWindow =
        window.open(
            "",
            "_blank",
            "width=1200,height=800"
        );


    if (!printWindow)
    {
        alert(
            "Please allow pop-ups for printing."
        );

        return;
    }


    /* ==========================================
       PRINT DOCUMENT
    ========================================== */

    printWindow.document.open();

		const isLeikaiSummary =
    reportTitle
        .toLowerCase()
        .includes("leikai wise contribution summary");


const recordCount =
    isLeikaiSummary
        ? View.rows.filter(
            row =>
                row.leikai &&
                row.leikai !== "GRAND TOTAL"
          ).length
        : (View.rows ? View.rows.length : 0);

let filterSummary = `
    <div class="print-filter-summary">

        <div>
            ${escapeHTML(reportTitle)}
        </div>

        <div>
            Total Records : ${formatNumber(recordCount)}
        </div>
`;

if (
    View.totalAmount !== null &&
    View.totalAmount !== undefined
)
{
    filterSummary += `
        <div>
            Total Amount : ₹${formatNumber(View.totalAmount)}
        </div>
    `;
}

    printWindow.document.write(`

<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<title>
${escapeHTML(reportTitle)}
</title>


<style>

@page
{
    size: A4 ${pageOrientation};

    margin: 8mm;
}


/* ==========================================
   GENERAL
========================================== */

*
{
    box-sizing: border-box;
}


html,
body
{
    margin: 0;

    padding: 0;

    width: 100%;

    background: #ffffff;

    color: #000000;

    font-family:
        Arial,
        Helvetica,
        sans-serif;
}


/* ==========================================
   MAIN REPORT HEADER
========================================== */

.report-main-header
{
    width: 100%;

    text-align: center;

    margin: 0;

    padding: 0;
}


.report-main-header h1
{
    margin: 0;

    padding: 0;

    font-size: 18px;

    font-weight: bold;

    text-align: center;
}


/* ==========================================
   REPORT TITLE
========================================== */

.report-title
{
    width: 100%;

    margin-top: 3px;

    text-align: center;

    font-size: 15px;

    font-weight: bold;
}


/* ==========================================
   EFFECTIVE DATE
========================================== */

.report-effective-date
{
    width: 100%;

    margin-top: 2px;

    margin-bottom: 6px;

    text-align: center;

    font-size: 12px;

    font-weight: normal;
}


/* ==========================================
   SOURCE + GENERATED INFORMATION
========================================== */

.report-information
{
    width: 100%;

    margin-bottom: 5px;

    font-size: 13px;

    position: relative;

    min-height: 30px;
}


.data-source
{
    position: absolute;
    
    right: 0;
    
    top: 0;
    
    text-align: right;

    white-space: nowrap;
}


.generated-date
{
    position: absolute;

    right: 0;

    top: 18px;

    text-align: right;

    white-space: nowrap;
}




.print-table
{
    width: 100%;

    max-width: 100%;

    margin: 0;

    padding: 0;

    border-collapse: collapse;

    border-spacing: 0;

    table-layout: auto;

    border: 1px solid #000000;
}


/* ==========================================
   ALL TABLE BORDERS
========================================== */

.print-table th,
.print-table td
{
    border: 1px solid #000000;

    padding: 4px 5px;

    vertical-align: middle;

    box-sizing: border-box;
}


/* ==========================================
   COLUMN HEADINGS
========================================== */

.print-table th
{
    text-align: center;

    font-size: 13px;

    font-weight: bold;

    white-space: normal;

    overflow-wrap: break-word;

    word-break: normal;

    line-height: 1.15;
}


/* ==========================================
   TABLE DATA
========================================== */

.print-table td
{
    font-size: 14px;

    white-space: nowrap;
}


/* ==========================================
   GRAND TOTAL ROW
========================================== */

.grand-total-row td
{
    font-weight: bold;

    border-top: 2px solid #000000;
}


/* ==========================================
   OUTER RIGHT BORDER
========================================== */

.print-table th:last-child,
.print-table td:last-child
{
    border-right: 1px solid #000000;
}


/* ==========================================
   PRINT
========================================== */

@media print
{
    html,
    body
    {
        width: 100%;

        margin: 0;

        padding: 0;
    }
}

.print-filter-summary
{
    width: 100%;

    margin-top: 5px;

    text-align: left;

    font-size: 13px;

    line-height: 1.4;

    font-weight: normal;
}

</style>

</head>


<body>


<!-- ======================================
     ORGANISATION HEADER
====================================== -->

<div class="report-main-header">

    <h1>
        WAITHOU PHUNAL BAPTIST CHURCH, MNBA <BR/>CHURCH PLANNING COMMITTEE (CPC)
    </h1>

</div>


<!-- ======================================
     REPORT TITLE
====================================== -->

<div class="report-title">

    ${escapeHTML(reportTitle)}

</div>


<!-- ======================================
     EFFECTIVE DATE
====================================== -->

<div class="report-effective-date">

    (15-05-2016 till ${today})

</div>


<!-- ======================================
     SOURCE + GENERATED DATE
====================================== -->

<div class="report-information">

    <div class="data-source">

        Data Source : Technical_Team, CPC

    </div>


    <div class="generated-date">

        Generated : ${generated}

    </div>

</div>




${table.outerHTML}


</body>

</html>

    `);


    printWindow.document.close();


    /* ==========================================
       START PRINT
    ========================================== */

    printWindow.onload =
        function()
        {
            setTimeout(
                function()
                {
                    printWindow.focus();

                    printWindow.print();

                    printWindow.close();       
                    

                },
                300
            );
        };
}




function getTodayDate()
{
    const now = new Date();

    const day =
        String(now.getDate())
            .padStart(2, "0");

    const month =
        String(now.getMonth() + 1)
            .padStart(2, "0");

    const year =
        now.getFullYear();

    return `${day}-${month}-${year}`;
}


function exportPDF()
{
    

    printView();
}

/*=========================================================
    MODULE 10
    EXPORT ENGINE
=========================================================*/

const ExportEngine = {

    rows: [],

    columns: [],

    title: "",

    totalAmount:0

};

/*=============================================================
    MODULE 3
    KPI CONFIGURATION
=============================================================*/

const KPI = [

{
    id:"grandTotal",
    title:"Grand Total",
    icon:"💰",
    value:"grandTotal"
},

{
    id:"totalFamilies",
    title:"Families",
    icon:"🏠",
    value:"totalFamilies"
},

{
    id:"totalMembers",
    title:"Members",
    icon:"👨‍👩‍👧‍👦",
    value:"totalMembers"
},

{
    id:"freeWill",
    title:"Free Will",
    icon:"🙏",
    value:"freeWill"
},

{
    id:"faithPromise",
    title:"Faith Promise",
    icon:"❤️",
    value:"faithPromise"
},

{
    id:"employeeSubscription",
    title:"Employee Subscription",
    icon:"👨‍💼",
    value:"employeeSubscription"
},

{
    id:"nonEmployeeSubscription",
    title:"Non Employee Subscription",
    icon:"👥",
    value:"nonEmployeeSubscription"
},

{
    id:"windows",
    title:"Windows",
    icon:"🪟",
    value:"windows"
},

{
    id:"cpc",
    title:"CPC",
    icon:"📘",
    value:"cpc"
},

{
    id:"pillars",
    title:"Pillars",
    icon:"🏛",
    value:"pillars"
},

{
    id:"tiles",
    title:"Tiles",
    icon:"🧱",
    value:"tiles"
},

{
    id:"savingBox",
    title:"Saving Box",
    icon:"💵",
    value:"savingBox"
},

{
    id:"executiveMembers",
    title:"Executive Members",
    icon:"👔",
    value:"executiveMembers"
},

{
    id:"societyshares",
    title:"Society Shares",
    icon:"⛪",
    value:"societyshares"
}

];

/*=============================================================
    BUILD KPI DASHBOARD
=============================================================*/

function buildDashboard()
{
    let html="";

    KPI.forEach(item=>{

        let value =
            safeNumber(
                App.data[item.value]
            );

        html += `

        <article
            class="kpi-card"
            data-view="${item.id}">

            <div class="kpi-icon">

                ${item.icon}

            </div>

            <div class="kpi-title">

                ${item.title}

            </div>

            <div class="kpi-value">

                ${formatNumber(value)}

            </div>

        </article>

        `;

    });

    Cache.kpiSection.innerHTML = html;

    registerKPICards();
}

/*=============================================================
    KPI CLICK EVENTS
=============================================================*/

function registerKPICards()
{
    document

    .querySelectorAll(".kpi-card")

    .forEach(card=>{

        card.addEventListener(

            "click",

            function(){

                Dashboard.open(

                    this.dataset.view

                );

            }

        );

    });

}

/*=============================================================
    MODULE 4
    KPI NAVIGATION ENGINE
=============================================================*/

const Dashboard = {

    open(view)
    {
        console.log("Opening View :", view);

        switch(view)
        {
            case "grandTotal":
                openGrandTotal();
                break;

            case "totalFamilies":
                openFamilies();
                break;

            case "totalMembers":
                openMembers();
                break;

            case "freeWill":
    openContribution(
        "freeWill",
        "Free Will Contributions"
    );
    break;

case "faithPromise":
    openContribution(
        "faithPromise",
        "Faith Promise Contributions"
    );
    break;

case "employeeSubscription":

    openEmployeeSubscription();

    break;


case "nonEmployeeSubscription":

    openNonEmployeeSubscription();

    break;

case "windows":
    openContribution(
        "windows",
        "Windows Contributions"
    );
    break;

case "cpc":
    openContribution(
        "cpc",
        "CPC Contributions"
    );
    break;

case "pillars":
    openContribution(
        "pillars",
        "Pillars Contributions"
    );
    break;

case "tiles":
    openContribution(
        "tiles",
        "Tiles Contributions",
        true
    );
    break;

case "savingBox":
    openContribution(
        "savingBox",
        "Saving Box Contributions"
    );
    break;
            default:

                console.warn("Unknown KPI :", view);
        }
    }

};

/*=============================================================
    MODULE 7
    MEMBER DIRECTORY
=============================================================*/

function openFamilies()
{
    /* =========================================
   BUILD FAMILY CONTRIBUTION MAP
   FAMILY KEY =
   HOF + LEIKAI + NO OF MEMBERS
========================================= */

const familyContributionMap = new Map();


/*
   Helper to create a consistent family key
*/
function makeFamilyKey(head, leikai, members)
{
    return (
        String(head || "")
            .trim()
            .toUpperCase()
        +
        "|"
        +
        String(leikai || "")
            .trim()
            .toUpperCase()
        +
        "|"
        +
        Number(members || 0)
    );
}


/*
   Calculate contribution of every member
*/
App.data.memberDirectory.forEach(member =>
{
    const headName =
        String(member.head || "")
            .trim();


    const leikaiName =
        String(member.leikai || "")
            .trim();


    /*
       Find the corresponding family record.

       Matching criteria:
       1. HOF
       2. Leikai
       3. Number of Members
    */

    const family =
        App.data.families.find(f =>
        {
            return (

                String(f.head || "")
                    .trim()
                    .toUpperCase()
                ===
                headName.toUpperCase()

                &&

                String(f.leikai || "")
                    .trim()
                    .toUpperCase()
                ===
                leikaiName.toUpperCase()

            );
        });


    /*
       If no family record is found,
       do not add this member to a family.
    */

    if (!family)
        return;


    const familyMemberCount =
        Number(
            family.members ??
            family.MemberCount ??
            0
        );


    /*
       IMPORTANT:
       Use HOF + Leikai + Members
       as the unique family key.
    */

    const familyKey =
        makeFamilyKey(
            headName,
            leikaiName,
            familyMemberCount
        );


    /* =========================================
       CALCULATE THIS MEMBER'S TOTAL CONTRIBUTION
    ========================================= */

    const freeWill =
        Number(member.freeWill) || 0;


    const faithPromise =
        Number(member.faithPromise) || 0;


    const employeeSubscription =
        (Number(member.phase1) || 0) +
        (Number(member.phase2) || 0) +
        (Number(member.phase3) || 0) +
        (Number(member.phase4) || 0) +
        (Number(member.phase5) || 0);


    const nonEmployeeSubscription =
        (Number(member.phaseA) || 0) +
        (Number(member.phaseB) || 0) +
        (Number(member.phaseC) || 0) +
        (Number(member.phaseD) || 0) +
        (Number(member.phaseE) || 0);


    const windows =
        Number(member.windows) || 0;


    const cpc =
        Number(member.cpc) || 0;


    const pillars =
        Number(member.pillars) || 0;


    const tiles =
        Number(member.tiles) || 0;


    const savingBox =
        Number(member.savingBox) || 0;


    const memberTotal =
        freeWill +
        faithPromise +
        employeeSubscription +
        nonEmployeeSubscription +
        windows +
        cpc +
        pillars +
        tiles +
        savingBox;


    /* =========================================
       ADD TO CORRECT FAMILY
    ========================================= */

    if (!familyContributionMap.has(familyKey))
    {
        familyContributionMap.set(
            familyKey,
            0
        );
    }


    familyContributionMap.set(
        familyKey,
        familyContributionMap.get(familyKey) +
        memberTotal
    );

});

/*=========================================
   BUILD FAMILY TABLE
=========================================*/

const rows =
    App.data.families.map((f) =>
    {
        const members =
            Number(
                f.members ??
                f.MemberCount ??
                0
            );


        /*
           Same family key used above:
           HOF + Leikai + No. of Members
        */

        const familyKey =
            makeFamilyKey(
                f.head,
                f.leikai,
                members
            );


        return {

            head:
                f.head,

            leikai:
                f.leikai,

            members:
                members,

            totalContributions:
                familyContributionMap.get(
                    familyKey
                ) || 0

        };

    });

/* =========================================
   SORT BY TOTAL CONTRIBUTIONS
   HIGHEST → LOWEST
========================================= */

rows.sort((a, b) =>
{
    return (
        (Number(b.totalContributions) || 0) -
        (Number(a.totalContributions) || 0)
    );
});


/* =========================================
   RENUMBER SL NO AFTER SORTING
========================================= */

rows.forEach((row, index) =>
{
    row.sl = index + 1;
});


/* =========================================
   CALCULATE GRAND TOTALS
========================================= */

const grandTotalMembers =
    rows.reduce(
        (sum, row) =>
            sum + (Number(row.members) || 0),
        0
    );


const grandTotalContributions =
    rows.reduce(
        (sum, row) =>
            sum +
            (Number(row.totalContributions) || 0),
        0
    );


/* =========================================
   ADD GRAND TOTAL ROW
========================================= */

rows.push({

    sl: "",

    head: "GRAND TOTAL",

    leikai: "",

    members: grandTotalMembers,

    totalContributions:
        grandTotalContributions

});


    /* =========================================
       DISPLAY FAMILY REPORT
    ========================================= */

    renderDirectory({

        title: "Family Directory",

        rows: rows,

        columns: [

            {
                field: "sl",
                title: "Sl No",
                align: "center"
            },

            {
                field: "head",
                title: "Head of Family"
            },

            {
                field: "members",
                title: "No of Members",
                align: "center",
                format: "number"
            },

            {
                field: "leikai",
                title: "Leikai"
            },

            {
                field: "totalContributions",
                title: "Total Contributions",
                align: "right",
                format: "currency"
            }

        ],

        toolbar:
        {
            search: "Search Family"
        }

    });


    /* =========================================
       EXPORT DATA
    ========================================= */

    ExportEngine.rows =
        [...View.rows];

    ExportEngine.columns =
        [...View.columns];

    ExportEngine.title =
        View.title;

    ExportEngine.totalAmount =
        View.rows.reduce(
            (sum, row) =>
                sum +
                (Number(row.totalContributions) || 0),
            0
        );
}

function openMembers()
{
    const rows = App.data.memberDirectory.map((m,index)=>({

        sl : index + 1,

        member : m.member,

        head : m.head,

        relationship : m.relationship,

        leikai : m.leikai

    }));

    renderDirectory({

        title : "Member Directory",

        rows : rows,

        columns : [

            {
                field : "sl",
                title : "Sl No",
                align : "center"
            },

            {
                field : "member",
                title : "Member Name"
            },

            {
                field : "head",
                title : "Head of Family"
            },

            {
                field : "relationship",
                title : "Relationship"
            },

            {
                field : "leikai",
                title : "Leikai"
            }

        ],

        toolbar : {

            search : "Search Member"

        }

    });

}



/*==========================================================
    MODULE 9
    CALCULATED KPI ENGINE
==========================================================*/
function addGrandTotalRow(rows, columns)
{
    const grandTotal = {};

    grandTotal.member = "GRAND TOTAL";
    grandTotal.leikai = "";

    columns.forEach(col =>
    {
        if (col.format === "currency")
        {
            grandTotal[col.field] =
                rows.reduce(
                    (sum, row) =>
                        sum + (Number(row[col.field]) || 0),
                    0
                );
        }
    });

    rows.push(grandTotal);
}

function addGrandTotalRow(rows, columns)
{
    const grandTotal = {};

    grandTotal.sl = "";
    grandTotal.member = "GRAND TOTAL";
    grandTotal.head = "";
    grandTotal.relationship = "";
    grandTotal.leikai = "";

    columns.forEach(col =>
    {
        if (col.format === "currency")
        {
            grandTotal[col.field] =
                rows.reduce(
                    (sum, row) =>
                        sum + (Number(row[col.field]) || 0),
                    0
                );
        }
    });

    rows.push(grandTotal);
}


function openContribution(fields, title, includeMembers = false)
{
    const rows = [];

    let serial = 1;

const isTiles = fields === "tiles";

const isSavingBox = fields === "savingBox";

const familyMemberMap = new Map();

if (isTiles)
{
    App.data.families.forEach(family =>
    {
        const headName =
            String(family.head || "")
                .trim()
                .toUpperCase();

        if (headName)
        {
            familyMemberMap.set(
                headName,
                Number(
                    family.members ??
                    family.MemberCount ??
                    0
                )
            );
        }
    });
}

    App.data.memberDirectory.forEach(member =>
    {
        let amount = 0;

        if (Array.isArray(fields))
        {
            fields.forEach(field =>
            {
                amount += Number(member[field]) || 0;
            });
        }
        else
        {
            amount = Number(member[fields]) || 0;
        }

        // Ignore members with no contribution
        if (amount <= 0)
            return;

const headName =
    String(member.head || "")
            .trim()
            .toUpperCase();

const memberCount =
    isTiles
        ? (familyMemberMap.get(headName) || 0)
        : undefined;

        rows.push({

            sl: serial++,

            member: member.member,

            head: member.head,

            relationship: member.relationship,

            leikai: member.leikai,

            amount: amount,
            memberCount: memberCount

        });
    });


/* =========================================
   REPORT COLUMNS
========================================= */

const columns = [

    {
        field: "sl",
        title: "Sl No",
        align: "center"
    }
];


/* =========================================
   MEMBER NAME
   Show for all KPIs EXCEPT TILES
========================================= */

if (fields !== "tiles" && fields !== "savingBox")
{
    columns.push({

        field: "member",
        title: "Member Name"

    });
}


/* =========================================
   HEAD OF FAMILY
========================================= */

columns.push({

    field: "head",
    title: "Head of Family"

});


/* =========================================
   TILES ONLY — NO OF MEMBERS
========================================= */

if (isTiles)
{
    columns.push({

        field: "memberCount",
        title: "No of Members",
        align: "center",
        format: "number"

    });
}
else if (!isSavingBox)
{
    columns.push({

        field: "relationship",
        title: "Relationship"

    });
}


/* =========================================
   LEIKAI
========================================= */

columns.push({

    field: "leikai",
    title: "Leikai"

});


/* =========================================
   AMOUNT
========================================= */

columns.push({

    field: "amount",
    title: "Amount",
    align: "right",
    format: "currency"

});

    


    /* =========================================
       ADD GRAND TOTAL ROW
    ========================================= */

    rows.sort((a,b)=>
    {
        return (Number(b.amount) || 0) -
    
                (Number(a.amount) || 0);
    });

    for (let i = 0; i < rows.length; i++)
{
    rows[i].sl = i+1;
}

    addGrandTotalRow(rows, columns);

/* =========================================
   SAVING BOX GRAND TOTAL LABEL
========================================= */

if (fields === "savingBox")
{
    const grandTotalRow =
        rows.find(
            row => row.member === "GRAND TOTAL"
        );

    if (grandTotalRow)
    {
        grandTotalRow.head = "GRAND TOTAL";
        grandTotalRow.member = "";
        grandTotalRow.relationship = "";
        grandTotalRow.leikai = "";
        grandTotalRow.sl = "";
    }
}


if (isTiles && rows.length > 0)
{
    const grandTotalRow = rows[rows.length - 1];

    grandTotalRow.head = "GRAND TOTAL";
    grandTotalRow.leikai = "";
    grandTotalRow.memberCount =
    rows
        .slice(0, -1)
        .reduce(
            (sum, row) =>
                sum + (Number(row.memberCount) || 0),
            0
        );
    grandTotalRow.sl = "";
}

    /* =========================================
       CALCULATE TOTAL BEFORE GRAND TOTAL ROW
       ========================================= */

    const totalAmount =
        rows.reduce(
            (sum, row) =>
                sum + (Number(row.amount) || 0),
            0
        );


    /*
       The Grand Total row is already included
       in rows, so subtract it from totalAmount.
    */

    const grandTotalRow =
        rows[rows.length - 1];

    const actualTotalAmount =
        totalAmount -
        (Number(grandTotalRow.amount) || 0);


    /* =========================================
       DISPLAY REPORT
    ========================================= */

    renderDirectory({

        title: title,

        rows: rows,

        totalAmount: actualTotalAmount,

        columns: columns,

        toolbar:
        {
            search: "Search Member"
        }

    });
}

/*==============================================================
    MODULE 5
    DASHBOARD VIEW FRAMEWORK
==============================================================*/

const Workspace = {

    title: "",

    totalRecords: 0,

    totalAmount: null,

    currentRows: [],

    currentColumns: []

};

function clearWorkspace()
{
    Cache.summaryPanel.innerHTML = "";

    Cache.toolbarPanel.innerHTML = "";

    Cache.detailTable.innerHTML = "";

    Cache.statusBar.innerHTML = "";
}

function updateSummary(title, records, totalAmount = null)
{
    Workspace.title = title;

    Workspace.totalRecords = records;

    Workspace.totalAmount = totalAmount;

    let html = `

<div class="summary-title">

${title}

</div>

<div class="summary-records">

Records : ${formatNumber(records)}

</div>

`;

    if(totalAmount !== null)
    {
        html += `

<div class="summary-total">

Total Amount :

${formatCurrency(totalAmount)}

</div>

`;
    }

    Cache.summaryPanel.innerHTML = html;
}


function updateStatusBar(showing,total,type)
{
    Cache.statusBar.innerHTML =

`Showing ${formatNumber(showing)} of ${formatNumber(total)} ${type}`;
}

function showToolbar(html)
{
    Cache.toolbarPanel.innerHTML = html;
}

function showTable(html)
{
    Cache.detailTable.innerHTML = html;
}

function beginView()
{
    clearWorkspace();
}

function saveCurrentView(title, columns, rows)
{
    App.currentTitle = title;

    App.currentColumns = columns;

    App.currentRows = [...rows];
}

function showEmpty(title)
{
    beginView();

    updateSummary(title,0);

    showToolbar("");

    showTable(

`<tbody>

<tr>

<td style="text-align:center;padding:40px">

No records found.

</td>

</tr>

</tbody>`

    );

    updateStatusBar(0,0,"records");
}


/*=============================================================
    MODULE 6
    GENERIC RENDERING ENGINE
=============================================================*/

const View = {

    title: "",

    rows: [],

    columns: [],

    toolbar: {},

    totalAmount: null

};

function renderDirectory(config)
{
    beginView();

    View.title = config.title;

    View.rows = [...config.rows];

    View.columns = [...config.columns];

    View.toolbar = config.toolbar || {};

    View.totalAmount =
        config.totalAmount ?? null;

    saveCurrentView(

        View.title,

        View.columns,

        View.rows

    );

    renderSummary();

    renderToolbar();

    renderTable();

    renderStatus();


/* ==============================
   Save Export Information
============================== */

ExportEngine.title = View.title;
ExportEngine.columns = [...View.columns];
ExportEngine.rows = [...View.rows];
ExportEngine.totalAmount = View.totalAmount ?? 0;

/* ==============================
   Save Report Information
============================== */

Report.reportTitle = View.title;

Report.generated =
    new Date().toLocaleString();

Report.records =
    View.rows.length;

Report.total =
    View.totalAmount ?? 0;

console.log("renderDirectory completed");
console.log(Report);
console.log(ExportEngine);
}

function renderSummary()
{
    updateSummary(

        View.title,

        View.rows.length,

        View.totalAmount

    );
}

function renderStatus()
{
    updateStatusBar(

        View.rows.length,

        View.rows.length,

        View.title

    );
}

function renderToolbar()
{
    let html = `

<input
id="txtSearch"
type="text"
placeholder="${View.toolbar.search || "Search"}">

<select id="cmbLeikai">

<option value="">All Leikais</option>

</select>

<button onclick="printView()">
Print
</button>

<button onclick="exportPDF()">
PDF
</button>

<button onclick="exportExcel()">
Excel
</button>

`;

    showToolbar(html);

    loadLeikaiFilter();

    registerToolbarEvents();
}

function registerToolbarEvents()
{
    const txtSearch =
        document.getElementById("txtSearch");

    if (txtSearch)
    {
        txtSearch.addEventListener(
            "input",
            applyFilters
        );
    }


    const cmbLeikai =
        document.getElementById("cmbLeikai");

    if (cmbLeikai)
    {
        cmbLeikai.addEventListener(
            "change",
            applyFilters
        );
    }


    const btnSortAZ =
        document.getElementById("btnSortAZ");

    if (btnSortAZ)
    {
        btnSortAZ.addEventListener(
            "click",
            () => sortRows(true)
        );
    }


    const btnSortZA =
        document.getElementById("btnSortZA");

    if (btnSortZA)
    {
        btnSortZA.addEventListener(
            "click",
            () => sortRows(false)
        );
    }


    const btnPrint =
        document.getElementById("btnPrint");

    if (btnPrint)
    {
        btnPrint.addEventListener(
            "click",
            printView
        );
    }


    const btnPDF =
        document.getElementById("btnPDF");

    if (btnPDF)
    {
        btnPDF.addEventListener(
            "click",
            exportPDF
        );
    }


    const btnExcel =
        document.getElementById("btnExcel");

    if (btnExcel)
    {
        btnExcel.addEventListener(
            "click",
            exportExcel
        );
    }
}

function loadLeikaiFilter()
{
    const combo = document.getElementById("cmbLeikai");

    combo.innerHTML = '<option value="">All Leikais</option>';

    // Use the current view instead of App.data.families
    const list = [...new Set(
        App.currentRows
            .map(r => r.leikai)
            .filter(x => x && x.trim() !== "")
    )].sort();

    list.forEach(item => {

        combo.innerHTML +=
            `<option value="${item}">${item}</option>`;

    });
}


function renderCell(row, col)
{
    let value = row[col.field];

    if (value === undefined || value === null)
    {
        value = "";
    }

    switch (col.format)
    {
        case "number":

            value = formatNumber(value);

            break;

        case "currency":

            value = formatCurrency(value);

            break;
    }

    const align = col.align || "left";

    return `
        <td style="text-align:${align}">
            ${escapeHTML(String(value))}
        </td>
    `;
}

function renderTable()
{
    let html = "";

    /* =========================
       TABLE HEADER
    ========================= */

    html += "<thead>";
    html += "<tr>";

    View.columns.forEach(col =>
    {
        html += `
            <th
                style="text-align:${col.align || "left"}"
            >
                ${escapeHTML(col.title)}
            </th>
        `;
    });

    html += "</tr>";
    html += "</thead>";


    /* =========================
       TABLE BODY
    ========================= */

    html += "<tbody>";

    View.rows.forEach(row =>
    {
       const isTotal =
    row.leikai === "GRAND TOTAL" ||
    row.head === "GRAND TOTAL" ||
    row.member === "GRAND TOTAL";

        html += `
            <tr class="${isTotal ? "grand-total-row" : ""}">
        `;

        View.columns.forEach(col =>
        {
            html += renderCell(row, col);
        });

        html += "</tr>";
    });

    html += "</tbody>";


    /* =========================
       DISPLAY TABLE
    ========================= */

    showTable(html);
}

function sortRows(ascending)
{
    let field =

        View.columns.find(c=>c.field!="sl").field;

    View.rows.sort((a,b)=>{

        let x = String(a[field]);

        let y = String(b[field]);

        return ascending

            ? x.localeCompare(y)

            : y.localeCompare(x);

    });

    renderTable();
}

/*=============================================================
    MODULE 9 will replace this applyFilters()
=============================================================*/

function applyFilters()
{
    const keyword = document
        .getElementById("txtSearch")
        .value
        .toLowerCase();

    const leikai = document
        .getElementById("cmbLeikai")
        .value;

    const filtered = App.currentRows.filter(row => {

        // Search all columns
        let found = Object.values(row).some(value =>
            String(value)
                .toLowerCase()
                .includes(keyword)
        );

        // Leikai filter
        if (leikai !== "" && row.leikai !== leikai)
            found = false;

        return found;

    });

    View.rows = filtered;

    renderTable();

    updateStatusBar(
        filtered.length,
        App.currentRows.length,
        View.title
    );
}

const Export = {

    pdf()
    {
        console.log(

            "PDF Export"

        );
    },

    excel()
    {
        console.log(

            "Excel Export"

        );
    }

};

const Print = {

    current()
    {
        console.log(

            "Print Current View"

        );
    }

};

function buildPrintReport()
{
    const container =
        document.getElementById("printReport");

    if (!container)
    {
        console.error("printReport container not found.");
        return;
    }

    const title =
        View.title || "Report";

    const columns =
        View.columns || [];

    const rows =
        View.rows || [];

    if (rows.length === 0)
    {
        container.innerHTML = `
            <div class="print-header">
                <h2>${escapeHTML(title)}</h2>
            </div>

            <div class="print-generated">
                Generated : ${new Date().toLocaleString("en-IN")}
            </div>

            <p>No records available.</p>
        `;

        return;
    }


    /* ==========================
       CHECK GRAND TOTAL REPORT
    ========================== */

    const isGrandTotal =
        title.toLowerCase().includes("grand total");


    /* ==========================
       REPORT CLASS
    ========================== */

    const reportClass =
        isGrandTotal
            ? "print-report grand-total-report"
            : "print-report";


    let html = `

        <div
            class="${reportClass}"
            data-orientation="${isGrandTotal
                ? "landscape"
                : "portrait"}"
        >

            <!-- REPORT HEADER -->

            <div class="print-header">

                <h2>
                    ${escapeHTML(title)}
                </h2>

            </div>


            <!-- GENERATED DATE -->

            <div class="print-generated">

                Generated :
                ${new Date().toLocaleString(
                    "en-IN",
                    {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: true
                    }
                )}

            </div>


           

            <table class="print-table">

                <thead>

                    <tr>
    `;


    /* ==========================
       COLUMN HEADINGS
    ========================== */

    columns.forEach(col =>
    {
        html += `
            <th>
                ${escapeHTML(col.title)}
            </th>
        `;
    });


    html += `
                    </tr>

                </thead>

                <tbody>
    `;


    /* ==========================
       DATA ROWS
    ========================== */

    rows.forEach(row =>
    {
        const isTotal =
            row.leikai === "GRAND TOTAL";


        html += `
            <tr class="${
                isTotal
                    ? "grand-total-row"
                    : ""
            }">
        `;


        columns.forEach(col =>
        {
            let value =
                row[col.field];


            if (
                value === undefined ||
                value === null
            )
            {
                value = "";
            }


            if (
                col.format === "number" ||
                col.format === "currency"
            )
            {
                value =
                    formatNumber(value);
            }


            const align =
                col.align || "left";


            html += `
                <td
                    style="text-align:${align}"
                >
                    ${escapeHTML(
                        String(value)
                    )}
                </td>
            `;
        });


        html += `
            </tr>
        `;
    });


    html += `

                </tbody>

            </table>

        </div>
    `;


    container.innerHTML = html;


    console.log(
        "Print report generated:",
        title
    );

    console.log(
        "Orientation:",
        isGrandTotal
            ? "Landscape"
            : "Portrait"
    );
}




/*------------------------------------
Grand Total Table 
/*------------------------------------*/

function openGrandTotal()
{
    console.log("Grand Total opened");
	const leikaiMap = {};
	
    // Build Leikai-wise totals
    App.data.memberDirectory.forEach(member => {

        const leikai = member.leikai || "Unknown";

        if (!leikaiMap[leikai])
        {
            leikaiMap[leikai] = {

                leikai : leikai,

                freeWill : 0,

                faithPromise : 0,

                employeeSubscription : 0,

                nonEmployeeSubscription : 0,

                windows : 0,

                cpc : 0,

                pillars : 0,

                tiles : 0,

                savingBox : 0,

                amount : 0

            };
        }

        const row = leikaiMap[leikai];

        row.freeWill += Number(member.freeWill) || 0;

        row.faithPromise += Number(member.faithPromise) || 0;

        row.employeeSubscription +=
            (Number(member.phase1) || 0) +
            (Number(member.phase2) || 0) +
            (Number(member.phase3) || 0) +
            (Number(member.phase4) || 0) +
            (Number(member.phase5) || 0);

        row.nonEmployeeSubscription +=
            (Number(member.phaseA) || 0) +
            (Number(member.phaseB) || 0) +
            (Number(member.phaseC) || 0) +
            (Number(member.phaseD) || 0) +
            (Number(member.phaseE) || 0);

        row.windows += Number(member.windows) || 0;

        row.cpc += Number(member.cpc) || 0;

        row.pillars += Number(member.pillars) || 0;

        row.tiles += Number(member.tiles) || 0;

        row.savingBox += Number(member.savingBox) || 0;

    });

    // Convert object to array
    const rows = Object.values(leikaiMap);
	console.log(rows);
	
rows.sort((a,b) =>
{
    return (Number(b.amount) || 0) -
            (Number(a.amount) || 0);
});


for (let i = 0; i < rows.length; i++)
{
    rows[i].sl = i + 1;
}

    // Grand Total row
    const totals = {

        leikai : "GRAND TOTAL",

        freeWill : 0,

        faithPromise : 0,

        employeeSubscription : 0,

        nonEmployeeSubscription : 0,

        windows : 0,

        cpc : 0,

        pillars : 0,

        tiles : 0,

        savingBox : 0,

        amount : 0

    };

    // Calculate row totals and column totals
    rows.forEach(r => {

        r.amount =
            r.freeWill +
            r.faithPromise +
            r.employeeSubscription +
            r.nonEmployeeSubscription +
            r.windows +
            r.cpc +
            r.pillars +
            r.tiles +
            r.savingBox;

        totals.freeWill += r.freeWill;

        totals.faithPromise += r.faithPromise;

        totals.employeeSubscription += r.employeeSubscription;

        totals.nonEmployeeSubscription += r.nonEmployeeSubscription;

        totals.windows += r.windows;

        totals.cpc += r.cpc;

        totals.pillars += r.pillars;

        totals.tiles += r.tiles;

        totals.savingBox += r.savingBox;

        totals.amount += r.amount;

    });


    // Append Grand Total row
    rows.push(totals);

    // Display

console.log("Rows created:", rows.length);
console.table(rows);
console.log("First row:", rows[0]);



    renderDirectory({

        title : "Leikai-wise Contribution Summary",

        rows : rows,

        totalAmount : totals.amount,

        columns : [

            {
                field : "leikai",
                title : "Leikai"
            },

            {
                field : "freeWill",
                title : "Free Will",
                align : "right",
                format : "currency"
            },

            {
                field : "faithPromise",
                title : "Faith Promise",
                align : "right",
                format : "currency"
            },

            {
                field : "employeeSubscription",
                title : "Employee Subscription",
                align : "right",
                format : "currency"
            },

            {
                field : "nonEmployeeSubscription",
                title : "Non-Employee Subscription",
                align : "right",
                format : "currency"
            },

            {
                field : "windows",
                title : "Windows",
                align : "right",
                format : "currency"
            },

            {
                field : "cpc",
                title : "CPC",
                align : "right",
                format : "currency"
            },

            {
                field : "pillars",
                title : "Pillars",
                align : "right",
                format : "currency"
            },

            {
                field : "tiles",
                title : "Tiles",
                align : "right",
                format : "currency"
            },

            {
                field : "savingBox",
                title : "Saving Box",
                align : "right",
                format : "currency"
            },

            {
                field : "amount",
                title : "Grand Total",
                align : "right",
                format : "currency"
            }

        ],

        toolbar : {

            search : "Search Leikai"

        }

    });

}

function updateLastUpdated(saveTime = false)
{
    const element =
        document.getElementById("lastUpdated");

    if (!element)
        return;

    if (saveTime)
    {
        localStorage.setItem(
            "cpcLastUpdated",
            new Date().toISOString()
        );
    }

    const savedTime =
        localStorage.getItem("cpcLastUpdated");

    if (!savedTime)
    {
        element.textContent = "Not available";
        return;
    }

    const date =
        new Date(savedTime);

    element.textContent =
        date.toLocaleString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true
        });
}

function openEmployeeSubscription()
{
    console.log("Opening Employee Subscription");

    const rows = [];
	let serial = 1;

    App.data.memberDirectory.forEach(member =>
    {
        const phase1 = Number(member.phase1) || 0;
        const phase2 = Number(member.phase2) || 0;
        const phase3 = Number(member.phase3) || 0;
        const phase4 = Number(member.phase4) || 0;
        const phase5 = Number(member.phase5) || 0;

        const employeeSubscription =
            phase1 +
            phase2 +
            phase3 +
            phase4 +
            phase5;

        if (employeeSubscription > 0)
{
    rows.push({
		
		sl: serial++,
        member: member.member || "",
        leikai: member.leikai || "",

        phase1: phase1,
        phase2: phase2,
        phase3: phase3,
        phase4: phase4,
        phase5: phase5,

        employeeSubscription:
            employeeSubscription
    });
}
    });


    console.log(
        "Employee Subscription rows:",
        rows
    );


    const totalAmount =
        rows.reduce(
            (sum, row) =>
                sum + row.employeeSubscription,
            0
        );


    console.log(
        "Employee Subscription total:",
        totalAmount
    );

    /* =========================================
   SORT TOTAL — HIGHEST TO LOWEST
========================================= */

rows.sort((a, b) =>
{
    return (Number(b.employeeSubscription) || 0) -
           (Number(a.employeeSubscription) || 0);
});


/* =========================================
   RE-NUMBER SL NO
========================================= */

for (let i = 0; i < rows.length; i++)
{
    rows[i].sl = i + 1;
}

const grandTotal = {

    member: "GRAND TOTAL",

    leikai: "",

    phase1: rows.reduce(
        (sum, row) => sum + row.phase1,
        0
    ),

    phase2: rows.reduce(
        (sum, row) => sum + row.phase2,
        0
    ),

    phase3: rows.reduce(
        (sum, row) => sum + row.phase3,
        0
    ),

    phase4: rows.reduce(
        (sum, row) => sum + row.phase4,
        0
    ),

    phase5: rows.reduce(
        (sum, row) => sum + row.phase5,
        0
    ),

    employeeSubscription: rows.reduce(
        (sum, row) =>
            sum + row.employeeSubscription,
        0
    )
};

rows.push(grandTotal);

    renderDirectory({

        title: "Employee Subscription",

        rows: rows,

        totalAmount: totalAmount,

        columns: [
		
			{ 	field: "sl",
				title: "Sl No",
				align: "center"
			},

            {
                field: "member",
                title: "Member Name",
                align: "left"
            },

            {
                field: "leikai",
                title: "Leikai",
                align: "left"
            },

            {
                field: "phase1",
                title: "Phase 1",
                align: "right",
                format: "currency"
            },

            {
                field: "phase2",
                title: "Phase 2",
                align: "right",
                format: "currency"
            },

            {
                field: "phase3",
                title: "Phase 3",
                align: "right",
                format: "currency"
            },

            {
                field: "phase4",
                title: "Phase 4",
                align: "right",
                format: "currency"
            },

            {
                field: "phase5",
                title: "Phase 5",
                align: "right",
                format: "currency"
            },

            {
                field: "employeeSubscription",
                title: "Total",
                align: "right",
                format: "currency"
            }

        ],

        toolbar:
        {
            search: "Search Member"
        }

    });
}

function openNonEmployeeSubscription()
{
    console.log("Opening Non-Employee Subscription");

    const rows = [];
	let serial = 1;

    App.data.memberDirectory.forEach(member =>
    {
        const phaseA = Number(member.phaseA) || 0;
        const phaseB = Number(member.phaseB) || 0;
        const phaseC = Number(member.phaseC) || 0;
        const phaseD = Number(member.phaseD) || 0;
        const phaseE = Number(member.phaseE) || 0;

        const total =
            phaseA +
            phaseB +
            phaseC +
            phaseD +
            phaseE;


        /*
           =========================================
           ONLY INCLUDE MEMBERS WITH CONTRIBUTION
           =========================================
        */

        if (total > 0)
        {
            rows.push({
				
				sl: serial++,

                member: member.member || "",

                leikai: member.leikai || "",

                phaseA: phaseA,

                phaseB: phaseB,

                phaseC: phaseC,

                phaseD: phaseD,

                phaseE: phaseE,

                nonEmployeeSubscription: total

            });
        }

    });


    /*
       =========================================
       TOTAL AMOUNT
       =========================================
    */

    const totalAmount =
        rows.reduce(
            (sum, row) =>
                sum + row.nonEmployeeSubscription,
            0
        );


    console.log(
        "Non-Employee contribution rows:",
        rows.length
    );

    console.log(
        "Non-Employee total:",
        totalAmount
    );

/* =========================================
   SORT TOTAL — HIGHEST TO LOWEST
========================================= */

rows.sort((a, b) =>
{
    return (Number(b.nonEmployeeSubscription) || 0) -
           (Number(a.nonEmployeeSubscription) || 0);
});


/* =========================================
   RE-NUMBER SL NO
========================================= */

for (let i = 0; i < rows.length; i++)
{
    rows[i].sl = i + 1;
}

    const grandTotal = {

    member: "GRAND TOTAL",

    leikai: "",

    phaseA: rows.reduce(
        (sum, row) => sum + row.phaseA,
        0
    ),

    phaseB: rows.reduce(
        (sum, row) => sum + row.phaseB,
        0
    ),

    phaseC: rows.reduce(
        (sum, row) => sum + row.phaseC,
        0
    ),

    phaseD: rows.reduce(
        (sum, row) => sum + row.phaseD,
        0
    ),

    phaseE: rows.reduce(
        (sum, row) => sum + row.phaseE,
        0
    ),

    nonEmployeeSubscription: rows.reduce(
        (sum, row) =>
            sum + row.nonEmployeeSubscription,
        0
    )
};

rows.push(grandTotal);

    renderDirectory({

        title: "Non-Employee Subscription",

        rows: rows,

        totalAmount: totalAmount,

        columns: [
		
			{	field: "sl",
				title: "Sl No",
				align: "center"
			},

            {
                field: "member",
                title: "Member Name",
                align: "left"
            },

            {
                field: "leikai",
                title: "Leikai",
                align: "left"
            },

            {
                field: "phaseA",
                title: "Phase A",
                align: "right",
                format: "currency"
            },

            {
                field: "phaseB",
                title: "Phase B",
                align: "right",
                format: "currency"
            },

            {
                field: "phaseC",
                title: "Phase C",
                align: "right",
                format: "currency"
            },

            {
                field: "phaseD",
                title: "Phase D",
                align: "right",
                format: "currency"
            },

            {
                field: "phaseE",
                title: "Phase E",
                align: "right",
                format: "currency"
            },

            {
                field: "nonEmployeeSubscription",
                title: "Total",
                align: "right",
                format: "currency"
            }

        ],

        toolbar:
        {
            search: "Search Member"
        }

    });
}