'use client';

import React, { useState, useEffect } from 'react';
import { whatsappService } from '@/services/whatsappService';

export default function ConfigWhatsAppPage() {
  const [uuid, setUuid] = useState('');
  const [currentConfig, setCurrentConfig] = useState<any>({});
  const [testPhone, setTestPhone] = useState('5511999999999');
  const [testMessage, setTestMessage] = useState('Teste de configuração');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');

  useEffect(() => {
    // Carregar configuração atual
    const config = whatsappService.getConfig();
    setCurrentConfig(config);
    setUuid(config.uuid);
  }, []);

  const saveConfig = () => {
    if (!uuid.trim()) {
      setResult('❌ UUID é obrigatório');
      return;
    }

    whatsappService.setUuid(uuid.trim());
    const newConfig = whatsappService.getConfig();
    setCurrentConfig(newConfig);
    setResult('✅ Configuração salva com sucesso!');
  };

  const testConnection = async () => {
    setIsLoading(true);
    setResult('🔍 Testando conexão...');

    try {
      const isConnected = await whatsappService.checkConnection();
      setResult(isConnected ? '✅ Conexão OK!' : '❌ Falha na conexão');
    } catch (error) {
      setResult(`❌ Erro: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testSendMessage = async () => {
    if (!testPhone.trim() || !testMessage.trim()) {
      setResult('❌ Preencha telefone e mensagem para teste');
      return;
    }

    setIsLoading(true);
    setResult('📤 Enviando mensagem de teste...');

    try {
      const success = await whatsappService.sendTextMessage(testPhone, testMessage);
      setResult(success ? '✅ Mensagem enviada!' : '❌ Falha no envio');
    } catch (error) {
      setResult(`❌ Erro: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            ⚙️ Configuração WhatsApp API
          </h1>

          {/* Configuração atual */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">
              Configuração Atual
            </h2>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>API URL:</strong> {currentConfig.baseUrl}</p>
              <p><strong>Token:</strong> {currentConfig.token}</p>
              <p><strong>UUID:</strong> {currentConfig.uuid}</p>
            </div>
          </div>

          {/* Configurar UUID */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              UUID da Instância WhatsApp
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={uuid}
                onChange={(e) => setUuid(e.target.value)}
                placeholder="UUID_DA_INSTANCIA"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={saveConfig}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Salvar
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              UUID único da instância responsável por enviar mensagens
            </p>
          </div>

          {/* Teste de conexão */}
          <div className="mb-6">
            <button
              onClick={testConnection}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
            >
              {isLoading ? '🔍 Testando...' : '🔍 Testar Conexão'}
            </button>
          </div>

          {/* Teste de envio */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Teste de Envio
            </h3>
            <div className="space-y-2">
              <input
                type="tel"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="Número de teste"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Mensagem de teste"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={testSendMessage}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50"
              >
                {isLoading ? '📤 Enviando...' : '📤 Enviar Teste'}
              </button>
            </div>
          </div>

          {/* Resultado */}
          {result && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-800 mb-2">Resultado:</h3>
              <p className="text-sm text-gray-600">{result}</p>
            </div>
          )}

          {/* Informações da API */}
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              📋 Formato da API
            </h3>
            <div className="text-sm text-yellow-700 space-y-2">
              <p><strong>Endpoint:</strong> POST /send-text</p>
              <p><strong>Payload:</strong></p>
              <pre className="bg-yellow-100 p-2 rounded text-xs overflow-x-auto">
{`{
  "token": "{{USER_TOKEN}}",
  "uuid": "UUID_DA_INSTANCIA", 
  "number": "5511999999999",
  "content": "Mensagem de *exemplo*\\n👌",
  "delay": 2500
}`}
              </pre>
              <p className="text-xs">
                • <strong>token:</strong> Token de API da sua conta<br/>
                • <strong>uuid:</strong> ID Único da Instância<br/>
                • <strong>number:</strong> Número do WhatsApp (Ex: 5582982000000)<br/>
                • <strong>content:</strong> Conteúdo da mensagem (Limite: 1000 caracteres)<br/>
                • <strong>delay:</strong> Atraso para envio (opcional, padrão: 2500ms)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}