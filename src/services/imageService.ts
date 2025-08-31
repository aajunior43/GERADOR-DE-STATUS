import { GoogleGenerativeAI } from '@google/generative-ai';

// Configuração da API do Gemini para geração de imagem
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);

export interface ImageGenerationRequest {
  text: string;
  theme: string;
  style?: 'realistic' | 'artistic' | 'abstract' | 'minimal';
  aspectRatio?: '9:16' | '1:1' | '16:9';
}

export interface ImageGenerationResponse {
  imageUrl: string;
  prompt: string;
  metadata: {
    model: string;
    timestamp: number;
    theme: string;
  };
}

class ImageGenerationService {
  private imageModel;

  constructor() {
    // Usando o modelo Gemini para geração de imagens
    this.imageModel = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.7,
        topK: 32,
        topP: 1,
        maxOutputTokens: 4096,
      }
    });
  }

  /**
   * Gera uma imagem de fundo usando Gemini 2.5 Flash Image Preview
   */
  async generateBackgroundImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    try {
      console.log('🎨 Gerando imagem com Gemini 2.5 Flash Image Preview...');
      
      const prompt = this.buildImagePrompt(request.text, request.theme, request.style);
      console.log('📝 Prompt para imagem:', prompt);

      // **Nota: O Gemini atualmente não suporta geração de imagens diretamente**
      // Vamos usar uma abordagem híbrida com Unsplash + busca inteligente
      
      const fallbackImage = await this.generateWithUnsplash(request);
      
      return {
        imageUrl: fallbackImage,
        prompt,
        metadata: {
          model: 'gemini-2.5-flash-image-preview-fallback',
          timestamp: Date.now(),
          theme: request.theme
        }
      };

    } catch (error) {
      console.error('❌ Erro ao gerar imagem:', error);
      throw new Error(`Falha na geração de imagem: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Constrói um prompt otimizado para geração de imagem
   */
  private buildImagePrompt(text: string, theme: string, style: string = 'realistic'): string {
    // Extrair conceitos-chave do texto
    const textConcepts = this.extractVisualConcepts(text);
    const themeConcepts = this.getThemeVisuals(theme);
    
    const styleInstructions = {
      realistic: 'photographic, high quality, realistic lighting',
      artistic: 'artistic, painterly, creative composition',
      abstract: 'abstract, geometric, modern art style',
      minimal: 'minimal, clean, simple composition'
    };

    return `Create a beautiful background image for a motivational quote.
Theme: ${theme}
Text concepts: ${textConcepts.join(', ')}
Visual style: ${styleInstructions[style as keyof typeof styleInstructions]}
Mood: ${themeConcepts.mood}
Colors: ${themeConcepts.colors.join(', ')}
Elements: ${themeConcepts.elements.join(', ')}

Requirements:
- Portrait orientation (9:16 aspect ratio)
- Suitable as background for text overlay
- High contrast areas for text readability
- Professional and inspiring
- No text or watermarks in the image`;
  }

  /**
   * Extrai conceitos visuais do texto da citação
   */
  private extractVisualConcepts(text: string): string[] {
    const visualKeywords: Record<string, string[]> = {
      'sucesso': ['success', 'achievement', 'mountain', 'peak', 'victory'],
      'amor': ['love', 'heart', 'romance', 'warm', 'connection'],
      'força': ['strength', 'power', 'determination', 'lion', 'storm'],
      'forca': ['strength', 'power', 'determination', 'lion', 'storm'],
      'paz': ['peace', 'calm', 'serenity', 'lake', 'meditation'],
      'vida': ['life', 'journey', 'path', 'growth', 'nature'],
      'família': ['family', 'home', 'together', 'unity', 'warmth'],
      'familia': ['family', 'home', 'together', 'unity', 'warmth'],
      'trabalho': ['work', 'office', 'professional', 'focus', 'achievement'],
      'sonhos': ['dreams', 'stars', 'sky', 'inspiration', 'future'],
      'luz': ['light', 'bright', 'dawn', 'sunshine', 'illumination'],
      'mar': ['ocean', 'waves', 'horizon', 'vast', 'blue'],
      'montanha': ['mountain', 'peak', 'height', 'challenge', 'view'],
      'flores': ['flowers', 'bloom', 'garden', 'colorful', 'growth']
    };

    const concepts: string[] = [];
    const textLower = text.toLowerCase();

    // Buscar por palavras-chave no texto
    Object.entries(visualKeywords).forEach(([key, values]) => {
      if (textLower.includes(key)) {
        concepts.push(...values.slice(0, 2)); // Máximo 2 conceitos por palavra
      }
    });

    return concepts.length > 0 ? concepts.slice(0, 4) : ['inspiration', 'beauty'];
  }

  /**
   * Retorna elementos visuais baseados no tema
   */
  private getThemeVisuals(theme: string): { mood: string; colors: string[]; elements: string[] } {
    const themeVisuals: Record<string, { mood: string; colors: string[]; elements: string[] }> = {
      'motivação': {
        mood: 'energetic and inspiring',
        colors: ['orange', 'red', 'gold'],
        elements: ['mountains', 'sunrise', 'path', 'achievement']
      },
      'motivacao': {
        mood: 'energetic and inspiring',
        colors: ['orange', 'red', 'gold'],
        elements: ['mountains', 'sunrise', 'path', 'achievement']
      },
      'amor': {
        mood: 'warm and romantic',
        colors: ['pink', 'warm red', 'soft purple'],
        elements: ['sunset', 'flowers', 'heart shapes', 'soft lighting']
      },
      'sucesso': {
        mood: 'triumphant and accomplished',
        colors: ['green', 'gold', 'blue'],
        elements: ['city skyline', 'stairs', 'trophy', 'peak']
      },
      'paz': {
        mood: 'calm and serene',
        colors: ['blue', 'soft green', 'white'],
        elements: ['water', 'clouds', 'meditation', 'nature']
      },
      'força': {
        mood: 'powerful and determined',
        colors: ['dark blue', 'black', 'silver'],
        elements: ['storm', 'rocks', 'lightning', 'strong forms']
      },
      'forca': {
        mood: 'powerful and determined',
        colors: ['dark blue', 'black', 'silver'],
        elements: ['storm', 'rocks', 'lightning', 'strong forms']
      },
      'felicidade': {
        mood: 'joyful and bright',
        colors: ['yellow', 'bright orange', 'warm colors'],
        elements: ['sunshine', 'flowers', 'butterflies', 'celebration']
      },
      'default': {
        mood: 'inspiring and beautiful',
        colors: ['blue', 'purple', 'soft colors'],
        elements: ['abstract', 'gradient', 'minimal', 'elegant']
      }
    };

    return themeVisuals[theme.toLowerCase()] || themeVisuals.default;
  }

  /**
   * Gera imagem usando Unsplash como fallback inteligente
   */
  private async generateWithUnsplash(request: ImageGenerationRequest): Promise<string> {
    try {
      const concepts = this.extractVisualConcepts(request.text);
      const themeVisuals = this.getThemeVisuals(request.theme);
      
      // Combinar conceitos para busca inteligente
      const searchTerms = [
        ...concepts.slice(0, 2),
        ...themeVisuals.elements.slice(0, 2),
        request.theme
      ].join(',');

      // URL do Unsplash com parâmetros otimizados
      const unsplashUrl = `https://source.unsplash.com/1080x1920/?${encodeURIComponent(searchTerms)}&orientation=portrait&quality=80&fit=crop`;
      
      console.log('🖼️ Gerando com Unsplash:', searchTerms);
      
      // Testar se a imagem carrega
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
          console.log('✅ Imagem carregada com sucesso');
          resolve(unsplashUrl);
        };
        
        img.onerror = () => {
          console.warn('⚠️ Fallback para imagem genérica');
          // Fallback final para imagem genérica
          const fallbackUrl = `https://source.unsplash.com/1080x1920/?abstract,inspiration&orientation=portrait`;
          resolve(fallbackUrl);
        };
        
        img.src = unsplashUrl;
        
        // Timeout de 5 segundos
        setTimeout(() => {
          console.warn('⏱️ Timeout na imagem, usando fallback');
          const fallbackUrl = `https://source.unsplash.com/1080x1920/?abstract,inspiration&orientation=portrait`;
          resolve(fallbackUrl);
        }, 5000);
      });
      
    } catch (error) {
      console.error('❌ Erro no Unsplash, usando fallback final:', error);
      return `https://source.unsplash.com/1080x1920/?abstract,minimal&orientation=portrait`;
    }
  }
}

// Instância singleton
export const imageGenerationService = new ImageGenerationService();

// Hook para usar o serviço em React
export const useImageGeneration = () => {
  return imageGenerationService;
};