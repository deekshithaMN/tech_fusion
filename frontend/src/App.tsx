import React, { useState, useEffect } from 'react';
import {
  Language,
  NavigationTab,
  SoilReport,
  CropProfile,
  SoilAnalysisSummary,
  FertilizerRecommendation,
  IrrigationAdvisory,
  AIAdvisoryExplanation,
  SoilParametersMap,
  FarmerProfile,
  CropDiagnosis
} from './types';
import { SAMPLES } from './data/sampleReports';
import { Header } from './components/Header';
import { TabHome } from './components/TabHome';
import { TabSoil } from './components/TabSoil';
import { TabAnalyseCrop } from './components/TabAnalyseCrop';
import { TabAdvisory } from './components/TabAdvisory';
import { TabProfile } from './components/TabProfile';
import { storageService } from './services/storage';
import {
  analyzeSoilApi,
  recommendNutrientsApi,
  recommendIrrigationApi,
  generateAdvisoryExplanationApi
} from './services/api';
import {
  localAnalyzeSoil,
  localRecommendNutrients,
  localRecommendIrrigation,
  localGenerateAdvisoryExplanation
} from './services/localEngine';
import { speechService } from './services/speechService';
import './App.css';

export function App() {
  // Navigation & Language
  const [currentTab, setCurrentTab] = useState<NavigationTab>('home');
  const [language, setLanguage] = useState<Language>(() => storageService.getLanguage());
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Persistent User Profiles
  const [farmer, setFarmer] = useState<FarmerProfile>(() => storageService.getFarmerProfile());
  const [soilReport, setSoilReport] = useState<SoilReport>(() => storageService.getActiveSoilReport());
  const [cropProfile, setCropProfile] = useState<CropProfile>(() => storageService.getCropProfile());
  const [diagnoses, setDiagnoses] = useState<CropDiagnosis[]>(() => storageService.getDiagnosisHistory());
  const [activeDiagnosis, setActiveDiagnosis] = useState<CropDiagnosis | null>(null);

  // Modal State for Soil Tab
  const [showUpdateSoilModal, setShowUpdateSoilModal] = useState<boolean>(false);

  // Pre-seed default calculations
  const initialParams = soilReport.parameters || SAMPLES[0].parameters;
  const defaultAnalysis = localAnalyzeSoil(initialParams);
  const defaultNutrients = localRecommendNutrients(cropProfile, initialParams);
  const defaultIrrigation = localRecommendIrrigation(cropProfile);
  const defaultExplanation = localGenerateAdvisoryExplanation(language, cropProfile, defaultAnalysis, defaultNutrients, defaultIrrigation);

  const [soilAnalysis, setSoilAnalysis] = useState<SoilAnalysisSummary>(defaultAnalysis);
  const [nutrientRec, setNutrientRec] = useState<FertilizerRecommendation>(defaultNutrients);
  const [irrigationRec, setIrrigationRec] = useState<IrrigationAdvisory>(defaultIrrigation);
  const [advisoryExplanation, setAdvisoryExplanation] = useState<AIAdvisoryExplanation>(defaultExplanation);

  // Listen to speech synthesis
  useEffect(() => {
    speechService.setListener((speaking) => {
      setIsSpeaking(speaking);
    });
    return () => {
      speechService.stop();
    };
  }, []);

  // Compute advisory calculations
  const computeAdvisory = (params: SoilParametersMap, profile: CropProfile, lang: Language) => {
    try {
      // 1. Immediate local synchronous model execution (0ms, 100% resilient)
      const localAnalysis = localAnalyzeSoil(params);
      const localNutrients = localRecommendNutrients(profile, params);
      const localIrrigation = localRecommendIrrigation(profile);
      const localExplanation = localGenerateAdvisoryExplanation(lang, profile, localAnalysis, localNutrients, localIrrigation);

      setSoilAnalysis(localAnalysis);
      setNutrientRec(localNutrients);
      setIrrigationRec(localIrrigation);
      setAdvisoryExplanation(localExplanation);

      // 2. Asynchronously query backend API to enrich with live Open-Meteo & Gemini
      analyzeSoilApi(params, lang).then(analysis => {
        if (analysis) setSoilAnalysis(analysis);
      }).catch(() => {});

      recommendNutrientsApi(profile, params).then(nutrients => {
        if (nutrients) setNutrientRec(nutrients);
      }).catch(() => {});

      recommendIrrigationApi(profile).then(irrigation => {
        if (irrigation) setIrrigationRec(irrigation);
      }).catch(() => {});

      generateAdvisoryExplanationApi(lang, profile, localAnalysis, localNutrients, localIrrigation).then(explanation => {
        if (explanation) setAdvisoryExplanation(explanation);
      }).catch(() => {});
    } catch (err) {
      console.error('Calculation pipeline error:', err);
    }
  };

  // Run initial calculation on mount
  useEffect(() => {
    computeAdvisory(soilReport.parameters, cropProfile, language);
  }, []);

  // Language switch
  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    storageService.setLanguage(lang);
    computeAdvisory(soilReport.parameters, cropProfile, lang);
  };

  // Toggle voice narration
  const handleToggleSpeech = () => {
    if (isSpeaking) {
      speechService.stop();
    } else if (advisoryExplanation?.voiceNarrationText) {
      speechService.speak(advisoryExplanation.voiceNarrationText, language);
    }
  };

  // Save updated soil report permanently
  const handleUpdateSoilReport = (updated: SoilReport) => {
    setSoilReport(updated);
    storageService.saveActiveSoilReport(updated);
    computeAdvisory(updated.parameters, cropProfile, language);
  };

  // Save farmer profile permanently
  const handleSaveProfile = (updatedProfile: FarmerProfile) => {
    setFarmer(updatedProfile);
    storageService.saveFarmerProfile(updatedProfile);
    // Also update crop profile district if farmer district changed
    const updatedCrop = {
      ...cropProfile,
      district: updatedProfile.location.district,
      farmArea: updatedProfile.totalLandArea,
      areaUnit: updatedProfile.areaUnit,
      irrigationMethod: updatedProfile.defaultIrrigation
    };
    setCropProfile(updatedCrop);
    storageService.saveCropProfile(updatedCrop);
    computeAdvisory(soilReport.parameters, updatedCrop, language);
  };

  // Save new crop diagnosis into persistent history
  const handleSaveDiagnosis = (diagnosis: CropDiagnosis) => {
    storageService.saveDiagnosis(diagnosis);
    setDiagnoses(storageService.getDiagnosisHistory());
    setActiveDiagnosis(diagnosis);
  };

  return (
    <div className="app-root" style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      {/* 5-Tab Modern Navigation Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        language={language}
        onLanguageChange={handleLanguageChange}
        isSpeaking={isSpeaking}
        onToggleSpeech={handleToggleSpeech}
        canSpeak={!!advisoryExplanation?.voiceNarrationText}
      />

      {/* Main Tab Content */}
      <main className="main-content-area" style={{ flex: 1, maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '1.5rem 1rem' }}>
        {/* Tab 1: Home Dashboard */}
        {currentTab === 'home' && (
          <TabHome
            farmer={farmer}
            soilReport={soilReport}
            soilAnalysis={soilAnalysis}
            nutrientRec={nutrientRec}
            irrigationRec={irrigationRec}
            diagnoses={diagnoses}
            language={language}
            onNavigateTab={setCurrentTab}
            onOpenUpdateSoilModal={() => {
              setCurrentTab('soil');
              setShowUpdateSoilModal(true);
            }}
            isSpeaking={isSpeaking}
            onToggleSpeech={handleToggleSpeech}
          />
        )}

        {/* Tab 2: My Soil (Persistent scorecard & 12-parameter matrix) */}
        {currentTab === 'soil' && (
          <TabSoil
            soilReport={soilReport}
            soilAnalysis={soilAnalysis}
            nutrientRec={nutrientRec}
            cropProfile={cropProfile}
            language={language}
            onUpdateSoilReport={handleUpdateSoilReport}
            showUpdateModal={showUpdateSoilModal}
            onOpenUpdateModal={() => setShowUpdateSoilModal(true)}
            onCloseUpdateModal={() => setShowUpdateSoilModal(false)}
          />
        )}

        {/* Tab 3: Analyse Crop (Multimodal photo diagnosis grounded in soil chemistry) */}
        {currentTab === 'crop' && (
          <TabAnalyseCrop
            soilReport={soilReport}
            cropProfile={cropProfile}
            language={language}
            onSaveDiagnosis={handleSaveDiagnosis}
            activeDiagnosis={activeDiagnosis}
            setActiveDiagnosis={setActiveDiagnosis}
          />
        )}

        {/* Tab 4: My Advisory (Integrated plan: Precision irrigation + STCR fertilizers + AI Assistant) */}
        {currentTab === 'advisory' && (
          <TabAdvisory
            farmer={farmer}
            soilReport={soilReport}
            cropProfile={cropProfile}
            soilAnalysis={soilAnalysis}
            nutrientRec={nutrientRec}
            irrigationRec={irrigationRec}
            explanation={advisoryExplanation}
            diagnoses={diagnoses}
            language={language}
          />
        )}

        {/* Tab 5: Profile (Farmer details, geo-location, land holding & language) */}
        {currentTab === 'profile' && (
          <TabProfile
            farmer={farmer}
            language={language}
            onSaveProfile={handleSaveProfile}
            onLanguageChange={handleLanguageChange}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer no-print" style={{ background: '#ffffff', borderTop: '1px solid #e2e8f0', padding: '1.25rem 1rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
        <p style={{ margin: '0 0 0.25rem 0', fontWeight: '600' }}>
          AgroSense AI v2.0 • AI-Based Soil Analysis and Location-Aware Crop Advisory System
        </p>
        <span style={{ fontSize: '0.78rem' }}>
          Engineered for Indian Farmers | Karnataka Pilot | ICAR & UAS-B Package of Practices | FAO-56 Penman-Monteith Standard
        </span>
      </footer>
    </div>
  );
}

export default App;
