'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { GeneratedContent } from '@/services/geminiService';

const ImprovedCreator = () => {
  const [theme, setTheme] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Categorias predefinidas
  const predefinedCategories = [
    { id: 'motivacao', name: 'Motivação', emoji: '💪' },
    { id: 'amor', name: 'Amor', emoji: '❤️' },
    { id: 'sucesso', name: 'Sucesso', emoji: '🏆' },
    { id: 'foco', name: 'Foco', emoji: '🎯' },
    { id: 'gratidao', name: 'Gratidão', emoji: '🙏' },
    { id: 'paz', name: 'Paz', emoji: '🕊️' },
    { id: 'forca', name: 'Força', emoji: '⚡' },
    { id: 'esperanca', name: 'Esperança', emoji: '🌟' },
  ];

  const generateStatus = async () => {
    if (!theme.trim()) return;
    
    setIsGenerating(true);
    
    try {
      const { geminiService } = await import('@/services/geminiService');
      
      const response = await geminiService.generateStatus({
        theme,
        style: 'modern',
        aspectRatio: '9:16',
      });
      
      setGeneratedContent(response.generatedContent);
      
    } catch (error) {
      console.error('Erro ao gerar status:', error);
      // Fallback com conteúdo básico
      const fallbackContent = {
        text: `✨ ${theme.toUpperCase()} ✨

"${theme.charAt(0).toUpperCase() + theme.slice(1)} é a força
que transforma sonhos
em realidade."

VIVA COM PROPÓSITO! 🚀`,
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

  // Função para selecionar uma categoria predefinida
  const selectPredefinedCategory = (categoryName: string) => {
    setTheme(categoryName);
    // Gerar status automaticamente quando uma categoria predefinida é selecionada
    setTimeout(() => {
      generateStatus();
    }, 100);
  };

  const adjustBrightness = useCallback((hex: string, percent: number): string => {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  }, []);

  const drawDecorations = useCallback((ctx: CanvasRenderingContext2D, baseColor: string) => {
    ctx.save();
    
    const decorColor = adjustBrightness(baseColor, 15);
    ctx.fillStyle = decorColor;
    ctx.globalAlpha = 0.1;
    
    // Círculos decorativos
    ctx.beginPath();
    ctx.arc(300, 100, 80, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(60, 540, 60, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }, [adjustBrightness]);

  // Renderizar status no canvas
  useEffect(() => {
    if (!canvasRef.current || !generatedContent) return;

    console.log('Rendering content:', generatedContent);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configurar canvas
    const scale = 2;
    canvas.width = 360 * scale;
    canvas.height = 640 * scale;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    ctx.scale(scale, scale);

    // Limpar canvas
    ctx.clearRect(0, 0, 360, 640);

    // Background com gradiente
    const gradient = ctx.createLinearGradient(0, 0, 0, 640);
    const baseColor = generatedContent.backgroundColor;
    
    const lighterColor = adjustBrightness(baseColor, 20);
    const darkerColor = adjustBrightness(baseColor, -20);
    
    gradient.addColorStop(0, lighterColor);
    gradient.addColorStop(0.5, baseColor);
    gradient.addColorStop(1, darkerColor);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 360, 640);

    // Adicionar decorações
    drawDecorations(ctx, baseColor);

    // Processar e desenhar texto
    const textLines = generatedContent.text.split('\n');
    const processedLines: string[] = [];

    textLines.forEach((line: string) => {
      if (line.trim() === '') {
        processedLines.push('');
        return;
      }

      const words = line.split(' ');
      let currentLine = '';

      ctx.font = `${generatedContent.fontSize}px ${generatedContent.fontFamily}`;

      words.forEach((word: string) => {
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > 320 && currentLine !== '') {
          processedLines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      });
      
      if (currentLine) {
        processedLines.push(currentLine);
      }
    });

    // Configurar e desenhar texto
    ctx.fillStyle = generatedContent.textColor;
    ctx.font = `${generatedContent.fontSize}px ${generatedContent.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Sombra no texto
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    const lineHeight = generatedContent.fontSize * 1.4;
    const totalTextHeight = processedLines.length * lineHeight;
    const startY = (640 - totalTextHeight) / 2 + lineHeight / 2;

    processedLines.forEach((line, index) => {
      if (line.trim() !== '') {
        const x = 180;
        const y = startY + (index * lineHeight);
        ctx.fillText(line, x, y);
      }
    });

    // Remover sombra
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

  }, [generatedContent, drawDecorations, adjustBrightness]);

  // Função para download
  const downloadImage = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = `status-${theme.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = canvasRef.current.toDataURL('image/png', 1.0);
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden hidden md:block">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500 rounded-full opacity-5 blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-yellow-600 rounded-full opacity-10 blur-2xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6 sm:py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-6 md:gap-8 max-w-7xl mx-auto">
          
          {/* Coluna esquerda - Controles */}
          <div className="w-full lg:w-5/12 xl:w-4/12 flex flex-col">
            
            {/* Título */}
            <div className="text-center lg:text-left mb-6 md:mb-8">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 leading-tight">
                <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                  Status AI
                </span>
              </h1>
              <p className="text-gray-300 text-base sm:text-lg md:text-xl leading-relaxed">
                Crie status profissionais instantaneamente
              </p>
            </div>

            {/* Input e botão */}
            <div className="space-y-4 mb-6">
              {/* Input principal */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Digite seu tema aqui..."
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && generateStatus()}
                  className="w-full px-4 sm:px-5 py-3 sm:py-4 text-base sm:text-lg bg-gray-800/50 backdrop-blur-sm border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all duration-300 shadow-lg"
                />
                {theme && (
                  <button
                    onClick={() => setTheme('')}
                    className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors text-lg sm:text-xl"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Botão gerar */}
              <button
                onClick={generateStatus}
                disabled={!theme.trim() || isGenerating}
                className="w-full py-3 sm:py-4 px-4 sm:px-6 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold text-base sm:text-lg rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-yellow-400 hover:to-yellow-500 hover:shadow-lg hover:shadow-yellow-500/25 transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center space-x-2"
              >
                {isGenerating && (
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                )}
                <span>{isGenerating ? 'Gerando...' : 'Gerar Status'}</span>
              </button>
            </div>

            {/* Seção de categorias predefinidas */}
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-3 text-sm sm:text-base flex items-center">
                <span className="mr-2">🏷️</span>
                Escolha uma categoria
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {predefinedCategories.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => selectPredefinedCategory(item.name)}
                    disabled={isGenerating}
                    className="flex flex-col items-center justify-center p-2 sm:p-3 bg-gray-800/50 backdrop-blur-sm border border-gray-600/50 rounded-lg text-gray-300 hover:text-white hover:border-yellow-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-base sm:text-lg mb-1">{item.emoji}</span>
                    <span className="text-xs sm:text-sm">{item.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Informações extras */}
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-gray-700/50 mt-auto">
              <h3 className="text-white font-semibold mb-2 sm:mb-3 text-sm sm:text-base flex items-center">
                <span className="mr-2">✨</span>
                Como funciona
              </h3>
              <ul className="text-gray-300 text-xs sm:text-sm space-y-2">
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-2 mt-1.5 flex-shrink-0"></span>
                  <span>Escolha uma categoria ou digite seu próprio tema</span>
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-2 mt-1.5 flex-shrink-0"></span>
                  <span>A IA cria uma frase única com design automático</span>
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-2 mt-1.5 flex-shrink-0"></span>
                  <span>Baixe e compartilhe nas redes sociais</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Coluna direita - Preview */}
          <div className="w-full lg:w-7/12 xl:w-8/12 flex flex-col items-center">
            <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-none">
              <div className="relative">
                {/* Container do preview com aspect ratio 9:16 */}
                <div className="aspect-[9/16] bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-600/30 shadow-2xl relative mx-auto">
                  <canvas
                    ref={canvasRef}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Loading overlay */}
                  {isGenerating && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-2xl">
                      <div className="text-center">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin mx-auto mb-2 sm:mb-3"></div>
                        <p className="text-gray-300 text-xs sm:text-sm">Criando seu status...</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Empty state */}
                  {!generatedContent && !isGenerating && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center p-4 sm:p-6">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                          <svg className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <p className="text-gray-400 text-xs sm:text-sm">
                          Seu status aparecerá aqui
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Elementos decorativos */}
                <div className="absolute -top-2 -right-2 w-4 h-4 sm:w-5 sm:h-5 bg-yellow-500/20 rounded-full blur-sm hidden sm:block"></div>
                <div className="absolute -bottom-2 -left-2 w-3 h-3 sm:w-4 sm:h-4 bg-yellow-600/30 rounded-full blur-sm hidden sm:block"></div>
              </div>
              
              {/* Texto gerado - responsivo */}
              {generatedContent && (
                <div className="w-full mt-4 sm:mt-5 bg-gray-800/30 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-gray-700/50 hidden md:block">
                  <h3 className="text-white font-semibold mb-2 text-xs sm:text-sm flex items-center">
                    <span className="mr-2">📝</span>
                    Texto Gerado:
                  </h3>
                  <p className="text-gray-300 text-xs leading-relaxed whitespace-pre-line line-clamp-3">
                    {generatedContent.text}
                  </p>
                </div>
              )}

              {/* Botões de ação - responsivo */}
              {generatedContent && (
                <div className="flex flex-wrap gap-2 sm:gap-3 justify-center w-full mt-4 sm:mt-5">
                  <button
                    onClick={generateStatus}
                    disabled={isGenerating}
                    className="px-3 py-2 sm:px-4 sm:py-2.5 bg-gray-800/50 border border-gray-600/50 text-gray-300 hover:text-white hover:border-yellow-500/50 rounded-lg transition-all duration-300 flex items-center space-x-1.5 sm:space-x-2 text-xs sm:text-sm backdrop-blur-sm"
                  >
                    <svg className={`w-3 h-3 sm:w-4 sm:h-4 ${isGenerating ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Nova Variação</span>
                  </button>
                  
                  <button
                    onClick={downloadImage}
                    className="px-3 py-2 sm:px-4 sm:py-2.5 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-400 transition-all duration-300 flex items-center space-x-1.5 sm:space-x-2 text-xs sm:text-sm"
                  >
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Download</span>
                  </button>
                  
                  <button
                    className="px-3 py-2 sm:px-4 sm:py-2.5 bg-gray-800/50 border border-gray-600/50 text-gray-300 hover:text-white hover:border-yellow-500/50 rounded-lg transition-all duration-300 flex items-center space-x-1.5 sm:space-x-2 text-xs sm:text-sm backdrop-blur-sm"
                  >
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684z" />
                    </svg>
                    <span>Compartilhar</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Texto gerado e botões para mobile */}
        {generatedContent && (
          <div className="md:hidden mt-6">
            <div className="w-full bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 mb-4">
              <h3 className="text-white font-semibold mb-2 text-sm flex items-center">
                <span className="mr-2">📝</span>
                Texto Gerado:
              </h3>
              <p className="text-gray-300 text-xs leading-relaxed whitespace-pre-line">
                {generatedContent.text}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2 justify-center w-full">
              <button
                onClick={generateStatus}
                disabled={isGenerating}
                className="px-4 py-2.5 bg-gray-800/50 border border-gray-600/50 text-gray-300 hover:text-white hover:border-yellow-500/50 rounded-lg transition-all duration-300 flex items-center space-x-2 text-sm backdrop-blur-sm"
              >
                <svg className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Nova Variação</span>
              </button>
              
              <button
                onClick={downloadImage}
                className="px-4 py-2.5 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-400 transition-all duration-300 flex items-center space-x-2 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Download</span>
              </button>
              
              <button
                className="px-4 py-2.5 bg-gray-800/50 border border-gray-600/50 text-gray-300 hover:text-white hover:border-yellow-500/50 rounded-lg transition-all duration-300 flex items-center space-x-2 text-sm backdrop-blur-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684z" />
                </svg>
                <span>Compartilhar</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImprovedCreator;