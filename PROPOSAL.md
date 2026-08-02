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

**RTI-GPT** is an AI-assisted RTI drafting tool that helps citizens create legally structured RTI applications in a few simple steps.

Users can speak or type their issue in Tamil or English. The system then:

- **Processes the Input:** Uses **Groq Whisper** to transcribe or translate spoken input into text.
- **Enforces Legal Compliance:** Uses **Google Gemini 1.5 Flash** to extract key details and validate them against Section 2(f) of the RTI Act. If a user asks for an opinion (e.g., *"Why is the road broken?"*), the AI automatically converts it into a request for official records (e.g., *"Provide the latest road maintenance work order."*).
- **Maps the Authority:** Suggests the appropriate Public Information Officer (PIO) based on the user's issue.
- **Generates the Application:** Produces a print-ready RTI PDF that the citizen can review, print, and submit.

Our MVP focuses on solving the first and most important barrier—helping citizens prepare a legally compliant RTI application quickly and confidently.

---

## 4. High-Level Architecture

```text
Tamil/English Voice or Text Input
        │
        ▼
Speech-to-Text (Groq Whisper API)
        │
        ▼
Google Gemini 1.5 Flash
(Information Extraction + Section 2(f) Validation)
        │
        ▼
Local PIO Mapping Logic
        │
        ▼
PDF Generator / Native Print CSS
        │
        ▼
Downloadable RTI PDF
```

---

## 5. Tech Stack

### Frontend
- Next.js 14 (App Router)
- Tailwind CSS
- Lucide Icons

### AI
- Google Gemini 1.5 Flash API
- Groq API (Whisper-large-v3)

### Audio Processing
- Native MediaRecorder API
- react-audio-voice-recorder

### Database
- Local JSON Directory (MVP)
- Supabase (PostgreSQL) *(Post-MVP)*

### Document Generation
- react-to-print

### Deployment
- Vercel
## 6. Milestones to hackathon day
_A rough plan from now to Aug 8–9._

- [ ] …
- [ ] …

## 7. Open questions / help needed
_Anything you're unsure about or want mentor input on._
