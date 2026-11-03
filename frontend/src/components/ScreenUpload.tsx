import React, { useState, useRef } from 'react';
import { Language, SoilReport } from '../types';
import { I18N } from '../data/i18n';
import { SAMPLES } from '../data/sampleReports';
import { UploadCloud, FileText, Sparkles, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';

interface ScreenUploadProps {
  language: Language;
  onReportLoaded: (report: SoilReport) => void;
  onBack: () => void;
}

export const ScreenUpload: React.FC<ScreenUploadProps> = ({
  language,
  onReportLoaded,
  onBack
}) => {
  const t = I18N[language];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setIsProcessing(true);
    // Simulate OCR text scanning
    setTimeout(() => {
      setIsProcessing(false);
      const customReport: SoilReport = {
        id: `rep_${Date.now()}`,
        title: file.name,
        farmerName: 'Self-Uploaded Report',
        laboratoryName: 'Diagnostic Soil Testing Laboratory',
        reportDate: new Date().toISOString().split('T')[0],
        reportType: 'Uploaded Soil Laboratory Document',
        district: 'Mandya',
        confidenceScore: 0.94,
        verificationStatus: 'PENDING_VERIFICATION',
        parameters: {
          nitrogen: { value: 185, unit: 'kg/ha', method: 'Alkaline Permanganate', confidence: 0.95 },
          phosphorus: { value: 34, unit: 'kg/ha', method: 'Olsen NaHCO3', confidence: 0.92 },
          potassium: { value: 122, unit: 'kg/ha', method: 'Neutral Normal NH4OAc', confidence: 0.96 },
          ph: { value: 8.0, unit: 'pH unit', method: '1:2.5 Potentiometric', confidence: 0.99 },
          ec: { value: 0.46, unit: 'dS/m', method: 'Conductivity Meter', confidence: 0.96 },
          organicCarbon: { value: 0.36, unit: '%', method: 'Walkley-Black Titration', confidence: 0.91 },
          sulphur: { value: 8.5, unit: 'ppm', method: '0.15% CaCl2 Turbidimetry', confidence: 0.88 },
          zinc: { value: 0.44, unit: 'ppm', method: 'DTPA Extraction AAS', confidence: 0.92 },
          iron: { value: 6.6, unit: 'ppm', method: 'DTPA Extraction AAS', confidence: 0.90 },
          copper: { value: 0.46, unit: 'ppm', method: 'DTPA Extraction AAS', confidence: 0.89 },
          manganese: { value: 3.3, unit: 'ppm', method: 'DTPA Extraction AAS', confidence: 0.87 },
          boron: { value: 0.36, unit: 'ppm', method: 'Hot Water Soluble Azomethine-H', confidence: 0.90 }
        }
      };
      onReportLoaded(customReport);
    }, 1200);
  };

  const handleSelectSample = (sample: SoilReport) => {
    setSelectedSampleId(sample.id);
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onReportLoaded(sample);
    }, 800);
  };

  return (
    <div className="screen-container">
      <div className="hero-box">
        <h1 className="hero-title">{t.uploadTitle}</h1>
        <p className="hero-subtitle">{t.uploadSubtitle}</p>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        className={`upload-zone ${isDragging ? 'dragging' : ''} ${isProcessing ? 'processing' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files?.[0]) {
            handleFile(e.dataTransfer.files[0]);
          }
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden-file-input"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              handleFile(e.target.files[0]);
            }
          }}
        />

        {isProcessing ? (
          <div className="scanning-container">
            <div className="scan-laser-line" />
            <Sparkles className="scan-icon animate-spin" />
            <h3>Extracting Soil Parameters...</h3>
            <p>Analyzing Nitrogen, Phosphorus, Potassium, pH & Micronutrients via OCR</p>
          </div>
        ) : (
          <div className="upload-prompt">
            <div className="upload-icon-circle">
              <UploadCloud className="upload-main-icon" />
            </div>
            <h3 className="upload-headline">{t.dragDropText}</h3>
            <p className="upload-subtext">{t.supportedFormats}</p>
            <button type="button" className="btn-secondary upload-btn">
              <FileText className="btn-icon" />
              <span>Browse File</span>
            </button>
          </div>
        )}
      </div>

      {/* Sample Reports Quick Access */}
      <div className="sample-reports-section">
        <div className="sample-heading">
          <Sparkles className="sample-sparkle" />
          <h3>{t.instantSamples}</h3>
        </div>

        <div className="sample-grid">
          {SAMPLES.map((sample) => {
            const isSelected = selectedSampleId === sample.id;
            return (
              <div
                key={sample.id}
                className={`sample-card ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSelectSample(sample)}
              >
                <div className="sample-card-header">
                  <div className="sample-badge">
                    <ShieldCheck className="badge-icon" />
                    <span>{sample.district} District</span>
                  </div>
                  {isSelected && <CheckCircle2 className="sample-check text-emerald" />}
                </div>

                <h4 className="sample-title">
                  {language === 'kn' ? sample.titleKn || sample.title : language === 'hi' ? sample.titleHi || sample.title : sample.title}
                </h4>

                <div className="sample-meta">
                  <span><strong>Farmer:</strong> {sample.farmerName}</span>
                  <span><strong>Lab:</strong> {sample.laboratoryName}</span>
                </div>

                <div className="sample-params-preview">
                  <span className="param-pill">N: {sample.parameters.nitrogen?.value} kg/ha</span>
                  <span className="param-pill">P: {sample.parameters.phosphorus?.value} kg/ha</span>
                  <span className="param-pill">K: {sample.parameters.potassium?.value} kg/ha</span>
                  <span className="param-pill">pH: {sample.parameters.ph?.value}</span>
                </div>

                <button type="button" className="sample-load-btn">
                  <span>{t.trySample}</span>
                  <ArrowRight className="btn-arrow-sm" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Back Button */}
      <div className="screen-action-footer">
        <button type="button" className="btn-secondary" onClick={onBack}>
          {t.back}
        </button>
      </div>
    </div>
  );
};
