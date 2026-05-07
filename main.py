import io
import os
import json
import re
import smtplib
import ssl
from datetime import datetime
from email.message import EmailMessage
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pypdf import PdfReader
from groq import Groq

from dotenv import load_dotenv
load_dotenv()

api_key = os.getenv("GROQ_API_KEY")
print("API Key Loaded:", bool(api_key))

client = Groq(api_key=api_key)

def calculate_contempt_risk(extracted_data: dict) -> int:
    """
    Calculates Contempt Risk Score (0-100).
    Formula: S = min(100, (Days_Remaining_Factor) + (Keyword_Severity * 20))
    """
    # Keyword Severity
    directions = str(extracted_data.get("Verbatim Directions", "")).lower()
    keyword_severity = 1 if "contempt" in directions or "strictly" in directions else 0
    
    # Days Remaining Factor
    days_remaining_factor = 20 # Fallback

    def get_days_factor(days_remaining: int) -> int:
        if days_remaining < 10:
            return 80
        if days_remaining < 30:
            return 50
        if days_remaining < 60:
            return 30
        return 10

    deadline_text = " ".join(
        str(extracted_data.get(field, "") or "")
        for field in ("Calculated Deadline ISO", "Explicit Timelines", "Verbatim Directions")
    ).lower()

    week_deadline_match = re.search(r"(\d+)\s*(?:week|weeks)", deadline_text)
    day_deadline_match = re.search(r"(\d+)\s*(?:day|days)", deadline_text)
    textual_deadline_match = week_deadline_match or day_deadline_match

    if week_deadline_match:
        days_remaining_factor = get_days_factor(int(week_deadline_match.group(1)) * 7)
    elif day_deadline_match:
        days_remaining_factor = get_days_factor(int(day_deadline_match.group(1)))
    
    deadline_iso = extracted_data.get("Calculated Deadline ISO")
    if deadline_iso and not textual_deadline_match:
        try:
            deadline_date = datetime.strptime(deadline_iso.split('T')[0], "%Y-%m-%d")
            days_remaining = (deadline_date - datetime.now()).days
            
            days_remaining_factor = get_days_factor(days_remaining)
        except ValueError:
            pass
            
    score = days_remaining_factor + (keyword_severity * 20)
    return min(score, 100)

def send_high_risk_email_alert(extracted_data: dict, risk_score: int) -> bool:
    if risk_score <= 70:
        return False

    sender_email = os.getenv("ALERT_EMAIL")
    sender_password = os.getenv("ALERT_PASSWORD")
    recipient_email = os.getenv("RECIPIENT_EMAIL")

    if not sender_email or not sender_password or not recipient_email:
        print("Email alert skipped: credentials not set")
        return False

    case_number = extracted_data.get("Case Number") or "N/A"
    court_name = extracted_data.get("Court Name") or "N/A"
    department = extracted_data.get("Responsible Department") or "N/A"
    deadline = (
        extracted_data.get("Calculated Deadline ISO")
        or extracted_data.get("Explicit Timelines")
        or "N/A"
    )

    message = EmailMessage()
    message["Subject"] = "⚠️ HIGH CONTEMPT RISK ALERT - NyayaTrack"
    message["From"] = sender_email
    message["To"] = recipient_email
    message.set_content(f"""Dear Officer,

This is an automated alert from NyayaTrack - Court Judgment Intelligence System, Government of Karnataka.

A court judgment has been processed with HIGH CONTEMPT RISK.

Case Details:
- Case Number: {case_number}
- Court: {court_name}
- Department: {department}
- Compliance Deadline: {deadline}
- Contempt Risk Score: {risk_score}/100 - HIGH RISK

Immediate action is required to avoid contempt of court proceedings.

This alert was generated automatically by NyayaTrack.
Government of Karnataka - Department of Law & Justice""")

    try:
        context = ssl.create_default_context()
        with smtplib.SMTP("smtp.gmail.com", 587) as smtp:
            smtp.starttls(context=context)
            smtp.login(sender_email, sender_password)
            smtp.send_message(message)
        return True
    except Exception as exc:
        print(f"Email alert failed: {exc.__class__.__name__}")
        return False

app = FastAPI(title="NyayaTrack API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/process-judgment")
async def process_judgment(file: UploadFile = File(...)):
    """
    Endpoint to process uploaded court judgment files.
    """
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
        
    try:
        contents = await file.read()
        pdf_file = io.BytesIO(contents)
        reader = PdfReader(pdf_file)
        
        if reader.is_encrypted:
            raise HTTPException(status_code=400, detail="The PDF file is encrypted and cannot be processed.")
            
        extracted_text = ""
        for page in reader.pages:
            text = page.extract_text()
            if text:
                extracted_text += text + "\n"
            
        extracted_text = extracted_text.strip()

        # Limit text to avoid token issues
        extracted_text = extracted_text[:8000]
        
        if not extracted_text:
            raise HTTPException(status_code=400, detail="The PDF file appears to be empty or contains no extractable text.")
            
        if not api_key:
            raise HTTPException(status_code=500, detail="GROQ_API_KEY is not configured on the server.")
            
        prompt = f"""
Please analyze the following court judgment text and extract the information into a strict JSON format. 

Required fields:
- "Case Number": The official case number or identifier.
- "Court Name": The name of the court issuing the judgment.
- "Date of Order": The date the order was issued.
- "Parties Involved": The names of the petitioners and respondents.
- "Verbatim Directions": The exact directions or orders given by the judge.
- "Responsible Department": The government department or agency responsible for compliance.
- "Explicit Timelines": Any deadlines or timelines mentioned for compliance.
- "Calculated Deadline ISO": Calculate the exact Appeal Deadline or Compliance Deadline based on the judgment date and the text. Output this as a valid ISO date string (e.g., "YYYY-MM-DD"). If no deadline exists, output null.
- "Recommended Action": Must be either "Comply" or "Appeal" based on the judgment's nature.

Court Judgment Text:
{extracted_text}
"""
        
        # Use Groq to extract data
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "You are a legal document analyzer. Always respond with valid JSON only. No markdown, no explanation, no extra text."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            response_format={"type": "json_object"},
            temperature=0.1
        )

        response_text = completion.choices[0].message.content.strip()
        
        try:
            parsed_data = json.loads(response_text)
            
            # Calculate Risk Score
            risk_score = calculate_contempt_risk(parsed_data)
            parsed_data["Contempt Risk Score"] = risk_score
            email_alert_sent = send_high_risk_email_alert(parsed_data, risk_score)
            
        except json.JSONDecodeError:
            print("Failed to parse JSON. Raw response:", response_text)
            raise HTTPException(status_code=500, detail="Failed to parse the response from the AI model into JSON.")
            
        return {
            "filename": file.filename, 
            "message": "File processed successfully",
            "extracted_data": parsed_data,
            "raw_text": extracted_text,
            "email_alert_sent": email_alert_sent
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred while reading the PDF: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
