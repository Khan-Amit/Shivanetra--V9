# C:/Shivanetra_V9/backend/natal_chart_api.py

import swisseph as swe
from flask import Blueprint, request, jsonify
from datetime import datetime

# Create blueprint for integration
natal_chart_bp = Blueprint('natal_chart', __name__, url_prefix='/api')

class NatalChartEngine:
    def __init__(self):
        # Set path to ephemeris files
        swe.set_ephe_path('C:/Shivanetra_V9/ephe')
        
        # Planet mapping
        self.planets = {
            'Sun': swe.SUN,
            'Moon': swe.MOON,
            'Mars': swe.MARS,
            'Mercury': swe.MERCURY,
            'Jupiter': swe.JUPITER,
            'Venus': swe.VENUS,
            'Saturn': swe.SATURN,
            'Rahu': swe.MEAN_NODE
        }
        
        # Zodiac signs
        self.zodiac_signs = [
            'Aries', 'Taurus', 'Gemini', 'Cancer',
            'Leo', 'Virgo', 'Libra', 'Scorpio',
            'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
        ]
        
        # Sign rulers
        self.sign_rulers = {
            0: 'Mars', 1: 'Venus', 2: 'Mercury', 3: 'Moon',
            4: 'Sun', 5: 'Mercury', 6: 'Venus', 7: 'Mars',
            8: 'Jupiter', 9: 'Saturn', 10: 'Saturn', 11: 'Jupiter'
        }
        
        # Special aspects beyond 7th house
        self.special_aspects = {
            'Mars': [90, 180],      # 4th and 7th house
            'Jupiter': [120, 180],  # 5th and 7th house
            'Saturn': [90, 180, 270] # 3rd, 7th, 10th house
        }
    
    def calculate_julian_day(self, year, month, day, hour, minute):
        """Convert birth date to Julian Day"""
        return swe.julday(year, month, day, hour + minute/60.0, swe.GREG_CAL)
    
    def calculate_ascendant_and_houses(self, year, month, day, hour, minute, lat, lon):
        """Calculate ascendant (Lagna) and all 12 house cusps"""
        jd = self.calculate_julian_day(year, month, day, hour, minute)
        houses, ascmc = swe.houses(jd, lat, lon, b'P')  # Placidus system
        return {
            'ascendant': ascmc[0] % 360,
            'midheaven': ascmc[1] % 360,
            'house_cusps': [h % 360 for h in houses[:12]]
        }
    
    def calculate_planet_positions(self, year, month, day, hour, minute):
        """Calculate positions of all planets"""
        jd = self.calculate_julian_day(year, month, day, hour, minute)
        positions = {}
        
        for planet_name, planet_id in self.planets.items():
            try:
                result = swe.calc_ut(jd, planet_id, swe.FLG_SWIEPH)
                positions[planet_name] = result[0][0] % 360
            except:
                positions[planet_name] = 0.0
        
        # Calculate Ketu (South Node - opposite of Rahu)
        if 'Rahu' in positions:
            positions['Ketu'] = (positions['Rahu'] + 180) % 360
        
        return positions
    
    def get_house_for_planet(self, planet_longitude, house_cusps):
        """Determine which house a planet falls into"""
        for i in range(12):
            start = house_cusps[i]
            end = house_cusps[(i + 1) % 12]
            
            if end < start:  # Wrap around 360 degrees
                if planet_longitude >= start or planet_longitude < end:
                    return i + 1
            else:
                if start <= planet_longitude < end:
                    return i + 1
        return 1
    
    def get_house_lord(self, house_cusp):
        """Get the ruling planet for a house based on its cusp degree"""
        sign_index = int(house_cusp // 30) % 12
        return self.sign_rulers[sign_index]
    
    def get_zodiac_sign(self, longitude):
        """Get zodiac sign name from longitude"""
        sign_index = int(longitude // 30) % 12
        return self.zodiac_signs[sign_index]
    
    def has_aspect(self, planet, angle, orb=5):
        """Check if a planet has an aspect at given angle"""
        # 7th house aspect for ALL planets (180 degrees)
        if abs(angle - 180) <= orb:
            return True
        
        # Special aspects for certain planets
        if planet in self.special_aspects:
            for aspect_angle in self.special_aspects[planet]:
                if abs(angle - aspect_angle) <= orb:
                    return True
        
        return False
    
    def calculate_all_aspects(self, planet_positions):
        """Calculate all planetary aspects (Graha Drishti)"""
        aspects = {}
        planet_names = list(planet_positions.keys())
        
        # Initialize aspect dictionary
        for planet in planet_names:
            aspects[planet] = {
                'aspects_to': [],      # Planets this planet aspects
                'receives_from': []    # Planets that aspect this planet
            }
        
        # Calculate aspects between all planet pairs
        for i, p1 in enumerate(planet_names):
            for p2 in planet_names[i+1:]:
                pos1 = planet_positions[p1]
                pos2 = planet_positions[p2]
                
                # Angle from p1 to p2
                angle_p1_to_p2 = (pos2 - pos1) % 360
                if self.has_aspect(p1, angle_p1_to_p2):
                    aspects[p1]['aspects_to'].append(p2)
                    aspects[p2]['receives_from'].append(p1)
                
                # Angle from p2 to p1
                angle_p2_to_p1 = (pos1 - pos2) % 360
                if self.has_aspect(p2, angle_p2_to_p1):
                    aspects[p2]['aspects_to'].append(p1)
                    aspects[p1]['receives_from'].append(p2)
        
        return aspects
    
    def generate_full_chart(self, birth_data):
        """Generate complete natal chart with all calculations"""
        # Extract data
        year = birth_data['year']
        month = birth_data['month']
        day = birth_data['day']
        hour = birth_data['hour']
        minute = birth_data['minute']
        latitude = birth_data['latitude']
        longitude = birth_data['longitude']
        city = birth_data.get('city', 'Unknown')
        country = birth_data.get('country', 'Unknown')
        
        # Calculate ascendant and houses
        house_data = self.calculate_ascendant_and_houses(year, month, day, hour, minute, latitude, longitude)
        ascendant = house_data['ascendant']
        midheaven = house_data['midheaven']
        house_cusps = house_data['house_cusps']
        
        # Calculate planet positions
        planet_positions = self.calculate_planet_positions(year, month, day, hour, minute)
        
        # Place planets in houses
        planets_in_house = {i+1: [] for i in range(12)}
        planet_house_map = {}
        
        for planet, pos in planet_positions.items():
            house_num = self.get_house_for_planet(pos, house_cusps)
            planets_in_house[house_num].append(planet)
            planet_house_map[planet] = house_num
        
        # Calculate house lords
        house_lords = {}
        for i, cusp in enumerate(house_cusps):
            house_lords[i+1] = self.get_house_lord(cusp)
        
        # Calculate aspects
        aspects = self.calculate_all_aspects(planet_positions)
        
        # Build house aspects data
        house_aspects = {i+1: {'from': [], 'to': []} for i in range(12)}
        
        for planet, aspect_data in aspects.items():
            from_house = planet_house_map[planet]
            
            for aspected_planet in aspect_data['aspects_to']:
                to_house = planet_house_map[aspected_planet]
                house_aspects[from_house]['to'].append({
                    'house': to_house,
                    'planet': aspected_planet
                })
                house_aspects[to_house]['from'].append({
                    'house': from_house,
                    'planet': planet
                })
        
        # Build final JSON structure
        chart_data = {
            'metadata': {
                'birth_date': f"{year}-{month:02d}-{day:02d}",
                'birth_time': f"{hour:02d}:{minute:02d}",
                'location': f"{city}, {country}" if city != 'Unknown' else f"Lat: {latitude}, Lon: {longitude}",
                'latitude': latitude,
                'longitude': longitude,
                'ascendant_degrees': round(ascendant, 2),
                'ascendant_sign': self.get_zodiac_sign(ascendant),
                'midheaven_degrees': round(midheaven, 2),
                'midheaven_sign': self.get_zodiac_sign(midheaven)
            },
            'houses': [],
            'planets': {k: round(v, 2) for k, v in planet_positions.items()},
            'aspects': aspects
        }
        
        # Add house data
        for house_num in range(1, 13):
            house_info = {
                'number': house_num,
                'cusp_degrees': round(house_cusps[house_num-1], 2),
                'cusp_sign': self.get_zodiac_sign(house_cusps[house_num-1]),
                'lord': house_lords[house_num],
                'planets': planets_in_house[house_num],
                'aspects_from': house_aspects[house_num]['from'],
                'aspects_to': house_aspects[house_num]['to']
            }
            chart_data['houses'].append(house_info)
        
        return chart_data

# Initialize engine
engine = NatalChartEngine()

@natal_chart_bp.route('/natal-chart', methods=['POST'])
def generate_natal_chart():
    """API endpoint to generate natal chart"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['year', 'month', 'day', 'hour', 'minute', 'latitude', 'longitude']
        missing_fields = [field for field in required_fields if field not in data]
        
        if missing_fields:
            return jsonify({
                'error': f'Missing required fields: {missing_fields}',
                'status': 'error'
            }), 400
        
        # Validate date ranges
        if not (1 <= data['month'] <= 12):
            return jsonify({'error': 'Month must be between 1 and 12', 'status': 'error'}), 400
        
        if not (1 <= data['day'] <= 31):
            return jsonify({'error': 'Day must be between 1 and 31', 'status': 'error'}), 400
        
        if not (0 <= data['hour'] <= 23):
            return jsonify({'error': 'Hour must be between 0 and 23', 'status': 'error'}), 400
        
        if not (0 <= data['minute'] <= 59):
            return jsonify({'error': 'Minute must be between 0 and 59', 'status': 'error'}), 400
        
        # Generate chart
        chart = engine.generate_full_chart(data)
        
        return jsonify({
            'status': 'success',
            'data': chart
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

@natal_chart_bp.route('/natal-chart/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Natal Chart Engine',
        'version': '1.0.0'
    }), 200
