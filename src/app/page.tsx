'use client';

import React, { useState } from 'react';
import { useGeminiService } from '@/services/geminiService';

export default function Home() {
  const [theme, setTheme] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any>(null);

  const generateStatus = async () => {
    if (!theme.trim()) return;
    
    setIsGenerating(true);
    
    try {
      const geminiService = useGeminiService();
      
      const response = await geminiService.generateStatus({
        theme,
        style: 'modern',
        aspectRatio: '9:16',
        includeComplementaryPhrase: false,
      });
      
      setGeneratedContent(response.generatedContent);
    } catch (error) {
      console.error('Erro ao gerar status:', error);
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
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = 360;
    canvas.height = 640;
    
    const gradient = ctx.createLinearGradient(0, 0, 0, 640);
    gradient.addColorStop(0, generatedContent.backgroundColor);
    gradient.addColorStop(1, adjustBrightness(generatedContent.backgroundColor, -20));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 360, 640);
    
    ctx.fillStyle = generatedContent.textColor;
    ctx.font = `bold ${generatedContent.fontSize}px ${generatedContent.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const lines = generatedContent.text.split('\n');
    const lineHeight = generatedContent.fontSize * 1.4;
    const startY = (640 - (lines.length * lineHeight)) / 2 + lineHeight / 2;
    
    lines.forEach((line: string, index: number) => {
      ctx.fillText(line, 180, startY + (index * lineHeight));
    });
    
    const link = document.createElement('a');
    link.download = `status-${theme.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
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

  const quickThemes = ['Motivação', 'Amor', 'Sucesso', 'Paz', 'Fé', 'Gratidão'];

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-sm mx-auto space-y-8">
        
        {/* Header minimalista */}
        <div className="text-center">
          <h1 className="text-3xl font-light text-white mb-1">Status AI</h1>
          <div className="w-12 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mx-auto"></div>
        </div>

        {/* Preview centralizado */}
        <div className="flex justify-center">
          <div className="w-40 aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl">
            <div 
              className="w-full h-full flex items-center justify-center p-3 text-center"
              style={{
                background: generatedContent 
                  ? `linear-gradient(135deg, ${generatedContent.backgroundColor} 0%, ${adjustBrightness(generatedContent.backgroundColor, -15)} 100%)`
                  : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                color: generatedContent?.textColor || '#f39c12',
                fontSize: '11px',
                fontFamily: 'Inter, sans-serif'
              }}
            >
              {isGenerating ? (
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-4 h-4 border border-current/30 border-t-current rounded-full animate-spin"></div>
                  <span className="text-xs opacity-70">Gerando</span>
                </div>
              ) : generatedContent ? (
                <p className="font-medium leading-tight whitespace-pre-line">
                  {generatedContent.text}
                </p>
              ) : (
                <div className="opacity-50">
                  <div className="w-6 h-6 border border-current/30 rounded-full flex items-center justify-center mx-auto mb-2">
                    <div className="w-2 h-2 bg-current/50 rounded-full"></div>
                  </div>
                  <span className="text-xs">Preview</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Input limpo */}
        <div>
          <input
            type="text"
            placeholder="Digite seu tema"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && generateStatus()}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-white/30 transition-colors text-center"
          />
        </div>

        {/* Botão principal */}
        <button
          onClick={generateStatus}
          disabled={!theme.trim() || isGenerating}
          className="w-full py-3 bg-white text-black font-medium rounded-2xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/90 transition-all"
        >
          {isGenerating ? 'Gerando...' : 'Gerar Status'}
        </button>

        {/* Download (só aparece quando tem conteúdo) */}
        {generatedContent && (
          <button
            onClick={downloadImage}
            className="w-full py-2 text-white/60 hover:text-white transition-colors text-sm"
          >
            Baixar Imagem
          </button>
        )}

        {/* Temas rápidos minimalistas */}
        <div className="grid grid-cols-2 gap-2 pt-4">
          {quickThemes.map((category) => (
            <button
              key={category}
              onClick={() => {
                setTheme(category);
                setTimeout(() => generateStatus(), 100);
              }}
              disabled={isGenerating}
              className="py-2 text-white/40 hover:text-white/80 transition-colors disabled:opacity-30 text-sm"
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}