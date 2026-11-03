import React, { useState } from 'react';
import { 
  User, 
  MapPin, 
  Phone, 
  Globe, 
  Droplets, 
  CheckCircle2, 
  Save, 
  Sprout, 
  ShieldCheck 
} from 'lucide-react';
import { FarmerProfile, Language, LocationProfile } from '../types';
import { I18N } from '../data/i18n';

interface TabProfileProps {
  farmer: FarmerProfile;
  language: Language;
  onSaveProfile: (profile: FarmerProfile) => void;
  onLanguageChange: (lang: Language) => void;
}

const KARNATAKA_DISTRICTS = [
  { name: 'Mandya', zone: 'Southern Dry Zone (Zone 6)', zoneKn: 'ದಕ್ಷಿಣ ಒಣ ವಲಯ (ವಲಯ 6)', zoneHi: 'दक्षिणी शुष्क क्षेत्र (जोन 6)', taluks: ['Maddur', 'Mandya', 'Malavalli', 'Pandavapura', 'Srirangapatna', 'Nagamangala', 'KR Pet'] },
  { name: 'Kolar', zone: 'Eastern Dry Zone (Zone 5)', zoneKn: 'ಪೂರ್ವ ಒಣ ವಲಯ (ವಲಯ 5)', zoneHi: 'पूर्वी शुष्क क्षेत्र (जोन 5)', taluks: ['Kolar', 'Bangarapet', 'Malur', 'Mulbagal', 'Srinivaspur'] },
  { name: 'Bengaluru Rural', zone: 'Eastern Dry Zone (Zone 5)', zoneKn: 'ಪೂರ್ವ ಒಣ ವಲಯ (ವಲಯ 5)', zoneHi: 'पूर्वी शुष्क क्षेत्र (जोन 5)', taluks: ['Devanahalli', 'Doddaballapur', 'Hosakote', 'Nelamangala'] },
  { name: 'Belagavi', zone: 'Northern Dry Zone (Zone 3)', zoneKn: 'ಉತ್ತರ ಒಣ ವಲಯ (ವಲಯ 3)', zoneHi: 'उत्तरी शुष्क क्षेत्र (जोन 3)', taluks: ['Athani', 'Bailhongal', 'Belagavi', 'Chikkodi', 'Gokak', 'Hukkeri', 'Raibag'] },
  { name: 'Mysuru', zone: 'Southern Transition Zone (Zone 7)', zoneKn: 'ದಕ್ಷಿಣ ಸಂಕ್ರಮಣ ವಲಯ (ವಲಯ 7)', zoneHi: 'दक्षिणी संक्रमण क्षेत्र (जोन 7)', taluks: ['Mysuru', 'Hunsur', 'Nanjangud', 'Periyapatna', 'T Narasipura'] },
  { name: 'Hassan', zone: 'Southern Transition Zone (Zone 7)', zoneKn: 'ದಕ್ಷಿಣ ಸಂಕ್ರಮಣ ವಲಯ (ವಲಯ 7)', zoneHi: 'दक्षिणी संक्रमण क्षेत्र (जोन 7)', taluks: ['Alur', 'Arkalgud', 'Arsikere', 'Belur', 'Channarayapatna', 'Hassan', 'Holenarasipura', 'Sakleshpur'] }
];

export const TabProfile: React.FC<TabProfileProps> = ({
  farmer,
  language,
  onSaveProfile,
  onLanguageChange
}) => {
  const t = I18N[language];

  const [name, setName] = useState<string>(farmer.name);
  const [phone, setPhone] = useState<string>(farmer.phone);
  const [district, setDistrict] = useState<string>(farmer.location.district || 'Mandya');
  const [taluk, setTaluk] = useState<string>(farmer.location.taluk || 'Maddur');
  const [village, setVillage] = useState<string>(farmer.location.village || 'Shivalli');
  const [totalLandArea, setTotalLandArea] = useState<number>(farmer.totalLandArea || 1.0);
  const [areaUnit, setAreaUnit] = useState<'acre' | 'hectare'>(farmer.areaUnit || 'acre');
  const [defaultIrrigation, setDefaultIrrigation] = useState<'drip' | 'sprinkler' | 'furrow'>(farmer.defaultIrrigation || 'drip');
  const [season, setSeason] = useState<'Kharif' | 'Rabi' | 'Summer'>(farmer.location.season || 'Kharif');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const currentDistrictObj = KARNATAKA_DISTRICTS.find(d => d.name.toLowerCase() === district.toLowerCase()) || KARNATAKA_DISTRICTS[0];

  const handleDistrictChange = (newDistrict: string) => {
    setDistrict(newDistrict);
    const found = KARNATAKA_DISTRICTS.find(d => d.name === newDistrict);
    if (found && found.taluks.length > 0) {
      setTaluk(found.taluks[0]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedProfile: FarmerProfile = {
      name,
      phone,
      preferredLanguage: language,
      location: {
        state: 'Karnataka',
        district,
        taluk,
        village,
        agroclimaticZone: currentDistrictObj.zone,
        agroclimaticZoneKn: currentDistrictObj.zoneKn,
        agroclimaticZoneHi: currentDistrictObj.zoneHi,
        season
      },
      totalLandArea: Number(totalLandArea) || 1.0,
      areaUnit,
      defaultIrrigation
    };

    onSaveProfile(updatedProfile);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  return (
    <div className="tab-profile-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e9ecef',
        padding: '1.75rem',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div style={{ background: '#e8f5e9', color: '#2d6a4f', padding: '0.6rem', borderRadius: '12px' }}>
            <User size={24} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800', color: '#1b4332' }}>
              {t.profileTitle}
            </h2>
            <p style={{ margin: '0.2rem 0 0 0', color: '#6c757d', fontSize: '0.88rem' }}>
              {t.profileSubtitle}
            </p>
          </div>
        </div>

        {savedSuccess && (
          <div style={{
            marginTop: '1rem',
            background: '#dcfce7',
            border: '1px solid #86efac',
            color: '#166534',
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: '700',
            fontSize: '0.9rem'
          }}>
            <CheckCircle2 size={18} />
            <span>{t.profileSavedSuccess}</span>
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.5rem' }}>

          {/* Section: Personal Info */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#374151', marginBottom: '0.35rem' }}>
                {t.farmerNameLabel} *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#374151', marginBottom: '0.35rem' }}>
                {t.farmerPhoneLabel}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Section: Geographical Location */}
          <div style={{ background: '#f8f9fa', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e9ecef' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem', color: '#1b4332' }}>
              <MapPin size={18} />
              <strong style={{ fontSize: '0.95rem' }}>Geographical Location (Karnataka Pilot)</strong>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#4b5563', marginBottom: '0.3rem' }}>
                  {t.stateLabel}
                </label>
                <input
                  type="text"
                  readOnly
                  value="Karnataka"
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    background: '#e5e7eb',
                    color: '#374151',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#4b5563', marginBottom: '0.3rem' }}>
                  {t.districtLabel} *
                </label>
                <select
                  value={district}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    fontSize: '0.9rem',
                    background: '#ffffff',
                    boxSizing: 'border-box'
                  }}
                >
                  {KARNATAKA_DISTRICTS.map((d) => (
                    <option key={d.name} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#4b5563', marginBottom: '0.3rem' }}>
                  {t.talukLabel}
                </label>
                <select
                  value={taluk}
                  onChange={(e) => setTaluk(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    fontSize: '0.9rem',
                    background: '#ffffff',
                    boxSizing: 'border-box'
                  }}
                >
                  {currentDistrictObj.taluks.map((tName) => (
                    <option key={tName} value={tName}>
                      {tName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#4b5563', marginBottom: '0.3rem' }}>
                  {t.villageLabel}
                </label>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Mapped Agroclimatic Zone Indicator */}
            <div style={{ background: '#e8f5e9', border: '1px solid #b7e4c7', borderRadius: '8px', padding: '0.65rem 0.85rem', fontSize: '0.85rem', color: '#166534' }}>
              <strong>{t.agroclimaticZoneLabel}:</strong> {language === 'kn' ? currentDistrictObj.zoneKn : language === 'hi' ? currentDistrictObj.zoneHi : currentDistrictObj.zone}
            </div>
          </div>

          {/* Section: Farm Holding & Default Irrigation */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#374151', marginBottom: '0.35rem' }}>
                {t.farmAreaLabel}
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={totalLandArea}
                onChange={(e) => setTotalLandArea(parseFloat(e.target.value) || 1.0)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#374151', marginBottom: '0.35rem' }}>
                {t.areaUnitLabel}
              </label>
              <select
                value={areaUnit}
                onChange={(e) => setAreaUnit(e.target.value as 'acre' | 'hectare')}
                style={{
                  width: '100%',
                  padding: '0.65rem',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '0.9rem',
                  background: '#ffffff',
                  boxSizing: 'border-box'
                }}
              >
                <option value="acre">{t.acres}</option>
                <option value="hectare">{t.hectares}</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#374151', marginBottom: '0.35rem' }}>
                {t.defaultIrrigationLabel}
              </label>
              <select
                value={defaultIrrigation}
                onChange={(e) => setDefaultIrrigation(e.target.value as 'drip' | 'sprinkler' | 'furrow')}
                style={{
                  width: '100%',
                  padding: '0.65rem',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '0.9rem',
                  background: '#ffffff',
                  boxSizing: 'border-box'
                }}
              >
                <option value="drip">{t.drip}</option>
                <option value="sprinkler">{t.sprinkler}</option>
                <option value="furrow">{t.furrow}</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#374151', marginBottom: '0.35rem' }}>
                {t.seasonLabel}
              </label>
              <select
                value={season}
                onChange={(e) => setSeason(e.target.value as 'Kharif' | 'Rabi' | 'Summer')}
                style={{
                  width: '100%',
                  padding: '0.65rem',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '0.9rem',
                  background: '#ffffff',
                  boxSizing: 'border-box'
                }}
              >
                <option value="Kharif">Kharif (Monsoon: Jun - Oct)</option>
                <option value="Rabi">Rabi (Winter: Oct - Mar)</option>
                <option value="Summer">Summer (Mar - Jun)</option>
              </select>
            </div>
          </div>

          {/* Section: Language Switcher */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#374151', marginBottom: '0.5rem' }}>
              {t.selectLanguageTitle}
            </label>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {(['kn', 'en', 'hi'] as Language[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => onLanguageChange(l)}
                  style={{
                    padding: '0.65rem 1.25rem',
                    borderRadius: '8px',
                    border: language === l ? '2px solid #2d6a4f' : '1px solid #d1d5db',
                    background: language === l ? '#d8f3dc' : '#ffffff',
                    color: language === l ? '#1b4332' : '#374151',
                    fontWeight: language === l ? '800' : '600',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  {l === 'kn' ? t.kannadaLabel : l === 'hi' ? t.hindiLabel : t.englishLabel}
                </button>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div style={{ marginTop: '1rem' }}>
            <button
              type="submit"
              style={{
                background: '#2d6a4f',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '0.85rem 1.75rem',
                fontWeight: '800',
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(45, 106, 79, 0.3)'
              }}
            >
              <Save size={18} />
              <span>{t.btnSaveProfile}</span>
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};
