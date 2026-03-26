import React, { useState, useMemo, useEffect } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  Marker
} from "react-simple-maps";
import { scaleLinear, scaleSqrt } from "d3-scale";
import { feature } from "topojson-client";
import { Globe, Info, Plus, Minus, Maximize2, ChevronDown } from "lucide-react";

// World TopoJSON URL
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Enhanced Name Normalization Map (Aggressive mapping for various datasets)
const countryAliases = {
  // Common Aliases
  "usa": "united states of america",
  "united states": "united states of america",
  "us": "united states of america",
  "united kingdom": "united kingdom",
  "uk": "united kingdom",
  "britain": "united kingdom",
  "england": "united kingdom",
  "scotland": "united kingdom",
  "wales": "united kingdom",
  "northern ireland": "united kingdom",
  "uae": "united arab emirates",
  "russia": "russian federation",
  "korea": "south korea",
  "south korea": "south korea",
  "north korea": "dem. rep. korea",
  "vietnam": "viet nam",
  "czechia": "czech republic",
  "tanzania": "united republic of tanzania",
  "congo": "dem. rep. congo",
  "drc": "dem. rep. congo",
  "ivory coast": "côte d'ivoire",
  "burma": "myanmar",
  "syria": "syrian arab republic",
  "holland": "netherlands",
  "netherlands": "netherlands",
  "taiwan": "taiwan",
  "tehran": "iran",
  "iran": "iran",
  "venezuela": "venezuela",
  "laos": "lao pdr",
  
  // Sports/Team Names
  "brasil": "brazil",
  "deutschland": "germany",
  "espana": "spain",
};

// City -> Country mapping (Fallback for "by City" datasets without coordinates)
const cityToCountry = {
  "london": "united kingdom",
  "paris": "france",
  "berlin": "germany",
  "madrid": "spain",
  "rome": "italy",
  "tokyo": "japan",
  "beijing": "china",
  "seoul": "south korea",
  "new york": "united states of america",
  "washington": "united states of america",
  "chicago": "united states of america",
  "los angeles": "united states of america",
  "sf": "united states of america",
  "rio de janeiro": "brazil",
  "sao paulo": "brazil",
  "mexico city": "mexico",
  "toronto": "canada",
  "vancouver": "canada",
  "sydney": "australia",
  "melbourne": "australia",
  "mumbai": "india",
  "delhi": "india",
  "bangalore": "india",
  "dubai": "united arab emirates",
  "moscow": "russian federation",
  "istanbul": "turkey",
  "bangkok": "thailand",
  "singapore": "singapore",
  "hong kong": "china",
  "shanghai": "china",
  "cairo": "egypt",
  "lagos": "nigeria",
  "nairobi": "kenya",
  "johannesburg": "south africa",
};

// Helper to keep track of valid country names from the map
let knownCountryNames = new Set();

// Common Country Centroids for Bubbles (fallback if no lat/lon in data)
const countryCentroids = {
  "india": [78.9629, 20.5937],
  "united states of america": [-95.7129, 37.0902],
  "china": [104.1954, 35.8617],
  "brazil": [-51.9253, -14.235],
  "russia": [105.3188, 61.524],
  "australia": [133.7751, -25.2744],
  "canada": [-106.3468, 56.1304],
  "germany": [10.4515, 51.1657],
  "france": [2.2137, 46.2276],
  "united kingdom": [-3.436, 55.3781],
  "japan": [138.2529, 36.2048],
  "italy": [12.5674, 41.8719],
  "mexico": [-102.5528, 23.6345],
  "indonesia": [113.9213, -0.7893],
  "turkey": [35.2433, 38.9637],
  "south korea": [127.7669, 35.9078],
  "viet nam": [108.2772, 14.0583],
  "thailand": [100.9925, 15.87],
  "singapore": [103.8198, 1.3521],
  "spain": [-3.7492, 40.4637],
  "argentina": [-63.6167, -38.4161],
  "egypt": [30.8025, 26.8206],
  "south africa": [22.9375, -30.5595],
  "nigeria": [8.6753, 9.082],
};

const normalizeName = (name) => {
  if (!name) return "";
  const low = String(name).toLowerCase().trim();
  // 1. Direct Alias Match
  if (countryAliases[low]) return countryAliases[low];
  // 2. City to Country Fallback
  if (cityToCountry[low]) return cityToCountry[low];
  // 3. Known Map Name Check (if already loaded)
  if (knownCountryNames.has(low)) return low;
  
  // 4. Return original
  return low;
};

const formatValue = (val, metric) => {
  if (val === undefined || val === null) return "0";
  const num = parseFloat(val);
  if (isNaN(num)) return val;
  if (num >= 1000000000) return (num / 1000000000).toFixed(1) + "B";
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num % 1 === 0 ? num.toString() : num.toFixed(2);
};

const GeoMap = ({ data, accentColor = "#0284c7", title = "Global Distribution", config = {} }) => {
  const [position, setPosition] = useState({ coordinates: [0, 0], zoom: 1 });
  const [topoData, setTopoData] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState("");
  const [selectedYear, setSelectedYear] = useState(null);
  const [tooltip, setTooltip] = useState({ content: null, x: 0, y: 0 });
  
  // 1. Detect all numeric attributes automatically
  const metrics = useMemo(() => {
    if (!data || data.length === 0) return [];
    const keys = Object.keys(data[0]);
    return keys.filter(key => {
      const val = data[0][key];
      const lowKey = key.toLowerCase();
      const isId = lowKey.includes('id') || lowKey.includes('code') || lowKey.includes('pk') || lowKey.includes('fk');
      return typeof val === 'number' && !['lat', 'lon', 'year', 'date'].includes(lowKey) && !isId;
    });
  }, [data]);

  const timeColumn = useMemo(() => {
    if (!data || data.length === 0) return null;
    const keys = Object.keys(data[0]);
    const priority = ['year', 'time', 'date', 'period'];
    const secondary = ['month', 'quarter', 'day', 'timestamp'];
    
    let found = keys.find(k => priority.some(p => k.toLowerCase() === p));
    if (!found) found = keys.find(k => priority.some(p => k.toLowerCase().includes(p)));
    if (!found) found = keys.find(k => secondary.some(s => k.toLowerCase().includes(s)));
    
    return found;
  }, [data]);

  const years = useMemo(() => {
    if (!timeColumn) return [];
    const uniqueYears = [...new Set(data.map(d => d[timeColumn]))]
      .filter(y => y !== undefined && y !== null && y !== "")
      .sort((a, b) => {
        if (!isNaN(a) && !isNaN(b)) return Number(a) - Number(b);
        return String(a).localeCompare(String(b));
      });
    return uniqueYears;
  }, [data, timeColumn]);

  useEffect(() => {
    if (metrics.length > 0 && !selectedMetric) {
      setSelectedMetric(config.color_axis || metrics[0]);
    }
    if (years.length > 0 && selectedYear === null) {
      setSelectedYear(years[years.length - 1]);
    }
  }, [metrics, years, selectedMetric, selectedYear, config.color_axis]);

  const filteredData = useMemo(() => {
    if (!timeColumn || selectedYear === null) return data;
    return data.filter(d => String(d[timeColumn]) === String(selectedYear));
  }, [data, timeColumn, selectedYear]);

  const geoDimensions = useMemo(() => {
    if (!data || data.length === 0) return [];
    const keys = Object.keys(data[0]);
    return keys.filter(key => {
      const lowerKey = key.toLowerCase();
      return (['country', 'state', 'city', 'location', 'team', 'home', 'nation'].some(kw => lowerKey.includes(kw))) && 
             !['lat', 'lon', 'latitude', 'longitude'].includes(lowerKey);
    });
  }, [data]);

  const coordCols = useMemo(() => {
    if (!data || data.length === 0) return { lat: null, lon: null };
    const keys = Object.keys(data[0]);
    return {
      lat: keys.find(k => k.toLowerCase() === 'lat' || k.toLowerCase() === 'latitude'),
      lon: keys.find(k => k.toLowerCase() === 'lon' || k.toLowerCase() === 'longitude')
    };
  }, [data]);

  const [hasManuallyMoved, setHasManuallyMoved] = useState(false);

  useEffect(() => {
    if (filteredData.length > 0 && !hasManuallyMoved) {
      let lats = [], lons = [];
      filteredData.forEach(d => {
        if (coordCols.lat && d[coordCols.lat]) lats.push(parseFloat(d[coordCols.lat]));
        if (coordCols.lon && d[coordCols.lon]) lons.push(parseFloat(d[coordCols.lon]));
        
        // Check detected geo columns for centroids
        for (const col of geoDimensions) {
          const norm = normalizeName(d[col]);
          if (countryCentroids[norm]) {
            lons.push(countryCentroids[norm][0]);
            lats.push(countryCentroids[norm][1]);
          }
        }
      });
      
      if (lats.length > 0) {
        const avgLat = lats.reduce((a,b) => a+b, 0) / lats.length;
        const avgLon = lons.reduce((a,b) => a+b, 0) / lons.length;
        setPosition(prev => ({ ...prev, coordinates: [avgLon, avgLat], zoom: 1.2 }));
      }
    }
  }, [coordCols, filteredData, hasManuallyMoved, geoDimensions]);

  useEffect(() => {
    fetch(geoUrl)
      .then(res => res.json())
      .then(json => {
        setTopoData(json);
        if (json.objects && json.objects.countries) {
          const countries = feature(json, json.objects.countries).features;
          const names = new Set(countries.map(c => c.properties.name.toLowerCase()));
          knownCountryNames = names;
        }
      });
  }, []);

  // 4. Aggregation Data Mapping (SUMMED for multiple cities in one country)
  const dataMapping = useMemo(() => {
    const map = {};
    if (!filteredData || filteredData.length === 0) return map;
    
    filteredData.forEach(d => {
      let matchedLoc = null;
      for (const col of geoDimensions) {
        if (d[col]) {
          const norm = normalizeName(d[col]);
          if (knownCountryNames.size > 0 ? knownCountryNames.has(norm) : true) {
            matchedLoc = norm;
            break;
          }
        }
      }
      
      if (matchedLoc) {
        const val = parseFloat(d.value || d[selectedMetric] || 0);
        if (!map[matchedLoc]) {
          map[matchedLoc] = { ...d, value: val, name: matchedLoc.toUpperCase() };
        } else {
          map[matchedLoc].value += val;
        }
      }
    });
    return map;
  }, [filteredData, selectedMetric, geoDimensions]);

  const metricStats = useMemo(() => {
    const vals = Object.values(dataMapping).map(d => d.value);
    return { 
      max: vals.length > 0 ? Math.max(...vals) : 1, 
      min: vals.length > 0 ? Math.min(...vals) : 0 
    };
  }, [dataMapping]);

  const colorScale = scaleLinear()
    .domain([metricStats.min, metricStats.max])
    .range(["#f0f9ff", accentColor]); 

  const handleZoomIn = () => { setHasManuallyMoved(true); setPosition(p => ({ ...p, zoom: Math.min(p.zoom * 1.5, 8) })); };
  const handleZoomOut = () => { setHasManuallyMoved(true); setPosition(p => ({ ...p, zoom: Math.max(p.zoom / 1.5, 1) })); };
  const handleReset = () => { setHasManuallyMoved(true); setPosition({ coordinates: [0, 0], zoom: 1 }); };

  return (
    <div className="relative w-full h-[650px] bg-white rounded-2xl overflow-hidden flex flex-col border border-slate-200 shadow-sm">
      <div className="absolute top-0 left-0 right-0 z-20 p-6 flex flex-col md:flex-row items-start md:items-center justify-between bg-white/90 backdrop-blur-md border-b border-slate-100 gap-4">
        <div className="flex flex-col">
          <h3 className="text-slate-900 font-black text-xl tracking-tight mb-1">{title}</h3>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{selectedMetric?.replace(/_/g, ' ')}</span>
            {selectedYear && (
              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-black rounded-lg">YEAR: {selectedYear}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          {timeColumn && years.length > 0 && (
            <div className="relative group/select">
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold py-2.5 pl-4 pr-10 rounded-xl focus:outline-none cursor-pointer transition-all hover:bg-slate-100 min-w-[100px]"
              >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          )}
        </div>
      </div>

      <div className="absolute top-28 left-6 z-10 flex flex-col gap-2">
        <button onClick={handleZoomIn} className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 transition-all"><Plus className="w-4 h-4" /></button>
        <button onClick={handleZoomOut} className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 transition-all"><Minus className="w-4 h-4" /></button>
        <button onClick={handleReset} className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 transition-all"><Maximize2 className="w-4 h-4" /></button>
      </div>

      <div className="flex-1 relative flex items-center justify-center bg-slate-50/30 pt-20">
        <ComposableMap projectionConfig={{ scale: 135 }} width={800} height={400} style={{ width: "100%", height: "100%" }}>
          <ZoomableGroup 
            zoom={position.zoom} 
            center={position.coordinates} 
            onMoveEnd={(pos) => {
              setPosition(pos);
              if (pos.zoom !== 1 || pos.coordinates[0] !== 0) setHasManuallyMoved(true);
            }}
          >
            <Geographies geography={topoData || geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const countryName = geo.properties.name.toLowerCase();
                  const d = dataMapping[countryName];
                  const value = d ? d.value : null;
                  return (
                    <Geography key={geo.rsmKey} geography={geo}
                      onMouseEnter={(event) => d && setTooltip({ content: d, x: event.clientX, y: event.clientY, name: geo.properties.name })}
                      onMouseMove={(event) => d && setTooltip(prev => ({ ...prev, x: event.clientX, y: event.clientY }))}
                      onMouseLeave={() => setTooltip({ content: null, x: 0, y: 0 })}
                      style={{
                        default: { fill: value !== null ? colorScale(value) : "#f1f5f9", outline: "none", stroke: "#cbd5e1", strokeWidth: 0.5 },
                        hover: { fill: accentColor, fillOpacity: 0.8, outline: "none", cursor: d ? "pointer" : "default" }
                      }}
                    />
                  );
                })
              }
            </Geographies>

            {/* Marker Layer (For pinpoint locations or fallbacks) */}
            {filteredData.map((d, i) => {
              let coords = null;
              if (d.lat && d.lon) coords = [parseFloat(d.lon), parseFloat(d.lat)];
              else {
                for (const col of geoDimensions) {
                  const norm = normalizeName(d[col]);
                  if (countryCentroids[norm]) { coords = countryCentroids[norm]; break; }
                }
              }

              if (!coords) return null;
              return (
                <Marker key={`marker-${i}`} coordinates={coords}>
                  <circle r={position.zoom > 2 ? 4 : 2} fill={accentColor} fillOpacity={0.4} className="animate-pulse" />
                  <circle r={position.zoom > 2 ? 2 : 1} fill={accentColor} 
                    onMouseEnter={(event) => setTooltip({ content: d, x: event.clientX, y: event.clientY, name: d.city || d.location || "Data Point" })}
                    onMouseLeave={() => setTooltip({ content: null, x: 0, y: 0 })}
                    className="cursor-pointer"
                  />
                </Marker>
              );
            })}
          </ZoomableGroup>
        </ComposableMap>

        {tooltip.content && (
          <div className="fixed z-[100] pointer-events-none bg-white border border-slate-200 p-5 rounded-2xl shadow-2xl min-w-[240px]"
            style={{ left: tooltip.x + 15, top: tooltip.y + 15 }}>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="p-2 bg-slate-50 rounded-lg"><Globe className="w-5 h-5 text-slate-400" /></div>
                <div>
                  <h4 className="font-black text-slate-900 leading-none mb-1">{tooltip.name}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Global Insights Hub</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900 border border-slate-900">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{selectedMetric?.replace(/_/g, ' ')}</span>
                  <span className="text-xs font-black text-white">{formatValue(tooltip.content.value || tooltip.content[selectedMetric])}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-6 left-6 flex flex-col gap-1.5 z-10 pointer-events-none">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: accentColor }} />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Global Insights Engine</span>
        </div>
        <p className="text-sm font-bold text-slate-800">Dynamic Geography Explorer</p>
      </div>
    </div>
  );
};

export default GeoMap;
