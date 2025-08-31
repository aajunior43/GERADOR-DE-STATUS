# WhatsApp Integration - Gerador de Status AI

Este projeto foi modificado para integrar com WhatsApp, permitindo que usuários enviem temas via mensagem e recebam status personalizados gerados por IA.

## 🚀 Funcionalidades

### Recebimento de Mensagens
- **Webhook automático**: Recebe mensagens via API WhatsApp
- **Processamento inteligente**: Identifica comandos e temas
- **Validação de números**: Verifica formato de telefone brasileiro

### Comandos Disponíveis
- `ajuda` ou `help` - Mostra lista de comandos e exemplos
- `status` - Verifica se o bot está online
- Qualquer tema - Gera status personalizado (ex: motivação, amor, sucesso)

### Geração de Status
- **IA Avançada**: Usa Google Gemini para criar conteúdo único
- **Personalização**: Emojis, cores e fontes baseadas no tema
- **Imagem + Texto**: Envia status como imagem com legenda

## 🔧 Configuração

### 1. API WhatsApp
```typescript
Base URL: https://api-whatsapp.api-alisson.com.br/api/v1
Token: 4h8g8JO7vtQbXSvJW61WtdAemw6PaQ5m
```

### 2. Webhook URL
Configure no painel da API WhatsApp:
```
https://seu-dominio.com/api/webhook
```

### 3. Variáveis de Ambiente
```env
NEXT_PUBLIC_GEMINI_API_KEY=sua_chave_gemini
```

## 📁 Estrutura dos Arquivos

### Serviços
- `src/services/whatsappService.ts` - Integração com API WhatsApp
- `src/services/geminiService.ts` - Geração de conteúdo com IA

### API Routes
- `src/app/api/webhook/route.ts` - Endpoint para receber mensagens

### Componentes
- `src/components/WhatsAppInterface.tsx` - Interface de teste
- `src/app/whatsapp/page.tsx` - Página de teste da integração

## 🎯 Como Usar

### Para Usuários
1. Envie uma mensagem para o WhatsApp conectado
2. Digite um tema (ex: "motivação", "amor", "sucesso")
3. Receba um status personalizado gerado por IA

### Para Desenvolvedores
1. Acesse `/whatsapp` para testar a integração
2. Use a interface para enviar mensagens de teste
3. Verifique logs no console para debug

## 🔄 Fluxo de Funcionamento

1. **Recebimento**: Webhook recebe mensagem do WhatsApp
2. **Validação**: Verifica número e processa comando
3. **Geração**: IA cria status baseado no tema
4. **Resposta**: Envia imagem + texto de volta via WhatsApp

## 🛠️ Desenvolvimento

### Instalar Dependências
```bash
npm install
```

### Executar em Desenvolvimento
```bash
npm run dev
```

### Build para Produção
```bash
npm run build
npm start
```

## 📱 Exemplos de Uso

### Comandos
```
ajuda - Mostra ajuda
status - Verifica conexão
```

### Temas
```
motivação - Status motivacional
amor - Status romântico
sucesso - Status de sucesso
fé - Status religioso
paz - Status de paz
família - Status familiar
trabalho - Status profissional
```

## 🔒 Segurança

- Validação de números de telefone
- Rate limiting (implementar se necessário)
- Logs de auditoria
- Tratamento de erros robusto

## 🚨 Troubleshooting

### Problemas Comuns
1. **Webhook não recebe mensagens**: Verifique URL e configuração
2. **Erro de conexão**: Verifique token da API
3. **Status não gera**: Verifique chave do Gemini AI

### Logs
- Console do navegador para interface
- Logs do servidor para webhook
- Logs da API WhatsApp

## 📈 Próximos Passos

- [ ] Implementar rate limiting
- [ ] Adicionar mais temas personalizados
- [ ] Sistema de favoritos via WhatsApp
- [ ] Histórico de status enviados
- [ ] Configurações personalizadas por usuário
