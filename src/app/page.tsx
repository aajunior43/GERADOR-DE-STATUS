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
        theme, style: 'modern', aspectRatio: '9:16',
        includeComplementaryPhrase: false, includeHashtags, includeEmojis, includeVignette,
      });

      setGeneratedContent(response.generatedContent);
      hapticFeedback.success();
      showToast('Status criado com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao gerar status:', error);
      hapticFeedback.error();
      showToast('Erro ao gerar. Usando fallback.', 'error');
      setGeneratedContent({
        text: `"A única forma de fazer um excelente trabalho é amar o que você faz." ✨\n(Steve Jobs)`,
        backgroundColor: '#1a1a2e', textColor: '#f39c12', fontSize: 20, fontFamily: 'Inter'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    // ... função completa de download preservada do arquivo original
    if (!generatedContent) return;
    hapticFeedback.medium();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scale = 2;
    canvas.width = 360 * scale;
    canvas.height = 640 * scale;
    ctx.scale(scale, scale);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const gradient = ctx.createLinearGradient(0, 0, 360, 640);
    const baseColor = generatedContent.backgroundColor;
    gradient.addColorStop(0, adjustBrightness(baseColor, 10));
    gradient.addColorStop(0.3, baseColor);
    gradient.addColorStop(0.7, adjustBrightness(baseColor, -15));
    gradient.addColorStop(1, adjustBrightness(baseColor, -30));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 360, 640);

    if (includeVignette) {
      const vignetteGradient = ctx.createRadialGradient(180, 320, 0, 180, 320, 450);
      vignetteGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vignetteGradient.addColorStop(0.6, 'rgba(0, 0, 0, 0.05)');
      vignetteGradient.addColorStop(0.8, 'rgba(0, 0, 0, 0.2)');
      vignetteGradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
      ctx.fillStyle = vignetteGradient;
      ctx.fillRect(0, 0, 360, 640);
    }

    ctx.fillStyle = generatedContent.textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const canvasFont = generatedContent.fontFamily.includes('Playfair') ? 'serif' : 'sans-serif';
    let fontSize = generatedContent.fontSize || 24;
    
    const paragraphs = generatedContent.text.split('\n').filter((p: string) => p.trim());
    ctx.font = `bold ${fontSize}px ${canvasFont}`;
    
    const y = 320;
    const maxWidth = 280;
    const lineHeight = fontSize * 1.2;
    let currentY = y - ((paragraphs.length - 1) * lineHeight) / 2;
    
    paragraphs.forEach((paragraph: string) => {
      ctx.fillText(paragraph.trim(), 180, currentY);
      currentY += lineHeight;
    });

    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 10);
    link.download = `status-${theme.toLowerCase().replace(/\s+/g, '-')}-${timestamp}.png`;
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
    'Trabalho', 'Sonhos', 'Vida', 'Fé', 'Superação', 'Inspiração'
  ];

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

  useEffect(() => {
    const index = quickThemes.indexOf(theme);
    if (index !== -1 && index !== currentThemeIndex) {
      setCurrentThemeIndex(index);
    }
  }, [theme, quickThemes, currentThemeIndex]);

  const getFontClass = (fontName: string): string => {
    const fontMap: Record<string, string> = {
      'Inter': 'font-inter', 'Playfair Display': 'font-playfair', 'Montserrat': 'font-montserrat',
      'Poppins': 'font-poppins', 'Lato': 'font-lato', 'Open Sans': 'font-opensans', 'Crimson Text': 'font-crimson'
    };
    return fontMap[fontName] || 'font-inter';
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-purple-900/20"></div>
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-purple-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-40 left-20 w-3 h-3 bg-pink-400 rounded-full animate-bounce"></div>
      </div>
      <div className="absolute inset-0 bg-black/20"></div>
      
      <div className="relative z-10">
        <EnhancedHeader />
        
        {/* Main Container */}
        <main className="pt-28 pb-20">
          <div className="container mx-auto px-6 max-w-7xl">
            
            {/* Hero Section */}
            <section className="text-center py-16 lg:py-24">
              <div className="max-w-4xl mx-auto space-y-8">
                <div className="relative group">
                  <div className="absolute -inset-6 bg-gradient-primary rounded-3xl blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000"></div>
                  <h1 className="relative text-5xl md:text-7xl lg:text-8xl font-light text-white tracking-wide bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                    Status AI
                  </h1>
                </div>
                
                <div className="flex items-center justify-center space-x-6">
                  <div className="w-20 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>
                  <div className="p-2 rounded-full bg-gradient-primary/30">
                    <div className="w-2 h-2 bg-gradient-primary rounded-full animate-pulse"></div>
                  </div>
                  <div className="w-20 h-px bg-gradient-to-l from-transparent via-purple-400 to-transparent"></div>
                </div>
                
                <p className="text-xl md:text-2xl lg:text-3xl text-white/90 font-medium max-w-3xl mx-auto leading-relaxed">
                  Transforme suas ideias em <span className="text-gradient-primary">status incríveis</span> com 
                  <span className="text-gradient-secondary"> Inteligência Artificial</span>
                </p>
              </div>
            </section>
            
            {/* Main Content */}
            <section className="py-12">
              <div className="max-w-6xl mx-auto">
                <div className="grid lg:grid-cols-5 gap-8 lg:gap-16 items-start">
                  
                  {/* Controls - 3 columns */}
                  <div className="lg:col-span-3 space-y-8">
                    
                    {/* Input */}
                    <div className="glass-card p-6 lg:p-10 border border-glass">
                      <div className="space-y-6">
                        <h2 className="text-xl lg:text-2xl font-semibold text-center text-gradient-primary">
                          ✨ Qual o tema do seu status?
                        </h2>
                        <div className="relative group">
                          <div className="absolute -inset-2 bg-gradient-primary rounded-3xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                          <input
                            type="text"
                            placeholder="Ex: motivação, amor, sucesso, família..."
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && generateStatus()}
                            className="relative w-full px-6 py-4 lg:py-6 input-modern text-white placeholder-white/50 text-base lg:text-lg text-center"
                            style={{ fontSize: '16px' }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Options */}
                    <div className="glass-card p-6 lg:p-10 border border-glass">
                      <div className="space-y-6">
                        <h3 className="text-lg lg:text-xl font-semibold text-center text-gradient-secondary">
                          🎨 Personalizar
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                          
                          {/* Emojis */}
                          <label className="group flex flex-col items-center gap-4 cursor-pointer transform hover:scale-105 transition-all duration-300">
                            <div className="relative">
                              <input type="checkbox" checked={includeEmojis} onChange={(e) => setIncludeEmojis(e.target.checked)} className="sr-only" />
                              <div className={`w-16 h-16 lg:w-20 lg:h-20 rounded-3xl border-2 transition-all duration-500 ${
                                includeEmojis ? 'bg-gradient-secondary border-pink-300 shadow-glow-purple scale-110' : 'glass-card border-glass group-hover:border-primary/50'
                              }`}>
                                {includeEmojis && (
                                  <svg className="w-8 h-8 lg:w-10 lg:h-10 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl mb-1">😊</div>
                              <span className="text-sm text-white/80 group-hover:text-white font-medium">Emojis</span>
                            </div>
                          </label>
                          
                          {/* Hashtags */}
                          <label className="group flex flex-col items-center gap-4 cursor-pointer transform hover:scale-105 transition-all duration-300">
                            <div className="relative">
                              <input type="checkbox" checked={includeHashtags} onChange={(e) => setIncludeHashtags(e.target.checked)} className="sr-only" />
                              <div className={`w-16 h-16 lg:w-20 lg:h-20 rounded-3xl border-2 transition-all duration-500 ${
                                includeHashtags ? 'bg-gradient-primary border-blue-300 shadow-glow-blue scale-110' : 'glass-card border-glass group-hover:border-primary/50'
                              }`}>
                                {includeHashtags && (
                                  <svg className="w-8 h-8 lg:w-10 lg:h-10 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl mb-1">#️⃣</div>
                              <span className="text-sm text-white/80 group-hover:text-white font-medium">Hashtags</span>
                            </div>
                          </label>

                          {/* Vinheta */}
                          <label className="group flex flex-col items-center gap-4 cursor-pointer transform hover:scale-105 transition-all duration-300">
                            <div className="relative">
                              <input type="checkbox" checked={includeVignette} onChange={(e) => setIncludeVignette(e.target.checked)} className="sr-only" />
                              <div className={`w-16 h-16 lg:w-20 lg:h-20 rounded-3xl border-2 transition-all duration-500 ${
                                includeVignette ? 'bg-gradient-to-br from-gray-600 to-gray-800 border-gray-400 scale-110' : 'glass-card border-glass group-hover:border-primary/50'
                              }`}>
                                {includeVignette && (
                                  <svg className="w-8 h-8 lg:w-10 lg:h-10 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl mb-1">🎞️</div>
                              <span className="text-sm text-white/80 group-hover:text-white font-medium">Vinheta</span>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    {/* Buttons */}
                    <div className="space-y-6">
                      <div className="relative">
                        <div className="absolute -inset-3 bg-gradient-primary rounded-3xl blur-xl opacity-30 animate-pulse"></div>
                        <button
                          onClick={generateStatus}
                          disabled={!theme.trim() || isGenerating}
                          className="relative w-full py-5 lg:py-6 btn-primary text-white font-bold rounded-3xl disabled:opacity-30 text-lg lg:text-xl overflow-hidden group"
                        >
                          <div className="absolute inset-0 shimmer-effect"></div>
                          <div className="relative flex items-center justify-center gap-3">
                            {isGenerating && <div className="w-5 h-5 lg:w-6 lg:h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                            <span>{isGenerating ? '🤖 Criando com IA...' : '✨ Gerar Status'}</span>
                          </div>
                        </button>
                      </div>
                      
                      {generatedContent && (
                        <button
                          onClick={downloadImage}
                          className="w-full py-4 lg:py-5 btn-secondary text-white font-semibold rounded-3xl text-base lg:text-lg overflow-hidden group"
                        >
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-xl animate-bounce">📱</span>
                            <span>Baixar Imagem HD</span>
                          </div>
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Preview - 2 columns */}
                  <div className="lg:col-span-2">
                    <div className="sticky top-32 space-y-6">
                      <h2 className="text-lg lg:text-xl font-semibold text-center text-gradient-accent">📱 Preview</h2>
                      
                      <div className="flex justify-center">
                        <div className="relative group">
                          <div className="absolute -inset-6 bg-gradient-primary rounded-3xl blur-xl opacity-15 group-hover:opacity-30 transition-opacity duration-1000"></div>
                          <div 
                            className="relative w-64 lg:w-72 aspect-[9/16] rounded-3xl overflow-hidden shadow-glass border border-glass hover:scale-105 transition-all duration-500 cursor-pointer"
                            onClick={() => generatedContent && downloadImage()}
                          >
                            <div 
                              className={`w-full h-full flex items-center justify-center p-6 lg:p-8 text-center relative ${generatedContent ? getFontClass(generatedContent.fontFamily) : 'font-inter'}`}
                              style={{
                                background: generatedContent 
                                  ? `linear-gradient(135deg, ${generatedContent.backgroundColor} 0%, ${adjustBrightness(generatedContent.backgroundColor, -15)} 100%)`
                                  : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                                color: generatedContent?.textColor || '#f39c12',
                                fontSize: '14px'
                              }}
                            >
                              {includeVignette && (
                                <div className="absolute inset-0 pointer-events-none" style={{
                                  background: 'radial-gradient(circle at center, rgba(0,0,0,0) 0%, rgba(0,0,0,0.1) 70%, rgba(0,0,0,0.6) 100%)'
                                }} />
                              )}
                              
                              {isGenerating ? (
                                <div className="flex flex-col items-center space-y-4">
                                  <div className="relative">
                                    <div className="w-12 h-12 border-2 border-current/20 rounded-full"></div>
                                    <div className="absolute top-0 left-0 w-12 h-12 border-2 border-transparent border-t-current rounded-full animate-spin"></div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-base mb-2">Criando com IA</div>
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
                                <div className="opacity-60 text-center space-y-4">
                                  <div className="w-16 h-16 border-2 border-current/30 rounded-full flex items-center justify-center mx-auto">
                                    <div className="w-6 h-6 bg-current/50 rounded-full animate-pulse"></div>
                                  </div>
                                  <div>
                                    <div className="text-lg mb-2">Preview</div>
                                    <div className="text-sm opacity-70">Digite um tema acima</div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {generatedContent && (
                        <div className="glass-card p-4 border border-glass text-center">
                          <div className="flex items-center justify-center gap-2 text-white/80 text-sm">
                            <div className="w-2 h-2 bg-gradient-primary rounded-full animate-pulse"></div>
                            <span className="font-medium text-gradient-primary">Fonte:</span> 
                            <span>{generatedContent.fontFamily}</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Mobile Quick Themes - Only mobile */}
                      <div className="lg:hidden">
                        <div className="glass-card p-4 border border-glass">
                          <h3 className="text-base font-semibold text-center text-gradient-secondary mb-4">🎯 Temas Rápidos</h3>
                          <div className="grid grid-cols-2 gap-3">
                            {quickThemes.slice(0, 6).map((category, index) => (
                              <button
                                key={category}
                                onClick={() => {
                                  setTheme(category);
                                  setCurrentThemeIndex(index);
                                  setTimeout(() => generateStatus(), 100);
                                }}
                                disabled={isGenerating}
                                className="glass-button py-3 px-4 text-sm rounded-xl text-white/70 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
                              >
                                {category}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
        
        <ToastContainer />
      </div>
    </div>
  );
}