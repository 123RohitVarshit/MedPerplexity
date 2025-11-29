import React from 'react';
import SmoothLineChart from '../components/VitalsGraph';
import ChatInterface from '../components/ChatInterface';
import { AlertTriangle, ArrowLeft, FileText, Download } from 'lucide-react';
import { isVitalAbnormal } from '../utils';
import jsPDF from 'jspdf';

const PatientDetail = ({ patient, detailData, theme, isDarkMode, messages, setMessages }) => {
  // Export patient report as PDF
  const exportReport = () => {
    const trendStatus = calculateTrendStatus();
    const doc = new jsPDF();
    const currentDate = new Date().toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      timeZone: 'Asia/Kolkata'
    });
    
    let yPos = 20;
    const margin = 15;
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const contentWidth = pageWidth - (2 * margin);

    // Helper function to add text with word wrap and return new Y position
    const addText = (text, x, y, maxWidth, fontSize = 10, isBold = false) => {
      doc.setFontSize(fontSize);
      doc.setFont(undefined, isBold ? 'bold' : 'normal');
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, y);
      return y + (lines.length * fontSize * 0.5);
    };

    // Check if we need a new page
    const checkNewPage = (requiredSpace) => {
      if (yPos + requiredSpace > pageHeight - 30) {
        doc.addPage();
        yPos = 20;
        return true;
      }
      return false;
    };

    // HEADER with brand colors
    doc.setFillColor(79, 70, 229); // Indigo
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('Med Perplexity', pageWidth / 2, 15, { align: 'center' });
    doc.setFontSize(10);
    doc.text('Clinical Intelligence Platform', pageWidth / 2, 22, { align: 'center' });
    doc.text(`Medical Report | Generated on ${currentDate}`, pageWidth / 2, 30, { align: 'center' });
    
    yPos = 50;
    doc.setTextColor(0, 0, 0);

    // PATIENT INFORMATION
    doc.setFillColor(243, 244, 246);
    doc.rect(margin, yPos, contentWidth, 45, 'F');
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(patient.name, margin + 5, yPos + 10);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    
    const infoY = yPos + 18;
    doc.text(`Age: ${patient.age} Years`, margin + 5, infoY);
    doc.text(`Gender: ${patient.gender}`, pageWidth / 2, infoY);
    doc.text(`Patient ID: ${patient.id}`, margin + 5, infoY + 7);
    doc.text(`Condition: ${patient.condition}`, pageWidth / 2, infoY + 7);

    yPos += 50;

    // ALLERGIES (if any)
    if (detailData.allergies.length > 0) {
      checkNewPage(20);
      doc.setFillColor(254, 226, 226);
      doc.rect(margin, yPos, contentWidth, 12, 'F');
      doc.setTextColor(220, 38, 38);
      doc.setFont(undefined, 'bold');
      doc.setFontSize(10);
      doc.text(`ALLERGIES: ${detailData.allergies.join(', ')}`, margin + 3, yPos + 8);
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'normal');
      yPos += 18;
    }

    // CURRENT VITALS
    checkNewPage(60);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Current Vitals', margin, yPos);
    doc.setDrawColor(229, 231, 235);
    doc.line(margin, yPos + 2, pageWidth - margin, yPos + 2);
    yPos += 10;
    doc.setFont(undefined, 'normal');

    const vitalsEntries = Object.entries(patient.vitals);
    vitalsEntries.forEach(([key, val], idx) => {
      if (idx % 2 === 0 && idx > 0) {
        yPos += 15;
        checkNewPage(15);
      }
      
      const col = idx % 2;
      const x = margin + (col * (contentWidth / 2));
      const y = yPos;
      
      doc.setFillColor(249, 250, 251);
      doc.rect(x, y - 5, contentWidth / 2 - 3, 12, 'F');
      doc.setDrawColor(229, 231, 235);
      doc.rect(x, y - 5, contentWidth / 2 - 3, 12);
      
      doc.setFontSize(8);
      doc.setTextColor(107, 114, 128);
      doc.text(key.toUpperCase(), x + 2, y);
      doc.setFontSize(10);
      doc.setTextColor(isVitalAbnormal(key, val) ? 220 : 31, isVitalAbnormal(key, val) ? 38 : 41, isVitalAbnormal(key, val) ? 38 : 55);
      doc.setFont(undefined, 'bold');
      doc.text(String(val), x + 2, y + 5);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(0, 0, 0);
    });

    yPos += 20;

    // HEALTH TREND ANALYSIS
    checkNewPage(50);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Health Trend Analysis', margin, yPos);
    doc.line(margin, yPos + 2, pageWidth - margin, yPos + 2);
    yPos += 10;
    doc.setFont(undefined, 'normal');
    
    if (trendStatus.isImproving !== null) {
      doc.setFillColor(trendStatus.isImproving ? 209 : 254, trendStatus.isImproving ? 250 : 226, trendStatus.isImproving ? 229 : 226);
      doc.rect(margin, yPos - 3, 50, 8, 'F');
      doc.setTextColor(trendStatus.isImproving ? 5 : 220, trendStatus.isImproving ? 150 : 38, trendStatus.isImproving ? 105 : 38);
      doc.setFont(undefined, 'bold');
      doc.text(trendStatus.isImproving ? 'Improving' : 'Worsening', margin + 2, yPos + 3);
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'normal');
      yPos += 12;
    }
    
    doc.setFontSize(10);
    yPos = addText(`Metric: ${detailData.graphLabel}`, margin, yPos, contentWidth);
    yPos += 5;
    doc.setFont(undefined, 'bold');
    doc.text('Recent Values:', margin, yPos);
    doc.setFont(undefined, 'normal');
    yPos += 5;
    
    detailData.vitalsData.slice(0, 5).forEach(item => {
      checkNewPage(10);
      doc.text(`${item.date}: ${item.value}`, margin + 5, yPos);
      yPos += 5;
    });
    yPos += 5;

    // VISIT SUMMARY
    checkNewPage(50);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Last Visit Summary', margin, yPos);
    doc.line(margin, yPos + 2, pageWidth - margin, yPos + 2);
    yPos += 10;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);

    detailData.lastSummary.forEach(item => {
      checkNewPage(15);
      doc.text('•', margin, yPos);
      yPos = addText(item, margin + 5, yPos, contentWidth - 5, 9);
      yPos += 3;
    });

    // AI CONSULTATION HISTORY (limited to first 5 messages)
    if (messages.length > 0) {
      yPos += 10;
      checkNewPage(50);
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('AI Consultation History', margin, yPos);
      doc.line(margin, yPos + 2, pageWidth - margin, yPos + 2);
      yPos += 10;
      doc.setFont(undefined, 'normal');

      messages.slice(0, 5).forEach(msg => {
        checkNewPage(30);

        doc.setFillColor(msg.role === 'user' ? 238 : 240, msg.role === 'user' ? 242 : 253, msg.role === 'user' ? 255 : 244);
        const msgText = msg.text.length > 250 ? msg.text.substring(0, 250) + '...' : msg.text;
        const msgHeight = doc.splitTextToSize(msgText, contentWidth - 4).length * 4 + 10;
        doc.rect(margin, yPos - 3, contentWidth, msgHeight, 'F');
        
        doc.setFontSize(8);
        doc.setTextColor(107, 114, 128);
        doc.setFont(undefined, 'bold');
        doc.text(msg.role === 'user' ? 'DOCTOR' : 'AI CO-PILOT', margin + 2, yPos + 2);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(9);
        
        yPos = addText(msgText, margin + 2, yPos + 7, contentWidth - 4, 9);
        yPos += 5;
      });
    }

    // FOOTER
    const footerY = pageHeight - 20;
    doc.setPage(doc.internal.getNumberOfPages());
    doc.setDrawColor(229, 231, 235);
    doc.line(margin, footerY, pageWidth - margin, footerY);
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text('Med Perplexity Clinical Intelligence Platform', pageWidth / 2, footerY + 5, { align: 'center' });
    doc.text('For medical use only. Verify all information with qualified healthcare professionals.', pageWidth / 2, footerY + 10, { align: 'center' });

    // Save PDF
    doc.save(`Medical_Report_${patient.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Calculate trend direction and improvement status
  const calculateTrendStatus = () => {
    if (!detailData.vitalsData || detailData.vitalsData.length < 2) {
      return { isImproving: null, trendDirection: 'stable' };
    }
    
    const firstValue = detailData.vitalsData[0].value;
    const lastValue = detailData.vitalsData[detailData.vitalsData.length - 1].value;
    const isIncreasing = lastValue > firstValue;
    
    // Metrics where LOWER is better (downward = improving)
    const lowerIsBetter = ['creatinine', 'hba1c', 'blood pressure', 'weight', 'bmi', 'glucose', 'cholesterol'];
    // Metrics where HIGHER is better (upward = improving)
    const higherIsBetter = ['lvef', 'spo2', 'oxygen', 'ejection', 'saturation'];
    
    const label = (detailData.graphLabel || '').toLowerCase();
    const isLowerBetter = lowerIsBetter.some(metric => label.includes(metric));
    const isHigherBetter = higherIsBetter.some(metric => label.includes(metric));
    
    console.log('Trend Analysis:', { label, isIncreasing, isLowerBetter, isHigherBetter });
    
    let isImproving = null;
    if (isLowerBetter) {
      isImproving = !isIncreasing; // Decreasing is good
    } else if (isHigherBetter) {
      isImproving = isIncreasing; // Increasing is good
    }
    
    return {
      isImproving,
      trendDirection: isIncreasing ? 'up' : 'down'
    };
  };
  
  const trendStatus = calculateTrendStatus();
  
  return (
    <div className="flex-1 flex overflow-hidden">
      
      {/* LEFT PANEL: CONTEXT (40%) - Read Only */}
      <div className={`w-[40%] ${theme.bg} border-r border-white/10 p-6 overflow-y-auto space-y-6 custom-scrollbar backdrop-blur-md`}>
        
        {/* 1. Header Profile & Allergy Warning */}
        <div>
          <div className="flex justify-between items-start mb-2">
            <div>
              <h2 className={`text-3xl font-bold ${theme.textMain} drop-shadow-md`}>{patient.name}</h2>
              <p className={theme.textMuted}>{patient.age} Yrs • {patient.gender} • {patient.condition}</p>
            </div>
            <button
              onClick={exportReport}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
              title="Export Report"
            >
              <Download size={18} />
              Export
            </button>
          </div>
          
          {/* Allergy Banner */}
          {detailData.allergies.length > 0 && (
              <div className={`mt-4 ${theme.dangerBg} ${theme.dangerBorder} border px-4 py-3 rounded-xl flex items-center gap-3 animate-pulse`}>
                  <AlertTriangle size={20} className="text-white" />
                  <span className="text-sm font-bold text-white">Allergic to: {detailData.allergies.join(', ')}</span>
              </div>
          )}
        </div>

        {/* 2. Vitals Grid */}
        <div className="grid grid-cols-2 gap-4">
            {Object.entries(patient.vitals).map(([key, val]) => (
                <div key={key} className={`p-4 rounded-2xl ${theme.cardBg} border ${theme.cardBorder}`}>
                  <span className={`text-xs font-bold uppercase ${theme.textMuted}`}>{key}</span>
                  <div className={`text-2xl font-mono font-bold mt-1 ${isVitalAbnormal(key, val) ? 'text-rose-300' : 'text-white'}`}>
                      {val}
                  </div>
                </div>
            ))}
        </div>

        {/* 3. Health Trend Graph */}
        <div className={`p-4 rounded-2xl ${theme.cardBg} border ${theme.cardBorder}`}>
          <div className="flex justify-between mb-4">
            <h3 className={`text-sm font-bold uppercase ${theme.textMuted}`}>{detailData.graphLabel}</h3>
            {trendStatus.isImproving !== null && (
              <span className={`text-xs font-bold flex items-center gap-1 ${trendStatus.isImproving ? 'text-emerald-300' : 'text-rose-300'}`}>
                <ArrowLeft 
                  className={trendStatus.trendDirection === 'up' ? 'rotate-[45deg]' : 'rotate-[-45deg]'} 
                  size={12}
                /> 
                {trendStatus.isImproving ? 'Improving' : 'Worsening'}
              </span>
            )}
          </div>
          <div className="h-40">
            <SmoothLineChart data={detailData.vitalsData} theme={theme} isDark={isDarkMode} />
          </div>
        </div>

        {/* 4. Last Session Summary */}
        <div className={`p-5 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm`}>
          <h3 className={`text-sm font-bold mb-3 flex items-center gap-2 text-white`}>
              <FileText size={16} /> Last Visit Summary
          </h3>
          <ul className={`space-y-2 text-sm text-white/80`}>
            {detailData.lastSummary.map((point, i) => (
                <li key={i} className="flex gap-2 items-start">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-white/60 flex-shrink-0" />
                    <span className="leading-relaxed">{point}</span>
                </li>
            ))}
          </ul>
        </div>

      </div>

      {/* RIGHT PANEL: CO-PILOT (60%) - Interactive */}
      <ChatInterface 
        theme={theme} 
        isDarkMode={isDarkMode} 
        messages={messages} 
        setMessages={setMessages}
        patientId={patient.id}
      />

    </div>
  );
};

export default PatientDetail;