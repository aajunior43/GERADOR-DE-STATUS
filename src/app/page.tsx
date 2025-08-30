'use client';

import React, { useState, useEffect } from 'react';
import { useGeminiService } from '@/services/geminiService';
import { useSwipe } from '@/hooks/useSwipe';
import { hapticFeedback } from '@/utils/haptics';
import { useToast } from '@/components/Toast';

export default function Home() {
  const [theme, setTheme] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [includeEmojis, setIncludeEmojis] = useState(true);
  const [includeHashtags, setIncludeHashtags] = useState(false);
  const [includeVignette, setIncludeVignette] = useState(false);
  const [currentThemeIndex, setCurrentThemeIndex] = useState(0);
  
  const { showToast, ToastContainer } = useToast();

  const generateStatus = async () => {
    if (!theme.trim()) return;
    
    hapticFeedback.medium();
    setIsGenerating(true);
    
    try {
      const geminiService = useGeminiService();
      
      const response = await geminiService.generateStatus({
        theme,
        style: 'modern',
        aspectRatio: '9:16',
        includeComplementaryPhrase: false,
        includeHashtags,
        includeEmojis,
        includeVignette,
      });
      
      setGeneratedContent(response.generatedContent);
      hapticFeedback.success();
      showToast('Status criado com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao gerar status:', error);
      hapticFeedback.error();
      showToast('Erro ao gerar. Usando fallback.', 'error');
      const fallbackContent = {
        text: `"A única forma de fazer um excelente trabalho é amar o que você faz." ✨\n(Steve Jobs)`,
        backgroundColor: '#1a1a2e',
        textColor: '#f39c12',
        fontSize: 20,
        fontFamily: 'Inter'
      };
      setGeneratedContent(fallbackContent);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!generatedContent) return;

    hapticFeedback.medium();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 360;
    canvas.height = 640;

    // Criar gradiente de fundo
    const gradient = ctx.createLinearGradient(0, 0, 0, 640);
    gradient.addColorStop(0, generatedContent.backgroundColor);
    gradient.addColorStop(1, adjustBrightness(generatedContent.backgroundColor, -20));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 360, 640);

    // Adicionar vinheta preta se solicitado
    if (includeVignette) {
      const vignetteGradient = ctx.createRadialGradient(180, 320, 0, 180, 320, 400);
      vignetteGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vignetteGradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.1)');
      vignetteGradient.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
      ctx.fillStyle = vignetteGradient;
      ctx.fillRect(0, 0, 360, 640);
    }

    // Configurar texto
    ctx.fillStyle = generatedContent.textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Mapear fonte para uma compatível com canvas
    const canvasFont = generatedContent.fontFamily.includes('Playfair') ? 'serif' :
      generatedContent.fontFamily.includes('Crimson') ? 'serif' : 'sans-serif';

    // Função para quebrar texto em linhas que cabem na largura
    const wrapText = (text: string, maxWidth: number, fontSize: number): string[] => {
      ctx.font = `bold ${fontSize}px ${canvasFont}`;
      const words = text.split(' ');
      const lines: string[] = [];
      let currentLine = '';

      for (const word of words) {
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
          
          // Se uma palavra sozinha for muito longa, quebrar ela
          if (ctx.measureText(word).width > maxWidth) {
            let partialWord = '';
            for (let i = 0; i < word.length; i++) {
              const testChar = partialWord + word[i];
              if (ctx.measureText(testChar).width > maxWidth && partialWord) {
                lines.push(partialWord);
                partialWord = word[i];
              } else {
                partialWord = testChar;
              }
            }
            currentLine = partialWord;
          }
        } else {
          currentLine = testLine;
        }
      }
      
      if (currentLine) {
        lines.push(currentLine);
      }
      
      return lines;
    };

    // Processar o texto
    const margin = 40; // Margem lateral
    const maxWidth = canvas.width - (margin * 2);
    let fontSize = generatedContent.fontSize || 24;
    
    // Dividir texto em parágrafos (quebras de linha originais)
    const paragraphs = generatedContent.text.split('\n').filter(p => p.trim());
    let allLines: string[] = [];
    
    // Quebrar cada parágrafo em linhas que cabem na tela
    paragraphs.forEach((paragraph, index) => {
      const wrappedLines = wrapText(paragraph.trim(), maxWidth, fontSize);
      allLines = allLines.concat(wrappedLines);
      
      // Adicionar espaço entre parágrafos (exceto no último)
      if (index < paragraphs.length - 1) {
        allLines.push(''); // Linha vazia para espaçamento
      }
    });

    // Ajustar tamanho da fonte se o texto não couber
    const maxTextHeight = canvas.height - 120; // Margem superior e inferior
    const minFontSize = 12;
    const maxIterations = 10;
    let iterations = 0;

    // Loop para ajustar o tamanho da fonte até o texto caber
    while (fontSize > minFontSize && iterations < maxIterations) {
      const lineHeight = fontSize * 1.4;
      const totalHeight = allLines.length * lineHeight;
      
      if (totalHeight <= maxTextHeight) {
        break; // Texto cabe, sair do loop
      }
      
      // Reduzir fonte e recalcular linhas
      fontSize = Math.max(fontSize - 2, minFontSize);
      allLines = [];
      
      paragraphs.forEach((paragraph, index) => {
        const wrappedLines = wrapText(paragraph.trim(), maxWidth, fontSize);
        allLines = allLines.concat(wrappedLines);
        
        if (index < paragraphs.length - 1) {
          allLines.push('');
        }
      });
      
      iterations++;
    }

    // Se ainda não couber, truncar o texto
    if (allLines.length * fontSize * 1.4 > maxTextHeight) {
      const maxLines = Math.floor(maxTextHeight / (fontSize * 1.4));
      allLines = allLines.slice(0, maxLines - 1);
      allLines.push('...'); // Indicar que o texto foi truncado
    }

    // Desenhar o texto
    ctx.font = `bold ${fontSize}px ${canvasFont}`;
    const finalLineHeight = fontSize * 1.4;
    const textHeight = allLines.length * finalLineHeight;
    const startY = (canvas.height - textHeight) / 2 + finalLineHeight / 2;

    allLines.forEach((line, index) => {
      if (line.trim()) { // Só desenhar linhas não vazias
        ctx.fillText(line, canvas.width / 2, startY + (index * finalLineHeight));
      }
    });

    // Download da imagem
    const link = document.createElement('a');
    link.download = `status-${theme.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    
    showToast('Imagem baixada!', 'success');
  };

  const adjustBrightness = (hex: string, percent: number): string => {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  };

  const quickThemes = [
    'Motivação', 'Amor', 'Sucesso', 'Sabedoria', 'Força', 'Paz',
    'Felicidade', 'Coragem', 'Esperança', 'Gratidão', 'Família', 'Amizade',
    'Trabalho', 'Sonhos', 'Vida', 'Fé', 'Superação', 'Inspiração'
    'Harry Potter', 'Senhor dos Anéis', 'Dom Casmurro', 'O Cortiço', 'Capitães da Areia',
    'O Pequeno Príncipe', '1984', 'Orgulho e Preconceito', 'Cem Anos de Solidão', 'Dom Quixote'
  ];

  // Gestos de swipe para navegação entre temas
  useSwipe({
    onSwipeLeft: () => {
      if (!isGenerating) {
        hapticFeedback.light();
        const nextIndex = (currentThemeIndex + 1) % quickThemes.length;
        setCurrentThemeIndex(nextIndex);
        setTheme(quickThemes[nextIndex]);
      }
    },
    onSwipeRight: () => {
      if (!isGenerating) {
        hapticFeedback.light();
        const prevIndex = currentThemeIndex === 0 ? quickThemes.length - 1 : currentThemeIndex - 1;
        setCurrentThemeIndex(prevIndex);
        setTheme(quickThemes[prevIndex]);
      }
    },
    onSwipeUp: () => {
      if (generatedContent && !isGenerating) {
        hapticFeedback.medium();
        downloadImage();
      }
    }
  });

  // Atualiza o índice quando o tema é alterado manualmente
  useEffect(() => {
    const index = quickThemes.indexOf(theme);
    if (index !== -1) {
      setCurrentThemeIndex(index);
    }
  }, [theme, quickThemes]);

  // Função para mapear nomes de fontes para classes CSS
  const getFontClass = (fontName: string): string => {
    const fontMap: Record<string, string> = {
      'Inter': 'font-inter',
      'Playfair Display': 'font-playfair',
      'Montserrat': 'font-montserrat',
      'Poppins': 'font-poppins',
      'Lato': 'font-lato',
      'Open Sans': 'font-opensans',
      'Crimson Text': 'font-crimson'
    };
    return fontMap[fontName] || 'font-inter';
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Container principal com scroll suave */}
      <div className="max-w-sm mx-auto px-6 py-8 space-y-8">
        
        {/* Header elegante */}
        <header className="text-center space-y-3">
          <h1 className="text-3xl font-light text-white tracking-wide">Status AI</h1>
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent mx-auto"></div>
          <p className="text-white/50 text-sm">Crie status únicos com IA</p>
        </header>

        {/* Preview centralizado e destacado */}
        <section className="flex justify-center">
          <div className="relative group">
            <div 
              className="w-48 aspect-[9/16] rounded-3xl overflow-hidden shadow-2xl border border-white/10 active:scale-95 transition-all duration-300 cursor-pointer"
              onClick={() => generatedContent && downloadImage()}
            >
              <div 
                className={`w-full h-full flex items-center justify-center p-5 text-center relative ${generatedContent ? getFontClass(generatedContent.fontFamily) : 'font-inter'}`}
                style={{
                  background: generatedContent 
                    ? `linear-gradient(135deg, ${generatedContent.backgroundColor} 0%, ${adjustBrightness(generatedContent.backgroundColor, -15)} 100%)`
                    : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                  color: generatedContent?.textColor || '#f39c12',
                  fontSize: '13px'
                }}
              >
                {/* Vinheta preta no preview */}
                {includeVignette && (
                  <div 
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: 'radial-gradient(circle at center, rgba(0,0,0,0) 0%, rgba(0,0,0,0.1) 70%, rgba(0,0,0,0.6) 100%)'
                    }}
                  />
                )}
                {isGenerating ? (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      <div className="w-8 h-8 border-2 border-current/20 rounded-full"></div>
                      <div className="absolute top-0 left-0 w-8 h-8 border-2 border-transparent border-t-current rounded-full animate-spin"></div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm opacity-80 mb-2">Criando com IA</div>
                      <div className="flex justify-center gap-1">
                        <div className="w-1.5 h-1.5 bg-current/60 rounded-full animate-pulse"></div>
                        <div className="w-1.5 h-1.5 bg-current/60 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-1.5 h-1.5 bg-current/60 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                ) : generatedContent ? (
                  <p className="font-medium leading-relaxed whitespace-pre-line">
                    {generatedContent.text}
                  </p>
                ) : (
                  <div className="opacity-60 text-center">
                    <div className="w-10 h-10 border-2 border-current/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <div className="w-4 h-4 bg-current/50 rounded-full"></div>
                    </div>
                    <div className="text-sm">Preview</div>
                    <div className="text-xs opacity-70 mt-1">Toque para baixar</div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Indicador de download */}
            {generatedContent && (
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-white/70">
                Toque para baixar
              </div>
            )}
          </div>
        </section>

        {/* Input de tema */}
        <section className="space-y-3">
          <label className="block text-white/70 text-sm font-medium text-center">
            Qual o tema do seu status?
          </label>
          <input
            type="text"
            placeholder="Ex: motivação, amor, sucesso..."
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && generateStatus()}
            className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-3xl text-white placeholder-white/40 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all text-center text-lg"
            style={{ fontSize: '16px' }}
          />
        </section>

        {/* Opções de personalização */}
        <section className="space-y-4">
          <h3 className="text-white/70 text-sm font-medium text-center">Personalizar</h3>
          <div className="flex justify-center gap-8">
            <label className="flex flex-col items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={includeEmojis}
                  onChange={(e) => setIncludeEmojis(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-8 h-8 rounded-xl border-2 transition-all duration-200 active:scale-90 ${
                  includeEmojis 
                    ? 'bg-white border-white shadow-lg' 
                    : 'bg-transparent border-white/30 group-hover:border-white/50'
                }`}>
                  {includeEmojis && (
                    <svg className="w-4 h-4 text-black absolute top-1 left-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg mb-1">🎭</div>
                <span className="text-xs text-white/70 group-hover:text-white/90 transition-colors">Emojis</span>
              </div>
            </label>
            
            <label className="flex flex-col items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={includeHashtags}
                  onChange={(e) => setIncludeHashtags(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-8 h-8 rounded-xl border-2 transition-all duration-200 active:scale-90 ${
                  includeHashtags 
                    ? 'bg-white border-white shadow-lg' 
                    : 'bg-transparent border-white/30 group-hover:border-white/50'
                }`}>
                  {includeHashtags && (
                    <svg className="w-4 h-4 text-black absolute top-1 left-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg mb-1">#️⃣</div>
                <span className="text-xs text-white/70 group-hover:text-white/90 transition-colors">Hashtags</span>
              </div>
            </label>

            <label className="flex flex-col items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={includeVignette}
                  onChange={(e) => setIncludeVignette(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-8 h-8 rounded-xl border-2 transition-all duration-200 active:scale-90 ${
                  includeVignette 
                    ? 'bg-white border-white shadow-lg' 
                    : 'bg-transparent border-white/30 group-hover:border-white/50'
                }`}>
                  {includeVignette && (
                    <svg className="w-4 h-4 text-black absolute top-1 left-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg mb-1">🌑</div>
                <span className="text-xs text-white/70 group-hover:text-white/90 transition-colors">Vinheta</span>
              </div>
            </label>
          </div>
        </section>

        {/* Botão principal */}
        <section>
          <button
            onClick={generateStatus}
            disabled={!theme.trim() || isGenerating}
            className="w-full py-5 bg-white text-black font-semibold rounded-3xl disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all text-lg shadow-lg"
          >
            {isGenerating ? 'Criando com IA...' : 'Gerar Status'}
          </button>
        </section>

        {/* Botão de download (quando há conteúdo) */}
        {generatedContent && (
          <section>
            <button
              onClick={downloadImage}
              className="w-full py-4 text-white/80 hover:text-white transition-colors text-base border border-white/20 rounded-3xl active:scale-95 bg-white/5 backdrop-blur-sm"
            >
              📱 Baixar Imagem
            </button>
            <p className="text-xs text-white/40 text-center mt-2">
              Fonte: {generatedContent.fontFamily}
            </p>
          </section>
        )}

        {/* Navegação de temas */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                const prevIndex = currentThemeIndex === 0 ? quickThemes.length - 1 : currentThemeIndex - 1;
                setCurrentThemeIndex(prevIndex);
                setTheme(quickThemes[prevIndex]);
              }}
              disabled={isGenerating}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 active:scale-90 transition-all disabled:opacity-30"
            >
              ←
            </button>
            
            <div className="flex-1 text-center mx-4">
              <div className="text-white/90 text-base font-medium mb-2">
                {quickThemes[currentThemeIndex]}
              </div>
              <div className="flex justify-center gap-1">
                {quickThemes.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentThemeIndex ? 'bg-white/90 scale-110' : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>
            </div>
            
            <button
              onClick={() => {
                const nextIndex = (currentThemeIndex + 1) % quickThemes.length;
                setCurrentThemeIndex(nextIndex);
                setTheme(quickThemes[nextIndex]);
              }}
              disabled={isGenerating}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 active:scale-90 transition-all disabled:opacity-30"
            >
              →
            </button>
          </div>
          
          {/* Grid de temas */}
          <div className="grid grid-cols-3 gap-3">
            {quickThemes.map((category, index) => (
              <button
                key={category}
                onClick={() => {
                  setCurrentThemeIndex(index);
                  setTheme(category);
                  setTimeout(() => generateStatus(), 100);
                }}
                disabled={isGenerating}
                className={`py-3 px-4 transition-all disabled:opacity-30 text-sm rounded-2xl active:scale-95 ${
                  index === currentThemeIndex
                    ? 'bg-white/15 text-white border border-white/30 shadow-lg'
                    : 'text-white/60 hover:text-white/90 hover:bg-white/5 border border-white/10'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {/* Dicas de uso */}
        <section className="text-center space-y-2 pt-4 border-t border-white/10">
          <div className="text-xs text-white/40">
            Dicas: Deslize ← → para trocar temas • Deslize ↑ para baixar
          </div>
          
          {/* Debug info (menor e mais discreto) */}
          <button
            onClick={() => {
              const geminiService = useGeminiService();
              geminiService.clearQuoteHistory();
              const stats = geminiService.getHistoryStats();
              alert(`Histórico limpo! ${stats.total}/${stats.maxSize} frases`);
            }}
            className="text-xs text-white/20 hover:text-white/40 transition-colors"
          >
            Limpar Histórico ({(() => {
              try {
                const geminiService = useGeminiService();
                return geminiService.getHistoryStats().total;
              } catch {
                return 0;
              }
            })()})
          </button>
        </section>
      </div>
      
      {/* Container de toasts */}
      <ToastContainer />
    </div>
  );
}