import { NextRequest, NextResponse } from 'next/server';
import { whatsappService } from '@/services/whatsappService';

export async function GET(request: NextRequest) {
  try {
    // Testar conexão com WhatsApp
    const isConnected = await whatsappService.checkConnection();
    
    // Testar validação de telefone
    const testPhones = [
      '11999999999',
      '5511999999999',
      '+5511999999999',
      'invalid'
    ];
    
    const phoneValidation = testPhones.map(phone => ({
      phone,
      isValid: whatsappService.validatePhone(phone),
      formatted: whatsappService.formatPhone(phone)
    }));

    return NextResponse.json({
      success: true,
      whatsapp: {
        connected: isConnected,
        baseUrl: 'https://api-whatsapp.api-alisson.com.br/api/v1',
        webhookUrl: `${request.nextUrl.origin}/api/webhook`
      },
      phoneValidation,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, message } = body;

    if (!phone || !message) {
      return NextResponse.json({
        success: false,
        error: 'Telefone e mensagem são obrigatórios'
      }, { status: 400 });
    }

    // Validar telefone
    if (!whatsappService.validatePhone(phone)) {
      return NextResponse.json({
        success: false,
        error: 'Número de telefone inválido'
      }, { status: 400 });
    }

    const formattedPhone = whatsappService.formatPhone(phone);
    
    // Enviar mensagem de teste
    const success = await whatsappService.sendTextMessage(formattedPhone, message);

    return NextResponse.json({
      success,
      phone: formattedPhone,
      message,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
