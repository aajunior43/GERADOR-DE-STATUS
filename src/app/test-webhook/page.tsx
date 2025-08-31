'use client';

import React, { useState } from 'react';

export default function TestWebhookPage() {
  const [phone, setPhone] = useState('5511999999999');
  const [message, setMessage] = useState('motivação');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const testWebhook = async () => {
    setIsLoading(true);
    setResponse('Enviando...');

    try {
      // Testar diferentes formatos de webhook
      const testFormats = [
        // Formato 1: phone/message
        { phone, message },
        // Formato 2: from/body
        { from: phone, body: message },
        // Formato 3: number/text
        { number: phone, text: message },
        // Formato 4: sender/content
        { sender: phone, content: message },
        // Formato 5: data aninhada
        { data: { phone, message } },
        // Formato 6: webhook_data
        { webhook_data: { phone, message } }
      ];

      for (let i = 0; i < testFormats.length; i++) {
        const format = testFormats[i];
        console.log(`Testando formato ${i + 1}:`, format);

        const response = await fetch('/api/webhook', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(format),
        });

        const result = await response.json();
        
        if (response.ok) {
          setResponse(`✅ Sucesso com formato ${i + 1}!\n${JSON.stringify(result, null, 2)}`);
          break;
        } else {
          console.log(`Formato ${i + 1} falhou:`, result);
          if (i === testFormats.length - 1) {
            setResponse(`❌ Todos os formatos falharam. Último erro:\n${JSON.stringify(result, null, 2)}`);
          }
        }
      }
    } catch (error) {
      setResponse(`❌ Erro: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testDirectAPI = async () => {
    setIsLoading(true);
    setResponse('Testando API direta...');

    try {
      const response = await fetch('/api/webhook', {
        method: 'GET',
      });

      const result = await response.json();
      setResponse(`✅ API está ativa:\n${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      setResponse(`❌ Erro na API: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Teste do Webhook WhatsApp
          </h1>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de telefone
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
                Mensagem/Tema
              </label>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex space-x-4 mb-6">
            <button
              onClick={testWebhook}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {isLoading ? 'Testando...' : 'Testar Webhook'}
            </button>

            <button
              onClick={testDirectAPI}
              disabled={isLoading}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
            >
              Testar API
            </button>
          </div>

          {response && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-800 mb-2">Resposta:</h3>
              <pre className="text-xs text-gray-600 whitespace-pre-wrap overflow-x-auto">
                {response}
              </pre>
            </div>
          )}

          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">Instruções:</h3>
            <ul className="text-xs text-yellow-700 space-y-1">
              <li>• Este teste simula diferentes formatos de webhook</li>
              <li>• Verifique o console do navegador para logs detalhados</li>
              <li>• Configure a URL do webhook na API: <code>/api/webhook</code></li>
              <li>• Certifique-se de que o projeto está rodando em produção para receber webhooks externos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}