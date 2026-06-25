# User Manual
## Vanna AI Database Query Intelligence Platform

---

## Getting Started

### 1. Create an Account
Navigate to the platform URL and click **Register**. Fill in your email, username, and password (minimum 8 characters). After registration, log in with your credentials.

### 2. Create a Database Connection Profile
Go to **DB Profiles → New Profile** and fill in:
- **Profile Name**: A descriptive name (e.g., "HR MySQL Database")
- **Database Type**: PostgreSQL, MySQL, MSSQL, Oracle, or MongoDB
- **Host/IP**: Your database server address
- **Port**: Default ports are pre-filled per database type
- **Database Name**: The specific database to connect to
- **Username & Password**: Read-only database credentials (required)
- **SSL Mode**: Choose appropriate SSL setting for your environment

> **Note:** All connections are enforced as read-only in Phase-1. INSERT, UPDATE, DELETE, DROP operations are blocked for security.

### 3. Test Your Connection
After creating a profile, click the **test tube icon** to verify the connection. A green checkmark confirms successful connectivity.

### 4. Ingest Schema & Train AI
Go to **Schema Manager**, select your profile, and click **Ingest & Train AI**. This:
- Discovers all tables and columns
- Extracts foreign key relationships
- Trains the Vanna AI model on your specific schema
- Enables accurate natural language queries

This step must be completed before querying.

### 5. Generate an API Token
Go to **API Tokens → Generate Token**:
- Give it a name (e.g., "HR Assistant")
- Select the connection profile
- Set a rate limit (requests per minute)
- Optionally set an expiry date

**Copy the token immediately** — it is shown only once.

### 6. Query in Natural Language
Go to **Query Console**:
- Paste your API token in the token field
- Type your question in plain English
- Click **Run Query** or press **Ctrl+Enter**

**Example questions:**
- "Show total gatepasses created this month"
- "List all employees hired in 2024"
- "What are the top 10 departments by headcount?"
- "Show monthly revenue for the last 6 months"

The platform will:
1. Convert your question to SQL using AI
2. Validate the SQL for security
3. Execute it against your database
4. Return results in a table
5. Generate a plain-English summary

### 7. Export Results
After running a query, use the **CSV** or **Excel** buttons to download results.

---

## Business Glossary
In Schema Manager, add custom terms to improve AI accuracy:
- **Term**: "gatepass"
- **Definition**: "An authorization document for entry/exit"
- **Maps to Table**: "gatepasses"

This teaches the AI your company-specific terminology.

---

## Tips for Better Queries
- Be specific: "Show total orders in June 2024" is better than "Show orders"
- Use column/table names when known: "Count rows in employees table"
- Check "Include SQL explanation" to understand what SQL was generated
- Review the generated SQL before relying on results


## Extra
- A Chatbot Widget can be added by adding this code snippet

    `<script src="/scripts/chatbot-widget.js" async></script>`
