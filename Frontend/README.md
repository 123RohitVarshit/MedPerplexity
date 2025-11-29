# 🏥 Med Perplexity - Clinical Intelligence Platform

A sophisticated AI-powered clinical decision support system that leverages multi-agent AI architecture, real-time PubMed research integration, and advanced patient data analytics to assist healthcare professionals in making evidence-based medical decisions.

![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat&logo=react)
![Vite](https://img.shields.io/badge/Vite-6.0.1-646CFF?style=flat&logo=vite)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115.5-009688?style=flat&logo=fastapi)
![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat&logo=python)

## 🌟 Key Features

### 🤖 Multi-Agent AI System
- **Personalization Agent**: Analyzes patient context including demographics, allergies, and current medications
- **Research Agent**: Performs real-time PubMed searches with quality filters (Clinical Trials, Meta-Analysis, Systematic Reviews)
- **Safety Agent**: Validates recommendations against contraindications and drug interactions

### 🔬 Real-Time Medical Research
- Integration with PubMed NCBI E-utilities API
- Automatic article metadata extraction (PMID, title, journal, publication date, abstract)
- Clickable source citations with direct PubMed links
- Evidence-based recommendations backed by peer-reviewed literature

### 📊 Patient Data Management
- Comprehensive vital signs tracking (HR, BP, SpO2, Weight, Temperature, Respiratory Rate)
- Real-time health trend analysis with improving/worsening indicators
- Interactive line charts for vitals visualization
- 30 pre-populated patient profiles with realistic medical data

### 💬 AI Clinical Co-Pilot
- Streaming word-by-word responses for real-time interaction
- Voice input support via speech-to-text (react-speech-recognition)
- Context-aware medical consultations
- Drug interaction checking and contraindication alerts

### 📄 Professional Medical Reports
- PDF export functionality using jsPDF
- Comprehensive reports including:
  - Patient demographics and allergies
  - Current vitals with abnormal value highlighting
  - Health trend analysis
  - Visit summaries
  - Complete AI consultation history
- Professional medical formatting with Med Perplexity branding

### 🎨 Modern UI/UX
- Dark/Light theme toggle
- Glassmorphism design with backdrop blur effects
- Responsive layout with smooth animations
- Real-time visual feedback for all interactions

## 🚀 Tech Stack

### Frontend
- **React 18.3.1** - Modern React with hooks
- **Vite 6.0.1** - Lightning-fast build tool and dev server
- **React Router DOM 7.0.2** - Client-side routing
- **Lucide React 0.469.0** - Beautiful icon library
- **Recharts 2.14.1** - Data visualization library
- **jsPDF 2.5.2** - PDF generation
- **React Speech Recognition 3.10.0** - Voice input support
- **Tailwind CSS** - Utility-first CSS framework

### Backend
- **FastAPI 0.115.5** - High-performance Python web framework
- **LangChain 0.3.13** - LLM orchestration framework
- **LangGraph 0.2.60** - Multi-agent workflow management
- **Google Generative AI** - Gemini Flash Lite model
- **Python HTTPX 0.28.0** - Async HTTP client for PubMed API
- **JWT Authentication** - Secure token-based auth
- **BCrypt** - Password hashing

## 📁 Project Structure

```
Med_Perplexity/
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Card.jsx              # Patient card component
│   │   │   ├── ChatInterface.jsx     # AI chat with voice input
│   │   │   ├── LoginView.jsx         # Authentication UI
│   │   │   ├── Sidebar.jsx           # Navigation sidebar
│   │   │   └── VitalsGraph.jsx       # Health trends visualization
│   │   ├── pages/
│   │   │   ├── DailyRounds.jsx       # Medical research feed
│   │   │   ├── PatientDetail.jsx     # Patient detail with AI chat
│   │   │   └── PatientList.jsx       # Patient list view
│   │   ├── App.jsx                   # Main application component
│   │   ├── constants.js              # Patient data and themes
│   │   ├── utils.js                  # Helper functions
│   │   └── main.jsx                  # React entry point
│   ├── package.json
│   └── vite.config.js
├── Backend/
│   ├── app.py                        # FastAPI server
│   ├── agent_system.py               # Multi-agent orchestration
│   ├── tools.py                      # PubMed & Jan Aushadhi APIs
│   ├── database.py                   # Mock database
│   └── requirements.txt
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- **Node.js** 18+ and npm
- **Python** 3.11+
- **Google AI API Key** (for Gemini)

### Frontend Setup

```bash
cd Frontend
npm install
npm run dev
```

Frontend will run on `http://localhost:5173`

### Backend Setup

```bash
cd Backend
pip install -r requirements.txt

# Create .env file with your API key
echo "GOOGLE_API_KEY=your_api_key_here" > .env

python app.py
```

Backend will run on `http://localhost:8000`

## 📦 Dependencies

### Frontend Dependencies
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^7.0.2",
  "lucide-react": "^0.469.0",
  "recharts": "^2.14.1",
  "jspdf": "^2.5.2",
  "react-speech-recognition": "^3.10.0"
}
```

### Backend Dependencies
```
fastapi==0.115.5
uvicorn==0.32.1
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
langchain==0.3.13
langchain-google-genai==2.0.8
langgraph==0.2.60
httpx==0.28.0
python-dotenv==1.0.1
```

## 🔐 Authentication

Currently uses temporary authentication bypass with credentials:
- **Username**: `doctor123`
- **Password**: Any password

⚠️ **Note**: This is for development purposes. Production deployment should implement proper bcrypt authentication.

## 🎯 Usage Guide

### 1. Login
- Launch both frontend and backend servers
- Login with `doctor123` username

### 2. View Patients
- Browse 30 patient profiles on the Patient List page
- Click any patient card to view detailed information

### 3. Analyze Patient Data
- View current vitals with abnormal value highlighting
- Check health trends graph with improving/worsening indicators
- Review visit summaries and medication lists

### 4. AI Clinical Consultation
- Type questions in the chat interface or use voice input (microphone button)
- Ask about drug interactions, dosage recommendations, or clinical guidelines
- View streaming AI responses with PubMed source citations
- Click source cards to read full research articles

### 5. Export Reports
- Click "Export" button on patient detail page
- Download comprehensive PDF medical report
- Report includes vitals, trends, and AI consultation history

### 6. Daily Rounds
- Check medical research updates feed
- Click "Read Full" to access PubMed articles and clinical guidelines

## 🌐 API Integrations

### PubMed NCBI E-utilities
- **ESearch**: Search PubMed database with MeSH terms
- **EFetch**: Retrieve article metadata in XML format
- **Quality Filters**: Clinical Trial, Meta-Analysis, Systematic Review, Practice Guideline

### Jan Aushadhi Database
- Generic medicine cost comparison
- Savings calculator for branded vs. generic drugs

## 🔧 Configuration

### Theme Customization
Edit `src/constants.js` to customize color schemes:
```javascript
const THEME = {
  dark: {
    bg: 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900',
    cardBg: 'bg-white/10',
    textMain: 'text-white',
    // ...
  }
}
```

### Patient Data
Add/modify patient records in `src/constants.js` under `PATIENTS` array.

## 🐛 Known Issues & Future Enhancements

### Current Limitations
- Temporary authentication bypass (bcrypt implementation pending)
- Mock patient database (requires proper database integration)
- Limited to 30 pre-loaded patients

### Planned Features
- [ ] Proper user authentication with bcrypt
- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] Admin panel for patient management
- [ ] Appointment scheduling
- [ ] Lab results integration
- [ ] Multi-language support
- [ ] Mobile responsive optimization
- [ ] Real-time notifications

## 📝 License

This project is for educational and research purposes.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 👨‍💻 Developer

Built with ❤️ for healthcare innovation

---

**⚠️ Medical Disclaimer**: This is a demonstration system for educational purposes. Always verify all medical information with qualified healthcare professionals. Not intended for actual clinical use without proper validation and regulatory approval.
