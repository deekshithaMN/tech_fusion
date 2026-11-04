export type Language = 'kn' | 'en' | 'hi';

export type NavigationTab = 'home' | 'soil' | 'crop' | 'advisory' | 'profile';

export interface LocationProfile {
  state: string;
  district: string;
  taluk: string;
  village: string;
  agroclimaticZone: string;
  agroclimaticZoneKn?: string;
  agroclimaticZoneHi?: string;
  season: 'Kharif' | 'Rabi' | 'Summer';
}

export interface FarmerProfile {
  name: string;
  phone: string;
  preferredLanguage: Language;
  location: LocationProfile;
  totalLandArea: number;
  areaUnit: 'acre' | 'hectare';
  defaultIrrigation: 'drip' | 'sprinkler' | 'furrow';
}

export interface SoilParameterValue {
  value: number | null;
  unit: string;
  method?: string;
  confidence?: number;
  status?: string;
  statusKn?: string;
  statusHi?: string;
  severity?: 'success' | 'warning' | 'danger' | 'info' | 'secondary';
  role?: string;
  roleKn?: string;
  roleHi?: string;
  name?: string;
  symbol?: string;
  kannadaName?: string;
  hindiName?: string;
  amendment?: string;
  fymReq?: string;
  reqFert?: string;
}

export type SoilParametersMap = Record<string, SoilParameterValue>;

export interface SoilReport {
  id: string;
  title: string;
  titleKn?: string;
  titleHi?: string;
  farmerName: string;
  surveyNumber?: string;
  laboratoryName: string;
  reportDate: string;
  reportType: string;
  district: string;
  taluk?: string;
  village?: string;
  parameters: SoilParametersMap;
  confidenceScore: number;
  verificationStatus: 'PENDING_VERIFICATION' | 'FARMER_VERIFIED';
  notes?: string;
  isActive?: boolean;
}

export interface CropStage {
  key: string;
  name: string;
  nameKn: string;
  nameHi: string;
  kc: number;
  duration: number;
  splitN: number;
  splitP: number;
  splitK: number;
}

export interface CropInfo {
  id: string;
  name: string;
  kannadaName: string;
  hindiName: string;
  category: string;
  durationDays: number;
  targetYieldDefault: number;
  yieldUnit: string;
  rdfPerAcre: { n: number; p: number; k: number };
  stages: CropStage[];
  commonDeficiencies: string[];
  specialAdvice: string;
  specialAdviceKn: string;
  specialAdviceHi: string;
}

export interface CropProfile {
  cropId: string;
  farmArea: number;
  areaUnit: 'acre' | 'hectare';
  district: string;
  growthStage: string;
  irrigationMethod: 'drip' | 'sprinkler' | 'furrow';
  targetYield?: number;
}

export interface SoilAnalysisSummary {
  overallHealth: string;
  overallHealthKn: string;
  overallHealthHi: string;
  overallHealthScore: number;
  deficiencies: Array<{
    key: string;
    name: string;
    kannadaName?: string;
    hindiName?: string;
    value: number;
    unit: string;
    status: string;
    severity: string;
  }>;
  excesses: Array<{
    key: string;
    name: string;
    value: number;
    unit: string;
  }>;
  criticalAlerts: Array<{
    parameter: string;
    alert: string;
    alertKn: string;
    alertHi: string;
  }>;
  phCondition: string;
  salinityCondition: string;
  organicCarbonStatus: string;
}

export interface CommercialFertilizer {
  name: string;
  kannadaName: string;
  hindiName: string;
  totalKg: number;
  bagCountText: string;
  nutrientSupplied: string;
  nutrientSuppliedKn: string;
  nutrientSuppliedHi: string;
}

export interface AmendmentItem {
  item: string;
  itemKn: string;
  itemHi: string;
  quantityKg: number;
  bags: string;
  reason: string;
  reasonKn: string;
  reasonHi: string;
  timing: string;
}

export interface ApplicationScheduleItem {
  stageKey: string;
  stageName: string;
  stageNameKn: string;
  stageNameHi: string;
  ureaKg: number;
  dapKg: number;
  potashKg: number;
  potashName: string;
  instructions: string;
  instructionsKn: string;
  instructionsHi: string;
}

export interface FertilizerRecommendation {
  crop: {
    id: string;
    name: string;
    kannadaName: string;
    hindiName: string;
    category: string;
    durationDays: number;
  };
  farmProfile: {
    area: number;
    unit: string;
    areaInAcres: number;
  };
  nutrientRequirements: {
    nKgTotal: number;
    pKgTotal: number;
    kKgTotal: number;
    nKgPerAcre: number;
    pKgPerAcre: number;
    kKgPerAcre: number;
  };
  commercialFertilizers: CommercialFertilizer[];
  amendments: AmendmentItem[];
  applicationSchedule: ApplicationScheduleItem[];
  scientificSource: {
    organization: string;
    handbook: string;
    methodology: string;
    version: string;
  };
}

export interface IrrigationAdvisory {
  crop: {
    name: string;
    stage: string;
    stageKn: string;
    stageHi: string;
    kc: number;
  };
  method: {
    type: string;
    name: string;
    efficiencyPercent: number;
  };
  weather: {
    et0: number;
    forecastRainMm: number;
    tempMax: number;
    tempMin: number;
    humidity: number;
    source: string;
  };
  evapotranspiration: {
    et0_mm: number;
    kc: number;
    etc_mm: number;
    effectiveRain_mm: number;
  };
  waterBalance: {
    netRequirementMm: number;
    grossRequirementMm: number;
    dailyLitresTotal: number;
    cycleLitresTotal: number;
    intervalDays: number;
    litresPerAcrePerDay: number;
  };
  operationalSchedule: {
    shouldIrrigate: boolean;
    actionUrgency: string;
    decisionReason: string;
    decisionReasonKn: string;
    decisionReasonHi: string;
    recommendedSchedule: string;
    recommendedScheduleKn: string;
    recommendedScheduleHi: string;
    pumpDischargeAssumed: string;
  };
  waterConservation: {
    dailySavedLitres: number;
    savingsPercent: number;
  };
  disclaimer: string;
  disclaimerKn: string;
  disclaimerHi: string;
}

export interface AIAdvisoryExplanation {
  language: Language;
  title: string;
  soilHealthSummary: string;
  nutrientAdvice: string;
  irrigationAdvice: string;
  amendmentAdvice: string;
  disclaimer: string;
  voiceNarrationText: string;
}

export interface CropDiagnosis {
  id: string;
  timestamp: string;
  cropName: string;
  cropNameKn: string;
  cropNameHi: string;
  growthStage: string;
  imageUrl?: string;
  symptoms: string[];
  symptomsKn: string[];
  symptomsHi: string[];
  possibleCauses: string[];
  possibleCausesKn: string[];
  possibleCausesHi: string[];
  soilCorrelation: string;
  soilCorrelationKn: string;
  soilCorrelationHi: string;
  actionableRemedy: string;
  actionableRemedyKn: string;
  actionableRemedyHi: string;
  confidenceScore: number;
  uncertaintyWarning: string;
}

// ─── Precision Irrigation Advisory Types ─────────────────────────────────────

export interface IrrigationStageEntry {
  stageKey: string;
  stageName: string;
  kc: number;
  et0_mm: number;
  etc_mm: number;
  grossMm: number;
  dailyLitres: number;
  weeklyLitres: number;
  durationDays: number;
  availableWaterMm: number;
}

export interface SoilTextureProfile {
  key: string;
  name: string;
  description: string;
  whcMmPer100mm: number;
}

export interface StageWiseIrrigationAdvisory {
  cropName: string;
  farmArea: { value: number; unit: string; acres: number };
  irrigationMethod: string;
  efficiency: number;
  soilTexture: SoilTextureProfile;
  et0BaseLine: number;
  timeline: IrrigationStageEntry[];
  currentStage: IrrigationStageEntry;
  totalSeasonalLitres: number;
  weeklyLitres: number;
}

export interface SoilWaterProfile {
  texture: string;
  textureDisplayName: string;
  whcMmPer100mm: number;
  waterHoldingCategory: 'low' | 'moderate' | 'high';
  irrigationFrequencyAdvice: string;
  organicCarbonEffect: string;
}

export interface PdfUploadState {
  status: 'idle' | 'reading' | 'analyzing' | 'done' | 'error';
  progress: number; // 0–100
  errorMessage?: string;
  extractedParams?: Record<string, { value: number | null; unit: string; confidence?: number; status?: string }>;
  reportPreview?: SoilReport;
}
