import React, { useState } from 'react';
import { Language, SoilReport, SoilParametersMap } from '../types';
import { I18N } from '../data/i18n';
import { PARAM_DEFINITIONS } from '../data/standardsData';
import { CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight, Edit3 } from 'lucide-react';

interface ScreenVerificationProps {
  language: Language;
  report: SoilReport;
  onVerify: (verifiedParameters: SoilParametersMap) => void;
  onBack: () => void;
}

export const ScreenVerification: React.FC<ScreenVerificationProps> = ({
  language,
  report,
  onVerify,
  onBack
}) => {
  const t = I18N[language];

  // Local state initialized with report parameters
  const [params, setParams] = useState<SoilParametersMap>(() => ({ ...report.parameters }));

  const handleValueChange = (key: string, newVal: string) => {
    const num = newVal === '' ? null : parseFloat(newVal);
    setParams(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        value: num
      }
    }));
  };

  const handleSubmit = () => {
    onVerify(params);
  };

  const paramKeys = [
    'nitrogen',
    'phosphorus',
    'potassium',
    'ph',
    'ec',
    'organicCarbon',
    'sulphur',
    'zinc',
    'iron',
    'copper',
    'manganese',
    'boron'
  ];

  return (
    <div className="screen-container">
      <div className="hero-box">
        <div className="hero-badge">
          <ShieldCheck className="hero-badge-icon text-emerald" />
          <span>Extraction Confidence: {Math.round(report.confidenceScore * 100)}%</span>
        </div>
        <h1 className="hero-title">{t.verificationTitle}</h1>
        <p className="hero-subtitle">{t.verificationSubtitle}</p>
      </div>

      {/* Report Origin Card */}
      <div className="report-origin-card">
        <div className="origin-details">
          <h4>{report.title}</h4>
          <p><strong>Laboratory:</strong> {report.laboratoryName} • <strong>Date:</strong> {report.reportDate}</p>
          <p><strong>Farmer:</strong> {report.farmerName} • <strong>District:</strong> {report.district}</p>
        </div>
        <div className="origin-status">
          <span className="status-badge-pending">
            <Edit3 className="badge-icon-sm" />
            Verification Mode Active
          </span>
        </div>
      </div>

      {/* Extracted Parameters Table */}
      <div className="table-responsive-wrapper">
        <table className="verification-table">
          <thead>
            <tr>
              <th>{t.paramHeader}</th>
              <th>{t.valueHeader} (Editable)</th>
              <th>{t.unitHeader}</th>
              <th>{t.methodHeader}</th>
              <th>{t.confidenceHeader}</th>
            </tr>
          </thead>
          <tbody>
            {paramKeys.map((key) => {
              const def = PARAM_DEFINITIONS[key];
              const p = params[key];
              const val = p?.value !== null && p?.value !== undefined ? p.value : '';
              const conf = p?.confidence ? Math.round(p.confidence * 100) : 95;

              const displayName = language === 'kn' ? def.kannadaName : language === 'hi' ? def.hindiName : def.name;

              return (
                <tr key={key} className="param-row">
                  <td className="param-name-cell">
                    <div className="param-title-box">
                      <span className="param-symbol">{def.symbol}</span>
                      <div>
                        <strong>{displayName}</strong>
                        <span className="param-sub">{def.name}</span>
                      </div>
                    </div>
                  </td>

                  <td className="param-input-cell">
                    <input
                      type="number"
                      step="any"
                      value={val}
                      onChange={(e) => handleValueChange(key, e.target.value)}
                      className="param-edit-input"
                      placeholder="Enter value"
                    />
                  </td>

                  <td className="param-unit-cell">
                    <code>{p?.unit || def.unit}</code>
                  </td>

                  <td className="param-method-cell">
                    <span className="method-text">{p?.method || def.testMethod}</span>
                  </td>

                  <td className="param-confidence-cell">
                    <div className="confidence-pill">
                      <span className="conf-bar" style={{ width: `${conf}%` }} />
                      <span className="conf-label">{conf}% OCR</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="verification-notice">
        <AlertTriangle className="notice-icon text-amber" />
        <p>
          Agricultural Safety Rule: OCR extraction is an assistive convenience. Please confirm each numerical value matches your laboratory soil report before calculating fertilizer prescriptions.
        </p>
      </div>

      {/* Action Footer */}
      <div className="screen-action-footer">
        <button type="button" className="btn-secondary" onClick={onBack}>
          {t.back}
        </button>
        <button type="button" className="btn-primary" onClick={handleSubmit}>
          <CheckCircle2 className="btn-icon" />
          <span>{t.verifyAndProceed}</span>
          <ArrowRight className="btn-arrow" />
        </button>
      </div>
    </div>
  );
};
