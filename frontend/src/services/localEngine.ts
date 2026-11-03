import { CROPS_CATALOG } from '../data/cropsData';
import { PARAM_DEFINITIONS } from '../data/standardsData';
import {
  SoilParametersMap,
  SoilAnalysisSummary,
  FertilizerRecommendation,
  IrrigationAdvisory,
  CropProfile,
  AIAdvisoryExplanation,
  Language
} from '../types';

export function localAnalyzeSoil(parameters: SoilParametersMap): SoilAnalysisSummary {
  const deficiencies: SoilAnalysisSummary['deficiencies'] = [];
  const excesses: SoilAnalysisSummary['excesses'] = [];
  const criticalAlerts: SoilAnalysisSummary['criticalAlerts'] = [];

  let phCondition = 'Normal';
  let salinityCondition = 'Normal';
  let organicCarbonStatus = 'Sufficient';

  let penalty = 0;

  for (const [key, def] of Object.entries(PARAM_DEFINITIONS)) {
    const p = parameters[key];
    const val = p?.value !== null && p?.value !== undefined ? Number(p.value) : null;
    if (val === null || isNaN(val)) continue;

    const interp = def.interpret(val);

    if (key === 'ph') {
      phCondition = interp.status;
      if (val < 5.5 || val > 8.5) {
        penalty += 15;
        criticalAlerts.push({
          parameter: 'pH',
          alert: val < 5.5 ? 'Soil is Strongly Acidic (pH < 5.5). Apply Agricultural Lime.' : 'Soil is Strongly Alkaline (pH > 8.5). Apply Agricultural Gypsum.',
          alertKn: val < 5.5 ? 'ಮಣ್ಣು ತೀವ್ರ ಆಮ್ಲೀಯವಾಗಿದೆ (pH < 5.5). ಕೃಷಿ ಸುಣ್ಣ ಬಳಸಿ.' : 'ಮಣ್ಣು ತೀವ್ರ ಕ್ಷಾರೀಯವಾಗಿದೆ (pH > 8.5). ಜಿಪ್ಸಮ್ ಬಳಸಿ.',
          alertHi: val < 5.5 ? 'मृदा अत्यधिक अम्लीय है। चूना प्रयोग करें।' : 'मृदा अत्यधिक क्षारीय है। जिप्सम प्रयोग करें।'
        });
      }
    } else if (key === 'ec') {
      salinityCondition = interp.status;
      if (val > 2.0) {
        penalty += 15;
        criticalAlerts.push({
          parameter: 'EC',
          alert: 'Soil salinity is elevated (> 2.0 dS/m). Avoid MOP, use SOP.',
          alertKn: 'ಮಣ್ಣಿನಲ್ಲಿ ಲವಣಾಂಶ ಹೆಚ್ಚಿದೆ (> 2.0 dS/m). ಸಲ್ಫೇಟ್ ಆಫ್ ಪೊಟ್ಯಾಶ್ (SOP) ಬಳಸಿ.',
          alertHi: 'लवणता अधिक है। सल्फेट युक्त खाद का प्रयोग करें।'
        });
      }
    } else if (key === 'organicCarbon') {
      organicCarbonStatus = interp.status;
      if (val < 0.50) {
        penalty += 10;
        criticalAlerts.push({
          parameter: 'Organic Carbon',
          alert: 'Organic Carbon is low (< 0.50%). Apply 5-10 tonnes FYM/acre.',
          alertKn: 'ಸಾವಯವ ಇಂಗಾಲ ಕೊರತೆಯಿದೆ (< 0.50%). ಸೆಗಣಿ ಗೊಬ್ಬರ ಅಥವಾ ಕಾಂಪೋಸ್ಟ್ ಹಾಕಿ.',
          alertHi: 'जैविक कार्बन कम है। गोबर खाद डालें।'
        });
      }
    } else {
      if (interp.status.includes('Low') || interp.status === 'Deficient') {
        penalty += 8;
        deficiencies.push({
          key,
          name: def.name,
          kannadaName: def.kannadaName,
          hindiName: def.hindiName,
          value: val,
          unit: def.unit,
          status: interp.status,
          severity: 'warning'
        });
      } else if (interp.status.includes('High') || interp.status.includes('Excessive')) {
        excesses.push({
          key,
          name: def.name,
          value: val,
          unit: def.unit
        });
      }
    }
  }

  const score = Math.max(35, Math.min(100, 100 - penalty));

  return {
    overallHealthScore: score,
    overallHealth: score >= 80 ? 'Good / Fertile Soil' : score >= 60 ? 'Moderate / Requires Nutrient Attention' : 'Degraded / Severe Nutrient Starvation',
    overallHealthKn: score >= 80 ? 'ಉತ್ತಮ / ಫಲವತ್ತಾದ ಮಣ್ಣು' : score >= 60 ? 'ಮಧ್ಯಮ / ಪೋಷಕಾಂಶಗಳ ಸಮತೋಲನ ಅಗತ್ಯ' : 'ಬಡ ಮಣ್ಣು / ತೀವ್ರ ಕೊರತೆಗಳನ್ನು ಸರಿಪಡಿಸಬೇಕು',
    overallHealthHi: score >= 80 ? 'उत्कृष्ट / उपजाऊ मृदा' : score >= 60 ? 'मध्यम / पोषक तत्व प्रबंधन आवश्यक' : 'अल्प उपजाऊ / त्वरित सुधार आवश्यक',
    deficiencies,
    excesses,
    criticalAlerts,
    phCondition,
    salinityCondition,
    organicCarbonStatus
  };
}

export function localRecommendNutrients(
  cropProfile: CropProfile,
  parameters: SoilParametersMap
): FertilizerRecommendation {
  const crop = CROPS_CATALOG[cropProfile.cropId] || CROPS_CATALOG['tomato'];
  const areaInAcres = cropProfile.areaUnit === 'hectare' ? cropProfile.farmArea * 2.47105 : cropProfile.farmArea;

  const nVal = Number(parameters.nitrogen?.value ?? 200);
  const pVal = Number(parameters.phosphorus?.value ?? 30);
  const kVal = Number(parameters.potassium?.value ?? 130);
  const phVal = Number(parameters.ph?.value ?? 7.2);
  const ecVal = Number(parameters.ec?.value ?? 0.5);
  const ocVal = Number(parameters.organicCarbon?.value ?? 0.4);
  const znVal = Number(parameters.zinc?.value ?? 0.5);
  const bVal = Number(parameters.boron?.value ?? 0.4);

  const nFactor = nVal < 280 ? 1.25 : nVal > 560 ? 0.75 : 1.0;
  const pFactor = pVal < 23 ? 1.25 : pVal > 56 ? 0.75 : 1.0;
  const kFactor = kVal < 145 ? 1.25 : kVal > 337 ? 0.75 : 1.0;

  const nPerAcre = Math.round(crop.rdfPerAcre.n * nFactor);
  const pPerAcre = Math.round(crop.rdfPerAcre.p * pFactor);
  const kPerAcre = Math.round(crop.rdfPerAcre.k * kFactor);

  const totalN = Math.round(nPerAcre * areaInAcres);
  const totalP = Math.round(pPerAcre * areaInAcres);
  const totalK = Math.round(kPerAcre * areaInAcres);

  // Conversions
  const dapKg = Math.round(totalP / 0.46);
  const nFromDap = Math.round(dapKg * 0.18);
  const remN = Math.max(0, totalN - nFromDap);
  const ureaKg = Math.round(remN / 0.46);

  const isSaline = ecVal > 1.8;
  const potKg = isSaline ? Math.round(totalK / 0.50) : Math.round(totalK / 0.60);
  const potName = isSaline ? 'Sulphate of Potash (SOP 50% K2O)' : 'Muriate of Potash (MOP 60% K2O)';
  const potNameKn = isSaline ? 'ಸಲ್ಫೇಟ್ ಆಫ್ ಪೊಟ್ಯಾಶ್ (SOP)' : 'ಮ್ಯೂರಿಯೇಟ್ ಆಫ್ ಪೊಟ್ಯಾಶ್ (MOP)';
  const potNameHi = isSaline ? 'सल्फेट ऑफ पोटाश (SOP)' : 'म्यूरेट ऑफ पोटाश (MOP)';

  const amendments: FertilizerRecommendation['amendments'] = [];

  if (phVal < 6.0) {
    const limeKg = Math.round(600 * areaInAcres);
    amendments.push({
      item: 'Agricultural Lime (CaCO3)',
      itemKn: 'ಕೃಷಿ ಸುಣ್ಣ (Lime)',
      itemHi: 'कृषि चूना',
      quantityKg: limeKg,
      bags: `${(limeKg / 50).toFixed(1)} bags (50kg)`,
      reason: `Acidic soil (pH ${phVal}). Liming neutralizes acidity and mobilizes phosphorus.`,
      reasonKn: `ಆಮ್ಲೀಯ ಮಣ್ಣು (pH ${phVal}). ಸುಣ್ಣವು ಆಮ್ಲತೆಯನ್ನು ಕಡಿಮೆ ಮಾಡಿ ರಂಜಕದ ಲಭ್ಯತೆ ಹೆಚ್ಚಿಸುತ್ತದೆ.`,
      reasonHi: `अम्लीय मिट्टी (pH ${phVal})। चूना डालने से अम्लता दूर होती है।`,
      timing: 'Apply 3-4 weeks before planting'
    });
  } else if (phVal > 8.2) {
    const gypKg = Math.round(800 * areaInAcres);
    amendments.push({
      item: 'Agricultural Gypsum (CaSO4·2H2O)',
      itemKn: 'ಕೃಷಿ ಜಿಪ್ಸಮ್ (Gypsum)',
      itemHi: 'कृषि जिप्सम',
      quantityKg: gypKg,
      bags: `${(gypKg / 50).toFixed(1)} bags (50kg)`,
      reason: `Alkaline/sodic soil (pH ${phVal}). Gypsum supplies Calcium to displace harmful Sodium.`,
      reasonKn: `ಕ್ಷಾರೀಯ ಮಣ್ಣು (pH ${phVal}). ಜಿಪ್ಸಮ್ ಮಣ್ಣಿನ ಸೋಡಿಯಂ ಕರಗಿಸಿ ರಚನೆ ಸುಧಾರಿಸುತ್ತದೆ.`,
      reasonHi: `क्षारीय मिट्टी (pH ${phVal})। जिप्सम से सोडियम का हानिकारक प्रभाव कम होता है।`,
      timing: 'Incorporate during deep tillage'
    });
  }

  if (ocVal < 0.50) {
    const fym = (4 * areaInAcres).toFixed(1);
    amendments.push({
      item: 'Farm Yard Manure (FYM) / Compost',
      itemKn: 'ಕೊಳೆತ ಕೊಟ್ಟಿಗೆ ಗೊಬ್ಬರ / ಎರೆಹುಳು ಗೊಬ್ಬರ',
      itemHi: 'गोबर खाद या कम्पोस्ट',
      quantityKg: Math.round(Number(fym) * 1000),
      bags: `${fym} tonnes (~${Math.round(Number(fym) * 2)} tractor loads)`,
      reason: `Deficient Organic Carbon (${ocVal}%). Crucial for microbial life and water retention.`,
      reasonKn: `ಸಾವಯವ ಇಂಗಾಲ ಕೊರತೆ (${ocVal}%). ಮಣ್ಣಿನ ಜೀವಾಂಶ ಮತ್ತು ತೇವಾಂಶ ಧಾರಣೆಗೆ ಅಗತ್ಯ.`,
      reasonHi: `जैविक कार्बन की कमी (${ocVal}%)। मिट्टी की ताकत के लिए जरूरी।`,
      timing: '2-3 weeks before sowing'
    });
  }

  if (znVal < 0.60) {
    const znKg = Math.round(10 * areaInAcres);
    amendments.push({
      item: 'Zinc Sulphate (ZnSO4 21%)',
      itemKn: 'ಜಿಂಕ್ ಸಲ್ಫೇಟ್ (Zinc Sulphate 21%)',
      itemHi: 'जिंक सल्फेट (21%)',
      quantityKg: znKg,
      bags: `${znKg} kg`,
      reason: `Zinc deficient (${znVal} ppm). Vital for crop hormones and leaf elongation.`,
      reasonKn: `ಸತು ಕೊರತೆಯಿದೆ (${znVal} ppm). ಎಲೆಗಳ ಸಸ್ಯ ಬೆಳವಣಿಗೆಯ ಹಾರ್ಮೋನ್‌ಗೆ ಅತ್ಯಗತ್ಯ.`,
      reasonHi: `जिंक की कमी (${znVal} ppm)। पौधों की बढ़वार के लिए जरूरी।`,
      timing: 'Basal soil application'
    });
  }

  if (bVal < 0.50) {
    const bKg = Math.round(4 * areaInAcres);
    amendments.push({
      item: 'Borax (11% Boron)',
      itemKn: 'ಬೋರಾಕ್ಸ್ (Borax 11%)',
      itemHi: 'बोरेक्स (11%)',
      quantityKg: bKg,
      bags: `${bKg} kg`,
      reason: `Boron deficient (${bVal} ppm). Prevents flower drop and fruit cracking.`,
      reasonKn: `ಬೋರಾನ್ ಕೊರತೆಯಿದೆ (${bVal} ppm). ಹೂ ಉದುರುವುದು ಮತ್ತು ಹಣ್ಣು ಬಿರುಕು ಬಿಡುವುದನ್ನು ತಡೆಯುತ್ತದೆ.`,
      reasonHi: `बोरोन की कमी (${bVal} ppm)। फूल व फल झड़ने से रोकता है।`,
      timing: 'Basal application or foliar spray at flowering'
    });
  }

  const applicationSchedule = crop.stages.map(st => ({
    stageKey: st.key,
    stageName: st.name,
    stageNameKn: st.nameKn,
    stageNameHi: st.nameHi,
    ureaKg: Math.round(ureaKg * st.splitN),
    dapKg: Math.round(dapKg * st.splitP),
    potashKg: Math.round(potKg * st.splitK),
    potashName: potName,
    instructions: st.key === 'basal'
      ? 'Incorporate DAP, Potash and 50% Urea into soil beds during land preparation.'
      : 'Top-dress Urea and Potash 5-10 cm away from plant stem and irrigate immediately.',
    instructionsKn: st.key === 'basal'
      ? 'ನಾಟಿ ಸಮಯದಲ್ಲಿ ಡಿಎಪಿ, ಪೊಟ್ಯಾಶ್ ಮತ್ತು ನಿಗದಿತ ಯೂರಿಯಾವನ್ನು ಮಣ್ಣಿನಲ್ಲಿ ಚೆನ್ನಾಗಿ ಬೆರೆಸಿ.'
      : 'ಗಿಡದ ಬುಡದಿಂದ 5-10 ಸೆಂ.ಮೀ ದೂರದಲ್ಲಿ ಗೊಬ್ಬರ ಹಾಕಿ ತಕ್ಷಣ ನೀರು ಹಾಯಿಸಿ.',
    instructionsHi: st.key === 'basal'
      ? 'बुवाई/रोपाई के समय डीएपी, पोटाश और यूरिया मिट्टी में मिलाएं।'
      : 'जड़ से कुछ दूर खाद डालें और तुरंत हल्की सिंचाई करें।'
  }));

  return {
    crop: {
      id: crop.id,
      name: crop.name,
      kannadaName: crop.kannadaName,
      hindiName: crop.hindiName,
      category: crop.category,
      durationDays: crop.durationDays
    },
    farmProfile: {
      area: cropProfile.farmArea,
      unit: cropProfile.areaUnit,
      areaInAcres: parseFloat(areaInAcres.toFixed(2))
    },
    nutrientRequirements: {
      nKgTotal: totalN,
      pKgTotal: totalP,
      kKgTotal: totalK,
      nKgPerAcre: nPerAcre,
      pKgPerAcre: pPerAcre,
      kKgPerAcre: kPerAcre
    },
    commercialFertilizers: [
      {
        name: 'Urea (46% N)',
        kannadaName: 'ಯೂರಿಯಾ (Urea 46% N)',
        hindiName: 'यूरिया (Urea 46% N)',
        totalKg: ureaKg,
        bagCountText: `${(ureaKg / 45).toFixed(1)} Bags (45 kg each)`,
        nutrientSupplied: `Supplies ${remN} kg net Nitrogen`,
        nutrientSuppliedKn: `${remN} ಕೆಜಿ ನಿವ್ವಳ ಸಾರಜನಕ ಒದಗಿಸುತ್ತದೆ`,
        nutrientSuppliedHi: `${remN} किग्रा शुद्ध नाइट्रोजन प्रदान करता है`
      },
      {
        name: 'Di-Ammonium Phosphate (DAP 18-46-0)',
        kannadaName: 'ಡಿಎಪಿ (DAP 18:46:0)',
        hindiName: 'डीएपी (DAP 18:46:0)',
        totalKg: dapKg,
        bagCountText: `${(dapKg / 50).toFixed(1)} Bags (50 kg each)`,
        nutrientSupplied: `Supplies ${totalP} kg P2O5 and ${nFromDap} kg starter Nitrogen`,
        nutrientSuppliedKn: `${totalP} ಕೆಜಿ ರಂಜಕ ಮತ್ತು ${nFromDap} ಕೆಜಿ ಸಾರಜನಕ ಒದಗಿಸುತ್ತದೆ`,
        nutrientSuppliedHi: `${totalP} किग्रा फास्फोरस और ${nFromDap} किग्रा नाइट्रोजन प्रदान करता है`
      },
      {
        name: potName,
        kannadaName: potNameKn,
        hindiName: potNameHi,
        totalKg: potKg,
        bagCountText: `${(potKg / 50).toFixed(1)} Bags (50 kg each)`,
        nutrientSupplied: `Supplies ${totalK} kg K2O Potash`,
        nutrientSuppliedKn: `${totalK} ಕೆಜಿ ಪೊಟ್ಯಾಶ್ ಒದಗಿಸುತ್ತದೆ`,
        nutrientSuppliedHi: `${totalK} किग्रा पोटाश प्रदान करता है`
      }
    ],
    amendments,
    applicationSchedule,
    scientificSource: {
      organization: 'University of Agricultural Sciences (UAS), Bengaluru & ICAR',
      handbook: 'Package of Practices for Horticultural / Agricultural Crops of Karnataka',
      methodology: 'Soil Test Crop Response (STCR) Equations',
      version: '2025-2026 Edition'
    }
  };
}

export function localRecommendIrrigation(
  cropProfile: CropProfile
): IrrigationAdvisory {
  const crop = CROPS_CATALOG[cropProfile.cropId] || CROPS_CATALOG['tomato'];
  const areaInAcres = cropProfile.areaUnit === 'hectare' ? cropProfile.farmArea * 2.47105 : cropProfile.farmArea;

  const stage = crop.stages.find(s => s.key === cropProfile.growthStage) || crop.stages[1] || { kc: 0.85, name: 'Vegetative Growth', nameKn: 'ಬೆಳವಣಿಗೆ', nameHi: 'वृद्धि' };
  const kc = stage.kc;

  const et0 = 4.8; // mm/day baseline for Karnataka
  const etc = parseFloat((et0 * kc).toFixed(2));
  const pe = 0.0;
  const netMm = Math.max(0, etc - pe);

  const effMap = {
    drip: { eff: 0.90, name: 'Drip Irrigation (ಹನಿ ನೀರಾವರಿ)', rate: 20000, days: 2 },
    sprinkler: { eff: 0.75, name: 'Sprinkler Irrigation (ತುಂತುರು)', rate: 25000, days: 3 },
    furrow: { eff: 0.60, name: 'Surface Flood (ಕಾಲುವೆ ನೀರಾವರಿ)', rate: 35000, days: 6 }
  };
  const m = effMap[cropProfile.irrigationMethod] || effMap['drip'];
  const grossMm = parseFloat((netMm / m.eff).toFixed(2));

  // 1 mm on 1 acre = 4,047 Litres
  const dailyLitres = Math.round(grossMm * 4047 * areaInAcres);
  const cycleLitres = dailyLitres * m.days;

  const runtimeHours = cycleLitres / m.rate;
  const hrs = Math.floor(runtimeHours);
  const mins = Math.round((runtimeHours - hrs) * 60);

  // Water savings vs flood
  const floodGross = netMm / 0.60;
  const floodDaily = Math.round(floodGross * 4047 * areaInAcres);
  const savedLitres = Math.max(0, floodDaily - dailyLitres);
  const savingsPct = Math.round(((floodDaily - dailyLitres) / floodDaily) * 100);

  return {
    crop: {
      name: crop.name,
      stage: stage.name,
      stageKn: stage.nameKn,
      stageHi: stage.nameHi,
      kc: kc
    },
    method: {
      type: cropProfile.irrigationMethod,
      name: m.name,
      efficiencyPercent: Math.round(m.eff * 100)
    },
    weather: {
      et0,
      forecastRainMm: 0,
      tempMax: 31,
      tempMin: 21,
      humidity: 60,
      source: 'Agro-Meteorological Baseline (Open-Meteo Zone 5 & 6 Karnataka)'
    },
    evapotranspiration: {
      et0_mm: et0,
      kc,
      etc_mm: etc,
      effectiveRain_mm: pe
    },
    waterBalance: {
      netRequirementMm: netMm,
      grossRequirementMm: grossMm,
      dailyLitresTotal: dailyLitres,
      cycleLitresTotal: cycleLitres,
      intervalDays: m.days,
      litresPerAcrePerDay: Math.round(grossMm * 4047)
    },
    operationalSchedule: {
      shouldIrrigate: true,
      actionUrgency: 'Recommended',
      decisionReason: `Transpiration water demand is ${etc} mm/day during ${stage.name}. Scheduled application recommended.`,
      decisionReasonKn: `${stage.nameKn} ಹಂತದಲ್ಲಿ ದಿನಕ್ಕೆ ${etc} ಮಿ.ಮೀ ನೀರು ಬೇಕಾಗುತ್ತದೆ. ನಿಗದಿತ ನೀರು ಒದಗಿಸಿ.`,
      decisionReasonHi: `${stage.nameHi} में ${etc} मिमी/दिन जल मांग है। संस्तुत सिंचाई करें।`,
      recommendedSchedule: `${hrs}h ${mins}m pump run every ${m.days} days`,
      recommendedScheduleKn: `ಪ್ರತಿ ${m.days} ದಿನಗಳಿಗೊಮ್ಮೆ ${hrs} ಗಂಟೆ ${mins} ನಿಮಿಷ ನೀರು ಹಾಯಿಸಿ`,
      recommendedScheduleHi: `प्रत्येक ${m.days} दिन में ${hrs} घंटे ${mins} मिनट पंप चलाएं`,
      pumpDischargeAssumed: `${(m.rate / 1000).toFixed(0)},000 L/hr (3 HP pump)`
    },
    waterConservation: {
      dailySavedLitres: savedLitres,
      savingsPercent: savingsPct > 0 ? savingsPct : 0
    },
    disclaimer: 'Notice: A soil test measures chemical fertility and texture, not instantaneous moisture. This precision advisory is a model-based evapotranspiration calculation.',
    disclaimerKn: 'ಗಮನಿಸಿ: ಮಣ್ಣು ಪರೀಕ್ಷಾ ವರದಿಯು ಫಲವತ್ತತೆಯನ್ನು ಅಳೆಯುತ್ತದೆ, ತತ್ಕ್ಷಣದ ತೇವಾಂಶವನ್ನಲ್ಲ. ಈ ನೀರಾವರಿ ಸಲಹೆಯು ಹವಾಮಾನ ಮತ್ತು ಬೆಳೆಯ ನೀರಿನ ಬೇಡಿಕೆಯ ಮಾದರಿಯನ್ನು ಆಧರಿಸಿದೆ.',
    disclaimerHi: 'सूचना: मृदा परीक्षण रिपोर्ट रासायनिक तत्वों की होती है, तात्कालिक नमी की नहीं। यह सलाह मौसम व वाष्पोत्सर्जन मॉडल पर आधारित है।'
  };
}

export function localGenerateAdvisoryExplanation(
  lang: Language,
  cropProfile: CropProfile,
  soilAnalysis: SoilAnalysisSummary,
  nutrientRec: FertilizerRecommendation,
  irrigationRec: IrrigationAdvisory
): AIAdvisoryExplanation {
  const crop = CROPS_CATALOG[cropProfile.cropId] || CROPS_CATALOG['tomato'];
  const area = cropProfile.farmArea;
  const areaUnit = cropProfile.areaUnit;

  if (lang === 'kn') {
    const soilStory = `ನಿಮ್ಮ ${area} ${areaUnit === 'acre' ? 'ಎಕರೆ' : 'ಹೆಕ್ಟೇರ್'} ಜಮೀನಿನ ಮಣ್ಣಿನ ಪರೀಕ್ಷಾ ವರದಿಯನ್ನು ಕೃಷಿ ವಿಜ್ಞಾನ ಕೇಂದ್ರದ ಮಾನದಂಡಗಳ ಪ್ರಕಾರ ಪರಿಶೀಲಿಸಲಾಗಿದೆ. ಒಟ್ಟಾರೆ ಮಣ್ಣಿನ ಫಲವತ್ತತೆಯ ಅಂಕ ${soilAnalysis.overallHealthScore}/100 ಆಗಿದೆ (${soilAnalysis.overallHealthKn}).`;
    const ferts = nutrientRec.commercialFertilizers;
    const nutrientStory = `${crop.kannadaName} ಬೆಳೆಗೆ ಅಧಿಕ ಇಳುವರಿ ಪಡೆಯಲು:\n- ${ferts[0]?.kannadaName}: ${ferts[0]?.totalKg} ಕೆಜಿ (${ferts[0]?.bagCountText})\n- ${ferts[1]?.kannadaName}: ${ferts[1]?.totalKg} ಕೆಜಿ (${ferts[1]?.bagCountText})\n- ${ferts[2]?.kannadaName}: ${ferts[2]?.totalKg} ಕೆಜಿ (${ferts[2]?.bagCountText})`;
    const irrigationStory = `ನಿಖರ ನೀರಾವರಿ: ದಿನಕ್ಕೆ ಸುಮಾರು ${irrigationRec.waterBalance.dailyLitresTotal.toLocaleString()} ಲೀಟರ್ ನೀರು ಅಗತ್ಯವಿದೆ. ಶಿಫಾರಸು: ${irrigationRec.operationalSchedule.recommendedScheduleKn}.`;
    const amendmentStory = nutrientRec.amendments.length > 0
      ? `ಮಣ್ಣಿನ ಸುಧಾರಣೆ: ${nutrientRec.amendments.map(a => `${a.itemKn} (${a.bags}) - ${a.reasonKn}`).join('; ')}.`
      : `ಮಣ್ಣಿನ pH ಮತ್ತು ಸಾವಯವ ಮಟ್ಟ ಸಾಮಾನ್ಯವಾಗಿದೆ.`;

    return {
      language: 'kn',
      title: `${crop.kannadaName} ಬೆಳೆಗಾರರಿಗೆ ಅಧಿಕೃತ ಕೃಷಿ ಸಲಹಾ ವರದಿ`,
      soilHealthSummary: soilStory,
      nutrientAdvice: nutrientStory,
      irrigationAdvice: irrigationStory,
      amendmentAdvice: amendmentStory,
      disclaimer: 'ಗಮನಿಸಿ: ಈ ಸಲಹೆಯು ಯು.ಎ.ಎಸ್ ಬೆಂಗಳೂರು ಪ್ಯಾಕೇಜ್ ಆಫ್ ಪ್ರಾಕ್ಟೀಸಸ್ ಮತ್ತು ಐ.ಸಿ.ಎ.ಆರ್ ಪದ್ಧತಿಯನ್ನು ಆಧರಿಸಿದೆ.',
      voiceNarrationText: `${soilStory} ${nutrientStory} ${irrigationStory}`
    };
  } else if (lang === 'hi') {
    const soilStory = `आपके ${area} ${areaUnit === 'acre' ? 'एकड़' : 'हेक्टेयर'} खेत की मृदा रिपोर्ट का विश्लेषण किया गया है। मिट्टी का स्वास्थ्य स्कोर ${soilAnalysis.overallHealthScore}/100 है (${soilAnalysis.overallHealthHi})।`;
    const ferts = nutrientRec.commercialFertilizers;
    const nutrientStory = `${crop.hindiName} की भरपूर पैदावार के लिए संतुलित उर्वरक:\n- ${ferts[0]?.hindiName}: ${ferts[0]?.totalKg} किग्रा (${ferts[0]?.bagCountText})\n- ${ferts[1]?.hindiName}: ${ferts[1]?.totalKg} किग्रा (${ferts[1]?.bagCountText})\n- ${ferts[2]?.hindiName}: ${ferts[2]?.totalKg} किग्रा (${ferts[2]?.bagCountText})`;
    const irrigationStory = `सटीक सिंचाई: प्रतिदिन लगभग ${irrigationRec.waterBalance.dailyLitresTotal.toLocaleString()} लीटर पानी की आवश्यकता है। अनुसूची: ${irrigationRec.operationalSchedule.recommendedScheduleHi}।`;
    const amendmentStory = nutrientRec.amendments.length > 0
      ? `मृदा सुधार: ${nutrientRec.amendments.map(a => `${a.itemHi} (${a.bags}) - ${a.reasonHi}`).join('; ')}.`
      : `मृदा pH और जैविक कार्बन सामान्य स्तर पर हैं।`;

    return {
      language: 'hi',
      title: `${crop.hindiName} फसल हेतु वैज्ञानिक परामर्श`,
      soilHealthSummary: soilStory,
      nutrientAdvice: nutrientStory,
      irrigationAdvice: irrigationStory,
      amendmentAdvice: amendmentStory,
      disclaimer: 'सूचना: यह परामर्श आईसीएआर एवं कृषि विश्वविद्यालय की पद्धतियों पर आधारित है।',
      voiceNarrationText: `${soilStory} ${nutrientStory} ${irrigationStory}`
    };
  } else {
    const soilStory = `Soil test report for your ${area} ${areaUnit} farm evaluated against ICAR standards. Overall soil health score is ${soilAnalysis.overallHealthScore}/100 (${soilAnalysis.overallHealth}).`;
    const ferts = nutrientRec.commercialFertilizers;
    const nutrientStory = `For optimal yield in ${crop.name}, apply:\n- ${ferts[0]?.name}: ${ferts[0]?.totalKg} kg (${ferts[0]?.bagCountText})\n- ${ferts[1]?.name}: ${ferts[1]?.totalKg} kg (${ferts[1]?.bagCountText})\n- ${ferts[2]?.name}: ${ferts[2]?.totalKg} kg (${ferts[2]?.bagCountText})`;
    const irrigationStory = `Precision Irrigation: Daily crop water requirement is ${irrigationRec.waterBalance.dailyLitresTotal.toLocaleString()} Litres/day. Recommended schedule: ${irrigationRec.operationalSchedule.recommendedSchedule}.`;
    const amendmentStory = nutrientRec.amendments.length > 0
      ? `Soil Amendments: ${nutrientRec.amendments.map(a => `${a.item} (${a.bags}): ${a.reason}`).join('; ')}.`
      : `Soil reaction (pH) and organic matter are within optimal ranges.`;

    return {
      language: 'en',
      title: `AgroSense AI Advisory for ${crop.name}`,
      soilHealthSummary: soilStory,
      nutrientAdvice: nutrientStory,
      irrigationAdvice: irrigationStory,
      amendmentAdvice: amendmentStory,
      disclaimer: 'Notice: Recommendations formulated using UAS Bengaluru Package of Practices and FAO-56 standards.',
      voiceNarrationText: `${soilStory} ${nutrientStory} ${irrigationStory}`
    };
  }
}
