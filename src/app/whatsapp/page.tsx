import WhatsAppInterface from '@/components/WhatsAppInterface';

export default function WhatsAppPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            WhatsApp Integration
          </h1>
          <p className="text-gray-600">
            Teste a integração com WhatsApp e gere status via mensagens
          </p>
        </div>
        
        <WhatsAppInterface />
        
        <div className="mt-8 max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Como funciona
            </h2>
            <div className="space-y-4 text-gray-600">
              <div>
                <h3 className="font-semibold text-gray-800">1. Configuração</h3>
                <p className="text-sm">
                  Configure o webhook URL no painel da API WhatsApp para receber mensagens automaticamente.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800">2. Envio do tema</h3>
                <p className="text-sm">
                  Qualquer mensagem enviada será tratada como um tema para gerar status (ex: "amor", "motivação", "sucesso").
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800">3. Geração automática</h3>
                <p className="text-sm">
                  A IA processa o tema e gera automaticamente um status personalizado com imagem e texto.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800">4. Resposta instantânea</h3>
                <p className="text-sm">
                  O status é enviado de volta automaticamente como imagem com legenda para o mesmo número.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
