// Theme Definitions - Liquid Glass Aesthetic
export const THEMES = {
  dark: {
    // Uses your uploaded dark textured image
    bg: "bg-[url('/dark-bg.png')] bg-cover bg-center bg-fixed",
    textMain: "text-white",
    textMuted: "text-white/80",
    
    // Liquid Glass Card (Dark Mode)
    cardBg: "bg-black/30 backdrop-blur-md shadow-[inset_0_1px_0px_rgba(255,255,255,0.25),0_4px_20px_rgba(0,0,0,0.5)]",
    cardBorder: "border-white/20",
    
    // Interactive Elements
    glass: "bg-white/5 backdrop-blur-sm border border-white/20 shadow-[inset_0_1px_0px_rgba(255,255,255,0.1)]",
    glassHover: "hover:bg-white/10 hover:border-white/40 transition-all duration-300",
    
    inputBg: "bg-black/40 border border-white/30 text-white placeholder-white/50 focus:bg-black/50 focus:border-white/60 focus:ring-1 focus:ring-white/30 shadow-inner",
    
    sidebarBg: "bg-black/40 backdrop-blur-xl border-r border-white/10",
    navActive: "bg-white/20 text-white shadow-[inset_0_1px_0px_rgba(255,255,255,0.2)] border border-white/20",
    navInactive: "text-white/60 hover:bg-white/10 hover:text-white transition-colors",
    
    accent: "text-indigo-300",
    dangerBg: "bg-rose-500/20",
    dangerText: "text-rose-200",
    dangerBorder: "border-rose-500/30",
    successBg: "bg-emerald-500/20",
    successText: "text-emerald-200",
    successBorder: "border-emerald-500/30",
  },
  light: {
    // Uses your uploaded colorful light image
    bg: "bg-[url('/light-bg.jpg')] bg-cover bg-center bg-fixed",
    textMain: "text-white", // Kept white text as the image is vibrant/dark enough to support it
    textMuted: "text-white/80",
    
    // Liquid Glass Card (Light Mode)
    cardBg: "bg-black/10 backdrop-blur-md shadow-[inset_0_1px_0px_rgba(255,255,255,0.75),0_8px_30px_rgba(0,0,0,0.1)]",
    cardBorder: "border-white/50",
    
    // Interactive Elements
    glass: "bg-white/20 backdrop-blur-sm border border-white/50 shadow-[inset_0_1px_0px_rgba(255,255,255,0.75),0_0_9px_rgba(0,0,0,0.1)]",
    glassHover: "hover:bg-white/30 hover:border-white/70 transition-all duration-300",
    
    // Sidebar
    sidebarBg: "bg-black/10 backdrop-blur-xl border-r border-white/40 shadow-lg",
    navActive: "bg-white/40 text-white border border-white/60 shadow-[inset_0_1px_0px_rgba(255,255,255,0.5)]",
    navInactive: "text-white/70 hover:bg-white/20 hover:text-white",
    
    inputBg: "bg-black/10 border border-white/50 text-white placeholder-white/70 focus:bg-white/20 focus:border-white/80 shadow-[inset_0_1px_0px_rgba(255,255,255,0.2)]",
    
    accent: "text-white font-bold",
    dangerBg: "bg-rose-500/30 backdrop-blur-sm",
    dangerText: "text-white",
    dangerBorder: "border-white/40",
    successBg: "bg-emerald-500/30 backdrop-blur-sm",
    successText: "text-white",
    successBorder: "border-white/40",
  }
};

// Mock Data
export const INITIAL_ROUNDS = [
  { id: 1, type: 'Guideline', tagColor: 'bg-rose-500/80', title: 'New Beta-Blocker Protocol', summary: 'Updated guidelines for heart failure management suggest initiating therapy at lower doses for elderly patients.', source: 'ACC Guidelines 2024', url: 'https://www.acc.org/Latest-in-Cardiology/Clinical-Guidance', isBookmarked: false },
  { id: 2, type: 'Research', tagColor: 'bg-blue-500/80', title: 'AI in Early Sepsis Detection', summary: 'Machine learning models show 94% accuracy in predicting sepsis onset 12 hours prior to clinical symptoms.', source: 'NEJM • 2 days ago', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=artificial+intelligence+sepsis+detection', isBookmarked: true },
  { id: 3, type: 'Research', tagColor: 'bg-blue-500/80', title: 'Gluten & Autoimmune markers', summary: 'Study reveals correlation between gluten intake and inflammatory markers in non-celiac patients.', source: 'Lancet • 5 days ago', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=gluten+autoimmune+inflammatory+markers', isBookmarked: false },
  { id: 4, type: 'Guideline', tagColor: 'bg-rose-500/80', title: 'Pediatric Asthma Updates', summary: 'GINA 2024 report emphasizes SMART therapy (Single Maintenance and Reliever Therapy) for children > 6 years.', source: 'GINA Report', url: 'https://ginasthma.org/reports/', isBookmarked: false },
];

export const MOCK_PATIENTS = [
  { id: 1, name: 'Rahul Verma', age: 45, gender: 'Male', condition: 'Chronic Kidney Disease', status: 'Critical', vitals: { hr: 88, bp: '160/100', spO2: '96%', weight: '78kg' }, appointment: 'Today' },
  { id: 2, name: 'Priya Sharma', age: 28, gender: 'Female', condition: 'Dengue Fever', status: 'Waiting', vitals: { hr: 112, bp: '110/70', spO2: '98%', weight: '55kg' }, appointment: 'Today' },
  { id: 3, name: 'Amit Singh', age: 55, gender: 'Male', condition: 'Hypertension', status: 'Follow-up', vitals: { hr: 72, bp: '130/85', spO2: '98%', weight: '82kg' }, appointment: 'Tomorrow' },
  { id: 4, name: 'Sunita Devi', age: 62, gender: 'Female', condition: 'Type 2 Diabetes', status: 'Routine', vitals: { hr: 76, bp: '128/82', spO2: '97%', weight: '70kg' }, appointment: 'Today' },
];

export const PATIENT_DETAILS_MAP = {
  1: { // Rahul (CKD)
    allergies: ['Penicillin', 'NSAIDs'],
    lastSummary: [
      "Patient complained of dizziness and mild pedal edema.",
      "BP remained elevated despite medication adherence.",
      "Reduced Telmisartan dosage due to potassium levels.",
      "Advised strict salt restriction and fluid log."
    ],
    graphLabel: "Creatinine Trend (mg/dL)",
    vitalsData: [
      { date: 'Jan', value: 2.1 },
      { date: 'Feb', value: 1.9 },
      { date: 'Mar', value: 2.0 },
      { date: 'Apr', value: 1.8 },
      { date: 'May', value: 1.7 },
    ]
  },
  2: { // Priya (Dengue)
    allergies: ['Sulfa Drugs'],
    lastSummary: [
      "Admitted with high grade fever (103°F) and retro-orbital pain.",
      "Hydration therapy initiated with IV fluids.",
      "Platelet count monitoring advised every 6 hours.",
      "Paracetamol 650mg SOS for fever."
    ],
    graphLabel: "Platelet Count (/mcL)",
    vitalsData: [
      { date: 'Mon', value: 150000 },
      { date: 'Tue', value: 130000 },
      { date: 'Wed', value: 95000 },
      { date: 'Thu', value: 80000 },
      { date: 'Fri', value: 85000 }, 
    ]
  }
};