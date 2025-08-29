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
      // Construir requisitos para buscar frases famosas
      let requirements = [
        '1. Encontre uma citação famosa em PORTUGUÊS BRASILEIRO relacionada ao tema fornecido',
        '2. A frase deve ter no máximo 150 caracteres para caber bem no status',
        '3. SEMPRE inclua o autor da frase entre parênteses ao final',
        '4. Use aspas para delimitar a frase',
        '5. Adicione 1-2 emojis apropriados ao tema',
        '6. Priorize frases de autores reconhecidos mundialmente OU suas traduções para português',
        '7. NÃO invente frases - use apenas citações reais e verificáveis em português',
        '8. NÃO use hashtags ou comentários adicionais',
        '9. Se a citação original for em outro idioma, forneça a tradução em português brasileiro'
      ];

      // Preparar o prompt para a IA
      let prompt = 'Você é um especialista em citações famosas e literatura brasileira e mundial. ';
      prompt += 'Sua tarefa é encontrar uma citação famosa REAL em PORTUGUÊS BRASILEIRO relacionada ao seguinte tema: "' + theme + '"\n\n';
      prompt += 'REQUISITOS OBRIGATÓRIOS:\n';
      prompt += requirements.join('\n') + '\n\n';
      
      // Instruções especiais para temas bíblicos
      const normalizedTheme = theme.toLowerCase();
      const isBiblicalTheme = normalizedTheme.includes('bíblia') || 
                             normalizedTheme.includes('biblia') || 
                             normalizedTheme.includes('versículo') || 
                             normalizedTheme.includes('versiculo') || 
                             normalizedTheme.includes('capítulo') ||
                             normalizedTheme.includes('capitulo') ||
                             normalizedTheme.includes('deus') ||
                             normalizedTheme.includes('cristo') ||
                             normalizedTheme.includes('jesus') ||
                             normalizedTheme.includes('fé') ||
                             normalizedTheme.includes('fe') ||
                             normalizedTheme.includes('oração') ||
                             normalizedTheme.includes('oracao') ||
                             normalizedTheme.includes('salmo');
                             
      if (isBiblicalTheme) {
        prompt += 'INSTRUÇÕES ESPECIAIS PARA TEMAS BÍBLICOS:\n';
        prompt += '- Encontre um versículo bíblico REAL e EXATO em PORTUGUÊS BRASILEIRO relacionado ao tema\n';
        prompt += '- Cite o versículo EXATAMENTE como está escrito na Bíblia em português\n';
        prompt += '- Inclua a referência bíblica completa (livro, capítulo:versículo)\n';
        prompt += '- Use a versão Almeida Corrigida Fiel (ACF) ou Nova Versão Internacional (NVI) em português\n';
        prompt += '- NÃO modifique, parafrase ou adapte o texto bíblico\n';
        prompt += '- NÃO invente versículos ou referências\n';
        prompt += '- Mantenha total fidelidade ao texto sagrado em português brasileiro\n\n';
      }
      
      prompt += 'ESTRUTURA ESPERADA:\n';
      if (isBiblicalTheme) {
        prompt += '- Versículo bíblico exato entre aspas\n';
        prompt += '- Referência bíblica (Livro capítulo:versículo)\n';
        prompt += '- 1-2 emojis relacionados à fé (✨, 🙏, ❤️, 💫)\n';
      } else {
        prompt += '- Citação famosa entre aspas (máximo 150 caracteres)\n';
        prompt += '- Nome do autor entre parênteses\n';
        prompt += '- 1-2 emojis apropriados ao tema\n';
      }
      prompt += '- Quebra de linha\n';
      prompt += '- Linha com "background: #HEX" (cor de fundo apropriada que combine com o tema)\n';
      prompt += '- Linha com "text: #HEX" (cor de texto que contraste bem e seja legível)\n\n';
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
      
      if (isBiblicalTheme) {
        prompt += 'PALETA DE CORES PARA TEMAS BÍBLICOS:\n';
        prompt += '- Fundos: tons de azul-escuro (#1a3c6c), roxo (#4a235a), marrom (#5d4037)\n';
        prompt += '- Textos: branco (#ffffff), bege claro (#fff8e1), dourado (#d4af37)\n\n';
      }
      
      prompt += 'EXEMPLOS DE STATUS EFICAZES COM CORES APROPRIADAS:\n';
      if (isBiblicalTheme) {
        prompt += '"Tudo posso naquele que me fortalece." ✨\nFilipenses 4:13\n\nbackground: #1a3c6c\ntext: #fff8e1\n';
        prompt += '(Versículo bíblico em português com referência)\n\n';
        prompt += '"O Senhor é o meu pastor; nada me faltará." 🙏\nSalmos 23:1\n\nbackground: #4a235a\ntext: #f9e79f\n';
        prompt += '(Salmo em português com referência bíblica)\n\n';
      } else {
        prompt += '"A persistência é o caminho do êxito." 🌟\n(Charles Chaplin)\n\nbackground: #1a535c\ntext: #f7fff7\n';
        prompt += '(Citação famosa em português com autor)\n\n';
        prompt += '"A única forma de fazer um excelente trabalho é amar o que você faz." 💪\n(Steve Jobs)\n\nbackground: #4a235a\ntext: #f9e79f\n';
        prompt += '(Frase motivacional traduzida para português com autor)\n\n';
      }
      
      prompt += 'CRITÉRIOS DE QUALIDADE:\n';
      if (isBiblicalTheme) {
        prompt += '- Fidelidade absoluta ao texto bíblico em português\n';
        prompt += '- Referência bíblica correta e completa\n';
        prompt += '- Relevância do versículo com o tema\n';
        prompt += '- Respeitosidade e reverência\n';
      } else {
        prompt += '- Autenticidade da citação em português brasileiro\n';
        prompt += '- Credibilidade do autor\n';
        prompt += '- Relevância com o tema\n';
        prompt += '- Impacto inspiracional\n';
        prompt += '- Tradução fiel para o português (quando aplicável)\n';
      }
      prompt += '- Cores harmoniosas e legíveis\n\n';
      prompt += 'IMPORTANTE: TODAS AS CITAÇÕES DEVEM ESTAR EM PORTUGUÊS BRASILEIRO!\n\n';
      prompt += 'RETORNE APENAS O STATUS FORMATADO EXATAMENTE COMO NOS EXEMPLOS, NADA ALÉM DISSO.';

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
      
      // Fallback para conteúdo padrão se a API falhar
      const normalizedTheme = theme.toLowerCase();
      const isBiblicalTheme = normalizedTheme.includes('bíblia') || 
                             normalizedTheme.includes('biblia') || 
                             normalizedTheme.includes('versículo') || 
                             normalizedTheme.includes('versiculo') || 
                             normalizedTheme.includes('deus') ||
                             normalizedTheme.includes('cristo') ||
                             normalizedTheme.includes('jesus') ||
                             normalizedTheme.includes('fé') ||
                             normalizedTheme.includes('salmo');
      
      let fallbackText;
      if (isBiblicalTheme) {
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