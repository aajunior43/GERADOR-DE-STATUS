'use client';

import React, { useState, useEffect } from 'react';
import { whatsappService } from '@/services/whatsappService';

export default function WhatsAppInterface() {
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setIsLoading(true);
    try {
      const connected = await whatsappService.checkConnection();
      setIsConnected(connected);
      setStatus(connected ? '✅ Conectado' : '❌ Desconectado');
    } catch (error) {
      setStatus('❌ Erro ao verificar conexão');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!phone.trim() || !message.trim()) {
      setStatus('❌ Preencha o telefone e a mensagem');
      return;
    }

    if (!whatsappService.validatePhone(phone)) {
      setStatus('❌ Número de telefone inválido');
      return;
    }

    setIsLoading(true);
    setStatus('📤 Enviando mensagem...');

    try {
      const formattedPhone = whatsappService.formatPhone(phone);
      const success = await whatsappService.sendTextMessage(formattedPhone, message);
      
      if (success) {
        setStatus('✅ Mensagem enviada com sucesso!');
        setMessage('');
      } else {
        setStatus('❌ Erro ao enviar mensagem');
      }
    } catch (error) {
      setStatus('❌ Erro ao enviar mensagem');
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestMessage = async () => {
    setMessage('motivação');
    setPhone('5511999999999'); // Número de teste
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">WhatsApp Integration</h2>
        <p className="text-gray-600">Teste a integração com WhatsApp</p>
      </div>

      {/* Status da conexão */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Status da conexão:</span>
          <span className={`text-sm font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
            {status}
          </span>
        </div>
        <button
          onClick={checkConnection}
          disabled={isLoading}
          className="mt-2 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Verificando...' : 'Verificar conexão'}
        </button>
      </div>

      {/* Formulário de envio */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número de telefone
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Ex: 11999999999"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mensagem
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Digite sua mensagem ou tema para gerar status"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex space-x-2">
          <button
            onClick={sendMessage}
            disabled={isLoading || !phone.trim() || !message.trim()}
            className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Enviando...' : 'Enviar mensagem'}
          </button>
          
          <button
            onClick={sendTestMessage}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50"
          >
            Teste
          </button>
        </div>
      </div>

      {/* Informações do webhook */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Webhook URL</h3>
        <p className="text-xs text-blue-600 mb-2">
          Configure esta URL no painel da API WhatsApp:
        </p>
        <code className="block text-xs bg-blue-100 p-2 rounded text-blue-800 break-all">
          {typeof window !== 'undefined' ? `${window.location.origin}/api/webhook` : '/api/webhook'}
        </code>
      </div>

      {/* Instruções */}
      <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
        <h3 className="text-sm font-medium text-yellow-800 mb-2">Como usar:</h3>
        <ul className="text-xs text-yellow-700 space-y-1">
          <li>• <strong>Envie qualquer tema</strong> e receba um status personalizado automaticamente</li>
          <li>• Exemplos: motivação, amor, sucesso, fé, paz, família, trabalho, felicidade</li>
          <li>• O bot gerará uma imagem com texto personalizado baseado no tema</li>
          <li>• Funciona com qualquer palavra, frase ou conceito como tema</li>
          <li>• Resposta automática em segundos!</li>
        </ul>
      </div>
    </div>
  );
}
