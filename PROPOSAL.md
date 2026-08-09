# Architecture Proposal

- **Team name:** Neural Ninjas
- **Team code:** TEAM-008
- **Track:** Strong Institutions
- **Members:**
  - Anirudhan C (@C-Anirudhan)
  - Bibin Sanju S (@BibinSanju)
  - Deepan Kumar E S (@deepankumar837)
  - Dharshini S (@dharshhinii)

## 1. Problem

The Right to Information (RTI) Act empowers citizens to request information from public authorities. However, many people struggle to use it because the process requires legal knowledge and proper document formatting. Citizens often ask questions such as *"Why is my road broken?"* instead of requesting official records, which can lead to rejection under Section 2(f) of the RTI Act. Many applicants also find it difficult to identify the correct Public Information Officer (PIO), especially when legal terminology and language barriers are involved. As a result, citizens lose time, confidence, and access to information they are legally entitled to receive.

This is a well-documented problem. Reports by **Satark Nagrik Sangathan (SNS)** and the **Commonwealth Human Rights Initiative (CHRI)** highlight common challenges such as incorrect drafting, difficulty identifying the appropriate Public Information Officer (PIO), and delays in the RTI process. Additionally, the Supreme Court's judgment in **Khanapuram Gandaiah v. Administrative Officer (2010)** clarified that RTI applications must request existing records rather than explanations or opinions under Section 2(f). These findings show that many valid RTI requests fail because citizens lack the legal knowledge required to draft them correctly.

---

## 2. Who It Helps

Our primary user is **Mr. Murugan**, a 52-year-old tea shop owner in Gandhipuram, Coimbatore. Overflowing sewage and damaged roads outside his shop affect his daily business, and he wants to seek accountability through an RTI application. However, he only speaks Tamil, is unfamiliar with legal terminology, and does not know which Public Information Officer (PIO) to contact. Instead of requesting official records, he may submit an emotional complaint that does not meet RTI requirements.

**RTI-GPT** helps Mr. Murugan convert his concern into a legally structured RTI request in Tamil or English, identifies the appropriate public authority, and generates a print-ready RTI application, making the process simpler and more accessible. The solution can also benefit any citizen filing an RTI application for the first time.

---

## 3. Proposed Solution

**RTI-GPT** is a civic grievance and AI-assisted RTI routing platform. Instead of instantly filing a legal document, we follow a deterministic escalation ladder to solve the citizen's problem faster:

- **AI Triage:** The user speaks or types their issue in Tamil/English. Gemini classifies the issue (e.g., Road Infrastructure) and extracts their specific Ward (1-100).
- **Immediate Local Routing:** The app instantly maps the Ward to the specific Assistant Engineer's (AE) verified phone number. The citizen is encouraged to call them directly.
- **SLA Tracking Magic Links:** The citizen receives a personalized tracking link. If the AE doesn't resolve the issue within the SLA, the app escalates it to the Zonal Executive Engineer (EE).
- **The RTI Fallback:** If local governance fails, the AI automatically drafts a strictly legally compliant Section 2(f) RTI application and utilizes a "Smart Clipboard" routing mechanism to direct the user to submit it on the official government portal.
- **Resilient Data Ingestion:** To ensure our officer contacts never go out of date, a backend scheduled scraper intelligently normalizes messy government HTML directories using LLMs and updates our local database automatically.

---

## 4. High-Level Architecture

```text
       Tamil/English Voice or Text Input
                     │
                     ▼
          Speech-to-Text (Groq Whisper)
                     │
                     ▼
    Google Gemini (Classification & Extraction)
                     │
                     ▼
  Deterministic Routing (Local Ward JSON Database) 
                     │
     ┌───────────────┴───────────────┐
     ▼                               ▼
[ Primary Escalation ]      [ Secondary Escalation ]
Direct call to Ward AE      Magic Link Status Tracker
     │                               │
     └───────────────────────────────┘
                     │
           (If SLA Deadline Missed)
                     ▼
      [ Legal Escalation (RTI Generator) ]
      Gemini formats Section 2(f) Draft
                     │
                     ▼
   [ Smart Clipboard & Route to Government Portal ]
```

---

## 5. Tech Stack

### Frontend
- Next.js 14 (App Router)
- Tailwind CSS
- Lucide Icons
- React-hot-toast (Clipboard/Notifications)

### Backend & AI
- FastAPI (Python)
- Google Gemini 1.5 Flash API (Classification & RTI Generation)
- Groq API (Whisper-large-v3 for Audio + Mixtral for Scraper Normalization)

### Data Layer & Scraping
- Deterministic Local JSON (`emergencyContacts.json`)
- Python BeautifulSoup + Groq LLM (Smart Normalization Scraper)
- GitHub Actions (Scheduled Cron Jobs for Data Ingestion)

### Deployment
- Vercel (Frontend)
- Render / GitHub Actions (Backend/Scraper)

---

## 6. Milestones to hackathon day
_A rough plan from now to Aug 8–9._

- [x] Integrate Groq Whisper for Tamil/English voice input.
- [x] Build Next.js UI with "Public Service" clean design aesthetic.
- [x] Implement Gemini classifier for civic issues and Ward extraction.
- [x] Map CCMC Wards(zone level) to specific Assistant Engineers and Zonal EEs.
- [x] Build the SLA Status Tracker (Magic Link) UI workflow.
- [x] Implement the LLM Hybrid Web Scraper for automated data updates.
- [ ] Implement the Intimation Modal (Contractor discrepancies).
- [ ] Implement the final "Smart Clipboard" RTI generation and routing link.

