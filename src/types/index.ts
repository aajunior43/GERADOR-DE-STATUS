// Tipos para o StatusAI Creator

export interface StatusRequest {
  theme: string;
  style?: 'modern' | 'elegant' | 'minimalist' | 'vibrant' | 'dark';
  aspectRatio?: '9:16' | '1:1' | '16:9';
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
  fontFamily?: string;
  includeHashtags?: boolean;
  includeComplementaryPhrase?: boolean;
}

export interface GeneratedContent {
  text: string;
  backgroundColor: string;
  textColor: string;
  fontSize: number;
  fontFamily: string;
}

export interface StatusResponse {
  imageUrl: string;
  generatedContent: GeneratedContent;
  metadata: {
    prompt: string;
    style: string;
    timestamp: number;
  };
}

export interface PredefinedCategory {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

export interface StyleOption {
  id: 'modern' | 'elegant' | 'minimalist' | 'vibrant' | 'dark';
  name: string;
  icon: string;
}

export interface CanvasConfig {
  width: number;
  height: number;
  scale: number;
  backgroundColor: string;
  textColor: string;
  fontSize: number;
  fontFamily: string;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface UserPreferences {
  defaultStyle: StyleOption['id'];
  defaultAspectRatio: StatusRequest['aspectRatio'];
  autoGenerate: boolean;
  saveHistory: boolean;
}

export interface GenerationHistory {
  id: string;
  theme: string;
  style: string;
  timestamp: number;
  imageUrl: string;
  text: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
  code?: string;
  details?: any;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ErrorResponse;
  message?: string;
}

// Tipos para configurações de tema
export interface ThemeConfig {
  name: string;
  colors: ThemeColors;
  fonts: {
    primary: string;
    secondary: string;
  };
  spacing: {
    small: number;
    medium: number;
    large: number;
  };
}

// Tipos para analytics e métricas
export interface AnalyticsEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  timestamp: number;
}

// Tipos para configurações de exportação
export interface ExportOptions {
  format: 'png' | 'jpg' | 'webp';
  quality: number;
  width: number;
  height: number;
  includeWatermark: boolean;
}

// Tipos para configurações de IA
export interface AIConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
}