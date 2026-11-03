// Persistent Client Storage Service for AgroSense AI v2.0
import { FarmerProfile, SoilReport, CropProfile, CropDiagnosis, Language } from '../types';
import { SAMPLES } from '../data/sampleReports';

const KEYS = {
  FARMER: 'agrosense_farmer_v2',
  SOIL_REPORT: 'agrosense_active_soil_v2',
  CROP_PROFILE: 'agrosense_crop_profile_v2',
  DIAGNOSIS_HISTORY: 'agrosense_diagnosis_history_v2',
  LANGUAGE: 'agrosense_language_v2'
};

export const DEFAULT_FARMER: FarmerProfile = {
  name: 'Ningappa Gowda',
  phone: '9845012345',
  preferredLanguage: 'kn',
  location: {
    state: 'Karnataka',
    district: 'Mandya',
    taluk: 'Maddur',
    village: 'Shivalli',
    agroclimaticZone: 'Southern Dry Zone (Zone 6)',
    agroclimaticZoneKn: 'ದಕ್ಷಿಣ ಒಣ ವಲಯ (ವಲಯ 6)',
    agroclimaticZoneHi: 'दक्षिणी शुष्क क्षेत्र (जोन 6)',
    season: 'Kharif'
  },
  totalLandArea: 1.0,
  areaUnit: 'acre',
  defaultIrrigation: 'drip'
};

export const storageService = {
  // 1. Language
  getLanguage(): Language {
    try {
      const stored = localStorage.getItem(KEYS.LANGUAGE);
      if (stored === 'kn' || stored === 'en' || stored === 'hi') return stored;
    } catch (e) {}
    return 'kn';
  },

  setLanguage(lang: Language): void {
    try {
      localStorage.setItem(KEYS.LANGUAGE, lang);
    } catch (e) {}
  },

  // 2. Farmer Profile
  getFarmerProfile(): FarmerProfile {
    try {
      const raw = localStorage.getItem(KEYS.FARMER);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return DEFAULT_FARMER;
  },

  saveFarmerProfile(profile: FarmerProfile): void {
    try {
      localStorage.setItem(KEYS.FARMER, JSON.stringify(profile));
    } catch (e) {}
  },

  // 3. Persistent Soil Report (One-time upload retention)
  getActiveSoilReport(): SoilReport {
    try {
      const raw = localStorage.getItem(KEYS.SOIL_REPORT);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    // Default to the authentic Karnataka Mandya Soil Health Card
    return SAMPLES[1] || SAMPLES[0];
  },

  saveActiveSoilReport(report: SoilReport): void {
    try {
      localStorage.setItem(KEYS.SOIL_REPORT, JSON.stringify({ ...report, isActive: true }));
    } catch (e) {}
  },

  hasCustomSoilReport(): boolean {
    try {
      return !!localStorage.getItem(KEYS.SOIL_REPORT);
    } catch (e) {
      return false;
    }
  },

  // 4. Crop Profile
  getCropProfile(): CropProfile {
    try {
      const raw = localStorage.getItem(KEYS.CROP_PROFILE);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return {
      cropId: 'tomato',
      farmArea: 1.0,
      areaUnit: 'acre',
      district: 'Mandya',
      growthStage: 'flowering',
      irrigationMethod: 'drip'
    };
  },

  saveCropProfile(profile: CropProfile): void {
    try {
      localStorage.setItem(KEYS.CROP_PROFILE, JSON.stringify(profile));
    } catch (e) {}
  },

  // 5. Crop Diagnosis History
  getDiagnosisHistory(): CropDiagnosis[] {
    try {
      const raw = localStorage.getItem(KEYS.DIAGNOSIS_HISTORY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return [];
  },

  saveDiagnosis(diagnosis: CropDiagnosis): void {
    try {
      const history = this.getDiagnosisHistory();
      const updated = [diagnosis, ...history].slice(0, 20); // Keep last 20
      localStorage.setItem(KEYS.DIAGNOSIS_HISTORY, JSON.stringify(updated));
    } catch (e) {}
  }
};
