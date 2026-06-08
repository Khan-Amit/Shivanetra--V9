import React, { useState } from 'react';
import './RasiChart.css';

const RasiChart = () => {
  const [formData, setFormData] = useState({
    year: 1990,
    month: 1,
    day: 1,
    hour: 12,
    minute: 0,
    latitude: 28.6139,
    longitude: 77.2090
  });
  
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const planetSymbols = {
    'Sun': '☉',
    'Moon': '☽',
    'Mars': '♂',
    'Mercury': '☿',
    'Jupiter': '♃',
    'Venus': '♀',
    'Saturn': '♄',
    'Rahu': '☊',
    'Ketu': '☋'
  };
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: parseFloat(e.target.value)
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:5001/api/natal-chart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate chart');
      }
      
      const data = await response.json();
      setChartData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const renderVisualChart = () => {
    if (!chartData) return null;
    
    // Create a 4x3 grid for visual representation
    const visualGrid = [
      [{ house: 12, row: 0, col: 0 }, { house: 11, row: 0, col: 1 }, { house: 10, row: 0, col: 2 }],
      [{ house: 1, row: 1, col: 2, special: 'ASC' }],
      [{ house: 2, row: 2, col: 2 }, { house: 3, row: 2, col: 1 }, { house: 4, row: 2, col: 0 }],
      [{ house: 5, row: 3, col: 0 }, { house: 6, row: 3, col: 1 }, { house: 7, row: 3, col: 2 }],
      [{ house: 8, row: 4, col: 2 }, { house: 9, row: 4, col: 1 }]
    ];
    
    const getHouseData = (houseNum) => {
      return chartData.houses.find(h => h.house_number === houseNum);
    };
    
    return (
      <div className="visual-chart">
        <div className="chart-title">Rasi Chart (Birth Chart)</div>
        <div className="chart-grid">
          {/* Row 1: Houses 10, 11, 12 */}
          <div className="chart-row">
            <div className="chart-cell top-left">
              <div className="house-num">12</div>
              {getHouseData(12)?.planets.map(p => (
                <span key={p} className="planet-icon" title={p}>{planetSymbols[p]}</span>
              ))}
              <div className="house-lord">{getHouseData(12)?.lord}</div>
            </div>
            <div className="chart-cell top-center">
              <div className="house-num">11</div>
              {getHouseData(11)?.planets.map(p => (
                <span key={p} className="planet-icon" title={p}>{planetSymbols[p]}</span>
              ))}
              <div className="house-lord">{getHouseData(11)?.lord}</div>
            </div>
            <div className="chart-cell top-right">
              <div className="house-num">10</div>
              {getHouseData(10)?.planets.map(p => (
                <span key={p} className="planet-icon" title={p}>{planetSymbols[p]}</span>
              ))}
              <div className="house-lord">{getHouseData(10)?.lord}</div>
            </div>
          </div>
          
          {/* Row 2: House 1 with ASC */}
          <div className="chart-row">
            <div className="chart-cell empty"></div>
            <div className="chart-cell empty"></div>
            <div className="chart-cell asc-cell">
              <div className="house-num">1</div>
              <div className="asc-label">ASC</div>
              {getHouseData(1)?.planets.map(p => (
                <span key={p} className="planet-icon" title={p}>{planetSymbols[p]}</span>
              ))}
              <div className="house-lord">{getHouseData(1)?.lord}</div>
            </div>
          </div>
          
          {/* Row 3: Houses 2, 3, 4 */}
          <div className="chart-row">
            <div className="chart-cell bottom-left">
              <div className="house-num">4</div>
              {getHouseData(4)?.planets.map(p => (
                <span key={p} className="planet-icon" title={p}>{planetSymbols[p]}</span>
              ))}
              <div className="house-lord">{getHouseData(4)?.lord}</div>
            </div>
            <div className="chart-cell bottom-center">
              <div className="house-num">3</div>
              {getHouseData(3)?.planets.map(p => (
                <span key={p} className="planet-icon" title={p}>{planetSymbols[p]}</span>
              ))}
              <div className="house-lord">{getHouseData(3)?.lord}</div>
            </div>
            <div className="chart-cell bottom-right">
              <div className="house-num">2</div>
              {getHouseData(2)?.planets.map(p => (
                <span key={p} className="planet-icon" title={p}>{planetSymbols[p]}</span>
              ))}
              <div className="house-lord">{getHouseData(2)?.lord}</div>
            </div>
          </div>
          
          {/* Row 4: Houses 5, 6, 7 */}
          <div className="chart-row">
            <div className="chart-cell">
              <div className="house-num">5</div>
              {getHouseData(5)?.planets.map(p => (
                <span key={p} className="planet-icon" title={p}>{planetSymbols[p]}</span>
              ))}
              <div className="house-lord">{getHouseData(5)?.lord}</div>
            </div>
            <div className="chart-cell">
              <div className="house-num">6</div>
              {getHouseData(6)?.planets.map(p => (
                <span key={p} className="planet-icon" title={p}>{planetSymbols[p]}</span>
              ))}
              <div className="house-lord">{getHouseData(6)?.lord}</div>
            </div>
            <div className="chart-cell">
              <div className="house-num">7</div>
              {getHouseData(7)?.planets.map(p => (
                <span key={p} className="planet-icon" title={p}>{planetSymbols[p]}</span>
              ))}
              <div className="house-lord">{getHouseData(7)?.lord}</div>
            </div>
          </div>
          
          {/* Row 5: Houses 8, 9 */}
          <div className="chart-row">
            <div className="chart-cell"></div>
            <div className="chart-cell">
              <div className="house-num">9</div>
              {getHouseData(9)?.planets.map(p => (
                <span key={p} className="planet-icon" title={p}>{planetSymbols[p]}</span>
              ))}
              <div className="house-lord">{getHouseData(9)?.lord}</div>
            </div>
            <div className="chart-cell">
              <div className="house-num">8</div>
              {getHouseData(8)?.planets.map(p => (
                <span key={p} className="planet-icon" title={p}>{planetSymbols[p]}</span>
              ))}
              <div className="house-lord">{getHouseData(8)?.lord}</div>
            </div>
          </div>
        </div>
        
        <div className="ascendant-info">
          <strong>Ascendant (Lagna):</strong> {chartData.metadata.ascendant_sign} 
          ({chartData.metadata.ascendant_degrees}°)
        </div>
      </div>
    );
  };
  
  const renderHouseDetails = () => {
    if (!chartData) return null;
    
    return (
      <div className="house-details">
        <h3>House Details</h3>
        <div className="house-grid">
          {chartData.houses.map(house => (
            <div key={house.house_number} className="house-card">
              <h4>House {house.house_number}</h4>
              <p><strong>Lord:</strong> {house.lord}</p>
              <p><strong>Cusp:</strong> {house.cusp_degrees}°</p>
              <p><strong>Planets:</strong> {house.planets.length > 0 ? house.planets.join(', ') : 'None'}</p>
              {house.aspects_from.length > 0 && (
                <p><strong>Aspects From:</strong> {house.aspects_from.map(a => `${a.planet} (H${a.from_house})`).join(', ')}</p>
              )}
              {house.aspects_to.length > 0 && (
                <p><strong>Aspects To:</strong> {house.aspects_to.map(a => `${a.planet} (H${a.to_house})`).join(', ')}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  const renderPlanetPositions = () => {
    if (!chartData) return null;
    
    return (
      <div className="planet-positions">
        <h3>Planetary Positions (Longitude)</h3>
        <div className="planet-grid">
          {Object.entries(chartData.planets).map(([planet, position]) => (
            <div key={planet} className="planet-card">
              <span className="planet-symbol">{planetSymbols[planet] || '?'}</span>
              <span className="planet-name">{planet}:</span>
              <span className="planet-position">{position}°</span>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className="rasi-chart-container">
      <h1>✨ Natal Chart (Rasi) Calculator ✨</h1>
      
      <form onSubmit={handleSubmit} className="birth-form">
        <div className="form-group">
          <label>Birth Date</label>
          <div className="date-row">
            <input
              type="number"
              name="year"
              placeholder="Year"
              value={formData.year}
              onChange={handleChange}
              required
            />
            <input
              type="number"
              name="month"
              placeholder="Month"
              min="1"
              max="12"
              value={formData.month}
              onChange={handleChange}
              required
            />
            <input
              type="number"
              name="day"
              placeholder="Day"
              min="1"
              max="31"
              value={formData.day}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className="form-group">
          <label>Birth Time</label>
          <div className="time-row">
            <input
              type="number"
              name="hour"
              placeholder="Hour (0-23)"
              min="0"
              max="23"
              value={formData.hour}
              onChange={handleChange}
              required
            />
            <span>:</span>
            <input
              type="number"
              name="minute"
              placeholder="Minute"
              min="0"
              max="59"
              value={formData.minute}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className="form-group">
          <label>Location</label>
          <div className="location-row">
            <input
              type="number"
              name="latitude"
              placeholder="Latitude"
              step="any"
              value={formData.latitude}
              onChange={handleChange}
              required
            />
            <input
              type="number"
              name="longitude"
              placeholder="Longitude"
              step="any"
              value={formData.longitude}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? '🔮 Calculating Chart...' : '🌟 Generate Natal Chart'}
        </button>
      </form>
      
      {error && (
        <div className="error-message">
          ⚠️ Error: {error}
        </div>
      )}
      
      {chartData && (
        <div className="chart-output">
          {renderVisualChart()}
          {renderHouseDetails()}
          {renderPlanetPositions()}
          
          <details className="json-output">
            <summary>View JSON Data</summary>
            <pre>{JSON.stringify(chartData, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  );
};

export default RasiChart;
