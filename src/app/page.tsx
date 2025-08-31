'use client';

import React, { useState, useEffect } from 'react';
import { useGeminiService } from '@/services/geminiService';
import { useSwipe } from '@/hooks/useSwipe';
import { hapticFeedback } from '@/utils/haptics';
import { useToast } from '@/components/Toast';
import EnhancedHeader from '@/components/EnhancedHeader';

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

    // Resolução mais alta para melhor qualidade
    const scale = 2;
    canvas.width = 360 * scale;
    canvas.height = 640 * scale;
    ctx.scale(scale, scale);

    // Anti-aliasing para texto mais suave
    ctx.textRenderingOptimization = 'optimizeQuality';
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Criar gradiente de fundo mais complexo
    const gradient = ctx.createLinearGradient(0, 0, 360, 640);
    const baseColor = generatedContent.backgroundColor;
    gradient.addColorStop(0, adjustBrightness(baseColor, 10));
    gradient.addColorStop(0.3, baseColor);
    gradient.addColorStop(0.7, adjustBrightness(baseColor, -15));
    gradient.addColorStop(1, adjustBrightness(baseColor, -30));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 360, 640);

    // Adicionar textura sutil de ruído
    const addNoise = () => {
      const imageData = ctx.getImageData(0, 0, 360, 640);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 8;
        data[i] = Math.max(0, Math.min(255, data[i] + noise));
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
      }
      ctx.putImageData(imageData, 0, 0);
    };
    addNoise();

    // Adicionar vinheta mais sofisticada
    if (includeVignette) {
      const vignetteGradient = ctx.createRadialGradient(180, 320, 0, 180, 320, 450);
      vignetteGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vignetteGradient.addColorStop(0.6, 'rgba(0, 0, 0, 0.05)');
      vignetteGradient.addColorStop(0.8, 'rgba(0, 0, 0, 0.2)');
      vignetteGradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
      ctx.fillStyle = vignetteGradient;
      ctx.fillRect(0, 0, 360, 640);
    }

    // Adicionar elementos decorativos baseados no tema
    const addThemeDecorations = () => {
      ctx.save();
      ctx.globalAlpha = 0.08;
      ctx.strokeStyle = generatedContent.textColor;
      ctx.fillStyle = generatedContent.textColor;

      const themeKey = theme.toLowerCase();

      if (themeKey.includes('amor') || themeKey.includes('família')) {
        // Corações sutis
        for (let i = 0; i < 3; i++) {
          const x = 50 + Math.random() * 260;
          const y = 100 + Math.random() * 440;
          drawHeart(ctx, x, y, 8);
        }
      } else if (themeKey.includes('música')) {
        // Notas musicais
        for (let i = 0; i < 4; i++) {
          const x = 60 + Math.random() * 240;
          const y = 120 + Math.random() * 400;
          drawMusicNote(ctx, x, y, 12);
        }
      } else if (themeKey.includes('estrela') || themeKey.includes('sonhos')) {
        // Estrelas
        for (let i = 0; i < 5; i++) {
          const x = 40 + Math.random() * 280;
          const y = 80 + Math.random() * 480;
          drawStar(ctx, x, y, 6);
        }
      } else {
        // Padrão geométrico padrão
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(60, 80);
        ctx.lineTo(300, 80);
        ctx.moveTo(60, 560);
        ctx.lineTo(300, 560);
        ctx.stroke();

        // Círculos decorativos nos cantos
        ctx.beginPath();
        ctx.arc(40, 60, 15, 0, Math.PI * 2);
        ctx.arc(320, 60, 15, 0, Math.PI * 2);
        ctx.arc(40, 580, 15, 0, Math.PI * 2);
        ctx.arc(320, 580, 15, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
    };

    // Funções auxiliares para desenhar formas
    const drawHeart = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
      ctx.beginPath();
      ctx.moveTo(x, y + size / 4);
      ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + size / 4);
      ctx.bezierCurveTo(x - size / 2, y + size / 2, x, y + size, x, y + size);
      ctx.bezierCurveTo(x, y + size, x + size / 2, y + size / 2, x + size / 2, y + size / 4);
      ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + size / 4);
      ctx.fill();
    };

    const drawMusicNote = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
      ctx.beginPath();
      ctx.arc(x, y + size, size / 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(x + size / 4, y, 2, size);
    };

    const drawStar = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
        const xPos = x + Math.cos(angle) * size;
        const yPos = y + Math.sin(angle) * size;
        if (i === 0) ctx.moveTo(xPos, yPos);
        else ctx.lineTo(xPos, yPos);

        const innerAngle = ((i + 0.5) * Math.PI * 2) / 5 - Math.PI / 2;
        const innerX = x + Math.cos(innerAngle) * (size / 2);
        const innerY = y + Math.sin(innerAngle) * (size / 2);
        ctx.lineTo(innerX, innerY);
      }
      ctx.closePath();
      ctx.fill();
    };

    addThemeDecorations();

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

    // Desenhar o texto com melhorias visuais
    ctx.font = `bold ${fontSize}px ${canvasFont}`;
    const finalLineHeight = fontSize * 1.4;
    const textHeight = allLines.length * finalLineHeight;
    const startY = (640 - textHeight) / 2 + finalLineHeight / 2; // Usar altura original

    allLines.forEach((line, index) => {
      if (line.trim()) {
        const x = 180; // Centro horizontal
        const y = startY + (index * finalLineHeight);

        // Sombra do texto para melhor legibilidade
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillText(line, x + 2, y + 2);
        ctx.restore();

        // Texto principal
        ctx.fillStyle = generatedContent.textColor;
        ctx.fillText(line, x, y);

        // Brilho sutil no texto (opcional)
        if (theme.toLowerCase().includes('inspiração') || theme.toLowerCase().includes('motivação')) {
          ctx.save();
          ctx.globalAlpha = 0.2;
          ctx.fillStyle = '#ffffff';
          ctx.fillText(line, x, y - 1);
          ctx.restore();
        }
      }
    });

    // Download da imagem com qualidade máxima
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 10);
    link.download = `status-${theme.toLowerCase().replace(/\s+/g, '-')}-${timestamp}.png`;

    // Usar qualidade máxima para PNG
    link.href = canvas.toDataURL('image/png', 1.0);
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
    'Trabalho', 'Sonhos', 'Vida', 'Fé', 'Superação', 'Inspiração', 'Filme', 'Séries', 'Música'
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
    console.log(`🔍 useEffect - Tema: "${theme}", Índice atual: ${currentThemeIndex}, Índice encontrado: ${index}`);
    if (index !== -1 && index !== currentThemeIndex) {
      console.log(`🔄 Sincronizando índice: ${currentThemeIndex} → ${index}`);
      setCurrentThemeIndex(index);
    } else if (theme.trim() && index === -1) {
      console.log(`⚠️ Tema "${theme}" não encontrado na lista de temas rápidos`);
    }
  }, [theme, quickThemes, currentThemeIndex]);

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
      <EnhancedHeader />
      {/* Container principal responsivo */}
      <div className="max-w-sm mx-auto px-4 py-6 space-y-6 md:max-w-4xl md:px-8 md:py-12 pt-24">
        
        {/* Layout Desktop - Grid com 2 colunas */}
        <div className="hidden md:grid md:grid-cols-2 md:gap-12 md:items-start">
          
          {/* Coluna Esquerda - Controles */}
          <div className="space-y-8">
            {/* Header elegante com animação */}
            <header className="text-center space-y-4">
              <div className="relative">
                <h1 className="text-5xl font-light text-white tracking-wide bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent animate-pulse">
                  Status AI
                </h1>
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-20 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
              </div>
              <div className="w-24 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent mx-auto shadow-lg"></div>
              <p className="text-white/70 text-lg font-medium">Crie status únicos com IA ✨</p>
            </header>

            {/* Input de tema melhorado */}
            <section className="space-y-4">
              <label className="block text-white/80 text-lg font-semibold text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                ✨ Qual o tema do seu status?
              </label>
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Ex: motivação, amor, sucesso..."
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && generateStatus()}
                  className="w-full px-8 py-5 bg-gradient-to-r from-white/5 to-white/10 border-2 border-white/20 rounded-3xl text-white placeholder-white/50 focus:outline-none focus:border-blue-400/50 focus:bg-white/15 transition-all text-center text-lg shadow-2xl backdrop-blur-sm hover:shadow-blue-500/10 focus:shadow-blue-500/20"
                  style={{ fontSize: '16px' }}
                />
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </section>

            {/* Opções de personalização melhoradas */}
            <section className="space-y-6">
              <h3 className="text-white/80 text-lg font-semibold text-center bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">🎨 Personalizar</h3>
              <div className="flex justify-center gap-12">
                <label className="flex flex-col items-center gap-4 cursor-pointer group transform hover:scale-105 transition-transform">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={includeEmojis}
                      onChange={(e) => setIncludeEmojis(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-12 h-12 rounded-2xl border-2 transition-all duration-300 active:scale-90 shadow-lg ${
                      includeEmojis 
                        ? 'bg-gradient-to-br from-yellow-400 to-orange-500 border-yellow-300 shadow-yellow-400/30' 
                        : 'bg-white/5 border-white/30 group-hover:border-yellow-400/50 backdrop-blur-sm'
                    }`}>
                      {includeEmojis && (
                        <svg className="w-6 h-6 text-white absolute top-3 left-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-2">🎭</div>
                    <span className="text-sm text-white/80 group-hover:text-white font-medium transition-colors">Emojis</span>
                  </div>
                </label>
                
                <label className="flex flex-col items-center gap-4 cursor-pointer group transform hover:scale-105 transition-transform">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={includeHashtags}
                      onChange={(e) => setIncludeHashtags(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-12 h-12 rounded-2xl border-2 transition-all duration-300 active:scale-90 shadow-lg ${
                      includeHashtags 
                        ? 'bg-gradient-to-br from-blue-400 to-purple-500 border-blue-300 shadow-blue-400/30' 
                        : 'bg-white/5 border-white/30 group-hover:border-blue-400/50 backdrop-blur-sm'
                    }`}>
                      {includeHashtags && (
                        <svg className="w-6 h-6 text-white absolute top-3 left-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-2">#️⃣</div>
                    <span className="text-sm text-white/80 group-hover:text-white font-medium transition-colors">Hashtags</span>
                  </div>
                </label>

                <label className="flex flex-col items-center gap-4 cursor-pointer group transform hover:scale-105 transition-transform">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={includeVignette}
                      onChange={(e) => setIncludeVignette(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-12 h-12 rounded-2xl border-2 transition-all duration-300 active:scale-90 shadow-lg ${
                      includeVignette 
                        ? 'bg-gradient-to-br from-gray-600 to-gray-800 border-gray-400 shadow-gray-400/30' 
                        : 'bg-white/5 border-white/30 group-hover:border-gray-400/50 backdrop-blur-sm'
                    }`}>
                      {includeVignette && (
                        <svg className="w-6 h-6 text-white absolute top-3 left-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-2">🌑</div>
                    <span className="text-sm text-white/80 group-hover:text-white font-medium transition-colors">Vinheta</span>
                  </div>
                </label>
              </div>
            </section>

            {/* Botão principal melhorado */}
            <section>
              <button
                onClick={generateStatus}
                disabled={!theme.trim() || isGenerating}
                className="relative w-full py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-3xl disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all text-xl shadow-2xl hover:shadow-blue-500/30 overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <div className="relative flex items-center justify-center gap-3">
                  {isGenerating && (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  )}
                  <span>{isGenerating ? '🤖 Criando com IA...' : '✨ Gerar Status'}</span>
                </div>
              </button>
            </section>

            {/* Botão de download melhorado */}
            {generatedContent && (
              <section>
                <button
                  onClick={downloadImage}
                  className="relative w-full py-5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold rounded-3xl active:scale-95 transition-all text-lg shadow-xl hover:shadow-green-500/30 overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <div className="relative flex items-center justify-center gap-2">
                    <span className="text-xl">📱</span>
                    <span>Baixar Imagem</span>
                  </div>
                </button>
                <div className="mt-4 p-3 bg-white/5 rounded-2xl backdrop-blur-sm">
                  <p className="text-sm text-white/70 text-center">
                    <span className="font-medium">Fonte:</span> {generatedContent.fontFamily}
                  </p>
                </div>
              </section>
            )}
          </div>

          {/* Coluna Direita - Preview e Navegação */}
          <div className="space-y-8">
            {/* Preview centralizado */}
            <section className="flex justify-center">
              <div className="relative group">
                <div 
                  className="w-64 aspect-[9/16] rounded-3xl overflow-hidden shadow-2xl border border-white/10 active:scale-95 transition-all duration-300 cursor-pointer"
                  onClick={() => generatedContent && downloadImage()}
                >
                  <div 
                    className={`w-full h-full flex items-center justify-center p-6 text-center relative ${generatedContent ? getFontClass(generatedContent.fontFamily) : 'font-inter'}`}
                    style={{
                      background: generatedContent 
                        ? `linear-gradient(135deg, ${generatedContent.backgroundColor} 0%, ${adjustBrightness(generatedContent.backgroundColor, -15)} 100%)`
                        : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                      color: generatedContent?.textColor || '#f39c12',
                      fontSize: '15px'
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
                          <div className="w-10 h-10 border-2 border-current/20 rounded-full"></div>
                          <div className="absolute top-0 left-0 w-10 h-10 border-2 border-transparent border-t-current rounded-full animate-spin"></div>
                        </div>
                        <div className="text-center">
                          <div className="text-base opacity-80 mb-2">Criando com IA</div>
                          <div className="flex justify-center gap-1">
                            <div className="w-2 h-2 bg-current/60 rounded-full animate-pulse"></div>
                            <div className="w-2 h-2 bg-current/60 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-current/60 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                          </div>
                        </div>
                      </div>
                    ) : generatedContent ? (
                      <p className="font-medium leading-relaxed whitespace-pre-line">
                        {generatedContent.text}
                      </p>
                    ) : (
                      <div className="opacity-60 text-center">
                        <div className="w-12 h-12 border-2 border-current/30 rounded-full flex items-center justify-center mx-auto mb-4">
                          <div className="w-5 h-5 bg-current/50 rounded-full"></div>
                        </div>
                        <div className="text-base">Preview</div>
                        <div className="text-sm opacity-70 mt-2">Toque para baixar</div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Indicador de download */}
                {generatedContent && (
                  <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-white/70">
                    Toque para baixar
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Layout Mobile */}
        <div className="block md:hidden space-y-6">
          {/* Header simplificado para mobile */}
          <header className="text-center space-y-4">
            <h1 className="text-4xl font-light text-white tracking-wide bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent animate-pulse">
              Status AI
            </h1>
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent mx-auto shadow-lg"></div>
            <p className="text-white/70 text-base font-medium">Crie status únicos com IA ✨</p>
          </header>

          {/* Preview mobile centralizado */}
          <section className="flex justify-center">
            <div className="relative group">
              <div 
                className="w-56 aspect-[9/16] rounded-3xl overflow-hidden shadow-2xl border border-white/10 active:scale-95 transition-all duration-300 cursor-pointer"
                onClick={() => generatedContent && downloadImage()}
              >
                <div 
                  className={`w-full h-full flex items-center justify-center p-6 text-center relative ${generatedContent ? getFontClass(generatedContent.fontFamily) : 'font-inter'}`}
                  style={{
                    background: generatedContent 
                      ? `linear-gradient(135deg, ${generatedContent.backgroundColor} 0%, ${adjustBrightness(generatedContent.backgroundColor, -15)} 100%)`
                      : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                    color: generatedContent?.textColor || '#f39c12',
                    fontSize: '13px'
                  }}
                >
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
                      <div className="text-xs opacity-70 mt-2">Toque para baixar</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Input de tema mobile */}
          <section className="space-y-4">
            <label className="block text-white/80 text-base font-semibold text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              ✨ Qual o tema do seu status?
            </label>
            <div className="relative group">
              <input
                type="text"
                placeholder="Ex: motivação, amor, sucesso..."
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && generateStatus()}
                className="w-full px-6 py-4 bg-gradient-to-r from-white/5 to-white/10 border-2 border-white/20 rounded-3xl text-white placeholder-white/50 focus:outline-none focus:border-blue-400/50 focus:bg-white/15 transition-all text-center text-base shadow-2xl backdrop-blur-sm"
                style={{ fontSize: '16px' }}
              />
            </div>
          </section>

          {/* Navegação de temas mobile */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  const prevIndex = currentThemeIndex === 0 ? quickThemes.length - 1 : currentThemeIndex - 1;
                  const prevTheme = quickThemes[prevIndex];
                  console.log(`⬅️ Navegação anterior: ${prevTheme} (índice ${prevIndex})`);
                  setCurrentThemeIndex(prevIndex);
                  setTheme(prevTheme);
                }}
                disabled={isGenerating}
                className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 active:scale-90 transition-all disabled:opacity-30 text-lg"
              >
                ←
              </button>
              
              <div className="flex-1 text-center mx-6">
                <div className="text-white/90 text-lg font-medium mb-3">
                  {quickThemes[currentThemeIndex]}
                </div>
                <div className="flex justify-center gap-2">
                  {quickThemes.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        index === currentThemeIndex ? 'bg-white/90 scale-110' : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              <button
                onClick={() => {
                  const nextIndex = (currentThemeIndex + 1) % quickThemes.length;
                  const nextTheme = quickThemes[nextIndex];
                  console.log(`➡️ Navegação próxima: ${nextTheme} (índice ${nextIndex})`);
                  setCurrentThemeIndex(nextIndex);
                  setTheme(nextTheme);
                }}
                disabled={isGenerating}
                className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 active:scale-90 transition-all disabled:opacity-30 text-lg"
              >
                →
              </button>
            </div>

            {/* Lista de temas mobile em grid */}
            <div className="grid grid-cols-3 gap-2">
              {quickThemes.map((category, index) => (
                <button
                  key={category}
                  onClick={() => {
                    console.log(`🎯 Clicou em: ${category} (índice ${index})`);
                    setCurrentThemeIndex(index);
                    setTheme(category);
                    console.log(`✅ Definido: tema="${category}", índice=${index}`);
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

          {/* Opções de personalização mobile */}
          <section className="space-y-4">
            <h3 className="text-white/80 text-base font-semibold text-center bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">⚙️ Personalizar</h3>
            <div className="flex justify-center gap-8">
              <label className="flex flex-col items-center gap-3 cursor-pointer group transform hover:scale-105 transition-transform">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={includeEmojis}
                    onChange={(e) => setIncludeEmojis(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-10 h-10 rounded-2xl border-2 transition-all duration-300 active:scale-90 shadow-lg ${
                    includeEmojis 
                      ? 'bg-gradient-to-br from-yellow-400 to-orange-500 border-yellow-300 shadow-yellow-400/30' 
                      : 'bg-white/5 border-white/30 group-hover:border-yellow-400/50 backdrop-blur-sm'
                  }`}>
                    {includeEmojis && (
                      <svg className="w-5 h-5 text-white absolute top-2.5 left-2.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl mb-1">😊</div>
                  <span className="text-xs text-white/80 group-hover:text-white font-medium transition-colors">Emojis</span>
                </div>
              </label>
              
              <label className="flex flex-col items-center gap-3 cursor-pointer group transform hover:scale-105 transition-transform">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={includeHashtags}
                    onChange={(e) => setIncludeHashtags(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-10 h-10 rounded-2xl border-2 transition-all duration-300 active:scale-90 shadow-lg ${
                    includeHashtags 
                      ? 'bg-gradient-to-br from-blue-400 to-purple-500 border-blue-300 shadow-blue-400/30' 
                      : 'bg-white/5 border-white/30 group-hover:border-blue-400/50 backdrop-blur-sm'
                  }`}>
                    {includeHashtags && (
                      <svg className="w-5 h-5 text-white absolute top-2.5 left-2.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl mb-1">#️⃣</div>
                  <span className="text-xs text-white/80 group-hover:text-white font-medium transition-colors">Hashtags</span>
                </div>
              </label>

              <label className="flex flex-col items-center gap-3 cursor-pointer group transform hover:scale-105 transition-transform">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={includeVignette}
                    onChange={(e) => setIncludeVignette(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-10 h-10 rounded-2xl border-2 transition-all duration-300 active:scale-90 shadow-lg ${
                    includeVignette 
                      ? 'bg-gradient-to-br from-gray-600 to-gray-800 border-gray-400 shadow-gray-400/30' 
                      : 'bg-white/5 border-white/30 group-hover:border-gray-400/50 backdrop-blur-sm'
                  }`}>
                    {includeVignette && (
                      <svg className="w-5 h-5 text-white absolute top-2.5 left-2.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl mb-1">🎞️</div>
                  <span className="text-xs text-white/80 group-hover:text-white font-medium transition-colors">Vinheta</span>
                </div>
              </label>
            </div>
          </section>

          {/* Botão principal mobile */}
          <section>
            <button
              onClick={generateStatus}
              disabled={!theme.trim() || isGenerating}
              className="relative w-full py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-3xl disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all text-lg shadow-2xl hover:shadow-blue-500/30 overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <div className="relative flex items-center justify-center gap-3">
                {isGenerating && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                )}
                <span>{isGenerating ? '🔄 Criando com IA...' : '✨ Gerar Status'}</span>
              </div>
            </button>
          </section>

          {/* Botão de download mobile */}
          {generatedContent && (
            <section>
              <button
                onClick={downloadImage}
                className="relative w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold rounded-3xl active:scale-95 transition-all text-base shadow-xl hover:shadow-green-500/30 overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <div className="relative flex items-center justify-center gap-2">
                  <span className="text-lg">📱</span>
                  <span>Baixar Imagem</span>
                </div>
              </button>
            </section>
          )}

          {/* Dicas de uso mobile */}
          <section className="text-center space-y-2 pt-4 border-t border-white/10">
            <div className="text-xs text-white/40">
              Dicas: Deslize ← → para trocar temas • Deslize ↑ para baixar
            </div>

            {/* Debug info mobile */}
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
    </div>
  );
}
