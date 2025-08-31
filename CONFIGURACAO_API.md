# 🔧 Configuração da API WhatsApp

## 📋 Formato Correto da API

### Estrutura do Payload:
```json
{
  "token": "{{USER_TOKEN}}",
  "uuid": "UUID_DA_INSTANCIA", 
  "number": "5511999999999",
  "content": "Mensagem de *exemplo*\n👌",
  "delay": 2500
}
```

### Parâmetros:
- **token**: Token de API da sua conta
- **uuid**: ID Único da Instância responsável por enviar a mensagem
- **number**: Número do WhatsApp que irá receber (Ex: 5582982000000)
- **content**: Conteúdo da mensagem em texto (Limite de 1000 caracteres)
- **delay**: Opcional. Impõe um atraso para o envio (impressão que está sendo digitada)

## ⚙️ Configuração no Sistema

### 1. Configurar UUID
Acesse: `http://localhost:3000/config-whatsapp`
- Digite o UUID da sua instância WhatsApp
- Clique em "Salvar"
- Teste a conexão

### 2. Variáveis de Ambiente
Adicione no `.env.local`:
```env
WHATSAPP_UUID=seu_uuid_aqui
NEXT_PUBLIC_GEMINI_API_KEY=sua_chave_gemini
```

### 3. Endpoints da API

#### Enviar Texto:
```
POST https://api-whatsapp.api-alisson.com.br/api/v1/send-text
```

#### Enviar Mídia:
```
POST https://api-whatsapp.api-alisson.com.br/api/v1/send-media
```

#### Verificar Status:
```
POST https://api-whatsapp.api-alisson.com.br/api/v1/status
```

## 🧪 Como Testar

### 1. Configuração
1. Acesse `/config-whatsapp`
2. Configure o UUID
3. Teste a conexão
4. Envie mensagem de teste

### 2. Webhook
1. Configure webhook na API: `https://seu-dominio.com/api/webhook`
2. Envie mensagem para o WhatsApp
3. Verifique se recebe resposta automática

### 3. Diagnóstico
1. Acesse `/diagnostico`
2. Execute diagnóstico completo
3. Verifique todos os testes

## 🔄 Fluxo Atualizado

```
Usuário → WhatsApp → API → Webhook → IA → Resposta → WhatsApp
```

### Detalhado:
1. **Usuário envia**: "motivação" via WhatsApp
2. **API recebe**: webhook com dados da mensagem
3. **Sistema processa**: tema "motivação"
4. **IA gera**: status personalizado com imagem
5. **Sistema envia**: POST para API com payload correto
6. **WhatsApp entrega**: imagem + texto para usuário

## 🚨 Troubleshooting

### Erro: "UUID inválido"
- Verifique se o UUID está correto
- Configure em `/config-whatsapp`
- Teste a conexão

### Erro: "Token inválido"
- Verifique o token: `4h8g8JO7vtQbXSvJW61WtdAemw6PaQ5m`
- Confirme se está ativo na API

### Erro: "Número inválido"
- Use formato: `5511999999999`
- Sem caracteres especiais
- Com código do país (55)

### Erro: "Webhook não recebe"
- Projeto deve estar em produção (HTTPS)
- Configure URL: `https://seu-dominio.com/api/webhook`
- Verifique logs do servidor

## 📱 Exemplo Prático

### Envio Manual:
```bash
curl -X POST https://api-whatsapp.api-alisson.com.br/api/v1/send-text \
  -H "Content-Type: application/json" \
  -d '{
    "token": "4h8g8JO7vtQbXSvJW61WtdAemw6PaQ5m",
    "uuid": "SEU_UUID_AQUI",
    "number": "5511999999999",
    "content": "Teste de mensagem 🤖",
    "delay": 2500
  }'
```

### Resposta Esperada:
```json
{
  "success": true,
  "message": "Mensagem enviada com sucesso"
}
```

## 🎯 Próximos Passos

1. ✅ Configure o UUID em `/config-whatsapp`
2. ✅ Teste a conexão e envio
3. ✅ Faça deploy para produção
4. ✅ Configure webhook na API WhatsApp
5. ✅ Teste com mensagens reais

---

**💡 Dica**: Use a página `/config-whatsapp` para configurar e testar tudo antes do deploy!