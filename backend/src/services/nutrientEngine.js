import { CROPS } from '../data/crops.js';
import { SOIL_PARAMETERS } from '../data/standards.js';

export function calculateFertilizerRecommendation({
  cropId = 'tomato',
  farmArea = 1.0,
  areaUnit = 'acre', // 'acre' or 'hectare'
  parameters = {},
  targetYield = null,
  growthStage = 'basal'
}) {
  const crop = CROPS[cropId] || CROPS['tomato'];
  const areaInAcres = areaUnit === 'hectare' ? farmArea * 2.47105 : farmArea;

  // Retrieve base RDF per acre
  const baseN = crop.rdfPerAcre.n;
  const baseP = crop.rdfPerAcre.p;
  const baseK = crop.rdfPerAcre.k;

  // Interpret soil test values for STCR adjustment
  const nVal = parseFloat(parameters.nitrogen?.value ?? parameters.nitrogen ?? 200);
  const pVal = parseFloat(parameters.phosphorus?.value ?? parameters.phosphorus ?? 30);
  const kVal = parseFloat(parameters.potassium?.value ?? parameters.potassium ?? 130);
  const phVal = parseFloat(parameters.ph?.value ?? parameters.ph ?? 7.2);
  const ecVal = parseFloat(parameters.ec?.value ?? parameters.ec ?? 0.5);
  const ocVal = parseFloat(parameters.organicCarbon?.value ?? parameters.organicCarbon ?? 0.4);
  const znVal = parseFloat(parameters.zinc?.value ?? parameters.zinc ?? 0.5);
  const bVal = parseFloat(parameters.boron?.value ?? parameters.boron ?? 0.4);
  const sVal = parseFloat(parameters.sulphur?.value ?? parameters.sulphur ?? 9.0);

  // STCR Adjustment Multipliers based on soil status
  const nInterp = SOIL_PARAMETERS.nitrogen.interpret(nVal);
  const pInterp = SOIL_PARAMETERS.phosphorus.interpret(pVal);
  const kInterp = SOIL_PARAMETERS.potassium.interpret(kVal);

  const nAdjFactor = nInterp.adjustmentFactor || 1.0;
  const pAdjFactor = pInterp.adjustmentFactor || 1.0;
  const kAdjFactor = kInterp.adjustmentFactor || 1.0;

  // Adjusted nutrient requirement per acre in kg
  const nPerAcre = Math.round(baseN * nAdjFactor);
  const pPerAcre = Math.round(baseP * pAdjFactor);
  const kPerAcre = Math.round(baseK * kAdjFactor);

  // Total requirement for the total farm area
  const totalN = Math.round(nPerAcre * areaInAcres);
  const totalP = Math.round(pPerAcre * areaInAcres);
  const totalK = Math.round(kPerAcre * areaInAcres);

  // Commercial Fertilizer Conversions
  // 1. DAP (18% N, 46% P2O5) to meet Phosphorus requirement:
  // DAP required = totalP / 0.46
  const dapKg = Math.round(totalP / 0.46);
  const nSuppliedByDap = Math.round(dapKg * 0.18);

  // 2. Remaining Nitrogen to be met via Urea (46% N):
  const remainingN = Math.max(0, totalN - nSuppliedByDap);
  const ureaKg = Math.round(remainingN / 0.46);

  // 3. Potassium met via MOP (60% K2O) or SOP if soil is saline:
  const isSalineOrSodic = ecVal > 1.8;
  const potFertilizerName = isSalineOrSodic ? 'Sulphate of Potash (SOP - 50% K2O, 17% S)' : 'Muriate of Potash (MOP - 60% K2O)';
  const potFertilizerNameKn = isSalineOrSodic ? 'ಸಲ್ಫೇಟ್ ಆಫ್ ಪೊಟ್ಯಾಶ್ (SOP - ಲವಣ ರಹಿತ)' : 'ಮ್ಯೂರಿಯೇಟ್ ಆಫ್ ಪೊಟ್ಯಾಶ್ (MOP)';
  const potFertilizerNameHi = isSalineOrSodic ? 'सल्फेट ऑफ पोटाश (SOP)' : 'म्यूरेट ऑफ पोटाश (MOP)';
  const potFraction = isSalineOrSodic ? 0.50 : 0.60;
  const potKg = Math.round(totalK / potFraction);

  // Commercial Bag counts (Urea is 45kg bag in India; DAP and MOP are 50kg bags)
  const ureaBags = (ureaKg / 45).toFixed(1);
  const dapBags = (dapKg / 50).toFixed(1);
  const potBags = (potKg / 50).toFixed(1);

  // Micronutrient and Soil Amendment Calculations
  const amendments = [];

  // Soil pH Amendment
  if (phVal < 6.0) {
    const limeKg = Math.round(600 * areaInAcres);
    amendments.push({
      item: 'Agricultural Lime (CaCO3)',
      itemKn: 'ಕೃಷಿ ಸುಣ್ಣ (Lime)',
      itemHi: 'कृषि चूना',
      quantityKg: limeKg,
      bags: `${(limeKg / 50).toFixed(1)} bags (50kg)`,
      reason: `Soil is acidic (pH ${phVal}). Liming raises pH, prevents aluminum toxicity and unlocks phosphorus.`,
      reasonKn: `ಮಣ್ಣು ಆಮ್ಲೀಯವಾಗಿದೆ (pH ${phVal}). ಸುಣ್ಣ ಬಳಸುವುದರಿಂದ ಆಮ್ಲತೆ ಕಡಿಮೆಯಾಗಿ ರಂಜಕದ ಲಭ್ಯತೆ ಹೆಚ್ಚುತ್ತದೆ.`,
      reasonHi: `मृदा अम्लीय है। चूना डालने से फास्फोरस की उपलब्धता सुधरेगी।`,
      timing: 'Apply 3-4 weeks before planting during land preparation'
    });
  } else if (phVal > 8.2) {
    const gypsumKg = Math.round(800 * areaInAcres);
    amendments.push({
      item: 'Agricultural Gypsum (CaSO4·2H2O)',
      itemKn: 'ಕೃಷಿ ಜಿಪ್ಸಮ್ (Gypsum)',
      itemHi: 'कृषि जिप्सम',
      quantityKg: gypsumKg,
      bags: `${(gypsumKg / 50).toFixed(1)} bags (50kg)`,
      reason: `Soil is alkaline/sodic (pH ${phVal}). Gypsum provides soluble calcium to displace harmful sodium.`,
      reasonKn: `ಮಣ್ಣು ಕ್ಷಾರೀಯವಾಗಿದೆ (pH ${phVal}). ಜಿಪ್ಸಮ್ ಮಣ್ಣಿನ ಸೋಡಿಯಂ ಕರಗಿಸಿ ಮಣ್ಣಿನ ರಚನೆ ಸುಧಾರಿಸುತ್ತದೆ.`,
      reasonHi: `मृदा क्षारीय है। जिप्सम से सोडियम का प्रभाव कम होता है।`,
      timing: 'Broadcast and incorporate into soil during primary tillage with light irrigation'
    });
  }

  // Organic Carbon (FYM)
  if (ocVal < 0.50) {
    const fymTonnes = (4 * areaInAcres).toFixed(1);
    amendments.push({
      item: 'Well-Decomposed Farm Yard Manure (FYM) or Vermicompost',
      itemKn: 'ಕೊಳೆತ ಕೊಟ್ಟಿಗೆ ಗೊಬ್ಬರ ಅಥವಾ ಎರೆಹುಳು ಗೊಬ್ಬರ',
      itemHi: 'सड़ी हुई गोबर की खाद या केंचुआ खाद',
      quantityKg: Math.round(fymTonnes * 1000),
      bags: `${fymTonnes} tonnes (~${Math.round(fymTonnes * 2)} tractor loads)`,
      reason: `Low Organic Carbon (${ocVal}%). Crucial for soil moisture conservation and beneficial microbial activity.`,
      reasonKn: `ಮಣ್ಣಿನಲ್ಲಿ ಸಾವಯವ ಇಂಗಾಲ ಕಡಿಮೆಯಿದೆ (${ocVal}%). ಮಣ್ಣಿನ ತೇವಾಂಶ ಮತ್ತು ಫಲವತ್ತತೆಗೆ ಸೆಗಣಿ ಗೊಬ್ಬರ ಅಗತ್ಯ.`,
      reasonHi: `जैविक कार्बन कम है। नमी संरक्षण और मिट्टी की ताकत के लिए गोबर की खाद जरूरी है।`,
      timing: 'Apply 2-3 weeks prior to sowing during final ploughing'
    });
  }

  // Zinc Sulphate
  if (znVal < 0.60) {
    const znKg = Math.round(10 * areaInAcres);
    amendments.push({
      item: 'Zinc Sulphate Heptahydrate (ZnSO4 21%)',
      itemKn: 'ಜಿಂಕ್ ಸಲ್ಫೇಟ್ (Zinc Sulphate 21%)',
      itemHi: 'जिंक सल्फेट (21%)',
      quantityKg: znKg,
      bags: `${znKg} kg`,
      reason: `Zinc is deficient (${znVal} ppm). Vital for crop chlorophyll and enzyme activation.`,
      reasonKn: `ಸತು (ಜಿಂಕ್) ಕೊರತೆಯಿದೆ (${znVal} ppm). ಎಲೆಗಳ ಸಸ್ಯ ಬೆಳವಣಿಗೆಯ ಹಾರ್ಮೋನ್‌ಗೆ ಅತ್ಯಗತ್ಯ.`,
      reasonHi: `जिंक की कमी है। पौधों की बढ़वार के लिए 10 किलो प्रति एकड़ डालें।`,
      timing: 'Basal application at transplanting / sowing (do not mix directly with DAP)'
    });
  }

  // Borax
  if (bVal < 0.50) {
    const boraxKg = Math.round(4 * areaInAcres);
    amendments.push({
      item: 'Borax (Disodium Octaborate / 11% B)',
      itemKn: 'ಬೋರಾಕ್ಸ್ (Borax 11%)',
      itemHi: 'बोरेक्स (11%)',
      quantityKg: boraxKg,
      bags: `${boraxKg} kg`,
      reason: `Boron is deficient (${bVal} ppm). Prevents flower drop, fruit cracking and hollow heart.`,
      reasonKn: `ಬೋರಾನ್ ಕೊರತೆಯಿದೆ (${bVal} ppm). ಹೂ ಉದುರುವುದು ಮತ್ತು ಹಣ್ಣು ಬಿರುಕು ಬಿಡುವುದನ್ನು ತಡೆಯುತ್ತದೆ.`,
      reasonHi: `बोरोन की कमी है। फूलों को झड़ने से रोकने और फल की गुणवत्ता के लिए जरूरी है।`,
      timing: 'Soil application at transplanting or foliar spray 1g/L at flowering'
    });
  }

  // Stage-wise Split Application Schedule
  const applicationSchedule = crop.stages.map((stage) => {
    const stageUrea = Math.round(ureaKg * stage.splitN);
    const stageDap = Math.round(dapKg * stage.splitP);
    const stagePot = Math.round(potKg * stage.splitK);

    return {
      stageKey: stage.key,
      stageName: stage.name,
      stageNameKn: stage.nameKn,
      stageNameHi: stage.nameHi,
      ureaKg: stageUrea,
      dapKg: stageDap,
      potashKg: stagePot,
      potashName: potFertilizerName,
      instructions: stage.key === 'basal'
        ? 'Broadcast and incorporate DAP, Potash, and 50% Urea during final bed preparation.'
        : `Apply remaining Urea and Potash as ring placement or fertigation 5-10 cm away from crop base followed by irrigation.`,
      instructionsKn: stage.key === 'basal'
        ? 'ನಾಟಿ ಮಾಡುವ ಸಮಯದಲ್ಲಿ ಇಡೀ ಡಿಎಪಿ, ಪೊಟ್ಯಾಶ್ ಮತ್ತು ನಿಗದಿತ ಯೂರಿಯಾವನ್ನು ಮಣ್ಣಿನಲ್ಲಿ ಚೆನ್ನಾಗಿ ಬೆರೆಸಿ.'
        : `ಗಿಡದ ಬುಡದಿಂದ 5-10 ಸೆಂ.ಮೀ ದೂರದಲ್ಲಿ ಗೊಬ್ಬರ ಹಾಕಿ ನಂತರ ನೀರು ಹಾಯಿಸಿ.`,
      instructionsHi: stage.key === 'basal'
        ? 'रोपाई के समय डीएपी, पोटाश और यूरिया की निर्धारित मात्रा मिट्टी में मिलाएं।'
        : `पौधे की जड़ से 5-10 सेमी दूर खाद डालें और तुरंत हल्की सिंचाई करें।`
    };
  });

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
      area: farmArea,
      unit: areaUnit,
      areaInAcres: parseFloat(areaInAcres.toFixed(2))
    },
    soilAdjustments: {
      nitrogen: { initial: nVal, status: nInterp.status, adjustment: `${(nAdjFactor * 100).toFixed(0)}%` },
      phosphorus: { initial: pVal, status: pInterp.status, adjustment: `${(pAdjFactor * 100).toFixed(0)}%` },
      potassium: { initial: kVal, status: kInterp.status, adjustment: `${(kAdjFactor * 100).toFixed(0)}%` }
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
        bagCountText: `${ureaBags} Bags (45 kg each)`,
        nutrientSupplied: `Supplies ${remainingN} kg Nitrogen (net of DAP contribution)`,
        nutrientSuppliedKn: `${remainingN} ಕೆಜಿ ಸಾರಜನಕವನ್ನು ಒದಗಿಸುತ್ತದೆ`,
        nutrientSuppliedHi: `${remainingN} किग्रा नाइट्रोजन प्रदान करता है`
      },
      {
        name: 'Di-Ammonium Phosphate (DAP 18-46-0)',
        kannadaName: 'ಡಿಎಪಿ (DAP 18:46:0)',
        hindiName: 'डीएपी (DAP 18:46:0)',
        totalKg: dapKg,
        bagCountText: `${dapBags} Bags (50 kg each)`,
        nutrientSupplied: `Supplies ${totalP} kg P2O5 and ${nSuppliedByDap} kg starter Nitrogen`,
        nutrientSuppliedKn: `${totalP} ಕೆಜಿ ರಂಜಕ ಮತ್ತು ${nSuppliedByDap} ಕೆಜಿ ಸಾರಜನಕ ಒದಗಿಸುತ್ತದೆ`,
        nutrientSuppliedHi: `${totalP} किग्रा फास्फोरस और ${nSuppliedByDap} किग्रा नाइट्रोजन प्रदान करता है`
      },
      {
        name: potFertilizerName,
        kannadaName: potFertilizerNameKn,
        hindiName: potFertilizerNameHi,
        totalKg: potKg,
        bagCountText: `${potBags} Bags (50 kg each)`,
        nutrientSupplied: `Supplies ${totalK} kg K2O Potash`,
        nutrientSuppliedKn: `${totalK} ಕೆಜಿ ಪೊಟ್ಯಾಶ್ ಒದಗಿಸುತ್ತದೆ`,
        nutrientSuppliedHi: `${totalK} किग्रा पोटाश प्रदान करता है`
      }
    ],
    amendments,
    applicationSchedule,
    scientificSource: {
      organization: 'University of Agricultural Sciences (UAS), Bengaluru & ICAR',
      handbook: 'Package of Practices for Horticultural / Agricultural Crops of Karnataka (Zone 5 & 6)',
      methodology: 'Soil Test Crop Response (STCR) Equations & Targeted Yield Approach',
      version: '2025-2026 Edition'
    }
  };
}
