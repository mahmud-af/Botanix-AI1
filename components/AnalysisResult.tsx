import React, { useState, useEffect } from 'react';
import { PlantIdentification, PlantHealthStatus } from '../types';
import { Icons } from './Icons';

interface AnalysisResultProps {
  data: PlantIdentification;
  onReset: () => void;
}

// Helper to determine intensity level (1-3) based on text content
const getIntensityLevel = (text: string): number => {
  const lower = text.toLowerCase();
  if (lower.includes('high') || lower.includes('full') || lower.includes('wet') || lower.includes('frequent')) return 3;
  if (lower.includes('medium') || lower.includes('moderate') || lower.includes('partial')) return 2;
  return 1;
};

const DetailCard = ({ icon: Icon, label, value, delay = 0 }: { icon: any, label: string, value: string, delay?: number }) => {
  const level = getIntensityLevel(value);
  
  return (
    <div 
      className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-white/40 shadow-sm flex flex-col gap-3 hover:bg-white/80 transition-all duration-300 animate-scale-in group hover:shadow-md"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="p-2 bg-stone-100 rounded-lg text-botanical-800 shrink-0 group-hover:bg-botanical-100 group-hover:text-botanical-900 transition-colors duration-300">
          <Icon size={18} />
        </div>
        {/* Visual Meter */}
        <div className="flex gap-1 pt-1.5">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                i <= level ? 'bg-botanical-500 scale-110' : 'bg-stone-200'
              }`} 
            />
          ))}
        </div>
      </div>
      
      <div>
        <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-stone-800 font-medium text-sm leading-snug line-clamp-3">{value}</p>
      </div>
    </div>
  );
};

const Section = ({ title, children, className = "", id }: { title: string, children?: React.ReactNode, className?: string, id?: string }) => (
  <div id={id} className={`scroll-mt-32 bg-white/50 backdrop-blur-md rounded-[2rem] p-6 md:p-8 shadow-sm border border-white/60 transition-all duration-500 hover:shadow-lg hover:bg-white/70 ${className}`}>
    <h3 className="font-serif text-2xl font-semibold text-stone-800 mb-6 flex items-center gap-3">
      <span className="w-1 h-8 bg-botanical-400 rounded-full"></span>
      {title}
    </h3>
    {children}
  </div>
);

export const AnalysisResult: React.FC<AnalysisResultProps> = ({ data, onReset }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'care' | 'morphology' | 'health'>('overview');
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      
      const sections = ['overview', 'care', 'morphology', 'health'];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top >= 0 && rect.top <= 300) {
            setActiveTab(section as any);
            break;
          }
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setActiveTab(id as any);
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  const scrolled = scrollY > 100;

  return (
    <div className="relative w-full min-h-screen pb-20 animate-fade-in">
      
      {/* Sticky Header Navigation */}
      <div 
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
          scrolled 
            ? 'bg-white/80 backdrop-blur-xl shadow-sm py-3 border-b border-stone-200/50' 
            : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <button 
            onClick={onReset}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 active:scale-95 group ${
              scrolled 
                ? 'bg-stone-100 hover:bg-stone-200 text-stone-800' 
                : 'bg-black/20 hover:bg-black/30 text-white backdrop-blur-md border border-white/10'
            }`}
          >
            <Icons.ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="font-medium">Back</span>
          </button>
          
          <div className={`transition-all duration-500 ease-out overflow-hidden ${scrolled ? 'opacity-100 translate-y-0 max-h-10' : 'opacity-0 -translate-y-4 max-h-0'}`}>
            <span className="font-serif font-bold text-stone-800 text-lg truncate max-w-[200px] block">
              {data.commonNames[0]}
            </span>
          </div>

          <div className="flex gap-2">
             <button className={`p-2.5 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 ${scrolled ? 'text-stone-600 hover:bg-stone-100' : 'text-white bg-black/20 hover:bg-black/30 backdrop-blur-md'}`}>
                <Icons.Share2 size={18} />
             </button>
             <button className={`p-2.5 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 ${scrolled ? 'text-stone-600 hover:bg-stone-100' : 'text-white bg-black/20 hover:bg-black/30 backdrop-blur-md'}`}>
                <Icons.Bookmark size={18} />
             </button>
          </div>
        </div>
      </div>

      {/* Immersive Hero Section with Parallax */}
      <div className="relative h-[85vh] w-full overflow-hidden">
        <div 
          className="absolute inset-0 w-full h-full will-change-transform"
          style={{ transform: `translateY(${scrollY * 0.4}px) scale(${1 + scrollY * 0.0002})` }}
        >
          <img 
            src={data.imageUrl} 
            alt={data.scientificName} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-transparent opacity-90"></div>
        </div>
        
        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 max-w-6xl mx-auto z-10"
             style={{ opacity: Math.max(0, 1 - scrollY / 600) }}
        >
          <div className="flex flex-wrap items-center gap-3 mb-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <span className="px-4 py-1.5 bg-botanical-500 text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-lg border border-white/20">
              {data.confidence}% Match
            </span>
            <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md text-stone-100 text-xs font-semibold rounded-full border border-white/20">
              {data.taxonomy.family}
            </span>
          </div>
          
          <h1 className="text-6xl md:text-9xl font-serif font-bold text-white mb-4 shadow-sm animate-slide-up leading-[0.9]" style={{ animationDelay: '200ms' }}>
            {data.commonNames[0]}
          </h1>
          
          <p className="text-xl md:text-3xl text-stone-300 font-light italic font-serif animate-slide-up flex items-center gap-3" style={{ animationDelay: '300ms' }}>
            {data.scientificName}
          </p>
        </div>
      </div>

      {/* Content Container */}
      <div className="max-w-6xl mx-auto px-4 -mt-24 relative z-10">
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Sidebar Navigation (Desktop) */}
          <div className="hidden lg:block lg:col-span-3 relative">
            <div className="sticky top-32 space-y-2">
              {[
                { id: 'overview', icon: Icons.Info, label: 'Overview' },
                { id: 'care', icon: Icons.Sprout, label: 'Care Guide' },
                { id: 'morphology', icon: Icons.BookOpen, label: 'Morphology' },
                { id: 'health', icon: Icons.HeartPulse, label: 'Health' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => scrollToSection(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 text-left
                    ${activeTab === tab.id 
                      ? 'bg-stone-900 text-white shadow-xl translate-x-2' 
                      : 'text-stone-500 hover:bg-white/80 hover:text-stone-800 hover:shadow-sm'}
                  `}
                >
                  <tab.icon size={18} className={activeTab === tab.id ? 'text-botanical-400' : ''} />
                  <span className="font-medium tracking-wide text-sm">{tab.label}</span>
                </button>
              ))}
              
              <div className="mt-8 p-6 bg-gradient-to-br from-botanical-950 to-stone-900 rounded-3xl text-white/90 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-botanical-500/20 rounded-full blur-2xl group-hover:bg-botanical-400/30 transition-colors"></div>
                <Icons.Sparkles size={20} className="text-botanical-300 mb-3" />
                <h4 className="font-serif text-lg mb-2 text-white">Did you know?</h4>
                <p className="text-sm text-stone-300 leading-relaxed font-light">
                   Some plants can "hear" water running through pipes and grow their roots towards the sound.
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* Quick Alerts */}
            <div className="flex flex-wrap gap-4 animate-slide-up" style={{ animationDelay: '400ms' }}>
              {data.safety.isPoisonous && (
                 <div className="flex-1 min-w-[280px] bg-red-50/95 backdrop-blur-sm border border-red-100 p-5 rounded-[20px] flex items-center gap-5 shadow-sm transition-transform hover:scale-[1.02]">
                   <div className="p-3 bg-red-100 text-red-600 rounded-full shadow-inner">
                     <Icons.AlertTriangle size={24} />
                   </div>
                   <div>
                     <h4 className="font-bold text-red-950 text-lg">Toxic Plant</h4>
                     <p className="text-red-800/70 text-sm">Handle with extreme care.</p>
                   </div>
                 </div>
               )}
               {data.safety.isInvasive && (
                 <div className="flex-1 min-w-[280px] bg-amber-50/95 backdrop-blur-sm border border-amber-100 p-5 rounded-[20px] flex items-center gap-5 shadow-sm transition-transform hover:scale-[1.02]">
                   <div className="p-3 bg-amber-100 text-amber-600 rounded-full shadow-inner">
                     <Icons.Globe size={24} />
                   </div>
                   <div>
                     <h4 className="font-bold text-amber-950 text-lg">Invasive Species</h4>
                     <p className="text-amber-800/70 text-sm">Threat to local ecology.</p>
                   </div>
                 </div>
               )}
            </div>

            {/* Overview Section */}
            <Section id="overview" title="Botanical Overview">
              <p className="text-xl text-stone-600 leading-relaxed font-serif first-letter:text-6xl first-letter:font-bold first-letter:text-stone-900 first-letter:mr-3 first-letter:float-left">
                {data.description}
              </p>
              
              <div className="mt-8 grid md:grid-cols-2 gap-4">
                <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100 hover:border-stone-200 transition-colors group">
                  <h4 className="text-stone-400 text-xs font-bold uppercase tracking-wider mb-2">Native Region</h4>
                  <p className="text-stone-800 font-medium text-lg group-hover:text-botanical-800 transition-colors">{data.ecology.nativeRegion}</p>
                </div>
                <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100 hover:border-stone-200 transition-colors group">
                   <h4 className="text-stone-400 text-xs font-bold uppercase tracking-wider mb-2">Taxonomy</h4>
                   <div className="flex items-center gap-2 text-stone-800">
                      <span className="font-medium text-lg group-hover:text-botanical-800 transition-colors">{data.taxonomy.genus}</span>
                      <Icons.ChevronLeft size={14} className="text-stone-400 rotate-180" />
                      <span className="text-lg italic text-stone-500">{data.taxonomy.order}</span>
                   </div>
                </div>
              </div>

              <div className="mt-6 p-6 bg-gradient-to-r from-botanical-50 to-transparent rounded-2xl border border-botanical-100/50 flex gap-5 shadow-sm">
                <Icons.Sparkles className="text-botanical-600 shrink-0 mt-1 animate-pulse-slow" size={24} />
                <div>
                  <h4 className="text-botanical-900 font-bold mb-1 text-lg">AI Identification Insight</h4>
                  <p className="text-botanical-800 text-sm leading-relaxed opacity-80">
                    {data.reasoning}
                  </p>
                </div>
              </div>
            </Section>

            {/* Care Section */}
            <Section id="care" title="Care Requirements">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <DetailCard icon={Icons.Sun} label="Sunlight" value={data.care.light} delay={100} />
                <DetailCard icon={Icons.Droplets} label="Watering" value={data.care.water} delay={150} />
                <DetailCard icon={Icons.Thermometer} label="Temperature" value={data.care.temperature} delay={200} />
                <DetailCard icon={Icons.Wind} label="Humidity" value={data.care.humidity} delay={250} />
                <DetailCard icon={Icons.Leaf} label="Soil Type" value={data.care.soil} delay={300} />
                <DetailCard icon={Icons.Sprout} label="Fertilizer" value={data.care.fertilizer} delay={350} />
              </div>
            </Section>

            {/* Morphology Section */}
            <Section id="morphology" title="Morphology">
              <div className="space-y-4">
                {[
                  { icon: Icons.Leaf, label: "Leaves", text: data.morphology.leaves },
                  { icon: Icons.Sun, label: "Flowers", text: data.morphology.flowers },
                  { icon: Icons.Sprout, label: "Stems", text: data.morphology.stems },
                  { icon: Icons.Droplets, label: "Fruit", text: data.morphology.fruits },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-6 group p-4 rounded-2xl hover:bg-stone-50 transition-colors duration-300">
                    <div className="relative flex flex-col items-center pt-1">
                       <div className="w-12 h-12 rounded-xl bg-white border border-stone-200 text-stone-400 flex items-center justify-center group-hover:bg-stone-900 group-hover:border-stone-900 group-hover:text-white transition-all duration-300 shadow-sm z-10">
                         <item.icon size={22} />
                       </div>
                       {idx !== 3 && <div className="w-px h-full bg-stone-200/50 absolute top-12 left-1/2 -translate-x-1/2 mt-2"></div>}
                    </div>
                    <div className="">
                      <h4 className="font-bold text-stone-800 text-lg mb-1">{item.label}</h4>
                      <p className="text-stone-600 text-sm leading-relaxed">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* Health Section */}
            <Section id="health" title="Health Diagnosis">
              <div className={`rounded-3xl p-1.5 overflow-hidden bg-gradient-to-br shadow-lg transform transition-transform hover:scale-[1.01] ${
                  data.diagnostics.status === PlantHealthStatus.HEALTHY 
                  ? 'from-green-400 via-emerald-500 to-teal-600' 
                  : 'from-amber-400 via-orange-500 to-red-500'
                }`}>
                <div className="bg-white rounded-[20px] p-6 md:p-10">
                  <div className="flex items-center gap-5 mb-8">
                    <div className={`p-4 rounded-2xl shadow-inner ${
                      data.diagnostics.status === PlantHealthStatus.HEALTHY 
                      ? 'bg-green-50 text-green-600 ring-1 ring-green-100' 
                      : 'bg-amber-50 text-amber-600 ring-1 ring-amber-100'
                    }`}>
                      {data.diagnostics.status === PlantHealthStatus.HEALTHY 
                        ? <Icons.Leaf size={32} />
                        : <Icons.AlertTriangle size={32} />
                      }
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase text-stone-400 tracking-widest mb-1">Condition Analysis</p>
                      <h3 className="text-3xl font-serif font-bold text-stone-800">{data.diagnostics.status}</h3>
                    </div>
                  </div>

                  <p className="text-stone-600 mb-8 text-lg leading-relaxed font-light pl-2 border-l-2 border-stone-200">{data.diagnostics.details}</p>

                  {data.diagnostics.treatment && (
                    <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100 shadow-sm">
                       <h4 className="font-bold text-stone-900 mb-3 flex items-center gap-3 text-lg">
                         <Icons.HeartPulse className="text-botanical-600" size={20} />
                         Recommended Treatment
                       </h4>
                       <p className="text-stone-700 leading-relaxed text-sm">{data.diagnostics.treatment}</p>
                    </div>
                  )}
                </div>
              </div>
            </Section>

            {/* Similar Species */}
            {data.similarSpecies.length > 0 && (
              <Section title="Related Species">
                <div className="grid md:grid-cols-2 gap-4">
                  {data.similarSpecies.map((species, idx) => (
                    <div key={idx} className="group p-6 rounded-3xl border border-stone-200 hover:border-botanical-300 hover:bg-stone-50/50 hover:shadow-lg transition-all duration-300 cursor-pointer">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-stone-800 text-lg group-hover:text-botanical-700 transition-colors">{species.name}</h4>
                        <div className="p-2 bg-stone-100 rounded-full group-hover:bg-botanical-100 transition-colors">
                          <Icons.ArrowRight className="text-stone-400 group-hover:text-botanical-600 group-hover:translate-x-0.5 transition-all" size={16} />
                        </div>
                      </div>
                      <p className="text-stone-500 text-sm mt-3 group-hover:text-stone-600 transition-colors leading-relaxed">{species.difference}</p>
                    </div>
                  ))}
                </div>
              </Section>
            )}
            
            <div className="h-32 flex flex-col items-center justify-center gap-4 opacity-60 hover:opacity-100 transition-opacity">
               <div className="w-16 h-px bg-stone-300"></div>
                <span className="text-stone-400 text-xs font-serif italic tracking-wider">Botanix AI Analysis Complete</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};