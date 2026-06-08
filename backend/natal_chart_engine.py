# natal_chart_engine.py

import swisseph as swe
from datetime import datetime
import math
from typing import Dict, List, Tuple
import pytz

class NatalChartEngine:
    def __init__(self):
        # Initialize Swiss Ephemeris (more accurate than Horizons for this purpose)
        swe.set_ephe_path('./ephe')  # Download ephemeris files
        
        # Planet indices
        self.PLANETS = {
            'Sun': swe.SUN,
            'Moon': swe.MOON,
            'Mars': swe.MARS,
            'Mercury': swe.MERCURY,
            'Jupiter': swe.JUPITER,
            'Venus': swe.VENUS,
            'Saturn': swe.SATURN,
            'Rahu': swe.MEAN_NODE,  # North Node
            'Ketu': None  # Will calculate as opposite of Rahu
        }
        
        # Special aspects: planet -> [aspect_degrees]
        self.SPECIAL_ASPECTS = {
            'Mars': [0, 180, 90],  # 7th, 4th, 8th (special)
            'Jupiter': [0, 180, 120, 60],  # 7th, 5th, 9th
            'Saturn': [0, 180, 90, 270],  # 7th, 3rd, 10th
        }
        
        # Default 7th aspect for all planets
        self.DEFAULT_ASPECT = 180
    
    def calculate_ascendant(self, year: int, month: int, day: int, 
                           hour: int, minute: int, lat: float, lon: float) -> float:
        """Calculate Ascendant (Lagna) in degrees"""
        # Julian day
        jd = swe.julday(year, month, day, hour + minute/60.0, swe.GREG_CAL)
        
        # Calculate ascendant
        houses, ascmc = swe.houses(jd, lat, lon, b'P')  # Placidus houses
        ascendant = ascmc[0]  # First house cusp
        
        return ascendant % 360
    
    def calculate_planet_position(self, jd: float, planet_id: int) -> float:
        """Calculate planet longitude in degrees"""
        if planet_id is None:
            return 0.0
            
        # Get planet position
        result = swe.calc_ut(jd, planet_id, swe.FLG_SWIEPH)
        longitude = result[0][0] % 360
        return longitude
    
    def get_house_for_planet(self, planet_long: float, house_cusps: List[float]) -> int:
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
    
    def get_house_lord(self, house_cusp: float, planet_positions: Dict) -> str:
        """Determine which planet rules a given house cusp"""
        # Zodiac signs and their rulers
        sign_rulers = {
            0: 'Mars', 1: 'Venus', 2: 'Mercury', 3: 'Moon',    # Aries to Cancer
            4: 'Sun', 5: 'Mercury', 6: 'Venus', 7: 'Mars',     # Leo to Scorpio
            8: 'Jupiter', 9: 'Saturn', 10: 'Saturn', 11: 'Jupiter'  # Sagittarius to Pisces
        }
        
        sign_index = int(house_cusp // 30) % 12
        return sign_rulers.get(sign_index, 'Unknown')
    
    def calculate_aspects(self, planet_positions: Dict) -> Dict:
        """Calculate all planetary aspects"""
        aspects = {planet: {'to': [], 'from': []} for planet in planet_positions}
        
        planets_list = list(planet_positions.keys())
        
        for i, p1 in enumerate(planets_list):
            pos1 = planet_positions[p1]
            
            for p2 in planets_list[i+1:]:
                pos2 = planet_positions[p2]
                angle = (pos2 - pos1) % 360
                
                # Check aspects from p1 to p2
                if self.has_aspect(p1, angle):
                    aspects[p1]['to'].append(p2)
                    aspects[p2]['from'].append(p1)
                
                # Check aspects from p2 to p1
                angle_reverse = (pos1 - pos2) % 360
                if self.has_aspect(p2, angle_reverse):
                    aspects[p2]['to'].append(p1)
                    aspects[p1]['from'].append(p2)
        
        return aspects
    
    def has_aspect(self, planet: str, angle: float, orb: float = 5.0) -> bool:
        """Check if a planet has an aspect at the given angle"""
        # 7th aspect for all planets
        if abs(angle - self.DEFAULT_ASPECT) <= orb:
            return True
        
        # Special aspects
        if planet in self.SPECIAL_ASPECTS:
            for aspect_deg in self.SPECIAL_ASPECTS[planet]:
                if abs(angle - aspect_deg) <= orb:
                    return True
        
        return False
    
    def generate_natal_chart(self, birth_data: Dict) -> Dict:
        """Generate complete natal chart"""
        # Extract data
        year = birth_data['year']
        month = birth_data['month']
        day = birth_data['day']
        hour = birth_data['hour']
        minute = birth_data['minute']
        lat = birth_data['latitude']
        lon = birth_data['longitude']
        
        # Calculate Julian day
        jd = swe.julday(year, month, day, hour + minute/60.0, swe.GREG_CAL)
        
        # Calculate ascendant and houses
        houses, ascmc = swe.houses(jd, lat, lon, b'P')
        house_cusps = [h % 360 for h in houses[:12]]
        ascendant = ascmc[0] % 360
        
        # Calculate planet positions
        planet_positions = {}
        for name, pid in self.PLANETS.items():
            if pid is not None:
                pos = self.calculate_planet_position(jd, pid)
                planet_positions[name] = pos
                
                # Calculate Ketu (opposite of Rahu)
                if name == 'Rahu':
                    planet_positions['Ketu'] = (pos + 180) % 360
        
        # Place planets in houses
        planets_in_houses = {i+1: [] for i in range(12)}
        for planet, pos in planet_positions.items():
            house_num = self.get_house_for_planet(pos, house_cusps)
            planets_in_houses[house_num].append(planet)
        
        # Determine house lords
        house_lords = {}
        for i, cusp in enumerate(house_cusps):
            house_num = i + 1
            house_lords[house_num] = self.get_house_lord(cusp, planet_positions)
        
        # Calculate aspects
        aspects = self.calculate_aspects(planet_positions)
        
        # Build house aspects data
        house_aspects = {i+1: {'from': [], 'to': []} for i in range(12)}
        
        for planet, aspect_data in aspects.items():
            # Find which house this planet is in
            planet_house = self.get_house_for_planet(planet_positions[planet], house_cusps)
            
            # Aspects to other planets
            for aspected_planet in aspect_data['to']:
                aspected_house = self.get_house_for_planet(planet_positions[aspected_planet], house_cusps)
                if aspected_house != planet_house:
                    house_aspects[planet_house]['to'].append({
                        'to_house': aspected_house,
                        'planet': aspected_planet
                    })
                    house_aspects[aspected_house]['from'].append({
                        'from_house': planet_house,
                        'planet': planet
                    })
        
        # Build final JSON structure
        chart_data = {
            'metadata': {
                'birth_date': f"{year}-{month:02d}-{day:02d}",
                'birth_time': f"{hour:02d}:{minute:02d}",
                'latitude': lat,
                'longitude': lon,
                'ascendant': round(ascendant, 2),
                'ascendant_sign': self.get_sign_name(ascendant)
            },
            'houses': []
        }
        
        for house_num in range(1, 13):
            house_data = {
                'number': house_num,
                'cusp': round(house_cusps[house_num-1], 2),
                'lord': house_lords[house_num],
                'planets': planets_in_houses[house_num],
                'aspects_to': house_aspects[house_num]['to'],
                'aspects_from': house_aspects[house_num]['from']
            }
            chart_data['houses'].append(house_data)
        
        # Add planet positions
        chart_data['planets'] = {
            planet: round(pos, 2) for planet, pos in planet_positions.items()
        }
        
        return chart_data
    
    def get_sign_name(self, longitude: float) -> str:
        """Get zodiac sign name from longitude"""
        signs = [
            'Aries', 'Taurus', 'Gemini', 'Cancer',
            'Leo', 'Virgo', 'Libra', 'Scorpio',
            'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
        ]
        sign_index = int(longitude // 30) % 12
        return signs[sign_index]

# API endpoint
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
chart_engine = NatalChartEngine()

@app.route('/api/natal-chart', methods=['POST'])
def get_natal_chart():
    data = request.json
    
    # Validate required fields
    required = ['year', 'month', 'day', 'hour', 'minute', 'latitude', 'longitude']
    if not all(field in data for field in required):
        return jsonify({'error': 'Missing required fields'}), 400
    
    try:
        chart = chart_engine.generate_natal_chart(data)
        return jsonify(chart)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5001, debug=True)
