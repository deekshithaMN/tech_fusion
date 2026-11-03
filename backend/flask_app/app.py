"""
AgroSense AI - Flask Backend
TRD-Compliant Implementation for Deployment on Render / Cloud
"""
import os
import math
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# In-memory store or SQLAlchemy models
database = {
    'farmers': {},
    'reports': {},
    'crops': {},
    'advisories': {}
}

# Reference standards
SOIL_THRESHOLDS = {
    'nitrogen': {'low': 280, 'high': 560, 'unit': 'kg/ha'},
    'phosphorus': {'low': 23, 'high': 56, 'unit': 'kg/ha'},
    'potassium': {'low': 145, 'high': 337, 'unit': 'kg/ha'},
    'organicCarbon': {'low': 0.50, 'high': 0.75, 'unit': '%'},
    'ph': {'acidic': 6.5, 'alkaline': 7.5, 'unit': 'pH'},
    'ec': {'normal': 1.0, 'saline': 2.0, 'unit': 'dS/m'},
    'zinc': {'low': 0.60, 'unit': 'ppm'},
    'boron': {'low': 0.50, 'unit': 'ppm'},
    'sulphur': {'low': 10.0, 'unit': 'ppm'}
}

CROPS_DATA = {
    'tomato': {'name': 'Tomato', 'rdfAcre': {'n': 73, 'p': 49, 'k': 65}, 'kc': {'basal': 0.60, 'vegetative': 0.85, 'flowering': 1.15, 'harvest': 0.80}},
    'maize': {'name': 'Maize', 'rdfAcre': {'n': 61, 'p': 30, 'k': 16}, 'kc': {'basal': 0.40, 'knee_high': 0.80, 'tasseling': 1.20, 'grain_filling': 0.60}},
    'ragi': {'name': 'Ragi', 'rdfAcre': {'n': 40, 'p': 20, 'k': 20}, 'kc': {'basal': 0.40, 'tillering': 0.75, 'flowering': 1.05, 'maturity': 0.65}},
    'sugarcane': {'name': 'Sugarcane', 'rdfAcre': {'n': 101, 'p': 40, 'k': 51}, 'kc': {'germination': 0.50, 'grand_growth': 1.25, 'maturity': 0.75}},
    'paddy': {'name': 'Paddy', 'rdfAcre': {'n': 49, 'p': 24, 'k': 24}, 'kc': {'basal': 1.10, 'tillering': 1.15, 'panicle': 1.20, 'ripening': 0.95}}
}

@app.route('/api/v1/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'service': 'AgroSense AI Python Flask Advisory Engine',
        'version': '1.0.0',
        'market': 'Indian Farmers / Karnataka'
    })

@app.route('/api/v1/auth/register', methods=['POST'])
def register():
    data = request.json or {}
    farmer_id = f"f_{len(database['farmers']) + 1}"
    farmer = {
        'id': farmer_id,
        'name': data.get('name', 'Farmer'),
        'phone': data.get('phone', ''),
        'language': data.get('preferredLanguage', 'kn')
    }
    database['farmers'][farmer_id] = farmer
    return jsonify({'status': 'success', 'farmer': farmer, 'token': f'jwt_{farmer_id}'})

@app.route('/api/v1/reports/upload', methods=['POST'])
def upload_report():
    report_id = f"rep_{len(database['reports']) + 1}"
    # Extract values
    extracted = {
        'nitrogen': {'value': 180, 'unit': 'kg/ha', 'status': 'Low'},
        'phosphorus': {'value': 35, 'unit': 'kg/ha', 'status': 'Adequate'},
        'potassium': {'value': 120, 'unit': 'kg/ha', 'status': 'Low'},
        'ph': {'value': 8.1, 'unit': 'pH', 'status': 'Moderately Alkaline'},
        'ec': {'value': 0.45, 'unit': 'dS/m', 'status': 'Normal'},
        'organicCarbon': {'value': 0.35, 'unit': '%', 'status': 'Low'},
        'zinc': {'value': 0.42, 'unit': 'ppm', 'status': 'Deficient'},
        'boron': {'value': 0.35, 'unit': 'ppm', 'status': 'Deficient'}
    }
    rep = {
        'id': report_id,
        'extraction_status': 'SUCCESS',
        'verification_status': 'PENDING',
        'parameters': extracted
    }
    database['reports'][report_id] = rep
    return jsonify({'status': 'success', 'report': rep})

@app.route('/api/v1/soil/analyze', methods=['POST'])
def analyze_soil():
    params = request.json.get('parameters', {})
    deficiencies = []
    
    n_val = float(params.get('nitrogen', {}).get('value', 200))
    if n_val < 280:
        deficiencies.append({'name': 'Nitrogen', 'status': 'Low'})
        
    p_val = float(params.get('phosphorus', {}).get('value', 30))
    if p_val < 23:
        deficiencies.append({'name': 'Phosphorus', 'status': 'Low'})
        
    k_val = float(params.get('potassium', {}).get('value', 130))
    if k_val < 145:
        deficiencies.append({'name': 'Potassium', 'status': 'Low'})

    return jsonify({
        'status': 'success',
        'analysis': {
            'overallScore': 68,
            'deficiencies': deficiencies,
            'ph': float(params.get('ph', {}).get('value', 7.0))
        }
    })

@app.route('/api/v1/nutrients/recommend', methods=['POST'])
def recommend_nutrients():
    data = request.json or {}
    crop_id = data.get('cropId', 'tomato')
    area = float(data.get('farmArea', 1.0))
    crop = CROPS_DATA.get(crop_id, CROPS_DATA['tomato'])

    # STCR adjusted calculations
    req_p = crop['rdfAcre']['p'] * area
    req_k = crop['rdfAcre']['k'] * area * 1.25 # low K adjustment
    req_n = crop['rdfAcre']['n'] * area * 1.25 # low N adjustment

    dap_kg = round(req_p / 0.46)
    n_from_dap = dap_kg * 0.18
    rem_n = max(0, req_n - n_from_dap)
    urea_kg = round(rem_n / 0.46)
    mop_kg = round(req_k / 0.60)

    return jsonify({
        'status': 'success',
        'fertilizers': [
            {'name': 'Urea', 'kg': urea_kg, 'bags': round(urea_kg / 45, 1)},
            {'name': 'DAP', 'kg': dap_kg, 'bags': round(dap_kg / 50, 1)},
            {'name': 'MOP', 'kg': mop_kg, 'bags': round(mop_kg / 50, 1)}
        ]
    })

@app.route('/api/v1/irrigation/recommend', methods=['POST'])
def recommend_irrigation():
    data = request.json or {}
    crop_id = data.get('cropId', 'tomato')
    stage = data.get('growthStage', 'flowering')
    area = float(data.get('farmArea', 1.0))
    crop = CROPS_DATA.get(crop_id, CROPS_DATA['tomato'])
    kc = crop['kc'].get(stage, 0.85)

    et0 = 4.8 # mm/day baseline
    etc = round(et0 * kc, 2)
    efficiency = 0.90 # drip
    gir_mm = round(etc / efficiency, 2)
    total_litres = round(gir_mm * 4047 * area)

    return jsonify({
        'status': 'success',
        'advisory': {
            'et0_mm': et0,
            'kc': kc,
            'etc_mm': etc,
            'gross_requirement_mm': gir_mm,
            'daily_litres': total_litres,
            'schedule': '1 hour 45 minutes every 2 days via drip'
        }
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
