import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = 'https://api-whatsapp.api-alisson.com.br/api/v1';
  const token = '4n8g8JO7vtQbXSvJW61WtdAemw6PaQ5m';
  const uuid = '5d8b1d72-8b27-4910-990a-701a0be2b9d5';

  try {
    console.log('🔍 Testando conexão com API WhatsApp...');
    
    // Testar status da API
    const statusResponse = await fetch(`${baseUrl}/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token: token,
        uuid: uuid
      })
    });

    console.log('📡 Status da resposta:', statusResponse.status);
    
    let statusData = null;
    try {
      statusData = await statusResponse.json();
      console.log('📊 Dados do status:', statusData);
    } catch (e) {
      console.log('❌ Erro ao parsear JSON do status');
    }

    // Testar envio de mensagem para um número de teste
    const testPhone = '5511999999999'; // Número de teste
    const testMessage = '🤖 Teste de conexão da API - ' + new Date().toLocaleTimeString();
    
    console.log('📤 Testando envio de mensagem...');
    
    const sendResponse = await fetch(`${baseUrl}/send-text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token: token,
        uuid: uuid,
        number: testPhone,
        content: testMessage,
        delay: 2500
      })
    });

    console.log('📤 Status do envio:', sendResponse.status);
    
    let sendData = null;
    try {
      sendData = await sendResponse.json();
      console.log('📤 Dados do envio:', sendData);
    } catch (e) {
      console.log('❌ Erro ao parsear JSON do envio');
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      api_url: baseUrl,
      token_length: token.length,
      uuid: uuid,
      status_check: {
        status_code: statusResponse.status,
        status_ok: statusResponse.ok,
        data: statusData
      },
      send_test: {
        status_code: sendResponse.status,
        status_ok: sendResponse.ok,
        test_phone: testPhone,
        test_message: testMessage,
        data: sendData
      }
    });

  } catch (error) {
    console.error('❌ Erro ao testar API:', error);
    
    return NextResponse.json({
      error: 'Erro ao testar API',
      message: error instanceof Error ? error.message : 'Erro desconhecido',
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

    const baseUrl = 'https://api-whatsapp.api-alisson.com.br/api/v1';
    const token = '4n8g8JO7vtQbXSvJW61WtdAemw6PaQ5m';
    const uuid = '5d8b1d72-8b27-4910-990a-701a0be2b9d5';

    console.log('📤 Enviando mensagem personalizada:', { phone, message });
    
    const response = await fetch(`${baseUrl}/send-text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token: token,
        uuid: uuid,
        number: phone,
        content: message,
        delay: 2500
      })
    });

    const responseData = await response.json();
    
    return NextResponse.json({
      success: response.ok,
      status_code: response.status,
      phone,
      message,
      response_data: responseData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao enviar mensagem:', error);
    
    return NextResponse.json({
      error: 'Erro ao enviar mensagem',
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}