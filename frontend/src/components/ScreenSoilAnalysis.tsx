import React from 'react';
import { Language, SoilAnalysisSummary, SoilParametersMap } from '../types';
import { I18N } from '../data/i18n';
import { PARAM_DEFINITIONS } from '../data/standardsData';
import { Activity, AlertTriangle, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';

interface ScreenSoilAnalysisProps {
  language: Language;
  parameters: SoilParametersMap;
  analysis: SoilAnalysisSummary;
  onNext: () => void;
  onBack: () => void;
}

export const ScreenSoilAnalysis: React.FC<ScreenSoilAnalysisProps> = ({
  language,
  parameters,
  analysis,
  onNext,
  onBack
}) => {
  const t = I18N[language];

  const overallHealthLabel = language === 'kn'
    ? analysis?.overallHealthKn || analysis?.overallHealth || 'ಮಧ್ಯಮ / ಪೋಷಕಾಂಶಗಳ ಸಮತೋಲನ ಅಗತ್ಯ'
    : language === 'hi'
    ? analysis?.overallHealthHi || analysis?.overallHealth || 'मध्यम / पोषक तत्व प्रबंधन आवश्यक'
    : analysis?.overallHealth || 'Moderate / Requires Nutrient Attention';

  const score = analysis?.overallHealthScore ?? 75;
  const scoreColor = score >= 80 ? 'text-emerald' : score >= 60 ? 'text-amber' : 'text-rose';

  const deficiencies = analysis?.deficiencies || [];
  const criticalAlerts = analysis?.criticalAlerts || [];

  return (
    <div className="screen-container">
      <div className="hero-box">
        <h1 className="hero-title">{t.soilHealthTitle}</h1>
        <p className="hero-subtitle">
          Evaluation against ICAR & Karnataka Department of Agriculture diagnostic standards
        </p>
      </div>

      {/* Overall Scorecard Banner */}
      <div className="scorecard-hero-card">
        <div className="score-radial-group">
          <div className="score-number-box">
            <span className={`score-digit ${scoreColor}`}>{score}</span>
            <span className="score-denom">/ 100</span>
          </div>
          <span className="score-subtext">{t.overallScore}</span>
        </div>

        <div className="score-narrative">
          <div className="score-status-pill">
            <Activity className="status-pill-icon" />
            <span>{overallHealthLabel}</span>
          </div>
          <p className="score-desc">
            {deficiencies.length > 0 ? (
              <>
                Detected <strong>{deficiencies.length} deficient nutrients</strong> requiring targeted fertilization. pH is {analysis?.phCondition || 'Normal'} and Organic Carbon is {analysis?.organicCarbonStatus || 'Normal'}.
              </>
            ) : (
              'Soil macronutrient levels are within balanced agronomic benchmarks.'
            )}
          </p>
        </div>
      </div>

      {/* Critical Soil Condition Alerts */}
      {criticalAlerts.length > 0 && (
        <div className="critical-alerts-card">
          <div className="alert-header">
            <ShieldAlert className="alert-header-icon text-rose" />
            <h4>Soil Condition Warnings</h4>
          </div>
          <div className="alert-list">
            {criticalAlerts.map((ca, i) => (
              <div key={i} className="alert-item">
                <AlertTriangle className="alert-item-icon text-amber" />
                <span>{language === 'kn' ? ca.alertKn : language === 'hi' ? ca.alertHi : ca.alert}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Primary Nutrients (N-P-K) */}
      <div className="analysis-group">
        <h3 className="group-heading">Primary Macronutrients (N - P - K)</h3>
        <div className="params-cards-grid">
          {['nitrogen', 'phosphorus', 'potassium'].map((key) => {
            const def = PARAM_DEFINITIONS[key];
            if (!def) return null;
            const p = parameters?.[key];
            const val = p?.value !== null && p?.value !== undefined ? Number(p.value) : null;
            const interp = val !== null ? def.interpret(val) : null;

            const isDeficient = interp?.status.includes('Low');
            const statusLabel = interp ? (language === 'kn' ? interp.statusKn : language === 'hi' ? interp.statusHi : interp.status) : 'Not tested';
            const roleText = language === 'kn' ? def.roleKn : language === 'hi' ? def.roleHi : def.role;
            const displayName = language === 'kn' ? def.kannadaName : language === 'hi' ? def.hindiName : def.name;

            return (
              <div key={key} className={`param-card ${isDeficient ? 'status-deficient' : 'status-adequate'}`}>
                <div className="card-top">
                  <span className="card-symbol-badge">{def.symbol}</span>
                  <span className={`status-pill ${isDeficient ? 'pill-warning' : 'pill-success'}`}>
                    {statusLabel}
                  </span>
                </div>

                <h4 className="card-param-title">{displayName}</h4>
                <div className="card-value-row">
                  <span className="card-numerical-value">{val ?? '--'}</span>
                  <span className="card-unit">{p?.unit || def.unit}</span>
                </div>

                <div className="card-role-box">
                  <p className="card-role-text">{roleText}</p>
                </div>

                <div className="card-method-footer">
                  <span>Method: {p?.method || def.testMethod}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Soil Physico-Chemical (pH, EC, Organic Carbon) */}
      <div className="analysis-group">
        <h3 className="group-heading">Soil Physico-Chemical Reaction & Health</h3>
        <div className="params-cards-grid">
          {['ph', 'ec', 'organicCarbon'].map((key) => {
            const def = PARAM_DEFINITIONS[key];
            if (!def) return null;
            const p = parameters?.[key];
            const val = p?.value !== null && p?.value !== undefined ? Number(p.value) : null;
            const interp = val !== null ? def.interpret(val) : null;

            const isProblem = interp?.severity === 'warning' || interp?.severity === 'danger';
            const statusLabel = interp ? (language === 'kn' ? interp.statusKn : language === 'hi' ? interp.statusHi : interp.status) : 'Not tested';
            const roleText = language === 'kn' ? def.roleKn : language === 'hi' ? def.roleHi : def.role;
            const displayName = language === 'kn' ? def.kannadaName : language === 'hi' ? def.hindiName : def.name;

            return (
              <div key={key} className={`param-card ${isProblem ? 'status-deficient' : 'status-adequate'}`}>
                <div className="card-top">
                  <span className="card-symbol-badge">{def.symbol}</span>
                  <span className={`status-pill ${isProblem ? 'pill-warning' : 'pill-success'}`}>
                    {statusLabel}
                  </span>
                </div>

                <h4 className="card-param-title">{displayName}</h4>
                <div className="card-value-row">
                  <span className="card-numerical-value">{val ?? '--'}</span>
                  <span className="card-unit">{p?.unit || def.unit}</span>
                </div>

                <div className="card-role-box">
                  <p className="card-role-text">{roleText}</p>
                </div>

                <div className="card-method-footer">
                  <span>Method: {p?.method || def.testMethod}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Secondary & Micronutrients */}
      <div className="analysis-group">
        <h3 className="group-heading">Secondary & Micronutrients (S, Zn, Fe, Cu, Mn, B)</h3>
        <div className="params-cards-grid-small">
          {['sulphur', 'zinc', 'iron', 'copper', 'manganese', 'boron'].map((key) => {
            const def = PARAM_DEFINITIONS[key];
            if (!def) return null;
            const p = parameters?.[key];
            const val = p?.value !== null && p?.value !== undefined ? Number(p.value) : null;
            const interp = val !== null ? def.interpret(val) : null;
            const isDef = interp?.status.includes('Deficient') || interp?.status.includes('ಕೊರತೆ');
            const statusLabel = interp ? (language === 'kn' ? interp.statusKn : language === 'hi' ? interp.statusHi : interp.status) : 'Not tested';
            const displayName = language === 'kn' ? def.kannadaName : language === 'hi' ? def.hindiName : def.name;

            return (
              <div key={key} className={`micro-card ${isDef ? 'micro-deficient' : 'micro-adequate'}`}>
                <div className="micro-header">
                  <span className="micro-symbol">{def.symbol}</span>
                  <span className={`micro-status ${isDef ? 'text-amber' : 'text-emerald'}`}>{statusLabel}</span>
                </div>
                <strong className="micro-title">{displayName}</strong>
                <div className="micro-val-unit">
                  <span>{val ?? '--'}</span>
                  <code>{p?.unit || def.unit}</code>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Footer */}
      <div className="screen-action-footer">
        <button type="button" className="btn-secondary" onClick={onBack}>
          {t.back}
        </button>
        <button type="button" className="btn-primary" onClick={onNext}>
          <Sparkles className="btn-icon" />
          <span>View Fertilizer Recommendations</span>
          <ArrowRight className="btn-arrow" />
        </button>
      </div>
    </div>
  );
};
