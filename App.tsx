import React, { useState, useEffect } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { AnalysisResult } from './components/AnalysisResult';
import { identifyPlant } from './services/geminiService';
import { PlantIdentification } from './types';
import { Icons } from './components/Icons';

const STORAGE_KEY = 'botanix_history_v2';

// Mock data for new features
const DAILY_PLANT = {
  name: "Monstera deliciosa",
  aka: "Swiss Cheese Plant",
  fact: "In its native habitat, Monstera fruit tastes like a combination of strawberry, mango, and pineapple.",
  image: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?q=80&w=1000&auto=format&fit=crop"
};

const SEASONAL_TIPS = [
  "Water less frequently as temperatures drop.",
  "Check indoor plants for pests like spider mites.",
  "Move tropical plants away from cold drafts."
];

const App: React.FC = () => {
  const [history, setHistory] = useState<PlantIdentification[]>([]);
  const [currentScan, setCurrentScan] = useState<PlantIdentification | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'home' | 'history'>('home');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  const saveToHistory = (scan: PlantIdentification) => {
    const updated = [scan, ...history].slice(0, 50);
    setHistory(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleImageSelected = async (base64: string) => {
    setIsAnalyzing(true);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const result = await identifyPlant(base64);
      // Removed artificial delay for speed
      setCurrentScan(result);
      saveToHistory(result);
    } catch (err) {
      setError("Could not identify this specimen. Ensure the image is clear and focused.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setCurrentScan(null);
    setError(null);
    setView('home');
  };

  const LoadingOverlay = () => (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-stone-100/90 backdrop-blur-xl transition-opacity duration-500 ${isAnalyzing ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
       <div className="relative mb-10 scale-100 transition-transform duration-700">
         <div className="absolute inset-0 bg-botanical-400/40 rounded-full blur-2xl animate-pulse"></div>
         <div className="relative bg-white p-8 rounded-full shadow-2xl ring-4 ring-stone-50">
           <Icons.Scan className="text-botanical-600 animate-spin-slow" size={48} />
         </div>
       </div>
       <h3 className="text-3xl font-serif font-bold text-stone-800 animate-pulse tracking-tight">Analyzing Specimen</h3>
       <p className="text-stone-500 mt-3 font-medium tracking-widest uppercase text-xs">Consulting botanical database</p>
    </div>
  );

  if (currentScan) {
    return (
      <>
        {isAnalyzing && <LoadingOverlay />}
        <AnalysisResult data={currentScan} onReset={handleReset} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-800 overflow-x-hidden selection:bg-botanical-200 selection:text-botanical-900">
      
      {isAnalyzing && <LoadingOverlay />}

      {/* Main Navigation */}
      <nav className="fixed top-0 z-30 w-full px-6 py-6 pointer-events-none">
        <div className="max-w-7xl mx-auto flex justify-between items-center pointer-events-auto">
          <div 
            onClick={() => setView('home')}
            className="group flex items-center gap-2 cursor-pointer bg-white/80 backdrop-blur-xl px-5 py-2.5 rounded-full shadow-sm border border-white/50 hover:bg-white hover:shadow-md transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <Icons.Leaf className="text-botanical-600 group-hover:rotate-12 transition-transform duration-300" size={20} />
            <span className="font-serif font-bold text-stone-900 tracking-tight text-lg">Botanix</span>
          </div>
          
          <div className="flex gap-3">
             <button 
               onClick={() => setView('history')}
               className={`flex items-center gap-2 px-5 py-2.5 rounded-full backdrop-blur-xl border transition-all duration-300 shadow-sm hover:shadow-md active:scale-95
                 ${view === 'history' 
                   ? 'bg-botanical-900 text-white border-botanical-900' 
                   : 'bg-white/80 text-stone-600 border-white/50 hover:bg-white'}`}
             >
               <Icons.Grid size={18} />
               <span className="text-sm font-medium hidden sm:inline">My Herbarium</span>
             </button>
          </div>
        </div>
      </nav>

      {/* View: History (Herbarium) */}
      {view === 'history' && (
        <div className="pt-32 px-4 pb-20 max-w-7xl mx-auto min-h-screen animate-fade-in">
          <div className="text-center mb-20">
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-stone-900 mb-6 tracking-tight">Your Collection</h1>
            <p className="text-stone-500 text-lg max-w-xl mx-auto font-light">A curated record of the flora you've discovered.</p>
          </div>

          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-40 text-center border-2 border-dashed border-stone-200 rounded-[3rem] bg-stone-50/50 animate-scale-in">
              <div className="w-20 h-20 bg-white shadow-sm rounded-full flex items-center justify-center text-stone-300 mb-6">
                <Icons.Leaf size={32} />
              </div>
              <h3 className="text-2xl font-serif text-stone-400 mb-3 font-medium">Your herbarium is empty</h3>
              <button 
                onClick={() => setView('home')}
                className="text-botanical-600 font-medium hover:text-botanical-800 hover:underline transition-colors"
              >
                Start scanning plants
              </button>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
              {history.map((plant, idx) => (
                <div 
                  key={plant.id}
                  onClick={() => setCurrentScan(plant)}
                  className="group relative break-inside-avoid cursor-pointer overflow-hidden rounded-3xl bg-stone-200 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-scale-in"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <img 
                    src={plant.imageUrl} 
                    alt={plant.scientificName} 
                    className="w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out">
                    <h3 className="font-serif text-2xl font-bold text-white leading-none mb-2">{plant.commonNames[0]}</h3>
                    <p className="text-stone-300 text-sm italic font-serif mb-4">{plant.scientificName}</p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-white/20">
                      <span className="text-white/80 text-xs font-medium uppercase tracking-wider">{plant.taxonomy.family}</span>
                      <div className="bg-white text-botanical-900 p-2 rounded-full shadow-lg transform translate-x-4 group-hover:translate-x-0 transition-transform duration-500 delay-100">
                        <Icons.ArrowRight size={14} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* View: Home */}
      {view === 'home' && (
        <main className="relative pt-24 min-h-screen flex flex-col overflow-hidden">
          
          {/* Animated Background Elements */}
          <div className="absolute top-0 left-0 right-0 h-[80vh] bg-gradient-to-b from-botanical-50/50 to-transparent pointer-events-none"></div>
          <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-botanical-200/20 rounded-full blur-3xl pointer-events-none mix-blend-multiply animate-pulse-slow"></div>
          <div className="absolute top-[10%] left-[-10%] w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-3xl pointer-events-none mix-blend-multiply animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

          <div className="relative z-10 flex-1 flex flex-col items-center px-4 max-w-5xl mx-auto w-full">
            
            <div className="text-center space-y-8 mb-16 pt-12 md:pt-20 animate-slide-up">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-white/60 backdrop-blur-sm border border-stone-200/60 rounded-full shadow-sm mb-4 transition-transform hover:scale-105 cursor-default">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-botanical-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-botanical-500"></span>
                </span>
                <span className="text-xs font-semibold text-stone-500 uppercase tracking-widest">AI-Powered Identification</span>
              </div>
              
              <h1 className="text-6xl md:text-8xl font-serif font-bold text-stone-900 leading-[1] tracking-tighter">
                Discover nature<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-botanical-800 via-botanical-600 to-botanical-800 bg-[length:200%_auto] animate-[shine_3s_linear_infinite]">
                  leaf by leaf.
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-stone-500 max-w-2xl mx-auto leading-relaxed font-light">
                Instantly identify plants, diagnose health issues, and cultivate your knowledge.
              </p>
            </div>

            {/* Scanner Card */}
            <div className="w-full max-w-2xl animate-slide-up-delayed perspective-1000 mb-20">
              <ImageUploader onImageSelected={handleImageSelected} />
              
              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl flex items-center gap-4 shadow-sm animate-scale-in">
                  <div className="p-2 bg-red-100 rounded-full">
                    <Icons.AlertTriangle size={20} className="shrink-0" />
                  </div>
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}
            </div>

            {/* New Discovery Section */}
            <div className="grid md:grid-cols-2 gap-6 w-full animate-slide-up pb-12" style={{ animationDelay: '300ms' }}>
              
              {/* Daily Plant Card */}
              <div className="bg-stone-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group hover:scale-[1.01] transition-transform duration-500">
                <img src={DAILY_PLANT.image} alt={DAILY_PLANT.name} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                
                <div className="relative z-10 h-full flex flex-col justify-end">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider">Plant of the Day</span>
                  </div>
                  <h3 className="text-3xl font-serif font-bold mb-1">{DAILY_PLANT.name}</h3>
                  <p className="text-stone-300 italic mb-4">{DAILY_PLANT.aka}</p>
                  <p className="text-stone-200 text-sm leading-relaxed border-l-2 border-botanical-500 pl-4">{DAILY_PLANT.fact}</p>
                </div>
              </div>

              {/* Seasonal Tips */}
              <div className="bg-white rounded-[2.5rem] p-8 border border-stone-200 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-500">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-orange-100 text-orange-600 rounded-full">
                      <Icons.CloudSun size={24} />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-xl text-stone-800">Autumn Insights</h4>
                      <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">Seasonal Advice</p>
                    </div>
                  </div>
                  <ul className="space-y-4">
                    {SEASONAL_TIPS.map((tip, i) => (
                      <li key={i} className="flex gap-3 text-stone-600">
                        <Icons.Leaf size={16} className="text-botanical-500 shrink-0 mt-1" />
                        <span className="text-sm font-medium leading-relaxed">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button className="mt-8 w-full py-4 rounded-xl bg-stone-50 text-stone-600 font-medium text-sm hover:bg-stone-100 transition-colors flex items-center justify-center gap-2 group">
                   <Icons.Calendar size={16} />
                   View Monthly Guide
                   <Icons.ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-6 pb-24 w-full animate-slide-up" style={{ animationDelay: '500ms' }}>
               {[
                 { icon: Icons.Maximize2, title: "Instant ID", desc: "Real-time recognition of 20,000+ species." },
                 { icon: Icons.HeartPulse, title: "Plant Doctor", desc: "Diagnose diseases and get treatment plans." },
                 { icon: Icons.BookOpen, title: "Care Guides", desc: "Detailed water, light, and soil requirements." }
               ].map((feature, i) => (
                 <div key={i} className="group p-8 bg-white/60 backdrop-blur-sm rounded-[2.5rem] border border-white/60 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 hover:bg-white">
                   <div className="w-14 h-14 bg-stone-50 rounded-2xl flex items-center justify-center text-stone-900 mb-6 group-hover:bg-botanical-50 group-hover:text-botanical-600 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm">
                     <feature.icon size={28} />
                   </div>
                   <h3 className="font-serif font-bold text-2xl text-stone-900 mb-3">{feature.title}</h3>
                   <p className="text-stone-500 text-base leading-relaxed group-hover:text-stone-600 transition-colors">{feature.desc}</p>
                 </div>
               ))}
            </div>
          </div>
        </main>
      )}
    </div>
  );
};

export default App;