import React, { useState } from 'react';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  HelpCircle, 
  ShieldCheck, 
  Layers, 
  ArrowRight,
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';
import { 
  CropDiagnosis, 
  SoilReport, 
  CropProfile, 
  Language 
} from '../types';
import { I18N } from '../data/i18n';
import { CROPS } from '../data/cropsData';
import { DEMO_CROP_CASES, PreloadedDemonstrationCase } from '../services/cropVisionEngine';
import { diagnoseCropApi } from '../services/api';

interface TabAnalyseCropProps {
  soilReport: SoilReport;
  cropProfile: CropProfile;
  language: Language;
  onSaveDiagnosis: (diagnosis: CropDiagnosis) => void;
  activeDiagnosis: CropDiagnosis | null;
  setActiveDiagnosis: (diag: CropDiagnosis | null) => void;
}

export const TabAnalyseCrop: React.FC<TabAnalyseCropProps> = ({
  soilReport,
  cropProfile,
  language,
  onSaveDiagnosis,
  activeDiagnosis,
  setActiveDiagnosis
}) => {
  const t = I18N[language];

  const [selectedCropId, setSelectedCropId] = useState<string>(cropProfile.cropId || 'tomato');
  const [selectedStage, setSelectedStage] = useState<string>(cropProfile.growthStage || 'fruiting');
  const [problemNotes, setProblemNotes] = useState<string>('');
  const [previewImage, setPreviewImage] = useState<string>(DEMO_CROP_CASES[0].imageUrl);
  const [isDiagnosing, setIsDiagnosing] = useState<boolean>(false);
  const [activeDemoId, setActiveDemoId] = useState<string>(DEMO_CROP_CASES[0].id);

  // Load a preloaded demo case
  const handleSelectDemo = (demo: PreloadedDemonstrationCase) => {
    setActiveDemoId(demo.id);
    setSelectedCropId(demo.cropId);
    setSelectedStage(demo.growthStage);
    setProblemNotes(demo.problemDescription);
    setPreviewImage(demo.imageUrl);
    setActiveDiagnosis(null);
  };

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setPreviewImage(reader.result);
          setActiveDemoId('');
          setActiveDiagnosis(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Run Diagnosis
  const handleRunDiagnosis = async () => {
    setIsDiagnosing(true);
    try {
      const result = await diagnoseCropApi({
        cropId: selectedCropId,
        growthStage: selectedStage,
        problemDescription: problemNotes,
        imageUrl: previewImage,
        soilParameters: soilReport.parameters
      });
      setActiveDiagnosis(result);
      onSaveDiagnosis(result);
    } catch (err) {
      console.error('Diagnosis error:', err);
    } finally {
      setIsDiagnosing(false);
    }
  };

  return (
    <div className="tab-crop-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
        color: '#ffffff',
        borderRadius: '16px',
        padding: '1.75rem',
        boxShadow: '0 10px 25px -5px rgba(27, 67, 50, 0.25)'
      }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.15)', padding: '0.35rem 0.85rem', borderRadius: '50px', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
          <Sparkles size={16} />
          <span>Multimodal Vision & Soil Chemistry Correlation</span>
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', margin: '0 0 0.4rem 0' }}>
          {t.cropVisionTitle}
        </h2>
        <p style={{ margin: 0, opacity: 0.9, fontSize: '0.95rem', maxWidth: '750px', lineHeight: 1.5 }}>
          {t.cropVisionSubtitle}
        </p>
      </div>

      {/* Demo Cases Selector Bar */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e9ecef',
        borderRadius: '14px',
        padding: '1.25rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <ImageIcon size={18} color="#2d6a4f" />
          <strong style={{ fontSize: '0.9rem', color: '#1b4332' }}>
            {t.tryDemoCases}
          </strong>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          {DEMO_CROP_CASES.map((demo) => {
            const isSelected = activeDemoId === demo.id;
            const title = language === 'kn' ? demo.titleKn : language === 'hi' ? demo.titleHi : demo.title;
            return (
              <button
                key={demo.id}
                type="button"
                onClick={() => handleSelectDemo(demo)}
                style={{
                  background: isSelected ? '#d8f3dc' : '#f8f9fa',
                  border: isSelected ? '2px solid #2d6a4f' : '1px solid #ced4da',
                  color: isSelected ? '#1b4332' : '#495057',
                  borderRadius: '10px',
                  padding: '0.55rem 0.95rem',
                  fontSize: '0.85rem',
                  fontWeight: isSelected ? '700' : '600',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Input Grid: Photo Upload & Crop Context */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.25rem'
      }}>
        {/* Left: Image Upload & Preview Box */}
        <div style={{
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e9ecef',
          padding: '1.5rem',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: '700', color: '#1b4332' }}>
            {t.uploadPhotoOrSnap}
          </h3>

          <div style={{
            flex: 1,
            position: 'relative',
            minHeight: '240px',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '2px dashed #b7e4c7',
            background: '#f8f9fa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem'
          }}>
            {previewImage ? (
              <img 
                src={previewImage} 
                alt="Crop preview" 
                style={{ width: '100%', height: '100%', maxHeight: '280px', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ textAlign: 'center', color: '#6c757d', padding: '1rem' }}>
                <Camera size={42} color="#a3b18a" style={{ marginBottom: '0.5rem' }} />
                <p style={{ margin: 0, fontSize: '0.85rem' }}>{t.dropCropPhoto}</p>
              </div>
            )}
          </div>

          <label style={{
            background: '#f1f8f5',
            border: '1px solid #b7e4c7',
            color: '#1b4332',
            padding: '0.65rem 1rem',
            borderRadius: '8px',
            fontWeight: '700',
            fontSize: '0.85rem',
            textAlign: 'center',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}>
            <Upload size={16} />
            <span>{language === 'kn' ? 'ಸಾಧನದಿಂದ ಫೋಟೋ ಆಯ್ಕೆಮಾಡಿ' : 'Browse Local Image or Snap'}</span>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        {/* Right: Crop Details & Observation Notes */}
        <div style={{
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e9ecef',
          padding: '1.5rem',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#495057', marginBottom: '0.4rem' }}>
              {t.selectCropLabel}
            </label>
            <select
              value={selectedCropId}
              onChange={(e) => setSelectedCropId(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem',
                borderRadius: '8px',
                border: '1px solid #ced4da',
                fontSize: '0.9rem',
                background: '#ffffff'
              }}
            >
              {CROPS.map((c) => (
                <option key={c.id} value={c.id}>
                  {language === 'kn' ? c.kannadaName : language === 'hi' ? c.hindiName : c.name} ({c.category})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#495057', marginBottom: '0.4rem' }}>
              {t.stageLabel}
            </label>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem',
                borderRadius: '8px',
                border: '1px solid #ced4da',
                fontSize: '0.9rem',
                background: '#ffffff'
              }}
            >
              <option value="nursery">Nursery / Emergence</option>
              <option value="vegetative">Active Vegetative Growth</option>
              <option value="flowering">Flowering / Heading</option>
              <option value="fruiting">Fruit Sizing / Grain Filling</option>
              <option value="maturity">Ripening / Harvest</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#495057', marginBottom: '0.4rem' }}>
              {t.optionalNotes}
            </label>
            <textarea
              rows={3}
              value={problemNotes}
              onChange={(e) => setProblemNotes(e.target.value)}
              placeholder={t.optionalNotesPlaceholder}
              style={{
                width: '100%',
                padding: '0.65rem',
                borderRadius: '8px',
                border: '1px solid #ced4da',
                fontSize: '0.88rem',
                boxSizing: 'border-box',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
            <button
              type="button"
              disabled={isDiagnosing}
              onClick={handleRunDiagnosis}
              style={{
                width: '100%',
                background: '#2d6a4f',
                color: '#ffffff',
                border: 'none',
                padding: '0.85rem 1.25rem',
                borderRadius: '10px',
                fontWeight: '800',
                fontSize: '0.95rem',
                cursor: isDiagnosing ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                boxShadow: '0 4px 12px rgba(45, 106, 79, 0.3)'
              }}
            >
              {isDiagnosing ? (
                <>
                  <RefreshCw className="animate-spin" size={18} />
                  <span>{language === 'kn' ? 'ಎಐ ವಿಶ್ಲೇಷಣೆ ನಡೆಯುತ್ತಿದೆ...' : 'Analysing Crop & Cross-Referencing Soil...'}</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>{t.btnRunDiagnosis}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Grounded Diagnosis Result Section */}
      {activeDiagnosis && (
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #b7e4c7',
          padding: '1.75rem',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.06)'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div>
              <span style={{
                background: '#e8f5e9',
                color: '#2e7d32',
                fontSize: '0.78rem',
                fontWeight: '800',
                padding: '0.25rem 0.65rem',
                borderRadius: '50px',
                display: 'inline-block',
                marginBottom: '0.4rem'
              }}>
                ✓ Confidence Score: {activeDiagnosis.confidenceScore}%
              </span>
              <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800', color: '#1b4332' }}>
                {language === 'kn' ? activeDiagnosis.cropNameKn : language === 'hi' ? activeDiagnosis.cropNameHi : activeDiagnosis.cropName}
              </h3>
            </div>
            <span style={{ fontSize: '0.8rem', color: '#6c757d' }}>
              {new Date(activeDiagnosis.timestamp).toLocaleString()}
            </span>
          </div>

          {/* CRITICAL FEATURE: Soil Chemistry Correlation Card */}
          <div style={{
            background: '#fefce8',
            border: '2px solid #facc15',
            borderRadius: '12px',
            padding: '1.25rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <ShieldCheck size={22} color="#854d0e" />
              <strong style={{ color: '#854d0e', fontSize: '1.05rem' }}>
                {t.soilCorrelationTitle}
              </strong>
            </div>
            <p style={{ margin: 0, color: '#713f12', fontSize: '0.92rem', lineHeight: 1.55 }}>
              {language === 'kn' 
                ? activeDiagnosis.soilCorrelationKn 
                : language === 'hi' 
                ? activeDiagnosis.soilCorrelationHi 
                : activeDiagnosis.soilCorrelation}
            </p>
          </div>

          {/* Split Symptoms & Causes */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
            {/* Symptoms */}
            <div style={{ background: '#f8f9fa', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e9ecef' }}>
              <h4 style={{ margin: '0 0 0.75rem 0', color: '#1b4332', fontSize: '1rem', fontWeight: '700' }}>
                {t.observedSymptomsTitle}
              </h4>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#495057', fontSize: '0.88rem', lineHeight: 1.5 }}>
                {(language === 'kn' ? activeDiagnosis.symptomsKn : language === 'hi' ? activeDiagnosis.symptomsHi : activeDiagnosis.symptoms).map((s, idx) => (
                  <li key={idx} style={{ marginBottom: '0.4rem' }}>{s}</li>
                ))}
              </ul>
            </div>

            {/* Possible Causes */}
            <div style={{ background: '#f8f9fa', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e9ecef' }}>
              <h4 style={{ margin: '0 0 0.75rem 0', color: '#1b4332', fontSize: '1rem', fontWeight: '700' }}>
                {t.possibleCausesTitle}
              </h4>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#495057', fontSize: '0.88rem', lineHeight: 1.5 }}>
                {(language === 'kn' ? activeDiagnosis.possibleCausesKn : language === 'hi' ? activeDiagnosis.possibleCausesHi : activeDiagnosis.possibleCauses).map((c, idx) => (
                  <li key={idx} style={{ marginBottom: '0.4rem' }}>{c}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Actionable Remedy Banner */}
          <div style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: '12px',
            padding: '1.25rem',
            marginBottom: '1.25rem'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#065f46', fontSize: '1rem', fontWeight: '800' }}>
              {t.actionableRemedyTitle}
            </h4>
            <p style={{ margin: 0, color: '#047857', fontSize: '0.92rem', lineHeight: 1.55 }}>
              {language === 'kn' 
                ? activeDiagnosis.actionableRemedyKn 
                : language === 'hi' 
                ? activeDiagnosis.actionableRemedyHi 
                : activeDiagnosis.actionableRemedy}
            </p>
          </div>

          {/* AI Uncertainty Notice */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.6rem',
            background: '#f8f9fa',
            borderRadius: '8px',
            padding: '0.85rem',
            fontSize: '0.8rem',
            color: '#6c757d'
          }}>
            <Info size={18} color="#6c757d" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{activeDiagnosis.uncertaintyWarning}</span>
          </div>
        </div>
      )}

    </div>
  );
};
