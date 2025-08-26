import { GoogleGenerativeAI } from '@google/generative-ai';
import { retry, sleep } from '@/lib/utils';
import type { StatusRequest, GeneratedContent, StatusResponse, AppError } from '@/types';

// Configuration
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);

// Error codes
const ERROR_CODES = {
  API_KEY_MISSING: 'API_KEY_MISSING',
  INVALID_REQUEST: 'INVALID_REQUEST',
  API_ERROR: 'API_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  RATE_LIMIT: 'RATE_LIMIT',
  CONTENT_FILTER: 'CONTENT_FILTER',
  TIMEOUT: 'TIMEOUT',
} as const;

// Default configurations
const DEFAULT_CONFIG = {
  maxRetries: 3,
  timeout: 30000,
  maxTokens: 1000,
  temperature: 0.7,
} as const;

// Predefined categories with enhanced prompts
const CATEGORY_PROMPTS = {
  motivacao: 'Crie um status motivacional inspirador que incentive ação e determinação',
  amor: 'Crie um status romântico e emocional sobre amor e relacionamentos',
  sucesso: 'Crie um status sobre conquistas, metas e sucesso pessoal',
  foco: 'Crie um status sobre concentração, disciplina e produtividade',
  gratidao: 'Crie um status sobre gratidão, apreciação e positividade',
  paz: 'Crie um status sobre tranquilidade, harmonia e bem-estar',
  forca: 'Crie um status sobre força interior, resiliência e superação',
  esperanca: 'Crie um status sobre otimismo, fé e esperança no futuro',
} as const;

// Style configurations
const STYLE_CONFIGS = {
  modern: {
    description: 'Design limpo e contemporâneo',
    colors: ['#1a1a2e', '#16213e', '#0f3460'],
    fonts: ['Inter', 'Roboto', 'Open Sans'],
  },
  elegant: {
    description: 'Estilo sofisticado e refinado',
    colors: ['#2c3e50', '#34495e', '#7f8c8d'],
    fonts: ['Playfair Display', 'Merriweather', 'Lora'],
  },
  minimalist: {
    description: 'Design simples e essencial',
    colors: ['#ffffff', '#f8f9fa', '#e9ecef'],
    fonts: ['Inter', 'Roboto', 'Helvetica'],
  },
  vibrant: {
    description: 'Cores vivas e energéticas',
    colors: ['#e74c3c', '#f39c12', '#3498db'],
    fonts: ['Poppins', 'Montserrat', 'Raleway'],
  },
  dark: {
    description: 'Tema escuro e misterioso',
    colors: ['#000000', '#1a1a1a', '#2d2d2d'],
    fonts: ['Inter', 'Roboto', 'Arial'],
  },
  gradient: {
    description: 'Gradientes coloridos',
    colors: ['linear-gradient(45deg, #ff6b6b, #4ecdc4)', 'linear-gradient(45deg, #a8edea, #fed6e3)'],
    fonts: ['Inter', 'Roboto', 'Open Sans'],
  },
  neon: {
    description: 'Efeito neon e brilhante',
    colors: ['#00ff00', '#ff00ff', '#00ffff'],
    fonts: ['Orbitron', 'Audiowide', 'Monoton'],
  },
} as const;

class GeminiService {
  private textModel;
  private isInitialized: boolean = false;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    if (!API_KEY) {
      console.error('Gemini API key is missing');
      return;
    }

    try {
      this.textModel = genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash',
        generationConfig: {
          maxOutputTokens: DEFAULT_CONFIG.maxTokens,
          temperature: DEFAULT_CONFIG.temperature,
        },
      });
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Gemini service:', error);
    }
  }

  /**
   * Validates the service initialization
   */
  private validateInitialization(): void {
    if (!this.isInitialized) {
      throw new Error('Gemini service not initialized');
    }
  }

  /**
   * Creates a user-friendly error
   */
  private createError(code: keyof typeof ERROR_CODES, message: string, details?: string): AppError {
    return {
      code: ERROR_CODES[code],
      message,
      details,
      timestamp: Date.now(),
      userFriendly: true,
    };
  }

  /**
   * Handles API errors and converts them to user-friendly messages
   */
  private handleApiError(error: any): AppError {
    console.error('Gemini API Error:', error);

    if (error.message?.includes('API key')) {
      return this.createError('API_KEY_MISSING', 'Chave da API inválida ou ausente');
    }

    if (error.message?.includes('rate limit')) {
      return this.createError('RATE_LIMIT', 'Limite de requisições excedido. Tente novamente em alguns minutos');
    }

    if (error.message?.includes('content filter')) {
      return this.createError('CONTENT_FILTER', 'Conteúdo não permitido. Tente um tema diferente');
    }

    if (error.message?.includes('timeout')) {
      return this.createError('TIMEOUT', 'Tempo limite excedido. Verifique sua conexão');
    }

    if (error.message?.includes('network')) {
      return this.createError('NETWORK_ERROR', 'Erro de conexão. Verifique sua internet');
    }

    return this.createError('API_ERROR', 'Erro interno do serviço. Tente novamente');
  }

  /**
   * Validates the status request
   */
  private validateRequest(request: StatusRequest): void {
    if (!request.theme || request.theme.trim().length === 0) {
      throw new Error('Tema é obrigatório');
    }

    if (request.theme.length > 100) {
      throw new Error('Tema muito longo. Máximo 100 caracteres');
    }

    if (request.style && !Object.keys(STYLE_CONFIGS).includes(request.style)) {
      throw new Error('Estilo inválido');
    }

    if (request.aspectRatio && !['9:16', '1:1', '16:9'].includes(request.aspectRatio)) {
      throw new Error('Proporção inválida');
    }
  }

  /**
   * Builds the prompt for content generation
   */
  private buildPrompt(request: StatusRequest): string {
    const { theme, style = 'modern', includeHashtags = true, includeComplementaryPhrase = true } = request;
    
    const styleConfig = STYLE_CONFIGS[style];
    const categoryPrompt = CATEGORY_PROMPTS[theme.toLowerCase() as keyof typeof CATEGORY_PROMPTS] || 
                          `Crie um status inspirador sobre "${theme}"`;

    let prompt = `Você é um criador de status profissionais para redes sociais especializado em ${styleConfig.description}. `;
    prompt += `${categoryPrompt}\n\n`;
    
    prompt += 'Requisitos:\n';
    prompt += '1. O status deve ser inspirador e visualmente atrativo\n';
    prompt += '2. Use emojis apropriados para enriquecer o conteúdo\n';
    prompt += '3. Formate o texto com quebras de linha adequadas para melhor legibilidade\n';
    prompt += '4. Mantenha o texto conciso e impactante (máximo 3-4 linhas)\n';
    prompt += '5. Inclua uma mensagem positiva ou motivacional\n';
    prompt += '6. Use linguagem natural e acessível\n';
    prompt += '7. Evite clichês excessivos\n';

    if (includeHashtags) {
      prompt += '8. Inclua 2-3 hashtags relevantes no final\n';
    }

    if (includeComplementaryPhrase) {
      prompt += '9. Adicione uma frase complementar inspiradora\n';
    }

    prompt += '\nExemplo de formato:\n';
    prompt += '"Acredite no seu potencial e siga em frente.\n';
    prompt += 'Cada passo é uma vitória.\n\n';
    prompt += '🚀 #Motivação #Sucesso"\n\n';

    prompt += 'Além disso, inclua no final:\n';
    prompt += '- Uma linha com "background: #HEX" (cor de fundo)\n';
    prompt += '- Uma linha com "text: #HEX" (cor do texto)\n';
    prompt += '- Uma linha com "font: NOME_DA_FONTE" (fonte)\n\n';

    prompt += 'Retorne APENAS o conteúdo do status com as configurações, nada além.';

    return prompt;
  }

  /**
   * Extracts colors and font from the AI response
   */
  private extractContentFromResponse(rawText: string): GeneratedContent {
    const lines = rawText.split('\n').filter(line => line.trim());
    
    let text = '';
    let backgroundColor = '#1a1a2e';
    let textColor = '#ffffff';
    let fontFamily = 'Inter';

    for (const line of lines) {
      if (line.startsWith('background:')) {
        backgroundColor = line.replace('background:', '').trim();
      } else if (line.startsWith('text:')) {
        textColor = line.replace('text:', '').trim();
      } else if (line.startsWith('font:')) {
        fontFamily = line.replace('font:', '').trim();
      } else {
        text += line + '\n';
      }
    }

    // Clean up text
    text = text.trim();

    // Validate colors
    if (!backgroundColor.startsWith('#')) {
      backgroundColor = '#1a1a2e';
    }
    if (!textColor.startsWith('#')) {
      textColor = '#ffffff';
    }

    return {
      text,
      backgroundColor,
      textColor,
      fontSize: 20,
      fontFamily,
    };
  }

  /**
   * Generates content using Gemini with retry logic
   */
  private async generateContentWithGemini(request: StatusRequest): Promise<GeneratedContent> {
    const prompt = this.buildPrompt(request);
    
    const generateWithRetry = async () => {
      const startTime = Date.now();
      
      const result = await this.textModel.generateContent(prompt);
      const response = await result.response;
      const rawText = response.text();

      const processingTime = Date.now() - startTime;
      
      if (!rawText || rawText.trim().length === 0) {
        throw new Error('Resposta vazia da API');
      }

      const content = this.extractContentFromResponse(rawText);
      
      // Validate extracted content
      if (!content.text || content.text.trim().length === 0) {
        throw new Error('Falha ao extrair conteúdo da resposta');
      }

      return content;
    };

    return retry(generateWithRetry, DEFAULT_CONFIG.maxRetries, 1000);
  }

  /**
   * Generates a status with enhanced error handling and fallbacks
   */
  async generateStatus(request: StatusRequest): Promise<StatusResponse> {
    try {
      this.validateInitialization();
      this.validateRequest(request);

      const startTime = Date.now();
      
      const generatedContent = await this.generateContentWithGemini(request);
      
      const processingTime = Date.now() - startTime;

      // Create a mock image URL (in a real app, this would be generated)
      const imageUrl = `data:image/svg+xml;base64,${btoa(`
        <svg width="360" height="640" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="${generatedContent.backgroundColor}"/>
          <text x="50%" y="50%" text-anchor="middle" fill="${generatedContent.textColor}" 
                font-family="${generatedContent.fontFamily}" font-size="${generatedContent.fontSize}">
            ${generatedContent.text.replace(/\n/g, '\n            ')}
          </text>
        </svg>
      `)}`;

      return {
        imageUrl,
        generatedContent,
        metadata: {
          prompt: this.buildPrompt(request),
          style: request.style || 'modern',
          timestamp: Date.now(),
          processingTime,
        },
      };

    } catch (error) {
      console.error('Error generating status:', error);
      
      // Return fallback content
      const fallbackContent: GeneratedContent = {
        text: `✨ ${request.theme.toUpperCase()} ✨\n\n"${request.theme.charAt(0).toUpperCase() + request.theme.slice(1)} é a força que transforma sonhos em realidade."\n\nVIVA COM PROPÓSITO! 🚀`,
        backgroundColor: '#1a1a2e',
        textColor: '#f39c12',
        fontSize: 20,
        fontFamily: 'Inter',
      };

      return {
        imageUrl: '',
        generatedContent: fallbackContent,
        metadata: {
          prompt: '',
          style: request.style || 'modern',
          timestamp: Date.now(),
          processingTime: 0,
        },
      };
    }
  }

  /**
   * Gets available styles
   */
  getAvailableStyles() {
    return Object.entries(STYLE_CONFIGS).map(([id, config]) => ({
      id,
      name: config.description,
      description: config.description,
      preview: config.colors[0],
    }));
  }

  /**
   * Gets available categories
   */
  getAvailableCategories() {
    return Object.entries(CATEGORY_PROMPTS).map(([id, prompt]) => ({
      id,
      name: id.charAt(0).toUpperCase() + id.slice(1),
      emoji: this.getCategoryEmoji(id),
      description: prompt,
    }));
  }

  /**
   * Gets emoji for category
   */
  private getCategoryEmoji(category: string): string {
    const emojis: Record<string, string> = {
      motivacao: '💪',
      amor: '❤️',
      sucesso: '🏆',
      foco: '🎯',
      gratidao: '🙏',
      paz: '🕊️',
      forca: '⚡',
      esperanca: '🌟',
    };
    return emojis[category] || '✨';
  }

  /**
   * Health check for the service
   */
  async healthCheck(): Promise<boolean> {
    try {
      this.validateInitialization();
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Singleton instance
let geminiServiceInstance: GeminiService | null = null;

export function useGeminiService(): GeminiService {
  if (!geminiServiceInstance) {
    geminiServiceInstance = new GeminiService();
  }
  return geminiServiceInstance;
}

export default GeminiService;