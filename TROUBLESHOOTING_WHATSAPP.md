# 🔧 Troubleshooting WhatsApp Integration

## ✅ Passos para Resolver o Problema

### 1. Verificar se o Projeto Está Rodando
```bash
npm run dev
```
- O projeto deve estar rodando em `http://localhost:3000`
- Para produção, use um serviço como Vercel, Netlify ou servidor próprio

### 2. Testar a API Localmente

#### Acesse as páginas de teste:
- **Teste do Webhook**: `http://localhost:3000/test-webhook`
- **Interface WhatsApp**: `http://localhost:3000/whatsapp`
- **Debug da API**: `http://localhost:3000/api/debug-whatsapp`

### 3. Verificar Configuração do Webhook

#### URL do Webhook para configurar na API WhatsApp:
```
https://seu-dominio.com/api/webhook
```

**⚠️ IMPORTANTE**: Para receber webhooks do WhatsApp, seu projeto precisa estar:
- Rodando em HTTPS (não HTTP)
- Acessível publicamente na internet
- Não pode ser localhost para webhooks externos

### 4. Configurar Webhook na API WhatsApp

1. Acesse o painel da API WhatsApp: `https://api-whatsapp.api-alisson.com.br`
2. Configure o webhook URL: `https://seu-dominio.com/api/webhook`
3. Certifique-se de que o token está correto: `4h8g8JO7vtQbXSvJW61WtdAemw6PaQ5m`

### 5. Deploy para Produção

#### Opção 1: Vercel (Recomendado)
```bash
npm install -g vercel
vercel
```

#### Opção 2: Netlify
```bash
npm run build
# Upload da pasta .next para Netlify
```

#### Opção 3: Servidor Próprio
```bash
npm run build
npm start
```

### 6. Testar Formatos de Webhook

O sistema agora aceita múltiplos formatos:
- `{ phone: "5511999999999", message: "motivação" }`
- `{ from: "5511999999999", body: "motivação" }`
- `{ number: "5511999999999", text: "motivação" }`
- `{ sender: "5511999999999", content: "motivação" }`
- `{ data: { phone: "5511999999999", message: "motivação" } }`

### 7. Verificar Logs

#### No navegador (F12 -> Console):
- Logs do webhook recebido
- Logs de processamento
- Erros de validação

#### No terminal do servidor:
- Status da conexão WhatsApp
- Mensagens enviadas/recebidas
- Erros da API

## 🚨 Problemas Comuns

### Problema: "Nada acontece quando envio mensagem"

**Possíveis causas:**
1. ❌ Webhook não configurado na API WhatsApp
2. ❌ Projeto rodando apenas em localhost
3. ❌ URL do webhook incorreta
4. ❌ Token da API inválido
5. ❌ Formato do webhook não reconhecido

**Soluções:**
1. ✅ Configure o webhook na API WhatsApp
2. ✅ Faça deploy para produção (Vercel/Netlify)
3. ✅ Use HTTPS, não HTTP
4. ✅ Verifique o token da API
5. ✅ Teste diferentes formatos no `/test-webhook`

### Problema: "Erro de conexão com WhatsApp"

**Verificar:**
1. Token da API: `4h8g8JO7vtQbXSvJW61WtdAemw6PaQ5m`
2. URL da API: `https://api-whatsapp.api-alisson.com.br/api/v1`
3. Status da conexão em `/api/debug-whatsapp`

### Problema: "Número de telefone inválido"

**Formatos aceitos:**
- `11999999999` (11 dígitos)
- `5511999999999` (13 dígitos com código do país)
- `+5511999999999` (com +)

## 🧪 Como Testar

### 1. Teste Local (Desenvolvimento)
```bash
# Terminal 1: Rodar o projeto
npm run dev

# Terminal 2: Testar webhook
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -d '{"phone":"5511999999999","message":"motivação"}'
```

### 2. Teste de Produção
1. Acesse `https://seu-dominio.com/test-webhook`
2. Digite um número e mensagem
3. Clique em "Testar Webhook"
4. Verifique os logs no console

### 3. Teste Real do WhatsApp
1. Configure o webhook na API WhatsApp
2. Envie uma mensagem para o número conectado
3. Verifique se recebe resposta automática

## 📱 Comandos Disponíveis

- `ajuda` ou `help` - Mostra comandos disponíveis
- `status` - Verifica se o bot está online
- Qualquer tema (ex: `motivação`, `amor`, `sucesso`) - Gera status

## 🔗 URLs Importantes

- **Projeto local**: `http://localhost:3000`
- **Teste webhook**: `http://localhost:3000/test-webhook`
- **Interface WhatsApp**: `http://localhost:3000/whatsapp`
- **Debug API**: `http://localhost:3000/api/debug-whatsapp`
- **Endpoint webhook**: `http://localhost:3000/api/webhook`

## 📞 Próximos Passos

1. ✅ Faça deploy para produção
2. ✅ Configure o webhook na API WhatsApp
3. ✅ Teste com mensagens reais
4. ✅ Monitore os logs para debug
5. ✅ Ajuste conforme necessário

---

**💡 Dica**: Use sempre HTTPS em produção e teste primeiro localmente com `/test-webhook` antes de configurar o webhook real.