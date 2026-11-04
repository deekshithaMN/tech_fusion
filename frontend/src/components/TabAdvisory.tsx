import React, { useState, useMemo } from 'react';
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
  Info,
  Wind,
  Sun,
  CheckCircle2,
  TrendingUp,
  Gauge,
  Timer,
  Layers,
  BarChart3,
  Leaf,
  CloudRain,
  AlertTriangle,
  ChevronRight,
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
  AIAdvisoryExplanation,
} from '../types';
import { I18N } from '../data/i18n';
import { askAiAssistantApi } from '../services/api';
import {
  localComputeStageWiseIrrigation,
  deriveSoilWaterProfile,
  generateIrrigationInstructions,
} from '../services/irrigationEngine';

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function kcColor(kc: number): string {
  if (kc >= 1.1) return '#dc2626';
  if (kc >= 0.9) return '#ea580c';
  if (kc >= 0.7) return '#d97706';
  if (kc >= 0.5) return '#16a34a';
  return '#0369a1';
}

function kcBg(kc: number): string {
  if (kc >= 1.1) return '#fee2e2';
  if (kc >= 0.9) return '#ffedd5';
  if (kc >= 0.7) return '#fef9c3';
  if (kc >= 0.5) return '#dcfce7';
  return '#e0f2fe';
}

function instructionColor(type: string): { bg: string; border: string; icon: React.ReactNode } {
  switch (type) {
    case 'warning': return { bg: '#fffbeb', border: '#fcd34d', icon: <AlertTriangle size={16} color="#d97706" /> };
    case 'success': return { bg: '#f0fdf4', border: '#86efac', icon: <CheckCircle2 size={16} color="#16a34a" /> };
    case 'action':  return { bg: '#eff6ff', border: '#93c5fd', icon: <Droplets size={16} color="#2563eb" /> };
    default:        return { bg: '#f8fafc', border: '#cbd5e1', icon: <Info size={16} color="#64748b" /> };
  }
}

function renderMarkdown(text: string): React.ReactNode {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((p, i) => i % 2 === 1 ? <strong key={i}>{p}</strong> : <span key={i}>{p}</span>);
}

// ─── Main Component ────────────────────────────────────────────────────────────

export const TabAdvisory: React.FC<TabAdvisoryProps> = ({
  farmer,
  soilReport,
  cropProfile,
  soilAnalysis,
  nutrientRec,
  irrigationRec,
  explanation,
  diagnoses,
  language,
}) => {
  const t = I18N[language];
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: language === 'kn'
        ? `ನಮಸ್ಕಾರ ${farmer.name}! ನಾನು ನಿಮ್ಮ ಆಗ್ರೋಸೆನ್ಸ್ ಎಐ ಕೃಷಿ ಸಲಹೆಗಾರ. ನಿಮ್ಮ ಮಣ್ಣು ಪರೀಕ್ಷೆ, ಬೆಳೆ ಗೊಬ್ಬರ ಅಥವಾ ನೀರಾವರಿ ಬಗ್ಗೆ ಯಾವುದೇ ಪ್ರಶ್ನೆಗಳಿದ್ದರೂ ಕೇಳಿ.`
        : language === 'hi'
        ? `नमस्ते ${farmer.name}! मैं आपका एग्रोसेंस एआई सलाहकार हूँ। अपनी मिट्टी, खाद अथवा सिंचाई के संबंध में कोई भी प्रश्न पूछें।`
        : `Welcome ${farmer.name}! I am your AgroSense AI agronomic advisor. Ask me anything about your soil health, fertilizer schedule, or irrigation requirements.`,
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);

  // ── Compute precision irrigation advisory ────────────────────────────────
  const stageAdvisory = useMemo(() =>
    localComputeStageWiseIrrigation(cropProfile, soilReport.parameters, (soilReport as any).soilTexture),
    [cropProfile, soilReport]
  );

  const soilWaterProfile = useMemo(() =>
    deriveSoilWaterProfile(soilReport.parameters, (soilReport as any).soilTexture),
    [soilReport]
  );

  const irrigationInstructions = useMemo(() =>
    generateIrrigationInstructions(stageAdvisory, soilWaterProfile, language, irrigationRec.weather.forecastRainMm),
    [stageAdvisory, soilWaterProfile, language, irrigationRec]
  );

  const latestDiagnosis = diagnoses.length > 0 ? diagnoses[0] : null;
  const cropTitle = language === 'kn' ? nutrientRec.crop?.kannadaName : language === 'hi' ? nutrientRec.crop?.hindiName : nutrientRec.crop?.name;
  const stageTitle = language === 'kn' ? irrigationRec.crop?.stageKn : language === 'hi' ? irrigationRec.crop?.stageHi : irrigationRec.crop?.stage;

  const currentStage = stageAdvisory.currentStage;
  const timeline = stageAdvisory.timeline;
  const maxLitres = Math.max(...timeline.map(t => t.dailyLitres), 1);

  // Irrigation method display
  const effMap: Record<string, number> = { drip: 90, sprinkler: 75, furrow: 60 };
  const effPct = effMap[cropProfile.irrigationMethod] || 90;

  const handlePrint = () => window.print();

  const handleSendMessage = async (textToSend?: string) => {
    const question = textToSend || inputQuestion.trim();
    if (!question) return;
    setChatMessages(prev => [...prev, { sender: 'user', text: question }]);
    if (!textToSend) setInputQuestion('');
    setIsAsking(true);
    try {
      const answer = await askAiAssistantApi(question, language, cropProfile, soilAnalysis, nutrientRec, irrigationRec);
      setChatMessages(prev => [...prev, { sender: 'ai', text: answer }]);
    } catch {
      setChatMessages(prev => [...prev, { sender: 'ai', text: language === 'kn' ? 'ದೋಷ ಸಂಭವಿಸಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ.' : 'Something went wrong. Please try again.' }]);
    } finally {
      setIsAsking(false);
    }
  };

  const cardStyle = {
    background: '#ffffff', borderRadius: '16px',
    border: '1px solid #e9ecef', padding: '1.5rem',
    boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
  };

  return (
    <div className="tab-advisory-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Top Action Bar ─────────────────────────────────────────────── */}
      <div style={{ ...cardStyle, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800', color: '#1b4332' }}>{t.reportTitle}</h2>
          <span style={{ color: '#6c757d', fontSize: '0.88rem' }}>
            {farmer.name} • {farmer.location.village}, {farmer.location.taluk}, {farmer.location.district}
          </span>
        </div>
        <button
          type="button" onClick={handlePrint}
          style={{ background: '#2d6a4f', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.65rem 1.25rem', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 2px 6px rgba(45,106,79,0.25)' }}
        >
          <Printer size={18} /><span>{t.downloadReport}</span>
        </button>
      </div>

      {/* ── Farm Context Ribbon ───────────────────────────────────────── */}
      <div style={{ background: '#f1f8f5', borderRadius: '12px', border: '1px solid #b7e4c7', padding: '1rem 1.25rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '1rem' }}>
        {[
          { label: t.selectCropLabel, value: `${cropTitle} (${stageTitle})`, color: '#1b4332' },
          { label: t.farmAreaLabel, value: `${cropProfile.farmArea} ${cropProfile.areaUnit}`, color: '#1b4332' },
          { label: t.irrigationMethodLabel, value: `${cropProfile.irrigationMethod.toUpperCase()} (${effPct}% eff.)`, color: '#1b4332' },
          { label: 'Daily Water Demand', value: `${stageAdvisory.currentStage?.dailyLitres?.toLocaleString() || 0} L/day`, color: '#0284c7' },
        ].map((item, i) => (
          <div key={i}>
            <span style={{ fontSize: '0.78rem', color: '#495057', display: 'block' }}>{item.label}</span>
            <strong style={{ fontSize: '1.05rem', color: item.color }}>{item.value}</strong>
          </div>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 1: PRECISION IRRIGATION DASHBOARD (New Feature)
      ══════════════════════════════════════════════════════════════════ */}
      <div style={{ ...cardStyle, border: '1px solid #bae6fd' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
          <div style={{ background: '#e0f2fe', color: '#0284c7', padding: '0.5rem', borderRadius: '10px' }}>
            <Droplets size={24} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#0369a1' }}>
              {language === 'kn' ? 'ನಿಖರ ನೀರಾವರಿ ಸಲಹಾ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್' : language === 'hi' ? 'सटीक सिंचाई सलाह डैशबोर्ड' : 'AI-Based Precision Irrigation Dashboard'}
            </h3>
            <p style={{ margin: '0.2rem 0 0 0', color: '#6c757d', fontSize: '0.85rem' }}>
              {language === 'kn' ? 'FAO-56 ಪೆನ್ಮ್ಯಾನ್-ಮಾಂಟೀಥ್ ಮಾದರಿ ಮತ್ತು ಮಣ್ಣಿನ ಜಲ ಧಾರಣ ಸಾಮರ್ಥ್ಯ ಆಧರಿಸಿದ ನೀರಾವರಿ ಸಲಹೆ'
              : language === 'hi' ? 'FAO-56 Penman-Monteith मॉडल और मिट्टी की जल धारण क्षमता पर आधारित सिंचाई सलाह'
              : 'FAO-56 Penman-Monteith ET₀ model with soil water-holding capacity analysis'}
            </p>
          </div>
        </div>

        {/* 1A. Current Stage Callout */}
        <div style={{ background: 'linear-gradient(135deg, #0c4a6e, #0369a1)', borderRadius: '14px', padding: '1.25rem', marginBottom: '1.25rem', color: '#fff' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.8, marginBottom: '0.25rem' }}>
                {language === 'kn' ? 'ಪ್ರಸ್ತುತ ಹಂತ — ನೀರಿನ ಅಗತ್ಯ' : '📍 Current Stage Water Requirement'}
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: '900' }}>
                {currentStage?.stageName}
              </div>
              <div style={{ fontSize: '0.88rem', opacity: 0.85, marginTop: '0.2rem' }}>
                Kc = {currentStage?.kc} &nbsp;|&nbsp; ETc = {currentStage?.etc_mm} mm/day &nbsp;|&nbsp; ET₀ = {currentStage?.et0_mm} mm/day
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.78rem', opacity: 0.8 }}>Daily Gross Requirement</div>
              <div style={{ fontSize: '2.5rem', fontWeight: '900', lineHeight: 1 }}>
                {currentStage?.dailyLitres?.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Litres / day</div>
              <div style={{ fontSize: '0.78rem', opacity: 0.7, marginTop: '0.2rem' }}>
                {currentStage?.weeklyLitres?.toLocaleString()} L / week
              </div>
            </div>
          </div>
        </div>

        {/* 1B. KPI Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
          {[
            { icon: <Gauge size={18} color="#0284c7" />, label: 'Gross Irrigation Depth', value: `${currentStage?.grossMm} mm/day`, sub: `Net ETc ÷ ${effPct}% efficiency`, bg: '#f0f9ff' },
            { icon: <Timer size={18} color="#7c3aed" />, label: 'Crop Duration', value: `${currentStage?.durationDays} days`, sub: `${stageAdvisory.cropName} this stage`, bg: '#faf5ff' },
            { icon: <Layers size={18} color="#d97706" />, label: 'Soil Water Store', value: `${currentStage?.availableWaterMm} mm`, sub: `Available in root zone (60cm)`, bg: '#fffbeb' },
            { icon: <TrendingUp size={18} color="#16a34a" />, label: 'Seasonal Total', value: `${(stageAdvisory.totalSeasonalLitres / 1000).toFixed(0)}K L`, sub: `Entire crop season estimate`, bg: '#f0fdf4' },
          ].map((kpi, i) => (
            <div key={i} style={{ background: kpi.bg, borderRadius: '12px', padding: '0.9rem 1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
                {kpi.icon}
                <span style={{ fontSize: '0.72rem', color: '#6c757d', fontWeight: '600', textTransform: 'uppercase' }}>{kpi.label}</span>
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1e293b' }}>{kpi.value}</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.1rem' }}>{kpi.sub}</div>
            </div>
          ))}
        </div>

        {/* 1C. Soil Water Profile Card */}
        <div style={{ background: soilWaterProfile.waterHoldingCategory === 'low' ? '#fff7ed' : soilWaterProfile.waterHoldingCategory === 'high' ? '#eff6ff' : '#f0fdf4', border: `1px solid ${soilWaterProfile.waterHoldingCategory === 'low' ? '#fed7aa' : soilWaterProfile.waterHoldingCategory === 'high' ? '#bfdbfe' : '#bbf7d0'}`, borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Layers size={18} color={soilWaterProfile.waterHoldingCategory === 'low' ? '#ea580c' : '#2d6a4f'} />
            <strong style={{ fontSize: '0.9rem', color: '#1e293b' }}>
              {language === 'kn' ? 'ಮಣ್ಣಿನ ಜಲ ಧಾರಣ ಸ್ಥಿತಿ' : 'Soil Water Holding Profile'} — {soilWaterProfile.textureDisplayName}
            </strong>
            <span style={{
              marginLeft: 'auto', background: soilWaterProfile.waterHoldingCategory === 'low' ? '#fef3c7' : soilWaterProfile.waterHoldingCategory === 'high' ? '#dbeafe' : '#dcfce7',
              color: soilWaterProfile.waterHoldingCategory === 'low' ? '#92400e' : soilWaterProfile.waterHoldingCategory === 'high' ? '#1e40af' : '#166534',
              fontSize: '0.72rem', fontWeight: '700', padding: '0.15rem 0.5rem', borderRadius: '50px',
            }}>
              WHC: {soilWaterProfile.whcMmPer100mm} mm/100mm — {soilWaterProfile.waterHoldingCategory.toUpperCase()}
            </span>
          </div>
          <p style={{ margin: '0 0 0.4rem 0', fontSize: '0.85rem', color: '#374151' }}>{soilWaterProfile.irrigationFrequencyAdvice}</p>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#4b5563', fontStyle: 'italic' }}>{soilWaterProfile.organicCarbonEffect}</p>
        </div>

        {/* 1D. Operational Schedule */}
        <div style={{ background: '#f0f9ff', border: '2px solid #7dd3fc', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {t.scheduleBox}
          </span>
          <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0c4a6e', margin: '0.35rem 0' }}>
            {language === 'kn' ? irrigationRec.operationalSchedule.recommendedScheduleKn : language === 'hi' ? irrigationRec.operationalSchedule.recommendedScheduleHi : irrigationRec.operationalSchedule.recommendedSchedule}
          </div>
          <p style={{ margin: 0, color: '#0369a1', fontSize: '0.88rem' }}>
            {language === 'kn' ? irrigationRec.operationalSchedule.decisionReasonKn : language === 'hi' ? irrigationRec.operationalSchedule.decisionReasonHi : irrigationRec.operationalSchedule.decisionReason}
          </p>
        </div>

        {/* 1E. Stage-wise Water Timeline (Visual Chart) */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <BarChart3 size={18} color="#2d6a4f" />
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#1b4332' }}>
              {language === 'kn' ? 'ಬೆಳೆಯ ಬೆಳವಣಿಗೆ ಹಂತ — ನೀರಿನ ಟೈಮ್‌ಲೈನ್' : language === 'hi' ? 'फसल वृद्धि अवस्था — जल टाइमलाइन' : 'Growth-Stage Water Requirement Timeline'}
            </h4>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {timeline.map((stage, idx) => {
              const isCurrent = stage.stageKey === currentStage?.stageKey;
              const barWidth = `${Math.round((stage.dailyLitres / maxLitres) * 100)}%`;
              return (
                <div key={idx} style={{
                  background: isCurrent ? '#eff6ff' : '#fafafa',
                  border: isCurrent ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                  borderRadius: '12px', padding: '0.9rem 1rem',
                  position: 'relative',
                }}>
                  {isCurrent && (
                    <span style={{ position: 'absolute', top: '0.5rem', right: '0.75rem', background: '#3b82f6', color: '#fff', fontSize: '0.65rem', fontWeight: '700', padding: '0.1rem 0.4rem', borderRadius: '50px' }}>
                      CURRENT
                    </span>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div>
                      <strong style={{ fontSize: '0.88rem', color: '#1e293b' }}>{stage.stageName}</strong>
                      <span style={{ marginLeft: '0.5rem', fontSize: '0.72rem', color: '#6c757d' }}>({stage.durationDays} days)</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: '800', color: kcColor(stage.kc) }}>
                        {stage.dailyLitres.toLocaleString()} L/day
                      </span>
                    </div>
                  </div>
                  {/* Bar chart */}
                  <div style={{ background: '#e5e7eb', borderRadius: '50px', height: '8px', overflow: 'hidden', marginBottom: '0.4rem' }}>
                    <div style={{
                      height: '100%',
                      width: barWidth,
                      background: `linear-gradient(90deg, ${kcColor(stage.kc)}88, ${kcColor(stage.kc)})`,
                      borderRadius: '50px',
                      transition: 'width 0.5s ease',
                    }} />
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.73rem', color: '#6c757d' }}>
                    <span style={{ background: kcBg(stage.kc), color: kcColor(stage.kc), padding: '0.1rem 0.4rem', borderRadius: '50px', fontWeight: '700' }}>Kc {stage.kc}</span>
                    <span>ETc: {stage.etc_mm} mm/day</span>
                    <span>Weekly: {stage.weeklyLitres.toLocaleString()} L</span>
                    <span>Gross: {stage.grossMm} mm/day</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: '#6c757d', background: '#f8fafc', padding: '0.65rem 0.85rem', borderRadius: '8px' }}>
            <Info size={15} color="#0284c7" />
            <span>ET₀ = {stageAdvisory.et0BaseLine} mm/day baseline (Karnataka Agro-Zone 5 & 6) | FAO-56 Penman-Monteith | Soil WHC: {soilWaterProfile.whcMmPer100mm} mm/100mm</span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 2: FARMER-FRIENDLY IRRIGATION INSTRUCTIONS
      ══════════════════════════════════════════════════════════════════ */}
      <div style={{ ...cardStyle, border: '1px solid #bbf7d0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
          <div style={{ background: '#dcfce7', color: '#16a34a', padding: '0.5rem', borderRadius: '10px' }}>
            <Leaf size={22} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#166534' }}>
              {language === 'kn' ? 'ರೈತರಿಗಾಗಿ ಪ್ರಾಯೋಗಿಕ ನೀರಾವರಿ ಸೂಚನೆಗಳು' : language === 'hi' ? 'किसानों के लिए व्यावहारिक सिंचाई निर्देश' : 'Practical Irrigation Instructions for Farmers'}
            </h3>
            <p style={{ margin: '0.2rem 0 0 0', color: '#6c757d', fontSize: '0.85rem' }}>
              {language === 'kn' ? 'ನಿಮ್ಮ ಮಣ್ಣು, ಬೆಳೆ ಮತ್ತು ಹವಾಮಾನ ಆಧರಿಸಿ ಎಐ ರಚಿಸಿದ ನಿಖರ ಸೂಚನೆಗಳು'
              : language === 'hi' ? 'आपकी मिट्टी, फसल और मौसम के अनुसार AI द्वारा तैयार व्यावहारिक निर्देश'
              : 'AI-generated practical instructions based on your soil data, crop stage, and weather conditions'}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {irrigationInstructions.map((inst, idx) => {
            const style = instructionColor(inst.type);
            return (
              <div key={idx} style={{ background: style.bg, border: `1px solid ${style.border}`, borderRadius: '10px', padding: '0.85rem 1rem', display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}>
                <div style={{ flexShrink: 0, marginTop: '0.1rem' }}>{style.icon}</div>
                <span style={{ fontSize: '0.88rem', color: '#1e293b', lineHeight: 1.6 }}>{renderMarkdown(inst.text)}</span>
              </div>
            );
          })}
        </div>

        {/* Water conservation highlight */}
        <div style={{ marginTop: '1.25rem', background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '1px solid #86efac', borderRadius: '12px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: '700', textTransform: 'uppercase' }}>
              💧 {language === 'kn' ? 'ನೀರಿನ ಉಳಿತಾಯ (ತೆಳು ನೀರಾವರಿ vs ಹನಿ)' : 'Water Savings vs Flood Irrigation'}
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#166534' }}>
              {irrigationRec.waterConservation.dailySavedLitres.toLocaleString()} L/day saved
            </div>
            <div style={{ fontSize: '0.82rem', color: '#16a34a' }}>
              {irrigationRec.waterConservation.savingsPercent}% water saving with {cropProfile.irrigationMethod} vs flood method
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '900', color: '#16a34a' }}>
              {irrigationRec.waterConservation.savingsPercent}%
            </div>
            <div style={{ fontSize: '0.78rem', color: '#15803d' }}>Efficiency Gain</div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 3: SOIL NUTRIENTS & COMMERCIAL FERTILIZER SCHEDULE
      ══════════════════════════════════════════════════════════════════ */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
          <div style={{ background: '#fef3c7', color: '#d97706', padding: '0.5rem', borderRadius: '10px' }}>
            <Package size={24} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#1b4332' }}>{t.fertilizerTitle}</h3>
            <p style={{ margin: '0.2rem 0 0 0', color: '#6c757d', fontSize: '0.85rem' }}>{t.fertilizerSubtitle}</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
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
              <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#78350f', margin: '0.4rem 0' }}>{f.totalKg} kg</div>
              <span style={{ fontSize: '0.8rem', color: '#b45309' }}>
                {language === 'kn' ? f.nutrientSuppliedKn : language === 'hi' ? f.nutrientSuppliedHi : f.nutrientSupplied}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 4: CROP VISION DIAGNOSIS (if available)
      ══════════════════════════════════════════════════════════════════ */}
      {latestDiagnosis && (
        <div style={{ ...cardStyle, border: '1px solid #b7e4c7' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '0.5rem', borderRadius: '10px' }}>
              <Camera size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#1b4332' }}>Active Crop Vision Diagnosis</h3>
              <p style={{ margin: '0.2rem 0 0 0', color: '#6c757d', fontSize: '0.85rem' }}>
                {language === 'kn' ? latestDiagnosis.cropNameKn : language === 'hi' ? latestDiagnosis.cropNameHi : latestDiagnosis.cropName} ({latestDiagnosis.growthStage})
              </p>
            </div>
          </div>
          <div style={{ background: '#fefce8', border: '1px solid #facc15', borderRadius: '10px', padding: '1rem', marginBottom: '1rem' }}>
            <strong style={{ color: '#854d0e', display: 'block', marginBottom: '0.25rem' }}>{t.soilCorrelationTitle}</strong>
            <p style={{ margin: 0, color: '#713f12', fontSize: '0.9rem' }}>
              {language === 'kn' ? latestDiagnosis.soilCorrelationKn : language === 'hi' ? latestDiagnosis.soilCorrelationHi : latestDiagnosis.soilCorrelation}
            </p>
          </div>
          <div style={{ background: '#f0fdf4', border: '1px solid #a7f3d0', borderRadius: '10px', padding: '1rem' }}>
            <strong style={{ color: '#166534', display: 'block', marginBottom: '0.25rem' }}>{t.actionableRemedyTitle}</strong>
            <p style={{ margin: 0, color: '#15803d', fontSize: '0.9rem' }}>
              {language === 'kn' ? latestDiagnosis.actionableRemedyKn : language === 'hi' ? latestDiagnosis.actionableRemedyHi : latestDiagnosis.actionableRemedy}
            </p>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 5: AI ASSISTANT CHAT
      ══════════════════════════════════════════════════════════════════ */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
          <div style={{ background: '#ede9fe', color: '#7c3aed', padding: '0.5rem', borderRadius: '10px' }}>
            <MessageSquare size={24} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#5b21b6' }}>{t.aiTitle}</h3>
            <p style={{ margin: '0.2rem 0 0 0', color: '#6c757d', fontSize: '0.85rem' }}>{t.aiSubtitle}</p>
          </div>
        </div>

        {/* Quick question chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#6c757d', alignSelf: 'center' }}>{t.sampleQuestions}</span>
          {[
            language === 'kn' ? 'ಯೂರಿಯಾವನ್ನು ಯಾವಾಗ ನೀಡಬೇಕು?' : language === 'hi' ? 'यूरिया कब डालें?' : 'When should I apply Urea?',
            language === 'kn' ? 'ಇಂದು ಎಷ್ಟು ಲೀಟರ್ ನೀರು ಹಾಯಿಸಬೇಕು?' : language === 'hi' ? 'आज कितना पानी दें?' : 'How much water does my crop need today?',
            language === 'kn' ? 'ಮಣ್ಣಿನ pH 8.1 ಇದ್ದರೆ ಏನು ಮಾಡಬೇಕು?' : language === 'hi' ? 'मिट्टी pH 8.1 क्या करें?' : 'How do I correct soil pH 8.1?',
            language === 'kn' ? 'ನೀರಾವರಿ ಎಷ್ಟು ಸಲ ನೀಡಬೇಕು?' : language === 'hi' ? 'सिंचाई कितनी बार करें?' : 'How often should I irrigate?',
          ].map((q, idx) => (
            <button key={idx} type="button" onClick={() => handleSendMessage(q)} style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '50px', padding: '0.35rem 0.85rem', fontSize: '0.8rem', color: '#374151', cursor: 'pointer' }}>
              {q}
            </button>
          ))}
        </div>

        {/* Chat box */}
        <div style={{ maxHeight: '320px', overflowY: 'auto', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
          {chatMessages.map((msg, idx) => {
            const isAi = msg.sender === 'ai';
            return (
              <div key={idx} style={{ alignSelf: isAi ? 'flex-start' : 'flex-end', maxWidth: '82%', background: isAi ? '#fff' : '#2d6a4f', color: isAi ? '#1f2937' : '#fff', padding: '0.75rem 1rem', borderRadius: isAi ? '12px 12px 12px 2px' : '12px 12px 2px 12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                {msg.text}
              </div>
            );
          })}
        </div>

        {/* Input */}
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <input
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={t.inputPlaceholder}
            style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '0.9rem' }}
          />
          <button
            type="button"
            disabled={isAsking}
            onClick={() => handleSendMessage()}
            style={{ background: '#2d6a4f', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.75rem 1.25rem', fontWeight: '700', cursor: isAsking ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: isAsking ? 0.7 : 1 }}
          >
            <Send size={16} /><span>{t.send}</span>
          </button>
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.85rem 1rem', fontSize: '0.78rem', color: '#64748b', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
        <Info size={15} color="#94a3b8" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
        <span>{irrigationRec.disclaimer}</span>
      </div>

    </div>
  );
};
