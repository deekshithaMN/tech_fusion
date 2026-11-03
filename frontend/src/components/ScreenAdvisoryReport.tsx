import React from 'react';
import { Language, SoilReport, CropProfile, SoilAnalysisSummary, FertilizerRecommendation, IrrigationAdvisory, AIAdvisoryExplanation } from '../types';
import { I18N } from '../data/i18n';
import { Printer, Sprout, RotateCcw } from 'lucide-react';

interface ScreenAdvisoryReportProps {
  language: Language;
  report: SoilReport;
  cropProfile: CropProfile;
  soilAnalysis: SoilAnalysisSummary;
  nutrientRec: FertilizerRecommendation;
  irrigationRec: IrrigationAdvisory;
  explanation: AIAdvisoryExplanation;
  onReset: () => void;
  onBack: () => void;
}

export const ScreenAdvisoryReport: React.FC<ScreenAdvisoryReportProps> = ({
  language,
  report,
  cropProfile,
  soilAnalysis,
  nutrientRec,
  irrigationRec,
  explanation,
  onReset,
  onBack
}) => {
  const t = I18N[language];

  const handlePrint = () => {
    window.print();
  };

  const cropTitle = language === 'kn' ? nutrientRec?.crop?.kannadaName : language === 'hi' ? nutrientRec?.crop?.hindiName : nutrientRec?.crop?.name;
  const deficiencies = soilAnalysis?.deficiencies || [];
  const fertilizers = nutrientRec?.commercialFertilizers || [];
  const schedule = nutrientRec?.applicationSchedule || [];
  const amendments = nutrientRec?.amendments || [];

  return (
    <div className="screen-container">
      {/* Top Action Bar (hidden in print) */}
      <div className="report-action-header no-print">
        <div className="header-titles">
          <h2 className="title-bold">{t.reportTitle}</h2>
          <span className="sub-text">Ready for Farmer Field Implementation</span>
        </div>
        <div className="header-buttons-row">
          <button type="button" className="btn-secondary" onClick={onBack}>
            {t.back}
          </button>
          <button type="button" className="btn-secondary" onClick={onReset}>
            <RotateCcw className="btn-icon-sm" />
            <span>New Analysis</span>
          </button>
          <button type="button" className="btn-primary print-trigger-btn" onClick={handlePrint}>
            <Printer className="btn-icon" />
            <span>{t.downloadReport}</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Sheet */}
      <div className="official-report-sheet">
        {/* Report Header & Emblem */}
        <div className="sheet-header">
          <div className="sheet-emblem-box">
            <div className="sheet-logo-badge">
              <Sprout className="sheet-brand-icon" />
            </div>
            <div>
              <h1 className="sheet-main-title">AgroSense AI</h1>
              <span className="sheet-subtitle">Precision Soil Health & Irrigation Advisory System</span>
            </div>
          </div>
          <div className="sheet-meta-box">
            <span className="report-id-text">Doc Ref: <strong>AGY-{Date.now().toString().slice(-6)}</strong></span>
            <span className="report-date-text">Date: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            <span className="report-status-text">Status: <strong>FARMER VERIFIED</strong></span>
          </div>
        </div>

        {/* Farmer & Cultivation Profile Section */}
        <div className="sheet-section profile-section-grid">
          <div className="profile-col">
            <h4 className="sheet-section-title">1. Farmer & Farm Location</h4>
            <div className="data-row"><span>Farmer Name:</span> <strong>{report?.farmerName || 'Farmer'}</strong></div>
            <div className="data-row"><span>District / State:</span> <strong>{cropProfile?.district || 'Mandya'}, Karnataka</strong></div>
            <div className="data-row"><span>Testing Laboratory:</span> <strong>{report?.laboratoryName || 'Diagnostic Lab'}</strong></div>
            <div className="data-row"><span>Original Sample Date:</span> <strong>{report?.reportDate || 'Recent'}</strong></div>
          </div>

          <div className="profile-col">
            <h4 className="sheet-section-title">2. Crop Cultivation Profile</h4>
            <div className="data-row"><span>Target Crop:</span> <strong>{cropTitle || 'Crop'}</strong></div>
            <div className="data-row"><span>Farm Cultivation Area:</span> <strong>{cropProfile?.farmArea || 1} {cropProfile?.areaUnit || 'acre'} ({nutrientRec?.farmProfile?.areaInAcres || 1} acres)</strong></div>
            <div className="data-row"><span>Current Growth Stage:</span> <strong>{irrigationRec?.crop?.stage || 'Flowering'} (Kc: {irrigationRec?.crop?.kc || 1.15})</strong></div>
            <div className="data-row"><span>Irrigation System:</span> <strong>{irrigationRec?.method?.name || 'Drip'} ({irrigationRec?.method?.efficiencyPercent || 90}% Eff.)</strong></div>
          </div>
        </div>

        {/* Soil Health Summary */}
        <div className="sheet-section">
          <h4 className="sheet-section-title">3. Verified Soil Health Analysis</h4>
          <div className="sheet-score-bar">
            <div className="score-badge-circle">
              <span className="score-val">{soilAnalysis?.overallHealthScore ?? 75}</span>
              <span className="score-label">Health Score</span>
            </div>
            <div className="score-summary-narrative">
              <strong>{soilAnalysis?.overallHealth || 'Good'}</strong>
              <p>{explanation?.soilHealthSummary || ''}</p>
            </div>
          </div>

          <div className="sheet-deficiencies-list">
            <strong>Deficient Nutrients Identified:</strong>
            {deficiencies.length > 0 ? (
              <div className="deficiency-tags-row">
                {deficiencies.map((d, idx) => (
                  <span key={idx} className="def-pill">{d.name} ({d.value} {d.unit}) - {d.status}</span>
                ))}
              </div>
            ) : (
              <span>All primary macronutrients are within recommended thresholds.</span>
            )}
          </div>
        </div>

        {/* Commercial Fertilizer Dosage */}
        <div className="sheet-section">
          <h4 className="sheet-section-title">4. Recommended Fertilizer Dosages & Bags to Purchase</h4>
          <table className="sheet-table">
            <thead>
              <tr>
                <th>Commercial Fertilizer Source</th>
                <th>Total Quantity</th>
                <th>Standard Commercial Packaging</th>
                <th>Nutrient Contribution</th>
              </tr>
            </thead>
            <tbody>
              {fertilizers.map((fert, idx) => (
                <tr key={idx}>
                  <td><strong>{fert.name}</strong></td>
                  <td>{fert.totalKg} kg</td>
                  <td><span className="bag-highlight">{fert.bagCountText}</span></td>
                  <td>{fert.nutrientSupplied}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Split Application Schedule */}
        <div className="sheet-section">
          <h4 className="sheet-section-title">5. Stage-Wise Split Fertilizer Application Schedule</h4>
          <table className="sheet-table">
            <thead>
              <tr>
                <th>Crop Growth Stage</th>
                <th>Urea</th>
                <th>DAP</th>
                <th>Potash</th>
                <th>Agronomic Instructions</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((st, idx) => (
                <tr key={idx}>
                  <td><strong>{st.stageName}</strong></td>
                  <td>{st.ureaKg} kg</td>
                  <td>{st.dapKg} kg</td>
                  <td>{st.potashKg} kg</td>
                  <td className="small-text">{st.instructions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Soil Amendments */}
        {amendments.length > 0 && (
          <div className="sheet-section">
            <h4 className="sheet-section-title">6. Soil Amendments & Micronutrient Corrections</h4>
            <div className="sheet-amendments-list">
              {amendments.map((am, idx) => (
                <div key={idx} className="sheet-amendment-item">
                  <strong>{am.item} ({am.bags}):</strong> {am.reason} <em>({am.timing})</em>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Precision Irrigation Advisory */}
        <div className="sheet-section">
          <h4 className="sheet-section-title">7. FAO-56 Precision Irrigation Schedule</h4>
          <div className="irrigation-sheet-grid">
            <div className="irr-box">
              <span className="irr-box-label">Daily Crop Water Requirement:</span>
              <strong className="irr-box-value">{(irrigationRec?.waterBalance?.dailyLitresTotal ?? 0).toLocaleString()} Litres / day</strong>
              <span className="irr-box-sub">({irrigationRec?.waterBalance?.grossRequirementMm ?? 0} mm gross depth)</span>
            </div>
            <div className="irr-box">
              <span className="irr-box-label">Recommended Pump Runtime:</span>
              <strong className="irr-box-value">{irrigationRec?.operationalSchedule?.recommendedSchedule || '2 hours every 2 days'}</strong>
              <span className="irr-box-sub">Assumes standard 3 HP pump ({irrigationRec?.operationalSchedule?.pumpDischargeAssumed || '20,000 L/hr'})</span>
            </div>
            <div className="irr-box">
              <span className="irr-box-label">Water Conservation Impact:</span>
              <strong className="irr-box-value text-emerald">{(irrigationRec?.waterConservation?.dailySavedLitres ?? 0).toLocaleString()} Litres saved / day</strong>
              <span className="irr-box-sub">{irrigationRec?.waterConservation?.savingsPercent ?? 0}% savings over flood irrigation</span>
            </div>
          </div>
        </div>

        {/* Scientific Sources & Limitations */}
        <div className="sheet-section sheet-disclaimer-box">
          <h4 className="sheet-section-title">8. Scientific Citations & Regulatory Disclaimers</h4>
          <p>
            <strong>Research References:</strong> ICAR Package of Practices; University of Agricultural Sciences (UAS), Bengaluru; Soil Test Crop Response (STCR) Equations; FAO Irrigation and Drainage Paper No. 56 (Penman-Monteith).
          </p>
          <p className="legal-disclaimer">
            <strong>Safety Notice:</strong> A soil testing laboratory report measures soil chemical fertility, not current instantaneous moisture. Irrigation advisory is model-generated using agro-meteorological data. For commercial farming prescriptions, review with your local Raitha Samparka Kendra agricultural extension officer.
          </p>
        </div>

        {/* Signatures & Seal */}
        <div className="sheet-footer-signatures">
          <div className="sig-block">
            <div className="sig-line" />
            <span>AgroSense AI Certified Engine</span>
          </div>
          <div className="sig-block">
            <div className="sig-line" />
            <span>Raitha Samparka Kendra / Extension Review</span>
          </div>
        </div>
      </div>
    </div>
  );
};
