import { NextRequest, NextResponse } from 'next/server';
import { whatsappService } from '@/services/whatsappService';
import { geminiService } from '@/services/geminiService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('🚀 Webhook recebido:', JSON.stringify(body, null, 2));

    // Processar webhook
    const webhookData = whatsappService.processWebhook(body);
    
    if (!webhookData) {
      console.error('❌ Falha ao processar webhook - dados inválidos');
      return NextResponse.json({ 
        error: 'Dados inválidos', 
        received: body,
        expected: 'Objeto com phone/from/number e message/body/text/content'
      }, { status: 400 });
    }

    const { phone, message } = webhookData;

    // Validar número de telefone
    if (!whatsappService.validatePhone(phone)) {
      console.log('Número de telefone inválido:', phone);
      return NextResponse.json({ error: 'Número inválido' }, { status: 400 });
    }

    const formattedPhone = whatsappService.formatPhone(phone);

    // Verificar se é um comando válido
    const command = message.toLowerCase().trim();
    
    if (command === 'ajuda' || command === 'help') {
      const helpMessage = `🤖 *Gerador de Status AI*

Para gerar um status, envie o tema desejado. Exemplos:

• *motivação* - Status motivacional
• *amor* - Status romântico  
• *sucesso* - Status de sucesso
• *fé* - Status religioso
• *paz* - Status de paz
• *família* - Status familiar
• *trabalho* - Status profissional

*Comandos especiais:*
• *ajuda* - Mostra esta mensagem
• *status* - Verifica se estou online

Envie qualquer tema e eu criarei um status personalizado para você! ✨`;

      await whatsappService.sendTextMessage(formattedPhone, helpMessage);
      return NextResponse.json({ success: true });
    }

    if (command === 'status') {
      const isConnected = await whatsappService.checkConnection();
      const statusMessage = isConnected 
        ? '✅ Estou online e funcionando perfeitamente! Envie um tema para gerar seu status.' 
        : '❌ Estou offline no momento. Tente novamente em alguns minutos.';
      
      await whatsappService.sendTextMessage(formattedPhone, statusMessage);
      return NextResponse.json({ success: true });
    }

    // Gerar status com IA
    console.log('🎯 Gerando status para tema:', message, 'para número:', formattedPhone);
    
    // Enviar mensagem de processamento
    console.log('📤 Enviando mensagem de processamento...');
    const processingMessageSent = await whatsappService.sendTextMessage(formattedPhone, '🎨 Gerando seu status personalizado... Aguarde um momento!');
    console.log('📤 Mensagem de processamento enviada:', processingMessageSent);

    try {
      // Gerar conteúdo com IA
      const statusResponse = await geminiService.generateStatus({
        theme: message,
        style: 'modern',
        includeEmojis: true,
        includeHashtags: false,
        includeVignette: false
      });

      const { generatedContent, imageUrl } = statusResponse;

      // Enviar imagem do status
      const caption = `✨ *Status Gerado*\n\n${generatedContent.text}\n\n🎯 Tema: ${message}\n🤖 Gerado por IA`;

      const imageSent = await whatsappService.sendImageMessage(formattedPhone, imageUrl, caption);

      if (!imageSent) {
        // Fallback: enviar apenas o texto
        const textMessage = `✨ *Status Gerado*\n\n${generatedContent.text}\n\n🎯 Tema: ${message}\n🤖 Gerado por IA`;
        await whatsappService.sendTextMessage(formattedPhone, textMessage);
      }

      console.log('Status enviado com sucesso para:', formattedPhone);
      return NextResponse.json({ success: true });

    } catch (error) {
      console.error('Erro ao gerar status:', error);
      
      // Enviar mensagem de erro amigável
      const errorMessage = `❌ Desculpe, não consegui gerar um status para "${message}" no momento. 

Tente com outro tema ou envie "ajuda" para ver exemplos de temas disponíveis.`;

      await whatsappService.sendTextMessage(formattedPhone, errorMessage);
      return NextResponse.json({ success: false, error: 'Erro na geração' }, { status: 500 });
    }

  } catch (error) {
    console.error('Erro no webhook:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Webhook endpoint ativo',
    timestamp: new Date().toISOString()
  });
}
