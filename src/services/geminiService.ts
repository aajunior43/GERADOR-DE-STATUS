import { GoogleGenerativeAI } from '@google/generative-ai';

// Configuração da API do Gemini
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);

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

class GeminiService {
  private textModel;

  constructor() {
    this.textModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  /**
   * Gera conteúdo usando a API do Gemini com base no tema fornecido
   */
  private async generateContentWithGemini(theme: string, includeHashtags: boolean = true, includeComplementaryPhrase: boolean = false): Promise<GeneratedContent> {
    try {
      const requirements = [
        '1. Crie um status inspirador e motivacional baseado no tema',
        '2. Use emojis apropriados para enriquecer o conteúdo',
        '3. Formate o texto com quebras de linha para melhor legibilidade',
        '4. Mantenha o texto conciso (máximo 3-4 linhas)',
        '5. Seja positivo e inspirador',
        '6. NÃO inclua frases complementares ou comentários adicionais',
        '7. NÃO inclua hashtags a menos que solicitado'
      ];

      if (includeHashtags) {
        requirements.push('8. Inclua 2-3 hashtags relevantes no final');
      }

      const prompt = `Você é um criador de status profissionais para redes sociais.

Crie um status inspirador baseado no tema: "${theme}"

Requisitos:
${requirements.join('\n')}

Formato desejado:
"Texto inspirador aqui
com quebras de linha
apropriadas ✨"

${includeHashtags ? 'Exemplo com hashtags:\n"Texto inspirador aqui\ncom quebras de linha\napropriadas ✨\n\n#Motivação #Sucesso"' : ''}

Além disso, inclua no final:
- background: #HEX (cor de fundo apropriada)
- text: #HEX (cor de texto que contraste bem)

Retorne APENAS o conteúdo do status com as linhas de cores.`;

      const result = await this.textModel.generateContent(prompt);
      const response = await result.response;
      const rawText = response.text();

      const { text, backgroundColor, textColor } = this.extractColorsFromText(rawText);

      return {
        text: text || this.generateFallbackContent(theme),
        backgroundColor: backgroundColor || '#1e3a8a',
        textColor: textColor || '#dbeafe',
        fontSize: 18,
        fontFamily: 'Inter'
      };
    } catch (error) {
      console.error('Erro ao gerar conteúdo com Gemini:', error);
      
      return {
        text: this.generateFallbackContent(theme),
        backgroundColor: '#1e3a8a',
        textColor: '#dbeafe',
        fontSize: 18,
        fontFamily: 'Inter'
      };
    }
  }

  /**
   * Função auxiliar para extrair cores da resposta da IA
   */
  private extractColorsFromText(text: string): { text: string; backgroundColor?: string; textColor?: string } {
    // Procurar padrões de cor hexadecimal no texto
    const bgMatch = text.match(/(?:background|fundo):\s*(#[0-9a-fA-F]{6})/i);
    const textMatch = text.match(/(?:text|texto):\s*(#[0-9a-fA-F]{6})/i);

    // Remover linhas com menções a cores do texto final
    const cleanText = text
      .replace(/(?:background|fundo|text|texto):\s*#[0-9a-fA-F]{6}/gi, '')
      .trim();

    return {
      text: cleanText,
      backgroundColor: bgMatch ? bgMatch[1] : undefined,
      textColor: textMatch ? textMatch[1] : undefined
    };
  }

  /**
   * Gera conteúdo de fallback limpo e profissional
   */
  private generateFallbackContent(theme: string): string {
    const fallbackTemplates = [
      `✨ ${theme.charAt(0).toUpperCase() + theme.slice(1)} ✨\n\n"${theme.charAt(0).toUpperCase() + theme.slice(1)} é a chave\npara transformar sonhos\nem realidade."`,
      `🌟 ${theme.charAt(0).toUpperCase() + theme.slice(1)} 🌟\n\n"Em cada ${theme.toLowerCase()}\nreside o poder de\nmudar o mundo."`,
      `💫 ${theme.charAt(0).toUpperCase() + theme.slice(1)} 💫\n\n"${theme.charAt(0).toUpperCase() + theme.slice(1)} não é apenas\numa palavra, é um\nestilo de vida."`
    ];
    
    return fallbackTemplates[Math.floor(Math.random() * fallbackTemplates.length)];
  }

  /**
   * Gera conteúdo automático baseado no tema
   */
  private async generateContentFromTheme(theme: string, includeHashtags?: boolean, includeComplementaryPhrase?: boolean): Promise<GeneratedContent> {
    // Usar a API do Gemini diretamente em vez dos templates predefinidos
    return await this.generateContentWithGemini(theme, includeHashtags, includeComplementaryPhrase);
  }

  /**
   * Gera uma imagem de status usando IA baseado apenas no tema
   */
  async generateStatus(request: StatusRequest): Promise<StatusResponse> {
    try {
      console.log('Gerando status com request:', request);
      
      // Validação básica
      if (!request.theme.trim()) {
        throw new Error('Tema é obrigatório para gerar o status');
      }

      // Gerar conteúdo automático baseado no tema
      const generatedContent = await this.generateContentFromTheme(
        request.theme,
        request.includeHashtags,
        request.includeComplementaryPhrase
      );
      console.log('Conteúdo gerado:', generatedContent);

      // Criar request completo com conteúdo gerado
      const fullRequest = {
        ...request,
        text: generatedContent.text,
        backgroundColor: generatedContent.backgroundColor,
        textColor: generatedContent.textColor,
        fontSize: generatedContent.fontSize,
        fontFamily: generatedContent.fontFamily
      };

      const prompt = `Tema: ${request.theme} - ${generatedContent.text}`;
      console.log('Prompt completo:', prompt);

      // Gerar imagem com Gemini ou placeholder
      const imageUrl = await this.generateImageWithGemini(fullRequest, prompt);
      console.log('URL da imagem:', imageUrl);

      return {
        imageUrl,
        generatedContent,
        metadata: {
          prompt,
          style: request.style || 'modern',
          timestamp: Date.now(),
        },
      };
    } catch (error) {
      console.error('Erro ao gerar status:', error);
      throw new Error(`Falha na geração: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Gera uma imagem usando a API do Gemini ou placeholder como fallback
   */
  private async generateImageWithGemini(request: any, prompt: string): Promise<string> {
    try {
      console.log('Gerando imagem com request:', request);
      console.log('Prompt:', prompt);
      
      // Tentar usar a API do Gemini para geração de imagens
      // Por enquanto, ainda usando placeholder como fallback
      // Mas estruturado para fácil integração futura
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));

      // Encode do texto para URL
      const encodedText = encodeURIComponent(request.text);
      const bgColor = (request.backgroundColor || '#1E1E1E').replace('#', '');
      const textColor = (request.textColor || '#FFFFFF').replace('#', '');

      // Usar um serviço de placeholder mais avançado
      const width = 360;
      const height = 640;
      
      const imageUrl = `https://placehold.co/${width}x${height}/${bgColor}/${textColor}?text=${encodedText}`;
      console.log('URL da imagem gerada:', imageUrl);
      
      return imageUrl;
    } catch (error) {
      console.error('Erro ao gerar imagem com Gemini:', error);
      // Fallback para placeholder básico
      const width = 360;
      const height = 640;
      const bgColor = (request.backgroundColor || '#1E1E1E').replace('#', '');
      const textColor = (request.textColor || '#FFFFFF').replace('#', '');
      const encodedText = encodeURIComponent("Status gerado");
      
      return `https://placehold.co/${width}x${height}/${bgColor}/${textColor}?text=${encodedText}`;
    }
  }

  /**
   * Obtém parâmetros de estilo para o placeholder
   */
  private getStyleParams(style: string) {
    const styles = {
      modern: { font: 'Inter' },
      elegant: { font: 'Playfair' },
      minimalist: { font: 'Helvetica' },
      vibrant: { font: 'Roboto' },
      dark: { font: 'Inter' },
    };

    return styles[style as keyof typeof styles] || styles.modern;
  }

  /**
   * Gera variações de um status
   */
  async generateVariations(baseRequest: StatusRequest, count: number = 3): Promise<StatusResponse[]> {
    const variations = [];
    const styles: Array<StatusRequest['style']> = ['modern', 'elegant', 'minimalist', 'vibrant'];

    for (let i = 0; i < count; i++) {
      const variationRequest = {
        ...baseRequest,
        style: styles[i % styles.length],
      };

      const variation = await this.generateStatus(variationRequest);
      variations.push(variation);
    }

    return variations;
  }

  /**
   * Valida configurações antes de gerar
   */
  validateRequest(request: StatusRequest): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!request.theme || request.theme.trim().length === 0) {
      errors.push('Tema é obrigatório');
    }

    if (request.theme && request.theme.length > 50) {
      errors.push('Tema muito longo (máximo 50 caracteres)');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Obtém histórico de gerações (para implementação futura)
   */
  async getHistory(): Promise<StatusResponse[]> {
    if (typeof window !== 'undefined') {
      const history = localStorage.getItem('statusai_history');
      return history ? JSON.parse(history) : [];
    }
    return [];
  }

  /**
   * Salva no histórico (para implementação futura)
   */
  async saveToHistory(status: StatusResponse): Promise<void> {
    if (typeof window !== 'undefined') {
      const history = await this.getHistory();
      history.unshift(status);
      
      // Manter apenas os últimos 50 itens
      const trimmedHistory = history.slice(0, 50);
      localStorage.setItem('statusai_history', JSON.stringify(trimmedHistory));
    }
  }
}

// Instância singleton
export const geminiService = new GeminiService();

// Hook para usar o serviço em React
export const useGeminiService = () => {
  return geminiService;
};