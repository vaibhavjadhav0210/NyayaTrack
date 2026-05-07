# NyayaTrack — Court Judgment Intelligence System

<div align="center">

![NyayaTrack](https://img.shields.io/badge/NyayaTrack-Court%20Intelligence%20System-1a237e?style=for-the-badge&logo=scales&logoColor=white)
![Government of Karnataka](https://img.shields.io/badge/Government-Karnataka-orange?style=for-the-badge)
![AI for Bharat](https://img.shields.io/badge/AI%20for%20Bharat-PAN%20IIT%20Bangalore-blue?style=for-the-badge)
![Theme 11](https://img.shields.io/badge/Theme-11%20Court%20Judgments-darkblue?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Live%20Prototype-brightgreen?style=for-the-badge)
![Backend](https://img.shields.io/badge/Backend-FastAPI%20Python-009688?style=for-the-badge&logo=fastapi)
![AI](https://img.shields.io/badge/AI-Groq%20LLaMA%203.3%2070B-purple?style=for-the-badge)

<br/>

> **"Which of my 200 pending court orders will cause a contempt notice this month?"**
> 
> NyayaTrack answers this question — automatically, daily, for every Karnataka government department.

<br/>

**[🏛️ Problem](#-the-problem) · [✅ Solution](#-our-solution) · [🚀 Features](#-key-features) · [💻 Tech Stack](#-tech-stack) · [⚙️ Setup](#️-how-to-run-locally) · [📊 Impact](#-impact)**

</div>

---

## 🏛️ The Problem

Every year, Karnataka government departments receive **hundreds of court judgment PDFs** through CCMS. The current process is broken:

| Pain Point | Reality |
|------------|---------|
| 📄 Manual Reading | Officers spend 2–3 hours reading 60–80 page documents to find 3–4 actionable sentences |
| 📅 Deadline Tracking | Compliance deadlines tracked on Excel sheets — prone to human error |
| ⚖️ No Risk Visibility | No system to identify which cases are about to trigger contempt proceedings |
| 🔍 No Audit Trail | Zero record of who read what, when, and what decision was made |
| 🚨 Missed Deadlines | Departments miss appeal windows, leading to avoidable contempt notices |

**The result:** Departments pay legal costs, face contempt proceedings, and waste IAS officer time — on a problem that is entirely automatable.

---

## ✅ Our Solution — End-to-End 6-Step Workflow

NyayaTrack is **not an AI summarizer**. It is a complete government workflow system — from PDF ingestion to verified, tracked action plans.

```
PDF Upload → AI Extraction → Human Verification → Action Plan → Risk Score → Dashboard
```

### Step 1 — PDF Ingestion
- Court judgment PDFs uploaded directly through the NyayaTrack interface
- Supports Karnataka HC format documents
- Text extraction via `pypdf` with 8,000 character intelligent truncation for optimal AI performance

### Step 2 — AI Structured Extraction (Groq LLaMA 3.3 70B)
Extracts **8 specific legally-relevant fields** — not vague summarization:

| Field | Description |
|-------|-------------|
| Case Number | Official case identifier |
| Court Name | Issuing court |
| Date of Order | Judgment date |
| Responsible Department | Government department liable for compliance |
| Key Directions | Verbatim judge directions |
| Compliance Deadline | Exact deadline with ISO date calculation |
| Nature of Action | `Comply` or `Appeal` recommendation |
| Contempt Risk Score | 0–100 computed urgency score |

Each field is assigned a confidence level: **HIGH / MEDIUM / LOW**

### Step 3 — Human-in-the-Loop Verification
- Side-by-side interface: original PDF on left, extracted fields on right
- **Approve / Edit / Reject** buttons per field
- Submit locked until all 8 fields are officer-verified
- Complete audit trail: who verified, timestamp, what was changed

### Step 4 — Action Plan Generation
- **Comply vs Appeal** recommendation with plain-English reasoning
- Responsible officer and department auto-assigned
- Deadline counter showing exact days remaining
- Legal strategy breakdown with pros/cons analysis

### Step 5 — Contempt Risk Score *(Unique Innovation)*
A proprietary 0–100 score computed from **4 real legal factors:**

```
Score = min(100, Days_Remaining_Factor + Keyword_Severity × 20)
```

| Factor | Description |
|--------|-------------|
| ⏰ Deadline Proximity | Days remaining until compliance deadline |
| 📋 Department History | Prior non-compliance instances |
| ⚖️ Judgment Severity | Explicit contempt warnings in order text |
| 🔄 Prior Extensions | Whether extensions were previously granted |

- **Score 0–40** → 🟢 LOW — Monitor regularly  
- **Score 41–70** → 🟡 MEDIUM — Plan compliance  
- **Score 71–100** → 🔴 HIGH/CRITICAL — Immediate action required

### Step 6 — Verified Dashboard
- Only human-approved records displayed — no raw AI output
- Filter by department, risk level, status
- CRITICAL / HIGH / MEDIUM / LOW badges
- Real-time case registry with full audit trail
- Summary stats: Total Cases, High Risk, Due This Week, Completed

---

## 🚀 Key Features

### 🤖 AI-Powered — Groq LLaMA 3.3 70B
- Switched from Google Gemini to **Groq's LLaMA 3.3 70B** for zero quota limitations
- JSON-mode enforced responses — no parsing failures
- Sub-second inference speed — fastest free LLM API available
- Temperature set to 0.1 for legally precise, deterministic outputs

### 🔒 Human-in-the-Loop by Design
Every AI output is verified by a government officer before entering the system. This is not optional — it is enforced at the UI level. No AI hallucination can enter the official record.

### 📊 Live Risk Dashboard
Real-time compliance visibility for department heads. Sortable, filterable, exportable case registry with urgency scoring updated daily.

### 🏗️ Production-Ready Architecture
- FastAPI backend with async endpoints
- CORS configured for secure cross-origin access
- Encrypted PDF detection and rejection
- Structured error handling at every layer

---

## 💻 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React.js + TypeScript | UI & workflow |
| **Styling** | Tailwind CSS | Government-grade design system |
| **Build Tool** | Vite | Fast HMR development |
| **Backend** | Python FastAPI | REST API server |
| **AI Model** | Groq — LLaMA 3.3 70B Versatile | Legal document extraction |
| **PDF Parsing** | pypdf | Text extraction from court PDFs |
| **Environment** | python-dotenv | Secure API key management |
| **Server** | Uvicorn (ASGI) | Production-grade async server |
| **Infrastructure** | NIC Cloud Compatible | Government deployment ready |

---

## ⚙️ How to Run Locally

### Prerequisites
- Node.js `v18+`
- Python `3.10+`
- npm `v8+`
- A free Groq API key from [console.groq.com](https://console.groq.com)

---

### 🖥️ Frontend Setup

```bash
# Step 1 — Clone the repository
git clone https://github.com/vaibhavjadhav0210/NyayaTrack.git

# Step 2 — Navigate to project
cd NyayaTrack

# Step 3 — Install dependencies
npm install

# Step 4 — Start the frontend
npm run dev

# Step 5 — Open in browser
# http://localhost:5173/
```

---

### 🔧 Backend Setup

```bash
# Step 1 — Navigate to backend folder
cd NyayaTrack-main

# Step 2 — Install Python dependencies
pip install fastapi uvicorn pypdf python-dotenv groq

# Step 3 — Create your .env file
echo "GROQ_API_KEY=your_groq_api_key_here" > .env

# Step 4 — Start the backend server
python main.py

# Backend runs at: http://localhost:8000
# API docs at:     http://localhost:8000/docs
```

---

### 🔑 Environment Variables

Create a `.env` file in the backend directory:

```env
GROQ_API_KEY=your_groq_api_key_here
```

Get your **free** Groq API key at 👉 [console.groq.com](https://console.groq.com) — no credit card required.

---

### 📁 Project Structure

```
NyayaTrack/
├── 📁 src/                      # React frontend
│   ├── 📁 components/           # UI components
│   ├── 📁 pages/                # Upload, Extraction, Action Plan, Dashboard
│   └── 📁 assets/               # Static assets
├── 📄 main.py                   # FastAPI backend — core API
├── 📄 .env                      # API keys (not committed)
├── 📄 package.json              # Frontend dependencies
├── 📄 requirements.txt          # Python dependencies
└── 📄 README.md                 # This file
```

---

## 📊 Impact

| Stakeholder | Before NyayaTrack | After NyayaTrack |
|-------------|-------------------|------------------|
| Reviewing Officer | 2–3 hours per judgment | Under 15 minutes |
| Department Head | No visibility until deadline missed | Real-time risk dashboard |
| Legal Cell | Raw AI output used directly | Human-verified AI outputs only |
| IAS Officers | 200 orders, no prioritization | Sorted by contempt risk score |
| Karnataka Govt | Reactive — contempt notices received | Proactive — prevented before filing |

---

## 📈 Scalability Roadmap

```
Phase 1 (Now)     → Karnataka HC judgments — Local deployment ✅
Phase 2 (3 months) → 28 State High Courts — CCMS API integration
Phase 3 (6 months) → 650+ District Courts — Expanded OCR pipeline  
Phase 4 (1 year)  → 50,000+ Departments — National rollout
```

---

## 🔌 API Reference

### `POST /api/process-judgment`

Processes an uploaded court judgment PDF and returns structured extracted data.

**Request:**
```
Content-Type: multipart/form-data
Body: file (PDF)
```

**Response:**
```json
{
  "filename": "WP_12345_2025.pdf",
  "message": "File processed successfully",
  "extracted_data": {
    "Case Number": "Writ Petition No. 12345 of 2025",
    "Court Name": "High Court of Karnataka",
    "Date of Order": "2025-04-28",
    "Responsible Department": "Department of Revenue, Bengaluru Urban District",
    "Verbatim Directions": "The 2nd Respondent is directed to...",
    "Explicit Timelines": "within 8 weeks from date of receipt",
    "Calculated Deadline ISO": "2025-06-23",
    "Recommended Action": "Comply",
    "Contempt Risk Score": 100
  },
  "raw_text": "..."
}
```

**Interactive API docs:** `http://localhost:8000/docs`

---

## 🏆 Hackathon Details

| Detail | Info |
|--------|------|
| **Event** | AI for Bharat — PAN IIT Bangalore + Govt of Karnataka |
| **Theme** | Theme 11 — Court Judgments to Verified Action Plans |
| **Sponsor** | Centre for e-Governance, Government of Karnataka |
| **Team** | NammaBharat |
| **Status** | Fully working prototype with live AI backend |

---

## 👥 Team NammaBharat

Built with dedication for the people of Karnataka and the vision of a digitally empowered Indian government.

---

## 📄 License

Built for **AI for Bharat Hackathon 2026**.  
Government of Karnataka use case — Theme 11.  
All rights reserved by Team NammaBharat.

---

<div align="center">

**NyayaTrack — Because every court order deserves a response. On time.**

![Made for Karnataka](https://img.shields.io/badge/Made%20for-Karnataka%20Government-orange?style=for-the-badge)
![Powered by Groq](https://img.shields.io/badge/Powered%20by-Groq%20LLaMA%203.3-purple?style=for-the-badge)
![Built with FastAPI](https://img.shields.io/badge/Built%20with-FastAPI-009688?style=for-the-badge&logo=fastapi)

</div>