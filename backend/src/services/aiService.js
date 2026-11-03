// AI Explanation Service - Multilingual Grounded Advisor (Gemini API + Grounded Fallback Engine)

export async function generateAdvisoryExplanation({
  language = 'kn', // 'kn' (Kannada), 'en' (English), 'hi' (Hindi)
  cropProfile,
  soilAnalysis,
  nutrientRec,
  irrigationRec,
  userQuestion = null
}) {
  const cropName = cropProfile?.cropName || nutrientRec?.crop?.name || 'Crop';
  const cropKn = nutrientRec?.crop?.kannadaName || cropName;
  const cropHi = nutrientRec?.crop?.hindiName || cropName;
  const area = cropProfile?.farmArea || nutrientRec?.farmProfile?.area || 1;
  const areaUnit = cropProfile?.areaUnit || 'acre';
  const apiKey = process.env.GEMINI_API_KEY;

  // If a specific farmer question is asked:
  if (userQuestion) {
    if (apiKey) {
      try {
        const prompt = `You are AgroSense AI, a compassionate and expert agricultural scientist for Indian farmers in Karnataka.
Language: Respond in ${language === 'kn' ? 'Kannada (ಕನ್ನಡ)' : language === 'hi' ? 'Hindi (हिंदी)' : 'English'}.
Strict agricultural ground rules:
1. Base your answer strictly on the farmer's verified data provided below.
2. DO NOT hallucinate arbitrary fertilizer doses. Stick to the calculated fertilizers: Urea, DAP, MOP/SOP, Zinc, Borax.
3. A soil test report does NOT measure instantaneous moisture.
4. Keep the tone practical, encouraging, and easy for a rural farmer to understand.

Farmer Profile & Calculation Context:
- Crop: ${cropName} (${cropKn})
- Farm Area: ${area} ${areaUnit}
- Growth Stage: ${cropProfile?.growthStage || 'Vegetative'}
- Irrigation Method: ${cropProfile?.irrigationMethod || 'Drip'}
- Soil pH: ${soilAnalysis?.parameters?.ph?.value} (${soilAnalysis?.summary?.phCondition})
- Deficiencies: ${soilAnalysis?.summary?.deficiencies?.map(d => d.name).join(', ')}
- Recommended Fertilizers: ${nutrientRec?.commercialFertilizers?.map(f => `${f.name}: ${f.totalKg} kg (${f.bagCountText})`).join('; ')}
- Irrigation: ${irrigationRec?.operationalSchedule?.recommendedSchedule} (${irrigationRec?.waterBalance?.dailyLitresTotal} Litres/day)

Farmer's Question: "${userQuestion}"`;

        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.2, maxOutputTokens: 600 }
          })
        });

        if (geminiRes.ok) {
          const gemData = await geminiRes.json();
          const answer = gemData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (answer) return { response: answer, source: 'Gemini AI' };
        }
      } catch (e) {
        // Fall back to rule-grounded response
      }
    }

    return getGroundedQuestionAnswer(userQuestion, language, {
      cropName, cropKn, cropHi, area, soilAnalysis, nutrientRec, irrigationRec
    });
  }

  // Generate full structured advisory explanation
  if (language === 'kn') {
    return generateKannadaAdvisory({ cropKn, area, areaUnit, soilAnalysis, nutrientRec, irrigationRec });
  } else if (language === 'hi') {
    return generateHindiAdvisory({ cropHi, area, areaUnit, soilAnalysis, nutrientRec, irrigationRec });
  } else {
    return generateEnglishAdvisory({ cropName, area, areaUnit, soilAnalysis, nutrientRec, irrigationRec });
  }
}

// 1. Kannada Advisory Generator
function generateKannadaAdvisory({ cropKn, area, areaUnit, soilAnalysis, nutrientRec, irrigationRec }) {
  const defs = soilAnalysis?.summary?.deficiencies?.map(d => d.kannadaName || d.name) || [];
  const ferts = nutrientRec?.commercialFertilizers || [];
  const urea = ferts.find(f => f.name.includes('Urea'));
  const dap = ferts.find(f => f.name.includes('DAP'));
  const pot = ferts.find(f => f.name.includes('Potash'));

  const soilStory = `ನಿಮ್ಮ ${area} ${areaUnit === 'acre' ? 'ಎಕರೆ' : 'ಹೆಕ್ಟೇರ್'} ಜಮೀನಿನ ಮಣ್ಣಿನ ಪರೀಕ್ಷಾ ವರದಿಯನ್ನು ಕೃಷಿ ವಿಜ್ಞಾನ ಕೇಂದ್ರದ ಮಾನದಂಡಗಳ ಪ್ರಕಾರ ಪರಿಶೀಲಿಸಲಾಗಿದೆ. ಒಟ್ಟಾರೆ ಮಣ್ಣಿನ ಫಲವತ್ತತೆಯ ಅಂಕ ${soilAnalysis?.summary?.overallHealthScore}/100 ಆಗಿದೆ (${soilAnalysis?.summary?.overallHealthKn}).`;

  const nutrientStory = defs.length > 0
    ? `ಮುಖ್ಯವಾಗಿ ಮಣ್ಣಿನಲ್ಲಿ ${defs.join(', ')} ಪೋಷಕಾಂಶಗಳ ಕೊರತೆ ಕಂಡುಬಂದಿದೆ. ${cropKn} ಬೆಳೆಗೆ ಉತ್ತಮ ಇಳುವರಿ ಪಡೆಯಲು ನಿಗದಿತ ರಸಗೊಬ್ಬರಗಳನ್ನು ನಿಗದಿತ ಹಂತಗಳಲ್ಲಿ ನೀಡಬೇಕು:\n- ${urea?.kannadaName || 'ಯೂರಿಯಾ'}: ${urea?.totalKg || 0} ಕೆಜಿ (${urea?.bagCountText || ''})\n- ${dap?.kannadaName || 'ಡಿಎಪಿ'}: ${dap?.totalKg || 0} ಕೆಜಿ (${dap?.bagCountText || ''})\n- ${pot?.kannadaName || 'ಪೊಟ್ಯಾಶ್'}: ${pot?.totalKg || 0} ಕೆಜಿ (${pot?.bagCountText || ''})`
    : `ನಿಮ್ಮ ಮಣ್ಣಿನಲ್ಲಿ ಪ್ರಮುಖ ಪೋಷಕಾಂಶಗಳು ಸಮತೋಲನದಲ್ಲಿವೆ. ಅತಿಯಾಗಿ ರಸಗೊಬ್ಬರ ನೀಡದೆ ಶಿಫಾರಸು ಮಾಡಿದ ಪ್ರಮಾಣವನ್ನು ಮಾತ್ರ ಪಾಲಿಸಿ.`;

  const irrigationStory = irrigationRec?.operationalSchedule?.shouldIrrigate
    ? `ನಿಖರ ನೀರಾವರಿ ಸಲಹೆ: ಇಂದಿನ ಹವಾಮಾನ ಮತ್ತು ಬೆಳೆಯ ನೀರಿನ ಆವಿಯಾಗುವಿಕೆಯ ಲೆಕ್ಕಾಚಾರದಂತೆ ನಿಮ್ಮ ಬೆಳೆಗೆ ದಿನಕ್ಕೆ ಸುಮಾರು ${irrigationRec?.waterBalance?.dailyLitresTotal?.toLocaleString()} ಲೀಟರ್ ನೀರು ಬೇಕಾಗುತ್ತದೆ. ಶಿಫಾರಸು: ${irrigationRec?.operationalSchedule?.recommendedScheduleKn}.`
    : `ಮಳೆಯ ಮುನ್ಸೂಚನೆ ಅಥವಾ ತೇವಾಂಶ ಸಮರ್ಪಕವಾಗಿರುವುದರಿಂದ ಸದ್ಯಕ್ಕೆ ನೀರು ಹಾಯಿಸುವುದನ್ನು ಮುಂದೂಡಿ. ${irrigationRec?.operationalSchedule?.decisionReasonKn}`;

  const amendmentStory = nutrientRec?.amendments?.length > 0
    ? `ಮಣ್ಣಿನ ಸುಧಾರಣೆ ಅಗತ್ಯತೆಗಳು: ${nutrientRec.amendments.map(a => `${a.itemKn} (${a.bags}) - ${a.reasonKn}`).join('; ')}.`
    : `ಮಣ್ಣಿನ pH ಮತ್ತು ಸಾವಯವ ಮಟ್ಟ ಸಾಮಾನ್ಯವಾಗಿದೆ.`;

  return {
    language: 'kn',
    title: `${cropKn} ಬೆಳೆಗಾರರಿಗೆ ಕೃಷಿ ಸಲಹಾ ವರದಿ`,
    soilHealthSummary: soilStory,
    nutrientAdvice: nutrientStory,
    irrigationAdvice: irrigationStory,
    amendmentAdvice: amendmentStory,
    disclaimer: 'ಗಮನಿಸಿ: ಈ ಸಲಹೆಯು ಯು.ಎ.ಎಸ್ ಬೆಂಗಳೂರು ಪ್ಯಾಕೇಜ್ ಆಫ್ ಪ್ರಾಕ್ಟೀಸಸ್ ಮತ್ತು ಐ.ಸಿ.ಎ.ಆರ್ ಪದ್ಧತಿಯನ್ನು ಆಧರಿಸಿದೆ.',
    voiceNarrationText: `${soilStory} ${nutrientStory} ${irrigationStory}`
  };
}

// 2. Hindi Advisory Generator
function generateHindiAdvisory({ cropHi, area, areaUnit, soilAnalysis, nutrientRec, irrigationRec }) {
  const defs = soilAnalysis?.summary?.deficiencies?.map(d => d.hindiName || d.name) || [];
  const ferts = nutrientRec?.commercialFertilizers || [];
  const urea = ferts.find(f => f.name.includes('Urea'));
  const dap = ferts.find(f => f.name.includes('DAP'));
  const pot = ferts.find(f => f.name.includes('Potash'));

  const soilStory = `आपके ${area} ${areaUnit === 'acre' ? 'एकड़' : 'हेक्टेयर'} खेत की मृदा रिपोर्ट का विश्लेषण किया गया है। मिट्टी का कुल स्वास्थ्य स्कोर ${soilAnalysis?.summary?.overallHealthScore}/100 है (${soilAnalysis?.summary?.overallHealthHi})।`;

  const nutrientStory = defs.length > 0
    ? `खेत में मुख्य रूप से ${defs.join(', ')} की कमी पाई गई है। ${cropHi} की भरपूर पैदावार के लिए संस्तुत उर्वरक:\n- ${urea?.hindiName || 'यूरिया'}: ${urea?.totalKg || 0} किग्रा (${urea?.bagCountText || ''})\n- ${dap?.hindiName || 'डीएपी'}: ${dap?.totalKg || 0} किग्रा (${dap?.bagCountText || ''})\n- ${pot?.hindiName || 'पोटाश'}: ${pot?.totalKg || 0} किग्रा (${pot?.bagCountText || ''})`
    : `आपकी मिट्टी में मुख्य पोषक तत्व संतुलित हैं। संस्तुत मात्रा से अधिक खाद न डालें।`;

  const irrigationStory = irrigationRec?.operationalSchedule?.shouldIrrigate
    ? `सटीक सिंचाई सलाह: आज के तापमान और वाष्पोत्सर्जन के अनुसार फसल को प्रतिदिन लगभग ${irrigationRec?.waterBalance?.dailyLitresTotal?.toLocaleString()} लीटर पानी की आवश्यकता है। अनुसूची: ${irrigationRec?.operationalSchedule?.recommendedScheduleHi}।`
    : `मौसम पूर्वानुमान और पर्याप्त नमी के कारण अभी सिंचाई स्थगित करें। ${irrigationRec?.operationalSchedule?.decisionReasonHi}`;

  const amendmentStory = nutrientRec?.amendments?.length > 0
    ? `मृदा सुधार उपाय: ${nutrientRec.amendments.map(a => `${a.itemHi} (${a.bags}) - ${a.reasonHi}`).join('; ')}.`
    : `मृदा pH और जैविक कार्बन सामान्य स्तर पर हैं।`;

  return {
    language: 'hi',
    title: `${cropHi} उत्पादकों हेतु कृषि परामर्श`,
    soilHealthSummary: soilStory,
    nutrientAdvice: nutrientStory,
    irrigationAdvice: irrigationStory,
    amendmentAdvice: amendmentStory,
    disclaimer: 'सूचना: यह परामर्श आईसीएआर और कृषि विश्वविद्यालय की प्रमाणित पद्धतियों पर आधारित है।',
    voiceNarrationText: `${soilStory} ${nutrientStory} ${irrigationStory}`
  };
}

// 3. English Advisory Generator
function generateEnglishAdvisory({ cropName, area, areaUnit, soilAnalysis, nutrientRec, irrigationRec }) {
  const defs = soilAnalysis?.summary?.deficiencies?.map(d => d.name) || [];
  const ferts = nutrientRec?.commercialFertilizers || [];
  const urea = ferts.find(f => f.name.includes('Urea'));
  const dap = ferts.find(f => f.name.includes('DAP'));
  const pot = ferts.find(f => f.name.includes('Potash'));

  const soilStory = `Soil test report for your ${area} ${areaUnit} farm has been evaluated against ICAR & Soil Health Card standards. Overall soil health score is ${soilAnalysis?.summary?.overallHealthScore}/100 (${soilAnalysis?.summary?.overallHealth}).`;

  const nutrientStory = defs.length > 0
    ? `Significant deficiencies identified: ${defs.join(', ')}. To achieve target yield for ${cropName}, apply the following commercially packaged fertilizers:\n- ${urea?.name || 'Urea'}: ${urea?.totalKg || 0} kg (${urea?.bagCountText || ''})\n- ${dap?.name || 'DAP'}: ${dap?.totalKg || 0} kg (${dap?.bagCountText || ''})\n- ${pot?.name || 'Potash'}: ${pot?.totalKg || 0} kg (${pot?.bagCountText || ''})`
    : `Primary nutrients are within adequate ranges. Follow maintenance dosage to prevent nutrient depletion.`;

  const irrigationStory = irrigationRec?.operationalSchedule?.shouldIrrigate
    ? `Precision Irrigation: Based on current weather and crop evapotranspiration (ETc: ${irrigationRec?.evapotranspiration?.etc_mm} mm/day), crop water demand is ${irrigationRec?.waterBalance?.dailyLitresTotal?.toLocaleString()} Litres/day. Recommended schedule: ${irrigationRec?.operationalSchedule?.recommendedSchedule}.`
    : `Irrigation not required currently. Reason: ${irrigationRec?.operationalSchedule?.decisionReason}`;

  const amendmentStory = nutrientRec?.amendments?.length > 0
    ? `Soil Amendments: ${nutrientRec.amendments.map(a => `${a.item} (${a.bags}): ${a.reason}`).join('; ')}.`
    : `Soil reaction (pH) and Organic Carbon are within optimal agricultural ranges.`;

  return {
    language: 'en',
    title: `AgroSense AI Advisory for ${cropName}`,
    soilHealthSummary: soilStory,
    nutrientAdvice: nutrientStory,
    irrigationAdvice: irrigationStory,
    amendmentAdvice: amendmentStory,
    disclaimer: 'Notice: Recommendations formulated using UAS Bengaluru Package of Practices and FAO-56 CropWat standards.',
    voiceNarrationText: `${soilStory} ${nutrientStory} ${irrigationStory}`
  };
}

// Grounded fallback Q&A engine
function getGroundedQuestionAnswer(q, lang, ctx) {
  const query = q.toLowerCase();

  // Nitrogen question
  if (query.includes('nitrogen') || query.includes('ಯೂರಿಯಾ') || query.includes('ಸಾರಜನಕ') || query.includes('यूरिया') || query.includes('नाइट्रोजन')) {
    if (lang === 'kn') {
      return {
        response: `ಸಾರಜನಕ (Nitrogen) ಎಲೆಗಳು ಮತ್ತು ಕಾಂಡಗಳ ಹಸಿರು ಸಮೃದ್ಧ ಬೆಳವಣಿಗೆಗೆ ಮುಖ್ಯ. ನಿಮ್ಮ ಮಣ್ಣಿನಲ್ಲಿ ಸಾರಜನಕ ಕೊರತೆಯಿರುವುದರಿಂದ ${ctx.nutrientRec?.commercialFertilizers?.[0]?.totalKg} ಕೆಜಿ ಯೂರಿಯಾವನ್ನು ನಾಟಿ ಮತ್ತು ಬೆಳವಣಿಗೆಯ ಹಂತಗಳಲ್ಲಿ ವಿಭಜಿಸಿ ನೀಡುವುದು ಸೂಕ್ತ.`,
        source: 'AgroSense Grounded Advisory'
      };
    } else if (lang === 'hi') {
      return {
        response: `नाइट्रोजन पत्तियों और तनों की बढ़वार के लिए आवश्यक है। आपके खेत के लिए ${ctx.nutrientRec?.commercialFertilizers?.[0]?.totalKg} किग्रा यूरिया को विभिन्न चरणों में विभाजित करके देना चाहिए।`,
        source: 'AgroSense Grounded Advisory'
      };
    } else {
      return {
        response: `Nitrogen drives leafy vegetative growth and chlorophyll synthesis. Based on your soil deficit, apply ${ctx.nutrientRec?.commercialFertilizers?.[0]?.totalKg} kg Urea split across basal and top-dressing stages.`,
        source: 'AgroSense Grounded Advisory'
      };
    }
  }

  // Water / Irrigation question
  if (query.includes('water') || query.includes('irrigation') || query.includes('ನೀರು') || query.includes('ನೀರಾವರಿ') || query.includes('पानी') || query.includes('सिंचाई')) {
    if (lang === 'kn') {
      return {
        response: `ಇಂದಿನ ಲೆಕ್ಕಾಚಾರದಂತೆ ${ctx.cropKn} ಬೆಳೆಗೆ ದಿನಕ್ಕೆ ${ctx.irrigationRec?.waterBalance?.dailyLitresTotal?.toLocaleString()} ಲೀಟರ್ ನೀರು ಅಗತ್ಯವಿದೆ. ಶಿಫಾರಸು: ${ctx.irrigationRec?.operationalSchedule?.recommendedScheduleKn}. ಹನಿ ನೀರಾವರಿ ಬಳಸುವುದರಿಂದ ಸುಮಾರು ${ctx.irrigationRec?.waterConservation?.savingsPercent || 40}% ನೀರು ಉಳಿತಾಯವಾಗುತ್ತದೆ.`,
        source: 'AgroSense Precision Irrigation'
      };
    } else if (lang === 'hi') {
      return {
        response: `आज की गणना के अनुसार फसल को प्रतिदिन ${ctx.irrigationRec?.waterBalance?.dailyLitresTotal?.toLocaleString()} लीटर पानी चाहिए। सलाह: ${ctx.irrigationRec?.operationalSchedule?.recommendedScheduleHi}। ड्रिप से ${ctx.irrigationRec?.waterConservation?.savingsPercent || 40}% जल संरक्षण होगा।`,
        source: 'AgroSense Precision Irrigation'
      };
    } else {
      return {
        response: `Based on FAO-56 evapotranspiration modeling, your crop requires ${ctx.irrigationRec?.waterBalance?.dailyLitresTotal?.toLocaleString()} Litres/day. Recommended schedule: ${ctx.irrigationRec?.operationalSchedule?.recommendedSchedule}. Using drip irrigation saves ${ctx.irrigationRec?.waterConservation?.savingsPercent || 40}% water compared to furrow flood.`,
        source: 'AgroSense Precision Irrigation'
      };
    }
  }

  // pH question
  if (query.includes('ph') || query.includes('ಆಮ್ಲ') || query.includes('ಕ್ಷಾರ') || query.includes('अम्लीय') || query.includes('क्षारीय') || query.includes('acid') || query.includes('alkaline')) {
    const ph = ctx.soilAnalysis?.parameters?.ph?.value || 7.0;
    if (lang === 'kn') {
      return {
        response: `ನಿಮ್ಮ ಮಣ್ಣಿನ pH ಮೌಲ್ಯ ${ph} ಆಗಿದೆ. ${ph > 8.0 ? 'ಮಣ್ಣು ಕ್ಷಾರೀಯವಾಗಿದ್ದು, ಜಿಪ್ಸಮ್ ಮತ್ತು ಕಾಂಪೋಸ್ಟ್ ಗೊಬ್ಬರ ಬಳಸಬೇಕು.' : ph < 6.0 ? 'ಮಣ್ಣು ಆಮ್ಲೀಯವಾಗಿದ್ದು, ಕೃಷಿ ಸುಣ್ಣ (Lime) ಬಳಸಿ pH ಸಮತೋಲನಗೊಳಿಸಬೇಕು.' : 'ಮಣ್ಣಿನ pH ತಟಸ್ಥವಾಗಿದ್ದು, ಎಲ್ಲಾ ಪೋಷಕಾಂಶಗಳು ಗಿಡಕ್ಕೆ ಸುಲಭವಾಗಿ ಸಿಗುತ್ತವೆ.'}`,
        source: 'AgroSense Soil Science'
      };
    } else if (lang === 'hi') {
      return {
        response: `आपकी मिट्टी का pH ${ph} है। ${ph > 8.0 ? 'मृदा क्षारीय है, जिप्सम का प्रयोग करें।' : ph < 6.0 ? 'मृदा अम्लीय है, कृषि चूना का प्रयोग करें।' : 'pH मान आदर्श (उदासीन) है, सभी तत्व सुगमता से मिलेंगे।'}`,
        source: 'AgroSense Soil Science'
      };
    } else {
      return {
        response: `Your soil pH is ${ph}. ${ph > 8.0 ? 'It is moderately alkaline. Apply agricultural gypsum and organic manure.' : ph < 6.0 ? 'It is acidic. Apply agricultural lime to neutralize acidity.' : 'It is neutral and ideal for maximum nutrient bioavailability.'}`,
        source: 'AgroSense Soil Science'
      };
    }
  }

  // General default answer
  if (lang === 'kn') {
    return {
      response: `ನಿಮ್ಮ ${ctx.cropKn} ಬೆಳೆಗೆ ಮಣ್ಣು ಪರೀಕ್ಷೆ ಮತ್ತು ಹವಾಮಾನ ಆಧಾರಿತ ನಿಖರ ಲೆಕ್ಕಾಚಾರ ಮಾಡಲಾಗಿದೆ. ಪೋಷಕಾಂಶಗಳ ಸಮತೋಲನಕ್ಕಾಗಿ ನಿಗದಿತ ಯೂರಿಯಾ, ಡಿಎಪಿ ಮತ್ತು ಪೊಟ್ಯಾಶ್ ಗೊಬ್ಬರಗಳನ್ನು ಹಂತ ಹಂತವಾಗಿ ನೀಡಿ. ಹೆಚ್ಚಿನ ಮಾಹಿತಿಗಾಗಿ ನಿರ್ದಿಷ್ಟ ಪ್ರಶ್ನೆ ಕೇಳಬಹುದು.`,
      source: 'AgroSense AI Assistant'
    };
  } else if (lang === 'hi') {
    return {
      response: `आपकी ${ctx.cropHi} फसल के लिए वैज्ञानिक गणना पूर्ण है। संतुलित मात्रा में खाद डालें और ड्रिप सिंचाई से पानी की बचत करें। कोई भी प्रश्न पूछने के लिए स्वतंत्र महसूस करें।`,
      source: 'AgroSense AI Assistant'
    };
  } else {
    return {
      response: `AgroSense AI has synthesized your soil parameters and precision crop model. Follow the split fertilizer schedule and drip irrigation run times for optimal yield and water conservation.`,
      source: 'AgroSense AI Assistant'
    };
  }
}
