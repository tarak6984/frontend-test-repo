# Audit Vault

> A centralized compliance document management system that brings order to chaos.

## The Story of Audit Vault

### The Problem

Investment funds (mutual funds, hedge funds, ETFs, etc.) are heavily regulated. They must submit tons of compliance documentation:

- Quarterly and annual reports
- Risk disclosures
- Regulatory filings
- KIIDs (Key Investor Information Documents)
- Legal contracts
- Internal memos

### The Old Way

- Documents scattered across emails, shared drives, Google Docs
- No tracking of who reviewed what
- No audit trail
- Missing deadlines
- Confusion about document status
- Auditors asking "Where's the Q3 report?"
- Compliance officers scrambling through folders

### The Solution

A centralized compliance document management system that brings order to chaos.

---

## About the System

Audit Vault is an internal web application used by a large asset management company to manage all audit and compliance documents related to their investment funds.

It centralizes:

- External audit reports
- Compliance certificates
- Regulatory filings
- Risk disclosures
- Internal review documents

The system is used daily by **auditors**, **compliance teams**, and **fund managers** to ensure that every fund is compliant, traceable, and audit-ready at any time.

## Core Concepts & Entities

### 1. Fund

Represents an investment fund.

- `id`, `code` (e.g. US_EQ_LARGE_CAP), `name`, `region`, `currency`

### 2. Document

Represents an audit/compliance document.

- `id`, `title`, `fundId`, `type` (e.g. ANNUAL_REPORT, RISK_DISCLOSURE)
- `status` (PENDING, IN_REVIEW, APPROVED, REJECTED, ARCHIVED)
- `periodStart` / `periodEnd`
- `fileKey` (storage reference)

### 3. User & Roles

- **Auditor**: Broad access, can review and approve.
- **Compliance Officer**: Can upload and manage documents.
- **Fund Manager**: Read-only access to assigned funds.
- **Admin**: Full system configuration.

### 4. Audit Trail

Keeps record of every change (status updates, uploads) for accountability.

## Key Features

### Documents Dashboard

A central list view for all documents, featuring:

- Pagination and sorting (by Date, Type, Status)
- Advanced filtering (Fund, Type, Status, Period)
- Quick search

### Document Detail View

- Full metadata display
- Status history timeline (Created -> In Review -> Approved)
- Download capability

### Upload & Registration

Compliance Officers can upload new documents, assigning them to specific funds and periods.

### Workflow Management

Status transitions ensure proper review cycles:
`PENDING` -> `IN_REVIEW` -> `APPROVED` (or `REJECTED`)

### Fund-Centric View

An overview page for each fund showing documents grouped by year/period, highlighting missing items.

## User Stories

### 🧑‍💼 As a Fund Manager

- **View Funds:** I want to see a dashboard of all my assigned funds to monitor their compliance status at a glance.
- **Track Progress:** I need to track the status of submitted documents (Pending -> Approved) to ensure deadlines are met.
- **Access Documents:** I want to easily search and download approved audit reports to share them with investors.
- **Visual Analytics:** I want to see charts and trends showing my funds' document completion rates over time.

### 👮‍♀️ As a Compliance Officer

- **Upload Management:** I want to upload multiple compliance documents at once and tag them to the correct funds and periods.
- **Review Workflow:** I need a queue of "Pending" documents where I can review details, approve valid filings, or reject incorrect ones.
- **Quality Control:** I want to provide rejection reasons so that uploaders know exactly what needs to be fixed.
- **Audit Trail:** I need the system to log who uploaded and approved every document for accountability.

### 🕵️‍♂️ As an Auditor

- **Global Access:** I require read-only access to all funds and documents across the organization to conduct independent audits.
- **Advanced Search:** I want to filter documents by specific regulatory types (e.g., "annual_report") and date ranges.
- **Compliance Verification:** I need to verify that all required documents for a specific fiscal period are present and approved.

### 🔑 As an Admin

- **User Management:** I want to approve new account registrations and assign appropriate roles (Manager, Auditor, etc.).
- **System Oversight:** I need a high-level view of system activity, including recent uploads and user logins.
- **Configuration:** I want to manage global settings and fund definitions.

---

## Getting Started

Follow these instructions to run the project locally.

### Prerequisites

- Node.js (v18+)
- npm

### Installation

1.  **Backend Setup**

    ```bash
    cd backend
    npm install
    # Ensure your .env file is configured (copy .env.example if available)
    ```

2.  **Frontend Setup**
    ```bash
    cd frontend
    npm install
    ```

### Running the Application

1.  **Start the database**

    ```bash
    cd backend
    docker compose up -d
    ```

2.  **Start the Backend**

    ```bash
    cd backend
    npm run start:dev
    ```

    The backend server will typically run on `http://localhost:3000` (or as configured).

3.  **Start the Frontend**
    ```bash
    cd frontend
    npm run dev
    ```
    The frontend application will be available at `http://localhost:3001`.

## Test Credentials

Use the following credentials to test the different user roles:

| Role                   | Email                       | Password      |
| ---------------------- | --------------------------- | ------------- |
| **Admin**              | `admin@auditvault.com`      | `password123` |
| **Fund Manager**       | `manager@funds.com`         | `password123` |
| **Auditor**            | `auditor@auditvault.com`    | `password123` |
| **Compliance Officer** | `compliance@auditvault.com` | `password123` |
