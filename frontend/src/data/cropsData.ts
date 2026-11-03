import { CropInfo } from '../types';

export const CROPS_CATALOG: Record<string, CropInfo> = {
  tomato: {
    id: 'tomato',
    name: 'Tomato',
    kannadaName: 'ಟೊಮ್ಯಾಟೊ (Tomato)',
    hindiName: 'टमाटर (Tomato)',
    category: 'Vegetables',
    durationDays: 130,
    targetYieldDefault: 25,
    yieldUnit: 'tonnes/acre',
    rdfPerAcre: { n: 73, p: 49, k: 65 },
    stages: [
      { key: 'basal', name: 'Basal / Transplanting (0-15 DAT)', nameKn: 'ನಾಟಿ ಸಮಯ (ಬಾಸಲ್)', nameHi: 'रोपाई का समय (बेसल)', kc: 0.60, duration: 15, splitN: 0.50, splitP: 1.0, splitK: 0.50 },
      { key: 'vegetative', name: 'Vegetative Growth (16-35 DAT)', nameKn: 'ಸಸ್ಯ ಬೆಳವಣಿಗೆಯ ಹಂತ (16-35 ದಿನ)', nameHi: 'वानस्पतिक वृद्धि (16-35 दिन)', kc: 0.85, duration: 20, splitN: 0.25, splitP: 0.0, splitK: 0.25 },
      { key: 'flowering', name: 'Flowering & Fruit Set (36-60 DAT)', nameKn: 'ಹೂ ಮತ್ತು ಕಾಯಿ ಕಟ್ಟುವ ಹಂತ (36-60 ದಿನ)', nameHi: 'फूल और फल विकास (36-60 दिन)', kc: 1.15, duration: 25, splitN: 0.25, splitP: 0.0, splitK: 0.25 },
      { key: 'harvest', name: 'Fruit Ripening & Harvesting (61-130 DAT)', nameKn: 'ಹಣ್ಣು ಮಾಗುವಿಕೆ ಮತ್ತು ಕಟಾವು ಹಂತ', nameHi: 'फल पकने और तुड़ाई का समय', kc: 0.80, duration: 70, splitN: 0.0, splitP: 0.0, splitK: 0.0 }
    ],
    commonDeficiencies: ['nitrogen', 'potassium', 'boron', 'zinc'],
    specialAdvice: 'Tomato is prone to Blossom End Rot (Calcium deficit) and fruit cracking (Boron deficit). Maintain continuous soil moisture via drip.',
    specialAdviceKn: 'ಟೊಮ್ಯಾಟೊ ಬೆಳೆಗೆ ಬೋರಾನ್ ಕೊರತೆಯಿಂದ ಹಣ್ಣು ಬಿರುಕು ಬಿಡುತ್ತದೆ. ಹೂ ಕಟ್ಟುವ ಸಮಯದಲ್ಲಿ ಬೋರಾಕ್ಸ್ ಅಥವಾ 19:19:19 ಸಿಂಪಡಣೆ ಉಪಯುಕ್ತ.',
    specialAdviceHi: 'टमाटर में बोरोन की कमी से फल फट सकते हैं। ड्रिप द्वारा नियमित नमी बनाए रखें।'
  },
  maize: {
    id: 'maize',
    name: 'Maize / Corn',
    kannadaName: 'ಮೆಕ್ಕೆಜೋಳ (Maize)',
    hindiName: 'मक्का (Maize)',
    category: 'Cereals',
    durationDays: 105,
    targetYieldDefault: 30,
    yieldUnit: 'quintals/acre',
    rdfPerAcre: { n: 61, p: 30, k: 16 },
    stages: [
      { key: 'basal', name: 'Sowing / Basal (0-15 DAS)', nameKn: 'ಬಿತ್ತನೆ ಹಂತ', nameHi: 'बुवाई का समय', kc: 0.40, duration: 15, splitN: 0.33, splitP: 1.0, splitK: 1.0 },
      { key: 'knee_high', name: 'Knee-high Stage (16-35 DAS)', nameKn: 'ಮಂಡಿ ಎತ್ತರದ ಬೆಳವಣಿಗೆ ಹಂತ', nameHi: 'घुटने की ऊंचाई का चरण', kc: 0.80, duration: 20, splitN: 0.33, splitP: 0.0, splitK: 0.0 },
      { key: 'tasseling', name: 'Tasseling & Silking (36-65 DAS)', nameKn: 'ತೆನೆ ಮತ್ತು ರೇಷ್ಮೆ ಬಿಡುವ ಹಂತ', nameHi: 'मंजरी और सिल्क निकलने की अवस्था', kc: 1.20, duration: 30, splitN: 0.34, splitP: 0.0, splitK: 0.0 },
      { key: 'grain_filling', name: 'Grain Filling & Maturity (66-105 DAS)', nameKn: 'ಕಾಳು ತುಂಬುವಿಕೆ ಮತ್ತು ಪಕ್ವತೆ', nameHi: 'दाना भराव और परिपक्वता', kc: 0.60, duration: 40, splitN: 0.0, splitP: 0.0, splitK: 0.0 }
    ],
    commonDeficiencies: ['nitrogen', 'zinc', 'phosphorus'],
    specialAdvice: 'Maize exhibits strong zinc response. Apply Zinc Sulphate basal before sowing to avoid white bud symptoms.',
    specialAdviceKn: 'ಮೆಕ್ಕೆಜೋಳಕ್ಕೆ ಸತು (ಜಿಂಕ್) ಕೊರತೆಯಾದರೆ ಮೇಲಿನ ಎಲೆಗಳು ಬಿಳಿಯಾಗುತ್ತವೆ. ಬಿತ್ತನೆಗೆ ಮುನ್ನ ಜಿಂಕ್ ಸಲ್ಫೇಟ್ ಕಡ್ಡಾಯ.',
    specialAdviceHi: 'मक्के में जिंक की कमी से सफेद कली रोग हो सकता है। जिंक सल्फेट अवश्य डालें।'
  },
  ragi: {
    id: 'ragi',
    name: 'Ragi / Finger Millet',
    kannadaName: 'ರಾಗಿ (Finger Millet)',
    hindiName: 'रागी / मड़ुआ (Ragi)',
    category: 'Millets',
    durationDays: 115,
    targetYieldDefault: 18,
    yieldUnit: 'quintals/acre',
    rdfPerAcre: { n: 40, p: 20, k: 20 },
    stages: [
      { key: 'basal', name: 'Basal / Sowing (0-15 DAS)', nameKn: 'ಬಿತ್ತನೆ ಹಂತ', nameHi: 'बुवाई के समय', kc: 0.40, duration: 15, splitN: 0.50, splitP: 1.0, splitK: 1.0 },
      { key: 'tillering', name: 'Active Tillering (16-35 DAS)', nameKn: 'ಕವಲು ಒಡೆಯುವ ಹಂತ', nameHi: 'कल्ले फूटने की अवस्था', kc: 0.75, duration: 20, splitN: 0.50, splitP: 0.0, splitK: 0.0 },
      { key: 'flowering', name: 'Flowering & Earhead Emergence (36-65 DAS)', nameKn: 'ತೆನೆ ಹೊರಬರುವ ಹಂತ', nameHi: 'बाली निकलने का चरण', kc: 1.05, duration: 30, splitN: 0.0, splitP: 0.0, splitK: 0.0 },
      { key: 'maturity', name: 'Grain Hardening & Harvesting (66-115 DAS)', nameKn: 'ಕಾಳು ಮಾಗುವಿಕೆ ಹಂತ', nameHi: 'दाना पकने का समय', kc: 0.65, duration: 50, splitN: 0.0, splitP: 0.0, splitK: 0.0 }
    ],
    commonDeficiencies: ['nitrogen', 'phosphorus'],
    specialAdvice: 'Karnataka staple food crop. Highly drought-tolerant; top-dressing nitrogen at active tillering boosts grain count.',
    specialAdviceKn: 'ರಾಗಿ ಕರ್ನಾಟಕದ ಪ್ರಮುಖ ಬೆಳೆ. ಕವಲು ಒಡೆಯುವ ಸಮಯದಲ್ಲಿ ಯೂರಿಯಾ ಮೇಲುಗೊಬ್ಬರ ನೀಡುವುದರಿಂದ ತೆನೆಗಳ ಸಂಖ್ಯೆ ಮತ್ತು ಇಳುವರಿ ಹೆಚ್ಚುತ್ತದೆ.',
    specialAdviceHi: 'रागी अत्यंत पौष्टिक फसल है। कल्ले फूटने के समय यूरिया देने से पैदावार बढ़ती है।'
  },
  sugarcane: {
    id: 'sugarcane',
    name: 'Sugarcane',
    kannadaName: 'ಕಬ್ಬು (Sugarcane)',
    hindiName: 'गन्ना (Sugarcane)',
    category: 'Commercial',
    durationDays: 360,
    targetYieldDefault: 45,
    yieldUnit: 'tonnes/acre',
    rdfPerAcre: { n: 101, p: 40, k: 51 },
    stages: [
      { key: 'germination', name: 'Germination & Tillering (0-90 DAS)', nameKn: 'ಮೊಳಕೆ ಮತ್ತು ಕವಲು ಒಡೆಯುವ ಹಂತ', nameHi: 'अंकुरण और कल्ले निकलने का समय', kc: 0.50, duration: 90, splitN: 0.25, splitP: 1.0, splitK: 0.33 },
      { key: 'grand_growth', name: 'Grand Growth / Cane Elongation (91-240 DAS)', nameKn: 'ತೀವ್ರ ಬೆಳವಣಿಗೆ ಹಂತ', nameHi: 'मुख्य बढ़वार अवस्था', kc: 1.25, duration: 150, splitN: 0.75, splitP: 0.0, splitK: 0.67 },
      { key: 'maturity', name: 'Ripening & Sugar Accumulation (241-360 DAS)', nameKn: 'ಸಕ್ಕರೆ ಮಾಗುವಿಕೆ ಹಂತ', nameHi: 'शर्करा निर्माण और पकने का समय', kc: 0.75, duration: 120, splitN: 0.0, splitP: 0.0, splitK: 0.0 }
    ],
    commonDeficiencies: ['nitrogen', 'potassium', 'iron'],
    specialAdvice: 'Long duration heavy feeder. Stop nitrogen application 120 days after planting to maximize sugar content.',
    specialAdviceKn: 'ಕಬ್ಬಿಗೆ ನಾಟಿ ಮಾಡಿದ 120 ದಿನಗಳ ನಂತರ ಸಾರಜನಕ (ಯೂರಿಯಾ) ಕೊಡುವುದನ್ನು ನಿಲ್ಲಿಸಬೇಕು. ಇದರಿಂದ ಸಕ್ಕರೆ ಅಂಶ ಹೆಚ್ಚುತ್ತದೆ.',
    specialAdviceHi: 'गन्ने में 120 दिनों के बाद नाइट्रोजन न डालें ताकि शर्करा की मात्रा बढ़ सके।'
  },
  paddy: {
    id: 'paddy',
    name: 'Paddy / Rice',
    kannadaName: 'ಭತ್ತ (Paddy / Rice)',
    hindiName: 'धान (Paddy)',
    category: 'Cereals',
    durationDays: 130,
    targetYieldDefault: 28,
    yieldUnit: 'quintals/acre',
    rdfPerAcre: { n: 49, p: 24, k: 24 },
    stages: [
      { key: 'basal', name: 'Basal / Transplanting (0-15 DAT)', nameKn: 'ನಾಟಿ ಸಮಯ', nameHi: 'रोपाई का समय', kc: 1.10, duration: 15, splitN: 0.50, splitP: 1.0, splitK: 0.50 },
      { key: 'tillering', name: 'Active Tillering (16-40 DAT)', nameKn: 'ಕವಲು ಒಡೆಯುವ ಹಂತ', nameHi: 'कल्ले बनने का समय', kc: 1.15, duration: 25, splitN: 0.25, splitP: 0.0, splitK: 0.0 },
      { key: 'panicle', name: 'Panicle Initiation & Heading (41-75 DAT)', nameKn: 'ಕಾಳು ಕಟ್ಟುವ / ತೆನೆ ಹಂತ', nameHi: 'गाभा और बाली बनने का समय', kc: 1.20, duration: 35, splitN: 0.25, splitP: 0.0, splitK: 0.50 },
      { key: 'ripening', name: 'Ripening / Grain Filling (76-130 DAT)', nameKn: 'ಕಾಳು ಬಲಿಯುವಿಕೆ ಮತ್ತು ಕಟಾವು', nameHi: 'दाना पकने का समय', kc: 0.95, duration: 55, splitN: 0.0, splitP: 0.0, splitK: 0.0 }
    ],
    commonDeficiencies: ['nitrogen', 'zinc', 'iron'],
    specialAdvice: 'Apply Zinc Sulphate prior to puddling to prevent Khaira discoloration in submerged soils.',
    specialAdviceKn: 'ಭತ್ತದ ಗದ್ದೆಯಲ್ಲಿ ಸತು (ಜಿಂಕ್) ಕೊರತೆಯಿಂದ ಎಲೆಗಳು ಕಂದು ಬಣ್ಣಕ್ಕೆ ತಿರುಗುತ್ತವೆ. ಬಿತ್ತನೆಗೆ ಮುನ್ನ ಜಿಂಕ್ ಸಲ್ಫೇಟ್ ಸೇರಿಸಿ.',
    specialAdviceHi: 'धान में जिंक की कमी से खैरा रोग होता है। रोपाई से पहले जिंक सल्फेट डालें।'
  },
  groundnut: {
    id: 'groundnut',
    name: 'Groundnut / Peanut',
    kannadaName: 'ಕಡಲೆಕಾಯಿ (Groundnut)',
    hindiName: 'मूंगफली (Groundnut)',
    category: 'Oilseeds',
    durationDays: 110,
    targetYieldDefault: 12,
    yieldUnit: 'quintals/acre',
    rdfPerAcre: { n: 10, p: 20, k: 10 },
    stages: [
      { key: 'basal', name: 'Sowing / Basal (0-15 DAS)', nameKn: 'ಬಿತ್ತನೆ ಹಂತ', nameHi: 'बुवाई का समय', kc: 0.45, duration: 15, splitN: 1.0, splitP: 1.0, splitK: 1.0 },
      { key: 'flowering_pegging', name: 'Flowering & Pegging (16-45 DAS)', nameKn: 'ಹೂ ಮತ್ತು ಊಡ ಮುರಿಯುವ ಹಂತ', nameHi: 'फूल और सुई (पेग) बनने का समय', kc: 0.85, duration: 30, splitN: 0.0, splitP: 0.0, splitK: 0.0 },
      { key: 'pod_dev', name: 'Pod Development (46-80 DAS)', nameKn: 'ಕಾಯಿ ಕಟ್ಟುವ ಹಂತ', nameHi: 'फली बनने का समय', kc: 1.15, duration: 35, splitN: 0.0, splitP: 0.0, splitK: 0.0 },
      { key: 'maturity', name: 'Maturity (81-110 DAS)', nameKn: 'ಪಕ್ವತೆ ಹಂತ', nameHi: 'परिपक्वता चरण', kc: 0.60, duration: 30, splitN: 0.0, splitP: 0.0, splitK: 0.0 }
    ],
    commonDeficiencies: ['sulphur', 'calcium', 'phosphorus'],
    specialAdvice: 'Apply Gypsum (200 kg/acre) at 40-45 DAS pegging stage to supply Calcium for pod shell hardening.',
    specialAdviceKn: 'ಕಡಲೆಕಾಯಿಗೆ ಊಡ ಮುರಿಯುವ ಸಮಯದಲ್ಲಿ (40-45 ದಿನ) ಜಿಪ್ಸಮ್ (Gypsum) ಹಾಕುವುದು ಕಡ್ಡಾಯ.',
    specialAdviceHi: 'मूंगफली में 40-45 दिन पर जिप्सम डालना अत्यंत आवश्यक है।'
  }
};

export const CROPS: CropInfo[] = Object.values(CROPS_CATALOG);
