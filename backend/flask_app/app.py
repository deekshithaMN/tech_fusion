"""
AgroSense AI - Flask Backend v2.1
Precision Irrigation Advisory + PDF Soil Report Analysis via Gemini AI
"""
import os
import re
import math
import json
import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

GOOGLE_API_KEY = os.environ.get('GOOGLE_API_KEY', '')

# ─── Reference Standards ───────────────────────────────────────────────────────
SOIL_THRESHOLDS = {
    'nitrogen':      {'low': 280, 'high': 560, 'unit': 'kg/ha'},
    'phosphorus':    {'low': 23,  'high': 56,  'unit': 'kg/ha'},
    'potassium':     {'low': 145, 'high': 337, 'unit': 'kg/ha'},
    'organicCarbon': {'low': 0.50,'high': 0.75,'unit': '%'},
    'ph':            {'acidic': 6.5, 'alkaline': 7.5, 'unit': 'pH'},
    'ec':            {'normal': 1.0, 'saline': 2.0, 'unit': 'dS/m'},
    'zinc':          {'low': 0.60, 'unit': 'ppm'},
    'boron':         {'low': 0.50, 'unit': 'ppm'},
    'sulphur':       {'low': 10.0, 'unit': 'ppm'}
}

# FAO-56 Kc values per crop per stage
CROPS_DATA = {
    'tomato':    {'name': 'Tomato',    'rdfAcre': {'n': 73,  'p': 49, 'k': 65}, 'duration': 130,
                  'stages': [
                      {'key': 'basal',      'name': 'Basal/Transplanting',  'kc': 0.60, 'duration': 15},
                      {'key': 'vegetative', 'name': 'Vegetative Growth',    'kc': 0.85, 'duration': 20},
                      {'key': 'flowering',  'name': 'Flowering & Fruit Set','kc': 1.15, 'duration': 25},
                      {'key': 'harvest',    'name': 'Fruit Ripening',       'kc': 0.80, 'duration': 70},
                  ]},
    'maize':     {'name': 'Maize',     'rdfAcre': {'n': 61,  'p': 30, 'k': 16}, 'duration': 105,
                  'stages': [
                      {'key': 'basal',       'name': 'Sowing/Basal',       'kc': 0.40, 'duration': 15},
                      {'key': 'knee_high',   'name': 'Knee-high Stage',    'kc': 0.80, 'duration': 20},
                      {'key': 'tasseling',   'name': 'Tasseling & Silking','kc': 1.20, 'duration': 30},
                      {'key': 'grain_filling','name': 'Grain Filling',     'kc': 0.60, 'duration': 40},
                  ]},
    'ragi':      {'name': 'Ragi',      'rdfAcre': {'n': 40,  'p': 20, 'k': 20}, 'duration': 115,
                  'stages': [
                      {'key': 'basal',     'name': 'Basal/Sowing',    'kc': 0.40, 'duration': 15},
                      {'key': 'tillering', 'name': 'Active Tillering','kc': 0.75, 'duration': 20},
                      {'key': 'flowering', 'name': 'Flowering',       'kc': 1.05, 'duration': 30},
                      {'key': 'maturity',  'name': 'Grain Hardening', 'kc': 0.65, 'duration': 50},
                  ]},
    'sugarcane': {'name': 'Sugarcane', 'rdfAcre': {'n': 101, 'p': 40, 'k': 51}, 'duration': 360,
                  'stages': [
                      {'key': 'germination', 'name': 'Germination & Tillering',       'kc': 0.50, 'duration': 90},
                      {'key': 'grand_growth','name': 'Grand Growth / Cane Elongation','kc': 1.25, 'duration': 150},
                      {'key': 'maturity',    'name': 'Ripening & Sugar Accumulation', 'kc': 0.75, 'duration': 120},
                  ]},
    'paddy':     {'name': 'Paddy',     'rdfAcre': {'n': 49,  'p': 24, 'k': 24}, 'duration': 120,
                  'stages': [
                      {'key': 'basal',    'name': 'Nursery & Transplanting','kc': 1.10, 'duration': 20},
                      {'key': 'tillering','name': 'Active Tillering',       'kc': 1.15, 'duration': 30},
                      {'key': 'panicle',  'name': 'Panicle Initiation',     'kc': 1.20, 'duration': 25},
                      {'key': 'ripening', 'name': 'Ripening & Harvest',     'kc': 0.95, 'duration': 45},
                  ]},
}

# Soil Texture → Water Holding Capacity mapping (mm per 100mm soil depth)
TEXTURE_WHC = {
    'sandy':        {'whc_mm_per_100mm': 7.5,  'name': 'Sandy',         'description': 'Low water holding capacity. Frequent, small irrigations needed.'},
    'sandy loam':   {'whc_mm_per_100mm': 11.5, 'name': 'Sandy Loam',    'description': 'Moderate-low WHC. Drip irrigation highly recommended.'},
    'loam':         {'whc_mm_per_100mm': 15.0, 'name': 'Loam',          'description': 'Good WHC. Balanced irrigation intervals possible.'},
    'clay loam':    {'whc_mm_per_100mm': 17.5, 'name': 'Clay Loam',     'description': 'Good WHC. Monitor for waterlogging risk.'},
    'clay':         {'whc_mm_per_100mm': 20.0, 'name': 'Clay',          'description': 'High WHC but slow drainage. Avoid over-irrigation.'},
    'silty loam':   {'whc_mm_per_100mm': 16.5, 'name': 'Silty Loam',    'description': 'Good WHC with moderate drainage.'},
    'black cotton': {'whc_mm_per_100mm': 19.0, 'name': 'Black Cotton',  'description': 'High shrink-swell. Apply irrigation slowly to avoid runoff.'},
    'red loam':     {'whc_mm_per_100mm': 13.0, 'name': 'Red Loam',      'description': 'Common in Karnataka. Moderate WHC with good drainage.'},
}

ET0_BASELINE = 4.8  # mm/day — Karnataka agro-meteorological baseline (Zone 5 & 6)

# ─── Helpers ──────────────────────────────────────────────────────────────────

def classify_param(key: str, value: float) -> str:
    t = SOIL_THRESHOLDS.get(key, {})
    if key == 'ph':
        if value < 5.5: return 'Strongly Acidic'
        if value < t.get('acidic', 6.5): return 'Moderately Acidic'
        if value > 8.5: return 'Strongly Alkaline'
        if value > t.get('alkaline', 7.5): return 'Moderately Alkaline'
        return 'Neutral'
    if key == 'ec':
        if value > t.get('saline', 2.0): return 'Saline'
        if value > t.get('normal', 1.0): return 'Slightly Saline'
        return 'Normal'
    if key == 'organicCarbon':
        if value < t.get('low', 0.50): return 'Low'
        if value < t.get('high', 0.75): return 'Medium'
        return 'Adequate'
    low = t.get('low', 0)
    high = t.get('high', float('inf'))
    if value < low: return 'Low / Deficient'
    if value > high: return 'High / Excess'
    return 'Adequate'

def infer_texture_from_params(params: dict) -> str:
    """Infer soil texture class from available parameters when texture not directly given."""
    oc = params.get('organicCarbon', {}).get('value')
    clay_hint = params.get('clay', {}).get('value')
    if clay_hint is not None:
        c = float(clay_hint)
        if c > 50: return 'clay'
        if c > 35: return 'clay loam'
        if c > 20: return 'loam'
        return 'sandy loam'
    # Heuristic from OC
    if oc is not None:
        oc_f = float(oc)
        if oc_f < 0.3: return 'sandy loam'
        if oc_f < 0.6: return 'loam'
        return 'clay loam'
    return 'loam'  # safe default

def compute_stage_irrigation(crop_data: dict, stage_key: str, area_acres: float,
                               eff: float, texture_key: str = 'loam') -> dict:
    """Compute FAO-56 based irrigation for a specific crop stage."""
    stage = next((s for s in crop_data['stages'] if s['key'] == stage_key), crop_data['stages'][0])
    kc = stage['kc']
    etc = round(ET0_BASELINE * kc, 2)
    net_mm = max(0, etc)
    gross_mm = round(net_mm / eff, 2)
    daily_litres = round(gross_mm * 4047 * area_acres)
    weekly_litres = daily_litres * 7

    # Available Water from texture
    whc = TEXTURE_WHC.get(texture_key, TEXTURE_WHC['loam'])
    available_water_mm = round(whc['whc_mm_per_100mm'] * 0.6, 1)  # 60cm root depth assumption

    return {
        'stageKey': stage_key,
        'stageName': stage['name'],
        'kc': kc,
        'et0_mm': ET0_BASELINE,
        'etc_mm': etc,
        'grossMm': gross_mm,
        'dailyLitres': daily_litres,
        'weeklyLitres': weekly_litres,
        'durationDays': stage['duration'],
        'availableWaterMm': available_water_mm,
    }

def build_full_stage_timeline(crop_data: dict, area_acres: float, eff: float, texture_key: str) -> list:
    return [compute_stage_irrigation(crop_data, s['key'], area_acres, eff, texture_key)
            for s in crop_data['stages']]

# ─── Health Check ──────────────────────────────────────────────────────────────
@app.route('/api/v1/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'service': 'AgroSense AI v2.1', 'version': '2.1.0'})

# ─── Auth ──────────────────────────────────────────────────────────────────────
@app.route('/api/v1/auth/register', methods=['POST'])
def register():
    data = request.json or {}
    farmer_id = f"f_{abs(hash(data.get('phone', 'x')))}"
    farmer = {'id': farmer_id, 'name': data.get('name', 'Farmer'),
               'phone': data.get('phone', ''), 'language': data.get('preferredLanguage', 'kn')}
    return jsonify({'status': 'success', 'farmer': farmer, 'token': f'jwt_{farmer_id}'})

# ─── PDF Report Upload + Gemini AI Extraction ──────────────────────────────────
@app.route('/api/v1/reports/upload', methods=['POST'])
def upload_report():
    extracted_text = ''
    filename = 'uploaded_report'

    # Try to extract text from PDF using PyMuPDF
    if 'reportFile' in request.files:
        f = request.files['reportFile']
        filename = f.filename or 'uploaded_report'
        try:
            import fitz  # PyMuPDF
            pdf_bytes = f.read()
            doc = fitz.open(stream=pdf_bytes, filetype='pdf')
            for page in doc:
                extracted_text += page.get_text()
            doc.close()
        except Exception as e:
            print(f'PyMuPDF error: {e}')
            extracted_text = ''

    # Use Gemini to intelligently parse soil parameters from the extracted text
    parameters = {}
    gemini_confidence = 0.0

    if extracted_text.strip() and GOOGLE_API_KEY:
        try:
            import google.generativeai as genai
            genai.configure(api_key=GOOGLE_API_KEY)
            model = genai.GenerativeModel('gemini-1.5-flash')

            prompt = f"""You are an expert agricultural soil scientist. Extract soil test parameters from this laboratory report text.

REPORT TEXT:
{extracted_text[:4000]}

Return a JSON object with ONLY the following keys if present in the report (use null if not found):
{{
  "nitrogen": {{"value": <number kg/ha or ppm>, "unit": "kg/ha"}},
  "phosphorus": {{"value": <number>, "unit": "kg/ha"}},
  "potassium": {{"value": <number>, "unit": "kg/ha"}},
  "ph": {{"value": <number 0-14>, "unit": "pH unit"}},
  "ec": {{"value": <number>, "unit": "dS/m"}},
  "organicCarbon": {{"value": <number>, "unit": "%"}},
  "sulphur": {{"value": <number>, "unit": "ppm"}},
  "zinc": {{"value": <number>, "unit": "ppm"}},
  "iron": {{"value": <number>, "unit": "ppm"}},
  "copper": {{"value": <number>, "unit": "ppm"}},
  "manganese": {{"value": <number>, "unit": "ppm"}},
  "boron": {{"value": <number>, "unit": "ppm"}},
  "soilTexture": "<sandy|sandy loam|loam|clay loam|clay|silty loam|black cotton|red loam>",
  "farmerName": "<string or null>",
  "district": "<string or null>",
  "laboratoryName": "<string or null>",
  "reportDate": "<YYYY-MM-DD or null>",
  "surveyNumber": "<string or null>"
}}

Rules:
- Only include parameters that are CLEARLY stated in the text. Set value to null if uncertain.
- Do not invent values. Return real numbers from the report only.
- For nitrogen in ppm, multiply by 1.4 to convert to kg/ha approximately.
- Respond with valid JSON only, no explanation.
"""
            response = model.generate_content(prompt)
            raw = response.text.strip()
            # Extract JSON block
            json_match = re.search(r'\{.*\}', raw, re.DOTALL)
            if json_match:
                parsed = json.loads(json_match.group())
                gemini_confidence = 0.92

                # Build structured parameters
                param_keys = ['nitrogen', 'phosphorus', 'potassium', 'ph', 'ec',
                               'organicCarbon', 'sulphur', 'zinc', 'iron', 'copper', 'manganese', 'boron']
                for pk in param_keys:
                    if pk in parsed and parsed[pk] and parsed[pk].get('value') is not None:
                        val = parsed[pk]['value']
                        unit = parsed[pk].get('unit', '')
                        parameters[pk] = {
                            'value': float(val),
                            'unit': unit,
                            'method': 'AI-Extracted (Gemini)',
                            'confidence': 0.92,
                            'status': classify_param(pk, float(val))
                        }

                # Metadata
                meta = {
                    'soilTexture': parsed.get('soilTexture', ''),
                    'farmerName':  parsed.get('farmerName', ''),
                    'district':    parsed.get('district', ''),
                    'laboratoryName': parsed.get('laboratoryName', ''),
                    'reportDate':  parsed.get('reportDate', ''),
                    'surveyNumber': parsed.get('surveyNumber', ''),
                }
            else:
                meta = {}
        except Exception as e:
            print(f'Gemini extraction error: {e}')
            traceback.print_exc()
            meta = {}
            gemini_confidence = 0.0
    else:
        meta = {}

    # Fallback defaults if no parameters extracted
    if not parameters:
        parameters = {
            'nitrogen':      {'value': 190, 'unit': 'kg/ha', 'method': 'Default Estimate', 'confidence': 0.50, 'status': 'Low / Deficient'},
            'phosphorus':    {'value': 36,  'unit': 'kg/ha', 'method': 'Default Estimate', 'confidence': 0.50, 'status': 'Adequate'},
            'potassium':     {'value': 125, 'unit': 'kg/ha', 'method': 'Default Estimate', 'confidence': 0.50, 'status': 'Low / Deficient'},
            'ph':            {'value': 7.8, 'unit': 'pH unit','method': 'Default Estimate','confidence': 0.50, 'status': 'Moderately Alkaline'},
            'ec':            {'value': 0.46,'unit': 'dS/m',  'method': 'Default Estimate', 'confidence': 0.50, 'status': 'Normal'},
            'organicCarbon': {'value': 0.36,'unit': '%',     'method': 'Default Estimate', 'confidence': 0.50, 'status': 'Low'},
            'sulphur':       {'value': 8.5, 'unit': 'ppm',   'method': 'Default Estimate', 'confidence': 0.50, 'status': 'Low / Deficient'},
            'zinc':          {'value': 0.44,'unit': 'ppm',   'method': 'Default Estimate', 'confidence': 0.50, 'status': 'Low / Deficient'},
            'boron':         {'value': 0.36,'unit': 'ppm',   'method': 'Default Estimate', 'confidence': 0.50, 'status': 'Low / Deficient'},
        }
        gemini_confidence = 0.0
        meta = {}

    report_id = f"rep_{abs(hash(filename + extracted_text[:50]))}"
    report = {
        'id': report_id,
        'title': filename.replace('.pdf', '').replace('_', ' ').title(),
        'farmerName':      meta.get('farmerName') or 'Self-Uploaded',
        'laboratoryName':  meta.get('laboratoryName') or 'Uploaded Laboratory Report',
        'reportDate':      meta.get('reportDate') or __import__('datetime').date.today().isoformat(),
        'reportType':      'AI-Parsed Soil Laboratory Report',
        'district':        meta.get('district') or 'Karnataka',
        'surveyNumber':    meta.get('surveyNumber') or '',
        'soilTexture':     meta.get('soilTexture') or 'loam',
        'confidenceScore': gemini_confidence if gemini_confidence > 0 else 0.5,
        'verificationStatus': 'PENDING_VERIFICATION',
        'extraction_status': 'SUCCESS' if gemini_confidence > 0 else 'FALLBACK',
        'parameters': parameters
    }
    return jsonify({'status': 'success', 'report': report})

# ─── Soil Analysis ─────────────────────────────────────────────────────────────
@app.route('/api/v1/soil/analyze', methods=['POST'])
def analyze_soil():
    data = request.json or {}
    params = data.get('parameters', {})
    deficiencies = []
    penalty = 0

    for key, thresh in SOIL_THRESHOLDS.items():
        pobj = params.get(key, {})
        val = pobj.get('value')
        if val is None: continue
        val = float(val)
        status = classify_param(key, val)
        if 'Low' in status or 'Deficient' in status or 'Acidic' in status or 'Alkaline' in status:
            deficiencies.append({'key': key, 'name': key.title(), 'value': val, 'status': status, 'severity': 'warning'})
            penalty += 8

    score = max(35, min(100, 100 - penalty))
    return jsonify({'status': 'success', 'analysis': {
        'overallScore': score,
        'overallHealthScore': score,
        'deficiencies': deficiencies,
        'ph': float(params.get('ph', {}).get('value', 7.0)),
        'summary': {
            'overallHealthScore': score,
            'overallHealth': 'Good / Fertile Soil' if score >= 80 else 'Moderate / Requires Attention' if score >= 60 else 'Degraded / Severe Deficiencies',
            'deficiencies': deficiencies,
            'excesses': [],
            'criticalAlerts': [],
            'phCondition': classify_param('ph', float(params.get('ph', {}).get('value', 7.0))),
            'salinityCondition': classify_param('ec', float(params.get('ec', {}).get('value', 0.5))),
            'organicCarbonStatus': classify_param('organicCarbon', float(params.get('organicCarbon', {}).get('value', 0.5)))
        }
    }})

# ─── Stage-wise Precision Irrigation ──────────────────────────────────────────
@app.route('/api/v1/irrigation/stage-timeline', methods=['POST'])
def stage_timeline():
    data = request.json or {}
    crop_id = data.get('cropId', 'tomato')
    area = float(data.get('farmArea', 1.0))
    area_unit = data.get('areaUnit', 'acre')
    irrigation_method = data.get('irrigationMethod', 'drip')
    soil_texture = data.get('soilTexture', 'loam').lower()
    current_stage = data.get('growthStage', '')

    area_acres = area * 2.47105 if area_unit == 'hectare' else area
    crop = CROPS_DATA.get(crop_id, CROPS_DATA['tomato'])

    eff_map = {'drip': 0.90, 'sprinkler': 0.75, 'furrow': 0.60}
    eff = eff_map.get(irrigation_method, 0.90)

    texture_key = soil_texture if soil_texture in TEXTURE_WHC else 'loam'
    whc_info = TEXTURE_WHC.get(texture_key, TEXTURE_WHC['loam'])
    timeline = build_full_stage_timeline(crop, area_acres, eff, texture_key)

    # Find current stage advisory
    current = next((t for t in timeline if t['stageKey'] == current_stage), timeline[0] if timeline else {})

    # Total seasonal water
    total_seasonal_litres = sum(t['dailyLitres'] * t['durationDays'] for t in timeline)

    return jsonify({
        'status': 'success',
        'cropName': crop['name'],
        'farmArea': {'value': area, 'unit': area_unit, 'acres': round(area_acres, 2)},
        'irrigationMethod': irrigation_method,
        'efficiency': eff,
        'soilTexture': {'key': texture_key, 'name': whc_info['name'], 'description': whc_info['description'],
                         'whcMmPer100mm': whc_info['whc_mm_per_100mm']},
        'et0BaseLine': ET0_BASELINE,
        'timeline': timeline,
        'currentStage': current,
        'totalSeasonalLitres': total_seasonal_litres,
        'weeklyLitres': current.get('weeklyLitres', 0) if current else 0,
    })

# ─── Nutrients ────────────────────────────────────────────────────────────────
@app.route('/api/v1/nutrients/recommend', methods=['POST'])
def recommend_nutrients():
    data = request.json or {}
    crop_id = data.get('cropId', 'tomato')
    area = float(data.get('farmArea', 1.0))
    crop = CROPS_DATA.get(crop_id, CROPS_DATA['tomato'])
    req_n = crop['rdfAcre']['n'] * area * 1.25
    req_p = crop['rdfAcre']['p'] * area
    req_k = crop['rdfAcre']['k'] * area * 1.25
    dap_kg = round(req_p / 0.46)
    n_from_dap = dap_kg * 0.18
    urea_kg = round(max(0, req_n - n_from_dap) / 0.46)
    mop_kg = round(req_k / 0.60)
    return jsonify({'status': 'success', 'fertilizers': [
        {'name': 'Urea', 'kg': urea_kg, 'bags': round(urea_kg / 45, 1)},
        {'name': 'DAP',  'kg': dap_kg,  'bags': round(dap_kg / 50, 1)},
        {'name': 'MOP',  'kg': mop_kg,  'bags': round(mop_kg / 50, 1)},
    ]})

# ─── Irrigation Advisory ──────────────────────────────────────────────────────
@app.route('/api/v1/irrigation/recommend', methods=['POST'])
def recommend_irrigation():
    data = request.json or {}
    crop_id = data.get('cropId', 'tomato')
    stage_key = data.get('growthStage', 'flowering')
    area = float(data.get('farmArea', 1.0))
    irrigation_method = data.get('irrigationMethod', 'drip')
    area_unit = data.get('areaUnit', 'acre')
    area_acres = area * 2.47105 if area_unit == 'hectare' else area

    crop = CROPS_DATA.get(crop_id, CROPS_DATA['tomato'])
    eff_map = {'drip': 0.90, 'sprinkler': 0.75, 'furrow': 0.60}
    eff = eff_map.get(irrigation_method, 0.90)

    result = compute_stage_irrigation(crop, stage_key, area_acres, eff)
    gross = result['grossMm']
    daily_litres = result['dailyLitres']

    rate_map = {'drip': 20000, 'sprinkler': 25000, 'furrow': 35000}
    day_map  = {'drip': 2, 'sprinkler': 3, 'furrow': 6}
    rate = rate_map.get(irrigation_method, 20000)
    days = day_map.get(irrigation_method, 2)
    cycle_litres = daily_litres * days
    runtime = cycle_litres / rate
    hrs = int(runtime)
    mins = round((runtime - hrs) * 60)

    flood_daily = round((result['etc_mm'] / 0.60) * 4047 * area_acres)
    saved = max(0, flood_daily - daily_litres)
    pct = round((saved / flood_daily * 100) if flood_daily > 0 else 0)

    return jsonify({'status': 'success', 'advisory': {
        'et0_mm': ET0_BASELINE, 'kc': result['kc'], 'etc_mm': result['etc_mm'],
        'gross_requirement_mm': gross, 'daily_litres': daily_litres,
        'schedule': f'{hrs}h {mins}m every {days} days via {irrigation_method}',
        'water_saved_vs_flood': saved, 'savings_percent': pct,
        'waterBalance': {
            'netRequirementMm': result['etc_mm'], 'grossRequirementMm': gross,
            'dailyLitresTotal': daily_litres, 'cycleLitresTotal': cycle_litres,
            'intervalDays': days, 'litresPerAcrePerDay': round(gross * 4047)
        }
    }})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
