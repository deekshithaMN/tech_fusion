import React, { useState } from 'react';
import { Language, CropProfile } from '../types';
import { I18N } from '../data/i18n';
import { CROPS_CATALOG } from '../data/cropsData';
import { Sprout, MapPin, Droplets, Calendar, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface ScreenCropProfileProps {
  language: Language;
  initialProfile: CropProfile;
  onSubmit: (profile: CropProfile) => void | Promise<void>;
  onBack: () => void;
}

export const ScreenCropProfile: React.FC<ScreenCropProfileProps> = ({
  language,
  initialProfile,
  onSubmit,
  onBack
}) => {
  const t = I18N[language];

  const [cropId, setCropId] = useState(initialProfile.cropId || 'tomato');
  const [farmArea, setFarmArea] = useState<number>(initialProfile.farmArea || 1.0);
  const [areaUnit, setAreaUnit] = useState<'acre' | 'hectare'>(initialProfile.areaUnit || 'acre');
  const [district, setDistrict] = useState(initialProfile.district || 'Mandya');
  const [growthStage, setGrowthStage] = useState(initialProfile.growthStage || 'flowering');
  const [irrigationMethod, setIrrigationMethod] = useState<'drip' | 'sprinkler' | 'furrow'>(
    initialProfile.irrigationMethod || 'drip'
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const selectedCrop = CROPS_CATALOG[cropId] || CROPS_CATALOG['tomato'];

  const districts = [
    'Mandya',
    'Kolar',
    'Bengaluru Rural',
    'Belagavi',
    'Davanagere',
    'Raichur',
    'Shivamogga',
    'Dharwad',
    'Mysuru',
    'Hassan'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        cropId,
        farmArea: Number(farmArea) || 1.0,
        areaUnit,
        district,
        growthStage,
        irrigationMethod
      });
    } catch (err) {
      console.error('Submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="screen-container">
      <div className="hero-box">
        <h1 className="hero-title">{t.cropTitle}</h1>
        <p className="hero-subtitle">{t.cropSubtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="crop-form-layout">
        {/* Crop Selection Grid */}
        <div className="form-section-card">
          <label className="section-title">
            <Sprout className="section-icon text-emerald" />
            <span>{t.selectCropLabel}</span>
          </label>
          <div className="crops-grid">
            {Object.values(CROPS_CATALOG).map((crop) => {
              const isSelected = cropId === crop.id;
              const title = language === 'kn' ? crop.kannadaName : language === 'hi' ? crop.hindiName : crop.name;
              return (
                <div
                  key={crop.id}
                  className={`crop-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => setCropId(crop.id)}
                >
                  <div className="crop-card-icon">🌱</div>
                  <strong className="crop-card-name">{title}</strong>
                  <span className="crop-card-sub">{crop.category} • {crop.durationDays} days</span>
                  <div className="crop-rdf-tag">
                    RDF: {crop.rdfPerAcre.n}N : {crop.rdfPerAcre.p}P : {crop.rdfPerAcre.k}K (kg/ac)
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Farm Area & Unit */}
        <div className="form-row-2">
          <div className="form-section-card">
            <label className="section-title">
              <MapPin className="section-icon text-amber" />
              <span>{t.farmAreaLabel} & {t.areaUnitLabel}</span>
            </label>
            <div className="area-inputs">
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={farmArea}
                onChange={(e) => setFarmArea(parseFloat(e.target.value) || 0.1)}
                className="input-number"
                required
              />
              <div className="unit-toggle">
                <button
                  type="button"
                  className={`toggle-btn ${areaUnit === 'acre' ? 'active' : ''}`}
                  onClick={() => setAreaUnit('acre')}
                >
                  {t.acres}
                </button>
                <button
                  type="button"
                  className={`toggle-btn ${areaUnit === 'hectare' ? 'active' : ''}`}
                  onClick={() => setAreaUnit('hectare')}
                >
                  {t.hectares}
                </button>
              </div>
            </div>
          </div>

          {/* Location / District */}
          <div className="form-section-card">
            <label className="section-title">
              <MapPin className="section-icon text-sky" />
              <span>{t.locationLabel} (Karnataka Pilot)</span>
            </label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="select-dropdown"
            >
              {districts.map(d => (
                <option key={d} value={d}>{d} District</option>
              ))}
            </select>
            <span className="hint-text">Used for Open-Meteo agro-climatic weather & rainfall synchronization.</span>
          </div>
        </div>

        {/* Growth Stage Selection */}
        <div className="form-section-card">
          <label className="section-title">
            <Calendar className="section-icon text-emerald" />
            <span>{t.stageLabel}</span>
          </label>
          <div className="stages-row">
            {selectedCrop.stages.map((st) => {
              const isSelected = growthStage === st.key;
              const name = language === 'kn' ? st.nameKn : language === 'hi' ? st.nameHi : st.name;
              return (
                <div
                  key={st.key}
                  className={`stage-pill ${isSelected ? 'selected' : ''}`}
                  onClick={() => setGrowthStage(st.key)}
                >
                  <div className="stage-top">
                    <strong>{name}</strong>
                    <span className="stage-kc">Kc: {st.kc}</span>
                  </div>
                  <span className="stage-duration">{st.duration} days duration</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Irrigation Method */}
        <div className="form-section-card">
          <label className="section-title">
            <Droplets className="section-icon text-sky" />
            <span>{t.irrigationMethodLabel}</span>
          </label>
          <div className="irrigation-methods-grid">
            <div
              className={`method-card ${irrigationMethod === 'drip' ? 'selected' : ''}`}
              onClick={() => setIrrigationMethod('drip')}
            >
              <div className="method-icon">💧</div>
              <strong className="method-name">{t.drip}</strong>
              <p className="method-desc">Precision emitter discharge with minimal evaporative loss.</p>
              <span className="efficiency-badge text-emerald">90% Application Efficiency</span>
            </div>

            <div
              className={`method-card ${irrigationMethod === 'sprinkler' ? 'selected' : ''}`}
              onClick={() => setIrrigationMethod('sprinkler')}
            >
              <div className="method-icon">🚿</div>
              <strong className="method-name">{t.sprinkler}</strong>
              <p className="method-desc">Overhead spray suitable for cereals and close-spaced crops.</p>
              <span className="efficiency-badge text-amber">75% Application Efficiency</span>
            </div>

            <div
              className={`method-card ${irrigationMethod === 'furrow' ? 'selected' : ''}`}
              onClick={() => setIrrigationMethod('furrow')}
            >
              <div className="method-icon">🌊</div>
              <strong className="method-name">{t.furrow}</strong>
              <p className="method-desc">Traditional surface trench or basin flooding.</p>
              <span className="efficiency-badge text-rose">60% Application Efficiency</span>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="screen-action-footer">
          <button type="button" className="btn-secondary" onClick={onBack} disabled={isSubmitting}>
            {t.back}
          </button>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Sparkles className="btn-icon animate-spin" />
                <span>{language === 'kn' ? 'ಸಲಹೆ ಸಿದ್ಧವಾಗುತ್ತಿದೆ...' : language === 'hi' ? 'परामर्श तैयार हो रहा है...' : 'Generating Advisory...'}</span>
              </>
            ) : (
              <>
                <ShieldCheck className="btn-icon" />
                <span>{t.calculateAdvisory}</span>
                <ArrowRight className="btn-arrow" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
