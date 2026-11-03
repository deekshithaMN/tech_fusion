import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import { CROPS } from './data/crops.js';
import { SAMPLE_REPORTS } from './data/samples.js';
import { SOIL_PARAMETERS } from './data/standards.js';
import { parseSoilReportDocument } from './services/documentParser.js';
import { analyzeSoilHealth } from './services/soilAnalyzer.js';
import { calculateFertilizerRecommendation } from './services/nutrientEngine.js';
import { calculateIrrigationAdvisory } from './services/irrigationEngine.js';
import { fetchDistrictWeather } from './services/weatherService.js';
import { generateAdvisoryExplanation } from './services/aiService.js';
import { diagnoseCropPhoto } from './services/cropVisionService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Multer storage for uploaded reports
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `report_${Date.now()}_${Math.round(Math.random() * 1e4)}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// In-memory persistent session storage (matches Database Schema in TRD)
const database = {
  farmers: [
    {
      id: 'f_default_1',
      name: 'Farmer Guest',
      phone: '9845012345',
      preferred_language: 'kn',
      created_at: new Date().toISOString()
    }
  ],
  soilReports: new Map(),
  cropProfiles: new Map(),
  advisoryReports: new Map()
};

// Seed sample reports into memory
SAMPLE_REPORTS.forEach(sample => {
  database.soilReports.set(sample.id, {
    id: sample.id,
    farmer_id: 'f_default_1',
    file_path: `/samples/${sample.id}.pdf`,
    report_type: sample.reportType,
    laboratory_name: sample.laboratoryName,
    report_date: sample.reportDate,
    extraction_status: 'SUCCESS',
    verification_status: 'VERIFIED',
    parameters: sample.parameters,
    title: sample.title,
    titleKn: sample.titleKn,
    titleHi: sample.titleHi,
    district: sample.district,
    farmerName: sample.farmerName,
    notes: sample.notes
  });
});

// ----------------------------------------------------------------------
// 1. Authentication Endpoints (TRD FR-01 / FR-02)
// ----------------------------------------------------------------------
app.post('/api/v1/auth/register', (req, res) => {
  const { name, phone, email, preferredLanguage } = req.body;
  const newFarmer = {
    id: `farmer_${Date.now()}`,
    name: name || 'Indian Farmer',
    phone: phone || '',
    email: email || '',
    preferred_language: preferredLanguage || 'kn',
    created_at: new Date().toISOString()
  };
  database.farmers.push(newFarmer);
  res.json({
    status: 'success',
    token: `jwt_simulated_${newFarmer.id}`,
    farmer: newFarmer
  });
});

app.post('/api/v1/auth/login', (req, res) => {
  const { phone } = req.body;
  const farmer = database.farmers.find(f => f.phone === phone) || database.farmers[0];
  res.json({
    status: 'success',
    token: `jwt_simulated_${farmer.id}`,
    farmer
  });
});

// ----------------------------------------------------------------------
// 2. Soil Report Upload & Extraction (TRD Module 2)
// ----------------------------------------------------------------------
app.get('/api/v1/sample-reports', (req, res) => {
  res.json({
    status: 'success',
    samples: SAMPLE_REPORTS
  });
});

app.post('/api/v1/reports/upload', upload.single('reportFile'), (req, res) => {
  try {
    const sampleId = req.body.sampleId;
    let result;

    if (sampleId) {
      result = parseSoilReportDocument({ sampleId });
    } else if (req.file) {
      result = parseSoilReportDocument({
        filename: req.file.filename,
        originalName: req.file.originalname
      });
    } else {
      // Create a default extraction if user tests with no file
      result = parseSoilReportDocument({ sampleId: 'sample_mandya_tomato' });
    }

    database.soilReports.set(result.reportId, result);

    res.json({
      status: 'success',
      report: result
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.post('/api/v1/reports/:id/extract', (req, res) => {
  const report = database.soilReports.get(req.params.id);
  if (!report) {
    return res.status(404).json({ status: 'error', message: 'Report not found' });
  }
  res.json({ status: 'success', report });
});

app.get('/api/v1/reports/:id', (req, res) => {
  const report = database.soilReports.get(req.params.id);
  if (!report) {
    return res.status(404).json({ status: 'error', message: 'Report not found' });
  }
  res.json({ status: 'success', report });
});

// Farmer Verification Endpoint (TRD FR-04: Farmer confirms/corrects values)
app.patch('/api/v1/reports/:id/verify', (req, res) => {
  const report = database.soilReports.get(req.params.id);
  if (!report) {
    return res.status(404).json({ status: 'error', message: 'Report not found' });
  }

  const { parameters } = req.body;
  if (parameters) {
    report.parameters = { ...report.parameters, ...parameters };
  }
  report.verificationStatus = 'FARMER_VERIFIED';
  database.soilReports.set(req.params.id, report);

  res.json({
    status: 'success',
    message: 'Soil parameters verified and saved successfully',
    report
  });
});

// ----------------------------------------------------------------------
// 3. Crops & Farm Profile (TRD Module 1 & 4)
// ----------------------------------------------------------------------
app.get('/api/v1/crops', (req, res) => {
  res.json({
    status: 'success',
    crops: Object.values(CROPS)
  });
});

app.post('/api/v1/crops', (req, res) => {
  const { cropName, farmArea, areaUnit, location, growthStage, irrigationMethod, targetYield } = req.body;
  const profileId = `crop_prof_${Date.now()}`;
  const profile = {
    id: profileId,
    cropName: cropName || 'tomato',
    farmArea: parseFloat(farmArea) || 1.0,
    areaUnit: areaUnit || 'acre',
    location: location || 'Mandya, Karnataka',
    growthStage: growthStage || 'basal',
    irrigationMethod: irrigationMethod || 'drip',
    targetYield: targetYield || null,
    created_at: new Date().toISOString()
  };
  database.cropProfiles.set(profileId, profile);
  res.json({ status: 'success', profile });
});

// ----------------------------------------------------------------------
// 4. Soil Analysis Engine (TRD Module 3)
// ----------------------------------------------------------------------
app.post('/api/v1/soil/analyze', (req, res) => {
  try {
    const { parameters, language } = req.body;
    const analysis = analyzeSoilHealth(parameters, language || 'kn');
    res.json({ status: 'success', analysis });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
});

// ----------------------------------------------------------------------
// 5. Fertilizer & Nutrient Recommendation Engine (TRD Module 4)
// ----------------------------------------------------------------------
app.post('/api/v1/nutrients/recommend', (req, res) => {
  try {
    const { cropId, farmArea, areaUnit, parameters, targetYield, growthStage } = req.body;
    const recommendation = calculateFertilizerRecommendation({
      cropId,
      farmArea: parseFloat(farmArea) || 1.0,
      areaUnit: areaUnit || 'acre',
      parameters,
      targetYield,
      growthStage
    });
    res.json({ status: 'success', recommendation });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
});

// ----------------------------------------------------------------------
// 6. Precision Irrigation Advisory Engine (TRD Module 5)
// ----------------------------------------------------------------------
app.post('/api/v1/irrigation/recommend', async (req, res) => {
  try {
    const { cropId, growthStage, farmArea, areaUnit, irrigationMethod, location } = req.body;
    
    // Fetch live weather or agro-climatic baseline for the district
    const weatherData = await fetchDistrictWeather(location);

    const advisory = calculateIrrigationAdvisory({
      cropId,
      growthStage,
      farmArea: parseFloat(farmArea) || 1.0,
      areaUnit: areaUnit || 'acre',
      irrigationMethod,
      weatherData
    });

    res.json({ status: 'success', advisory });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
});

// ----------------------------------------------------------------------
// 7. Weather Endpoint
// ----------------------------------------------------------------------
app.get('/api/v1/weather', async (req, res) => {
  const location = req.query.location || 'mandya';
  const weather = await fetchDistrictWeather(location);
  res.json({ status: 'success', weather });
});

// ----------------------------------------------------------------------
// 8. AI Multilingual Explanation & Q&A Service (TRD Module 6)
// ----------------------------------------------------------------------
app.post('/api/v1/advisory/generate', async (req, res) => {
  try {
    const { language, cropProfile, soilAnalysis, nutrientRec, irrigationRec, userQuestion } = req.body;
    
    const explanation = await generateAdvisoryExplanation({
      language: language || 'kn',
      cropProfile,
      soilAnalysis,
      nutrientRec,
      irrigationRec,
      userQuestion
    });

    const advisoryId = `adv_${Date.now()}`;
    database.advisoryReports.set(advisoryId, {
      id: advisoryId,
      language,
      explanation,
      created_at: new Date().toISOString()
    });

    res.json({
      status: 'success',
      advisoryId,
      explanation
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.get('/api/v1/advisory/:id', (req, res) => {
  const report = database.advisoryReports.get(req.params.id);
  if (!report) {
    return res.status(404).json({ status: 'error', message: 'Advisory not found' });
  }
  res.json({ status: 'success', report });
});

// Farmer Interactive AI Q&A Assistant
app.post('/api/v1/ai/ask', async (req, res) => {
  try {
    const { question, language, cropProfile, soilAnalysis, nutrientRec, irrigationRec } = req.body;
    const result = await generateAdvisoryExplanation({
      language: language || 'kn',
      cropProfile,
      soilAnalysis,
      nutrientRec,
      irrigationRec,
      userQuestion: question
    });
    res.json({ status: 'success', answer: result.response, source: result.source });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ----------------------------------------------------------------------
// 9. AgroSense v2.0 Crop Intelligence & Vision Endpoint
// ----------------------------------------------------------------------
app.post('/api/v2/crop-intelligence/diagnose', (req, res) => {
  try {
    const { cropId, growthStage, problemDescription, soilParameters } = req.body;
    const diagnosis = diagnoseCropPhoto({
      cropId,
      growthStage,
      problemDescription,
      soilParameters
    });
    res.json({ status: 'success', diagnosis });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'AgroSense AI Advisory Engine',
    version: '1.0.0',
    market: 'Indian Farmers / Karnataka Pilot',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🌾 AgroSense AI Backend running on http://localhost:${PORT}`);
  console.log(`📑 Health endpoint: http://localhost:${PORT}/api/v1/health`);
});
