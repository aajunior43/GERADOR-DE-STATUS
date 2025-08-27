import { GoogleGenerativeAI } from '@google/generative-ai';

// Configuração da API do Gemini
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);

export interface StatusRequest {
  theme: string; // Mudança: agora é tema em vez de texto
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
    // Usar o modelo mais recente disponível
    this.textModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  /**
   * Gera conteúdo usando a API do Gemini com base no tema fornecido pelo usuário
   */
  private async generateContentWithGemini(theme: string, includeHashtags: boolean = true, includeComplementaryPhrase: boolean = true): Promise<GeneratedContent> {
    try {
      // Construir requisitos dinamicamente com base nas opções
      let requirements = [
        '1. Crie uma frase impactante e motivacional com no máximo 120 caracteres',
        '2. Use emojis estrategicamente para reforçar a mensagem (máximo 2 emojis)',
        '3. Mantenha a estrutura concisa e direta',
        '4. Foque em emoções positivas e inspiração',
        '5. Evite clichês e frases previsíveis',
        '6. NÃO inclua um título separado - o status deve ser uma mensagem coesa',
        '7. NÃO use hashtags',
        '8. NÃO inclua frases complementares ou comentários além do status principal'
      ];

      // Preparar o prompt para a IA
      let prompt = 'Você é um especialista em criação de status para redes sociais. ';
      prompt += 'Sua tarefa é criar uma única frase impactante com base no seguinte tema: "' + theme + '"\n\n';
      prompt += 'REQUISITOS OBRIGATÓRIOS:\n';
      prompt += requirements.join('\n') + '\n\n';
      prompt += 'ESTRUTURA ESPERADA:\n';
      prompt += '- Frase principal curta e impactante (máximo 120 caracteres)\n';
      prompt += '- 1-2 emojis relevantes\n';
      prompt += '- Quebra de linha\n';
      prompt += '- Linha com "background: #HEX" (cor de fundo apropriada)\n';
      prompt += '- Linha com "text: #HEX" (cor de texto que contraste bem)\n\n';
      prompt += 'EXEMPLOS DE STATUS EFICAZES:\n';
      prompt += '"A persistência transforma sonhos em realidade. 🌟\n\nbackground: #1a535c\ntext: #f7fff7"\n\n';
      prompt += '"Cada desafio é uma oportunidade disfarçada. 💪\n\nbackground: #4a235a\ntext: #f9e79f"\n\n';
      prompt += '"A jornada começa com um único passo. 🚶\n\nbackground: #154360\ntext: #aed6f1"\n\n';
      prompt += 'CRITÉRIOS DE QUALIDADE:\n';
      prompt += '- Clareza e objetividade\n';
      prompt += '- Relevância com o tema\n';
      prompt += '- Impacto emocional\n';
      prompt += '- Originalidade\n\n';
      prompt += 'RETORNE APENAS O STATUS FORMATADO EXATAMENTE COMO NOS EXEMPLOS, NADA ALÉM DISSO.';

      // Chamar a API do Gemini
      const result = await this.textModel.generateContent(prompt);
      const response = await result.response;
      const rawText = response.text();

      // Extrair texto e cores da resposta da IA
      let { text, backgroundColor, textColor } = this.extractColorsFromText(rawText);

      // Se não conseguirmos extrair as cores, usar cores padrão
      if (!backgroundColor || !textColor) {
        backgroundColor = backgroundColor || '#1e3a8a';
        textColor = textColor || '#dbeafe';
      }

      return {
        text: text.trim(),
        backgroundColor,
        textColor,
        fontSize: 18,
        fontFamily: 'Inter'
      };
    } catch (error) {
      console.error('Erro ao gerar conteúdo com Gemini:', error);
      
      // Fallback para conteúdo padrão se a API falhar
      return {
        text: '"' + theme.charAt(0).toUpperCase() + theme.slice(1) + ' é a força que transforma sonhos em realidade."\n\nbackground: #1e3a8a\ntext: #dbeafe',
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
   * Obtém histórico de geracões (para implementação futura)
   */
  async getHistory(): Promise<StatusResponse[]> {
    // Implementar com localStorage ou backend
    const history = localStorage.getItem('statusai_history');
    return history ? JSON.parse(history) : [];
  }

  /**
   * Salva no histórico (para implementação futura)
   */
  async saveToHistory(status: StatusResponse): Promise<void> {
    try {
      const history = await this.getHistory();
      history.unshift(status);
      
      // Manter apenas os últimos 50 itens
      const trimmedHistory = history.slice(0, 50);
      localStorage.setItem('statusai_history', JSON.stringify(trimmedHistory));
    } catch (error) {
      console.error('Erro ao salvar no histórico:', error);
      // Não lançar erro pois isso não deve impedir a geração do status
    }
  }
}

// Instância singleton
export const geminiService = new GeminiService();

// Hook para usar o serviço em React
export const useGeminiService = () => {
  return geminiService;
};