'use client';

import React, { useState } from 'react';
import { useGeminiService } from '@/services/geminiService';
import LivePreview from '@/components/LivePreview';

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
      // Fallback com citação famosa
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
    
    // Criar um elemento canvas para gerar a imagem
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Configurar canvas
    canvas.width = 360;
    canvas.height = 640;
    
    // Background com gradiente
    const gradient = ctx.createLinearGradient(0, 0, 0, 640);
    gradient.addColorStop(0, generatedContent.backgroundColor);
    gradient.addColorStop(1, adjustBrightness(generatedContent.backgroundColor, -20));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 360, 640);
    
    // Configurar texto
    ctx.fillStyle = generatedContent.textColor;
    ctx.font = `bold ${generatedContent.fontSize}px ${generatedContent.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Processar texto
    const lines = generatedContent.text.split('\n');
    const lineHeight = generatedContent.fontSize * 1.4;
    const startY = (640 - (lines.length * lineHeight)) / 2 + lineHeight / 2;
    
    lines.forEach((line: string, index: number) => {
      ctx.fillText(line, 180, startY + (index * lineHeight));
    });
    
    // Download
    const link = document.createElement('a');
    link.download = `status-${theme.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Função para ajustar brilho
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

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Status AI</h1>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Coluna esquerda - Controles */}
          <div className="w-full md:w-1/2">
            <div className="mb-6">
              <input
                type="text"
                placeholder="Digite seu tema aqui..."
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && generateStatus()}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            
            <div className="flex gap-4 mb-8">
              <button
                onClick={generateStatus}
                disabled={!theme.trim() || isGenerating}
                className="flex-1 py-3 px-6 bg-yellow-500 text-black font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-400 transition-colors"
              >
                {isGenerating ? 'Gerando...' : 'Gerar Status'}
              </button>
              
              {generatedContent && (
                <button
                  onClick={downloadImage}
                  className="py-3 px-6 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Download
                </button>
              )}
            </div>
            
            {/* Categorias predefinidas */}
            <div className="grid grid-cols-4 gap-2">
              {['Motivação', 'Amor', 'Sucesso', 'Foco', 'Gratidão', 'Paz', 'Força', 'Esperança'].map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setTheme(category);
                    setTimeout(() => generateStatus(), 100);
                  }}
                  disabled={isGenerating}
                  className="py-2 px-3 bg-gray-800 border border-gray-600 rounded-lg text-gray-300 hover:text-white hover:border-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          
          {/* Coluna direita - Preview */}
          <div className="w-full md:w-1/2 flex flex-col items-center">
            <div className="w-full max-w-xs">
              <LivePreview theme={theme} generatedContent={generatedContent} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}