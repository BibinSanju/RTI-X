# Neural Ninjas

**Tech for Good 2026** · GDG Coimbatore · Build weekend Aug 8–9, GRD College

**Track:** AI for Strong Institutions
**Team code:** TEAM-008

## Problem

The Right to Information (RTI) Act empowers citizens to seek information from public authorities, but many people struggle to use it because the process requires legal knowledge and proper document formatting. Citizens often ask questions such as "Why is my road broken?" instead of requesting official records, which can lead to rejection under Section 2(f) of the RTI Act. Many applicants also find it difficult to identify the correct Public Information Officer (PIO), especially when language and legal terminology become barriers. As a result, citizens lose time, confidence, and access to the information they are legally entitled to receive.

## Who it helps

Our primary user is Mr. Murugan, a 52-year-old tea shop owner in Gandhipuram, Coimbatore. Overflowing sewage and damaged roads outside his shop affect his daily business, and he wants to seek accountability through an RTI application. However, he only speaks Tamil, is unfamiliar with legal terminology, and does not know which Public Information Officer to contact. Instead of requesting official records, he may submit an emotional complaint that does not meet RTI requirements. RTI-GPT helps Mr. Murugan convert his concern into a legally structured RTI request in Tamil or English, identifies the appropriate public authority, and generates a printable RTI application, making the process simpler and more accessible.

## Solution

RTI-GPT is an AI-assisted RTI drafting tool that helps citizens create legally structured RTI applications in a few simple steps. A user can speak or type their issue in Tamil or English, such as "The road on Gandhipuram 2nd Street has been damaged for months."
The system then:

Processes the Input: Uses Groq Whisper to instantly transcribe or translate the user's spoken complaint into text.

Enforces Legal Compliance: Uses Google Gemini 1.5 Flash with structured outputs to simultaneously extract key details and map them against Section 2(f) of the RTI Act. If a user asks for an opinion ("Why is the road broken?"), the AI automatically converts it into a request for a record ("Provide the latest road maintenance work order").

Maps the Authority: Suggests the appropriate Public Information Officer (PIO) based on the localized issue.

Generates the Application: Outputs a print-ready RTI PDF that the citizen can review, print, and submit.

Our MVP focuses on solving the first and most important barrier—helping citizens prepare a legally structured RTI application quickly and confidently.

## Architecture

Tamil/English Voice or Text Input → Speech-to-Text (Groq Whisper API) → Google Gemini 1.5 Flash (Single-Pass Information Extraction & Section 2(f) JSON Output) → Local PIO Mapping Logic → PDF Generator / Native Print CSS → Downloadable RTI PDF

## Tech stack

Next.js 14 (App Router), Tailwind CSS, Lucide Icons, Google Gemini 1.5 Flash API, Groq API (Whisper-large-v3), Native MediaRecorder API, react-audio-voice-recorder, Local JSON Directory, Supabase (PostgreSQL) (Post-MVP), react-to-print, Vercel

## Getting started

1. Accept your collaborator invite (check your email / GitHub notifications).
2. Clone this repo and start building.
3. Commit early and often — this repo is what you present on the day.

---

_Created automatically when your proposal was validated._