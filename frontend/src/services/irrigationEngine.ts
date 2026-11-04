/**
 * AgroSense AI — Local Precision Irrigation Engine v2.1
 * Stage-wise FAO-56 Penman-Monteith based water requirement calculations
 * Soil water holding capacity + texture analysis
 */

import { CROPS_CATALOG } from '../data/cropsData';
import {
  CropProfile,
  SoilParametersMap,
  IrrigationStageEntry,
  StageWiseIrrigationAdvisory,
  SoilWaterProfile,
  SoilTextureProfile,
} from '../types';

// ─── Constants ────────────────────────────────────────────────────────────────

/** Karnataka agro-meteorological baseline ET0 (mm/day) — FAO-56 Zone 5 & 6 */
const ET0_BASELINE = 4.8;

/** Soil texture → water holding capacity (mm per 100mm soil depth) */
const TEXTURE_WHC: Record<string, { whcMmPer100mm: number; name: string; description: string; irrigationTip: string }> = {
  'sandy':        { whcMmPer100mm: 7.5,  name: 'Sandy',        description: 'Very low water holding capacity. Soil dries rapidly.', irrigationTip: 'Apply small amounts frequently (every 1-2 days). Drip irrigation essential.' },
  'sandy loam':   { whcMmPer100mm: 11.5, name: 'Sandy Loam',   description: 'Low-moderate WHC. Moderate drainage rate.', irrigationTip: 'Irrigate every 2-3 days. Drip or sprinkler recommended.' },
  'loam':         { whcMmPer100mm: 15.0, name: 'Loam',         description: 'Good water holding capacity with balanced drainage.', irrigationTip: 'Irrigate every 3-4 days. Any method works well.' },
  'clay loam':    { whcMmPer100mm: 17.5, name: 'Clay Loam',    description: 'Good WHC. Monitor for waterlogging in heavy rainfall.', irrigationTip: 'Irrigate every 4-5 days. Watch for surface ponding.' },
  'clay':         { whcMmPer100mm: 20.0, name: 'Clay',         description: 'Very high WHC but slow drainage and high shrink-swell.', irrigationTip: 'Irrigate slowly and less frequently. Avoid runoff and waterlogging.' },
  'silty loam':   { whcMmPer100mm: 16.5, name: 'Silty Loam',  description: 'Good WHC. May form surface crust when dry.', irrigationTip: 'Break crust before irrigation if needed. 3-4 day intervals.' },
  'black cotton': { whcMmPer100mm: 19.0, name: 'Black Cotton', description: 'High WHC. Expands when wet, cracks when dry (Vertisol).', irrigationTip: 'Apply water slowly. Avoid heavy single applications. Furrow or drip.' },
  'red loam':     { whcMmPer100mm: 13.0, name: 'Red Loam',    description: 'Common in Karnataka Deccan plateau. Moderate WHC.', irrigationTip: 'Drip or sprinkler recommended. Irrigate every 3-4 days.' },
};

/** Irrigation method efficiency */
const IRRIGATION_EFF: Record<string, { eff: number; lph: number; intervalDays: number; name: string }> = {
  drip:      { eff: 0.90, lph: 20000, intervalDays: 2, name: 'Drip Irrigation' },
  sprinkler: { eff: 0.75, lph: 25000, intervalDays: 3, name: 'Sprinkler Irrigation' },
  furrow:    { eff: 0.60, lph: 35000, intervalDays: 6, name: 'Surface / Furrow Irrigation' },
};

// ─── Core Calculation ──────────────────────────────────────────────────────────

function computeStageWaterReq(
  kc: number,
  areaAcres: number,
  eff: number,
  textureKey: string
): {
  etc_mm: number;
  grossMm: number;
  dailyLitres: number;
  weeklyLitres: number;
  availableWaterMm: number;
} {
  const etc = parseFloat((ET0_BASELINE * kc).toFixed(2));
  const grossMm = parseFloat((etc / eff).toFixed(2));
  // 1 mm on 1 acre = 4,047 Litres
  const dailyLitres = Math.round(grossMm * 4047 * areaAcres);
  const weeklyLitres = dailyLitres * 7;

  const whc = TEXTURE_WHC[textureKey] || TEXTURE_WHC['loam'];
  // Available water = WHC × 60cm root depth × 0.5 depletion fraction
  const availableWaterMm = parseFloat((whc.whcMmPer100mm * 6 * 0.5).toFixed(1));

  return { etc_mm: etc, grossMm, dailyLitres, weeklyLitres, availableWaterMm };
}

// ─── Main Export: Stage-wise Irrigation Timeline ───────────────────────────────

export function localComputeStageWiseIrrigation(
  cropProfile: CropProfile,
  soilParams: SoilParametersMap,
  soilTextureOverride?: string
): StageWiseIrrigationAdvisory {
  const crop = CROPS_CATALOG[cropProfile.cropId] || CROPS_CATALOG['tomato'];
  const areaAcres = cropProfile.areaUnit === 'hectare'
    ? cropProfile.farmArea * 2.47105
    : cropProfile.farmArea;

  // Determine soil texture
  let textureKey = (soilTextureOverride || '').toLowerCase().trim();
  if (!TEXTURE_WHC[textureKey]) {
    // Infer from organic carbon
    const oc = Number(soilParams.organicCarbon?.value ?? 0.5);
    if (oc < 0.3) textureKey = 'sandy loam';
    else if (oc < 0.6) textureKey = 'red loam';
    else if (oc < 1.0) textureKey = 'loam';
    else textureKey = 'clay loam';
  }
  const textureInfo = TEXTURE_WHC[textureKey] || TEXTURE_WHC['loam'];

  const methodInfo = IRRIGATION_EFF[cropProfile.irrigationMethod] || IRRIGATION_EFF['drip'];
  const eff = methodInfo.eff;

  // Build full stage timeline
  const timeline: IrrigationStageEntry[] = crop.stages.map(stage => {
    const { etc_mm, grossMm, dailyLitres, weeklyLitres, availableWaterMm } =
      computeStageWaterReq(stage.kc, areaAcres, eff, textureKey);
    return {
      stageKey: stage.key,
      stageName: stage.name,
      kc: stage.kc,
      et0_mm: ET0_BASELINE,
      etc_mm,
      grossMm,
      dailyLitres,
      weeklyLitres,
      durationDays: stage.duration,
      availableWaterMm,
    };
  });

  // Current stage
  const currentStageEntry = timeline.find(t => t.stageKey === cropProfile.growthStage)
    || timeline[1] || timeline[0];

  // Total seasonal water
  const totalSeasonalLitres = timeline.reduce((sum, t) => sum + (t.dailyLitres * t.durationDays), 0);

  const soilTextureProfile: SoilTextureProfile = {
    key: textureKey,
    name: textureInfo.name,
    description: textureInfo.description,
    whcMmPer100mm: textureInfo.whcMmPer100mm,
  };

  return {
    cropName: crop.name,
    farmArea: {
      value: cropProfile.farmArea,
      unit: cropProfile.areaUnit,
      acres: parseFloat(areaAcres.toFixed(2)),
    },
    irrigationMethod: cropProfile.irrigationMethod,
    efficiency: eff,
    soilTexture: soilTextureProfile,
    et0BaseLine: ET0_BASELINE,
    timeline,
    currentStage: currentStageEntry,
    totalSeasonalLitres,
    weeklyLitres: currentStageEntry.weeklyLitres,
  };
}

// ─── Soil Water Profile from Soil Report ──────────────────────────────────────

export function deriveSoilWaterProfile(
  soilParams: SoilParametersMap,
  soilTextureHint?: string
): SoilWaterProfile {
  const oc = Number(soilParams.organicCarbon?.value ?? 0.5);
  const ph = Number(soilParams.ph?.value ?? 7.0);

  let textureKey = (soilTextureHint || '').toLowerCase().trim();
  if (!TEXTURE_WHC[textureKey]) {
    if (oc < 0.3) textureKey = 'sandy loam';
    else if (oc < 0.6) textureKey = 'red loam';
    else if (oc < 1.0) textureKey = 'loam';
    else textureKey = 'clay loam';
  }
  const info = TEXTURE_WHC[textureKey] || TEXTURE_WHC['loam'];
  const whc = info.whcMmPer100mm;

  let waterHoldingCategory: 'low' | 'moderate' | 'high' = 'moderate';
  if (whc < 11) waterHoldingCategory = 'low';
  else if (whc >= 17) waterHoldingCategory = 'high';

  const ocEffect = oc < 0.5
    ? `Low organic carbon (${oc}%) reduces water-holding. Apply FYM/compost to improve.`
    : `Organic carbon (${oc}%) is adequate, supporting good moisture retention.`;

  const phNote = ph > 8.0
    ? ` Alkaline soil (pH ${ph}) may reduce water infiltration. Apply gypsum.`
    : '';

  return {
    texture: textureKey,
    textureDisplayName: info.name,
    whcMmPer100mm: whc,
    waterHoldingCategory,
    irrigationFrequencyAdvice: info.irrigationTip + phNote,
    organicCarbonEffect: ocEffect,
  };
}

// ─── Practical Farmer Instructions Generator ──────────────────────────────────

export function generateIrrigationInstructions(
  advisory: StageWiseIrrigationAdvisory,
  soilProfile: SoilWaterProfile,
  language: 'en' | 'kn' | 'hi',
  forecastRainMm: number = 0
): Array<{ type: 'info' | 'warning' | 'success' | 'action'; text: string }> {
  const instructions: Array<{ type: 'info' | 'warning' | 'success' | 'action'; text: string }> = [];
  const { currentStage, cropName, farmArea, irrigationMethod } = advisory;
  const area = `${farmArea.value} ${farmArea.unit}`;
  const litres = currentStage.dailyLitres.toLocaleString();
  const weekly = currentStage.weeklyLitres.toLocaleString();

  if (language === 'kn') {
    instructions.push({ type: 'info', text: `ನಿಮ್ಮ ${area} ಜಮೀನಿನ ${cropName} ಬೆಳೆ ಈಗ **${currentStage.stageName}** ಹಂತದಲ್ಲಿದೆ (Kc = ${currentStage.kc}).` });
    instructions.push({ type: 'action', text: `ಪ್ರತಿ ದಿನ ಸರಿಸುಮಾರು **${litres} ಲೀಟರ್** ನೀರು ಬೇಕಾಗುತ್ತದೆ. ಈ ವಾರ ಒಟ್ಟು **${weekly} ಲೀಟರ್** ಒದಗಿಸಿ.` });
    if (soilProfile.waterHoldingCategory === 'low') {
      instructions.push({ type: 'warning', text: `ನಿಮ್ಮ ಮಣ್ಣಿನ ನೀರು ಹಿಡಿದಿಟ್ಟುಕೊಳ್ಳುವ ಸಾಮರ್ಥ್ಯ ಕಡಿಮೆ (${soilProfile.textureDisplayName}). ಸಣ್ಣ ಪ್ರಮಾಣದ ನೀರನ್ನು ಆಗಾಗ ಹಾಯಿಸಿ.` });
    }
    if (forecastRainMm > 10) {
      instructions.push({ type: 'success', text: `ನಾಳೆ ${forecastRainMm} ಮಿ.ಮೀ ಮಳೆ ನಿರೀಕ್ಷಿಸಲಾಗಿದೆ. ತೇವಾಂಶ ಸಾಕಷ್ಟಿದ್ದರೆ ಇಂದಿನ ನೀರಾವರಿ ಮುಂದೂಡಿ.` });
    }
    instructions.push({ type: 'info', text: `${soilProfile.irrigationFrequencyAdvice}` });
    instructions.push({ type: 'info', text: soilProfile.organicCarbonEffect });
  } else if (language === 'hi') {
    instructions.push({ type: 'info', text: `आपके ${area} खेत में ${cropName} फसल अभी **${currentStage.stageName}** अवस्था में है (Kc = ${currentStage.kc}).` });
    instructions.push({ type: 'action', text: `प्रतिदिन लगभग **${litres} लीटर** पानी की आवश्यकता है। इस सप्ताह कुल **${weekly} लीटर** सिंचाई करें।` });
    if (soilProfile.waterHoldingCategory === 'low') {
      instructions.push({ type: 'warning', text: `आपकी मिट्टी (${soilProfile.textureDisplayName}) में पानी ज़्यादा देर नहीं ठहरता। थोड़ा-थोड़ा और बार-बार सिंचाई करें।` });
    }
    if (forecastRainMm > 10) {
      instructions.push({ type: 'success', text: `कल ${forecastRainMm} मिमी वर्षा का अनुमान है। यदि नमी पर्याप्त हो तो आज की सिंचाई टाल सकते हैं।` });
    }
    instructions.push({ type: 'info', text: soilProfile.irrigationFrequencyAdvice });
    instructions.push({ type: 'info', text: soilProfile.organicCarbonEffect });
  } else {
    instructions.push({ type: 'info', text: `Your ${area} ${cropName} field is currently in the **${currentStage.stageName}** stage (Kc = ${currentStage.kc}).` });
    instructions.push({ type: 'action', text: `Recommended daily water requirement: **${litres} Litres/day**. This week's total: **${weekly} Litres**.` });
    if (soilProfile.waterHoldingCategory === 'low') {
      instructions.push({ type: 'warning', text: `Your soil (${soilProfile.textureDisplayName}) has low water-holding capacity. Apply smaller, more frequent irrigations to avoid stress.` });
    } else if (soilProfile.waterHoldingCategory === 'high') {
      instructions.push({ type: 'warning', text: `Your ${soilProfile.textureDisplayName} soil holds water well. Avoid over-irrigation — monitor for waterlogging between cycles.` });
    }
    if (forecastRainMm > 10) {
      instructions.push({ type: 'success', text: `Rainfall of ${forecastRainMm} mm forecast tomorrow. Consider postponing irrigation if soil moisture appears sufficient.` });
    } else if (forecastRainMm > 0) {
      instructions.push({ type: 'info', text: `Light rainfall (${forecastRainMm} mm) expected. This is insufficient for irrigation skip — proceed with schedule.` });
    }
    instructions.push({ type: 'info', text: soilProfile.irrigationFrequencyAdvice });
    instructions.push({ type: 'info', text: soilProfile.organicCarbonEffect });

    // Stage-specific advice
    if (currentStage.kc >= 1.0) {
      instructions.push({ type: 'warning', text: `Peak water demand stage (Kc ${currentStage.kc}). Do NOT let soil dry out during this critical period — water stress now severely impacts yield.` });
    } else if (currentStage.kc < 0.5) {
      instructions.push({ type: 'info', text: `Early/late stage with lower water demand (Kc ${currentStage.kc}). Moderate irrigation is sufficient. Avoid waterlogging.` });
    }
    instructions.push({ type: 'action', text: `Next irrigation: Use ${irrigationMethod} system. Apply ${currentStage.grossMm} mm gross water depth per session.` });
  }

  return instructions;
}
