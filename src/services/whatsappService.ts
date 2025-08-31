interface WhatsAppMessage {
  phone: string;
  message: string;
  image?: string;
}

interface WhatsAppWebhook {
  phone: string;
  message: string;
  timestamp: number;
}

class WhatsAppService {
  private baseUrl = 'https://api-whatsapp.api-alisson.com.br/api/v1';
  private token = '4h8g8JO7vtQbXSvJW61WtdAemw6PaQ5m';

  /**
   * Envia uma mensagem de texto via WhatsApp
   */
  async sendTextMessage(phone: string, message: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/send-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({
          phone,
          message
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Mensagem enviada com sucesso:', result);
      return true;
    } catch (error) {
      console.error('Erro ao enviar mensagem WhatsApp:', error);
      return false;
    }
  }

  /**
   * Envia uma imagem via WhatsApp
   */
  async sendImageMessage(phone: string, imageUrl: string, caption?: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/send-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({
          phone,
          image: imageUrl,
          caption: caption || ''
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Imagem enviada com sucesso:', result);
      return true;
    } catch (error) {
      console.error('Erro ao enviar imagem WhatsApp:', error);
      return false;
    }
  }

  /**
   * Verifica se o número está conectado
   */
  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (!response.ok) {
        return false;
      }

      const result = await response.json();
      return result.status === 'connected';
    } catch (error) {
      console.error('Erro ao verificar conexão:', error);
      return false;
    }
  }

  /**
   * Processa webhook recebido
   */
  processWebhook(data: any): WhatsAppWebhook | null {
    try {
      console.log('🔍 Dados recebidos no webhook:', JSON.stringify(data, null, 2));
      
      // Tentar diferentes estruturas possíveis da API
      let phone = '';
      let message = '';
      
      // Estrutura direta
      if (data.phone && data.message) {
        phone = data.phone;
        message = data.message;
      }
      // Estrutura com from/body (comum em APIs WhatsApp)
      else if (data.from && data.body) {
        phone = data.from;
        message = data.body;
      }
      // Estrutura com number/text
      else if (data.number && data.text) {
        phone = data.number;
        message = data.text;
      }
      // Estrutura com sender/content
      else if (data.sender && data.content) {
        phone = data.sender;
        message = data.content;
      }
      // Estrutura aninhada
      else if (data.data && data.data.phone && data.data.message) {
        phone = data.data.phone;
        message = data.data.message;
      }
      // Estrutura com webhook_data
      else if (data.webhook_data) {
        const webhookData = data.webhook_data;
        if (webhookData.phone && webhookData.message) {
          phone = webhookData.phone;
          message = webhookData.message;
        }
      }
      
      if (phone && message) {
        console.log('✅ Webhook processado:', { phone, message });
        return {
          phone: phone.toString(),
          message: message.toString(),
          timestamp: Date.now()
        };
      }
      
      console.warn('❌ Estrutura de webhook não reconhecida:', data);
      return null;
    } catch (error) {
      console.error('Erro ao processar webhook:', error);
      return null;
    }
  }

  /**
   * Valida número de telefone
   */
  validatePhone(phone: string): boolean {
    if (!phone) return false;
    
    // Remove caracteres especiais e valida formato brasileiro
    const cleanPhone = phone.replace(/\D/g, '');
    console.log('📞 Validando telefone:', phone, '-> limpo:', cleanPhone);
    
    // Aceita formatos: 11999999999, 5511999999999, +5511999999999
    const isValid = cleanPhone.length >= 10 && cleanPhone.length <= 15;
    console.log('📞 Telefone válido:', isValid);
    
    return isValid;
  }

  /**
   * Formata número de telefone
   */
  formatPhone(phone: string): string {
    const cleanPhone = phone.replace(/\D/g, '');
    console.log('📞 Formatando telefone:', phone, '-> limpo:', cleanPhone);
    
    let formatted = cleanPhone;
    
    // Se tem 10 dígitos (sem 9), adiciona 9 e código do país
    if (cleanPhone.length === 10) {
      formatted = `559${cleanPhone}`;
    }
    // Se tem 11 dígitos (com 9), adiciona código do país
    else if (cleanPhone.length === 11) {
      formatted = `55${cleanPhone}`;
    }
    // Se tem 12 dígitos e começa com 55, mantém
    else if (cleanPhone.length === 12 && cleanPhone.startsWith('55')) {
      formatted = cleanPhone;
    }
    // Se tem 13 dígitos e começa com 55, mantém
    else if (cleanPhone.length === 13 && cleanPhone.startsWith('55')) {
      formatted = cleanPhone;
    }
    // Se tem 14 dígitos e começa com 1 (pode ser +1 de outro país), mantém
    else if (cleanPhone.length >= 10) {
      formatted = cleanPhone;
    }
    
    console.log('📞 Telefone formatado:', formatted);
    return formatted;
  }
}

export const whatsappService = new WhatsAppService();
export default WhatsAppService;
