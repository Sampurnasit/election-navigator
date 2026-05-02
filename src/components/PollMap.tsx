import { useState } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { MapPin, Navigation, Info, Search, ExternalLink } from "lucide-react";
import { trackEvent } from "@/integrations/firebase";
import { cn } from "@/lib/utils";

const containerStyle = {
  width: "100%",
  height: "400px",
  borderRadius: "1.5rem"
};

const center = {
  lat: 40.7128,
  lng: -74.0060
};

// Mock polling stations mapped to "EPIC Numbers"
const POLLING_STATIONS = [
  { id: 1, name: "City Hall Library", lat: 40.7128, lng: -74.0060, epic: "ABC1234567" },
  { id: 2, name: "Community Center North", lat: 40.7308, lng: -73.9973, epic: "XYZ9876543" },
  { id: 3, name: "Westside High School", lat: 40.7018, lng: -74.0160, epic: "VOT0011223" },
];

export const PollMap = () => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""
  });

  const [selected, setSelected] = useState<typeof POLLING_STATIONS[0] | null>(null);
  const [searchEpic, setSearchEpic] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const onMarkerClick = (station: typeof POLLING_STATIONS[0]) => {
    setSelected(station);
    trackEvent("map_marker_click", { station_id: station.id });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    
    trackEvent("map_epic_search", { epic_number: searchEpic });

    setTimeout(() => {
      const found = POLLING_STATIONS.find(s => s.epic === searchEpic.toUpperCase());
      if (found) {
        setSelected(found);
      }
      setIsSearching(false);
    }, 800);
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
      {/* Search Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-2">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <MapPin className="h-5 w-5 text-gold" />
            Station Locator
          </h3>
          <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Official Polling Data Explorer</p>
        </div>

        <form onSubmit={handleSearch} className="flex-1 max-w-md w-full relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-gold transition-colors" />
          <input 
            type="text"
            value={searchEpic}
            onChange={(e) => setSearchEpic(e.target.value)}
            placeholder="Search by EPIC Number (e.g. ABC1234567)"
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-gold focus:bg-white/10 transition-all uppercase"
            aria-label="Search polling station by EPIC number"
          />
          <button 
            type="submit"
            disabled={isSearching}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-gold text-navy text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gold-soft transition-all"
          >
            {isSearching ? "SYNCING..." : "SEARCH"}
          </button>
        </form>

        <button 
          onClick={() => trackEvent("map_navigation_click")}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-colors hidden md:block"
          aria-label="Find my location"
        >
          <Navigation className="h-4 w-4 text-gold" />
        </button>
      </div>

      {/* Map Display */}
      <div className="relative group overflow-hidden rounded-[2.5rem] border border-white/10 shadow-2xl">
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={selected ? { lat: selected.lat, lng: selected.lng } : center}
            zoom={selected ? 15 : 12}
            options={{
              styles: mapDarkStyle,
              disableDefaultUI: true,
            }}
          >
            {POLLING_STATIONS.map((station) => (
              <Marker
                key={station.id}
                position={{ lat: station.lat, lng: station.lng }}
                onClick={() => onMarkerClick(station)}
              />
            ))}
          </GoogleMap>
        ) : (
          <div style={containerStyle} className="bg-white/5 animate-pulse flex items-center justify-center">
            <p className="text-xs text-white/20 uppercase tracking-widest">Initializing Satellite Map...</p>
          </div>
        )}

        {/* Selected Station Card */}
        {selected && (
          <div className="absolute bottom-6 left-6 right-6 md:left-8 md:right-auto md:w-96 bg-[#020617]/90 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 animate-in slide-in-from-bottom-4 shadow-2xl">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[10px] font-bold text-gold uppercase tracking-[0.2em] mb-1">Matched EPIC: {selected.epic}</p>
                <h4 className="text-xl font-display font-bold text-white">{selected.name}</h4>
                <p className="text-xs text-white/40 mt-1">Status: <span className="text-sage font-bold">READY</span></p>
              </div>
              <button 
                onClick={() => setSelected(null)}
                className="p-2 text-white/20 hover:text-white transition-colors"
                aria-label="Close details"
              >
                <Info className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Timings</p>
                  <p className="text-[10px] font-bold text-white/80">07:00 - 18:00</p>
                </div>
                <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Queue</p>
                  <p className="text-[10px] font-bold text-sage">LOW WAIT</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 py-3 bg-gold text-navy text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gold-soft transition-all">
                  Get Directions
                </button>
                <a 
                  href="https://electoralsearch.eci.gov.in/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-3 bg-white/5 text-white/60 hover:text-white border border-white/10 rounded-xl transition-all flex items-center justify-center"
                  aria-label="Verify EPIC on official ECI portal"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Verification Footer */}
      <div className="flex items-center justify-center gap-2 p-4 bg-white/5 rounded-2xl border border-white/5">
        <p className="text-[10px] text-white/40 font-medium">Data not matching? </p>
        <a 
          href="https://electoralsearch.eci.gov.in/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[10px] text-gold font-bold hover:underline flex items-center gap-1"
        >
          Verify EPIC on Official ECI Portal
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
};

const mapDarkStyle = [
  { elementType: "geometry", stylers: [{ color: "#020617" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#020617" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#334155" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#fbd124" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#334155" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#1e293b" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#0f172a" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0f172a" }],
  },
];
