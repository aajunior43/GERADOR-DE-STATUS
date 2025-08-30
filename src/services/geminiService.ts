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
  private usedQuotes: Set<string> = new Set(); // Histórico de frases já usadas
  private maxHistorySize = 50; // Máximo de frases no histórico

  constructor() {
    // Usar o modelo mais recente disponível
    this.textModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    // Carregar histórico do localStorage se disponível
    this.loadQuoteHistory();
  }

  /**
   * Carrega o histórico de frases do localStorage
   */
  private loadQuoteHistory(): void {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('statusai_used_quotes');
        if (saved) {
          const quotes = JSON.parse(saved);
          this.usedQuotes = new Set(quotes);
          console.log(`📚 Carregado histórico com ${this.usedQuotes.size} frases`);
        }
      }
    } catch (error) {
      console.warn('Erro ao carregar histórico de frases:', error);
    }
  }

  /**
   * Salva o histórico de frases no localStorage
   */
  private saveQuoteHistory(): void {
    try {
      if (typeof window !== 'undefined') {
        const quotes = Array.from(this.usedQuotes);
        localStorage.setItem('statusai_used_quotes', JSON.stringify(quotes));
        console.log(`💾 Histórico salvo com ${quotes.length} frases`);
      }
    } catch (error) {
      console.warn('Erro ao salvar histórico de frases:', error);
    }
  }

  /**
   * Adiciona uma frase ao histórico e gerencia o tamanho máximo
   */
  private addToHistory(quote: string): void {
    // Extrair apenas a parte principal da citação (sem autor)
    const mainQuote = quote.split('\n')[0].replace(/["""]/g, '').trim();
    
    this.usedQuotes.add(mainQuote);
    
    // Limitar o tamanho do histórico
    if (this.usedQuotes.size > this.maxHistorySize) {
      const quotesArray = Array.from(this.usedQuotes);
      // Remove as 10 mais antigas
      for (let i = 0; i < 10; i++) {
        this.usedQuotes.delete(quotesArray[i]);
      }
    }
    
    this.saveQuoteHistory();
  }

  /**
   * Verifica se uma frase já foi usada recentemente
   */
  private isQuoteUsed(quote: string): boolean {
    const mainQuote = quote.split('\n')[0].replace(/["""]/g, '').trim();
    return this.usedQuotes.has(mainQuote);
  }

  /**
   * Limpa o histórico de frases (útil para testes)
   */
  public clearQuoteHistory(): void {
    this.usedQuotes.clear();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('statusai_used_quotes');
    }
    console.log('🗑️ Histórico de frases limpo');
  }

  /**
   * Retorna o histórico atual de frases (útil para debug)
   */
  public getQuoteHistory(): string[] {
    return Array.from(this.usedQuotes);
  }

  /**
   * Retorna estatísticas do histórico
   */
  public getHistoryStats(): { total: number; maxSize: number; percentFull: number } {
    const total = this.usedQuotes.size;
    const percentFull = Math.round((total / this.maxHistorySize) * 100);
    return { total, maxSize: this.maxHistorySize, percentFull };
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
        // Adicionar variação para evitar repetições
        const randomSeed = Math.floor(Math.random() * 1000);
        const timeStamp = Date.now() % 1000;
        
        const prompt = `🎯 TEMA: "${theme}" (Sessão: ${randomSeed}-${timeStamp})

📋 MISSÃO: Encontre uma citação ÚNICA sobre "${theme}". Varie sempre as respostas!

🔍 REGRAS:
• Temas bíblicos/religiosos → Versículo bíblico REAL
• Temas seculares → Citação famosa REAL de autor reconhecido
• OBRIGATÓRIO: Explore diferentes autores e perspectivas
• NUNCA repita a mesma citação

✅ ESPECIFICAÇÕES:
• Português brasileiro perfeito
• Máximo 80 caracteres na frase
• 1 emoji apropriado
• Conteúdo real e verificável
• Sem hashtags

📝 FORMATO OBRIGATÓRIO:
"[Citação única]" [emoji]
[Autor/Referência]

background: #[6 dígitos]
text: #[6 dígitos]
font: [Nome da Fonte]

🎨 CORES POR TEMA:
• Motivação: #e74c3c + #ffffff + Montserrat
• Sucesso: #27ae60 + #ffffff + Poppins  
• Amor: #8e44ad + #f8f9fa + Lato
• Paz: #3498db + #ffffff + Inter
• Fé: #2c3e50 + #ecf0f1 + Playfair Display
• Força: #d35400 + #ffffff + Roboto

💡 VARIE AS CITAÇÕES - Exemplos de diversidade:

Para "motivação":
A) "O sucesso é a soma de pequenos esforços repetidos." 💪 (Robert Collier)
B) "Não espere por oportunidades. Crie-as." 🚀 (George Bernard Shaw)  
C) "A disciplina é a ponte entre metas e conquistas." ⚡ (Jim Rohn)

🎲 Use o ID ${randomSeed}-${timeStamp} para garantir resposta única.

⚠️ RETORNE APENAS o formato especificado.`;

        // Chamar a API do Gemini
        console.log(`🚀 Enviando para Gemini (tema: "${theme}", tentativa ${attempt})`);
        
        const result = await this.textModel.generateContent(prompt);
        const response = await result.response;
        const rawText = response.text();

        console.log(`📥 Resposta bruta do Gemini:`, rawText);
        console.log(`📏 Tamanho da resposta: ${rawText.length} caracteres`);

        // Validar e melhorar a resposta
        const { text, backgroundColor, textColor, fontFamily } = this.validateAndImproveResponse(rawText, theme);
        
        console.log(`✅ Texto final extraído: "${text}"`);
        console.log(`🎨 Cores: bg=${backgroundColor}, text=${textColor}`);

        // Verificar se a resposta é válida
        if (!text || text.length < 10) {
          throw new Error('Resposta muito curta ou inválida');
        }

        console.log('Resposta processada com sucesso:', { text, backgroundColor, textColor, fontFamily });

        // Adicionar ao histórico para evitar repetições futuras
        this.addToHistory(text);

        return {
          text: text.trim(),
          backgroundColor,
          textColor,
          fontSize: 20,
          fontFamily
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

    // Adicionar ao histórico mesmo no fallback
    this.addToHistory(fallbackText);

    return {
      text: fallbackText,
      backgroundColor: colorPalette.backgroundColor,
      textColor: colorPalette.textColor,
      fontSize: 20,
      fontFamily: this.selectFont(theme, fallbackText)
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
   * Seleciona a fonte mais apropriada baseada no tema e tipo de conteúdo
   */
  private selectFont(theme: string, text: string): string {
    const themeWords = theme.toLowerCase();
    const textContent = text.toLowerCase();
    
    // Fontes bíblicas/espirituais - mais tradicionais e elegantes
    if (themeWords.includes('fé') || themeWords.includes('fe') || 
        themeWords.includes('deus') || themeWords.includes('jesus') || 
        themeWords.includes('bíbli') || themeWords.includes('bibli') ||
        themeWords.includes('salm') || themeWords.includes('oração') ||
        themeWords.includes('oracao') || themeWords.includes('versí') ||
        textContent.includes('filipenses') || textContent.includes('salmo') ||
        textContent.includes('provérbios') || textContent.includes('joão')) {
      return 'Playfair Display'; // Fonte elegante e tradicional
    }
    
    // Temas de amor/relacionamento - fonte mais suave
    if (themeWords.includes('amor') || themeWords.includes('coração') ||
        themeWords.includes('família') || themeWords.includes('amizade') ||
        textContent.includes('amor') || textContent.includes('coração')) {
      return 'Poppins'; // Fonte suave e amigável
    }
    
    // Temas motivacionais/sucesso - fonte forte e moderna
    if (themeWords.includes('sucesso') || themeWords.includes('vitória') ||
        themeWords.includes('força') || themeWords.includes('foco') ||
        themeWords.includes('determinação') || themeWords.includes('conquista') ||
        textContent.includes('sucesso') || textContent.includes('persistência')) {
      return 'Montserrat'; // Fonte forte e impactante
    }
    
    // Temas de paz/tranquilidade - fonte leve
    if (themeWords.includes('paz') || themeWords.includes('tranquil') ||
        themeWords.includes('calma') || themeWords.includes('serenidade') ||
        textContent.includes('paz') || textContent.includes('tranquil')) {
      return 'Lato'; // Fonte leve e harmoniosa
    }
    
    // Temas de gratidão/positividade - fonte calorosa
    if (themeWords.includes('gratidão') || themeWords.includes('gratitud') ||
        themeWords.includes('obrigad') || themeWords.includes('feliz') ||
        textContent.includes('grat') || textContent.includes('obrigad')) {
      return 'Open Sans'; // Fonte calorosa e acessível
    }
    
    // Citações de autores famosos - fonte clássica
    if (textContent.includes('einstein') || textContent.includes('gandhi') ||
        textContent.includes('jobs') || textContent.includes('churchill') ||
        textContent.includes('chaplin') || textContent.includes('luther')) {
      return 'Crimson Text'; // Fonte clássica para citações
    }
    
    // Padrão - fonte moderna e versátil
    return 'Inter';
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
   * Extrai e valida cores e fonte do texto gerado pelo Gemini
   */
  private extractColorsAndFontFromText(text: string): { text: string; backgroundColor: string; textColor: string; fontFamily: string } {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    let extractedText = '';
    let backgroundColor = '';
    let textColor = '';
    let fontFamily = '';

    const backgroundRegex = /background:\s*(#[0-9a-fA-F]{6})/i;
    const textRegex = /text:\s*(#[0-9a-fA-F]{6})/i;
    const fontRegex = /font:\s*([^,\n]+)/i;

    lines.forEach(line => {
      const bgMatch = line.match(backgroundRegex);
      const textMatch = line.match(textRegex);
      const fontMatch = line.match(fontRegex);

      if (bgMatch) {
        backgroundColor = bgMatch[1].toUpperCase();
      } else if (textMatch) {
        textColor = textMatch[1].toUpperCase();
      } else if (fontMatch) {
        fontFamily = fontMatch[1].trim();
      } else if (!line.includes('background:') && !line.includes('text:') && !line.includes('font:')) {
        extractedText += line + '\n';
      }
    });

    // Validar contraste das cores extraídas
    if (backgroundColor && textColor) {
      const contrast = this.getContrastRatio(backgroundColor, textColor);
      if (contrast < 4.5) {
        console.warn(`Contraste baixo detectado (${contrast.toFixed(2)}). Ajustando cores...`);
        if (backgroundColor.startsWith('#F') || backgroundColor.startsWith('#E') || backgroundColor.startsWith('#D')) {
          textColor = '#1A1A1A';
        } else {
          textColor = '#FFFFFF';
        }
      }
    }

    return {
      text: extractedText.trim(),
      backgroundColor,
      textColor,
      fontFamily,
    };
  }

  /**
   * Valida e melhora a resposta do Gemini
   */
  private validateAndImproveResponse(rawResponse: string, theme: string): { text: string; backgroundColor: string; textColor: string; fontFamily: string } {
    let { text, backgroundColor, textColor, fontFamily } = this.extractColorsAndFontFromText(rawResponse);

    // Limpar texto de possíveis artefatos
    text = text
      .replace(/^["']|["']$/g, '') // Remove aspas do início/fim
      .replace(/\s+/g, ' ') // Normaliza espaços
      .trim();

    // Detectar se é sempre a mesma resposta repetitiva ou já foi usada
    if (text.includes('Acredite que você pode') || text.includes('Theodore Roosevelt') || this.isQuoteUsed(text)) {
      if (this.isQuoteUsed(text)) {
        console.warn('🔄 Frase já foi usada recentemente. Buscando alternativa...');
      } else {
        console.warn('⚠️ Detectada resposta repetitiva do Gemini. Forçando variação...');
      }
      text = this.getAlternativeQuote(theme);
    }

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

    // Garantir que temos uma fonte válida
    if (!fontFamily) {
      fontFamily = this.selectFont(theme, text);
    }

    // Validar se a fonte é uma das permitidas
    const allowedFonts = ['Inter', 'Playfair Display', 'Montserrat', 'Poppins', 'Lato', 'Open Sans', 'Crimson Text'];
    if (!allowedFonts.includes(fontFamily)) {
      fontFamily = this.selectFont(theme, text);
    }

    return { text, backgroundColor, textColor, fontFamily };
  }

  /**
   * Retorna uma citação alternativa para evitar repetições, verificando o histórico
   */
  private getAlternativeQuote(theme: string): string {
    const themeWords = theme.toLowerCase();
    let availableQuotes: string[] = [];
    
    if (themeWords.includes('motivação') || themeWords.includes('motivacao')) {
      availableQuotes = [
        '"O sucesso é a soma de pequenos esforços repetidos." 💪\n(Robert Collier)',
        '"Não espere por oportunidades. Crie-as." 🚀\n(George Bernard Shaw)',
        '"A disciplina é a ponte entre metas e conquistas." ⚡\n(Jim Rohn)',
        '"O único modo de fazer um excelente trabalho é amar o que faz." ✨\n(Steve Jobs)',
        '"Grandes realizações requerem grandes ambições." 🌟\n(Heráclito)',
        '"A motivação é o que te faz começar. O hábito é o que te mantém." 🔥\n(Jim Ryun)',
        '"Você é mais corajoso do que acredita, mais forte do que parece." 💪\n(A.A. Milne)',
        '"O futuro pertence àqueles que acreditam na beleza de seus sonhos." ✨\n(Eleanor Roosevelt)'
      ];
    } else if (themeWords.includes('sucesso')) {
      availableQuotes = [
        '"O sucesso é ir de fracasso em fracasso sem perder o entusiasmo." 🌟\n(Winston Churchill)',
        '"O sucesso não é final, o fracasso não é fatal." 💪\n(Winston Churchill)',
        '"O sucesso é 1% inspiração e 99% transpiração." ⚡\n(Thomas Edison)',
        '"A persistência é o caminho do êxito." 🚀\n(Charles Chaplin)',
        '"O sucesso é a soma de pequenos esforços repetidos dia após dia." 📈\n(Robert Collier)',
        '"Não meça o sucesso pelo que você conquistou, mas pelos obstáculos que superou." 🏆\n(Booker T. Washington)'
      ];
    } else if (themeWords.includes('amor')) {
      availableQuotes = [
        '"O amor é a única força capaz de transformar um inimigo em amigo." 💕\n(Martin Luther King Jr.)',
        '"Onde há amor, há vida." ❤️\n(Mahatma Gandhi)',
        '"O amor não consiste em olhar um para o outro, mas em olhar juntos na mesma direção." 💖\n(Antoine de Saint-Exupéry)',
        '"Amar não é olhar um para o outro, é olhar juntos na mesma direção." 💝\n(Antoine de Saint-Exupéry)',
        '"O amor é a ponte entre duas almas." 💞\n(Rumi)'
      ];
    } else if (themeWords.includes('paz')) {
      availableQuotes = [
        '"A paz não pode ser mantida à força; só pode ser alcançada pela compreensão." ☮️\n(Albert Einstein)',
        '"Não há caminho para a paz; a paz é o caminho." 🕊️\n(Mahatma Gandhi)',
        '"A paz começa com um sorriso." 😊\n(Madre Teresa)',
        '"A paz interior é o novo sucesso." 🧘\n(Jewel)',
        '"Cultive a paz interior e ela se espalhará naturalmente." ✨\n(Dalai Lama)'
      ];
    } else {
      // Fallback geral com mais opções
      availableQuotes = [
        '"A persistência é o caminho do êxito." 🌟\n(Charles Chaplin)',
        '"O único modo de fazer um excelente trabalho é amar o que faz." ✨\n(Steve Jobs)',
        '"Grandes realizações requerem grandes ambições." 💪\n(Heráclito)',
        '"A vida é 10% o que acontece com você e 90% como você reage." 🚀\n(Charles Swindoll)',
        '"O futuro depende do que você faz hoje." ⚡\n(Mahatma Gandhi)',
        '"Seja a mudança que você quer ver no mundo." 🌍\n(Mahatma Gandhi)',
        '"A jornada de mil milhas começa com um único passo." 👣\n(Lao Tzu)',
        '"Acredite em si mesmo e tudo será possível." 🌟\n(Anônimo)'
      ];
    }
    
    // Filtrar citações que não foram usadas recentemente
    const unusedQuotes = availableQuotes.filter(quote => !this.isQuoteUsed(quote));
    
    // Se todas foram usadas, usar qualquer uma (resetar ciclo)
    const quotesToUse = unusedQuotes.length > 0 ? unusedQuotes : availableQuotes;
    
    const selectedQuote = quotesToUse[Math.floor(Math.random() * quotesToUse.length)];
    
    console.log(`🎲 Selecionada citação alternativa: ${unusedQuotes.length}/${availableQuotes.length} disponíveis`);
    
    return selectedQuote;
  }
}

// Instância singleton
export const geminiService = new GeminiService();

// Hook para usar o serviço em React
export const useGeminiService = () => {
  return geminiService;
};