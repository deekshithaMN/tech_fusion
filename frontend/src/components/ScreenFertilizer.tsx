import React from 'react';
import { Language, FertilizerRecommendation } from '../types';
import { I18N } from '../data/i18n';
import { Package, Calendar, Sparkles, BookOpen, ArrowRight, ShieldCheck, Check } from 'lucide-react';

interface ScreenFertilizerProps {
  language: Language;
  recommendation: FertilizerRecommendation;
  onNext: () => void;
  onBack: () => void;
}

export const ScreenFertilizer: React.FC<ScreenFertilizerProps> = ({
  language,
  recommendation,
  onNext,
  onBack
}) => {
  const t = I18N[language];

  const commercialFertilizers = recommendation?.commercialFertilizers || [];
  const applicationSchedule = recommendation?.applicationSchedule || [];
  const amendments = recommendation?.amendments || [];

  return (
    <div className="screen-container">
      <div className="hero-box">
        <div className="hero-badge">
          <BookOpen className="hero-badge-icon text-emerald" />
          <span>{recommendation?.scientificSource?.organization || 'UAS Bengaluru & ICAR'}</span>
        </div>
        <h1 className="hero-title">{t.fertilizerTitle}</h1>
        <p className="hero-subtitle">{t.fertilizerSubtitle}</p>
      </div>

      {/* Target Crop & Farm Area Context Bar */}
      <div className="crop-context-ribbon">
        <div className="ctx-item">
          <span className="ctx-label">Selected Crop:</span>
          <strong className="ctx-val">
            {language === 'kn' ? recommendation?.crop?.kannadaName : language === 'hi' ? recommendation?.crop?.hindiName : recommendation?.crop?.name}
          </strong>
        </div>
        <div className="ctx-item">
          <span className="ctx-label">Farm Cultivation Area:</span>
          <strong className="ctx-val">{recommendation?.farmProfile?.area || 1} {recommendation?.farmProfile?.unit || 'acre'} ({recommendation?.farmProfile?.areaInAcres || 1} acres)</strong>
        </div>
        <div className="ctx-item">
          <span className="ctx-label">Net Nutrient Target:</span>
          <strong className="ctx-val text-emerald">
            {recommendation?.nutrientRequirements?.nKgTotal || 0}N : {recommendation?.nutrientRequirements?.pKgTotal || 0}P : {recommendation?.nutrientRequirements?.kKgTotal || 0}K (kg total)
          </strong>
        </div>
      </div>

      {/* Commercial Fertilizer Bags to Purchase */}
      <div className="fertilizer-section">
        <div className="section-header-box">
          <Package className="sec-icon text-amber" />
          <div>
            <h3>{t.commercialFertilizers}</h3>
            <p>Calculated commercial quantities based on active nutrient fraction formulations</p>
          </div>
        </div>

        <div className="fertilizer-cards-grid">
          {commercialFertilizers.map((fert, idx) => {
            const name = language === 'kn' ? fert.kannadaName : language === 'hi' ? fert.hindiName : fert.name;
            const supplyText = language === 'kn' ? fert.nutrientSuppliedKn : language === 'hi' ? fert.nutrientSuppliedHi : fert.nutrientSupplied;

            return (
              <div key={idx} className="fert-card">
                <div className="fert-card-top">
                  <div className="fert-badge-box">
                    <Package className="fert-bag-icon" />
                    <span className="bag-text-highlight">{fert.bagCountText}</span>
                  </div>
                  <span className="fert-kg-total">{fert.totalKg} kg</span>
                </div>

                <h4 className="fert-name">{name}</h4>
                <p className="fert-nutrient-desc">{supplyText}</p>

                <div className="fert-card-footer">
                  <span className="application-hint">
                    <Check className="check-sm text-emerald" /> Available at local Raitha Samparka Kendra / PACS
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stage-Wise Split Application Calendar */}
      <div className="fertilizer-section">
        <div className="section-header-box">
          <Calendar className="sec-icon text-emerald" />
          <div>
            <h3>{t.applicationTimeline}</h3>
            <p>Splitting fertilizer doses prevents nutrient leaching and matches crop uptake stages</p>
          </div>
        </div>

        <div className="timeline-stages-wrapper">
          {applicationSchedule.map((stage, idx) => {
            const stageName = language === 'kn' ? stage.stageNameKn : language === 'hi' ? stage.stageNameHi : stage.stageName;
            const instr = language === 'kn' ? stage.instructionsKn : language === 'hi' ? stage.instructionsHi : stage.instructions;

            return (
              <div key={idx} className="timeline-stage-card">
                <div className="stage-card-header">
                  <div className="stage-step-circle">{idx + 1}</div>
                  <div>
                    <h4>{stageName}</h4>
                    <span className="stage-tag">{stage.stageKey === 'basal' ? 'Basal at Planting' : 'Top Dressing'}</span>
                  </div>
                </div>

                <div className="stage-doses-grid">
                  <div className="dose-pill">
                    <span className="dose-label">Urea:</span>
                    <strong className="dose-val">{stage.ureaKg} kg</strong>
                  </div>
                  <div className="dose-pill">
                    <span className="dose-label">DAP:</span>
                    <strong className="dose-val">{stage.dapKg} kg</strong>
                  </div>
                  <div className="dose-pill">
                    <span className="dose-label">Potash:</span>
                    <strong className="dose-val">{stage.potashKg} kg</strong>
                  </div>
                </div>

                <p className="stage-instructions-text">{instr}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Soil Amendments & Micronutrients */}
      {amendments.length > 0 && (
        <div className="fertilizer-section">
          <div className="section-header-box">
            <Sparkles className="sec-icon text-sky" />
            <div>
              <h3>{t.amendmentsTitle}</h3>
              <p>Essential soil conditioning and micronutrient corrections</p>
            </div>
          </div>

          <div className="amendments-grid">
            {amendments.map((am, i) => {
              const item = language === 'kn' ? am.itemKn : language === 'hi' ? am.itemHi : am.item;
              const reason = language === 'kn' ? am.reasonKn : language === 'hi' ? am.reasonHi : am.reason;

              return (
                <div key={i} className="amendment-card">
                  <div className="amendment-header">
                    <h4>{item}</h4>
                    <span className="amendment-qty">{am.bags}</span>
                  </div>
                  <p className="amendment-reason">{reason}</p>
                  <div className="amendment-timing">
                    <strong>Timing:</strong> {am.timing}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Scientific Citation */}
      <div className="scientific-citation-card">
        <ShieldCheck className="cite-icon text-emerald" />
        <div>
          <h4>Scientifically Validated Formulation</h4>
          <p>
            Source: {recommendation?.scientificSource?.organization || 'ICAR & UAS Bengaluru'} • {recommendation?.scientificSource?.handbook || 'Package of Practices'}. Dosage calculated via Soil Test Crop Response (STCR) equations. AI model does not independently invent dosages.
          </p>
        </div>
      </div>

      {/* Action Footer */}
      <div className="screen-action-footer">
        <button type="button" className="btn-secondary" onClick={onBack}>
          {t.back}
        </button>
        <button type="button" className="btn-primary" onClick={onNext}>
          <Sparkles className="btn-icon" />
          <span>View Precision Irrigation Advisory</span>
          <ArrowRight className="btn-arrow" />
        </button>
      </div>
    </div>
  );
};
