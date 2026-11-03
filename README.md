# AgroSense AI 🌾

## AI-Based Soil Report Analysis and Precision Irrigation Advisory System

**Target Market:** Indian Farmers (Initial Pilot: Karnataka)  
**Supported Languages:** Kannada (ಕನ್ನಡ), English, Hindi (हिंदी)  
**Platform:** Mobile-Responsive Full-Stack Web Application  
**Scientific Standards:** ICAR, UAS Bengaluru Package of Practices, Soil Health Card (SHC), FAO-56 Penman-Monteith \& CropWat

\---



## 📌 1. Problem Statement

Indian agriculture sustains over 140 million farming households, yet smallholder farmers face severe structural and information barriers when translating laboratory science into field actions:

```
\\\[ Lab Soil Report ] ----(Technical Jargon)----> \\\[ Farmer Confusion ] ----> \\\[ Arbitrary Chemical Dosing ]
        |                                                                           |
        +----(Ignored Soil Chemistry)----> \\\[ Crop Visual Disease ] <----------------+
                                                    |
                                                    v
                                      \\\[ Wrong Pesticide Sprays ]
                                      \\\[ Water \\\& Yield Loss ]
```

### Key Challenges Faced by Farmers:

1. **Intimidating Laboratory Soil Reports:** Soil Health Cards (SHC) present parameters in technical chemical terms ($N$, $P$, $K$, $S$, $Zn$, $Fe$, $Cu$, $Mn$, $B$, $pH$, $EC$, and $Organic\\ Carbon$) with analytical testing units ($kg/ha$, $ppm$, $dS/m$, $%$). Farmers cannot easily interpret these numerical values.
2. **The Commercial Translation Gap:** Farmers do not buy elemental "Nitrogen" or "Phosphorus"; they buy 45 kg commercial bags of **Urea**, 50 kg bags of **DAP**, and 50 kg bags of **MOP**. Existing lab reports rarely specify the exact commercial bag counts and split stages needed for their specific farm acreage.
3. **Misdiagnosis of Crop Symptoms (Disconnected Vision):** When leaves turn yellow or tomatoes develop dark bottom rot, farmers often assume it is a fungal disease and purchase expensive chemical fungicides. In reality, **Tomato Blossom End Rot is a physiological Calcium deficit triggered by high soil pH (> 8.0) and high Potassium antagonism**, while **lower-leaf chlorosis directly reflects depleted soil Nitrogen (< 280 kg/ha)**. Without connecting crop photography to the farmer's saved soil report, visual AI tools misdiagnose abiotic soil deficiencies as primary pathogens.
4. **Water Mismanagement \& Flood Inefficiency:** Conventional furrow/flood irrigation wastes 40% to 50% of pumped groundwater, causing nutrient leaching and root hypoxia. Farmers lack daily, weather-adjusted water demand schedules in concrete units (**Litres per day** and **exact pump runtimes**).
5. **Language \& Literacy Barriers:** Scientific advisories are predominantly published in English or formal administrative terminology, alienating regional Kannada and Hindi speaking farmers who benefit most from voice-narrated guidance.

**AgroSense AI 2.0 solves this by bridging the laboratory, the satellite/weather station, and the mobile camera into a single persistent 5-Tab Agricultural Advisory Dashboard.**

\---



## 🌟 Executive Summary

**AgroSense AI** converts technical, intimidating laboratory soil test reports into simple, actionable agricultural decisions for small and medium-scale farmers across Karnataka and India.

By merging **OCR soil report parameter extraction**, **ICAR Soil Test Crop Response (STCR) nutrient dosage algorithms**, and **FAO-56 agro-meteorological precision irrigation modeling**, AgroSense AI answers the vital questions every farmer faces:

1. *What nutrients are available in my soil?*
2. *Which nutrients are deficient?*
3. *Which fertilizers should I purchase and in what exact bag quantities?*
4. *When and how should fertilizers be applied across crop growth stages?*
5. *How much water does my crop require today based on local weather?*
6. *Why are these recommendations necessary? (Explained in Kannada, Hindi, and English with voice audio narration)*

\---

## 🏗️ System Architecture \& Modules

### Module 1: Language Selection and Cultivation Profile

* **Multilingual Support:** One-click language switching between **Kannada (ಕನ್ನಡ)**, **English**, and **Hindi (हिंदी)**.
* **Crop Database:** Real Package of Practices data for Tomato, Maize, Ragi (Finger Millet), Sugarcane, Paddy (Rice), Groundnut, and Cotton.
* **Farm Parameters:** Area in acres or hectares, Karnataka district selection, crop growth stage, and irrigation method (Drip @ 90% efficiency, Sprinkler @ 75%, Furrow/Flood @ 60%).

### Module 2 \& 3: Soil Report Processing \& Diagnostic Analysis

* **Supported Formats:** Soil Health Card PDFs, laboratory certificates, JPG/PNG camera photos, and pre-loaded Karnataka sample reports.
* **Extracted Parameters (12 Total):** Available N, P, K, pH, EC, Organic Carbon (OC), Sulphur (S), Zinc (Zn), Iron (Fe), Copper (Cu), Manganese (Mn), Boron (B).
* **Preservation of Units \& Methods:** Preserves original test units (`kg/ha`, `ppm`, `%`, `dS/m`) and laboratory analytical procedures (e.g. Alkaline Permanganate, Olsen, Flame Photometry, Walkley-Black).
* **Farmer Verification Workflow (FR-04):** Farmers inspect, verify, and can edit any OCR value before generating prescriptions.
* **Soil Health Scorecard:** 0-100 diagnostic index with color-coded status badges and critical condition alerts (acidity, alkalinity, salinity risk, organic carbon starvation).

### Module 4: STCR Fertilizer \& Nutrient Recommendation Engine

* **STCR Adjustment Equations:** Automatically increases nutrient dose by +25% for low status and decreases by 25% for high status.
* **Commercial Formulation Conversion:**

  * **Urea (46% N):** Calculates net Urea bags (45 kg commercial bags) subtracting starter nitrogen supplied by DAP.
  * **DAP (18% N, 46% P2O5):** Calculates 50 kg commercial bag requirements to satisfy phosphorus demand.
  * **MOP / SOP (60% / 50% K2O):** Recommends Muriate of Potash or switches to Sulphate of Potash for saline soils.
  * **Soil Amendments:** Recommends Agricultural Lime (CaCO3) for acidic soils (pH < 6.0), Gypsum for alkaline soils (pH > 8.2), and Farm Yard Manure (FYM) for carbon restoration.
  * **Micronutrients:** Specific kg doses of Zinc Sulphate (21% Zn) and Borax (11% B) when deficient.
* **Stage-Wise Split Schedule:** Timetables basal, vegetative, flowering, and fruit maturation applications to prevent leaching.

### Module 5: FAO-56 Precision Irrigation Advisory Engine

* **Evapotranspiration Calculation:**
$$ET\_c = ET\_0 \\times K\_c$$

  * $ET\_0$: Reference evapotranspiration dynamically retrieved from Open-Meteo agro-meteorological API for the farmer's district.
  * $K\_c$: Crop coefficient matching growth stage (e.g. Tomato Flowering $K\_c = 1.15$).
* **Effective Rainfall:** Incorporates USDA Soil Conservation Service formula to credit precipitation.
* **Water Volume in Litres:**
$$\\text{Volume (Litres)} = \\text{Gross Depth (mm)} \\times \\text{Farm Area (acres)} \\times 4047$$
* **Operational Pump Schedule:** Concrete operating run times (e.g., "Run 3 HP pump for 1 hour 45 minutes every 2 days via Drip").
* **Water Conservation Metrics:** Calculates litres and percentage saved compared to traditional furrow flood irrigation.
* **Safety Disclaimer:** Explicitly clarifies that soil testing measures fertility, not instant moisture.

### Module 6: Multilingual AI Agricultural Assistant \& Voice Narration

* **Conversational Grounding:** Explains results in simple, regional terminology without agricultural chemistry jargon.
* **Interactive Q\&A:** Farmers can type or tap questions (e.g., *"Why is nitrogen low?"*, *"When do I apply DAP vs Urea?"*, *"How much water does my crop need?"*).
* **Text-to-Speech Voice Narration:** Integrated Web Speech API audio player reading out the advisory in Kannada, Hindi, and English for low-literacy farmers.
* **Safety Controls:** Grounded prompts prevent hallucinations; the AI model never invents arbitrary fertilizer dosages.

### Module 7: Downloadable \& Printable Advisory Report

* Formatted printable sheet (`window.print()` with `@media print` clean layout) containing farmer profile, soil health breakdown, commercial bag checklist, application timetable, irrigation plan, and scientific citations.

\---

## 🚀 Getting Started \& Local Execution

### Prerequisites

* Node.js (v18+ or v24+)
* npm (v9+)

### 1\. Run the Frontend

```powershell
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 2\. Run the Backend API (Optional - Full Stack Mode)

The frontend contains an automatic client-side fallback calculation engine for 100% offline reliability. To start the Express REST API backend:

```powershell
cd backend
npm start
```

The backend starts on [http://localhost:5000](http://localhost:5000) with health endpoint at `/api/v1/health`.

### 3\. Python Flask Backend

A complete Python Flask backend implementation is provided in `backend/flask\_app/`:

```bash
cd backend/flask\_app
pip install -r requirements.txt
python app.py
```

\---



## 🛠️  AI Tools \& Models Used

|AI Tool / Model|Type|Role in AgroSense AI|
|-|-|-|
|**Google Gemini 1.5 Flash Vision**|Multimodal LLM \& Vision|Analyzes uploaded crop photographs, detects visual symptoms (chlorosis, necrosis, lesions), and parses laboratory soil report documents.|
|**Grounded Diagnostic Correlation Engine**|Rule-Based Expert System|Cross-references visual symptoms with the farmer's stored soil parameters ($N$, $P$, $K$, $pH$, $Zn$, $EC$) to differentiate physiological nutrient deficits from infectious fungal/viral diseases.|
|**ICAR / UAS-B STCR Engine**|Deterministic Algorithmic Model|Calculates customized commercial fertilizer bag requirements using verified quadratic polynomial yield equations.|
|**FAO-56 Penman-Monteith Engine**|Agro-Meteorological Model|Computes reference evapotranspiration ($ET\_0$) and crop evapotranspiration ($ET\_c$) using dynamic crop coefficients ($K\_c$) and live weather data.|
|**Web Speech Synthesis API**|Neural Voice Synthesis|Real-time text-to-speech engine delivering advisories aloud in Kannada (`kn-IN`), English (`en-IN`), and Hindi (`hi-IN`).|
|**Open-Meteo Agro-Climatic Service**|Meteorological Forecast API|Provides live solar radiation, temperature, relative humidity, wind speed, and precipitation for farm coordinates.|



## 🧪 Hackathon Demonstration Walkthrough

Follow these steps for the perfect demonstration:

1. **Screen 1 (Language Selection):** Select **ಕನ್ನಡ (Kannada)** and click **ಮುಂದುವರಿಯಿರಿ (Continue)**.
2. **Screen 2 (Report Upload):** Click on the preloaded sample card: **"Soil Health Card - Mandya District (Tomato)"**.
3. **Screen 3 (Verification):** Inspect the extracted parameters table (Available N: 180 kg/ha, P: 38 kg/ha, K: 120 kg/ha, pH: 8.1, OC: 0.35%). Click **ದೃಢೀಕರಿಸಿ \& ಮುಂದುವರಿಯಿರಿ (Verify \& Proceed)**.
4. **Screen 4 (Crop \& Farm):** Confirm **Tomato**, **1 Acre**, **Mandya District**, **Flowering Stage**, and **Drip Irrigation**. Click **ಸಲಹಾ ವರದಿ ರಚಿಸಿ (Generate Advisory)**.
5. **Screen 5 (Soil Health):** Review the 58/100 score, deficient Nitrogen, Potassium, Zinc, Boron, and alkaline pH alert.
6. **Screen 6 (Fertilizer):** View commercial bag requirements:

   * **3.5 Bags of Urea (45 kg)**
   * **2.1 Bags of DAP (50 kg)**
   * **2.7 Bags of MOP (50 kg)**
   * **4.0 Tonnes of Farm Yard Manure**
   * Stage-wise split schedule (Basal, Vegetative, Flowering).
7. **Screen 7 (Precision Irrigation):** Review the daily water requirement: **\~24,800 Litres/day**, the operational pump schedule (**2h 29m every 2 days**), and **\~12,400 Litres/day saved** vs flood.
8. **Screen 8 (AI Assistant \& Voice):** Click **"ಆಡಿಯೋ ಆಲಿಸಿ (Listen Voice)"** to hear the advisory spoken in Kannada. Tap suggested questions to see instant answers.
9. **Screen 9 (Final Report):** Click **"ವರದಿ ಡೌನ್‌ಲೋಡ್ / ಪ್ರಿಂಟ್ (Download / Print Report)"** to view or print the official advisory report.

\---

## 📚 References \& Scientific Sources

1. **Government of India:** Soil Health Card Scheme guidelines.
2. **ICAR:** Soil testing and agricultural nutrient management handbook.
3. **University of Agricultural Sciences (UAS), Bengaluru:** Package of Practices for Horticultural and Agricultural Crops of Karnataka (Zone 5 \& Zone 6).
4. **FAO:** Crop Evapotranspiration – Guidelines for Computing Crop Water Requirements (FAO Irrigation and Drainage Paper No. 56).
5. **Open-Meteo:** Agro-Meteorological Weather API.

\---

*AgroSense AI — Understand Your Soil. Feed Your Crops. Save Your Water.*

