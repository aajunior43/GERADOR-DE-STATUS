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
    try {
      // Preparar o prompt para a IA
      let prompt = 'Você é um especialista em citações famosas, literatura brasileira e mundial, e conhecimento bíblico. ';
      prompt += 'Sua tarefa é ANALISAR e INTERPRETAR o tema fornecido pelo usuário para determinar se é um tema bíblico ou secular, e então encontrar o conteúdo mais apropriado.\n\n';
      prompt += 'TEMA FORNECIDO: "' + theme + '"\n\n';
      prompt += 'ETAPA 1 - ANÁLISE DO TEMA:\n';
      prompt += 'Analise o tema e determine:\n';
      prompt += '- É uma referência bíblica específica? (ex: livro bíblico, capítulo, versículo)\n';
      prompt += '- É um conceito ou tema bíblico geral? (ex: fé, oração, salvação)\n';
      prompt += '- É um tema secular? (ex: motivação, sucesso, amor romântico)\n';
      prompt += '- Que tipo de conteúdo seria mais apropriado para esse tema?\n\n';
      prompt += 'ETAPA 2 - SELEÇÃO DE CONTEÚDO:\n';
      prompt += 'Com base na sua análise, forneça:\n\n';
      prompt += 'SE FOR TEMA BÍBLICO:\n';
      prompt += '- Encontre um versículo bíblico REAL e EXATO em PORTUGUÊS BRASILEIRO\n';
      prompt += '- Se for mencionado livro/capítulo específico, busque versículo apropriado desse local\n';
      prompt += '- Use versão ACF ou NVI em português\n';
      prompt += '- Mantenha fidelidade total ao texto sagrado\n';
      prompt += '- Formato: "Versículo exato" ✨\nReferência (Livro capítulo:versículo)\n\n';
      prompt += 'SE FOR TEMA SECULAR:\n';
      prompt += '- Encontre uma citação famosa REAL em PORTUGUÊS BRASILEIRO\n';
      prompt += '- Priorize autores reconhecidos mundialmente\n';
      prompt += '- Se necessário, use tradução fiel para português\n';
      prompt += '- Formato: "Citação famosa" 🌟\n(Nome do Autor)\n\n';
      
      // Remover a detecção automática - deixar a IA decidir
      const isBiblicalTheme = false; // A IA vai determinar isso
      prompt += 'REQUISITOS GERAIS:\n';
      prompt += '1. Conteúdo deve estar em PORTUGUÊS BRASILEIRO\n';
      prompt += '2. Máximo 150 caracteres para a frase principal\n';
      prompt += '3. Adicionar 1-2 emojis apropriados\n';
      prompt += '4. NÃO inventar citações ou versículos\n';
      prompt += '5. Usar apenas conteúdo real e verificável\n';
      prompt += '6. NÃO usar hashtags\n\n';
      
      prompt += 'ESTRUTURA DE SAÍDA:\n';
      prompt += 'Retorne apenas o conteúdo formatado da seguinte forma:\n';
      prompt += '- Linha 1: Texto da citação/versículo com emojis\n';
      prompt += '- Linha 2: Autor entre parênteses OU referência bíblica\n';
      prompt += '- Linha 3: (vazia)\n';
      prompt += '- Linha 4: background: #XXXXXX\n';
      prompt += '- Linha 5: text: #XXXXXX\n\n';
      prompt += 'DIRETRIZES PARA ESCOLHA DE CORES:\n';
      prompt += '- Escolha cores que transmitam a emoção do tema\n';
      prompt += '- Use paletas harmoniosas e profissionais\n';
      prompt += '- Evite cores muito vibrantes que dificultem a leitura\n';
      prompt += '- O texto deve ter alto contraste com o fundo\n';
      prompt += '- Prefira tons escuros para fundo e claros para texto, ou vice-versa\n';
      prompt += '- Considere o significado psicológico das cores:\n';
      prompt += '  * Azuis: confiança, tranquilidade, profissionalismo\n';
      prompt += '  * Verdes: crescimento, harmonia, equilíbrio\n';
      prompt += '  * Roxos: criatividade, sabedoria, espiritualidade\n';
      prompt += '  * Vermelhos: energia, paixão, força\n';
      prompt += '  * Amarelos: otimismo, criatividade, clareza\n';
      prompt += '  * Laranjas: entusiasmo, sucesso, vitalidade\n';
      prompt += '  * Rosas: amor, compaixão, gentileza\n';
      prompt += '  * Neutras: elegância, sofisticação, versatilidade\n\n';

      
      prompt += 'EXEMPLOS:\n\n';
      prompt += 'Exemplo Bíblico:\n';
      prompt += '"Tudo posso naquele que me fortalece." ✨\nFilipenses 4:13\n\nbackground: #1a3c6c\ntext: #fff8e1\n\n';
      prompt += 'Exemplo Secular:\n';
      prompt += '"A persistência é o caminho do êxito." 🌟\n(Charles Chaplin)\n\nbackground: #1a535c\ntext: #f7fff7\n\n';
      prompt += 'IMPORTANTE:\n';
      prompt += '- Use sua inteligência para interpretar o tema corretamente\n';
      prompt += '- Se houver dúvida sobre ser bíblico ou secular, considere o contexto\n';
      prompt += '- Todas as citações devem estar em PORTUGUÊS BRASILEIRO\n';
      prompt += '- Escolha cores harmoniosas que combinem com o tema\n\n';
      prompt += 'RETORNE APENAS O STATUS FORMATADO, NADA ALÉM DISSO.';

      // Chamar a API do Gemini
      const result = await this.textModel.generateContent(prompt);
      const response = await result.response;
      const rawText = response.text();

      // Extrair texto e cores da resposta da IA
      let { text, backgroundColor, textColor } = this.extractColorsFromText(rawText);

      // Se não conseguirmos extrair as cores, gerar uma paleta baseada no tema
      if (!backgroundColor || !textColor) {
        const colorPalette = this.generateColorPalette(theme);
        backgroundColor = backgroundColor || colorPalette.backgroundColor;
        textColor = textColor || colorPalette.textColor;
      }

      return {
        text: text.trim(),
        backgroundColor,
        textColor,
        fontSize: 20,
        fontFamily: 'Inter'
      };
    } catch (error) {
      console.error('Erro ao gerar conteúdo com Gemini:', error);
      
      // Usar paleta de cores baseada no tema
      const colorPalette = this.generateColorPalette(theme);
      
      // Fallback inteligente baseado no conteúdo do tema
      const themeWords = theme.toLowerCase();
      let fallbackText;
      
      // Usar lógica simples para fallback, mas deixar a IA decidir no caso normal
      if (themeWords.includes('exod') || themeWords.includes('êxod') || 
          themeWords.includes('salm') || themeWords.includes('jesus') || 
          themeWords.includes('deus') || themeWords.includes('bíbli') ||
          themeWords.includes('versí') || themeWords.includes('fé')) {
        fallbackText = '"Porque eu sei os planos que tenho para vocês, diz o Senhor." ✨\nJeremias 29:11';
      } else {
        fallbackText = '"A vida é o que acontece enquanto você está ocupado fazendo outros planos." 🌟\n(John Lennon)';
      }
      
      return {
        text: fallbackText,
        backgroundColor: colorPalette.backgroundColor,
        textColor: colorPalette.textColor,
        fontSize: 20,
        fontFamily: 'Inter'
      };
    }
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

  private extractColorsFromText(text: string): { text: string; backgroundColor: string; textColor: string } {
    const lines = text.split('\n');
    let extractedText = '';
    let backgroundColor = '';
    let textColor = '';

    const backgroundRegex = /background:\s*(#[0-9a-fA-F]{6})/;
    const textRegex = /text:\s*(#[0-9a-fA-F]{6})/;

    lines.forEach(line => {
      const bgMatch = line.match(backgroundRegex);
      const textMatch = line.match(textRegex);

      if (bgMatch) {
        backgroundColor = bgMatch[1];
      } else if (textMatch) {
        textColor = textMatch[1];
      } else if (line.trim() !== '') {
        extractedText += line + '\n';
      }
    });

    return {
      text: extractedText.trim(),
      backgroundColor,
      textColor,
    };
  }
}

// Instância singleton
export const geminiService = new GeminiService();

// Hook para usar o serviço em React
export const useGeminiService = () => {
  return geminiService;
};