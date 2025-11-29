// API Configuration and Helper Functions
const API_BASE_URL = 'http://localhost:8000';

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

// Helper function to set auth token
export const setAuthToken = (token) => {
  localStorage.setItem('auth_token', token);
};

// Helper function to clear auth token
export const clearAuthToken = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_data');
};

// Helper function to make authenticated requests
const fetchWithAuth = async (url, options = {}) => {
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  if (response.status === 401) {
    // Token expired or invalid
    clearAuthToken();
    window.location.reload();
    throw new Error('Authentication expired. Please login again.');
  }
  
  return response;
};

// ==========================================
// AUTHENTICATION APIs
// ==========================================

export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(error.detail || 'Invalid credentials');
    }
    
    const data = await response.json();
    setAuthToken(data.access_token);
    localStorage.setItem('user_data', JSON.stringify(data.user));
    
    return data;
  } catch (error) {
    console.error('Login error:', error);
    // If it's a network error or fetch failed
    if (error.message === 'Failed to fetch') {
      throw new Error('Cannot connect to server. Please check if backend is running.');
    }
    throw error;
  }
};

export const registerUser = async (email, password, name, specialization) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name, specialization }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Registration failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// ==========================================
// PATIENT APIs
// ==========================================

export const getPatients = async (filter = 'Today') => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/patients?filter=${filter}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch patients');
    }
    
    const data = await response.json();
    
    // Transform backend data to frontend format
    const patients = Object.entries(data.patients || {}).map(([id, patient]) => ({
      id,
      name: patient.profile?.name || 'Unknown',
      age: patient.profile?.age || 0,
      gender: patient.profile?.gender || 'Unknown',
      condition: patient.condition_tags?.[0] || 'General',
      status: patient.current_vitals?.bp > '140/90' ? 'Critical' : 'Routine',
      vitals: {
        hr: patient.current_vitals?.heart_rate || 0,
        bp: patient.current_vitals?.bp || '0/0',
        spO2: patient.current_vitals?.spo2 ? `${patient.current_vitals.spo2}%` : '0%',
        weight: patient.current_vitals?.weight || '0kg'
      },
      appointment: filter,
      rawData: patient // Keep original data for detail view
    }));
    
    return patients;
  } catch (error) {
    console.error('Error fetching patients:', error);
    throw error;
  }
};

export const getPatientDetail = async (patientId) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/patients/${patientId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch patient details');
    }
    
    const data = await response.json();
    const patient = data.patient;
    
    // Transform health trends for graph - use label and value from patients.json
    const vitalsData = (patient.health_trends || []).map(trend => ({
      date: trend.label || trend.date,  // Use label field from JSON
      value: trend.value || trend.heart_rate || 0  // Use value field from JSON
    }));
    
    // Determine graph label based on patient condition
    let graphLabel = 'Health Trend';
    if (patient.condition_tags?.includes('CKD Stage 3')) {
      graphLabel = 'Creatinine Levels (mg/dL)';
    } else if (patient.condition_tags?.includes('Type 2 Diabetes')) {
      graphLabel = 'HbA1c Levels (%)';
    } else if (patient.condition_tags?.includes('Post-MI') || patient.condition_tags?.includes('Heart Failure')) {
      graphLabel = 'LVEF (%)';
    } else {
      graphLabel = 'Health Trend';
    }
    
    return {
      allergies: patient.allergies || [],
      lastSummary: [
        `Patient: ${patient.profile?.name}`,
        `Condition: ${patient.condition_tags?.join(', ')}`,
        `Current Medications: ${patient.current_medications?.map(m => m.name || m).join(', ')}`,
        `Last Updated: ${new Date().toLocaleDateString()}`
      ],
      graphLabel: graphLabel,
      vitalsData: vitalsData.length > 0 ? vitalsData : [
        { date: 'Mon', value: 70 },
        { date: 'Tue', value: 72 },
        { date: 'Wed', value: 75 },
        { date: 'Thu', value: 73 },
        { date: 'Fri', value: 71 },
      ]
    };
  } catch (error) {
    console.error('Error fetching patient detail:', error);
    throw error;
  }
};

// ==========================================
// DAILY ROUNDS APIs
// ==========================================

export const getDailyRounds = async () => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/rounds`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch daily rounds');
    }
    
    const data = await response.json();
    
    // Transform backend data to frontend format
    const rounds = (data.rounds || []).map((round, index) => ({
      id: index + 1,
      type: round.type || 'Research',
      tagColor: round.type === 'Guideline' ? 'bg-rose-500/80' : 'bg-blue-500/80',
      title: round.title,
      summary: round.summary,
      source: round.source,
      isBookmarked: false
    }));
    
    return rounds;
  } catch (error) {
    console.error('Error fetching daily rounds:', error);
    // Return fallback data if API fails
    return [];
  }
};

// ==========================================
// CHAT / AI APIs
// ==========================================

export const sendChatMessageStream = async (message, patientId = null, onChunk) => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({ 
        message, 
        patient_id: patientId 
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to send message');
    }
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullData = null;
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6);
          try {
            const data = JSON.parse(jsonStr);
            if (data.chunk) {
              onChunk(data.chunk);
            }
            if (data.done) {
              fullData = data.data || null;
            }
          } catch (e) {
            console.error('Failed to parse SSE data:', e);
          }
        }
      }
    }
    
    return fullData;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
};

export const sendChatMessage = async (message, patientId = null) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      body: JSON.stringify({ 
        message, 
        patient_id: patientId 
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to send message');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
};

// ==========================================
// JAN AUSHADHI APIs
// ==========================================

export const searchJanAushadhi = async (drugName) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/jan-aushadhi/search`, {
      method: 'POST',
      body: JSON.stringify({ drug_name: drugName }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to search drug');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error searching Jan Aushadhi:', error);
    throw error;
  }
};

export const getJanAushadhiStats = async () => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/jan-aushadhi/stats`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch stats');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching Jan Aushadhi stats:', error);
    throw error;
  }
};

// ==========================================
// HEALTH CHECK
// ==========================================

export const checkAPIHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/`);
    return response.ok;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
};
