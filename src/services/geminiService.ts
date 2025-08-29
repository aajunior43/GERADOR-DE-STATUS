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
   * Busca frases famosas em português brasileiro usando a API do Gemini com base no tema fornecido pelo usuário
   */
  private async generateContentWithGemini(theme: string, includeHashtags: boolean = true, includeComplementaryPhrase: boolean = true): Promise<GeneratedContent> {
    const maxRetries = 2;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Tentativa ${attempt}/${maxRetries} para o tema: ${theme}`);

        // Prompt otimizado para máxima eficiência e qualidade
        const prompt = `🎯 TEMA: "${theme}"

📋 INSTRUÇÕES:
Analise o tema e gere conteúdo inspiracional seguindo as regras abaixo.

🔍 DETECÇÃO AUTOMÁTICA:
• Palavras-chave bíblicas (fé, oração, Deus, Jesus, salvação, bíblia, versículo, salmo, provérbios, etc.) → VERSÍCULO REAL
• Palavras-chave seculares (motivação, sucesso, amor, vida, trabalho, sonhos, etc.) → CITAÇÃO FAMOSA REAL

✅ REQUISITOS OBRIGATÓRIOS:
• Português brasileiro impecável
• Frase principal: máximo 90 caracteres
• Apenas 1 emoji no final da frase
• Conteúdo 100% real e verificável
• Zero hashtags ou texto promocional

📝 FORMATO EXATO (copie esta estrutura):
"[Frase inspiracional]" [emoji]
[Autor/Referência]

background: #[6 dígitos]
text: #[6 dígitos]

🎨 CORES INTELIGENTES:
• Bíblico: #1a3c6c + #fff8e1 (azul profundo + creme)
• Motivação: #2c3e50 + #ecf0f1 (cinza escuro + claro)
• Amor: #8e1e3d + #ffebf0 (bordô + rosa claro)
• Sucesso: #d4af37 + #1a1a1a (dourado + preto)
• Paz: #3498db + #ffffff (azul + branco)
• Força: #e74c3c + #ffffff (vermelho + branco)
• Sabedoria: #4a235a + #f9e79f (roxo + amarelo claro)

💡 EXEMPLOS PERFEITOS:

Para tema bíblico:
"Tudo posso naquele que me fortalece." ✨
Filipenses 4:13

background: #1a3c6c
text: #fff8e1

Para tema secular:
"A persistência é o caminho do êxito." 🌟
(Charles Chaplin)

background: #2c3e50
text: #ecf0f1

⚠️ CRÍTICO: Retorne SOMENTE o conteúdo no formato especificado. Nenhum texto adicional.`;

        // Chamar a API do Gemini
        const result = await this.textModel.generateContent(prompt);
        const response = await result.response;
        const rawText = response.text();

        console.log(`Resposta bruta do Gemini (tentativa ${attempt}):`, rawText);

        // Validar e melhorar a resposta
        const { text, backgroundColor, textColor } = this.validateAndImproveResponse(rawText, theme);

        // Verificar se a resposta é válida
        if (!text || text.length < 10) {
          throw new Error('Resposta muito curta ou inválida');
        }

        console.log('Resposta processada com sucesso:', { text, backgroundColor, textColor });

        return {
          text: text.trim(),
          backgroundColor,
          textColor,
          fontSize: 20,
          fontFamily: 'Inter'
        };

      } catch (error) {
        console.error(`Erro na tentativa ${attempt}:`, error);
        lastError = error instanceof Error ? error : new Error('Erro desconhecido');

        if (attempt === maxRetries) {
          break; // Sair do loop se foi a última tentativa
        }

        // Aguardar um pouco antes da próxima tentativa
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }

    // Se chegou aqui, todas as tentativas falharam - usar fallback inteligente
    console.error('Todas as tentativas falharam. Usando fallback inteligente.', lastError);

    const colorPalette = this.generateColorPalette(theme);
    const themeWords = theme.toLowerCase();
    let fallbackText;

    // Fallback inteligente baseado no tema
    if (themeWords.includes('fé') || themeWords.includes('fe') ||
      themeWords.includes('deus') || themeWords.includes('jesus') ||
      themeWords.includes('bíbli') || themeWords.includes('bibli') ||
      themeWords.includes('salm') || themeWords.includes('oração') ||
      themeWords.includes('oracao') || themeWords.includes('versí')) {
      fallbackText = '"Tudo posso naquele que me fortalece." ✨\nFilipenses 4:13';
    } else if (themeWords.includes('amor')) {
      fallbackText = '"O amor é a única força capaz de transformar um inimigo em amigo." 💕\n(Martin Luther King Jr.)';
    } else if (themeWords.includes('sucesso') || themeWords.includes('vitória')) {
      fallbackText = '"O sucesso é ir de fracasso em fracasso sem perder o entusiasmo." 🌟\n(Winston Churchill)';
    } else if (themeWords.includes('paz')) {
      fallbackText = '"A paz não pode ser mantida à força; só pode ser alcançada pela compreensão." ☮️\n(Albert Einstein)';
    } else {
      fallbackText = '"A persistência é o caminho do êxito." 🌟\n(Charles Chaplin)';
    }

    return {
      text: fallbackText,
      backgroundColor: colorPalette.backgroundColor,
      textColor: colorPalette.textColor,
      fontSize: 20,
      fontFamily: 'Inter'
    };
  }

  /**
   * Calcula o contraste entre duas cores usando a fórmula de luminância relativa
   */
  private getContrastRatio(bgColor: string, textColor: string): number {
    const getLuminance = (hex: string): number => {
      const r = parseInt(hex.substr(1, 2), 16) / 255;
      const g = parseInt(hex.substr(3, 2), 16) / 255;
      const b = parseInt(hex.substr(5, 2), 16) / 255;

      const a = [r, g, b].map(v => {
        return (v <= 0.03928) ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });

      return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    };

    const bgLuminance = getLuminance(bgColor);
    const textLuminance = getLuminance(textColor);

    const lighter = Math.max(bgLuminance, textLuminance);
    const darker = Math.min(bgLuminance, textLuminance);

    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Gera uma paleta de cores harmoniosa com base em um tema
   */
  private generateColorPalette(theme: string): { backgroundColor: string; textColor: string } {
    // Paletas de cores pré-definidas para temas comuns
    const colorPalettes: Record<string, { backgroundColor: string; textColor: string }> = {
      'motivação': { backgroundColor: '#1a535c', textColor: '#f7fff7' },
      'amor': { backgroundColor: '#8e1e3d', textColor: '#ffebf0' },
      'sucesso': { backgroundColor: '#d4af37', textColor: '#000000' },
      'foco': { backgroundColor: '#2c3e50', textColor: '#ecf0f1' },
      'gratidão': { backgroundColor: '#27ae60', textColor: '#f8f9f9' },
      'paz': { backgroundColor: '#3498db', textColor: '#ffffff' },
      'força': { backgroundColor: '#e74c3c', textColor: '#ffffff' },
      'esperança': { backgroundColor: '#f39c12', textColor: '#2c3e50' },
      'bíblia': { backgroundColor: '#1a3c6c', textColor: '#fff8e1' },
      'biblia': { backgroundColor: '#1a3c6c', textColor: '#fff8e1' },
      'versículo': { backgroundColor: '#4a235a', textColor: '#f9e79f' },
      'versiculo': { backgroundColor: '#4a235a', textColor: '#f9e79f' },
      'capítulo': { backgroundColor: '#5d4037', textColor: '#ffffff' },
      'capitulo': { backgroundColor: '#5d4037', textColor: '#ffffff' },
      'deus': { backgroundColor: '#1a3c6c', textColor: '#fff8e1' },
      'cristo': { backgroundColor: '#8e1e3d', textColor: '#ffebf0' },
      'jesus': { backgroundColor: '#8e1e3d', textColor: '#ffebf0' },
      'fé': { backgroundColor: '#4a235a', textColor: '#f9e79f' },
      'fe': { backgroundColor: '#4a235a', textColor: '#f9e79f' },
      'oração': { backgroundColor: '#1a3c6c', textColor: '#fff8e1' },
      'oracao': { backgroundColor: '#1a3c6c', textColor: '#fff8e1' },
      'salmo': { backgroundColor: '#5d4037', textColor: '#ffffff' },
      'salmos': { backgroundColor: '#5d4037', textColor: '#ffffff' },
      'provérbios': { backgroundColor: '#d4af37', textColor: '#1a1a1a' },
      'proverbios': { backgroundColor: '#d4af37', textColor: '#1a1a1a' },
      'default': { backgroundColor: '#2c3e50', textColor: '#ecf0f1' }
    };

    // Normalizar o tema para encontrar a paleta correspondente
    const normalizedTheme = theme.toLowerCase();

    // Procurar por tema exato
    for (const [key, palette] of Object.entries(colorPalettes)) {
      if (key !== 'default' && normalizedTheme.includes(key)) {
        return palette;
      }
    }

    // Retornar paleta padrão se não encontrar correspondência
    return colorPalettes.default;
  }

  private getContrastingTextColor(backgroundColor: string): string {
    const colorValue = parseInt(backgroundColor.replace('#', ''), 16);
    const r = (colorValue >> 16) & 255;
    const g = (colorValue >> 8) & 255;
    const b = colorValue & 255;
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#000000' : '#FFFFFF';
  }

  /**
   * Busca conteúdo de citações famosas em português brasileiro baseado no tema
   */
  private async generateContentFromTheme(theme: string, includeHashtags?: boolean, includeComplementaryPhrase?: boolean): Promise<GeneratedContent> {
    // Usar a API do Gemini para buscar citações famosas em vez de gerar conteúdo
    return await this.generateContentWithGemini(theme, includeHashtags, includeComplementaryPhrase);
  }

  /**
   * Gera uma imagem de status usando citações famosas em português brasileiro baseado no tema
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

  /**
   * Extrai e valida cores do texto gerado pelo Gemini
   */
  private extractColorsFromText(text: string): { text: string; backgroundColor: string; textColor: string } {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    let extractedText = '';
    let backgroundColor = '';
    let textColor = '';

    const backgroundRegex = /background:\s*(#[0-9a-fA-F]{6})/i;
    const textRegex = /text:\s*(#[0-9a-fA-F]{6})/i;

    lines.forEach(line => {
      const bgMatch = line.match(backgroundRegex);
      const textMatch = line.match(textRegex);

      if (bgMatch) {
        backgroundColor = bgMatch[1].toUpperCase();
      } else if (textMatch) {
        textColor = textMatch[1].toUpperCase();
      } else if (!line.includes('background:') && !line.includes('text:')) {
        extractedText += line + '\n';
      }
    });

    // Validar contraste das cores extraídas
    if (backgroundColor && textColor) {
      const contrast = this.getContrastRatio(backgroundColor, textColor);
      if (contrast < 4.5) {
        console.warn(`Contraste baixo detectado (${contrast.toFixed(2)}). Ajustando cores...`);
        // Se o contraste for baixo, usar cores padrão com bom contraste
        if (backgroundColor.startsWith('#F') || backgroundColor.startsWith('#E') || backgroundColor.startsWith('#D')) {
          textColor = '#1A1A1A'; // Texto escuro para fundos claros
        } else {
          textColor = '#FFFFFF'; // Texto claro para fundos escuros
        }
      }
    }

    return {
      text: extractedText.trim(),
      backgroundColor,
      textColor,
    };
  }

  /**
   * Valida e melhora a resposta do Gemini
   */
  private validateAndImproveResponse(rawResponse: string, theme: string): { text: string; backgroundColor: string; textColor: string } {
    let { text, backgroundColor, textColor } = this.extractColorsFromText(rawResponse);

    // Limpar texto de possíveis artefatos
    text = text
      .replace(/^["']|["']$/g, '') // Remove aspas do início/fim
      .replace(/\s+/g, ' ') // Normaliza espaços
      .trim();

    // Validar comprimento do texto
    if (text.length > 200) {
      console.warn('Texto muito longo, truncando...');
      text = text.substring(0, 197) + '...';
    }

    // Garantir que temos cores válidas
    if (!backgroundColor || !textColor) {
      const fallbackColors = this.generateColorPalette(theme);
      backgroundColor = backgroundColor || fallbackColors.backgroundColor;
      textColor = textColor || fallbackColors.textColor;
    }

    // Validar formato das cores
    const colorRegex = /^#[0-9A-F]{6}$/i;
    if (!colorRegex.test(backgroundColor)) {
      backgroundColor = '#2C3E50';
    }
    if (!colorRegex.test(textColor)) {
      textColor = '#ECF0F1';
    }

    return { text, backgroundColor, textColor };
  }
}

// Instância singleton
export const geminiService = new GeminiService();

// Hook para usar o serviço em React
export const useGeminiService = () => {
  return geminiService;
};