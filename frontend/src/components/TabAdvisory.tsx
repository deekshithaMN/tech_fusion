import React, { useState } from 'react';
import { 
  Printer, 
  Sprout, 
  Droplets, 
  Package, 
  Calendar, 
  AlertCircle, 
  ShieldCheck, 
  Camera, 
  MessageSquare, 
  Send, 
  Sparkles,
  HelpCircle,
  Wind,
  Sun,
  CheckCircle2,
  Info
} from 'lucide-react';
import { 
  FarmerProfile, 
  SoilReport, 
  CropProfile, 
  SoilAnalysisSummary, 
  FertilizerRecommendation, 
  IrrigationAdvisory, 
  CropDiagnosis, 
  Language, 
  AIAdvisoryExplanation 
} from '../types';
import { I18N } from '../data/i18n';
import { askAiAssistantApi } from '../services/api';

interface TabAdvisoryProps {
  farmer: FarmerProfile;
  soilReport: SoilReport;
  cropProfile: CropProfile;
  soilAnalysis: SoilAnalysisSummary;
  nutrientRec: FertilizerRecommendation;
  irrigationRec: IrrigationAdvisory;
  explanation: AIAdvisoryExplanation;
  diagnoses: CropDiagnosis[];
  language: Language;
}

export const TabAdvisory: React.FC<TabAdvisoryProps> = ({
  farmer,
  soilReport,
  cropProfile,
  soilAnalysis,
  nutrientRec,
  irrigationRec,
  explanation,
  diagnoses,
  language
}) => {
  const t = I18N[language];

  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: language === 'kn'
        ? `ನಮಸ್ಕಾರ ${farmer.name}! ನಾನು ನಿಮ್ಮ ಆಗ್ರೋಸೆನ್ಸ್ ಎಐ ಕೃಷಿ ಸಲಹೆಗಾರ. ನಿಮ್ಮ ಮಣ್ಣು ಪರೀಕ್ಷೆ, ಬೆಳೆ ಗೊಬ್ಬರ ಅಥವಾ ನೀರಾವರಿ ಬಗ್ಗೆ ಯಾವುದೇ ಪ್ರಶ್ನೆಗಳಿದ್ದರೂ ಕೇಳಿ.`
        : language === 'hi'
        ? `नमस्ते ${farmer.name}! मैं आपका एग्रोसेंस एआई सलाहकार हूँ। अपनी मिट्टी, खाद अथवा सिंचाई के संबंध में कोई भी प्रश्न पूछें।`
        : `Welcome ${farmer.name}! I am your AgroSense AI agronomic advisor. Ask me anything about your fertilizer schedule, irrigation runtime, or soil health.`
    }
  ]);
  const [inputQuestion, setInputQuestion] = useState<string>('');
  const [isAsking, setIsAsking] = useState<boolean>(false);

  const handlePrint = () => {
    window.print();
  };

  const handleSendMessage = async (textToSend?: string) => {
    const question = textToSend || inputQuestion.trim();
    if (!question) return;

    setChatMessages(prev => [...prev, { sender: 'user', text: question }]);
    if (!textToSend) setInputQuestion('');
    setIsAsking(true);

    try {
      const answer = await askAiAssistantApi(
        question,
        language,
        cropProfile,
        soilAnalysis,
        nutrientRec,
        irrigationRec
      );
      setChatMessages(prev => [...prev, { sender: 'ai', text: answer }]);
    } catch (e) {
      setChatMessages(prev => [...prev, { 
        sender: 'ai', 
        text: language === 'kn' 
          ? 'ದೋಷ ಸಂಭವಿಸಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ.' 
          : 'Something went wrong. Please try again.' 
      }]);
    } finally {
      setIsAsking(false);
    }
  };

  const latestDiagnosis = diagnoses.length > 0 ? diagnoses[0] : null;
  const cropTitle = language === 'kn' ? nutrientRec.crop?.kannadaName : language === 'hi' ? nutrientRec.crop?.hindiName : nutrientRec.crop?.name;
  const stageTitle = language === 'kn' ? irrigationRec.crop?.stageKn : language === 'hi' ? irrigationRec.crop?.stageHi : irrigationRec.crop?.stage;

  return (
    <div className="tab-advisory-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Top Action Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#ffffff',
        padding: '1.25rem 1.5rem',
        borderRadius: '14px',
        border: '1px solid #e9ecef',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        gap: '1rem'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800', color: '#1b4332' }}>
            {t.reportTitle}
          </h2>
          <span style={{ color: '#6c757d', fontSize: '0.88rem' }}>
            {farmer.name} • {farmer.location.village}, {farmer.location.taluk}, {farmer.location.district}
          </span>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          style={{
            background: '#2d6a4f',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            padding: '0.65rem 1.25rem',
            fontWeight: '700',
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 2px 6px rgba(45, 106, 79, 0.25)'
          }}
        >
          <Printer size={18} />
          <span>{t.downloadReport}</span>
        </button>
      </div>

      {/* Farm Cultivation & Weather Ribbon */}
      <div style={{
        background: '#f1f8f5',
        borderRadius: '12px',
        border: '1px solid #b7e4c7',
        padding: '1rem 1.25rem',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: '1rem'
      }}>
        <div>
          <span style={{ fontSize: '0.78rem', color: '#495057', display: 'block' }}>{t.selectCropLabel}</span>
          <strong style={{ fontSize: '1.05rem', color: '#1b4332' }}>{cropTitle} ({stageTitle})</strong>
        </div>
        <div>
          <span style={{ fontSize: '0.78rem', color: '#495057', display: 'block' }}>{t.farmAreaLabel}</span>
          <strong style={{ fontSize: '1.05rem', color: '#1b4332' }}>{cropProfile.farmArea} {cropProfile.areaUnit}</strong>
        </div>
        <div>
          <span style={{ fontSize: '0.78rem', color: '#495057', display: 'block' }}>{t.irrigationMethodLabel}</span>
          <strong style={{ fontSize: '1.05rem', color: '#1b4332' }}>{cropProfile.irrigationMethod.toUpperCase()} ({irrigationRec.method.efficiencyPercent}% efficiency)</strong>
        </div>
        <div>
          <span style={{ fontSize: '0.78rem', color: '#495057', display: 'block' }}>Daily Water Demand</span>
          <strong style={{ fontSize: '1.05rem', color: '#0284c7' }}>{irrigationRec.waterBalance.dailyLitresTotal.toLocaleString()} L/day</strong>
        </div>
      </div>

      {/* SECTION 1: Precision Irrigation Advisory (FAO-56) */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #bae6fd',
        padding: '1.5rem',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
          <div style={{ background: '#e0f2fe', color: '#0284c7', padding: '0.5rem', borderRadius: '10px' }}>
            <Droplets size={24} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#0369a1' }}>
              {t.irrigationTitle}
            </h3>
            <p style={{ margin: '0.2rem 0 0 0', color: '#6c757d', fontSize: '0.85rem' }}>
              {t.irrigationSubtitle}
            </p>
          </div>
        </div>

        {/* Operational Schedule Callout */}
        <div style={{
          background: '#f0f9ff',
          border: '2px solid #7dd3fc',
          borderRadius: '12px',
          padding: '1.25rem',
          marginBottom: '1.25rem'
        }}>
          <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {t.scheduleBox}
          </span>
          <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0c4a6e', margin: '0.35rem 0' }}>
            {language === 'kn' ? irrigationRec.operationalSchedule.recommendedScheduleKn : language === 'hi' ? irrigationRec.operationalSchedule.recommendedScheduleHi : irrigationRec.operationalSchedule.recommendedSchedule}
          </div>
          <p style={{ margin: 0, color: '#0369a1', fontSize: '0.88rem' }}>
            {language === 'kn' ? irrigationRec.operationalSchedule.decisionReasonKn : language === 'hi' ? irrigationRec.operationalSchedule.decisionReasonHi : irrigationRec.operationalSchedule.decisionReason}
          </p>
        </div>

        {/* Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '10px' }}>
            <span style={{ fontSize: '0.78rem', color: '#6c757d' }}>Daily Gross Requirement</span>
            <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0284c7', marginTop: '0.2rem' }}>
              {irrigationRec.waterBalance.dailyLitresTotal.toLocaleString()} <span style={{ fontSize: '0.85rem' }}>Litres</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#495057' }}>({irrigationRec.waterBalance.grossRequirementMm} mm/day)</span>
          </div>

          <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '10px' }}>
            <span style={{ fontSize: '0.78rem', color: '#6c757d' }}>Crop Evapotranspiration (ETc)</span>
            <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#1b4332', marginTop: '0.2rem' }}>
              {irrigationRec.evapotranspiration.etc_mm} <span style={{ fontSize: '0.85rem' }}>mm/day</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#495057' }}>(ET0 {irrigationRec.weather.et0} × Kc {irrigationRec.crop.kc})</span>
          </div>

          <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '10px' }}>
            <span style={{ fontSize: '0.78rem', color: '#6c757d' }}>Water Conserved vs Flood</span>
            <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#16a34a', marginTop: '0.2rem' }}>
              {irrigationRec.waterConservation.dailySavedLitres.toLocaleString()} <span style={{ fontSize: '0.85rem' }}>L/day</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#15803d' }}>({irrigationRec.waterConservation.savingsPercent}% savings via drip)</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#6c757d', background: '#f8f9fa', padding: '0.65rem 0.85rem', borderRadius: '8px' }}>
          <Info size={16} color="#0284c7" />
          <span>{t.soilMoistureDisclaimer}</span>
        </div>
      </div>

      {/* SECTION 2: Soil Nutrients & Commercial Bag Schedule */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e9ecef',
        padding: '1.5rem',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
          <div style={{ background: '#fef3c7', color: '#d97706', padding: '0.5rem', borderRadius: '10px' }}>
            <Package size={24} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#1b4332' }}>
              {t.fertilizerTitle}
            </h3>
            <p style={{ margin: '0.2rem 0 0 0', color: '#6c757d', fontSize: '0.85rem' }}>
              {t.fertilizerSubtitle}
            </p>
          </div>
        </div>

        {/* Commercial Bags Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
          {nutrientRec.commercialFertilizers.map((f, idx) => (
            <div key={idx} style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ color: '#92400e', fontSize: '1.05rem' }}>
                  {language === 'kn' ? f.kannadaName : language === 'hi' ? f.hindiName : f.name}
                </strong>
                <span style={{ background: '#fef3c7', color: '#b45309', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '800', fontSize: '0.85rem' }}>
                  {f.bagCountText}
                </span>
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#78350f', margin: '0.4rem 0' }}>
                {f.totalKg} kg
              </div>
              <span style={{ fontSize: '0.8rem', color: '#b45309' }}>
                {language === 'kn' ? f.nutrientSuppliedKn : language === 'hi' ? f.nutrientSuppliedHi : f.nutrientSupplied}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: Latest Crop Vision Finding (if available) */}
      {latestDiagnosis && (
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #b7e4c7',
          padding: '1.5rem',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '0.5rem', borderRadius: '10px' }}>
              <Camera size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#1b4332' }}>
                Active Crop Vision Diagnosis
              </h3>
              <p style={{ margin: '0.2rem 0 0 0', color: '#6c757d', fontSize: '0.85rem' }}>
                {language === 'kn' ? latestDiagnosis.cropNameKn : language === 'hi' ? latestDiagnosis.cropNameHi : latestDiagnosis.cropName} ({latestDiagnosis.growthStage})
              </p>
            </div>
          </div>

          <div style={{ background: '#fefce8', border: '1px solid #facc15', borderRadius: '10px', padding: '1rem', marginBottom: '1rem' }}>
            <strong style={{ color: '#854d0e', display: 'block', marginBottom: '0.25rem' }}>
              {t.soilCorrelationTitle}
            </strong>
            <p style={{ margin: 0, color: '#713f12', fontSize: '0.9rem' }}>
              {language === 'kn' ? latestDiagnosis.soilCorrelationKn : language === 'hi' ? latestDiagnosis.soilCorrelationHi : latestDiagnosis.soilCorrelation}
            </p>
          </div>

          <div style={{ background: '#f0fdf4', border: '1px solid #a7f3d0', borderRadius: '10px', padding: '1rem' }}>
            <strong style={{ color: '#166534', display: 'block', marginBottom: '0.25rem' }}>
              {t.actionableRemedyTitle}
            </strong>
            <p style={{ margin: 0, color: '#15803d', fontSize: '0.9rem' }}>
              {language === 'kn' ? latestDiagnosis.actionableRemedyKn : language === 'hi' ? latestDiagnosis.actionableRemedyHi : latestDiagnosis.actionableRemedy}
            </p>
          </div>
        </div>
      )}

      {/* SECTION 4: Interactive Multilingual AI Assistant */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e9ecef',
        padding: '1.5rem',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
          <div style={{ background: '#ede9fe', color: '#7c3aed', padding: '0.5rem', borderRadius: '10px' }}>
            <MessageSquare size={24} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#5b21b6' }}>
              {t.aiTitle}
            </h3>
            <p style={{ margin: '0.2rem 0 0 0', color: '#6c757d', fontSize: '0.85rem' }}>
              {t.aiSubtitle}
            </p>
          </div>
        </div>

        {/* Suggested Quick Question Chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#6c757d', alignSelf: 'center' }}>{t.sampleQuestions}</span>
          {[
            language === 'kn' ? 'ಯೂರಿಯಾವನ್ನು ಯಾವಾಗ ನೀಡಬೇಕು?' : 'When should I apply Urea?',
            language === 'kn' ? 'ಇಂದು ಎಷ್ಟು ಲೀಟರ್ ನೀರು ಹಾಯಿಸಬೇಕು?' : 'How much water does my crop need today?',
            language === 'kn' ? 'ಮಣ್ಣಿನ pH 8.1 ಇದ್ದರೆ ಏನು ಮಾಡಬೇಕು?' : 'How do I handle soil pH 8.1?'
          ].map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(q)}
              style={{
                background: '#f3f4f6',
                border: '1px solid #e5e7eb',
                borderRadius: '50px',
                padding: '0.35rem 0.85rem',
                fontSize: '0.8rem',
                color: '#374151',
                cursor: 'pointer'
              }}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat History Box */}
        <div style={{
          maxHeight: '320px',
          overflowY: 'auto',
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          marginBottom: '1rem'
        }}>
          {chatMessages.map((msg, idx) => {
            const isAi = msg.sender === 'ai';
            return (
              <div 
                key={idx}
                style={{
                  alignSelf: isAi ? 'flex-start' : 'flex-end',
                  maxWidth: '82%',
                  background: isAi ? '#ffffff' : '#2d6a4f',
                  color: isAi ? '#1f2937' : '#ffffff',
                  padding: '0.75rem 1rem',
                  borderRadius: isAi ? '12px 12px 12px 2px' : '12px 12px 2px 12px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                  fontSize: '0.9rem',
                  lineHeight: 1.5
                }}
              >
                {msg.text}
              </div>
            );
          })}
        </div>

        {/* Input Bar */}
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <input
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={t.inputPlaceholder}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              border: '1px solid #d1d5db',
              fontSize: '0.9rem'
            }}
          />
          <button
            type="button"
            disabled={isAsking}
            onClick={() => handleSendMessage()}
            style={{
              background: '#2d6a4f',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '0.75rem 1.25rem',
              fontWeight: '700',
              cursor: isAsking ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Send size={16} />
            <span>{t.send}</span>
          </button>
        </div>
      </div>

    </div>
  );
};
