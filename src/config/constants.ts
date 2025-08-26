// Constantes para o StatusAI Creator

export const APP_CONFIG = {
  name: 'StatusAI Creator',
  version: '1.0.0',
  description: 'Crie status profissionais com IA',
  author: 'StatusAI Team',
  website: 'https://statusai.com.br',
} as const;

export const API_CONFIG = {
  gemini: {
    model: 'gemini-2.0-flash',
    maxTokens: 1000,
    temperature: 0.7,
    topP: 0.9,
  },
  endpoints: {
    generateStatus: '/api/generate-status',
    generateImage: '/api/generate-image',
  },
} as const;

export const CANVAS_CONFIG = {
  default: {
    width: 360,
    height: 640,
    scale: 2,
    backgroundColor: '#1a1a2e',
    textColor: '#ffffff',
    fontSize: 20,
    fontFamily: 'Inter',
  },
  aspectRatios: {
    '9:16': { width: 360, height: 640 },
    '1:1': { width: 500, height: 500 },
    '16:9': { width: 640, height: 360 },
  },
} as const;

export const STYLES = {
  modern: {
    name: 'Moderno',
    icon: '✨',
    colors: {
      primary: '#3b82f6',
      secondary: '#1e40af',
      accent: '#60a5fa',
    },
  },
  elegant: {
    name: 'Elegante',
    icon: '👑',
    colors: {
      primary: '#8b5cf6',
      secondary: '#6d28d9',
      accent: '#a78bfa',
    },
  },
  minimalist: {
    name: 'Minimalista',
    icon: '⚪',
    colors: {
      primary: '#6b7280',
      secondary: '#374151',
      accent: '#9ca3af',
    },
  },
  vibrant: {
    name: 'Vibrante',
    icon: '🎨',
    colors: {
      primary: '#f59e0b',
      secondary: '#d97706',
      accent: '#fbbf24',
    },
  },
  dark: {
    name: 'Escuro',
    icon: '🌙',
    colors: {
      primary: '#1f2937',
      secondary: '#111827',
      accent: '#374151',
    },
  },
} as const;

export const CATEGORIES = [
  {
    id: 'motivacao',
    name: 'Motivação',
    emoji: '💪',
    color: 'from-red-500 to-orange-500',
    keywords: ['motivação', 'inspiração', 'força', 'coragem'],
  },
  {
    id: 'amor',
    name: 'Amor',
    emoji: '❤️',
    color: 'from-pink-500 to-rose-500',
    keywords: ['amor', 'carinho', 'afeto', 'romance'],
  },
  {
    id: 'sucesso',
    name: 'Sucesso',
    emoji: '🏆',
    color: 'from-yellow-500 to-amber-500',
    keywords: ['sucesso', 'vitória', 'conquista', 'realização'],
  },
  {
    id: 'foco',
    name: 'Foco',
    emoji: '🎯',
    color: 'from-blue-500 to-indigo-500',
    keywords: ['foco', 'concentração', 'determinação', 'objetivo'],
  },
  {
    id: 'gratidao',
    name: 'Gratidão',
    emoji: '🙏',
    color: 'from-green-500 to-emerald-500',
    keywords: ['gratidão', 'agradecimento', 'bênção', 'felicidade'],
  },
  {
    id: 'paz',
    name: 'Paz',
    emoji: '🕊️',
    color: 'from-cyan-500 to-blue-500',
    keywords: ['paz', 'tranquilidade', 'serenidade', 'calma'],
  },
  {
    id: 'forca',
    name: 'Força',
    emoji: '⚡',
    color: 'from-purple-500 to-violet-500',
    keywords: ['força', 'poder', 'energia', 'resistência'],
  },
  {
    id: 'esperanca',
    name: 'Esperança',
    emoji: '🌟',
    color: 'from-yellow-400 to-orange-400',
    keywords: ['esperança', 'fé', 'otimismo', 'futuro'],
  },
] as const;

export const FONTS = {
  Inter: 'Inter, system-ui, sans-serif',
  'Playfair Display': 'Playfair Display, serif',
  'Roboto Mono': 'Roboto Mono, monospace',
  'Open Sans': 'Open Sans, sans-serif',
  'Montserrat': 'Montserrat, sans-serif',
} as const;

export const COLORS = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  accent: {
    yellow: '#f59e0b',
    orange: '#f97316',
    red: '#ef4444',
    pink: '#ec4899',
    purple: '#8b5cf6',
    blue: '#3b82f6',
    cyan: '#06b6d4',
    green: '#10b981',
    emerald: '#059669',
    teal: '#14b8a6',
  },
} as const;

export const ANIMATIONS = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easing: {
    ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export const STORAGE_KEYS = {
  history: 'statusai_history',
  preferences: 'statusai_preferences',
  theme: 'statusai_theme',
  language: 'statusai_language',
} as const;

export const ERROR_MESSAGES = {
  GENERATION_FAILED: 'Falha ao gerar o status. Tente novamente.',
  INVALID_THEME: 'Por favor, insira um tema válido.',
  API_ERROR: 'Erro na API. Verifique sua conexão.',
  NETWORK_ERROR: 'Erro de rede. Verifique sua internet.',
  UNKNOWN_ERROR: 'Erro desconhecido. Tente novamente.',
} as const;

export const SUCCESS_MESSAGES = {
  GENERATION_SUCCESS: 'Status gerado com sucesso!',
  DOWNLOAD_SUCCESS: 'Download iniciado!',
  SAVE_SUCCESS: 'Status salvo com sucesso!',
} as const;