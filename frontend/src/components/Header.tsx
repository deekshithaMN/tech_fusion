import React from 'react';
import { 
  Sprout, 
  Volume2, 
  VolumeX, 
  Globe, 
  Home, 
  Layers, 
  Camera, 
  Droplets, 
  User, 
  FileCheck 
} from 'lucide-react';
import { Language, NavigationTab } from '../types';
import { I18N } from '../data/i18n';

interface HeaderProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  isSpeaking: boolean;
  onToggleSpeech: () => void;
  canSpeak: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  language,
  onLanguageChange,
  isSpeaking,
  onToggleSpeech,
  canSpeak
}) => {
  const t = I18N[language];

  const tabs: Array<{ id: NavigationTab; label: string; icon: React.ReactNode }> = [
    { id: 'home', label: t.navHome, icon: <Home size={18} /> },
    { id: 'soil', label: t.navSoil, icon: <Layers size={18} /> },
    { id: 'crop', label: t.navCrop, icon: <Camera size={18} /> },
    { id: 'advisory', label: t.navAdvisory, icon: <FileCheck size={18} /> },
    { id: 'profile', label: t.navProfile, icon: <User size={18} /> }
  ];

  return (
    <header className="header-container" style={{ background: '#ffffff', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 100 }}>
      {/* Top Bar with Brand and Global Actions */}
      <div className="header-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1.25rem', borderBottom: '1px solid #f3f4f6' }}>
        <div className="brand-badge-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => onSelectTab('home')}>
          <div className="brand-logo" style={{ background: '#2d6a4f', color: '#ffffff', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sprout size={22} />
          </div>
          <div className="brand-titles">
            <h1 className="brand-title" style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#1b4332', letterSpacing: '-0.02em' }}>
              AgroSense AI <span style={{ fontSize: '0.75rem', background: '#d8f3dc', color: '#1b4332', padding: '0.15rem 0.45rem', borderRadius: '50px', verticalAlign: 'middle' }}>v2.0</span>
            </h1>
            <span className="brand-subtitle" style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block' }}>
              {t.appSubtitle}
            </span>
          </div>
        </div>

        <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Audio narration button */}
          {canSpeak && (
            <button
              type="button"
              onClick={onToggleSpeech}
              className={`action-btn audio-btn ${isSpeaking ? 'speaking' : ''}`}
              title={isSpeaking ? t.voiceStop : t.voiceListen}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: isSpeaking ? '#fee2e2' : '#f3f4f6',
                border: isSpeaking ? '1px solid #ef4444' : '1px solid #e5e7eb',
                color: isSpeaking ? '#b91c1c' : '#374151',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {isSpeaking ? (
                <>
                  <VolumeX size={16} />
                  <span className="btn-text">{t.voiceStop}</span>
                </>
              ) : (
                <>
                  <Volume2 size={16} />
                  <span className="btn-text">{t.voiceListen}</span>
                </>
              )}
            </button>
          )}

          {/* Language Switcher Pill */}
          <div className="language-selector" style={{ display: 'inline-flex', background: '#f3f4f6', borderRadius: '8px', padding: '2px', border: '1px solid #e5e7eb' }}>
            <button
              type="button"
              style={{
                padding: '0.35rem 0.65rem',
                border: 'none',
                background: language === 'kn' ? '#2d6a4f' : 'transparent',
                color: language === 'kn' ? '#ffffff' : '#4b5563',
                fontWeight: language === 'kn' ? '700' : '500',
                borderRadius: '6px',
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
              onClick={() => onLanguageChange('kn')}
            >
              ಕನ್ನಡ
            </button>
            <button
              type="button"
              style={{
                padding: '0.35rem 0.65rem',
                border: 'none',
                background: language === 'en' ? '#2d6a4f' : 'transparent',
                color: language === 'en' ? '#ffffff' : '#4b5563',
                fontWeight: language === 'en' ? '700' : '500',
                borderRadius: '6px',
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
              onClick={() => onLanguageChange('en')}
            >
              English
            </button>
            <button
              type="button"
              style={{
                padding: '0.35rem 0.65rem',
                border: 'none',
                background: language === 'hi' ? '#2d6a4f' : 'transparent',
                color: language === 'hi' ? '#ffffff' : '#4b5563',
                fontWeight: language === 'hi' ? '700' : '500',
                borderRadius: '6px',
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
              onClick={() => onLanguageChange('hi')}
            >
              हिंदी
            </button>
          </div>
        </div>
      </div>

      {/* 5-Tab Navigation Bar */}
      <nav className="tab-navigation-bar" style={{ display: 'flex', justifyContent: 'center', background: '#ffffff', overflowX: 'auto', padding: '0 0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', padding: '0.4rem 0' }}>
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectTab(tab.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.6rem 1.15rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: isActive ? '#e8f5e9' : 'transparent',
                  color: isActive ? '#1b4332' : '#6b7280',
                  fontWeight: isActive ? '800' : '600',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  borderBottom: isActive ? '3px solid #2d6a4f' : '3px solid transparent'
                }}
              >
                <span style={{ color: isActive ? '#2d6a4f' : '#9ca3af' }}>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
};
