'use client';

import React, { useState, useEffect } from 'react';

export default function DiagnosticoPage() {
  const [results, setResults] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [phone, setPhone] = useState('5511999999999');
  const [message, setMessage] = useState('Teste de conexão');

  const runDiagnostic = async () => {
    setIsLoading(true);
    setResults({});

    try {
      // 1. Testar API diretamente
      console.log('🔍 Testando API WhatsApp...');
      const apiTest = await fetch('/api/test-api');
      const apiData = await apiTest.json();
      
      setResults(prev => ({
        ...prev,
        api_test: {
          status: apiTest.ok ? 'success' : 'error',
          data: apiData
        }
      }));

      // 2. Testar webhook localmente
      console.log('🔍 Testando webhook...');
      const webhookTest = await fetch('/api/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, message })
      });
      const webhookData = await webhookTest.json();
      
      setResults(prev => ({
        ...prev,
        webhook_test: {
          status: webhookTest.ok ? 'success' : 'error',
          data: webhookData
        }
      }));

      // 3. Testar debug WhatsApp
      console.log('🔍 Testando debug WhatsApp...');
      const debugTest = await fetch('/api/debug-whatsapp');
      const debugData = await debugTest.json();
      
      setResults(prev => ({
        ...prev,
        debug_test: {
          status: debugTest.ok ? 'success' : 'error',
          data: debugData
        }
      }));

      // 4. Testar envio direto
      console.log('🔍 Testando envio direto...');
      const sendTest = await fetch('/api/test-api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, message: `Teste direto: ${message}` })
      });
      const sendData = await sendTest.json();
      
      setResults(prev => ({
        ...prev,
        send_test: {
          status: sendTest.ok ? 'success' : 'error',
          data: sendData
        }
      }));

    } catch (error) {
      console.error('Erro no diagnóstico:', error);
      setResults(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            🔧 Diagnóstico WhatsApp
          </h1>

          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">
              Informações Importantes
            </h2>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>API URL:</strong> https://api-whatsapp.api-alisson.com.br/api/v1</li>
              <li>• <strong>Token:</strong> 4h8g8JO7vtQbXSvJW61WtdAemw6PaQ5m</li>
              <li>• <strong>Webhook URL:</strong> {typeof window !== 'undefined' ? window.location.origin : ''}/api/webhook</li>
              <li>• <strong>Status:</strong> {typeof window !== 'undefined' ? 'Rodando localmente' : 'Servidor'}</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de teste
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mensagem de teste
              </label>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            onClick={runDiagnostic}
            disabled={isLoading}
            className="w-full px-4 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 mb-6"
          >
            {isLoading ? '🔍 Executando diagnóstico...' : '🚀 Executar Diagnóstico Completo'}
          </button>

          {Object.keys(results).length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">Resultados:</h2>
              
              {results.api_test && (
                <div className={`p-4 rounded-lg ${getStatusColor(results.api_test.status)}`}>
                  <h3 className="font-semibold mb-2">1. Teste da API WhatsApp</h3>
                  <pre className="text-xs overflow-x-auto">
                    {JSON.stringify(results.api_test.data, null, 2)}
                  </pre>
                </div>
              )}

              {results.webhook_test && (
                <div className={`p-4 rounded-lg ${getStatusColor(results.webhook_test.status)}`}>
                  <h3 className="font-semibold mb-2">2. Teste do Webhook</h3>
                  <pre className="text-xs overflow-x-auto">
                    {JSON.stringify(results.webhook_test.data, null, 2)}
                  </pre>
                </div>
              )}

              {results.debug_test && (
                <div className={`p-4 rounded-lg ${getStatusColor(results.debug_test.status)}`}>
                  <h3 className="font-semibold mb-2">3. Debug WhatsApp</h3>
                  <pre className="text-xs overflow-x-auto">
                    {JSON.stringify(results.debug_test.data, null, 2)}
                  </pre>
                </div>
              )}

              {results.send_test && (
                <div className={`p-4 rounded-lg ${getStatusColor(results.send_test.status)}`}>
                  <h3 className="font-semibold mb-2">4. Teste de Envio Direto</h3>
                  <pre className="text-xs overflow-x-auto">
                    {JSON.stringify(results.send_test.data, null, 2)}
                  </pre>
                </div>
              )}

              {results.error && (
                <div className="p-4 rounded-lg text-red-600 bg-red-50">
                  <h3 className="font-semibold mb-2">❌ Erro</h3>
                  <p>{results.error}</p>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              ⚠️ Para funcionar com WhatsApp real:
            </h3>
            <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
              <li>O projeto precisa estar em produção (HTTPS)</li>
              <li>Configure o webhook na API WhatsApp com a URL: <code>https://seu-dominio.com/api/webhook</code></li>
              <li>Certifique-se de que o WhatsApp está conectado na API</li>
              <li>Teste enviando mensagem para o número conectado</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}