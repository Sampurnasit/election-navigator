import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Vote, ArrowRight, User, Mail, Phone, Calendar, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/integrations/firebase";

export const Landing = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    age: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate system verification
    setTimeout(() => {
      const params = new URLSearchParams({
        name: formData.name,
        age: formData.age
      });
      trackEvent("landing_registration_complete", { age: formData.age });
      navigate(`/simulator?${params.toString()}`);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(51,65,85,0.15)_0,transparent_100%)]" />
        <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] bg-navy/20 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] bg-gold/5 rounded-full blur-[120px] animate-pulse delay-700" />
        {/* Grid dots */}
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:32px_32px]" />
      </div>

      <div className="relative z-10 w-full max-w-xl animate-in fade-in zoom-in-95 duration-1000">
        {/* Brand/System Header */}
        <div className="flex flex-col items-center mb-12 text-center">
          <div className="h-20 w-20 rounded-[2rem] bg-gradient-hero flex items-center justify-center shadow-[0_0_50px_rgba(30,58,138,0.5)] mb-6 border border-white/10">
            <Vote className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl font-display font-bold tracking-tight mb-2">CIVIC<span className="text-gold">_SIM</span></h1>
          <p className="text-xs font-black uppercase tracking-[0.4em] text-gold/60">Voter Intelligence Network v1.0</p>
        </div>

        {/* Registration Terminal */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
          
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-2">System Registration</h2>
            <p className="text-white/40 text-sm">Please initialize your profile to enter the simulation.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gold/80 ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-gold transition-colors" />
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-gold focus:bg-white/10 transition-all text-sm font-medium"
                    placeholder="Enter full name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gold/80 ml-1">Age</label>
                <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-gold transition-colors" />
                  <input
                    required
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-gold focus:bg-white/10 transition-all text-sm font-medium"
                    placeholder="Years"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gold/80 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-gold transition-colors" />
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-gold focus:bg-white/10 transition-all text-sm font-medium"
                  placeholder="name@agency.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gold/80 ml-1">Phone Protocol</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-gold transition-colors" />
                <input
                  required
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-gold focus:bg-white/10 transition-all text-sm font-medium"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            <button
              disabled={isSubmitting}
              aria-label={isSubmitting ? "Verifying protocols" : "Initialize election simulator"}
              className={cn(
                "w-full py-5 rounded-2xl font-black text-navy transition-all flex items-center justify-center gap-3 mt-8 shadow-xl",
                isSubmitting ? "bg-white/20 cursor-not-allowed" : "bg-gold hover:bg-gold-soft hover:scale-[1.02] active:scale-95"
              )}
            >
              {isSubmitting ? (
                <>
                  <div className="h-5 w-5 border-2 border-navy/30 border-t-navy rounded-full animate-spin" aria-hidden="true" />
                  VERIFYING PROTOCOLS...
                </>
              ) : (
                <>
                  INITIALIZE SIMULATOR
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          {/* Verification Footer */}
          <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between opacity-40">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-sage" />
              <span className="text-[9px] font-bold uppercase tracking-widest">End-to-End Encrypted</span>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-widest">Region: GLOBAL_SECURE</span>
          </div>
        </div>
      </div>

      {/* Background visual detail */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-12 opacity-10 pointer-events-none grayscale">
        <div className="text-[10px] font-black uppercase tracking-[0.5em]">Auth_Node_01</div>
        <div className="text-[10px] font-black uppercase tracking-[0.5em]">Secure_Link_Established</div>
        <div className="text-[10px] font-black uppercase tracking-[0.5em]">Ready_To_Sync</div>
      </div>
    </div>
  );
};
