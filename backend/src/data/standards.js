// Indian Soil Health Card (SHC) & ICAR Standards for Soil Parameters
export const SOIL_PARAMETERS = {
  nitrogen: {
    key: 'nitrogen',
    symbol: 'N',
    name: 'Available Nitrogen',
    kannadaName: 'ಲಭ್ಯವಿರುವ ಸಾರಜನಕ (Nitrogen)',
    hindiName: 'उपलब्ध नाइट्रोजन (Nitrogen)',
    unit: 'kg/ha',
    testMethod: 'Alkaline Permanganate Method (Subbiah & Asija, 1956)',
    role: 'Primary plant nutrient for leaf, stem development and vegetative growth',
    roleKn: 'ಎಲೆ, ಕಾಂಡಗಳ ಬೆಳವಣಿಗೆ ಮತ್ತು ಹಸಿರು ದ್ಯುತಿಸಂಶ್ಲೇಷಣೆಗೆ ಮುಖ್ಯ ಪೋಷಕಾಂಶ.',
    roleHi: 'पत्तियों, तनों के विकास और वानस्पतिक वृद्धि के लिए मुख्य पोषक तत्व।',
    thresholds: {
      low: 280,
      high: 560
    },
    interpret: (val) => {
      if (val < 280) return { status: 'Low', statusKn: 'ಕಡಿಮೆ (ಕೊರತೆ)', statusHi: 'कम (कमी)', severity: 'warning', adjustmentFactor: 1.25 };
      if (val <= 560) return { status: 'Adequate / Medium', statusKn: 'ಸಾಕಷ್ಟು / ಮಧ್ಯಮ', statusHi: 'मध्यम / पर्याप्त', severity: 'success', adjustmentFactor: 1.0 };
      return { status: 'High', statusKn: 'ಹೆಚ್ಚು (ಅತಿಯಾದ)', statusHi: 'अधिक', severity: 'info', adjustmentFactor: 0.75 };
    }
  },
  phosphorus: {
    key: 'phosphorus',
    symbol: 'P',
    name: 'Available Phosphorus (P2O5)',
    kannadaName: 'ಲಭ್ಯವಿರುವ ರಂಜಕ (Phosphorus)',
    hindiName: 'उपलब्ध फास्फोरस (Phosphorus)',
    unit: 'kg/ha',
    testMethod: 'Olsen method (0.5M NaHCO3, pH 8.5) / Bray & Kurtz No. 1',
    role: 'Stimulates root development, flower initiation and early maturity',
    roleKn: 'ಬೇರುಗಳ ಸಮೃದ್ಧ ಬೆಳವಣಿಗೆ, ಹೂವು ಬಿಡುವಿಕೆ ಮತ್ತು ಶಕ್ತಿ ವರ್ಗಾವಣೆಗೆ ಅಗತ್ಯ.',
    roleHi: 'जड़ों के विकास, फूलों की शुरुआत और ऊर्जा हस्तांतरण के लिए महत्वपूर्ण।',
    thresholds: {
      low: 23,
      high: 56
    },
    interpret: (val) => {
      if (val < 23) return { status: 'Low', statusKn: 'ಕಡಿಮೆ (ಕೊರತೆ)', statusHi: 'कम (कमी)', severity: 'warning', adjustmentFactor: 1.25 };
      if (val <= 56) return { status: 'Adequate / Medium', statusKn: 'ಸಾಕಷ್ಟು / ಮಧ್ಯಮ', statusHi: 'मध्यम / पर्याप्त', severity: 'success', adjustmentFactor: 1.0 };
      return { status: 'High', statusKn: 'ಹೆಚ್ಚು (ಅತಿಯಾದ)', statusHi: 'अधिक', severity: 'info', adjustmentFactor: 0.75 };
    }
  },
  potassium: {
    key: 'potassium',
    symbol: 'K',
    name: 'Available Potassium (K2O)',
    kannadaName: 'ಲಭ್ಯವಿರುವ ಪೊಟ್ಯಾಶ್ (Potassium)',
    hindiName: 'उपलब्ध पोटेशियम (Potassium)',
    unit: 'kg/ha',
    testMethod: 'Neutral Normal Ammonium Acetate Extraction (Flame Photometry)',
    role: 'Improves disease resistance, drought tolerance and fruit quality/size',
    roleKn: 'ರೋಗ ನಿರೋಧಕ ಶಕ್ತಿ, ಬರ ಸಹಿಷ್ಣುತೆ ಮತ್ತು ಹಣ್ಣಿನ ಗುಣಮಟ್ಟ/ಗಾತ್ರ ಹೆಚ್ಚಿಸುತ್ತದೆ.',
    roleHi: 'रोग प्रतिरोधक क्षमता, सूखा सहनशीलता और फलों की गुणवत्ता बढ़ाता है।',
    thresholds: {
      low: 145,
      high: 337
    },
    interpret: (val) => {
      if (val < 145) return { status: 'Low', statusKn: 'ಕಡಿಮೆ (ಕೊರತೆ)', statusHi: 'कम (कमी)', severity: 'warning', adjustmentFactor: 1.25 };
      if (val <= 337) return { status: 'Adequate / Medium', statusKn: 'ಸಾಕಷ್ಟು / ಮಧ್ಯಮ', statusHi: 'मध्यम / पर्याप्त', severity: 'success', adjustmentFactor: 1.0 };
      return { status: 'High', statusKn: 'ಹೆಚ್ಚು (ಅತಿಯಾದ)', statusHi: 'अधिक', severity: 'info', adjustmentFactor: 0.75 };
    }
  },
  ph: {
    key: 'ph',
    symbol: 'pH',
    name: 'Soil Reaction (pH)',
    kannadaName: 'ಮಣ್ಣಿನ ಆಮ್ಲೀಯತೆ / ಕ್ಷಾರೀಯತೆ (pH)',
    hindiName: 'मृदा अभिक्रिया (pH मान)',
    unit: 'pH unit',
    testMethod: '1:2.5 Soil-Water Suspension (Potentiometric Glass Electrode)',
    role: 'Determines nutrient availability and biological microbial activity',
    roleKn: 'ಪೋಷಕಾಂಶಗಳ ಲಭ್ಯತೆ ಮತ್ತು ಸೂಕ್ಷ್ಮಜೀವಿಗಳ ಚಟುವಟಿಕೆಯನ್ನು ನಿಯಂತ್ರಿಸುತ್ತದೆ.',
    roleHi: 'पोषक तत्वों की उपलब्धता और सूक्ष्मजीव गतिविधि को नियंत्रित करता है।',
    interpret: (val) => {
      if (val < 5.5) return { status: 'Strongly Acidic', statusKn: 'ತೀವ್ರ ಆಮ್ಲೀಯ ಮಣ್ಣು (Acidic)', statusHi: 'अत्यधिक अम्लीय', severity: 'danger', amendment: 'Agricultural Lime (CaCO3)' };
      if (val < 6.5) return { status: 'Moderately Acidic', statusKn: 'ಮಧ್ಯಮ ಆಮ್ಲೀಯ ಮಣ್ಣು', statusHi: 'मध्यम अम्लीय', severity: 'warning', amendment: 'Light liming / Organic compost' };
      if (val <= 7.5) return { status: 'Neutral / Ideal', statusKn: 'ತಟಸ್ಥ / ಅತ್ಯುತ್ತಮ (Ideal)', statusHi: 'उदासीन / सर्वोत्तम', severity: 'success', amendment: 'None needed' };
      if (val <= 8.5) return { status: 'Moderately Alkaline', statusKn: 'ಮಧ್ಯಮ ಕ್ಷಾರೀಯ ಮಣ್ಣು (Alkaline)', statusHi: 'मध्यम क्षारीय', severity: 'warning', amendment: 'Organic manure & FYM' };
      return { status: 'Strongly Alkaline / Sodic', statusKn: 'ತೀವ್ರ ಕ್ಷಾರೀಯ / ಸವಳು ಮಣ್ಣು', statusHi: 'अत्यधिक क्षारीय', severity: 'danger', amendment: 'Agricultural Gypsum (CaSO4·2H2O)' };
    }
  },
  ec: {
    key: 'ec',
    symbol: 'EC',
    name: 'Electrical Conductivity (EC)',
    kannadaName: 'ವಿದ್ಯುತ್ ವಾಹಕತೆ / ಲವಣಾಂಶ (EC)',
    hindiName: 'विद्युत चालकता / लवणता (EC)',
    unit: 'dS/m',
    testMethod: '1:2 Soil-Water Extract Conductivity Meter at 25°C',
    role: 'Indicates total soluble salts and potential soil salinity hazards',
    roleKn: 'ಮಣ್ಣಿನಲ್ಲಿರುವ ಒಟ್ಟು ಕರಗಬಲ್ಲ ಲವಣಗಳ ಪ್ರಮಾಣ ಮತ್ತು ಸವಳು ಅಪಾಯವನ್ನು ಸೂಚಿಸುತ್ತದೆ.',
    roleHi: 'मृदा में घुलनशील लवणों की मात्रा और लवणता के खतरे को दर्शाता है।',
    interpret: (val) => {
      if (val < 1.0) return { status: 'Normal / Non-Saline', statusKn: 'ಸಾಮಾನ್ಯ (ಉತ್ತಮ)', statusHi: 'सामान्य (गैर-खारी)', severity: 'success' };
      if (val <= 2.0) return { status: 'Slightly Saline', statusKn: 'ಸ್ವಲ್ಪ ಲವಣಾಂಶ (ಎಚ್ಚರಿಕೆ)', statusHi: 'हल्का खारापन', severity: 'warning' };
      return { status: 'High Salinity / Harmful', statusKn: 'ಹೆಚ್ಚಿನ ಸವಳು (ಹಾನಿಕಾರಕ)', statusHi: 'उच्च लवणता (हानिकारक)', severity: 'danger' };
    }
  },
  organicCarbon: {
    key: 'organicCarbon',
    symbol: 'OC',
    name: 'Organic Carbon',
    kannadaName: 'ಸಾವಯವ ಇಂಗಾಲ (Organic Carbon)',
    hindiName: 'जैविक कार्बन (Organic Carbon)',
    unit: '%',
    testMethod: 'Walkley and Black Rapid Titration Method (1934)',
    role: 'Indicator of soil organic matter, microbial life, and water holding capacity',
    roleKn: 'ಮಣ್ಣಿನ ಫಲವತ್ತತೆ, ತೇವಾಂಶ ಧಾರಣ ಶಕ್ತಿ ಮತ್ತು ಜೈವಿಕ ಜೀವಾಂಶದ ಸೂಚಕ.',
    roleHi: 'मृदा स्वास्थ्य, सूक्ष्मजीव जीवन और जल धारण क्षमता का प्रमुख सूचक।',
    thresholds: {
      low: 0.50,
      high: 0.75
    },
    interpret: (val) => {
      if (val < 0.50) return { status: 'Low', statusKn: 'ಕಡಿಮೆ (ಬಡ ಮಣ್ಣು)', statusHi: 'कम (अल्प)', severity: 'warning', fymReq: 'Apply 10 tonnes FYM / Compost per ha' };
      if (val <= 0.75) return { status: 'Medium / Sufficient', statusKn: 'ಮಧ್ಯಮ (ಸಾಕಷ್ಟು)', statusHi: 'मध्यम', severity: 'success', fymReq: 'Apply 5 tonnes FYM per ha' };
      return { status: 'High / Rich', statusKn: 'ಹೆಚ್ಚು (ಸಮೃದ್ಧ)', statusHi: 'उच्च (उत्तम)', severity: 'success', fymReq: 'Maintain existing compost practices' };
    }
  },
  sulphur: {
    key: 'sulphur',
    symbol: 'S',
    name: 'Available Sulphur',
    kannadaName: 'ಗಂಧಕ (Sulphur)',
    hindiName: 'सल्फर (Sulphur)',
    unit: 'ppm (mg/kg)',
    testMethod: '0.15% CaCl2 Turbidimetric Method (Chesnin & Yien, 1950)',
    role: 'Essential for amino acids synthesis, chlorophyll and oil synthesis in oilseeds',
    roleKn: 'ಪ್ರೋಟೀನ್ ಮತ್ತು ಎಣ್ಣೆಯಂಶ ಉತ್ಪಾದನೆಗೆ ಅತ್ಯಾವಶ್ಯಕ.',
    roleHi: 'प्रोटीन और तिलहन में तेल उत्पादन के लिए आवश्यक।',
    thresholds: { low: 10.0 },
    interpret: (val) => {
      if (val < 10.0) return { status: 'Deficient', statusKn: 'ಕೊರತೆ ಇದೆ', statusHi: 'कमी', severity: 'warning', reqFert: 'Gypsum or Single Super Phosphate (SSP)' };
      return { status: 'Sufficient', statusKn: 'ಸಾಕಷ್ಟಿದೆ', statusHi: 'पर्याप्त', severity: 'success' };
    }
  },
  zinc: {
    key: 'zinc',
    symbol: 'Zn',
    name: 'Available Zinc',
    kannadaName: 'ಸತು (Zinc)',
    hindiName: 'जस्ता (Zinc)',
    unit: 'ppm (mg/kg)',
    testMethod: 'DTPA Extraction Method (Lindsay & Norvell, 1978; AAS)',
    role: 'Regulates auxin production, seed production, and internode elongation',
    roleKn: 'ಗಿಡದ ಬೆಳವಣಿಗೆಯ ಹಾರ್ಮೋನ್ ಮತ್ತು ಹೂ ಬಿಡುವಿಕೆಗೆ ಅಗತ್ಯ.',
    roleHi: 'पौधों के हार्मोन और तनों के बढ़ाव के लिए आवश्यक।',
    thresholds: { low: 0.60 },
    interpret: (val) => {
      if (val < 0.60) return { status: 'Deficient', statusKn: 'ಕೊರತೆ ಇದೆ', statusHi: 'कमी', severity: 'warning', reqFert: 'Zinc Sulphate (ZnSO4) @ 10-15 kg/acre' };
      return { status: 'Sufficient', statusKn: 'ಸಾಕಷ್ಟಿದೆ', statusHi: 'पर्याप्त', severity: 'success' };
    }
  },
  iron: {
    key: 'iron',
    symbol: 'Fe',
    name: 'Available Iron',
    kannadaName: 'ಕಬ್ಬಿಣದ ಅಂಶ (Iron)',
    hindiName: 'लौह तत्व (Iron)',
    unit: 'ppm (mg/kg)',
    testMethod: 'DTPA Extraction Method (AAS)',
    role: 'Chlorophyll synthesis and electron transport in plant respiration',
    roleKn: 'ಎಲೆಗಳಲ್ಲಿ ಹಸಿರು ಅಂಶ (ಕ್ಲೋರೊಫಿಲ್) ತಯಾರಿಕೆಗೆ ಅಗತ್ಯ.',
    roleHi: 'पत्तियों में क्लोरोफिल निर्माण और श्वसन के लिए जरूरी।',
    thresholds: { low: 4.50 },
    interpret: (val) => {
      if (val < 4.50) return { status: 'Deficient', statusKn: 'ಕೊರತೆ ಇದೆ', statusHi: 'कमी', severity: 'warning', reqFert: 'Ferrous Sulphate (FeSO4)' };
      return { status: 'Sufficient', statusKn: 'ಸಾಕಷ್ಟಿದೆ', statusHi: 'पर्याप्त', severity: 'success' };
    }
  },
  copper: {
    key: 'copper',
    symbol: 'Cu',
    name: 'Available Copper',
    kannadaName: 'ತಾಮ್ರದ ಅಂಶ (Copper)',
    hindiName: 'तांबा (Copper)',
    unit: 'ppm (mg/kg)',
    testMethod: 'DTPA Extraction Method (AAS)',
    role: 'Catalyst for respiration and reproductive phase',
    roleKn: 'ಕಿಣ್ವಗಳ ಚಟುವಟಿಕೆ ಮತ್ತು ಸಂತಾನೋತ್ಪತ್ತಿಗೆ ಅವಶ್ಯಕ.',
    roleHi: 'एंजाइम क्रिया और प्रजनन चरण के लिए आवश्यक।',
    thresholds: { low: 0.20 },
    interpret: (val) => {
      if (val < 0.20) return { status: 'Deficient', statusKn: 'ಕೊರತೆ ಇದೆ', statusHi: 'कमी', severity: 'warning', reqFert: 'Copper Sulphate (CuSO4)' };
      return { status: 'Sufficient', statusKn: 'ಸಾಕಷ್ಟಿದೆ', statusHi: 'पर्याप्त', severity: 'success' };
    }
  },
  manganese: {
    key: 'manganese',
    symbol: 'Mn',
    name: 'Available Manganese',
    kannadaName: 'ಮ್ಯಾಂಗನೀಸ್ (Manganese)',
    hindiName: 'मैंगनीज (Manganese)',
    unit: 'ppm (mg/kg)',
    testMethod: 'DTPA Extraction Method (AAS)',
    role: 'Essential for photosynthetic oxygen evolution and nitrogen assimilation',
    roleKn: 'ದ್ಯುತಿಸಂಶ್ಲೇಷಣೆ ಮತ್ತು ನೈಟ್ರೋಜನ್ ಹೀರಿಕೊಳ್ಳುವಿಕೆಗೆ ಸಹಕಾರಿ.',
    roleHi: 'प्रकाश संश्लेषण और नाइट्रोजन अवशोषण के लिए सहायक।',
    thresholds: { low: 2.00 },
    interpret: (val) => {
      if (val < 2.00) return { status: 'Deficient', statusKn: 'ಕೊರತೆ ಇದೆ', statusHi: 'कमी', severity: 'warning', reqFert: 'Manganese Sulphate (MnSO4)' };
      return { status: 'Sufficient', statusKn: 'ಸಾಕಷ್ಟಿದೆ', statusHi: 'पर्याप्त', severity: 'success' };
    }
  },
  boron: {
    key: 'boron',
    symbol: 'B',
    name: 'Available Boron',
    kannadaName: 'ಬೋರಾನ್ (Boron)',
    hindiName: 'बोरोन (Boron)',
    unit: 'ppm (mg/kg)',
    testMethod: 'Hot Water Soluble Method (Azomethine-H spectrophotometry)',
    role: 'Critical for pollen tube growth, fruit setting and preventing fruit cracking',
    roleKn: 'ಪರಾಗಸ್ಪರ್ಶ, ಹೂ ಕಾಯಿ ಕಟ್ಟಲು ಮತ್ತು ಹಣ್ಣು ಬಿರುಕು ಬಿಡುವುದನ್ನು ತಡೆಯಲು ಅಗತ್ಯ.',
    roleHi: 'पराग नलिका विकास, फल बनने और फल फटने से रोकने में महत्वपूर्ण।',
    thresholds: { low: 0.50 },
    interpret: (val) => {
      if (val < 0.50) return { status: 'Deficient', statusKn: 'ಕೊರತೆ ಇದೆ', statusHi: 'कमी', severity: 'warning', reqFert: 'Borax @ 4-5 kg/acre or Solubor foliar' };
      return { status: 'Sufficient', statusKn: 'ಸಾಕಷ್ಟಿದೆ', statusHi: 'पर्याप्त', severity: 'success' };
    }
  }
};
