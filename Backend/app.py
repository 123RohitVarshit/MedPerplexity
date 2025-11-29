"""
🏥 MED_PERPLEXITY BACKEND API
FastAPI server connecting Frontend with PubMed research & Jan Aushadhi database
"""

import json
import os
from datetime import timedelta
from typing import Optional, List
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from dotenv import load_dotenv

# Import our custom modules
import auth
from tools import query_pubmed_realtime, search_jan_aushadhi, load_jan_aushadhi_db

# Load environment variables
load_dotenv()

# ==========================================
# FASTAPI APP INITIALIZATION
# ==========================================

app = FastAPI(
    title="Med_Perplexity API",
    description="Clinical decision support system with PubMed research & Jan Aushadhi integration",
    version="1.0.0"
)

# Security
security = HTTPBearer()

# CORS Configuration (Allow Frontend to access Backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",  # Alternative React port
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# PYDANTIC MODELS (Request/Response Schemas)
# ==========================================

class LoginRequest(BaseModel):
    email: str  # Changed from EmailStr to accept username too
    password: str

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    specialization: str = "General Medicine"

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class ChatRequest(BaseModel):
    message: str
    patient_id: Optional[str] = None

class JanAushadhiSearchRequest(BaseModel):
    drug_name: str


# ==========================================
# HELPER FUNCTIONS
# ==========================================

def load_patients_db() -> dict:
    """Load patients database."""
    try:
        with open("data/patients.json", 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return {}

def load_daily_rounds() -> list:
    """Load daily rounds data."""
    try:
        with open("data/daily_rounds.json", 'r', encoding='utf-8') as f:
            data = json.load(f)
            return data if isinstance(data, list) else []
    except FileNotFoundError:
        return []

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    Dependency to verify JWT token and get current user.
    Used in protected routes.
    """
    token = credentials.credentials
    payload = auth.decode_access_token(token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    email = payload.get("sub")
    user = auth.get_user_by_email(email)
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user


# ==========================================
# API ROUTES
# ==========================================

@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "status": "online",
        "message": "Med_Perplexity API is running! 🏥",
        "docs": "/docs"
    }


# --- AUTHENTICATION ENDPOINTS ---

@app.post("/api/auth/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    """
    Login with email and password.
    Returns JWT token for subsequent requests.
    """
    user = auth.authenticate_user(request.email, request.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Create JWT token
    access_token = auth.create_access_token(
        data={"sub": user["username"]},
        expires_delta=timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    # Remove sensitive data before sending
    user_safe = {k: v for k, v in user.items() if k != "hashed_password"}
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_safe
    }


@app.post("/api/auth/register")
async def register(request: RegisterRequest):
    """
    Register a new doctor/user.
    """
    result = auth.register_user(
        email=request.email,
        password=request.password,
        name=request.name,
        specialization=request.specialization
    )
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])
    
    return result


# --- PATIENT ENDPOINTS ---

@app.get("/api/patients")
async def get_patients(
    filter: Optional[str] = "Today",
    current_user: dict = Depends(get_current_user)
):
    """
    Get list of patients for logged-in doctor.
    Filter: "Today", "All", "Critical", etc.
    """
    patients_db = load_patients_db()
    doctor_id = current_user["id"]
    
    # Filter patients by doctor
    doctor_patients = {
        pid: data for pid, data in patients_db.items()
        if data.get("doctor_id") == doctor_id
    }
    
    # Apply additional filters if needed
    # (You can expand this based on your filter logic)
    
    return {
        "status": "success",
        "count": len(doctor_patients),
        "patients": doctor_patients
    }


@app.get("/api/patients/{patient_id}")
async def get_patient_detail(
    patient_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get detailed information for a specific patient.
    """
    patients_db = load_patients_db()
    
    if patient_id not in patients_db:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    patient = patients_db[patient_id]
    
    # Verify patient belongs to this doctor
    if patient.get("doctor_id") != current_user["id"]:
        raise HTTPException(status_code=403, detail="Access denied to this patient")
    
    return {
        "status": "success",
        "patient": patient
    }


# --- DAILY ROUNDS ENDPOINTS ---

@app.get("/api/rounds")
async def get_daily_rounds(current_user: dict = Depends(get_current_user)):
    """
    Get morning briefing / daily rounds updates.
    """
    rounds = load_daily_rounds()
    
    return {
        "status": "success",
        "count": len(rounds),
        "rounds": rounds
    }


# --- AI CHAT ENDPOINTS ---

@app.post("/api/chat")
async def chat_with_ai(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Send a message to AI and get response using Multi-Agent System.
    Streams the response word by word for better UX.
    """
    from fastapi.responses import StreamingResponse
    import asyncio
    
    message = request.message
    patient_id = request.patient_id
    
    async def generate_stream():
        try:
            # Import the agent system
            from agent_system import run_agent_workflow
            
            # If patient_id is provided, run the full multi-agent workflow
            if patient_id:
                print(f"🤖 Running Multi-Agent Workflow for Patient {patient_id}")
                agent_response = run_agent_workflow(patient_id, message)
                
                # Stream the message word by word
                full_message = agent_response.get("message", "")
                words = full_message.split(" ")
                
                for i, word in enumerate(words):
                    # Add space after each word except the last one
                    chunk = word if i == len(words) - 1 else word + " "
                    yield f"data: {json.dumps({'chunk': chunk, 'done': False})}\n\n"
                    await asyncio.sleep(0.05)  # Small delay for streaming effect
                
                # Send final data with complete response
                yield f"data: {json.dumps({'chunk': '', 'done': True, 'data': agent_response})}\n\n"
            
            # Fallback: If no patient_id, just do PubMed research
            else:
                if any(keyword in message.lower() for keyword in ["interaction", "research", "study", "evidence", "pubmed"]):
                    # Query PubMed
                    pubmed_results = query_pubmed_realtime(message)
                    response_message = f"Found evidence-based research for: {message}"
                    
                    words = response_message.split(" ")
                    for i, word in enumerate(words):
                        chunk = word if i == len(words) - 1 else word + " "
                        yield f"data: {json.dumps({'chunk': chunk, 'done': False})}\n\n"
                        await asyncio.sleep(0.05)
                    
                    yield f"data: {json.dumps({'chunk': '', 'done': True, 'data': json.loads(pubmed_results)})}\n\n"
                else:
                    # Generic response
                    response_message = "Based on current guidelines, I recommend monitoring the patient's vitals closely. Please provide a patient ID for personalized analysis."
                    
                    words = response_message.split(" ")
                    for i, word in enumerate(words):
                        chunk = word if i == len(words) - 1 else word + " "
                        yield f"data: {json.dumps({'chunk': chunk, 'done': False})}\n\n"
                        await asyncio.sleep(0.05)
                    
                    yield f"data: {json.dumps({'chunk': '', 'done': True})}\n\n"
                    
        except Exception as e:
            print(f"❌ Chat Error: {e}")
            yield f"data: {json.dumps({'chunk': '', 'done': True, 'error': str(e)})}\n\n"
    
    return StreamingResponse(generate_stream(), media_type="text/event-stream")


# --- JAN AUSHADHI ENDPOINTS ---

@app.post("/api/jan-aushadhi/search")
async def search_jan_aushadhi_drug(
    request: JanAushadhiSearchRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Search for a drug in Jan Aushadhi database to find cheaper alternatives.
    """
    drug_name = request.drug_name
    
    # Load Jan Aushadhi database
    jan_db = load_jan_aushadhi_db()
    
    # Search for the drug
    result = search_jan_aushadhi(drug_name, jan_db)
    
    return {
        "status": "success",
        "query": drug_name,
        **result
    }


@app.get("/api/jan-aushadhi/stats")
async def get_jan_aushadhi_stats(current_user: dict = Depends(get_current_user)):
    """
    Get statistics about Jan Aushadhi database.
    """
    jan_db = load_jan_aushadhi_db()
    
    total_drugs = len(jan_db)
    total_savings = sum(
        float(drug.get("market_avg_price", 0)) - float(drug.get("jan_price", 0))
        for drug in jan_db
    )
    
    return {
        "status": "success",
        "total_drugs": total_drugs,
        "potential_savings": f"₹{total_savings:,.2f}",
        "database_size": f"{len(jan_db)} generic medicines"
    }


# ==========================================
# RUN SERVER (for testing)
# ==========================================

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Med_Perplexity API Server...")
    print("📖 API Docs: http://localhost:8000/docs")
    print("🔗 Frontend should run on: http://localhost:5173")
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
