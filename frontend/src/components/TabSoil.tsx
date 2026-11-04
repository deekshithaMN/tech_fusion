import React, { useState, useRef, useCallback } from 'react';
import {
  ShieldCheck,
  RefreshCw,
  Package,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Upload,
  FileText,
  Check,
  Info,
  X,
  Sparkles,
  Layers,
  Droplets,
  Loader2,
  AlertCircle,
  FileSearch,
} from 'lucide-react';
import {
  SoilReport,
  SoilAnalysisSummary,
  FertilizerRecommendation,
  SoilParametersMap,
  Language,
  CropProfile,
  PdfUploadState,
} from '../types';
import { I18N } from '../data/i18n';
import { PARAM_DEFINITIONS } from '../data/standardsData';
import { SAMPLES } from '../data/sampleReports';
import { uploadReportApi } from '../services/api';

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
  onOpenUpdateModal,
}) => {
  const t = I18N[language];
  const [selectedSampleId, setSelectedSampleId] = useState<string>(soilReport.id);
  const [customParams, setCustomParams] = useState<SoilParametersMap>(soilReport.parameters);

  // PDF upload state
  const [uploadState, setUploadState] = useState<PdfUploadState>({ status: 'idle', progress: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [pendingReport, setPendingReport] = useState<SoilReport | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const commercialFertilizers = nutrientRec?.commercialFertilizers || [];
  const applicationSchedule = nutrientRec?.applicationSchedule || [];
  const amendments = nutrientRec?.amendments || [];

  const handleSelectSample = (sampleId: string) => {
    setSelectedSampleId(sampleId);
    setPendingReport(null);
    setUploadState({ status: 'idle', progress: 0 });
    const found = SAMPLES.find((s) => s.id === sampleId);
    if (found) setCustomParams(found.parameters);
  };

  const handleSaveReportUpdate = () => {
    if (pendingReport) {
      onUpdateSoilReport(pendingReport);
    } else {
      const selectedSample = SAMPLES.find((s) => s.id === selectedSampleId);
      const updated: SoilReport = {
        ...(selectedSample || soilReport),
        id: selectedSample?.id || soilReport.id,
        title: selectedSample?.title || soilReport.title,
        parameters: customParams,
        verificationStatus: 'FARMER_VERIFIED',
        isActive: true,
      };
      onUpdateSoilReport(updated);
    }
    onCloseUpdateModal();
  };

  // ── PDF Upload Handler ───────────────────────────────────────────────────────
  const handlePdfFile = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf') &&
        !file.name.toLowerCase().endsWith('.jpg') &&
        !file.name.toLowerCase().endsWith('.jpeg') &&
        !file.name.toLowerCase().endsWith('.png')) {
      setUploadState({ status: 'error', progress: 0, errorMessage: 'Please upload a PDF or image file (JPG/PNG).' });
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setUploadState({ status: 'error', progress: 0, errorMessage: 'File too large. Maximum 15 MB allowed.' });
      return;
    }

    setSelectedSampleId('');
    setPendingReport(null);
    setUploadState({ status: 'reading', progress: 20 });

    // Simulate reading progress
    const timer1 = setTimeout(() => setUploadState(s => ({ ...s, status: 'analyzing', progress: 55 })), 600);
    const timer2 = setTimeout(() => setUploadState(s => ({ ...s, progress: 80 })), 1800);

    try {
      const report = await uploadReportApi(file);
      clearTimeout(timer1);
      clearTimeout(timer2);

      setUploadState({ status: 'done', progress: 100, reportPreview: report });
      setPendingReport(report);
      setCustomParams(report.parameters);
    } catch (err) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setUploadState({
        status: 'error',
        progress: 0,
        errorMessage: 'Upload failed. Please check your connection and try again.',
      });
    }
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handlePdfFile(file);
  };

  const confidencePct = Math.round((uploadState.reportPreview?.confidenceScore ?? 0) * 100);

  return (
    <div className="tab-soil-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* 1. Active Soil Card Header */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #d8f3dc',
        borderTop: '6px solid #2d6a4f',
        padding: '1.5rem',
        boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1b4332' }}>
                {soilReport.title || t.activeSoilLinked}
              </span>
              <span style={{
                background: '#d8f3dc', color: '#2d6a4f',
                fontSize: '0.75rem', fontWeight: '700',
                padding: '0.2rem 0.6rem', borderRadius: '50px',
              }}>
                ✓ {t.verifiedBadge}
              </span>
            </div>
            <p style={{ margin: 0, color: '#495057', fontSize: '0.9rem' }}>
              <strong>{language === 'kn' ? 'ಪ್ರಯೋಗಾಲಯ' : 'Laboratory'}:</strong> {soilReport.laboratoryName} •{' '}
              <strong>{language === 'kn' ? 'ದಿನಾಂಕ' : 'Date'}:</strong> {soilReport.reportDate} •{' '}
              <strong>{language === 'kn' ? 'ಸ್ಥಳ' : 'District'}:</strong> {soilReport.district}
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenUpdateModal}
            style={{
              background: '#2d6a4f', color: '#ffffff', border: 'none',
              borderRadius: '10px', padding: '0.65rem 1.25rem',
              fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              boxShadow: '0 2px 6px rgba(45,106,79,0.25)',
            }}
          >
            <RefreshCw size={16} />
            <span>{t.btnChangeReport}</span>
          </button>
        </div>
        <div style={{
          marginTop: '1.25rem', background: '#f1f8f5', borderRadius: '10px',
          padding: '0.85rem 1rem', fontSize: '0.85rem', color: '#1b4332',
          display: 'flex', alignItems: 'center', gap: '0.6rem',
        }}>
          <Info size={18} color="#2d6a4f" style={{ flexShrink: 0 }} />
          <span>{t.persistentSoilNote}</span>
        </div>
      </div>

      {/* 2. Twelve Soil Parameters Matrix */}
      <div style={{
        background: '#ffffff', borderRadius: '16px',
        border: '1px solid #e9ecef', padding: '1.5rem',
        boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
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
            background: '#e8f5e9', color: '#2e7d32', fontWeight: '700',
            padding: '0.35rem 0.75rem', borderRadius: '50px', fontSize: '0.85rem',
          }}>
            {t.overallScore}: {soilAnalysis.overallHealthScore}/100
          </span>
        </div>
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
                const statusText = language === 'kn' ? interpretation?.statusKn : language === 'hi' ? interpretation?.statusHi : interpretation?.status;
                const roleText = language === 'kn' ? def.roleKn : language === 'hi' ? def.roleHi : def.role;
                return (
                  <tr key={key} style={{ borderBottom: '1px solid #f1f3f5', background: isDeficient ? '#fffdfa' : '#ffffff' }}>
                    <td style={{ padding: '0.75rem', fontWeight: '700', color: '#212529' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ background: '#f1f8f5', color: '#2d6a4f', padding: '0.2rem 0.45rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '800' }}>{def.symbol}</span>
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
                          display: 'inline-block', padding: '0.2rem 0.55rem', borderRadius: '50px',
                          fontSize: '0.75rem', fontWeight: '700',
                          background: isDeficient ? '#fee2e2' : '#dcfce7',
                          color: isDeficient ? '#991b1b' : '#166534',
                        }}>
                          {isDeficient ? '⚠️ ' : '✓ '}{statusText}
                        </span>
                      ) : <span style={{ color: '#adb5bd' }}>—</span>}
                    </td>
                    <td style={{ padding: '0.75rem', color: '#6c757d', fontSize: '0.8rem' }}>{def.testMethod}</td>
                    <td style={{ padding: '0.75rem', color: '#495057', fontSize: '0.82rem', maxWidth: '280px' }}>{roleText}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. STCR Fertilizer Bags */}
      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e9ecef', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
          <Package className="sec-icon" size={24} color="#d97706" />
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#1b4332' }}>{t.commercialFertilizers}</h3>
            <p style={{ margin: '0.2rem 0 0 0', color: '#6c757d', fontSize: '0.85rem' }}>
              {language === 'kn'
                ? `ನಿಮ್ಮ ${cropProfile.farmArea} ${cropProfile.areaUnit} ಜಮೀನಿಗೆ ಬೇಕಾಗುವ ಒಟ್ಟು ರಸಗೊಬ್ಬರ ಚೀಲಗಳ ಲೆಕ್ಕ (STCR ಸೂತ್ರ)`
                : `Calculated commercial bags for ${cropProfile.farmArea} ${cropProfile.areaUnit} under STCR methodology`}
            </p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {commercialFertilizers.map((fert, idx) => (
            <div key={idx} style={{ background: '#fefce8', border: '1px solid #fef08a', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h4 style={{ margin: '0 0 0.4rem 0', color: '#854d0e', fontSize: '1.1rem', fontWeight: '800' }}>
                  {language === 'kn' ? fert.kannadaName : language === 'hi' ? fert.hindiName : fert.name}
                </h4>
                <span style={{ background: '#fef08a', color: '#713f12', padding: '0.25rem 0.5rem', borderRadius: '6px', fontWeight: '800', fontSize: '0.85rem' }}>
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
        {/* Application Schedule */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
            <Calendar size={18} color="#2d6a4f" />
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#1b4332' }}>{t.applicationTimeline}</h4>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {applicationSchedule.map((sched, idx) => (
              <div key={idx} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '10px', padding: '0.85rem 1.15rem', gap: '0.5rem' }}>
                <div>
                  <strong style={{ color: '#1b4332', fontSize: '0.95rem' }}>
                    {language === 'kn' ? sched.stageNameKn : language === 'hi' ? sched.stageNameHi : sched.stageName}
                  </strong>
                  <p style={{ margin: '0.2rem 0 0 0', color: '#6c757d', fontSize: '0.82rem' }}>
                    {language === 'kn' ? sched.instructionsKn : language === 'hi' ? sched.instructionsHi : sched.instructions}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {sched.ureaKg > 0 && <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.78rem', fontWeight: '700' }}>Urea: {sched.ureaKg} kg</span>}
                  {sched.dapKg > 0 && <span style={{ background: '#fef3c7', color: '#92400e', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.78rem', fontWeight: '700' }}>DAP: {sched.dapKg} kg</span>}
                  {sched.potashKg > 0 && <span style={{ background: '#fce7f3', color: '#9d174d', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.78rem', fontWeight: '700' }}>{sched.potashName || 'MOP'}: {sched.potashKg} kg</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
        {amendments.length > 0 && (
          <div style={{ marginTop: '1.5rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '1.25rem' }}>
            <h4 style={{ margin: '0 0 0.6rem 0', color: '#166534', fontSize: '1rem', fontWeight: '700' }}>{t.amendmentsTitle}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {amendments.map((am, idx) => (
                <div key={idx} style={{ fontSize: '0.85rem', color: '#14532d' }}>
                  • <strong>{language === 'kn' ? am.itemKn : language === 'hi' ? am.itemHi : am.item} ({am.bags}):</strong>{' '}
                  {language === 'kn' ? am.reasonKn : language === 'hi' ? am.reasonHi : am.reason} ({am.timing})
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. Modal: Update Soil Test Report */}
      {showUpdateModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 9999, padding: '1rem',
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '20px', maxWidth: '720px',
            width: '100%', maxHeight: '92vh', overflowY: 'auto',
            padding: '1.75rem', boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
            position: 'relative',
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '800', color: '#1b4332' }}>
                  {t.updateReportModalTitle}
                </h3>
                <p style={{ margin: '0.2rem 0 0 0', color: '#6c757d', fontSize: '0.85rem' }}>
                  {language === 'kn'
                    ? 'PDF ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಅಥವಾ ಮಾದರಿ ವರದಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ'
                    : 'Upload your PDF soil test report or select an authentic Karnataka sample'}
                </p>
              </div>
              <button type="button" onClick={onCloseUpdateModal} style={{ background: 'none', border: 'none', color: '#6c757d', cursor: 'pointer', padding: '0.25rem' }}>
                <X size={24} />
              </button>
            </div>

            {/* ── SECTION A: PDF Upload Zone ─────────────────────────────── */}
            <div style={{ marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <FileSearch size={18} color="#2d6a4f" />
                <label style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1b4332' }}>
                  {language === 'kn' ? 'ಮಣ್ಣು ಪರೀಕ್ಷಾ ವರದಿ PDF ಅಪ್‌ಲೋಡ್ ಮಾಡಿ' : 'Upload Soil Test Report PDF'}
                </label>
              </div>

              {/* Upload Zone */}
              {uploadState.status !== 'done' && (
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => uploadState.status === 'idle' || uploadState.status === 'error' ? fileInputRef.current?.click() : undefined}
                  style={{
                    border: `2px dashed ${isDragging ? '#2d6a4f' : uploadState.status === 'error' ? '#dc2626' : '#b7e4c7'}`,
                    borderRadius: '14px',
                    background: isDragging ? '#f1f8f5' : uploadState.status === 'error' ? '#fef2f2' : '#fafffe',
                    padding: '2rem',
                    textAlign: 'center',
                    cursor: uploadState.status === 'reading' || uploadState.status === 'analyzing' ? 'wait' : 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    style={{ display: 'none' }}
                    onChange={(e) => { if (e.target.files?.[0]) handlePdfFile(e.target.files[0]); e.target.value = ''; }}
                  />

                  {uploadState.status === 'reading' || uploadState.status === 'analyzing' ? (
                    <div>
                      {/* Animated scanning effect */}
                      <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1rem' }}>
                        <div style={{
                          width: '64px', height: '64px', borderRadius: '50%',
                          background: 'linear-gradient(135deg, #d8f3dc, #b7e4c7)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto',
                        }}>
                          <Sparkles size={28} color="#2d6a4f" style={{ animation: 'spin 1.5s linear infinite' }} />
                        </div>
                      </div>
                      <h4 style={{ margin: '0 0 0.5rem 0', color: '#1b4332', fontWeight: '700' }}>
                        {uploadState.status === 'reading' ? '📄 Reading PDF...' : '🤖 AI Extracting Soil Parameters...'}
                      </h4>
                      <p style={{ margin: '0 0 1rem 0', color: '#6c757d', fontSize: '0.85rem' }}>
                        {uploadState.status === 'reading'
                          ? 'Processing your soil report file'
                          : 'Identifying N, P, K, pH, EC, Zn & 12 parameters via AI'}
                      </p>
                      {/* Progress bar */}
                      <div style={{ background: '#e9ecef', borderRadius: '50px', height: '8px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', background: 'linear-gradient(90deg, #2d6a4f, #52b788)',
                          borderRadius: '50px', width: `${uploadState.progress}%`,
                          transition: 'width 0.5s ease',
                        }} />
                      </div>
                      <span style={{ fontSize: '0.78rem', color: '#6c757d', display: 'block', marginTop: '0.4rem' }}>
                        {uploadState.progress}% complete
                      </span>
                    </div>
                  ) : uploadState.status === 'error' ? (
                    <div>
                      <AlertCircle size={36} color="#dc2626" style={{ marginBottom: '0.75rem' }} />
                      <h4 style={{ margin: '0 0 0.3rem 0', color: '#dc2626', fontWeight: '700' }}>Upload Failed</h4>
                      <p style={{ margin: '0 0 1rem 0', color: '#7f1d1d', fontSize: '0.85rem' }}>{uploadState.errorMessage}</p>
                      <span style={{ fontSize: '0.82rem', color: '#6c757d' }}>Click to try again</span>
                    </div>
                  ) : (
                    <div>
                      <div style={{
                        width: '64px', height: '64px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #d8f3dc, #b7e4c7)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto',
                      }}>
                        <Upload size={28} color="#2d6a4f" />
                      </div>
                      <h4 style={{ margin: '0 0 0.3rem 0', color: '#1b4332', fontWeight: '700' }}>
                        {language === 'kn' ? 'PDF ಫೈಲ್ ಎಳೆಯಿರಿ ಅಥವಾ ಕ್ಲಿಕ್ ಮಾಡಿ' : 'Drag & drop your PDF or click to browse'}
                      </h4>
                      <p style={{ margin: '0 0 1rem 0', color: '#6c757d', fontSize: '0.83rem' }}>
                        {language === 'kn' ? 'ಸಮರ್ಥಿತ ಫಾರ್ಮ್ಯಾಟ್: PDF, JPG, PNG (ಗರಿಷ್ಠ 15 MB)' : 'Supported: PDF, JPG, PNG (Max 15 MB)'}
                      </p>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#2d6a4f', color: '#fff', padding: '0.5rem 1.25rem', borderRadius: '8px', fontSize: '0.88rem', fontWeight: '700' }}>
                        <FileText size={16} />
                        <span>{language === 'kn' ? 'ಫೈಲ್ ಆಯ್ಕೆಮಾಡಿ' : 'Choose File'}</span>
                      </div>
                      <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '1.5rem', fontSize: '0.78rem', color: '#6c757d' }}>
                        <span>🧪 {language === 'kn' ? 'ಪ್ರಯೋಗಾಲಯ ವರದಿ' : 'Lab Reports'}</span>
                        <span>🃏 {language === 'kn' ? 'ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಕಾರ್ಡ್' : 'Soil Health Card'}</span>
                        <span>📸 {language === 'kn' ? 'ಸ್ಕ್ಯಾನ್ ಫೋಟೋ' : 'Scanned Photo'}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Upload Success Preview */}
              {uploadState.status === 'done' && uploadState.reportPreview && (
                <div style={{ border: '2px solid #2d6a4f', borderRadius: '14px', background: '#f0fdf4', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <CheckCircle2 size={22} color="#16a34a" />
                      <div>
                        <div style={{ fontWeight: '800', color: '#1b4332', fontSize: '0.95rem' }}>
                          {language === 'kn' ? 'PDF ಯಶಸ್ವಿಯಾಗಿ ವಿಶ್ಲೇಷಿಸಲಾಗಿದೆ!' : 'PDF Successfully Analyzed!'}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#16a34a' }}>
                          {confidencePct > 70
                            ? `✓ AI Confidence: ${confidencePct}% — Good extraction quality`
                            : `⚠ AI Confidence: ${confidencePct}% — Please verify values below`}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setUploadState({ status: 'idle', progress: 0 }); setPendingReport(null); }}
                      style={{ background: 'none', border: '1px solid #aaa', borderRadius: '6px', padding: '0.25rem 0.6rem', fontSize: '0.78rem', color: '#6c757d', cursor: 'pointer' }}
                    >
                      Re-upload
                    </button>
                  </div>

                  {/* Extracted Parameters Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.5rem' }}>
                    {Object.entries(uploadState.reportPreview.parameters).map(([key, pv]) => {
                      if (!pv || pv.value === null || pv.value === undefined) return null;
                      const isLow = pv.status?.includes('Low') || pv.status?.includes('Deficient') || pv.status?.includes('Acidic') || pv.status?.includes('Alkaline');
                      return (
                        <div key={key} style={{
                          background: isLow ? '#fef2f2' : '#ffffff',
                          border: `1px solid ${isLow ? '#fecaca' : '#d1fae5'}`,
                          borderRadius: '8px', padding: '0.5rem 0.6rem',
                        }}>
                          <div style={{ fontSize: '0.68rem', color: '#6c757d', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                            {key.replace(/([A-Z])/g, ' $1')}
                          </div>
                          <div style={{ fontSize: '1rem', fontWeight: '800', color: isLow ? '#dc2626' : '#166534' }}>
                            {pv.value} <span style={{ fontSize: '0.68rem', fontWeight: '400', color: '#6c757d' }}>{pv.unit}</span>
                          </div>
                          {pv.status && (
                            <div style={{ fontSize: '0.65rem', color: isLow ? '#b91c1c' : '#15803d', fontWeight: '600' }}>
                              {isLow ? '⚠ ' : '✓ '}{pv.status}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ marginTop: '0.75rem', background: '#fffbeb', border: '1px solid #fef08a', borderRadius: '8px', padding: '0.6rem 0.75rem', fontSize: '0.78rem', color: '#92400e' }}>
                    <strong>⚠ Important:</strong>{' '}
                    {language === 'kn'
                      ? 'ಎಐ ಮಾದರಿ ಮೌಲ್ಯಗಳನ್ನು ಮೂಲ ವರದಿಯೊಂದಿಗೆ ತಾಳೆ ನೋಡಿ ಖಚಿತಪಡಿಸಿ.'
                      : 'Please verify extracted values against your original report before saving. Click "Confirm & Save" to apply.'}
                  </div>
                </div>
              )}
            </div>

            {/* ── SECTION B: OR Divider ─────────────────────────────────── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ flex: 1, height: '1px', background: '#e9ecef' }} />
              <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#6c757d', textTransform: 'uppercase' }}>
                {language === 'kn' ? 'ಅಥವಾ ಮಾದರಿ ಆಯ್ಕೆಮಾಡಿ' : 'or select a sample report'}
              </span>
              <div style={{ flex: 1, height: '1px', background: '#e9ecef' }} />
            </div>

            {/* ── SECTION C: Sample Selector ────────────────────────────── */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.88rem', fontWeight: '700', color: '#212529', display: 'block', marginBottom: '0.5rem' }}>
                {t.instantSamples}
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {SAMPLES.map((s) => {
                  const isSel = s.id === selectedSampleId && !pendingReport;
                  return (
                    <div
                      key={s.id}
                      onClick={() => handleSelectSample(s.id)}
                      style={{
                        border: isSel ? '2px solid #2d6a4f' : '1px solid #e9ecef',
                        background: isSel ? '#f1f8f5' : '#ffffff',
                        borderRadius: '10px', padding: '0.85rem 1rem',
                        cursor: 'pointer', transition: 'all 0.15s ease',
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
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e9ecef' }}>
              <button
                type="button"
                onClick={onCloseUpdateModal}
                style={{ background: '#f8f9fa', border: '1px solid #ced4da', color: '#495057', padding: '0.65rem 1.25rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
              >
                {t.closeModal}
              </button>
              <button
                type="button"
                onClick={handleSaveReportUpdate}
                disabled={uploadState.status === 'reading' || uploadState.status === 'analyzing'}
                style={{
                  background: '#2d6a4f', border: 'none', color: '#ffffff',
                  padding: '0.65rem 1.5rem', borderRadius: '8px', fontWeight: '700',
                  cursor: (uploadState.status === 'reading' || uploadState.status === 'analyzing') ? 'wait' : 'pointer',
                  opacity: (uploadState.status === 'reading' || uploadState.status === 'analyzing') ? 0.6 : 1,
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                }}
              >
                {uploadState.status === 'reading' || uploadState.status === 'analyzing'
                  ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />{' '}Processing...</>
                  : <>{pendingReport ? '✓ Confirm & Save Report' : t.verifyAndProceed}</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
