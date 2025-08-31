import { NextRequest, NextResponse } from 'next/server';
import { whatsappService } from '@/services/whatsappService';

export async function GET() {
  try {
    console.log('🔍 Verificando status da API WhatsApp...');
    
    const isConnected = await whatsappService.checkConnection();
    
    return NextResponse.json({
      status: 'success',
      whatsapp_connected: isConnected,
      api_url: 'https://api-whatsapp.api-alisson.com.br/api/v1',
      webhook_url: '/api/webhook',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Erro ao verificar API WhatsApp:', error);
    
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      whatsapp_connected: false,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { phone, message } = await request.json();
    
    if (!phone || !message) {
      return NextResponse.json({
        error: 'Phone and message are required'
      }, { status: 400 });
    }

    console.log('📤 Enviando mensagem de teste:', { phone, message });
    
    const success = await whatsappService.sendTextMessage(phone, message);
    
    return NextResponse.json({
      status: success ? 'success' : 'failed',
      phone,
      message,
      sent: success,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Erro ao enviar mensagem:', error);
    
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}