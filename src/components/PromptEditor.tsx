'use client';

import React, { useState, useEffect } from 'react';
import { promptConfig, PromptConfig } from '@/config/prompts';

interface PromptEditorProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PromptEditor({ isOpen, onClose }: PromptEditorProps) {
  const [config, setConfig] = useState<PromptConfig>(promptConfig);
  const [activeTab, setActiveTab] = useState<'base' | 'sources' | 'colors' | 'examples'>('base');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Carregar configuração salva do localStorage
    const saved = localStorage.getItem('statusai_custom_prompts');
    if (saved) {
      try {
        setConfig(JSON.parse(saved));
      } catch (error) {
        console.warn('Erro ao carregar prompts personalizados:', error);
      }
    }
  }, []);

  const handleSave = () => {
    try {
      localStorage.setItem('statusai_custom_prompts', JSON.stringify(config));
      setHasChanges(false);
      alert('Prompts salvos com sucesso! Reinicie a aplicação para aplicar as mudanças.');
    } catch (error) {
      alert('Erro ao salvar prompts: ' + error);
    }
  };

  const handleReset = () => {
    if (confirm('Tem certeza que deseja resetar para os prompts padrão?')) {
      setConfig(promptConfig);
      localStorage.removeItem('statusai_custom_prompts');
      setHasChanges(true);
    }
  };

  const updateConfig = (path: string, value: string) => {
    const newConfig = { ...config };
    const keys = path.split('.');
    let current: any = newConfig;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    setConfig(newConfig);
    setHasChanges(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Editor de Prompts</h2>
          <div className="flex gap-3">
            {hasChanges && (
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Salvar
              </button>
            )}
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          {[
            { key: 'base', label: 'Prompt Base' },
            { key: 'sources', label: 'Fontes' },
            { key: 'colors', label: 'Cores' },
            { key: 'examples', label: 'Exemplos' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === tab.key
                  ? 'text-white border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'base' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Prompt Principal</h3>
              <textarea
                value={config.basePrompt}
                onChange={(e) => updateConfig('basePrompt', e.target.value)}
                className="w-full h-64 p-4 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none font-mono text-sm"
                placeholder="Digite o prompt base..."
              />
              <p className="text-gray-400 text-sm">
                Variáveis disponíveis: {'{theme}'}, {'{sourceInstruction}'}, {'{emojiInstruction}'}, {'{hashtagInstruction}'}
              </p>
            </div>
          )}

          {activeTab === 'sources' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white mb-4">Instruções por Fonte</h3>
              
              {Object.entries(config.sourceInstructions).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <label className="block text-white font-medium capitalize">{key}</label>
                  <textarea
                    value={value}
                    onChange={(e) => updateConfig(`sourceInstructions.${key}`, e.target.value)}
                    className="w-full h-32 p-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
                  />
                </div>
              ))}
            </div>
          )}

          {activeTab === 'colors' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Paleta de Cores</h3>
              <textarea
                value={config.colorPalettes}
                onChange={(e) => updateConfig('colorPalettes', e.target.value)}
                className="w-full h-64 p-4 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none font-mono text-sm"
                placeholder="Digite as configurações de cores..."
              />
            </div>
          )}

          {activeTab === 'examples' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Exemplos</h3>
              <textarea
                value={config.examples}
                onChange={(e) => updateConfig('examples', e.target.value)}
                className="w-full h-64 p-4 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none font-mono text-sm"
                placeholder="Digite os exemplos..."
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 bg-gray-800/50">
          <div className="flex items-center justify-between">
            <p className="text-gray-400 text-sm">
              💡 Dica: Edite os arquivos em <code className="bg-gray-700 px-2 py-1 rounded">src/config/</code> para mudanças permanentes
            </p>
            {hasChanges && (
              <span className="text-yellow-400 text-sm">● Alterações não salvas</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}