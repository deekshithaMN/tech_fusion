import React, { useState } from 'react';
import { 
  ShieldCheck, 
  RefreshCw, 
  Package, 
  Calendar, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Upload, 
  FileText, 
  Check, 
  Info,
  Sparkles,
  X
} from 'lucide-react';
import { 
  SoilReport, 
  SoilAnalysisSummary, 
  FertilizerRecommendation, 
  SoilParametersMap, 
  Language, 
  CropProfile 
} from '../types';
import { I18N } from '../data/i18n';
import { PARAM_DEFINITIONS } from '../data/standardsData';
import { SAMPLES } from '../data/sampleReports';

interface TabSoilProps {
  soilReport: SoilReport;
  soilAnalysis: SoilAnalysisSummary;
  nutrientRec: FertilizerRecommendation;
  cropProfile: CropProfile;
  language: Language;
  onUpdateSoilReport: (updatedReport: SoilReport) => void;
  showUpdateModal: boolean;
  onCloseUpdateModal: () => void;
  onOpenUpdateModal: () => void;
}

export const TabSoil: React.FC<TabSoilProps> = ({
  soilReport,
  soilAnalysis,
  nutrientRec,
  cropProfile,
  language,
  onUpdateSoilReport,
  showUpdateModal,
  onCloseUpdateModal,
  onOpenUpdateModal
}) => {
  const t = I18N[language];
  const [selectedSampleId, setSelectedSampleId] = useState<string>(soilReport.id);
  const [customParams, setCustomParams] = useState<SoilParametersMap>(soilReport.parameters);

  const commercialFertilizers = nutrientRec?.commercialFertilizers || [];
  const applicationSchedule = nutrientRec?.applicationSchedule || [];
  const amendments = nutrientRec?.amendments || [];
  const deficiencies = soilAnalysis?.deficiencies || [];

  // Handle switching sample
  const handleSelectSample = (sampleId: string) => {
    setSelectedSampleId(sampleId);
    const found = SAMPLES.find(s => s.id === sampleId);
    if (found) {
      setCustomParams(found.parameters);
    }
  };

  // Handle saving modal changes
  const handleSaveReportUpdate = () => {
    const selectedSample = SAMPLES.find(s => s.id === selectedSampleId);
    const updated: SoilReport = {
      ...(selectedSample || soilReport),
      id: selectedSample?.id || soilReport.id,
      title: selectedSample?.title || soilReport.title,
      parameters: customParams,
      verificationStatus: 'FARMER_VERIFIED',
      isActive: true
    };
    onUpdateSoilReport(updated);
    onCloseUpdateModal();
  };

  return (
    <div className="tab-soil-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* 1. Active Soil Card Header */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #d8f3dc',
        borderTop: '6px solid #2d6a4f',
        padding: '1.5rem',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1b4332' }}>
                {soilReport.title || t.activeSoilLinked}
              </span>
              <span style={{
                background: '#d8f3dc',
                color: '#2d6a4f',
                fontSize: '0.75rem',
                fontWeight: '700',
                padding: '0.2rem 0.6rem',
                borderRadius: '50px'
              }}>
                ✓ {t.verifiedBadge}
              </span>
            </div>
            <p style={{ margin: 0, color: '#495057', fontSize: '0.9rem' }}>
              <strong>{language === 'kn' ? 'ಪ್ರಯೋಗಾಲಯ' : 'Laboratory'}:</strong> {soilReport.laboratoryName} • 
              <strong> {language === 'kn' ? 'ದಿನಾಂಕ' : 'Date'}:</strong> {soilReport.reportDate} • 
              <strong> {language === 'kn' ? 'ಸರ್ವೆ ಸಂಖ್ಯೆ' : 'Survey #'}:</strong> {soilReport.surveyNumber || 'SN-44/2'} • 
              <strong> {language === 'kn' ? 'ಸ್ಥಳ' : 'District'}:</strong> {soilReport.district}
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenUpdateModal}
            style={{
              background: '#2d6a4f',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '0.65rem 1.25rem',
              fontWeight: '700',
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 2px 6px rgba(45, 106, 79, 0.25)'
            }}
          >
            <RefreshCw size={16} />
            <span>{t.btnChangeReport}</span>
          </button>
        </div>

        <div style={{
          marginTop: '1.25rem',
          background: '#f1f8f5',
          borderRadius: '10px',
          padding: '0.85rem 1rem',
          fontSize: '0.85rem',
          color: '#1b4332',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem'
        }}>
          <Info size={18} color="#2d6a4f" style={{ flexShrink: 0 }} />
          <span>{t.persistentSoilNote}</span>
        </div>
      </div>

      {/* 2. Twelve Soil Parameters Matrix */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e9ecef',
        padding: '1.5rem',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#1b4332' }}>
              {t.verificationTitle}
            </h3>
            <p style={{ margin: '0.25rem 0 0 0', color: '#6c757d', fontSize: '0.85rem' }}>
              {language === 'kn' 
                ? 'ICAR ಮತ್ತು ಕರ್ನಾಟಕ ಕೃಷಿ ಇಲಾಖೆಯ ಮಾನದಂಡಗಳ ಪ್ರಕಾರ 12 ನಿಯತಾಂಕಗಳ ಸ್ಥಿತಿ' 
                : '12-Parameter soil chemistry evaluated against ICAR & Karnataka University standards'}
            </p>
          </div>
          <span style={{
            background: '#e8f5e9',
            color: '#2e7d32',
            fontWeight: '700',
            padding: '0.35rem 0.75rem',
            borderRadius: '50px',
            fontSize: '0.85rem'
          }}>
            {t.overallScore}: {soilAnalysis.overallHealthScore}/100
          </span>
        </div>

        {/* Responsive Table / Card Grid for 12 Parameters */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e9ecef', color: '#495057' }}>
                <th style={{ padding: '0.75rem' }}>{t.paramHeader}</th>
                <th style={{ padding: '0.75rem' }}>{t.valueHeader}</th>
                <th style={{ padding: '0.75rem' }}>{t.unitHeader}</th>
                <th style={{ padding: '0.75rem' }}>{language === 'kn' ? 'ಸ್ಥಿತಿ' : 'Status'}</th>
                <th style={{ padding: '0.75rem' }}>{t.methodHeader}</th>
                <th style={{ padding: '0.75rem' }}>{language === 'kn' ? 'ಪಾತ್ರ / ಶಿಫಾರಸು' : 'Agronomic Role'}</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(PARAM_DEFINITIONS).map(([key, def]) => {
                const paramObj = soilReport.parameters?.[key] || soilReport.parameters?.[def.symbol];
                const val = paramObj?.value;
                const interpretation = val !== null && val !== undefined ? def.interpret(val) : null;
                const isDeficient = interpretation?.severity === 'warning' || interpretation?.severity === 'danger';

                const statusText = language === 'kn' 
                  ? interpretation?.statusKn 
                  : language === 'hi' 
                  ? interpretation?.statusHi 
                  : interpretation?.status;

                const roleText = language === 'kn' ? def.roleKn : language === 'hi' ? def.roleHi : def.role;

                return (
                  <tr 
                    key={key} 
                    style={{ 
                      borderBottom: '1px solid #f1f3f5',
                      background: isDeficient ? '#fffdfa' : '#ffffff'
                    }}
                  >
                    <td style={{ padding: '0.75rem', fontWeight: '700', color: '#212529' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{
                          background: '#f1f8f5',
                          color: '#2d6a4f',
                          padding: '0.2rem 0.45rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: '800'
                        }}>
                          {def.symbol}
                        </span>
                        <span>{language === 'kn' ? def.kannadaName : language === 'hi' ? def.hindiName : def.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem', fontWeight: '800', color: isDeficient ? '#dc2626' : '#1b4332', fontSize: '1rem' }}>
                      {val !== null && val !== undefined ? val : '—'}
                    </td>
                    <td style={{ padding: '0.75rem', color: '#6c757d' }}>{def.unit}</td>
                    <td style={{ padding: '0.75rem' }}>
                      {statusText ? (
                        <span style={{
                          display: 'inline-block',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '50px',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          background: isDeficient ? '#fee2e2' : '#dcfce7',
                          color: isDeficient ? '#991b1b' : '#166534'
                        }}>
                          {isDeficient ? '⚠️ ' : '✓ '} {statusText}
                        </span>
                      ) : (
                        <span style={{ color: '#adb5bd' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem', color: '#6c757d', fontSize: '0.8rem' }}>
                      {def.testMethod}
                    </td>
                    <td style={{ padding: '0.75rem', color: '#495057', fontSize: '0.82rem', maxWidth: '280px' }}>
                      {roleText}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. STCR Commercial Fertilizer Bags Checklist */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e9ecef',
        padding: '1.5rem',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
          <Package className="sec-icon" size={24} color="#d97706" />
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#1b4332' }}>
              {t.commercialFertilizers}
            </h3>
            <p style={{ margin: '0.2rem 0 0 0', color: '#6c757d', fontSize: '0.85rem' }}>
              {language === 'kn' 
                ? `ನಿಮ್ಮ ${cropProfile.farmArea} ${cropProfile.areaUnit} ಜಮೀನಿಗೆ ಬೇಕಾಗುವ ಒಟ್ಟು ರಸಗೊಬ್ಬರ ಚೀಲಗಳ ಲೆಕ್ಕ (STCR ಸೂತ್ರ)` 
                : `Calculated commercial bags required for ${cropProfile.farmArea} ${cropProfile.areaUnit} under STCR methodology`}
            </p>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          {commercialFertilizers.map((fert, idx) => (
            <div 
              key={idx}
              style={{
                background: '#fefce8',
                border: '1px solid #fef08a',
                borderRadius: '12px',
                padding: '1.25rem',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h4 style={{ margin: '0 0 0.4rem 0', color: '#854d0e', fontSize: '1.1rem', fontWeight: '800' }}>
                  {language === 'kn' ? fert.kannadaName : language === 'hi' ? fert.hindiName : fert.name}
                </h4>
                <span style={{
                  background: '#fef08a',
                  color: '#713f12',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '6px',
                  fontWeight: '800',
                  fontSize: '0.85rem'
                }}>
                  {fert.bagCountText}
                </span>
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#713f12', margin: '0.5rem 0' }}>
                {fert.totalKg} <span style={{ fontSize: '0.9rem', fontWeight: 'normal' }}>kg total</span>
              </div>
              <p style={{ margin: 0, color: '#a16207', fontSize: '0.82rem' }}>
                {language === 'kn' ? fert.nutrientSuppliedKn : language === 'hi' ? fert.nutrientSuppliedHi : fert.nutrientSupplied}
              </p>
            </div>
          ))}
        </div>

        {/* Split Application Schedule */}
        <div style={{ marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
            <Calendar size={18} color="#2d6a4f" />
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#1b4332' }}>
              {t.applicationTimeline}
            </h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {applicationSchedule.map((sched, idx) => (
              <div 
                key={idx}
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#f8f9fa',
                  border: '1px solid #e9ecef',
                  borderRadius: '10px',
                  padding: '0.85rem 1.15rem',
                  gap: '0.5rem'
                }}
              >
                <div>
                  <strong style={{ color: '#1b4332', fontSize: '0.95rem' }}>
                    {language === 'kn' ? sched.stageNameKn : language === 'hi' ? sched.stageNameHi : sched.stageName}
                  </strong>
                  <p style={{ margin: '0.2rem 0 0 0', color: '#6c757d', fontSize: '0.82rem' }}>
                    {language === 'kn' ? sched.instructionsKn : language === 'hi' ? sched.instructionsHi : sched.instructions}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {sched.ureaKg > 0 && (
                    <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.78rem', fontWeight: '700' }}>
                      Urea: {sched.ureaKg} kg
                    </span>
                  )}
                  {sched.dapKg > 0 && (
                    <span style={{ background: '#fef3c7', color: '#92400e', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.78rem', fontWeight: '700' }}>
                      DAP: {sched.dapKg} kg
                    </span>
                  )}
                  {sched.potashKg > 0 && (
                    <span style={{ background: '#fce7f3', color: '#9d174d', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.78rem', fontWeight: '700' }}>
                      {sched.potashName || 'MOP'}: {sched.potashKg} kg
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Soil Amendments */}
        {amendments.length > 0 && (
          <div style={{ marginTop: '1.5rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '1.25rem' }}>
            <h4 style={{ margin: '0 0 0.6rem 0', color: '#166534', fontSize: '1rem', fontWeight: '700' }}>
              {t.amendmentsTitle}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {amendments.map((am, idx) => (
                <div key={idx} style={{ fontSize: '0.85rem', color: '#14532d' }}>
                  • <strong>{language === 'kn' ? am.itemKn : language === 'hi' ? am.itemHi : am.item} ({am.bags}):</strong> {language === 'kn' ? am.reasonKn : language === 'hi' ? am.reasonHi : am.reason} ({am.timing})
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. Modal: Update Soil Test Report */}
      {showUpdateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            maxWidth: '680px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '1.75rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)',
            position: 'relative'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '800', color: '#1b4332' }}>
                  {t.updateReportModalTitle}
                </h3>
                <p style={{ margin: '0.2rem 0 0 0', color: '#6c757d', fontSize: '0.85rem' }}>
                  {language === 'kn' ? 'ನೈಜ ಮಾದರಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ ಅಥವಾ ಹೊಸ ವರದಿ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ' : 'Select an authentic Karnataka/Lab sample report or upload a new one'}
                </p>
              </div>
              <button 
                type="button"
                onClick={onCloseUpdateModal}
                style={{ background: 'none', border: 'none', color: '#6c757d', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Sample Selector Cards */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.88rem', fontWeight: '700', color: '#212529', display: 'block', marginBottom: '0.5rem' }}>
                {t.instantSamples}
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {SAMPLES.map((s) => {
                  const isSel = s.id === selectedSampleId;
                  return (
                    <div 
                      key={s.id}
                      onClick={() => handleSelectSample(s.id)}
                      style={{
                        border: isSel ? '2px solid #2d6a4f' : '1px solid #e9ecef',
                        background: isSel ? '#f1f8f5' : '#ffffff',
                        borderRadius: '10px',
                        padding: '0.85rem 1rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ color: isSel ? '#1b4332' : '#212529', fontSize: '0.95rem' }}>
                          {language === 'kn' ? s.titleKn || s.title : language === 'hi' ? s.titleHi || s.title : s.title}
                        </strong>
                        {isSel && <Check size={18} color="#2d6a4f" />}
                      </div>
                      <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#6c757d' }}>
                        {s.laboratoryName} • {s.district} • pH {s.parameters.ph?.value || s.parameters.pH?.value} • N {s.parameters.nitrogen?.value || s.parameters.N?.value} kg/ha
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={onCloseUpdateModal}
                style={{
                  background: '#f8f9fa',
                  border: '1px solid #ced4da',
                  color: '#495057',
                  padding: '0.65rem 1.25rem',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {t.closeModal}
              </button>
              <button
                type="button"
                onClick={handleSaveReportUpdate}
                style={{
                  background: '#2d6a4f',
                  border: 'none',
                  color: '#ffffff',
                  padding: '0.65rem 1.5rem',
                  borderRadius: '8px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                {t.verifyAndProceed}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
