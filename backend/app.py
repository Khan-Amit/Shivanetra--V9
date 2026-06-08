# C:/Shivanetra_V9/backend/app.py

from flask import Flask, render_template, send_from_directory, jsonify, request
from flask_cors import CORS
import json
import os

# Import the natal chart blueprint
from natal_chart_api import natal_chart_bp

app = Flask(__name__, 
           static_folder='../frontend',
           template_folder='../frontend')
CORS(app)

# Register the natal chart blueprint
app.register_blueprint(natal_chart_bp)

# Your existing database imports (adjust as needed)
# from your_existing_modules import proximity_stars, nakshatra_db, etc.

@app.route('/')
def index():
    """Serve main page"""
    return render_template('index.html')

@app.route('/page3')
def page3():
    """Page 3 - Natal Chart & Nakshatra page"""
    return render_template('page3.html')

@app.route('/api/save-birth-data', methods=['POST'])
def save_birth_data():
    """Save birth data from frontend"""
    try:
        data = request.json
        # Store in session or database as needed
        return jsonify({'status': 'success', 'message': 'Birth data saved'})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

# Your existing API endpoints
@app.route('/api/nakshatra', methods=['POST'])
def get_nakshatra():
    """Get nakshatra from birth data"""
    try:
        data = request.json
        # Your existing nakshatra calculation
        # This is a placeholder - replace with your actual code
        return jsonify({
            'nakshatra': 'Uttara Phalguni',
            'ruler': 'Sun',
            'element': 'Air'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/lo-shu-grid', methods=['POST'])
def get_lo_shu_grid():
    """Get Lo Shu Grid calculation"""
    try:
        data = request.json
        # Your existing Lo Shu Grid calculation
        return jsonify({
            'grid': [[1,1,1], [1,1,1], [1,1,1]],
            'ruling_number': 3,
            'missing_numbers': [3,4,8]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/kua-number', methods=['POST'])
def get_kua_number():
    """Get Kua Number calculation"""
    try:
        data = request.json
        # Your existing Kua calculation
        return jsonify({
            'kua_number': 4,
            'group': 'East Group'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/kabbalah', methods=['POST'])
def get_kabbalah():
    """Get Kabbalah calculation"""
    try:
        data = request.json
        # Your existing Kabbalah calculation
        return jsonify({
            'number': 8,
            'meaning': 'Power, abundance, ambition'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/kundalini', methods=['POST'])
def get_kundalini():
    """Get Kundalini calculation"""
    try:
        data = request.json
        # Your existing Kundalini calculation
        return jsonify({
            'chakras': ['Root', 'Sacral', 'Solar Plexus', 'Heart', 'Throat', 'Third Eye', 'Crown']
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("=" * 50)
    print("Shivanetra V9 - Server Starting...")
    print(f"Visit: http://localhost:5001")
    print(f"Natal Chart API: http://localhost:5001/api/natal-chart")
    print("=" * 50)
    app.run(host='0.0.0.0', port=5001, debug=True)
