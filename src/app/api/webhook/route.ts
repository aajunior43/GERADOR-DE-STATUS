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

    // Tratar toda mensagem como tema para gerar status
    const theme = message.trim();
    
    console.log('🎯 Gerando status para tema:', theme, 'para número:', formattedPhone);
    
    // Enviar mensagem de processamento
    console.log('📤 Enviando mensagem de processamento...');
    const processingMessageSent = await whatsappService.sendTextMessage(formattedPhone, '🎨 Gerando seu status personalizado... Aguarde um momento!');
    console.log('📤 Mensagem de processamento enviada:', processingMessageSent);

    try {
      // Gerar conteúdo com IA usando o tema recebido
      console.log('🤖 Iniciando geração de status com IA...');
      const statusResponse = await geminiService.generateStatus({
        theme: theme,
        style: 'modern',
        includeEmojis: true,
        includeHashtags: false,
        includeVignette: false
      });

      const { generatedContent, imageUrl } = statusResponse;
      console.log('✅ Status gerado com sucesso:', { 
        text: generatedContent.text.substring(0, 50) + '...', 
        imageUrl: imageUrl.substring(0, 50) + '...' 
      });

      // Preparar mensagem com o status gerado
      const caption = `✨ *Status Personalizado*\n\n${generatedContent.text}\n\n🎯 Tema: ${theme}\n🤖 Criado por IA`;

      // Tentar enviar imagem com legenda
      console.log('📤 Enviando imagem do status...');
      const imageSent = await whatsappService.sendImageMessage(formattedPhone, imageUrl, caption);

      if (imageSent) {
        console.log('✅ Imagem enviada com sucesso para:', formattedPhone);
      } else {
        // Fallback: enviar apenas o texto se a imagem falhar
        console.log('⚠️ Falha no envio da imagem, enviando apenas texto...');
        const textMessage = `✨ *Status Personalizado*\n\n${generatedContent.text}\n\n🎯 Tema: ${theme}\n🤖 Criado por IA\n\n💡 _A imagem não pôde ser enviada, mas aqui está seu status!_`;
        await whatsappService.sendTextMessage(formattedPhone, textMessage);
      }

      console.log('🎉 Status enviado com sucesso para:', formattedPhone);
      return NextResponse.json({ 
        success: true, 
        theme: theme,
        phone: formattedPhone,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Erro ao gerar status:', error);
      
      // Enviar mensagem de erro amigável
      const errorMessage = `❌ Ops! Não consegui gerar um status para "${theme}" no momento.

🔄 Tente novamente com:
• Um tema mais específico
• Palavras simples como: amor, motivação, sucesso, paz
• Aguarde alguns segundos e tente novamente

🤖 Estou aqui para ajudar!`;

      await whatsappService.sendTextMessage(formattedPhone, errorMessage);
      return NextResponse.json({ 
        success: false, 
        error: 'Erro na geração',
        theme: theme,
        phone: formattedPhone,
        timestamp: new Date().toISOString()
      }, { status: 500 });
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
