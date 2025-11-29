"""
🤖 MULTI-AGENT SYSTEM FOR MED PERPLEXITY
Uses LangGraph to orchestrate Personalization, Research, and Safety agents
"""

import json
import os
from typing import TypedDict, Dict, Any, Optional
from dotenv import load_dotenv

# Import our custom tools
from tools import query_pubmed_realtime, search_jan_aushadhi

# --- CONFIGURATION ---
load_dotenv()

# Check for Google API Key
if "GOOGLE_API_KEY" not in os.environ:
    print("⚠️  WARNING: GOOGLE_API_KEY missing in .env - LLM features will be limited")
    USE_LLM = False
else:
    USE_LLM = True
    try:
        from langchain_google_genai import ChatGoogleGenerativeAI
        from langchain_core.messages import HumanMessage
        # We use temperature=0 for maximum determinism (safety critical)
        llm = ChatGoogleGenerativeAI(model="gemini-flash-lite-latest", temperature=0)
    except ImportError:
        print("⚠️  WARNING: langchain-google-genai not installed - using fallback mode")
        USE_LLM = False

# --- STATE DEFINITION ---
class AgentState(TypedDict):
    patient_id: str
    doctor_query: str
    patient_data: Dict[str, Any]
    research_evidence: str
    jan_aushadhi_result: Dict[str, Any]
    final_response: Dict[str, Any]

# ==========================================
# 🕵 NODE 1: PERSONALIZATION AGENT
# ==========================================
def personalization_agent(state: AgentState):
    """
    Fetches the patient's medical history from our JSON database.
    """
    print(f"👤 Personalization Agent: Loading profile for {state['patient_id']}...")
    
    try:
        with open("data/patients.json", "r", encoding="utf-8") as f:
            all_patients = json.load(f)
        
        # Fetch specific patient
        patient = all_patients.get(state['patient_id'])
        
        if not patient:
            return {"patient_data": {"error": "Patient not found"}}
            
        return {"patient_data": patient}
        
    except Exception as e:
        print(f"❌ Database Error: {e}")
        return {"patient_data": {}}

# ==========================================
# 🔬 NODE 2: RESEARCH AGENT
# ==========================================
def research_agent(state: AgentState):
    """
    Uses PubMed to find clinical evidence relevant to the doctor's query.
    Also checks for Jan Aushadhi substitutes in parallel.
    """
    query = state['doctor_query']
    patient_context = state['patient_data'].get('condition_tags', [])
    
    print(f"🔬 Research Agent: Analyzing '{query}' for context {patient_context}...")
    
    # 1. Search Jan Aushadhi (Cost Check)
    jan_result = search_jan_aushadhi(query)
    
    # 2. Search PubMed (Safety Check)
    # We enrich the search query with patient conditions to make it specific
    conditions_str = " ".join(patient_context) if patient_context else ""
    
    # Try multiple search strategies if first one fails
    search_terms = [
        f"{query} {conditions_str} contraindications adverse effects",
        f"{query} {conditions_str} safety",
        f"{query} chronic kidney disease",
        f"{query} clinical guidelines"
    ]
    
    evidence = None
    for search_term in search_terms:
        print(f"🔍 Trying search: {search_term[:100]}...")
        evidence = query_pubmed_realtime(search_term)
        evidence_data = json.loads(evidence)
        if evidence_data.get('status') == 'success' and len(evidence_data.get('articles', [])) > 0:
            print(f"✅ Found {len(evidence_data.get('articles', []))} articles!")
            break
    
    if not evidence:
        evidence = json.dumps({"status": "error", "message": "No results found."})
    
    return {
        "research_evidence": evidence,
        "jan_aushadhi_result": jan_result
    }

# ==========================================
# 🛡 NODE 3: SAFETY AGENT (THE DECIDER)
# ==========================================
def safety_agent(state: AgentState):
    """
    Synthesizes Patient Data + Research Evidence to make a clinical decision.
    """
    print("🛡 Safety Agent: Validating treatment plan...")
    
    # Parse PubMed articles from research evidence
    pubmed_articles = []
    try:
        evidence_data = json.loads(state['research_evidence'])
        if evidence_data.get('status') == 'success':
            pubmed_articles = evidence_data.get('articles', [])
            print(f"📚 Extracted {len(pubmed_articles)} PubMed articles for sources")
    except Exception as e:
        print(f"⚠️  Error parsing research evidence: {e}")
        pass
    
    if not USE_LLM:
        # Fallback response when LLM is not available
        return {"final_response": {
            "status": "approved",
            "title": "Manual Review Recommended",
            "message": f"Query: {state['doctor_query']}. Please review PubMed evidence and patient history manually.",
            "evidence": "LLM not configured - using fallback mode",
            "suggestion": None,
            "savings": state['jan_aushadhi_result'] if state['jan_aushadhi_result'].get('found') else {"found": False},
            "sources": pubmed_articles
        }}
    
    # Construct the Prompt for Gemini
    prompt = f"""
ACT AS: Med Perplexity, an expert Clinical Safety Architect for India.

--- INPUT DATA ---
1. PATIENT PROFILE:
{json.dumps(state['patient_data'], indent=2)}

2. DOCTOR'S ORDER:
"{state['doctor_query']}"

3. EXTERNAL EVIDENCE (PubMed):
{state['research_evidence']}

4. COST SAVINGS (Jan Aushadhi Database):
{json.dumps(state['jan_aushadhi_result'], indent=2)}

--- YOUR MISSION ---
Analyze the order for SAFETY and COST EFFICIENCY.

RULES:
1. CONTRAINDICATIONS: If the patient has a condition (e.g., CKD) and the drug is unsafe (e.g., NSAIDs), you MUST RETURN STATUS: "blocked". Cite the evidence.
2. COST SAVINGS: If the order is safe AND a Jan Aushadhi match was found (found=True), suggest the switch.
3. ALLERGIES: Check patient allergies against the drug class.

--- REQUIRED JSON OUTPUT FORMAT ---
Return ONLY raw JSON. No markdown.
{{
  "status": "approved" | "blocked" | "caution",
  "title": "Short Headline (e.g. 'SAFETY ALERT')",
  "message": "Clear explanation for the doctor.",
  "evidence": "Source of truth (e.g. 'ICMR Guidelines 2024' or PubMed ID).",
  "suggestion": "Alternative drug or dosage if blocked.",
  "savings": {{
     "found": true/false,
     "text": "Save ₹128 by switching to Jan Aushadhi Atorvastatin."
  }}
}}
"""
    
    try:
        response = llm.invoke([HumanMessage(content=prompt)])
        
        # Clean up any potential markdown formatting from Gemini
        clean_json_text = response.content.replace("```json", "").replace("```", "").strip()
        
        final_decision = json.loads(clean_json_text)
        
        # Fallback: If Gemini hallucinates the Jan Aushadhi part, force our tool's result
        if state['jan_aushadhi_result'].get('found') and final_decision['status'] != 'blocked':
            tool_data = state['jan_aushadhi_result']['drug_data']
            final_decision['savings'] = {
                "found": True,
                "text": f"Save {tool_data.get('savings_amount', 'money')} by switching to Jan Aushadhi {tool_data.get('generic_name', 'alternative')}."
            }
        
        # Add PubMed sources to the response
        final_decision['sources'] = pubmed_articles
        
        return {"final_response": final_decision}
        
    except Exception as e:
        print(f"❌ Safety Agent Error: {e}")
        # Fail Safe Response
        return {"final_response": {
            "status": "caution",
            "title": "Analysis Error",
            "message": "Could not complete automated safety check. Please review guidelines manually.",
            "evidence": f"System Error: {str(e)}",
            "suggestion": None,
            "savings": {"found": False},
            "sources": pubmed_articles
        }}

# ==========================================
# 🕸 SIMPLIFIED WORKFLOW (NO LANGGRAPH)
# ==========================================
def run_agent_workflow(patient_id: str, doctor_query: str) -> Dict[str, Any]:
    """
    Execute the multi-agent workflow without LangGraph dependency.
    This is a simplified linear execution: Personalize -> Research -> Safety
    """
    print(f"\n🚀 Starting Agent Workflow for Patient {patient_id}")
    print(f"📝 Query: {doctor_query}\n")
    
    # Initialize state
    state: AgentState = {
        "patient_id": patient_id,
        "doctor_query": doctor_query,
        "patient_data": {},
        "research_evidence": "",
        "jan_aushadhi_result": {},
        "final_response": {}
    }
    
    # Step 1: Personalization Agent
    personalization_result = personalization_agent(state)
    state.update(personalization_result)
    
    # Step 2: Research Agent
    research_result = research_agent(state)
    state.update(research_result)
    
    # Step 3: Safety Agent
    safety_result = safety_agent(state)
    state.update(safety_result)
    
    # Debug: Print sources count
    sources_count = len(state["final_response"].get("sources", []))
    print(f"📊 Final Response contains {sources_count} sources")
    
    print("✅ Agent Workflow Complete\n")
    
    return state["final_response"]

# ==========================================
# 🧪 TESTING AREA
# ==========================================
if __name__ == "__main__":
    print("\n🧪 Testing Multi-Agent System...\n")
    
    # Test Case 1: Simple query
    result = run_agent_workflow(
        patient_id="PAT-001",
        doctor_query="Prescribe Diclofenac 50mg for joint pain"
    )
    
    print("📊 FINAL RESULT:")
    print(json.dumps(result, indent=2))
