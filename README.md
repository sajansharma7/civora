# Civora — AI-Powered Civic Issue Detection, Verification, and Resolution Platform

Civora transforms fragmented community reports into unified, verified, prioritized, and resolvable civic intelligence. Built for modern municipalities and citizen empowerment.

---

## 🌟 The Civora Civic Lifecycle
```
REPORT → DUPLICATE DETECTION → COMMUNITY VERIFICATION → SMART PRIORITY → 
ORG ASSIGNMENT → FIELD WORK → BEFORE/AFTER EVIDENCE → CITIZEN REVERIFICATION → PUBLIC TRANSPARENCY
```

---

## 🚀 Key Features

1. **5-Step Citizen Issue Reporting Wizard (`/report`)**
   - Sector selection with 8 localized civic categories
   - Real-time AI category suggestion chip based on problem description
   - Interactive Leaflet GPS map with draggable pin & browser geolocation
   - Multi-photo evidence upload with client-side preview
   - Live AI duplicate detection warning before report submission

2. **AI Duplicate Detection Service (`/api/ai/check-duplicate`)**
   - Geospatial Haversine distance bounding-box search ($\le 350\text{m}$)
   - TF-IDF word n-gram text cosine similarity
   - Composite similarity scoring:
     $$\text{Score} = (0.50 \times \text{TextSimilarity}) + (0.30 \times \text{ProximityScore}) + (0.20 \times \text{CategoryMatch})$$
   - Automated modal warning encouraging citizens to confirm existing reports rather than fracturing duplicate complaints

3. **Deterministic Smart Priority Engine (0–100 Points)**
   - Severity Score (0–25 pts): `LOW` (5), `MEDIUM` (12), `HIGH` (20), `CRITICAL` (25)
   - Confirmations (0–20 pts): $\min(20, \text{confirmations} \times 2)$
   - Safety Risk (0–15 pts): `LOW` (0), `MEDIUM` (5), `HIGH` (10), `EXTREME` (15)
   - Affected Population (0–15 pts): $<50$ (3), $50\text{–}200$ (7), $201\text{–}500$ (11), $>500$ (15)
   - Issue Age Escalation (0–10 pts): $+1$ point per 2 days unresolved
   - Community Interest (0–5 pts): $\min(5, \lfloor\text{followers} / 3\rfloor)$
   - Emergency Override (+15 pts bonus, guarantees CRITICAL bracket)
   - Auto-generated human-readable audit justification

4. **Dynamic Community Confidence Formula (5%–99%)**
   $$\text{Confidence} = \text{clamp}\left(45 + \lfloor 8 \cdot \ln(1 + \text{confirmations}) \rfloor + (5 \times \text{photos}) - (15 \times \text{disputes}), 5, 99\right)$$

5. **Fullscreen Interactive Live Map (`/map`)**
   - Fullscreen Leaflet map using OpenStreetMap
   - Color-coded priority pins:
     - 🔴 Critical ($80\text{–}100$) with pulsating CSS ripple animation
     - 🟠 High ($60\text{–}79$)
     - 🟡 Medium ($35\text{–}59$)
     - 🟢 Resolved / Verified fix
   - Quick-switch viewports between Pokhara and Kathmandu
   - Floating drawer with multi-facet filters (Category, Status, Severity)

6. **Interactive Public Issue Detail & Before/After Slider (`/issues/[id]`)**
   - Real-time 5-stage lifecycle progress bar
   - Split-view draggable Before/After slider comparing reporter damage photo vs municipal repair photo
   - Community Action Hub: Confirm (+2 pts), Dispute with reason codes, Follow updates
   - Citizen Reverification Loop: Voting widget (Fixed / Partially Fixed / Still Exists) with auto-reopening if still exists $\ge 3$
   - Immutable audit trail (`IssueStatusHistory`)

7. **Organization SaaS Portal (`/org/[orgSlug]`)**
   - Executive KPI cards: Total Reports, Critical Hazards, Active In-Progress, Resolution Rate
   - Recharts analytics: Category breakdown & Lifecycle status funnel
   - Immediate dispatch queue with quick status transitions
   - Department auto-routing & field staff roster management (`/org/[orgSlug]/departments`)
   - Municipal subscription tiers (`/org/[orgSlug]/settings`)

8. **Citizen Reputation & Badges (`/citizen/profile`)**
   - Four reputation tiers: `New Contributor`, `Active Citizen`, `Civic Leader`, `Community Champion`
   - Progress bar to next tier
   - Badges: *First Voice*, *Neighborhood Watch*, *Trusted Neighbor*, *Impact Maker*, *Civic Pioneer*
   - Personal reported issues & followed issues tabs

9. **In-App Notification Center (`/api/notifications`)**
   - Real-time polling notification bell in Navbar
   - Status updates, community consensus alerts, and resolution vote requests

10. **Public Civic Transparency Dashboard (`/transparency`)**
    - Citywide KPIs, monthly resolution trends, and sector performance
    - Ward Response Leaderboard
    - Strict Zero-PII privacy protection standard

---

## 🛠️ Technology Stack

- **Framework:** Next.js 15+ (App Router, React 19)
- **Database:** MySQL 8.0+
- **ORM:** Prisma ORM 5.22.0
- **Authentication:** Auth.js (NextAuth v5 beta) with credentials & bcrypt
- **Styling:** Tailwind CSS v4, custom glassmorphism design tokens
- **Maps:** Leaflet.js with OpenStreetMap
- **Visualizations:** Recharts
- **Validation:** Zod schemas

---

## 🔑 Demo Login Credentials

| Role | Email | Password |
|---|---|---|
| **Platform Admin** | `admin@civora.org` | `Admin123!` |
| **Org Admin** | `pokhara.admin@civora.org` | `Pokhara123!` |
| **Org Staff** | `roads.staff@civora.org` | `Staff123!` |
| **Verified Citizen** | `aarav.sharma@gmail.com` | `Citizen123!` |

---

## 📦 Local Setup Instructions

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Start MySQL Database:**
   ```bash
   ./scripts/run-mysql.sh &
   ```

3. **Synchronize Schema & Seed Demo Data:**
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

4. **Launch Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.
