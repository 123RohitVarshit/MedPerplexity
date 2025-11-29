import json
import re
import os
import difflib
import xml.etree.ElementTree as ET
from typing import List, Dict, Any, Optional
import requests
from dotenv import load_dotenv

# --- CONFIGURATION ---
load_dotenv()
ENTREZ_EMAIL = os.getenv("ENTREZ_EMAIL", "pratham16salgaonkar@gmail.com")
NCBI_API_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/"

JAN_AUSHADHI_DB_PATH = "data/jan_aushadhi.json"

# ==========================================
# 🛠 TOOL 1: PUBMED RESEARCHER
# ==========================================

def clean_xml_text(text: str) -> str:
    """Removes HTML Tags and extra whitespace."""
    if not text:
        return ""
    clean = re.sub(r'<[^>]+>', '', text)
    return " ".join(clean.split())

def search_pubmed_ids(query: str, strict_mode: bool = True) -> List[str]:
    """Finds PMIDs using NCBI E-Utilities API."""
    date_filter = ' AND ("2015/01/01"[Date - Publication] : "3000"[Date - Publication])'
    quality_filter = ' AND (Systematic Review[pt] OR Guideline[pt] OR Clinical Trial[pt] OR Meta-Analysis[pt])' if strict_mode else ""
    language_filter = " AND English[Language]"
    
    final_query = f"({query}){quality_filter}{date_filter}{language_filter}"
    
    params = {
        "db": "pubmed",
        "term": final_query,
        "retmax": 5,
        "sort": "relevance",
        "retmode": "json",
        "email": ENTREZ_EMAIL
    }
    
    try:
        response = requests.get(f"{NCBI_API_BASE}esearch.fcgi", params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        return data.get("esearchresult", {}).get("idlist", [])
    except Exception as e:
        print(f"Error in Search: {e}")
        return []

def fetch_article_details(id_list: List[str]) -> List[Dict[str, Any]]:
    """Fetches full details for PMIDs using XML parsing."""
    if not id_list:
        return []
    
    params = {
        "db": "pubmed",
        "id": ",".join(id_list),
        "retmode": "xml",
        "email": ENTREZ_EMAIL
    }
    
    try:
        response = requests.get(f"{NCBI_API_BASE}efetch.fcgi", params=params, timeout=15)
        response.raise_for_status()
        
        root = ET.fromstring(response.content)
        formatted_articles = []
        
        for article_elem in root.findall(".//PubmedArticle"):
            try:
                # Extract PMID
                pmid_elem = article_elem.find(".//PMID")
                pmid = pmid_elem.text if pmid_elem is not None else "Unknown"
                
                # Extract Title
                title_elem = article_elem.find(".//ArticleTitle")
                title = clean_xml_text(title_elem.text if title_elem is not None else "No Title")
                
                # Extract Journal
                journal_elem = article_elem.find(".//Journal/ISOAbbreviation")
                if journal_elem is None:
                    journal_elem = article_elem.find(".//Journal/Title")
                journal = journal_elem.text if journal_elem is not None else "Unknown Journal"
                
                # Extract Date
                pub_date_elem = article_elem.find(".//PubDate")
                year = pub_date_elem.find("Year")
                month = pub_date_elem.find("Month")
                pub_date = f"{year.text if year is not None else 'Unknown'} {month.text if month is not None else ''}".strip()
                
                # Extract Abstract
                abstract_texts = article_elem.findall(".//AbstractText")
                if abstract_texts:
                    abstract_parts = []
                    for abs_text in abstract_texts:
                        label = abs_text.get("Label", "")
                        text = abs_text.text or ""
                        if label:
                            abstract_parts.append(f"{label.upper()}: {text}")
                        else:
                            abstract_parts.append(text)
                    abstract = clean_xml_text("\n".join(abstract_parts))
                else:
                    abstract = "No Abstract Available."
                
                formatted_articles.append({
                    "pmid": pmid,
                    "title": title,
                    "journal": journal,
                    "pub_date": pub_date,
                    "abstract": abstract,
                    "url": f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/"
                })
            except Exception as e:
                print(f"Error parsing article: {e}")
                continue
        
        return formatted_articles
    except Exception as e:
        print(f"Error in Fetch: {e}")
        return []

def query_pubmed_realtime(query: str) -> str:
    """Main entry point for PubMed research. Returns JSON string."""
    print(f"🔎 Researching: {query}...")
    pmids = search_pubmed_ids(query, strict_mode=True)
    
    if not pmids:
        print("⚠ No high-evidence results. Broadening search...")
        pmids = search_pubmed_ids(query, strict_mode=False)
    
    if not pmids:
        return json.dumps({"status": "error", "message": "No results found."})
        
    articles = fetch_article_details(pmids)
    return json.dumps({"status": "success", "evidence_count": len(articles), "articles": articles}, indent=2)


# ==========================================
# 🛠 TOOL 2: JAN AUSHADHI FINDER
# ==========================================

def get_similarity_score(query: str, target: str) -> float:
    """Calculates similarity score with substring bonus."""
    q = query.lower().strip()
    t = target.lower().strip()
    
    # Standard Fuzzy Score
    matcher = difflib.SequenceMatcher(None, q, t)
    base_score = matcher.ratio() * 100
    
    # Substring Bonus (e.g. "Atorvastatin" inside "Atorvastatin Calcium")
    if len(q) > 4 and q in t:
        return max(base_score, 95.0)
        
    return base_score

def load_jan_aushadhi_db(filepath: str = JAN_AUSHADHI_DB_PATH) -> List[Dict]:
    """Helper to load the JSON DB safely."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"❌ Error: Database file {filepath} not found.")
        return []
    except json.JSONDecodeError:
        print(f"❌ Error: Invalid JSON in {filepath}.")
        return []

def search_jan_aushadhi(query_drug: str, medicine_database: Optional[List[Dict]] = None) -> Dict:
    """
    Searches for a drug in the database using fuzzy + substring matching.
    If database is not provided, it loads from default path.
    """
    if medicine_database is None:
        medicine_database = load_jan_aushadhi_db()
        
    if not medicine_database:
        return {"found": False, "message": "Database unavailable."}

    best_match = None
    highest_score = 0
    matched_name_source = "" 
    THRESHOLD = 85.0
    
    for record in medicine_database:
        # 1. Check Generic Name
        generic_name = record.get('generic_name', '')
        generic_score = get_similarity_score(query_drug, generic_name)
        
        # 2. Check Common Brand Names
        brand_score = 0
        current_best_brand = ""
        
        for brand in record.get('common_brands', []):
            b_score = get_similarity_score(query_drug, brand)
            if b_score > brand_score:
                brand_score = b_score
                current_best_brand = brand
        
        # 3. Determine best score for this record
        if generic_score > brand_score:
            current_record_score = generic_score
            current_source = f"Generic Match ({generic_name})"
        else:
            current_record_score = brand_score
            current_source = f"Brand Match ({current_best_brand})"
            
        # 4. Update global best match
        if current_record_score > highest_score:
            highest_score = current_record_score
            best_match = record
            matched_name_source = current_source

    # 5. Result Construction
    if highest_score >= THRESHOLD:
        jan_price = float(best_match.get('jan_price', 0))
        market_price = float(best_match.get('market_avg_price', 0))
        savings_amount = market_price - jan_price
        
        if savings_amount < 0:
             return {"found": False, "message": "Generic found but offers no savings."}

        return {
            "found": True,
            "drug_data": {
                "generic_name": best_match['generic_name'],
                "brand_name_detected": query_drug,
                "match_source": matched_name_source,
                "jan_aushadhi_price": f"₹{jan_price}",
                "market_average_price": f"₹{market_price}",
                "savings_amount": f"₹{savings_amount:.2f}",
                "savings_percentage": best_match.get('savings_percentage', '0%')
            },
            "message": (
                f"Switch Available: Jan Aushadhi {best_match['generic_name']} costs "
                f"₹{jan_price} (vs ₹{market_price}). Save ₹{savings_amount:.2f}."
            )
        }
    else:
        return {
            "found": False, 
            "message": f"No direct Jan Aushadhi substitute found. (Best match: {highest_score:.1f}%)"
        }

# ==========================================
# 🧪 TEST AREA
# ==========================================
if __name__ == "__main__":
    # Test 1: PubMed
    print("\n--- Testing PubMed ---")
    print(query_pubmed_realtime("Clopidogrel Omeprazole interaction"))

    # Test 2: Jan Aushadhi
    print("\n--- Testing Jan Aushadhi ---")
    # Mock DB for testing so we don't need the file to exist just for this print
    mock_db = [{
        "generic_name": "Atorvastatin",
        "common_brands": ["Lipitor", "Storvas"],
        "jan_price": 12,
        "market_avg_price": 140,
        "savings_percentage": "91%"
    }]
    print(search_jan_aushadhi("Lipitor", mock_db))