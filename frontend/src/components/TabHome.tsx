import React from 'react';
import { 
  Sprout, 
  Camera, 
  Droplets, 
  FileText, 
  ShieldCheck, 
  Volume2, 
  VolumeX, 
  Sun, 
  Wind, 
  CloudRain, 
  Thermometer, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { 
  FarmerProfile, 
  SoilReport, 
  SoilAnalysisSummary, 
  FertilizerRecommendation, 
  IrrigationAdvisory, 
  CropDiagnosis, 
  Language, 
  NavigationTab 
} from '../types';
import { I18N } from '../data/i18n';

interface TabHomeProps {
  farmer: FarmerProfile;
  soilReport: SoilReport;
  soilAnalysis: SoilAnalysisSummary;
  nutrientRec: FertilizerRecommendation;
  irrigationRec: IrrigationAdvisory;
  diagnoses: CropDiagnosis[];
  language: Language;
  onNavigateTab: (tab: NavigationTab) => void;
  onOpenUpdateSoilModal: () => void;
  isSpeaking: boolean;
  onToggleSpeech: () => void;
}

export const TabHome: React.FC<TabHomeProps> = ({
  farmer,
  soilReport,
  soilAnalysis,
  nutrientRec,
  irrigationRec,
  diagnoses,
  language,
  onNavigateTab,
  onOpenUpdateSoilModal,
  isSpeaking,
  onToggleSpeech
}) => {
  const t = I18N[language];

  // Extract key soil stats
  const phVal = soilReport.parameters?.ph?.value ?? soilReport.parameters?.pH?.value ?? 8.1;
  const nVal = soilReport.parameters?.nitrogen?.value ?? soilReport.parameters?.N?.value ?? 188;
  const ocVal = soilReport.parameters?.organicCarbon?.value ?? soilReport.parameters?.OC?.value ?? 0.38;
  const znVal = soilReport.parameters?.zinc?.value ?? soilReport.parameters?.Zn?.value ?? 0.42;

  const zoneText = language === 'kn' 
    ? (farmer.location.agroclimaticZoneKn || farmer.location.agroclimaticZone)
    : language === 'hi'
    ? (farmer.location.agroclimaticZoneHi || farmer.location.agroclimaticZone)
    : farmer.location.agroclimaticZone;

  return (
    <div className="tab-home-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* 1. Farmer Welcome & Location Banner */}
      <div className="farmer-hero-card" style={{
        background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
        color: '#ffffff',
        borderRadius: '16px',
        padding: '1.75rem',
        boxShadow: '0 10px 25px -5px rgba(27, 67, 50, 0.25)',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1.25rem'
      }}>
        <div style={{ flex: '1 1 300px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.15)', padding: '0.35rem 0.85rem', borderRadius: '50px', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
            <Sprout size={16} />
            <span>{zoneText}</span>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '700', margin: '0 0 0.35rem 0', letterSpacing: '-0.02em' }}>
            {t.welcomeBack}, {farmer.name}!
          </h2>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '0.95rem' }}>
            {farmer.location.village}, {farmer.location.taluk}, {farmer.location.district} ({farmer.location.state}) • {farmer.totalLandArea} {farmer.areaUnit} ({farmer.defaultIrrigation.toUpperCase()})
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={onToggleSpeech}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: isSpeaking ? '#e63946' : 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: '#ffffff',
              padding: '0.65rem 1.15rem',
              borderRadius: '10px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {isSpeaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
            <span>{isSpeaking ? t.voiceStop : t.btnListenVoice}</span>
          </button>
        </div>
      </div>

      {/* 2. Persistent Active Soil Report Status Card */}
      <div className="active-soil-bar" style={{
        background: '#ffffff',
        border: '1px solid #d8f3dc',
        borderLeft: '5px solid #2d6a4f',
        borderRadius: '12px',
        padding: '1.25rem 1.5rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '1 1 360px' }}>
          <div style={{
            background: '#e8f5e9',
            color: '#2e7d32',
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <ShieldCheck size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: '700', color: '#1b4332', fontSize: '1.05rem' }}>
                {soilReport.title || t.activeSoilLinked}
              </span>
              <span style={{
                background: '#d8f3dc',
                color: '#1b4332',
                fontSize: '0.75rem',
                fontWeight: '700',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px'
              }}>
                ✓ {t.verifiedBadge}
              </span>
            </div>
            <p style={{ margin: '0.25rem 0 0 0', color: '#495057', fontSize: '0.85rem' }}>
              {soilReport.laboratoryName} • {soilReport.reportDate} • {t.persistentSoilNote}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button
            type="button"
            onClick={() => onNavigateTab('soil')}
            style={{
              background: '#f1f8f5',
              border: '1px solid #b7e4c7',
              color: '#1b4332',
              padding: '0.5rem 0.9rem',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            {t.btnReviewSoil}
          </button>
          <button
            type="button"
            onClick={onOpenUpdateSoilModal}
            style={{
              background: '#ffffff',
              border: '1px solid #ced4da',
              color: '#495057',
              padding: '0.5rem 0.9rem',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <RefreshCw size={14} />
            <span>{t.btnUpdateSoil}</span>
          </button>
        </div>
      </div>

      {/* 3. Quick Action Hub */}
      <div>
        <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#1b4332', margin: '0 0 0.85rem 0' }}>
          {t.quickActions}
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem'
        }}>
          {/* Action 1: Crop Vision Diagnosis */}
          <div 
            onClick={() => onNavigateTab('crop')}
            style={{
              background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
              border: '1px solid #a5d6a7',
              borderRadius: '12px',
              padding: '1.25rem',
              cursor: 'pointer',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ background: '#2e7d32', color: '#fff', padding: '0.6rem', borderRadius: '10px' }}>
                <Camera size={22} />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', background: '#ffffff', color: '#1b4332', padding: '0.25rem 0.5rem', borderRadius: '50px' }}>
                AI Vision
              </span>
            </div>
            <h4 style={{ margin: '0 0 0.25rem 0', color: '#1b4332', fontSize: '1.05rem', fontWeight: '700' }}>
              {t.btnDiagnoseCrop}
            </h4>
            <p style={{ margin: 0, color: '#2d6a4f', fontSize: '0.85rem' }}>
              {language === 'kn' ? 'ಎಲೆಯ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ, ಮಣ್ಣಿನ ಪೋಷಕಾಂಶಗಳೊಂದಿಗೆ ತಾಳೆ ನೋಡಿ' : 'Snap crop photo and correlate with your saved soil deficits'}
            </p>
          </div>

          {/* Action 2: Precision Irrigation Demand */}
          <div 
            onClick={() => onNavigateTab('advisory')}
            style={{
              background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
              border: '1px solid #7dd3fc',
              borderRadius: '12px',
              padding: '1.25rem',
              cursor: 'pointer',
              transition: 'transform 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ background: '#0284c7', color: '#fff', padding: '0.6rem', borderRadius: '10px' }}>
                <Droplets size={22} />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', background: '#ffffff', color: '#0369a1', padding: '0.25rem 0.5rem', borderRadius: '50px' }}>
                FAO-56
              </span>
            </div>
            <h4 style={{ margin: '0 0 0.25rem 0', color: '#0369a1', fontSize: '1.05rem', fontWeight: '700' }}>
              {t.btnWaterDemand}
            </h4>
            <p style={{ margin: 0, color: '#0284c7', fontSize: '0.85rem' }}>
              {irrigationRec.waterBalance.dailyLitresTotal.toLocaleString()} L / {language === 'kn' ? 'ದಿನ' : 'day'} • {irrigationRec.operationalSchedule.pumpDischargeAssumed}
            </p>
          </div>

          {/* Action 3: Commercial Fertilizer Checklist */}
          <div 
            onClick={() => onNavigateTab('soil')}
            style={{
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              border: '1px solid #fcd34d',
              borderRadius: '12px',
              padding: '1.25rem',
              cursor: 'pointer',
              transition: 'transform 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ background: '#d97706', color: '#fff', padding: '0.6rem', borderRadius: '10px' }}>
                <FileText size={22} />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', background: '#ffffff', color: '#92400e', padding: '0.25rem 0.5rem', borderRadius: '50px' }}>
                STCR Bags
              </span>
            </div>
            <h4 style={{ margin: '0 0 0.25rem 0', color: '#92400e', fontSize: '1.05rem', fontWeight: '700' }}>
              {t.commercialFertilizers}
            </h4>
            <p style={{ margin: 0, color: '#b45309', fontSize: '0.85rem' }}>
              {nutrientRec.commercialFertilizers.map(f => `${f.name.split(' ')[0]}: ${f.bagCountText.split(' ')[0]} ${language === 'kn' ? 'ಚೀಲ' : 'bags'}`).join(' • ')}
            </p>
          </div>
        </div>
      </div>

      {/* 4. Split Grid: Live Weather & Soil Health Scorecard */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        
        {/* Card A: Live Agricultural Weather (Open-Meteo) */}
        <div style={{
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e9ecef',
          padding: '1.5rem',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sun color="#f59e0b" size={24} />
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#212529' }}>
                {t.liveWeatherTitle}
              </h3>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#6c757d', background: '#f8f9fa', padding: '0.25rem 0.6rem', borderRadius: '6px' }}>
              {farmer.location.district}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ background: '#f8f9fa', padding: '0.85rem', borderRadius: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#e65100', fontSize: '0.8rem', fontWeight: '600' }}>
                <Thermometer size={16} />
                <span>{language === 'kn' ? 'ಗರಿಷ್ಠ / ಕನಿಷ್ಠ ಉಷ್ಣಾಂಶ' : 'Day Max / Night Min'}</span>
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: '700', color: '#212529', marginTop: '0.25rem' }}>
                {irrigationRec.weather.tempMax}°C / {irrigationRec.weather.tempMin}°C
              </div>
            </div>

            <div style={{ background: '#f8f9fa', padding: '0.85rem', borderRadius: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0284c7', fontSize: '0.8rem', fontWeight: '600' }}>
                <Droplets size={16} />
                <span>{language === 'kn' ? 'ಗಾಳಿಯ ತೇವಾಂಶ (RH)' : 'Relative Humidity'}</span>
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: '700', color: '#212529', marginTop: '0.25rem' }}>
                {irrigationRec.weather.humidity}%
              </div>
            </div>

            <div style={{ background: '#f8f9fa', padding: '0.85rem', borderRadius: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#059669', fontSize: '0.8rem', fontWeight: '600' }}>
                <Wind size={16} />
                <span>{language === 'kn' ? 'ದೈನಂದಿನ ಆವಿಯಾಗುವಿಕೆ (ET0)' : 'Reference ET0'}</span>
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: '700', color: '#212529', marginTop: '0.25rem' }}>
                {irrigationRec.weather.et0} mm/day
              </div>
            </div>

            <div style={{ background: '#f8f9fa', padding: '0.85rem', borderRadius: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#6366f1', fontSize: '0.8rem', fontWeight: '600' }}>
                <CloudRain size={16} />
                <span>{language === 'kn' ? 'ಮಳೆ ಮುನ್ಸೂಚನೆ (Rain)' : 'Forecast Rain'}</span>
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: '700', color: '#212529', marginTop: '0.25rem' }}>
                {irrigationRec.weather.forecastRainMm} mm
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.82rem', color: '#495057', background: '#e8f5e9', padding: '0.65rem 0.85rem', borderRadius: '8px', borderLeft: '3px solid #2e7d32' }}>
            ✓ {language === 'kn' 
              ? 'ಹವಾಮಾನ ಸ್ಥಿತಿ: ಸದ್ಯಕ್ಕೆ ಮಳೆಯಿಲ್ಲ, ಹನಿ ನೀರಾವರಿ ಮತ್ತು ಎಲೆ ಸಿಂಪಡಣೆಗೆ ಅನುಕೂಲಕರ ವಾತಾವರಣವಿದೆ.'
              : 'Weather condition: Favorable dry spell for precision fertigation and morning foliar sprays.'}
          </div>
        </div>

        {/* Card B: Soil Health & Chemical Deficit Matrix Glance */}
        <div style={{
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e9ecef',
          padding: '1.5rem',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#212529' }}>
              {t.soilScorecardTitle}
            </h3>
            <span style={{
              background: '#e8f5e9',
              color: '#2e7d32',
              fontWeight: '700',
              padding: '0.25rem 0.65rem',
              borderRadius: '50px',
              fontSize: '0.85rem'
            }}>
              {t.overallScore}: {soilAnalysis.overallHealthScore}/100
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ border: '1px solid #f1f3f5', borderRadius: '8px', padding: '0.65rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#6c757d' }}>{language === 'kn' ? 'ಮಣ್ಣಿನ ರಿಯಾಕ್ಷನ್ (pH)' : 'Soil Reaction (pH)'}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '700', color: phVal > 7.5 ? '#b45309' : '#1b4332' }}>
                {phVal} <span style={{ fontSize: '0.75rem', fontWeight: 'normal' }}>({phVal > 7.5 ? (language === 'kn' ? 'ಕ್ಷಾರೀಯ' : 'Alkaline') : 'Optimal'})</span>
              </div>
            </div>

            <div style={{ border: '1px solid #f1f3f5', borderRadius: '8px', padding: '0.65rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#6c757d' }}>{language === 'kn' ? 'ಲಭ್ಯ ಸಾರಜನಕ (N)' : 'Available N'}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '700', color: nVal < 280 ? '#dc2626' : '#1b4332' }}>
                {nVal} kg/ha <span style={{ fontSize: '0.75rem', fontWeight: 'normal' }}>({nVal < 280 ? (language === 'kn' ? 'ಕೊರತೆ' : 'Deficient') : 'Normal'})</span>
              </div>
            </div>

            <div style={{ border: '1px solid #f1f3f5', borderRadius: '8px', padding: '0.65rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#6c757d' }}>{language === 'kn' ? 'ಸಾವಯವ ಇಂಗಾಲ (OC)' : 'Organic Carbon'}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '700', color: ocVal < 0.5 ? '#dc2626' : '#1b4332' }}>
                {ocVal}% <span style={{ fontSize: '0.75rem', fontWeight: 'normal' }}>({ocVal < 0.5 ? (language === 'kn' ? 'ಕಡಿಮೆ' : 'Low') : 'Normal'})</span>
              </div>
            </div>

            <div style={{ border: '1px solid #f1f3f5', borderRadius: '8px', padding: '0.65rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#6c757d' }}>{language === 'kn' ? 'ಸೂಕ್ಷ್ಮ ಪೋಷಕಾಂಶ ಸತು (Zn)' : 'Zinc (Zn)'}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '700', color: znVal < 0.6 ? '#dc2626' : '#1b4332' }}>
                {znVal} ppm <span style={{ fontSize: '0.75rem', fontWeight: 'normal' }}>({znVal < 0.6 ? (language === 'kn' ? 'ಕೊರತೆ' : 'Deficient') : 'Sufficient'})</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#6c757d' }}>
              {soilAnalysis.deficiencies.length} {language === 'kn' ? 'ಪೋಷಕಾಂಶಗಳ ಕೊರತೆ ಪತ್ತೆಯಾಗಿದೆ' : 'deficiencies identified'}
            </span>
            <button
              type="button"
              onClick={() => onNavigateTab('soil')}
              style={{
                background: 'none',
                border: 'none',
                color: '#2d6a4f',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              <span>{language === 'kn' ? 'ಸಂಪೂರ್ಣ ಮಣ್ಣು ಮ್ಯಾಟ್ರಿಕ್ಸ್' : 'View 12-Param Matrix'}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

      </div>

      {/* 5. Recent Crop Diagnoses History Section */}
      <div style={{
        background: '#ffffff',
        borderRadius: '14px',
        border: '1px solid #e9ecef',
        padding: '1.5rem',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Camera size={20} color="#2d6a4f" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#212529' }}>
              {t.recentDiagnosisTitle}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('crop')}
            style={{
              background: '#2d6a4f',
              color: '#ffffff',
              border: 'none',
              padding: '0.45rem 0.85rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <Sparkles size={14} />
            <span>{language === 'kn' ? '+ ಹೊಸ ಪರೀಕ್ಷೆ' : '+ New Crop Check'}</span>
          </button>
        </div>

        {diagnoses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#6c757d' }}>
            <p style={{ margin: '0 0 0.85rem 0', fontSize: '0.95rem' }}>{t.noDiagnosisYet}</p>
            <button
              type="button"
              onClick={() => onNavigateTab('crop')}
              style={{
                background: '#f1f8f5',
                border: '1px dashed #2d6a4f',
                color: '#1b4332',
                padding: '0.65rem 1.25rem',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {language === 'kn' ? 'ಟೊಮೆಟೊ ಅಥವಾ ಮೆಕ್ಕೆಜೋಳ ಪರೀಕ್ಷೆ ಪ್ರಾರಂಭಿಸಿ' : 'Test with Tomato or Maize Demonstration'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {diagnoses.map((d) => (
              <div 
                key={d.id}
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  alignItems: 'center',
                  padding: '1rem',
                  background: '#f8f9fa',
                  borderRadius: '10px',
                  border: '1px solid #e9ecef'
                }}
              >
                {d.imageUrl && (
                  <img 
                    src={d.imageUrl} 
                    alt={d.cropName} 
                    style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px' }}
                  />
                )}
                <div style={{ flex: '1 1 250px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <strong style={{ color: '#1b4332', fontSize: '0.95rem' }}>
                      {language === 'kn' ? d.cropNameKn : language === 'hi' ? d.cropNameHi : d.cropName}
                    </strong>
                    <span style={{ fontSize: '0.75rem', background: '#d8f3dc', color: '#1b4332', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                      {d.growthStage}
                    </span>
                  </div>
                  <p style={{ margin: '0.25rem 0 0.25rem 0', color: '#495057', fontSize: '0.85rem' }}>
                    {language === 'kn' ? d.soilCorrelationKn : language === 'hi' ? d.soilCorrelationHi : d.soilCorrelation}
                  </p>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                  {new Date(d.timestamp).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
