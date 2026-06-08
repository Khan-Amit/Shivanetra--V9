import swisseph as swe
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

class NatalChartEngine:
    def __init__(self):
        swe.set_ephe_path('./ephe')
        
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
        
        self.signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
        
        self.sign_rulers = {
            0: 'Mars', 1: 'Venus', 2: 'Mercury', 3: 'Moon',
            4: 'Sun', 5: 'Mercury', 6: 'Venus', 7: 'Mars',
            8: 'Jupiter', 9: 'Saturn', 10: 'Saturn', 11: 'Jupiter'
        }
        
        self.special_aspects = {
            'Mars': [90, 180],
            'Jupiter': [120, 180],
            'Saturn': [90, 180, 270]
        }
    
    def get_ascendant(self, year, month, day, hour, minute, lat, lon):
        jd = swe.julday(year, month, day, hour + minute/60.0, swe.GREG_CAL)
        houses, ascmc = swe.houses(jd, lat, lon, b'P')
        return houses[0] % 360
    
    def get_houses(self, year, month, day, hour, minute, lat, lon):
        jd = swe.julday(year, month, day, hour + minute/60.0, swe.GREG_CAL)
        houses, ascmc = swe.houses(jd, lat, lon, b'P')
        return [h % 360 for h in houses[:12]]
    
    def get_planet_pos(self, year, month, day, hour, minute, planet_id):
        jd = swe.julday(year, month, day, hour + minute/60.0, swe.GREG_CAL)
        result = swe.calc_ut(jd, planet_id, swe.FLG_SWIEPH)
        return result[0][0] % 360
    
    def get_house_number(self, planet_long, house_cusps):
        for i in range(12):
            start = house_cusps[i]
            end = house_cusps[(i + 1) % 12]
            if end < start:
                if planet_long >= start or planet_long < end:
                    return i + 1
            else:
                if start <= planet_long < end:
                    return i + 1
        return 1
    
    def get_house_lord(self, cusp):
        sign = int(cusp // 30) % 12
        return self.sign_rulers.get(sign, 'Unknown')
    
    def has_aspect(self, planet, angle, orb=5):
        if abs(angle - 180) <= orb:
            return True
        if planet in self.special_aspects:
            for a in self.special_aspects[planet]:
                if abs(angle - a) <= orb:
                    return True
        return False
    
    def generate(self, data):
        year = data['year']
        month = data['month']
        day = data['day']
        hour = data['hour']
        minute = data['minute']
        lat = data['latitude']
        lon = data['longitude']
        
        ascendant = self.get_ascendant(year, month, day, hour, minute, lat, lon)
        house_cusps = self.get_houses(year, month, day, hour, minute, lat, lon)
        
        planet_positions = {}
        for name, pid in self.planets.items():
            pos = self.get_planet_pos(year, month, day, hour, minute, pid)
            planet_positions[name] = pos
        
        planet_positions['Ketu'] = (planet_positions['Rahu'] + 180) % 360
        
        planets_in_house = {i+1: [] for i in range(12)}
        for planet, pos in planet_positions.items():
            house = self.get_house_number(pos, house_cusps)
            planets_in_house[house].append(planet)
        
        house_lords = {}
        for i, cusp in enumerate(house_cusps):
            house_lords[i+1] = self.get_house_lord(cusp)
        
        # Calculate aspects
        aspects = {}
        planet_list = list(planet_positions.keys())
        for p in planet_list:
            aspects[p] = {'to': [], 'from': []}
        
        for i, p1 in enumerate(planet_list):
            for p2 in planet_list[i+1:]:
                angle = (planet_positions[p2] - planet_positions[p1]) % 360
                if self.has_aspect(p1, angle):
                    aspects[p1]['to'].append(p2)
                    aspects[p2]['from'].append(p1)
                
                angle2 = (planet_positions[p1] - planet_positions[p2]) % 360
                if self.has_aspect(p2, angle2):
                    aspects[p2]['to'].append(p1)
                    aspects[p1]['from'].append(p2)
        
        # Build result
        chart = {
            'metadata': {
                'date': f"{year}-{month:02d}-{day:02d}",
                'time': f"{hour:02d}:{minute:02d}",
                'lat': lat,
                'lon': lon,
                'ascendant': round(ascendant, 2),
                'ascendant_sign': self.signs[int(ascendant // 30) % 12]
            },
            'houses': [],
            'planets': {k: round(v, 2) for k, v in planet_positions.items()}
        }
        
        for h in range(1, 13):
            chart['houses'].append({
                'number': h,
                'cusp': round(house_cusps[h-1], 2),
                'lord': house_lords[h],
                'planets': planets_in_house[h],
                'aspects_from': [],
                'aspects_to': []
            })
        
        # Add aspects to houses
        for planet, asp in aspects.items():
            planet_house = None
            for h in chart['houses']:
                if planet in h['planets']:
                    planet_house = h['number']
                    break
            
            if planet_house:
                for target in asp['to']:
                    target_house = None
                    for h in chart['houses']:
                        if target in h['planets']:
                            target_house = h['number']
                            break
                    if target_house:
                        for h in chart['houses']:
                            if h['number'] == planet_house:
                                h['aspects_to'].append({'to': target_house, 'planet': target})
                            if h['number'] == target_house:
                                h['aspects_from'].append({'from': planet_house, 'planet': planet})
        
        return chart

engine = NatalChartEngine()

@app.route('/api/chart', methods=['POST'])
def chart():
    try:
        data = request.json
        result = engine.generate(data)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("Server running on http://localhost:5001")
    app.run(port=5001, debug=True)
