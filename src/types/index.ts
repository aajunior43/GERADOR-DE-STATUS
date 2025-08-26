// Status generation types
export interface StatusRequest {
  theme: string;
  style?: 'modern' | 'elegant' | 'minimalist' | 'vibrant' | 'dark' | 'gradient' | 'neon';
  aspectRatio?: '9:16' | '1:1' | '16:9';
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
  fontFamily?: string;
  includeHashtags?: boolean;
  includeComplementaryPhrase?: boolean;
  language?: 'pt-BR' | 'en-US' | 'es-ES';
}

export interface GeneratedContent {
  text: string;
  backgroundColor: string;
  textColor: string;
  fontSize: number;
  fontFamily: string;
  hashtags?: string[];
  complementaryPhrase?: string;
}

export interface StatusResponse {
  imageUrl: string;
  generatedContent: GeneratedContent;
  metadata: {
    prompt: string;
    style: string;
    timestamp: number;
    processingTime: number;
  };
}

// UI Component types
export interface Category {
  id: string;
  name: string;
  emoji: string;
  description?: string;
  color?: string;
}

export interface StyleOption {
  id: string;
  name: string;
  description: string;
  preview: string;
}

export interface AspectRatioOption {
  id: string;
  name: string;
  ratio: string;
  description: string;
  icon: string;
}

// Canvas and rendering types
export interface CanvasConfig {
  width: number;
  height: number;
  scale: number;
  backgroundColor: string;
  textColor: string;
  fontSize: number;
  fontFamily: string;
  padding: number;
}

export interface TextConfig {
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  alignment: 'left' | 'center' | 'right';
  maxWidth?: number;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: string;
  timestamp: number;
  userFriendly?: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: AppError;
  message?: string;
  timestamp: number;
}

// User and settings types
export interface UserSettings {
  language: string;
  theme: 'light' | 'dark' | 'auto';
  notifications: boolean;
  autoSave: boolean;
  defaultStyle: string;
  defaultAspectRatio: string;
}

export interface UserPreferences {
  favoriteCategories: string[];
  recentThemes: string[];
  customColors: string[];
  savedTemplates: SavedTemplate[];
}

export interface SavedTemplate {
  id: string;
  name: string;
  theme: string;
  style: string;
  aspectRatio: string;
  backgroundColor: string;
  textColor: string;
  createdAt: Date;
  updatedAt: Date;
}

// Analytics and tracking types
export interface AnalyticsEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  timestamp: number;
  sessionId: string;
  userId?: string;
}

export interface UsageStats {
  totalGenerations: number;
  successfulGenerations: number;
  failedGenerations: number;
  averageProcessingTime: number;
  mostUsedCategories: Array<{
    category: string;
    count: number;
  }>;
  mostUsedStyles: Array<{
    style: string;
    count: number;
  }>;
}

// Notification types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  timestamp: number;
}

// Form types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'color' | 'number' | 'checkbox';
  required?: boolean;
  placeholder?: string;
  options?: Array<{
    value: string;
    label: string;
  }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

// Animation and motion types
export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
  stagger?: number;
}

export interface MotionVariants {
  initial: any;
  animate: any;
  exit: any;
  hover?: any;
  tap?: any;
}

// Theme and styling types
export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  info: string;
}

export interface ThemeConfig {
  name: string;
  colors: ColorPalette;
  fonts: {
    primary: string;
    secondary: string;
    mono: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
}

// Export all types
export type {
  StatusRequest,
  GeneratedContent,
  StatusResponse,
  Category,
  StyleOption,
  AspectRatioOption,
  CanvasConfig,
  TextConfig,
  AppError,
  ValidationError,
  ApiResponse,
  UserSettings,
  UserPreferences,
  SavedTemplate,
  AnalyticsEvent,
  UsageStats,
  Notification,
  FormField,
  AnimationConfig,
  MotionVariants,
  ColorPalette,
  ThemeConfig,
};