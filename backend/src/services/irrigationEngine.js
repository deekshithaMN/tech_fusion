import { CROPS } from '../data/crops.js';

export function calculateIrrigationAdvisory({
  cropId = 'tomato',
  growthStage = 'flowering',
  farmArea = 1.0,
  areaUnit = 'acre',
  irrigationMethod = 'drip', // 'drip', 'sprinkler', 'furrow'
  soilType = 'red_sandy_loam', // 'red_sandy_loam', 'black_clay', 'alluvial', 'laterite'
  weatherData = null
}) {
  const crop = CROPS[cropId] || CROPS['tomato'];
  const areaInAcres = areaUnit === 'hectare' ? farmArea * 2.47105 : farmArea;

  // Find stage definition and Kc
  const stageObj = crop.stages.find(s => s.key === growthStage) || crop.stages[1] || { kc: 0.85, name: 'Vegetative Growth' };
  const kc = stageObj.kc;

  // Weather inputs (defaults based on Karnataka semi-arid climate if weatherData not provided)
  const et0 = weatherData?.et0 ?? 4.8; // mm/day (typical summer/kharif baseline in Southern Karnataka)
  const forecastRainMm = weatherData?.forecastRain ?? 0.0; // mm
  const tempMax = weatherData?.tempMax ?? 31.5;
  const tempMin = weatherData?.tempMin ?? 21.0;
  const humidity = weatherData?.humidity ?? 62;

  // Step 1: Crop Evapotranspiration (ETc = ET0 * Kc)
  const etc = parseFloat((et0 * kc).toFixed(2));

  // Step 2: Effective Rainfall (Pe)
  // USDA Soil Conservation Service formula
  let pe = 0;
  if (forecastRainMm > 75) {
    pe = Math.max(0, 0.8 * forecastRainMm - 25);
  } else if (forecastRainMm > 10) {
    pe = Math.max(0, 0.6 * forecastRainMm - 10);
  } else {
    pe = 0; // Light showers under 10mm evaporate quickly
  }
  pe = parseFloat(pe.toFixed(2));

  // Step 3: Net Irrigation Requirement (NIR = max(0, ETc - Pe))
  const netRequirementMm = parseFloat(Math.max(0, etc - pe).toFixed(2));

  // Step 4: Irrigation Method Efficiency
  const efficiencyMap = {
    drip: { efficiency: 0.90, name: 'Drip Irrigation (ಹನಿ ನೀರಾವರಿ)', pumpRateLph: 20000, intervalDays: 2 },
    sprinkler: { efficiency: 0.75, name: 'Sprinkler Irrigation (ತುಂತುರು ನೀರಾವರಿ)', pumpRateLph: 25000, intervalDays: 3 },
    furrow: { efficiency: 0.60, name: 'Surface / Furrow Flood (ಕಾಲುವೆ ನೀರಾವರಿ)', pumpRateLph: 35000, intervalDays: 6 }
  };

  const methodMeta = efficiencyMap[irrigationMethod] || efficiencyMap['drip'];
  const efficiency = methodMeta.efficiency;

  // Step 5: Gross Irrigation Requirement (GIR = NIR / efficiency)
  const grossRequirementMm = parseFloat((netRequirementMm / efficiency).toFixed(2));

  // Step 6: Water Volume in Litres
  // 1 mm depth over 1 acre = 4,046.86 Litres (approx 4,047 Litres)
  const litresPerAcrePerDay = Math.round(grossRequirementMm * 4047);
  const totalDailyLitres = Math.round(litresPerAcrePerDay * areaInAcres);

  // Interval-based irrigation cycle volume
  const intervalDays = methodMeta.intervalDays;
  const cycleLitres = totalDailyLitres * intervalDays;

  // Estimated Pump Running Time (assuming 3 HP pump delivering ~ 20,000 - 25,000 L/hr)
  const pumpHourlyDischarge = methodMeta.pumpRateLph;
  const pumpRuntimeHours = cycleLitres / pumpHourlyDischarge;
  const hours = Math.floor(pumpRuntimeHours);
  const minutes = Math.round((pumpRuntimeHours - hours) * 60);

  // Water Savings compared to traditional furrow flood irrigation
  const floodGross = netRequirementMm / 0.60;
  const floodTotalDaily = Math.round(floodGross * 4047 * areaInAcres);
  const dailyWaterSavedLitres = Math.max(0, floodTotalDaily - totalDailyLitres);
  const waterSavingsPercent = Math.round(((floodTotalDaily - totalDailyLitres) / floodTotalDaily) * 100);

  // Irrigation Action Decision
  let shouldIrrigate = true;
  let actionUrgency = 'Normal';
  let decisionReason = '';
  let decisionReasonKn = '';
  let decisionReasonHi = '';

  if (forecastRainMm >= 25) {
    shouldIrrigate = false;
    actionUrgency = 'Postpone';
    decisionReason = `Substantial rainfall (${forecastRainMm} mm) forecast over next 24-48 hrs. Postpone irrigation to avoid root aeration loss and waterlogging.`;
    decisionReasonKn = `ಮುಂದಿನ 24-48 ಗಂಟೆಗಳಲ್ಲಿ ${forecastRainMm} ಮಿ.ಮೀ ಮಳೆಯ ಮುನ್ಸೂಚನೆ ಇದೆ. ನೀರು ಹಾಯಿಸುವುದನ್ನು ಮುಂದೂಡಿ.`;
    decisionReasonHi = `आगामी 24-48 घंटों में ${forecastRainMm} मिमी बारिश का अनुमान है। सिंचाई स्थगित करें।`;
  } else if (netRequirementMm === 0) {
    shouldIrrigate = false;
    actionUrgency = 'Adequate';
    decisionReason = 'Recent rainfall meets the crop water requirement for today.';
    decisionReasonKn = 'ಇತ್ತೀಚಿನ ಮಳೆಯು ಇಂದಿನ ಬೆಳೆಯ ನೀರಿನ ಬೇಡಿಕೆಯನ್ನು ಪೂರೈಸಿದೆ.';
    decisionReasonHi = 'वर्तमान वर्षा से फसल की जल मांग पूरी हो चुकी है।';
  } else {
    shouldIrrigate = true;
    actionUrgency = 'Recommended';
    decisionReason = `Crop is in ${stageObj.name} with high transpiration demand (ETc: ${etc} mm/day). Apply scheduled irrigation.`;
    decisionReasonKn = `ಬೆಳೆಯು ${stageObj.nameKn}ಯಲ್ಲಿದ್ದು ನೀರಿನ ಬೇಡಿಕೆ ಹೆಚ್ಚಿದೆ (ದಿನಕ್ಕೆ ${etc} ಮಿ.ಮೀ). ನಿಗದಿತ ನೀರು ಒದಗಿಸಿ.`;
    decisionReasonHi = `फसल ${stageObj.nameHi} में है। निर्धारित सिंचाई करें।`;
  }

  return {
    crop: {
      name: crop.name,
      stage: stageObj.name,
      stageKn: stageObj.nameKn,
      stageHi: stageObj.nameHi,
      kc: kc
    },
    method: {
      type: irrigationMethod,
      name: methodMeta.name,
      efficiencyPercent: Math.round(efficiency * 100)
    },
    weather: {
      et0: et0,
      forecastRainMm: forecastRainMm,
      tempMax: tempMax,
      tempMin: tempMin,
      humidity: humidity,
      source: weatherData?.source || 'Open-Meteo Agro-Meteorological Service'
    },
    evapotranspiration: {
      et0_mm: et0,
      kc: kc,
      etc_mm: etc,
      effectiveRain_mm: pe
    },
    waterBalance: {
      netRequirementMm,
      grossRequirementMm,
      dailyLitresTotal: totalDailyLitres,
      cycleLitresTotal: cycleLitres,
      intervalDays: intervalDays,
      litresPerAcrePerDay
    },
    operationalSchedule: {
      shouldIrrigate,
      actionUrgency,
      decisionReason,
      decisionReasonKn,
      decisionReasonHi,
      recommendedSchedule: `${hours} hours ${minutes} minutes every ${intervalDays} days`,
      recommendedScheduleKn: `ಪ್ರತಿ ${intervalDays} ದಿನಗಳಿಗೊಮ್ಮೆ ${hours} ಗಂಟೆ ${minutes} ನಿಮಿಷ ನೀರು ಹಾಯಿಸಿ`,
      recommendedScheduleHi: `प्रत्येक ${intervalDays} दिन में ${hours} घंटे ${minutes} मिनट चलाएं`,
      pumpDischargeAssumed: `${(pumpHourlyDischarge / 1000).toFixed(0)},000 Litres/hour`
    },
    waterConservation: {
      dailySavedLitres: dailyWaterSavedLitres,
      savingsPercent: waterSavingsPercent > 0 ? waterSavingsPercent : 0
    },
    disclaimer: 'Notice: A laboratory soil test report measures soil chemistry and texture, not instantaneous moisture. This precision advisory is a model-based evapotranspiration calculation. If in-situ soil moisture tensiometer readings are available, calibrate accordingly.',
    disclaimerKn: 'ಗಮನಿಸಿ: ಮಣ್ಣು ಪರೀಕ್ಷಾ ವರದಿಯು ರಾಸಾಯನಿಕ ಫಲವತ್ತತೆಯನ್ನು ಅಳೆಯುತ್ತದೆ, ತತ್ಕ್ಷಣದ ಮಣ್ಣಿನ ತೇವಾಂಶವನ್ನಲ್ಲ. ಈ ನೀರಾವರಿ ಸಲಹೆಯು ಹವಾಮಾನ ಮತ್ತು ಬೆಳೆಯ ನೀರಿನ ಬೇಡಿಕೆಯ ಮಾದರಿಯನ್ನು ಆಧರಿಸಿದೆ.',
    disclaimerHi: 'सूचना: मृदा परीक्षण रिपोर्ट रासायनिक तत्वों की होती है, वास्तविक समय की नमी की नहीं। यह सलाह मौसम व वाष्पोत्सर्जन मॉडल पर आधारित है।'
  };
}
