# Supplier Evidence Access Cell Suppression Control Platform

## The Problem

Supplier evidence tables can expose confidential patterns through small cells, even when the table contains no direct identifiers. A release decision needs proof that disclosure scanning and suppression planning occurred before the table became available.

## The Solution

This service governs table release through a disclosure scan, suppression-plan review, privacy approval, and release certification. It validates a positive minimum cell count, applies role-based state transitions, and preserves an atomic audit trail.

## Live Demo and Tech Stack

Run the health endpoint at `http://localhost:65523/health`. The service uses Node.js 22, Express 5, atomic JSON persistence, Vitest, and GitHub Actions.

## Local Setup and Run Instructions

```bash
npm install
npm test
npm start
```

Lifecycle requests use `x-actor-id` and `x-actor-role` headers. The server binds to `0.0.0.0` for controlled LAN access.

## System Documentation

### System Architecture Diagram
```mermaid
flowchart LR
  O[Evidence owner] --> A[Express API]
  A --> D[Cell suppression domain]
  D --> J[Atomic JSON store]
  X[Disclosure analyst] --> A
  S[Data steward] --> A
  C[Release certifier] --> A
```

### Entity-Relationship Diagram
```mermaid
erDiagram
  CELL_SUPPRESSION_CASE ||--o{ AUDIT_EVENT : records
  CELL_SUPPRESSION_CASE {
    string id
    string supplier
    string evidenceReference
    int minimumCellCount
    string status
  }
  AUDIT_EVENT {
    string type
    string actorId
    string occurredAt
  }
```

### Data Flow Diagram
```mermaid
flowchart LR
  T[Table purpose] --> S[Submission]
  S --> D[Disclosure scan]
  D --> P[Suppression plan]
  P --> A[Authority approval]
  A --> C[Release certificate]
```

### Use Case Diagram
```mermaid
flowchart TB
  Owner[Evidence owner] --> Submit[Submit table case]
  Analyst[Disclosure analyst] --> Scan[Scan disclosure risk]
  Steward[Data steward] --> Review[Review suppression plan]
  Authority[Privacy authority] --> Approve[Approve table]
  Certifier[Release certifier] --> Certify[Certify release]
```

### Sequence Diagram
```mermaid
sequenceDiagram
  participant O as Owner
  participant A as API
  participant D as Domain service
  participant J as Atomic store
  O->>A: Submit table purpose and cell threshold
  A->>D: Validate input and owner role
  D->>J: Persist submitted table case
  J-->>A: Stored record
  A-->>O: Case identifier and status
```

## Owner

Created and maintained by Kholipha Ahmmad Al-Amin.

Software Engineer and AI Specialist

Founder and CEO of EquiSaaS BD

Principal Consultant at AR IT Consultancy

Full Stack Developer and SaaS Product Builder

### Official links

Portfolio: https://kholipha-ahmmad-al-amin.equisaas-bd.com/

GitHub: https://github.com/kholipha-ahmmad-al-amin

LinkedIn: https://www.linkedin.com/in/kholipha-ahmmad-al-amin

X: https://x.com/al_amin5519

Facebook: https://www.facebook.com/kholipha.ahmmad.al.amin

Instagram: https://www.instagram.com/kholipha.ahmmad.al.amin

## Ownership

This project was created and is maintained by Kholipha Ahmmad Al-Amin.
