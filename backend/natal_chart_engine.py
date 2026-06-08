import swisseph as swe
from datetime import datetime
import math
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

class NatalChartEngine:
    def __init__(self):
        # Set ephemeris path (create 'ephe' folder in same directory)
        swe.set_ephe_path('./ephe')
        
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
        
        # House system: Placidus
        self.house_system = b'P'
        
        # Zodiac signs
        self.signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
        
        # Planet rulers for each sign
        self.sign_rulers = {
            0: 'Mars', 1: 'Venus', 2: 'Mercury', 3: 'Moon',
            4: 'Sun', 5: 'Mercury', 6: 'Venus', 7: 'Mars',
            8: 'Jupiter', 9: 'Saturn', 10: 'Saturn', 11: 'Jupiter'
        }
        
        # Special aspects (beyond 7th house)
        self.special_aspects = {
            'Mars': [90, 180],     # 4th and 7th house
            'Jupiter': [120, 180],  # 5th and 7th house
            'Saturn': [90, 180, 270]  # 3rd, 7th, 10th house
        }
    
    def calculate_ascendant(self, year, month, day, hour, minute, lat, lon):
        """Calculate Ascendant (Lagna)"""
        jd = swe.julday(year, month, day, hour + minute/60.0, swe.GREG_CAL)
        houses, ascmc = swe.houses(jd, lat, lon, self.house_system)
        return houses[0] % 360
    
    def calculate_houses(self, year, month, day, hour, minute, lat, lon):
        """Calculate all 12 house cusps"""
        jd = swe.julday(year, month, day, hour + minute/60.0, swe.GREG_CAL)
        houses, ascmc = swe.houses(jd, lat, lon, self.house_system)
        return [h % 360 for h in houses[:12]]
    
    def calculate_planet_position(self, year, month, day, hour, minute, planet_id):
        """Calculate planet longitude"""
        jd = swe.julday(year, month, day, hour + minute/60.0, swe.GREG_CAL)
        result = swe.calc_ut(jd, planet_id, swe.FLG_SWIEPH)
        return result[0][0] % 360
    
    def get_house_number(self, planet_long, house_cusps):
        """Determine which house a planet falls into"""
        for i in range(12):
            cusp_start = house_cusps[i]
            cusp_end = house_cusps[(i + 1) % 12]
            
            if cusp_end < cusp_start:  # Wrap around 360
                if planet_long >= cusp_start or planet_long < cusp_end:
                    return i + 1
            else:
                if cusp_start <= planet_long < cusp_end:
                    return i + 1
        return 1
    
    def get_house_lord(self, house_cusp):
        """Get ruling planet for a house based on its cusp"""
        sign_index = int(house_cusp // 30) % 12
        return self.sign_rulers.get(sign_index, 'Unknown')
    
    def calculate_aspects(self, planet_positions):
        """Calculate aspects between planets"""
        aspects = {}
        planet_list = list(planet_positions.keys())
        
        # Initialize aspects dict
        for planet in planet_list:
            aspects[planet] = {'aspects_to': [], 'receives_aspect_from': []}
        
        # Calculate aspects
        for i, p1 in enumerate(planet_list):
            for p2 in planet_list[i+1:]:
                pos1 = planet_positions[p1]
                pos2 = planet_positions[p2]
                
                # Angle from p1 to p2
                angle = (pos2 - pos1) % 360
                
                # Check if p1 aspects p2
                if self.has_aspect(p1, angle):
                    aspects[p1]['aspects_to'].append(p2)
                    aspects[p2]['receives_aspect_from'].append(p1)
                
                # Angle from p2 to p1
                angle2 = (pos1 - pos2) % 360
                
                # Check if p2 aspects p1
                if self.has_aspect(p2, angle2):
                    aspects[p2]['aspects_to'].append(p1)
                    aspects[p1]['receives_aspect_from'].append(p2)
        
        return aspects
    
    def has_aspect(self, planet, angle, orb=5):
        """Check if planet has aspect at given angle"""
        # 7th house aspect (180 degrees) for all planets
        if abs(angle - 180) <= orb:
            return True
        
        # Special aspects
        if planet in self.special_aspects:
            for aspect_angle in self.special_aspects[planet]:
                if abs(angle - aspect_angle) <= orb:
                    return True
        
        return False
    
    def get_sign_name(self, longitude):
        """Get zodiac sign from longitude"""
        sign_index = int(longitude // 30) % 12
        return self.signs[sign_index]
    
    def generate_natal_chart(self, birth_data):
        """Generate complete natal chart"""
        year = birth_data['year']
        month = birth_data['month']
        day = birth_data['day']
        hour = birth_data['hour']
        minute = birth_data['minute']
        lat = birth_data['latitude']
        lon = birth_data['longitude']
        
        # Calculate ascendant
        ascendant = self.calculate_ascendant(year, month, day, hour, minute, lat, lon)
        
        # Calculate house cusps
        house_cusps = self.calculate_houses(year, month, day, hour, minute, lat, lon)
        
        # Calculate planet positions
        planet_positions = {}
        for name, pid in self.planets.items():
            pos = self.calculate_planet_position(year, month, day, hour, minute, pid)
            planet_positions[name] = pos
        
        # Calculate Ketu (opposite of Rahu)
        if 'Rahu' in planet_positions:
            planet_positions['Ketu'] = (planet_positions['Rahu'] + 180) % 360
        
        # Place planets in houses
        planets_in_house = {i+1: [] for i in range(12)}
        for planet, pos in planet_positions.items():
            house_num = self.get_house_number(pos, house_cusps)
            planets_in_house[house_num].append(planet)
        
        # Calculate house lords
        house_lords = {}
        for i, cusp in enumerate(house_cusps):
            house_lords[i+1] = self.get_house_lord(cusp)
        
        # Calculate aspects
        aspects = self.calculate_aspects(planet_positions)
        
        # Build house aspects data
        house_aspects = {i+1: {'aspects_from': [], 'aspects_to': []} for i in range(12)}
        
        for planet, aspect_data in aspects.items():
            # Find house containing this planet
            planet_house = self.get_house_number(planet_positions[planet], house_cusps)
            
            # Aspects from this planet to others
            for aspected_planet in aspect_data['aspects_to']:
                aspected_house = self.get_house_number(planet_positions[aspected_planet], house_cusps)
                house_aspects[planet_house]['aspects_to'].append({
                    'to_house': aspected_house,
                    'planet': aspected_planet
                })
                house_aspects[aspected_house]['aspects_from'].append({
                    'from_house': planet_house,
                    'planet': planet
                })
        
        # Build final JSON
        chart = {
            'metadata': {
                'birth_date': f"{year}-{month:02d}-{day:02d}",
                'birth_time': f"{hour:02d}:{minute:02d}",
                'latitude': lat,
                'longitude': lon,
                'ascendant_degrees': round(ascendant, 2),
                'ascendant_sign': self.get_sign_name(ascendant)
            },
            'houses': [],
            'planets': {k: round(v, 2) for k, v in planet_positions.items()}
        }
        
        for house_num in range(1, 13):
            house_data = {
                'house_number': house_num,
                'cusp_degrees': round(house_cusps[house_num-1], 2),
                'lord': house_lords[house_num],
                'planets': planets_in_house[house_num],
                'aspects_from': house_aspects[house_num]['aspects_from'],
                'aspects_to': house_aspects[house_num]['aspects_to']
            }
            chart['houses'].append(house_data)
        
        return chart

# Initialize engine
engine = NatalChartEngine()

@app.route('/api/natal-chart', methods=['POST'])
def generate_chart():
    """API endpoint to generate natal chart"""
    try:
        data = request.json
        
        # Validate required fields
        required = ['year', 'month', 'day', 'hour', 'minute', 'latitude', 'longitude']
        missing = [f for f in required if f not in data]
        
        if missing:
            return jsonify({'error': f'Missing fields: {missing}'}), 400
        
        # Generate chart
        chart = engine.generate_natal_chart(data)
        
        return jsonify(chart)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'Natal Chart Engine Running'})

if __name__ == '__main__':
    print("Starting Natal Chart Engine on port 5001...")
    app.run(host='0.0.0.0', port=5001, debug=True)
