import { SOIL_PARAMETERS } from '../data/standards.js';

export function analyzeSoilHealth(parameters, language = 'en') {
  if (!parameters || typeof parameters !== 'object') {
    throw new Error('Valid soil parameters object required');
  }

  const analysis = {
    parameters: {},
    summary: {
      overallHealth: 'Good',
      overallHealthScore: 80, // out of 100
      deficiencies: [],
      excesses: [],
      criticalAlerts: [],
      phCondition: '',
      salinityCondition: '',
      organicCarbonStatus: ''
    },
    explanations: []
  };

  let deficiencyPenalty = 0;
  let criticalPenalty = 0;

  for (const [key, paramMeta] of Object.entries(SOIL_PARAMETERS)) {
    const userVal = parameters[key];
    const numericVal = typeof userVal === 'object' && userVal !== null ? parseFloat(userVal.value) : parseFloat(userVal);

    if (isNaN(numericVal)) {
      analysis.parameters[key] = {
        name: paramMeta.name,
        symbol: paramMeta.symbol,
        value: null,
        unit: paramMeta.unit,
        status: 'Not Tested / Missing',
        statusKn: 'ಪರೀಕ್ಷಿಸಿಲ್ಲ / ಲಭ್ಯವಿಲ್ಲ',
        statusHi: 'परीक्षण नहीं किया गया',
        severity: 'secondary',
        explanation: 'Parameter value was not available in the test report.',
        testMethod: paramMeta.testMethod
      };
      continue;
    }

    const interpretation = paramMeta.interpret(numericVal);
    const item = {
      key,
      symbol: paramMeta.symbol,
      name: paramMeta.name,
      kannadaName: paramMeta.kannadaName,
      hindiName: paramMeta.hindiName,
      value: numericVal,
      unit: (typeof userVal === 'object' && userVal?.unit) ? userVal.unit : paramMeta.unit,
      testMethod: (typeof userVal === 'object' && userVal?.method) ? userVal.method : paramMeta.testMethod,
      confidence: (typeof userVal === 'object' && userVal?.confidence) ? userVal.confidence : 0.95,
      ...interpretation,
      role: paramMeta.role,
      roleKn: paramMeta.roleKn,
      roleHi: paramMeta.roleHi
    };

    analysis.parameters[key] = item;

    // Evaluate summary indicators
    if (key === 'ph') {
      analysis.summary.phCondition = interpretation.status;
      if (numericVal < 5.5 || numericVal > 8.5) {
        criticalPenalty += 15;
        analysis.summary.criticalAlerts.push({
          parameter: 'pH',
          alert: numericVal < 5.5 ? 'Soil is Strongly Acidic (pH < 5.5). Lime application is required.' : 'Soil is Strongly Alkaline (pH > 8.5). Gypsum treatment required.',
          alertKn: numericVal < 5.5 ? 'ಮಣ್ಣು ತೀವ್ರ ಆಮ್ಲೀಯವಾಗಿದೆ (pH < 5.5). ಕೃಷಿ ಸುಣ್ಣ ಬಳಸಬೇಕು.' : 'ಮಣ್ಣು ತೀವ್ರ ಕ್ಷಾರೀಯವಾಗಿದೆ (pH > 8.5). ಜಿಪ್ಸಮ್ ಚಿಕಿತ್ಸೆ ಅಗತ್ಯ.',
          alertHi: numericVal < 5.5 ? 'मृदा अत्यधिक अम्लीय है। चूना प्रयोग करें।' : 'मृदा अत्यधिक क्षारीय है। जिप्सम उपचार आवश्यक है।'
        });
      }
    } else if (key === 'ec') {
      analysis.summary.salinityCondition = interpretation.status;
      if (numericVal > 2.0) {
        criticalPenalty += 15;
        analysis.summary.criticalAlerts.push({
          parameter: 'EC',
          alert: 'Soil Salinity is elevated (> 2.0 dS/m). Root burn risk exists. Avoid chloride fertilizers.',
          alertKn: 'ಮಣ್ಣಿನಲ್ಲಿ ಲವಣಾಂಶ ಹೆಚ್ಚಾಗಿದೆ (> 2.0 dS/m). ಕ್ಲೋರೈಡ್ ರಹಿತ ಗೊಬ್ಬರ (SOP) ಬಳಸಿ.',
          alertHi: 'मृदा में लवणता अधिक है। जड़ों को नुकसान हो सकता है। सल्फेट युक्त खाद का प्रयोग करें।'
        });
      }
    } else if (key === 'organicCarbon') {
      analysis.summary.organicCarbonStatus = interpretation.status;
      if (numericVal < 0.50) {
        deficiencyPenalty += 10;
        analysis.summary.criticalAlerts.push({
          parameter: 'Organic Carbon',
          alert: 'Soil Organic Carbon is deficient (< 0.50%). Soil biological life and water holding capacity are low. Add FYM/compost.',
          alertKn: 'ಸಾವಯವ ಇಂಗಾಲದ ಕೊರತೆಯಿದೆ (< 0.50%). ಮಣ್ಣಿನ ಜೀವಂತಿಕೆ ಮತ್ತು ತೇವಾಂಶ ಧಾರಣ ಶಕ್ತಿಗೆ ಕಾಂಪೋಸ್ಟ್/ಸೆಗಣಿ ಗೊಬ್ಬರ ಹಾಕಿ.',
          alertHi: 'जैविक कार्बन की कमी है। गोबर की खाद या कम्पोस्ट डालें।'
        });
      }
    } else {
      // Nutrients (N, P, K, micronutrients)
      if (interpretation.status.includes('Low') || interpretation.status === 'Deficient') {
        deficiencyPenalty += 8;
        analysis.summary.deficiencies.push({
          key,
          name: paramMeta.name,
          kannadaName: paramMeta.kannadaName,
          hindiName: paramMeta.hindiName,
          value: numericVal,
          unit: item.unit,
          status: interpretation.status,
          severity: 'warning'
        });
      } else if (interpretation.status.includes('High')) {
        analysis.summary.excesses.push({
          key,
          name: paramMeta.name,
          value: numericVal,
          unit: item.unit
        });
      }
    }
  }

  const rawScore = Math.max(35, 100 - deficiencyPenalty - criticalPenalty);
  analysis.summary.overallHealthScore = Math.round(rawScore);

  if (rawScore >= 80) {
    analysis.summary.overallHealth = 'Good / Healthy Soil';
    analysis.summary.overallHealthKn = 'ಉತ್ತಮ / ಫಲವತ್ತಾದ ಮಣ್ಣು';
    analysis.summary.overallHealthHi = 'उत्कृष्ट / उपजाऊ मृदा';
  } else if (rawScore >= 60) {
    analysis.summary.overallHealth = 'Moderate / Requires Nutrient Attention';
    analysis.summary.overallHealthKn = 'ಮಧ್ಯಮ / ಪೋಷಕಾಂಶಗಳ ಸಮತೋಲನ ಅಗತ್ಯ';
    analysis.summary.overallHealthHi = 'मध्यम / पोषक तत्व प्रबंधन आवश्यक';
  } else {
    analysis.summary.overallHealth = 'Degraded / Significant Deficiencies Detected';
    analysis.summary.overallHealthKn = 'ಬಡ ಮಣ್ಣು / ತೀವ್ರ ಕೊರತೆಗಳನ್ನು ಸರಿಪಡಿಸಬೇಕು';
    analysis.summary.overallHealthHi = 'अल्प उपजाऊ / त्वरित सुधार आवश्यक';
  }

  return analysis;
}
