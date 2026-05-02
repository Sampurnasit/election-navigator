import { MapPin, ExternalLink, Search, CheckCircle2 } from "lucide-react";
import { trackEvent } from "@/integrations/firebase";

export const PollMap = () => {
  const handleRedirect = () => {
    trackEvent("eci_portal_redirect");
    window.open("https://electoralsearch.eci.gov.in/", "_blank", "noopener,noreferrer");
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-2">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <MapPin className="h-5 w-5 text-gold" />
            Polling Station Locator
          </h3>
          <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Official ECI Data Integration</p>
        </div>
      </div>

      {/* Main Card */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 shadow-2xl bg-[#020617]/80 backdrop-blur-xl p-8 md:p-12 text-center group">
        <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-transparent opacity-50 transition-opacity group-hover:opacity-100" />
        
        <div className="relative z-10 max-w-2xl mx-auto space-y-8">
          <div className="flex justify-center">
            <div className="p-4 bg-white/5 rounded-full ring-1 ring-white/10 shadow-[0_0_40px_rgba(251,209,36,0.1)]">
              <Search className="h-10 w-10 text-gold" />
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-2xl md:text-3xl font-display font-bold text-white">
              Find Your Polling Station
            </h4>
            <p className="text-white/60 leading-relaxed text-sm md:text-base">
              To ensure you have the most accurate and up-to-date information regarding your polling booth, electoral roll, and voting details, please use the official Election Commission of India (ECI) portal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left max-w-xl mx-auto mt-8 mb-8">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-sage shrink-0" />
              <div>
                <p className="text-xs font-bold text-white/80">Search by Details</p>
                <p className="text-[10px] text-white/40 mt-1">Name, age, district</p>
              </div>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-sage shrink-0" />
              <div>
                <p className="text-xs font-bold text-white/80">Search by EPIC</p>
                <p className="text-[10px] text-white/40 mt-1">Voter ID number</p>
              </div>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-sage shrink-0" />
              <div>
                <p className="text-xs font-bold text-white/80">Search by Mobile</p>
                <p className="text-[10px] text-white/40 mt-1">Registered number</p>
              </div>
            </div>
          </div>

          <button 
            onClick={handleRedirect}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gold text-navy font-black uppercase tracking-widest rounded-2xl hover:bg-gold-soft hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_20px_rgba(251,209,36,0.2)]"
          >
            Visit Official ECI Portal
            <ExternalLink className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-center gap-2 p-4 bg-white/5 rounded-2xl border border-white/5">
        <p className="text-[10px] text-white/40 font-medium text-center">
          You will be redirected to electoralsearch.eci.gov.in securely.
        </p>
      </div>
    </div>
  );
};
