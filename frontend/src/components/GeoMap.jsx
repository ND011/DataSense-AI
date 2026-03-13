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

// Name Normalization Map
const countryAliases = {
  "usa": "united states of america",
  "united states": "united states of america",
  "us": "united states of america",
  "uk": "united kingdom",
  "u.k.": "united kingdom",
  "britain": "united kingdom",
  "uae": "united arab emirates",
  "russia": "russian federation",
  "korea": "south korea",
  "s. korea": "south korea",
  "vietnam": "viet nam",
  "czechia": "czech republic",
  "tanzania": "united republic of tanzania",
  "congo": "dem. rep. congo",
  "drc": "dem. rep. congo",
};

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
};

const normalizeName = (name) => {
  if (!name) return "";
  const low = name.toLowerCase().trim();
  return countryAliases[low] || low;
};

const formatValue = (val, metric) => {
  if (val === undefined || val === null) return "N/A";
  if (val >= 1000000000) return (val / 1000000000).toFixed(1) + "B";
  if (val >= 1000000) return (val / 1000000).toFixed(1) + "M";
  if (val >= 1000) return (val / 1000).toFixed(1) + "K";
  return val.toLocaleString();
};

const GeoMap = ({ data, accentColor = "#0284c7", title = "Car Sales Analysis", config = {} }) => {
  const [position, setPosition] = useState({ coordinates: [0, 0], zoom: 1 });
  const [topoData, setTopoData] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState("");
  const [tooltip, setTooltip] = useState({ content: null, x: 0, y: 0 });
  
  // 1. Detect all numeric attributes automatically
  const metrics = useMemo(() => {
    if (!data || data.length === 0) return [];
    const keys = Object.keys(data[0]);
    return keys.filter(key => {
      const val = data[0][key];
      return typeof val === 'number' && key !== 'lat' && key !== 'lon';
    });
  }, [data]);

  // 2. Detect all geographic dimensions (Country, City, State, etc.)
  const geoDimensions = useMemo(() => {
    if (!data || data.length === 0) return [];
    const keys = Object.keys(data[0]);
    const geoKeywords = ['country', 'state', 'province', 'region', 'city', 'district', 'location', 'zip', 'postal', 'town', 'county'];
    return keys.filter(key => {
      const lowerKey = key.toLowerCase();
      return (geoKeywords.some(kw => lowerKey.includes(kw)) || typeof data[0][key] === 'string') && 
             !['lat', 'lon', 'latitude', 'longitude'].includes(lowerKey);
    });
  }, [data]);

  // 2b. Detect Coordinate Columns
  const coordCols = useMemo(() => {
    if (!data || data.length === 0) return { lat: null, lon: null };
    const keys = Object.keys(data[0]);
    return {
      lat: keys.find(k => k.toLowerCase() === 'lat' || k.toLowerCase() === 'latitude'),
      lon: keys.find(k => k.toLowerCase() === 'lon' || k.toLowerCase() === 'longitude')
    };
  }, [data]);

  // Set initial metric
  useEffect(() => {
    if (metrics.length > 0 && !selectedMetric) {
      setSelectedMetric(metrics[0]);
    }
  }, [metrics, selectedMetric]);

  // 3. Fetch TopoJSON
  useEffect(() => {
    fetch(geoUrl)
      .then(res => res.json())
      .then(json => setTopoData(json));
  }, []);

  const handleZoomIn = () => {
    if (position.zoom >= 4) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom * 1.5 }));
  };

  const handleZoomOut = () => {
    if (position.zoom <= 1) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom / 1.5 }));
  };

  const handleReset = () => {
    setPosition({ coordinates: [0, 0], zoom: 1 });
  };

  // 4. Dynamic Scales
  const metricStats = useMemo(() => {
    if (!selectedMetric) return { max: 1 };
    const vals = data.map(d => d[selectedMetric]).filter(v => v !== undefined && v !== null);
    return { max: vals.length > 0 ? Math.max(...vals) : 1 };
  }, [data, selectedMetric]);

  const colorScale = scaleLinear()
    .domain([0, metricStats.max])
    .range(["#f8fafc", accentColor]); 

  const bubbleScale = scaleSqrt()
    .domain([0, metricStats.max])
    .range([0, position.zoom > 2 ? 25 : 18]);

  // Mapping for quick lookup - finds the best geo column for matching
  const dataMapping = useMemo(() => {
    const map = {};
    if (!data) return map;

    // Ordered list of priority columns to use for mapping to world map
    const priorityCols = ['country', 'location', 'nation'];
    const fallbackCols = geoDimensions.filter(col => !priorityCols.includes(col.toLowerCase()));
    const allSearchCols = [...priorityCols, ...fallbackCols];

    data.forEach(d => {
      // Find the first column in d that has a value we can map
      for (const col of allSearchCols) {
        if (d[col]) {
          const loc = normalizeName(d[col]);
          if (loc) {
            map[loc] = d;
            break; // Stop at the highest priority column found for this row
          }
        }
      }
    });
    return map;
  }, [data, geoDimensions]);

  return (
    <div className="relative w-full h-[650px] bg-white rounded-2xl overflow-hidden flex flex-col group/map border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-md">
      {/* Premium Header with Selector */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="flex flex-col">
          <h3 className="text-slate-900 font-black text-xl tracking-tight leading-none mb-1">{title}</h3>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">{selectedMetric?.replace(/_/g, ' ')} Distribution</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group/select">
            <select 
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-sm font-bold py-2.5 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-200 cursor-pointer transition-all hover:bg-slate-100 min-w-[200px]"
            >
              {metrics.map(m => (
                <option key={m} value={m}>{m.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-hover/select:text-slate-600 transition-colors" />
          </div>
        </div>
      </div>

      {/* Zoom Controls Overlay */}
      <div className="absolute top-28 left-6 z-10 flex flex-col gap-2">
        <button onClick={handleZoomIn} title="Zoom In" className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm transition-all text-slate-600 active:scale-95">
          <Plus className="w-4 h-4" />
        </button>
        <button onClick={handleZoomOut} title="Zoom Out" className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm transition-all text-slate-600 active:scale-95">
          <Minus className="w-4 h-4" />
        </button>
        <button onClick={handleReset} title="Reset View" className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm transition-all text-slate-600 active:scale-95">
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Map Implementation */}
      <div className="flex-1 relative flex items-center justify-center bg-slate-50/30 pt-20">
        <ComposableMap
          projectionConfig={{ scale: 190 }}
          width={800}
          height={400}
          style={{ width: "100%", height: "100%" }}
        >
          <ZoomableGroup
            zoom={position.zoom}
            center={position.coordinates}
            onMoveEnd={setPosition}
            maxZoom={8}
            minZoom={1}
          >
            <Geographies geography={topoData || geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const countryName = geo.properties.name.toLowerCase();
                  const d = dataMapping[countryName];
                  const value = d ? d[selectedMetric] : null;
                  
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onMouseEnter={(event) => {
                        if (d) {
                          setTooltip({
                            content: d,
                            x: event.clientX,
                            y: event.clientY,
                            name: geo.properties.name
                          });
                        }
                      }}
                      onMouseMove={(event) => {
                        if (d) {
                          setTooltip(prev => ({ ...prev, x: event.clientX, y: event.clientY }));
                        }
                      }}
                      onMouseLeave={() => setTooltip({ content: null, x: 0, y: 0 })}
                      style={{
                        default: {
                          fill: value !== null && value !== undefined ? colorScale(value) : "#f8fafc",
                          outline: "none",
                          stroke: "#e2e8f0",
                          strokeWidth: 0.5,
                          transition: "fill 300ms ease"
                        },
                        hover: {
                          fill: accentColor,
                          fillOpacity: 0.8,
                          outline: "none",
                          stroke: "#94a3b8",
                          strokeWidth: 0.8,
                          cursor: d ? "pointer" : "default"
                        }
                      }}
                    />
                  );
                })
              }
            </Geographies>

            {/* Universal Bubble Layer */}
            {data.map((d, i) => {
              let coords = null;
              
              // Case 1: Direct Lat/Lon provided
              if (coordCols.lat && coordCols.lon && d[coordCols.lat] && d[coordCols.lon]) {
                coords = [parseFloat(d[coordCols.lon]), parseFloat(d[coordCols.lat])];
              } 
              // Case 2: Mapping from Country/Region name
              else {
                const locCols = ['country', 'location', 'state', 'city'];
                for (const col of locCols) {
                   if (d[col]) {
                     const norm = normalizeName(d[col]);
                     if (countryCentroids[norm]) {
                       coords = countryCentroids[norm];
                       break;
                     }
                   }
                }
              }

              if (!coords) return null;
              const val = d[selectedMetric];
              if (val === undefined || val === null || val <= 0) return null;

              return (
                <Marker key={`marker-${i}`} coordinates={coords}>
                   <circle
                     r={bubbleScale(val)}
                     fill={accentColor}
                     fillOpacity={0.5}
                     stroke={accentColor}
                     strokeWidth={1}
                     className="transition-all duration-500 cursor-pointer hover:fill-opacity-80"
                     onMouseEnter={(event) => {
                       setTooltip({
                         content: d,
                         x: event.clientX,
                         y: event.clientY,
                         name: d.country || d.location || d.city || "Location Data"
                       });
                     }}
                     onMouseMove={(event) => {
                       setTooltip(prev => ({ ...prev, x: event.clientX, y: event.clientY }));
                     }}
                     onMouseLeave={() => setTooltip({ content: null, x: 0, y: 0 })}
                   />
                </Marker>
              );
            })}
          </ZoomableGroup>
        </ComposableMap>

        {/* Enhanced Multi-Attribute Tooltip */}
        {tooltip.content && (
          <div 
            className="fixed z-[100] pointer-events-none bg-white border border-slate-200 p-5 rounded-2xl shadow-2xl min-w-[240px] animate-in fade-in zoom-in duration-200"
            style={{ 
              left: tooltip.x + 15, 
              top: tooltip.y + 15,
              transform: "translate(0, 0)"
            }}
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="p-2 bg-slate-50 rounded-lg">
                  <Globe className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 leading-none mb-1 text-base">{tooltip.name}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Global Data Hub</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {/* 1. Geographic Details Section */}
                {geoDimensions.length > 0 && (
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Geographic Details</p>
                    <div className="space-y-1.5">
                      {geoDimensions.map(dim => (
                        <div key={dim} className="flex items-center justify-between px-2 py-1.5 rounded-xl bg-slate-50/50 border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{dim.replace(/_/g, ' ')}</span>
                          <span className="text-xs font-black text-slate-900">{tooltip.content[dim] || 'N/A'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Numeric Metrics Section */}
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Performance Metrics</p>
                  <div className="grid grid-cols-1 gap-1.5">
                    {metrics.map(m => (
                      <div key={m} className={`flex items-center justify-between gap-10 px-3 py-2 rounded-xl border ${m === selectedMetric ? 'bg-slate-900 border-slate-900 shadow-sm' : 'bg-white border-slate-100'}`}>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${m === selectedMetric ? 'text-slate-400' : 'text-slate-500'}`}>
                          {m.replace(/_/g, ' ')}
                        </span>
                        <span className={`text-xs font-black ${m === selectedMetric ? 'text-white' : 'text-slate-900'}`}>
                          {m.toLowerCase().includes('sales') || m.toLowerCase().includes('gdp') ? '$' : ''}{formatValue(tooltip.content[m], m)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Metadata & Dynamic Legend */}
      <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between z-10">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: accentColor }} />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Global Insights Engine</span>
          </div>
          <p className="text-sm font-bold text-slate-800">Interactive {selectedMetric?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Map</p>
        </div>

        {/* Dynamic Color Scale Legend */}
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-1 h-3 w-48 rounded-full overflow-hidden border border-slate-100 bg-slate-50">
            <div className="h-full flex-1" style={{ background: `linear-gradient(to right, #f8fafc, ${accentColor})` }} />
          </div>
          <div className="flex justify-between w-48 px-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Lower</span>
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">Higher {formatValue(metricStats.max, selectedMetric)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeoMap;
