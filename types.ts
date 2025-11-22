export enum PlantHealthStatus {
  HEALTHY = "Healthy",
  DISEASED = "Diseased",
  PEST_INFESTED = "Pest Infested",
  NUTRIENT_DEFICIENT = "Nutrient Deficient",
  UNKNOWN = "Unknown"
}

export interface Taxonomy {
  genus: string;
  family: string;
  order: string;
}

export interface Morphology {
  leaves: string;
  flowers: string;
  fruits: string;
  stems: string;
}

export interface CareRequirements {
  light: string;
  water: string;
  soil: string;
  humidity: string;
  temperature: string;
  fertilizer: string;
}

export interface EcologicalInfo {
  nativeRegion: string;
  habitat: string;
  role: string;
}

export interface SafetyProfile {
  isPoisonous: boolean;
  isInvasive: boolean;
  isEndangered: boolean;
  isMedicinal: boolean;
  notes: string;
}

export interface SimilarSpecies {
  name: string;
  difference: string;
}

export interface DiagnosticResult {
  status: PlantHealthStatus;
  details: string;
  treatment: string;
}

export interface PlantIdentification {
  id: string;
  scientificName: string;
  commonNames: string[];
  confidence: number;
  description: string;
  reasoning: string;
  taxonomy: Taxonomy;
  morphology: Morphology;
  care: CareRequirements;
  ecology: EcologicalInfo;
  safety: SafetyProfile;
  diagnostics: DiagnosticResult;
  similarSpecies: SimilarSpecies[];
  timestamp: number;
  imageUrl: string; // Base64 data
}

export interface AppState {
  history: PlantIdentification[];
  currentScan: PlantIdentification | null;
  isAnalyzing: boolean;
  error: string | null;
}
