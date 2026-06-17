from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, KeepTogether
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from datetime import date

OUT = "D:\\ONGC RAM proj\\Vanna_AI_Platform_Guide.pdf"

ONGC_RED   = colors.HexColor("#CC0000")
DARK_BG    = colors.HexColor("#0f1117")
CARD_BG    = colors.HexColor("#111827")
BORDER     = colors.HexColor("#1f2937")
MUTED      = colors.HexColor("#6b7280")
TEXT_LIGHT = colors.HexColor("#f9fafb")
GREEN      = colors.HexColor("#22c55e")
CYAN       = colors.HexColor("#22d3ee")
STEP_BG    = colors.HexColor("#1a0000")

doc = SimpleDocTemplate(
    OUT, pagesize=A4,
    leftMargin=2*cm, rightMargin=2*cm,
    topMargin=2.2*cm, bottomMargin=2*cm,
    title="Vanna AI Platform - User Guide",
    author="ONGC IT Team"
)

styles = getSampleStyleSheet()

def sty(name, **kw):
    return ParagraphStyle(name, **kw)

S = {
    "title":   sty("title",   fontName="Helvetica-Bold",   fontSize=26, textColor=ONGC_RED,   spaceAfter=4),
    "sub":     sty("sub",     fontName="Helvetica",        fontSize=13, textColor=MUTED,       spaceAfter=20),
    "h1":      sty("h1",      fontName="Helvetica-Bold",   fontSize=15, textColor=ONGC_RED,   spaceBefore=18, spaceAfter=6),
    "h2":      sty("h2",      fontName="Helvetica-Bold",   fontSize=12, textColor=colors.HexColor("#f3f4f6"), spaceBefore=10, spaceAfter=4),
    "body":    sty("body",    fontName="Helvetica",        fontSize=10, textColor=colors.HexColor("#d1d5db"), spaceAfter=4, leading=15),
    "mono":    sty("mono",    fontName="Courier",          fontSize=9,  textColor=CYAN,        spaceAfter=6, leading=13),
    "tip":     sty("tip",     fontName="Helvetica",        fontSize=9,  textColor=colors.HexColor("#fbbf24"), spaceAfter=6, leading=14),
    "label":   sty("label",   fontName="Helvetica-Bold",   fontSize=9,  textColor=MUTED,       spaceAfter=2),
    "white":   sty("white",   fontName="Helvetica",        fontSize=10, textColor=TEXT_LIGHT,  spaceAfter=4, leading=15),
    "step_no": sty("step_no", fontName="Helvetica-Bold",   fontSize=36, textColor=ONGC_RED,   leading=40),
    "step_h":  sty("step_h",  fontName="Helvetica-Bold",   fontSize=18, textColor=TEXT_LIGHT,  spaceAfter=4),
    "step_d":  sty("step_d",  fontName="Helvetica",        fontSize=10, textColor=MUTED),
    "green":   sty("green",   fontName="Helvetica",        fontSize=10, textColor=GREEN,       spaceAfter=3, leading=15),
    "cyan":    sty("cyan",    fontName="Helvetica",        fontSize=10, textColor=CYAN,        spaceAfter=3, leading=15),
}

def hr(color=ONGC_RED, thickness=1):
    return HRFlowable(width="100%", thickness=thickness, color=color, spaceAfter=10, spaceBefore=4)

def sp(n=8):
    return Spacer(1, n)

def cred_table(pairs):
    rows = [[Paragraph(k, S["label"]), Paragraph(v, S["mono"])] for k, v in pairs]
    t = Table(rows, colWidths=[4*cm, 12*cm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), CARD_BG),
        ("BOX",        (0,0), (-1,-1), 0.5, BORDER),
        ("INNERGRID",  (0,0), (-1,-1), 0.3, BORDER),
        ("ROWPADDING", (0,0), (-1,-1), 6),
        ("VALIGN",     (0,0), (-1,-1), "MIDDLE"),
    ]))
    return t

def step_header(num, title, desc):
    num_cell  = Paragraph(num, S["step_no"])
    head_cell = [Paragraph(title, S["step_h"]), Paragraph(desc, S["step_d"])]
    t = Table([[num_cell, head_cell]], colWidths=[2*cm, 14*cm])
    t.setStyle(TableStyle([
        ("VALIGN",        (0,0), (-1,-1), "MIDDLE"),
        ("TOPPADDING",    (0,0), (-1,-1), 8),
        ("BOTTOMPADDING", (0,0), (-1,-1), 8),
        ("BACKGROUND",    (0,0), (-1,-1), STEP_BG),
        ("BOX",           (0,0), (-1,-1), 0.5, ONGC_RED),
        ("LEFTPADDING",   (0,0), (0,0), 14),
        ("LEFTPADDING",   (1,0), (1,0), 12),
    ]))
    return t

def bullets(items, color=None, prefix="  *"):
    if color is None:
        color = GREEN
    rows = []
    for txt in items:
        rows.append([
            Paragraph(prefix, sty("_b", fontName="Helvetica-Bold", fontSize=10, textColor=color)),
            Paragraph(txt, S["body"])
        ])
    t = Table(rows, colWidths=[0.6*cm, 15.4*cm])
    t.setStyle(TableStyle([
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("TOPPADDING",    (0,0), (-1,-1), 2),
        ("BOTTOMPADDING", (0,0), (-1,-1), 2),
        ("LEFTPADDING",   (0,0), (-1,-1), 0),
    ]))
    return t

def action_table(rows_data):
    rows = []
    for n, txt in rows_data:
        rows.append([
            Paragraph(str(n), sty("_n", fontName="Helvetica-Bold", fontSize=11,
                                  textColor=ONGC_RED, alignment=TA_CENTER)),
            Paragraph(txt, S["white"])
        ])
    t = Table(rows, colWidths=[1*cm, 15*cm])
    t.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,-1), CARD_BG),
        ("BOX",           (0,0), (-1,-1), 0.5, BORDER),
        ("INNERGRID",     (0,0), (-1,-1), 0.3, BORDER),
        ("VALIGN",        (0,0), (-1,-1), "MIDDLE"),
        ("TOPPADDING",    (0,0), (-1,-1), 7),
        ("BOTTOMPADDING", (0,0), (-1,-1), 7),
        ("LEFTPADDING",   (0,0), (0,-1), 8),
        ("ALIGN",         (0,0), (0,-1), "CENTER"),
    ]))
    return t

def info_box(text, bg=CARD_BG, border=BORDER, mono=False):
    fn = "Courier" if mono else "Helvetica"
    ts = sty("_ib", fontName=fn, fontSize=9, textColor=CYAN if mono else colors.HexColor("#fbbf24"),
             leading=14 if mono else 13)
    t = Table([[Paragraph(text, ts)]], colWidths=[16*cm])
    t.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,-1), bg),
        ("BOX",           (0,0), (-1,-1), 0.5, border),
        ("TOPPADDING",    (0,0), (-1,-1), 8),
        ("BOTTOMPADDING", (0,0), (-1,-1), 8),
        ("LEFTPADDING",   (0,0), (-1,-1), 12),
        ("RIGHTPADDING",  (0,0), (-1,-1), 12),
    ]))
    return t

def red_table(header_row, data_rows, col_widths):
    data = [header_row] + data_rows
    t = Table(data, colWidths=col_widths)
    t.setStyle(TableStyle([
        ("BACKGROUND",  (0,0), (-1,0), ONGC_RED),
        ("TEXTCOLOR",   (0,0), (-1,0), colors.white),
        ("FONTNAME",    (0,0), (-1,0), "Helvetica-Bold"),
        ("FONTSIZE",    (0,0), (-1,-1), 9),
        ("BACKGROUND",  (0,1), (-1,-1), CARD_BG),
        ("TEXTCOLOR",   (0,1), (-1,-1), colors.HexColor("#d1d5db")),
        ("BOX",         (0,0), (-1,-1), 0.5, BORDER),
        ("INNERGRID",   (0,0), (-1,-1), 0.3, BORDER),
        ("ROWPADDING",  (0,0), (-1,-1), 6),
        ("VALIGN",      (0,0), (-1,-1), "MIDDLE"),
    ]))
    return t

story = []

# ── COVER ─────────────────────────────────────────────────────────────────────
logo_t = Table(
    [[Paragraph("ONGC", sty("_lg", fontName="Helvetica-Bold", fontSize=22,
                             textColor=colors.white, alignment=TA_CENTER))]],
    colWidths=[3*cm], rowHeights=[3*cm]
)
logo_t.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (0,0), ONGC_RED),
    ("VALIGN",     (0,0), (0,0), "MIDDLE"),
    ("ALIGN",      (0,0), (0,0), "CENTER"),
]))
story += [
    sp(28), logo_t, sp(18),
    Paragraph("Vanna AI Platform", S["title"]),
    Paragraph("AI-Powered Database Intelligence for ONGC", S["sub"]),
    hr(),
    Paragraph("Complete User Guide &amp; Platform Walkthrough", S["h2"]),
    sp(6),
    Paragraph(f"Prepared by: ONGC IT Team   |   Date: {date.today().strftime('%d %B %Y')}", S["body"]),
    sp(4),
    Paragraph("Confidential - Internal Use Only",
              sty("_c", fontName="Helvetica-Oblique", fontSize=9, textColor=MUTED)),
    sp(36),
    info_box(
        "Platform URL: http://localhost     |     "
        "Admin: admin@vanna-platform.local     |     "
        "Password: Admin@ONGC123",
        bg=STEP_BG, border=ONGC_RED, mono=True
    ),
]

# ── OVERVIEW ──────────────────────────────────────────────────────────────────
story += [
    sp(24), hr(),
    Paragraph("Platform Overview", S["h1"]),
    hr(BORDER, 0.5), sp(6),
    Paragraph(
        "Vanna AI is an intelligent database query platform built for ONGC. It allows engineers, "
        "analysts, and managers to query any connected database using plain English - no SQL "
        "knowledge required. The AI automatically converts your question into optimised SQL, "
        "executes it, and returns results as a table you can export to CSV.",
        S["body"]
    ),
    sp(8),
    Paragraph("Key Features:", S["h2"]),
    bullets([
        "<b>Natural Language to SQL</b> - Type any question in English; Vanna AI writes the SQL automatically",
        "<b>Multi-database support</b> - Connect PostgreSQL, Oracle, MySQL, SQL Server, or SQLite",
        "<b>Role-based access control</b> - 4 roles: super_admin, admin, analyst, viewer",
        "<b>Full audit trail</b> - Every query is logged with user, time, SQL, and result status",
        "<b>API access</b> - Generate tokens to query from Python scripts, Power BI, or Excel",
        "<b>Real-time dashboard</b> - Live stats on users, queries, success rates, and response times",
        "<b>ONGC branded UI</b> - Dark theme with ONGC red branding, runs fully on-premise in Docker",
    ]),
    sp(10),
    Paragraph("This guide covers 7 screens:", S["h2"]),
    action_table([
        ("1", "Login Page - authenticate into the platform"),
        ("2", "Dashboard - live analytics and platform stats"),
        ("3", "DB Profiles - connect and manage databases"),
        ("4", "Query Console - ask questions in English, get SQL results"),
        ("5", "Query History - full audit log of all queries"),
        ("6", "User Management - manage users and roles (admin only)"),
        ("7", "API Tokens - generate tokens for external API access"),
    ]),
]

# ── STEP 1 ────────────────────────────────────────────────────────────────────
story += [
    sp(18), hr(),
    step_header("1", "Login Page", "Authenticate into the Vanna AI platform"),
    sp(10),
    Paragraph("How to access the platform:", S["h2"]),
    action_table([
        ("1", "Open your web browser (Microsoft Edge or Chrome)"),
        ("2", "Navigate to: http://localhost"),
        ("3", "You will see the ONGC-branded Sign In page"),
        ("4", "Enter your Email Address in the first field"),
        ("5", "Enter your Password in the second field"),
        ("6", "Click the red <b>Sign In</b> button"),
        ("7", "You will be redirected to the Dashboard on successful login"),
    ]),
    sp(10),
    Paragraph("Default admin credentials (change after first login):", S["h2"]),
    cred_table([
        ("Email",    "admin@vanna-platform.local"),
        ("Password", "Admin@ONGC123"),
        ("Role",     "super_admin - full access to all features"),
        ("URL",      "http://localhost"),
    ]),
    sp(8),
    info_box(
        "WARNING: Change the default admin password immediately in production. "
        "Go to Profile settings after logging in.",
        bg=colors.HexColor("#2d1500"), border=colors.HexColor("#f59e0b")
    ),
    sp(8),
    Paragraph("What you see on the Login page:", S["h2"]),
    bullets([
        "ONGC logo with 'Energy: Now AND Next' tagline on the left decorative panel",
        "List of platform features on the left: Natural Language to SQL, Role-based access, Multi-DB support, Real-time analytics",
        "Sign In form on the right with Email and Password fields",
        "Red Sign In button",
        "Hint box at the bottom showing default credentials for reference",
        "Link to Create Account for new user self-registration",
    ]),
]

# ── STEP 2 ────────────────────────────────────────────────────────────────────
story += [
    sp(18), hr(),
    step_header("2", "Dashboard", "Live platform analytics and usage statistics"),
    sp(10),
    Paragraph(
        "After login you land on the Dashboard. This page shows live statistics fetched directly "
        "from the database in real time. All numbers update automatically as the platform is used.",
        S["body"]
    ),
    sp(8),
    Paragraph("The 7 Stat Cards shown on the Dashboard:", S["h2"]),
    red_table(
        ["Stat Card", "Current Value", "What It Means"],
        [
            ["Active Users (30d)", "2",    "Users who logged in during the last 30 days"],
            ["DB Profiles",        "0",    "Number of database connections configured"],
            ["Queries Today",      "0",    "Total queries run in the last 24 hours"],
            ["Active Tokens",      "0",    "API tokens currently active"],
            ["Success Rate",       "100%", "Percentage of queries completed successfully"],
            ["Failed Queries",     "0",    "Queries that failed or were blocked"],
            ["Avg Response",       "0 ms", "Average SQL query execution time"],
        ],
        [5*cm, 3*cm, 8*cm]
    ),
    sp(10),
    Paragraph("Charts below the stat cards:", S["h2"]),
    bullets([
        "<b>Query Volume (Last 7 Days)</b> - Bar chart showing daily query counts. Red bars = queries ran; flat gray = no queries that day",
        "<b>Most Queried Databases</b> - Horizontal bar breakdown of which database gets queried most. Populates after first queries are run",
    ]),
    sp(8),
    info_box(
        "INFO: The zeros are correct for a fresh installation. Once you add a Database Profile "
        "(Step 3) and run queries (Step 4), all these numbers will populate with real data.",
        bg=colors.HexColor("#0c1a2e"), border=CYAN
    ),
    sp(8),
    Paragraph("Left Sidebar (visible on every page):", S["h2"]),
    bullets([
        "Vanna AI logo and 'ONGC Platform' label at the top",
        "Navigation links: Dashboard, DB Profiles, Query Console, Query History, Users, API Tokens",
        "Your account name and role badge at the bottom (SUPER ADMIN in red for admins)",
        "The Users menu shows an 'ADMIN' badge - only visible to admin and super_admin roles",
    ], color=CYAN, prefix="  ->"),
]

# ── STEP 3 ────────────────────────────────────────────────────────────────────
story += [
    sp(18), hr(),
    step_header("3", "Database Profiles", "Connect your databases to the platform"),
    sp(10),
    Paragraph(
        "This is where you connect your actual databases. Without at least one database profile, "
        "the Query Console cannot run queries. Credentials are encrypted and stored securely.",
        S["body"]
    ),
    sp(8),
    Paragraph("How to add a new database connection:", S["h2"]),
    action_table([
        ("1", "Click <b>DB Profiles</b> in the left sidebar"),
        ("2", "Click the <b>+ Add Connection</b> button in the top right"),
        ("3", "Enter a Profile Name (e.g. 'ONGC Production DB')"),
        ("4", "Select the Database Type: PostgreSQL / Oracle / MySQL / SQL Server / SQLite"),
        ("5", "Enter Host / IP address (e.g. 192.168.1.10)"),
        ("6", "Enter Port number (PostgreSQL: 5432, Oracle: 1521, MySQL: 3306)"),
        ("7", "Enter Database Name or SID"),
        ("8", "Enter the database Username and Password"),
        ("9", "Click <b>Save</b> - the platform tests the connection and confirms it works"),
    ]),
    sp(10),
    Paragraph("Supported Database Types:", S["h2"]),
    red_table(
        ["Database", "Default Port", "Notes"],
        [
            ["PostgreSQL", "5432", "Recommended - best performance and compatibility"],
            ["Oracle",     "1521", "Connect using SID or Service Name"],
            ["MySQL",      "3306", "MySQL 5.7+ and MariaDB supported"],
            ["SQL Server", "1433", "Microsoft SQL Server 2016+"],
            ["SQLite",     "N/A",  "Local file path - no host or port needed"],
        ],
        [4*cm, 3.5*cm, 8.5*cm]
    ),
]

# ── STEP 4 ────────────────────────────────────────────────────────────────────
story += [
    sp(18), hr(),
    step_header("4", "Query Console", "Ask questions in English - AI converts to SQL and runs it"),
    sp(10),
    Paragraph(
        "This is the most powerful feature of the platform. Type a question in plain English "
        "and Vanna AI automatically generates the correct SQL, executes it against your "
        "connected database, and returns the results as a table.",
        S["body"]
    ),
    sp(8),
    Paragraph("How to run a query:", S["h2"]),
    action_table([
        ("1", "Click <b>Query Console</b> in the left sidebar"),
        ("2", "Select your database from the dropdown at the top right"),
        ("3", "Type your question in plain English in the text box"),
        ("4", "Click the red <b>Run Query</b> button"),
        ("5", "Vanna AI generates the SQL - displayed below your question"),
        ("6", "The query executes and results appear as a table"),
        ("7", "Click <b>Export CSV</b> to download the data as a spreadsheet"),
        ("8", "Click <b>Copy SQL</b> to copy the generated SQL to clipboard"),
    ]),
    sp(10),
    Paragraph("Example questions you can ask:", S["h2"]),
    red_table(
        ["English Question", "What Vanna AI Does"],
        [
            ["Show total production by well for the last 30 days",
             "GROUP BY query on well_production table with date filter"],
            ["List all active wells with production above 1000 barrels",
             "SELECT with WHERE clause and numeric filter"],
            ["Count drilling rigs by region",
             "COUNT aggregation with GROUP BY region"],
            ["Show me the top 10 employees by salary",
             "ORDER BY salary DESC with LIMIT 10"],
            ["What is the total revenue this month",
             "SUM aggregation with current month date filter"],
        ],
        [7.5*cm, 8.5*cm]
    ),
    sp(10),
    Paragraph("Example of generated SQL:", S["h2"]),
    info_box(
        "SELECT well_name, SUM(production_bbls) AS total_production\n"
        "FROM well_production\n"
        "WHERE prod_date >= CURRENT_DATE - INTERVAL '30 days'\n"
        "GROUP BY well_name\n"
        "ORDER BY total_production DESC;",
        bg=DARK_BG, border=CYAN, mono=True
    ),
    sp(6),
    info_box(
        "INFO: You must add at least one Database Profile (Step 3) before queries can run.",
        bg=colors.HexColor("#0c1a2e"), border=CYAN
    ),
]

# ── STEP 5 ────────────────────────────────────────────────────────────────────
story += [
    sp(18), hr(),
    step_header("5", "Query History", "Full audit log of every query ever run"),
    sp(10),
    Paragraph(
        "The Query History page gives a complete log of every query run on the platform. "
        "Essential for auditing, compliance, and debugging. Admins see all users' queries; "
        "regular users see only their own queries.",
        S["body"]
    ),
    sp(8),
    Paragraph("Information shown for each query:", S["h2"]),
    bullets([
        "<b>Natural Language Question</b> - the original English question asked",
        "<b>Database</b> - which database profile was queried",
        "<b>Status</b> - success (green) / failed (red) / blocked (orange)",
        "<b>Execution Time</b> - how long the SQL took to run in milliseconds",
        "<b>User</b> - who ran the query (email address)",
        "<b>Timestamp</b> - exact date and time the query was run",
        "<b>Generated SQL</b> - the full SQL query that was generated and executed",
    ]),
    sp(8),
    Paragraph("How to access query history:", S["h2"]),
    action_table([
        ("1", "Click <b>Query History</b> in the left sidebar (clock icon)"),
        ("2", "Browse the list - most recent queries appear at the top"),
        ("3", "Click any row to expand it and see the full generated SQL"),
        ("4", "Filter by date, user, database, or status to find specific queries"),
    ]),
]

# ── STEP 6 ────────────────────────────────────────────────────────────────────
story += [
    sp(18), hr(),
    step_header("6", "User Management", "Manage users and access roles  (Admin only)"),
    sp(10),
    Paragraph(
        "Only visible to admin and super_admin users. Allows creating new user accounts, "
        "assigning roles, and activating or deactivating access to the platform.",
        S["body"]
    ),
    sp(8),
    Paragraph("User Roles and Their Permissions:", S["h2"]),
    red_table(
        ["Role", "Access Level", "What They Can Do"],
        [
            ["super_admin", "Full",      "Everything - manage users, DB profiles, queries, tokens, settings"],
            ["admin",       "High",      "Manage users and DB profiles, view all users' query history"],
            ["analyst",     "Medium",    "Add DB profiles, run queries, view own query history"],
            ["viewer",      "Read-only", "View query results only - cannot run new queries"],
        ],
        [3*cm, 3*cm, 10*cm]
    ),
    sp(10),
    Paragraph("How to add a new user:", S["h2"]),
    action_table([
        ("1", "Click <b>Users</b> in the left sidebar (people icon with ADMIN badge)"),
        ("2", "Click the <b>+ Add User</b> button in the top right"),
        ("3", "Enter the user's Full Name"),
        ("4", "Enter their Email Address (this becomes their login username)"),
        ("5", "Set a temporary Password (user should change on first login)"),
        ("6", "Select their Role from the dropdown (analyst recommended for most staff)"),
        ("7", "Click <b>Save</b> - the user can log in immediately"),
    ]),
    sp(10),
    Paragraph("Users currently registered in the system:", S["h2"]),
    red_table(
        ["Full Name", "Email", "Role", "Status"],
        [
            ["Super Administrator", "admin@vanna-platform.local",   "super_admin", "Active"],
            ["Karthikeyan V",       "v.karthikeyan.ram@gmail.com",  "analyst",     "Active"],
        ],
        [4*cm, 6.5*cm, 3*cm, 2.5*cm]
    ),
]

# ── STEP 7 ────────────────────────────────────────────────────────────────────
story += [
    sp(18), hr(),
    step_header("7", "API Tokens", "Generate tokens for external tool and script access"),
    sp(10),
    Paragraph(
        "API Tokens allow external systems - Python scripts, Power BI, Excel, Tableau, or any "
        "other tool - to query the Vanna AI platform programmatically without using the web "
        "interface. Each token can be named and given an expiry date.",
        S["body"]
    ),
    sp(8),
    Paragraph("How to create an API token:", S["h2"]),
    action_table([
        ("1", "Click <b>API Tokens</b> in the left sidebar (key icon)"),
        ("2", "Click the <b>+ Generate Token</b> button"),
        ("3", "Give the token a descriptive name (e.g. 'Python Analytics Script')"),
        ("4", "Set an expiry: 30 days / 90 days / 1 year / Never"),
        ("5", "Click <b>Generate</b> - the token is shown <b>ONCE ONLY</b> - copy it immediately!"),
        ("6", "Store the token securely - it cannot be retrieved again after closing the dialog"),
        ("7", "To revoke: find the token in the list and click Revoke"),
    ]),
    sp(10),
    Paragraph("How to use the token in a Python script:", S["h2"]),
    info_box(
        "import requests\n\n"
        "token = 'YOUR_API_TOKEN_HERE'\n"
        "response = requests.post(\n"
        "    'http://localhost/api/v1/query/ask',\n"
        "    headers={'Authorization': f'Bearer {token}'},\n"
        "    json={\n"
        "        'question': 'show total production by well',\n"
        "        'connection_id': 'your-db-profile-id'\n"
        "    }\n"
        ")\nprint(response.json())",
        bg=DARK_BG, border=CYAN, mono=True
    ),
    sp(6),
    info_box(
        "WARNING: Treat API tokens like passwords. Never share publicly or commit to source code.",
        bg=colors.HexColor("#2d1500"), border=colors.HexColor("#f59e0b")
    ),
]

# ── NEXT STEPS ────────────────────────────────────────────────────────────────
story += [
    sp(18), hr(),
    Paragraph("Next Steps - Getting Fully Live", S["h1"]),
    hr(BORDER, 0.5), sp(8),
    Paragraph("Complete these in order to make the platform production-ready for ONGC:", S["body"]),
    sp(8),
    action_table([
        ("1", "<b>Add a Database Profile</b> - DB Profiles -> + Add Connection -> enter your PostgreSQL or Oracle details -> Save"),
        ("2", "<b>Run your first query</b> - Query Console -> select database -> type a question -> Run Query -> verify results appear"),
        ("3", "<b>Create team accounts</b> - User Management -> + Add User -> create accounts for each team member with appropriate role"),
        ("4", "<b>Change admin password</b> - Profile Settings -> change from Admin@ONGC123 to a strong secure password"),
        ("5", "<b>Check Dashboard</b> - After running a few queries, confirm the stat cards and charts show real data"),
        ("6", "<b>Generate API Token</b> (optional) - If connecting from Python or Power BI, create a token in API Tokens"),
    ]),
    sp(16),
    hr(),
    Paragraph("System Requirements", S["h2"]),
    bullets([
        "Docker Desktop installed and running (Windows / Mac / Linux)",
        "Minimum 4 GB RAM allocated to Docker",
        "Port 80 available on the host machine",
        "Network access to your target databases from the Docker host",
    ], color=CYAN, prefix="  ->"),
    sp(20),
    hr(MUTED, 0.5),
    sp(4),
    Table(
        [[Paragraph("Vanna AI Platform  |  ONGC Internal  |  Confidential",
                     sty("_fl", fontName="Helvetica", fontSize=8, textColor=MUTED)),
          Paragraph(f"Generated: {date.today().strftime('%d %B %Y')}",
                     sty("_fr", fontName="Helvetica", fontSize=8, textColor=MUTED, alignment=TA_RIGHT))]],
        colWidths=[10*cm, 6*cm]
    ),
]

doc.build(story)
print("PDF created:", OUT)
