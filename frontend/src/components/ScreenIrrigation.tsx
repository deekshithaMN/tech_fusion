import React from 'react';
import { Language, IrrigationAdvisory } from '../types';
import { I18N } from '../data/i18n';
import { Droplets, CloudSun, Clock, Gauge, ShieldAlert, ArrowRight, Sparkles, TrendingDown } from 'lucide-react';

interface ScreenIrrigationProps {
  language: Language;
  advisory: IrrigationAdvisory;
  onNext: () => void;
  onBack: () => void;
}

export const ScreenIrrigation: React.FC<ScreenIrrigationProps> = ({
  language,
  advisory,
  onNext,
  onBack
}) => {
  const t = I18N[language];

  const reason = language === 'kn'
    ? advisory.operationalSchedule.decisionReasonKn
    : language === 'hi'
    ? advisory.operationalSchedule.decisionReasonHi
    : advisory.operationalSchedule.decisionReason;

  const scheduleText = language === 'kn'
    ? advisory.operationalSchedule.recommendedScheduleKn
    : language === 'hi'
    ? advisory.operationalSchedule.recommendedScheduleHi
    : advisory.operationalSchedule.recommendedSchedule;

  const disclaimer = language === 'kn'
    ? advisory.disclaimerKn
    : language === 'hi'
    ? advisory.disclaimerHi
    : advisory.disclaimer;

  const isRecommended = advisory.operationalSchedule.shouldIrrigate;

  return (
    <div className="screen-container">
      <div className="hero-box">
        <h1 className="hero-title">{t.irrigationTitle}</h1>
        <p className="hero-subtitle">{t.irrigationSubtitle}</p>
      </div>

      {/* Decision Status Banner (Answers Question 1: Does the crop need irrigation?) */}
      <div className={`irrigation-status-banner ${isRecommended ? 'status-irrigate' : 'status-postpone'}`}>
        <div className="status-banner-icon">
          <Droplets className="banner-droplet-icon" />
        </div>
        <div className="status-banner-content">
          <div className="urgency-badge">
            Action: <strong>{advisory.operationalSchedule.actionUrgency}</strong>
          </div>
          <h3 className="status-banner-title">
            {isRecommended ? 'Scheduled Irrigation Required Today' : 'Irrigation Postponed'}
          </h3>
          <p className="status-banner-desc">{reason}</p>
        </div>
      </div>

      {/* Key Metrics Grid (Answers Question 2 & 3: How much water and when?) */}
      <div className="irrigation-metrics-grid">
        {/* Metric 1: Daily Water Volume */}
        <div className="metric-card">
          <div className="metric-header">
            <Droplets className="metric-icon text-sky" />
            <span className="metric-tag">{t.dailyWaterDemand}</span>
          </div>
          <div className="metric-number-group">
            <span className="metric-huge-number">
              {advisory.waterBalance.dailyLitresTotal.toLocaleString()}
            </span>
            <span className="metric-unit">Litres / day</span>
          </div>
          <p className="metric-detail">
            Depth: <strong>{advisory.waterBalance.grossRequirementMm} mm gross depth</strong> ({advisory.waterBalance.litresPerAcrePerDay.toLocaleString()} L/acre)
          </p>
        </div>

        {/* Metric 2: Operational Schedule */}
        <div className="metric-card metric-card-accent">
          <div className="metric-header">
            <Clock className="metric-icon text-emerald" />
            <span className="metric-tag">{t.scheduleBox}</span>
          </div>
          <div className="metric-schedule-text">
            <h4>{scheduleText}</h4>
          </div>
          <div className="metric-detail">
            <span>Cycle Volume: <strong>{advisory.waterBalance.cycleLitresTotal.toLocaleString()} Litres</strong></span>
            <br />
            <span>Assumed Flow Rate: {advisory.operationalSchedule.pumpDischargeAssumed}</span>
          </div>
        </div>

        {/* Metric 3: Water Conservation */}
        <div className="metric-card">
          <div className="metric-header">
            <TrendingDown className="metric-icon text-emerald" />
            <span className="metric-tag">{t.waterSaved}</span>
          </div>
          <div className="metric-number-group">
            <span className="metric-huge-number text-emerald">
              {advisory.waterConservation.dailySavedLitres.toLocaleString()}
            </span>
            <span className="metric-unit">Litres saved / day</span>
          </div>
          <p className="metric-detail">
            <strong>{advisory.waterConservation.savingsPercent}% water reduction</strong> compared to traditional furrow flooding
          </p>
        </div>
      </div>

      {/* Agro-Meteorological & Soil-Water Balance Details (Answers Question 4: Why?) */}
      <div className="weather-balance-card">
        <div className="card-sub-header">
          <CloudSun className="sec-icon text-amber" />
          <div>
            <h4>Agro-Meteorological Evapotranspiration Balance</h4>
            <p>Source: {advisory.weather.source}</p>
          </div>
        </div>

        <div className="balance-table-grid">
          <div className="balance-cell">
            <span className="cell-label">Ref. Evapotranspiration (ET0):</span>
            <strong className="cell-val">{advisory.evapotranspiration.et0_mm} mm/day</strong>
          </div>
          <div className="balance-cell">
            <span className="cell-label">Crop Coefficient (Kc):</span>
            <strong className="cell-val">{advisory.evapotranspiration.kc} ({advisory.crop.stage})</strong>
          </div>
          <div className="balance-cell">
            <span className="cell-label">Crop Evapotranspiration (ETc):</span>
            <strong className="cell-val text-emerald">{advisory.evapotranspiration.etc_mm} mm/day</strong>
          </div>
          <div className="balance-cell">
            <span className="cell-label">Rainfall Forecast (Next 24h):</span>
            <strong className="cell-val">{advisory.weather.forecastRainMm} mm (Pe: {advisory.evapotranspiration.effectiveRain_mm} mm)</strong>
          </div>
          <div className="balance-cell">
            <span className="cell-label">Irrigation System Efficiency:</span>
            <strong className="cell-val">{advisory.method.name} ({advisory.method.efficiencyPercent}%)</strong>
          </div>
          <div className="balance-cell">
            <span className="cell-label">Net vs Gross Requirement:</span>
            <strong className="cell-val">{advisory.waterBalance.netRequirementMm} mm net / {advisory.waterBalance.grossRequirementMm} mm gross</strong>
          </div>
        </div>
      </div>

      {/* Mandatory Soil Moisture Notice */}
      <div className="disclaimer-callout">
        <ShieldAlert className="disclaimer-icon text-amber" />
        <p>{disclaimer}</p>
      </div>

      {/* Action Footer */}
      <div className="screen-action-footer">
        <button type="button" className="btn-secondary" onClick={onBack}>
          {t.back}
        </button>
        <button type="button" className="btn-primary" onClick={onNext}>
          <Sparkles className="btn-icon" />
          <span>Ask AgroSense AI Assistant</span>
          <ArrowRight className="btn-arrow" />
        </button>
      </div>
    </div>
  );
};
