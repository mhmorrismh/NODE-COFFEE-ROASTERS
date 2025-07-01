import React from 'react';
import { Button } from './button';
import { Badge } from './badge';
import { X, MapPin, Coffee, Thermometer, Clock, Star, Award } from 'lucide-react';
import { cn } from '~/lib/utils';

interface CoffeeAnalysis {
  origin?: {
    country?: string;
    region?: string;
    farm?: string;
    altitude?: string;
  };
  processing?: {
    method?: string;
    notes?: string;
  };
  flavorProfile?: {
    notes?: string[];
    acidity?: string;
    body?: string;
    sweetness?: string;
  };
  roastLevel?: string;
  brewingRecommendations?: {
    methods?: string[];
    grindSize?: string;
    waterTemp?: string;
    brewTime?: string;
    ratio?: string;
  };
  varietals?: string[];
  certifications?: string[];
  tasting_notes?: string;
  overall_rating?: number;
}

interface CoffeeProductViewProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: string;
  images: string[];
}



// Helper function to parse the analysis text into structured data
function parseAnalysis(analysisText: string): CoffeeAnalysis {
  const analysis: CoffeeAnalysis = {};
  const text = analysisText.toLowerCase();
  
  // Check if this is a NODE rejection message
  if (analysisText.includes("Please take a picture of a product sold by NODE COFFEE ROASTERS")) {
    return {
      origin: { country: "NODE Coffee Required", region: "Upload NODE Product" },
      roastLevel: "Please upload NODE coffee",
      flavorProfile: { notes: ["Upload NODE Coffee Product"] }
    };
  }


  
  // Extract roast profile scale (1-5) - enhanced with verification format
  const roastScalePatterns = [
    // New verification format patterns
    /after\s*careful\s*examination[,\s]*circle\s*number\s*(\d)/i,
    /circle\s*number\s*(\d)\s*from\s*the\s*left\s*appears\s*darker/i,
    /circle\s*number\s*(\d)\s*from\s*the\s*left\s*appears\s*filled/i,
    
    // Previous step-by-step format patterns
    /circle\s*number\s*(\d)\s*is\s*darker/i,
    /circle\s*number\s*(\d)\s*is\s*filled/i,
    /circle\s*(\d)\s*is\s*darker\/filled/i,
    /circle\s*(\d)\s*is\s*filled\/dark/i,
    /circle\s*(\d)\s*appears\s*darker/i,
    /circle\s*(\d)\s*is\s*the\s*filled/i,
    
    // Position-based patterns
    /(?:position\s*)?(\d)(?:\s*circle)?\s*from\s*(?:the\s*)?left\s*is\s*filled/i,
    /(?:the\s*)?(\d)(?:st|nd|rd|th)?\s*circle\s*from\s*(?:the\s*)?left\s*is\s*filled/i,
    /(?:the\s*)?(\d)(?:st|nd|rd|th)?\s*circle.*(?:filled|darker)/i,
    /(?:the\s*)?(\d)(?:st|nd|rd|th)?\s*position.*filled/i,
    
    // General patterns  
    /position\s*(\d)\s*filled/i,
    /(?:the\s*)?first.*filled.*1[\/\s]*5/i,
    /(?:the\s*)?second.*filled.*2[\/\s]*5/i,
    /(?:the\s*)?third.*filled.*3[\/\s]*5/i,
    /(?:the\s*)?fourth.*filled.*4[\/\s]*5/i,
    /(?:the\s*)?fifth.*filled.*5[\/\s]*5/i,
    
    // Direct number patterns
    /roast profile[:\s]*(\d)[\/\s]*5/i,
    /roast[:\s]*(\d)[\/\s]*5/i,
    /(\d)[\/\s]*5.*roast/i,
    /roast level[:\s]*(\d)[\/\s]*5/i,
    /(\d) out of 5/i,
    /(\d)\/5/i,
    
    // Specific ordinal descriptions
    /first circle (?:filled|darker)/i,
    /second circle (?:filled|darker)/i,
    /third circle (?:filled|darker)/i,
    /fourth circle (?:filled|darker)/i,
    /fifth circle (?:filled|darker)/i,
  ];
  
  let roastLevel = 3; // Default fallback
  let matchedPattern = 'none';
  let matchedText = 'none';
  
  // First try to find descriptive patterns
  for (let i = 0; i < roastScalePatterns.length; i++) {
    const pattern = roastScalePatterns[i];
    const match = analysisText.match(pattern);
    if (match) {
      matchedPattern = `Pattern ${i}: ${pattern.source}`;
      matchedText = match[0];
      
      // Handle numbered captures first
      if (match[1]) {
        const num = parseInt(match[1]);
        if (num >= 1 && num <= 5) {
          roastLevel = num;
          console.log('✅ Found roast level via numbered capture:', num, 'from text:', match[0]);
          break;
        }
      }
      
      // Handle ordinal descriptions
      const patternStr = pattern.source.toLowerCase();
      if (patternStr.includes('first')) {
        roastLevel = 1;
        console.log('✅ Found roast level via ordinal: first = 1');
        break;
      } else if (patternStr.includes('second')) {
        roastLevel = 2;
        console.log('✅ Found roast level via ordinal: second = 2');
        break;
      } else if (patternStr.includes('third')) {
        roastLevel = 3;
        console.log('✅ Found roast level via ordinal: third = 3');
        break;
      } else if (patternStr.includes('fourth')) {
        roastLevel = 4;
        console.log('✅ Found roast level via ordinal: fourth = 4');
        break;
      } else if (patternStr.includes('fifth')) {
        roastLevel = 5;
        console.log('✅ Found roast level via ordinal: fifth = 5');
        break;
      }
    }
  }
  

  
  // Enhanced debug logging
  console.log('🔍 Roast Analysis Debug:', {
    finalRoastLevel: roastLevel,
    matchedPattern: matchedPattern,
    matchedText: matchedText,
    roastProfileSection: analysisText.match(/roast profile:[\s\S]*?(?=tasting|origin|$)/i)?.[0] || 'not found'
  });
  
  const roastLevels = ["", "Light", "Medium-Light", "Medium", "Medium-Dark", "Dark"];
  analysis.roastLevel = `${roastLevels[roastLevel] || 'Medium'} (${roastLevel}/5)`;
  
  // Extract origin with NODE-specific patterns
  const originPatterns = [
    /origin[:\s]*([^.\n,]+)/i,
    /from[:\s]*([^.\n,]+)/i,
    /(?:guatemala|ethiopia|colombia|brazil|kenya|costa rica|jamaica|yemen|honduras|nicaragua|panama|rwanda|salvador|peru|mexico|ecuador|india|indonesia|papua new guinea)/i
  ];
  
  for (const pattern of originPatterns) {
    const match = analysisText.match(pattern);
    if (match) {
      let countryText = match[1] ? match[1].trim() : match[0];
      // Clean up asterisks and formatting
      countryText = countryText.replace(/\*+/g, '').trim();
      analysis.origin = { country: countryText };
      break;
    }
  }
  
  // Extract tasting notes - look for specific format or listed notes
  const tastingNotesPatterns = [
    /tasting notes?[:\s]*([^.\n]+)/i,
    /notes?[:\s]*([^.\n]+)/i,
    /flavou?r profile[:\s]*([^.\n]+)/i,
    /taste[:\s]*([^.\n]+)/i
  ];
  
  const allTastingNotes = new Set<string>();
  for (const pattern of tastingNotesPatterns) {
    const match = analysisText.match(pattern);
    if (match && match[1]) {
      // Split by common delimiters and clean up
      match[1].split(/[,;]/).forEach(note => {
        let cleanNote = note.trim().replace(/^(and|&)\s*/i, '');
        // Remove asterisks and clean up formatting
        cleanNote = cleanNote.replace(/\*+/g, '').trim();
        if (cleanNote.length > 2) {
          allTastingNotes.add(cleanNote);
        }
      });
    }
  }
  
  // Also look for common flavor descriptors
  const flavorWords = analysisText.match(/(?:citrus|chocolate|caramel|fruity|nutty|floral|spicy|sweet|berry|wine|tropical|vanilla|honey|apple|cherry|lemon|orange|cocoa|almond|hazelnut|cinnamon|cardamom)/gi);
  if (flavorWords) {
    flavorWords.forEach(word => allTastingNotes.add(word));
  }
  
  if (allTastingNotes.size > 0) {
    analysis.flavorProfile = { notes: Array.from(allTastingNotes) };
  }
  
  // Extract region/farm with various patterns
  const regionPatterns = [
    /region[:\s]*([^.\n,]+)/i,
    /farm[:\s]*([^.\n,]+)/i,
    /(?:huehuetenango|yirgacheffe|sidamo|kona|blue mountain|antigua|tarrazú|jinotega|matagalpa)/i
  ];
  
  for (const pattern of regionPatterns) {
    const match = analysisText.match(pattern);
    if (match) {
      let regionText = match[1] ? match[1].trim() : match[0];
      // Clean up asterisks and formatting
      regionText = regionText.replace(/\*+/g, '').trim();
      analysis.origin = { ...analysis.origin, region: regionText };
      break;
    }
  }
  
  // Extract processing method
  const processingPatterns = [
    /process(?:ing|ed)?[:\s]*([^.\n,]+)/i,
    /(?:washed|natural|honey|semi-washed|wet-processed|dry-processed|pulped natural)/i
  ];
  
  for (const pattern of processingPatterns) {
    const match = analysisText.match(pattern);
    if (match) {
      analysis.processing = { method: match[1] ? match[1].trim() : match[0] };
      break;
    }
  }
  
  // Extract brewing recommendations
  const brewPatterns = [
    /brew(?:ing)?[:\s]*([^.\n,]+)/i,
    /recommend(?:ed|s)?\s+for[:\s]*([^.\n,]+)/i,
    /(?:pour over|french press|espresso|drip|aeropress|chemex|v60|moka pot)/i
  ];
  
  for (const pattern of brewPatterns) {
    const match = analysisText.match(pattern);
    if (match) {
      const method = match[1] ? match[1].trim() : match[0];
      analysis.brewingRecommendations = { methods: [method] };
      break;
    }
  }
  
  // Extract acidity and body from professional descriptions
  if (text.includes('bright') || text.includes('crisp') || text.includes('vibrant')) {
    analysis.flavorProfile = { ...analysis.flavorProfile, acidity: 'Bright' };
  } else if (text.includes('smooth') || text.includes('mellow') || text.includes('low acid')) {
    analysis.flavorProfile = { ...analysis.flavorProfile, acidity: 'Smooth' };
  } else if (text.includes('balanced')) {
    analysis.flavorProfile = { ...analysis.flavorProfile, acidity: 'Balanced' };
  }
  
  if (text.includes('full body') || text.includes('rich') || text.includes('heavy')) {
    analysis.flavorProfile = { ...analysis.flavorProfile, body: 'Full' };
  } else if (text.includes('light body') || text.includes('delicate')) {
    analysis.flavorProfile = { ...analysis.flavorProfile, body: 'Light' };
  } else if (text.includes('medium body')) {
    analysis.flavorProfile = { ...analysis.flavorProfile, body: 'Medium' };
  }
  
  // Generate a rating based on professional descriptors
  const positiveWords = ['exceptional', 'outstanding', 'premium', 'exquisite', 'remarkable', 'distinctive', 'complex', 'balanced', 'expertly', 'artisanal'];
  let rating = 4.5; // Default rating for NODE products
  positiveWords.forEach(word => {
    if (text.includes(word)) rating += 0.1;
  });
  analysis.overall_rating = Math.min(5.0, rating);
  
  return analysis;
}

export function CoffeeProductView({ isOpen, onClose, analysis, images }: CoffeeProductViewProps) {
  if (!isOpen) return null;

  const parsedAnalysis = parseAnalysis(analysis);
  

  const mainImage = images[0] || '/placeholder-coffee.jpg';

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-50 rounded-3xl w-full h-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-slate-200/80 bg-gradient-to-r from-slate-50 to-white relative">
          {/* NODE Logo on the left */}
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm overflow-hidden bg-white">
            <img 
              src="/NODE logo.png" 
              alt="NODE Coffee Roasters Logo" 
              className="w-12 h-12 object-contain"
            />
          </div>
          
          {/* Centered Title */}
          <div className="flex-1 text-center">
            <h2 className="text-2xl font-bold text-slate-800">NODE COFFEE ROASTERS</h2>
            <p className="text-slate-600 text-sm">Detailed product insights</p>
          </div>
          
          {/* Close Button on the right */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-10 w-10 p-0 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors duration-200"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10 bg-gradient-to-b from-slate-50 to-slate-100/30">
          <div className="max-w-5xl mx-auto">
            {/* Top Section: Image + Key Info */}
            <div className="grid md:grid-cols-2 gap-16 mb-16">
              {/* Product Image */}
              <div className="flex justify-center">
                <div className="w-96 h-96 rounded-3xl overflow-hidden bg-white shadow-xl border border-slate-200/80 hover:shadow-2xl transition-shadow duration-300">
                  {mainImage ? (
                    <img 
                      src={mainImage} 
                      alt="NODE Coffee Package"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100">
                      <Coffee className="w-20 h-20 text-slate-400" />
                    </div>
                  )}
                </div>
              </div>

              {/* Key Information */}
              <div className="space-y-8">
                {/* Roast Profile */}
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-slate-800 rounded-full"></div>
                    Roast Profile
                  </h3>
                  <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <p className="text-3xl font-bold text-slate-800 mb-2">
                      {parsedAnalysis.roastLevel || 'Medium (3/5)'}
                    </p>
                    <div className="flex space-x-1 mt-3">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div 
                          key={level}
                          className={`w-3 h-3 rounded-full ${
                            level <= (parseInt(parsedAnalysis.roastLevel?.match(/(\d)/)?.[1] || '3')) 
                              ? 'bg-slate-800' 
                              : 'bg-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tasting Notes */}
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-slate-800 rounded-full"></div>
                    Tasting Notes
                  </h3>
                  <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow duration-200">
                    {parsedAnalysis.flavorProfile?.notes && parsedAnalysis.flavorProfile.notes.length > 0 ? (
                      <div className="flex flex-wrap gap-3">
                        {parsedAnalysis.flavorProfile.notes.slice(0, 4).map((note, index) => (
                          <span 
                            key={index} 
                            className="px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-full hover:bg-slate-700 transition-colors duration-200"
                          >
                            {note}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-600 text-lg">Premium blend</p>
                    )}
                  </div>
                </div>

                {/* Origin */}
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-slate-800 rounded-full"></div>
                    Origin
                  </h3>
                  <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <p className="text-2xl font-medium text-slate-800 mb-1">
                      {parsedAnalysis.origin?.country || 'Single Origin'}
                    </p>
                    {parsedAnalysis.origin?.region && (
                      <p className="text-slate-600 text-lg">{parsedAnalysis.origin.region}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-12">
              <h3 className="text-xl font-semibold text-slate-800 mb-6">Description</h3>
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                <p className="text-slate-700 leading-relaxed text-lg font-light">
                  {analysis ? analysis.replace(/\*+/g, '').replace(/\s+/g, ' ').trim() : "Experience the exceptional quality and distinctive character of this NODE Coffee Roasters selection. Carefully sourced and expertly roasted to bring out the unique flavor profile that makes each cup a memorable experience."}
                </p>
              </div>
            </div>

            {/* Brewing Tips */}
            <div>
              <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-slate-800 rounded-full"></div>
                Brewing Tips
              </h3>
              <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-sm">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <h4 className="font-semibold text-slate-800 text-lg mb-3">Recommended Method</h4>
                    <p className="text-slate-600 text-lg">
                      {parsedAnalysis.brewingRecommendations?.methods?.[0] || 'Pour Over, French Press'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-semibold text-slate-800 text-lg mb-3">Water Temperature</h4>
                    <p className="text-slate-600 text-lg">
                      {parsedAnalysis.brewingRecommendations?.waterTemp || '195-205°F'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-semibold text-slate-800 text-lg mb-3">Grind Size</h4>
                    <p className="text-slate-600 text-lg">
                      {parsedAnalysis.brewingRecommendations?.grindSize || 'Medium'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-semibold text-slate-800 text-lg mb-3">Coffee Ratio</h4>
                    <p className="text-slate-600 text-lg">
                      {parsedAnalysis.brewingRecommendations?.ratio || '1:15 (coffee:water)'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 