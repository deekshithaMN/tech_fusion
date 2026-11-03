import React from 'react';
import { Language } from '../types';
import { I18N } from '../data/i18n';
import { Sprout, Droplets, Cpu, ShieldCheck, ArrowRight, Check } from 'lucide-react';

interface ScreenLanguageProps {
  language: Language;
  onSelectLanguage: (lang: Language) => void;
  onNext: () => void;
}

export const ScreenLanguage: React.FC<ScreenLanguageProps> = ({
  language,
  onSelectLanguage,
  onNext
}) => {
  const t = I18N[language];

  const languages = [
    {
      code: 'kn' as Language,
      name: 'ಕನ್ನಡ',
      englishName: 'Kannada',
      greeting: 'ನಮಸ್ಕಾರ ರೈತ ಬಾಂಧವರೇ!',
      desc: 'ಕರ್ನಾಟಕದ ರೈತರಿಗೆ ಸರಳ ಕನ್ನಡದಲ್ಲಿ ಮಣ್ಣಿನ ಫಲವತ್ತತೆ, ಗೊಬ್ಬರ ಮತ್ತು ನೀರಾವರಿ ಸಲಹೆಗಳು.',
      state: 'ಕರ್ನಾಟಕ (Karnataka Pilot)'
    },
    {
      code: 'en' as Language,
      name: 'English',
      englishName: 'English',
      greeting: 'Welcome Farmer!',
      desc: 'Scientific soil report analysis, STCR nutrient dosage and FAO-56 precision irrigation.',
      state: 'Pan-India & Karnataka'
    },
    {
      code: 'hi' as Language,
      name: 'हिंदी',
      englishName: 'Hindi',
      greeting: 'नमस्ते किसान भाइयों!',
      desc: 'मृदा परीक्षण रिपोर्ट का विश्लेषण, संतुलित उर्वरक मात्रा और सटीक सिंचाई परामर्श।',
      state: 'अखिल भारतीय (National)'
    }
  ];

  return (
    <div className="screen-container">
      {/* Pilot Banner */}
      <div className="banner-tag">
        <ShieldCheck className="banner-icon" />
        <span>{t.pilotBanner}</span>
      </div>

      {/* Hero Welcome */}
      <div className="hero-box">
        <div className="hero-badge">
          <Sprout className="hero-badge-icon" />
          <span>AgroSense AI • AgriTech 2.0</span>
        </div>
        <h1 className="hero-title">{t.selectLanguageTitle}</h1>
        <p className="hero-subtitle">{t.selectLanguageDesc}</p>
      </div>

      {/* Language Selection Grid */}
      <div className="lang-grid">
        {languages.map((l) => {
          const isSelected = language === l.code;
          return (
            <div
              key={l.code}
              className={`lang-card ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectLanguage(l.code)}
            >
              <div className="lang-card-header">
                <div>
                  <h3 className="lang-card-title">{l.name}</h3>
                  <span className="lang-card-sub">{l.englishName}</span>
                </div>
                <div className={`selection-radio ${isSelected ? 'checked' : ''}`}>
                  {isSelected && <Check className="check-icon" />}
                </div>
              </div>
              <p className="lang-greeting">{l.greeting}</p>
              <p className="lang-desc">{l.desc}</p>
              <div className="lang-footer">
                <span className="lang-state-pill">{l.state}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* System Highlights */}
      <div className="features-ribbon">
        <div className="feature-item">
          <Cpu className="feat-icon text-emerald" />
          <div>
            <h4>OCR Soil Report Extraction</h4>
            <p>Directly parses Soil Health Cards & laboratory certificates</p>
          </div>
        </div>
        <div className="feature-item">
          <Sprout className="feat-icon text-amber" />
          <div>
            <h4>ICAR & STCR Nutrient Dosing</h4>
            <p>Calculates exact commercial fertilizer bags (Urea, DAP, MOP, Zinc)</p>
          </div>
        </div>
        <div className="feature-item">
          <Droplets className="feat-icon text-sky" />
          <div>
            <h4>FAO-56 Precision Irrigation</h4>
            <p>Evapotranspiration & weather model saving up to 40% water</p>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="screen-action-footer">
        <button type="button" className="btn-primary" onClick={onNext}>
          <span>{t.continue}</span>
          <ArrowRight className="btn-arrow" />
        </button>
      </div>
    </div>
  );
};
