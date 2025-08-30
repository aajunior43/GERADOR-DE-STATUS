# 📝 Guia de Personalização de Prompts - Status AI

## 🎯 **Visão Geral**

O sistema de prompts foi modularizado para facilitar a personalização. Agora você pode editar os prompts de duas formas:

### 1. **Via Interface (Recomendado para testes)**
- Clique no botão "⚙️ Editar Prompts" na parte inferior da aplicação
- Edite diretamente na interface web
- Salva no localStorage (temporário)

### 2. **Via Arquivos (Recomendado para mudanças permanentes)**
- Edite os arquivos em `src/config/`
- Mudanças são permanentes no código

## 📁 **Estrutura de Arquivos**

```
src/config/
├── prompts.ts          # Configuração principal dos prompts
├── prompts.example.ts  # Exemplos e templates
└── README.md          # Documentação detalhada
```

## 🛠️ **Como Personalizar**

### **Adicionar Novo Tema Específico**

1. **Edite `src/config/prompts.ts`:**
```typescript
sourceInstructions: {
  // ... temas existentes
  anime: `🎌 FONTE OBRIGATÓRIA: Citação DIRETA de anime
• Use uma frase marcante de anime famoso
• OBRIGATÓRIO: Mencione o anime entre parênteses`,
}
```

2. **Adicione cores específicas:**
```typescript
colorPalettes: `
// ... outras cores
• Anime/Mangá: #ff6b6b + #ffffff + Poppins
`
```

3. **Adicione exemplos:**
```typescript
examples: `
// ... outros exemplos
🎌 Para "Anime" - CITAÇÕES DIRETAS:
• "Acredite!" (Naruto)
• "Vou me tornar o Rei dos Piratas!" (One Piece)
`
```

### **Modificar Comportamento Geral**

Edite o `basePrompt` para mudar como a IA se comporta:

```typescript
basePrompt: `🎯 SEU PROMPT PERSONALIZADO AQUI

📋 MISSÃO: {sua_instrução_personalizada}

{sourceInstruction}

🔍 SUAS REGRAS:
• Regra personalizada 1
• Regra personalizada 2
{emojiInstruction}
{hashtagInstruction}
• Português brasileiro {seu_estilo}`
```

## 🎨 **Temas Atuais Configurados**

### **Específicos (Fontes Obrigatórias)**
- **🎬 Filme**: Citações diretas de filmes
- **📺 Séries**: Frases de séries de TV  
- **🎵 Música**: Trechos de letras

### **Flexíveis (IA Escolhe)**
- Motivação, Amor, Sucesso, Sabedoria, Força, Paz
- Felicidade, Coragem, Esperança, Gratidão, Família
- Amizade, Trabalho, Sonhos, Vida, Fé, Superação, Inspiração

## 🔧 **Exemplos Práticos**

### **1. Adicionar Tema "Livros"**

```typescript
// Em sourceInstructions
livros: `📚 FONTE OBRIGATÓRIA: Citação DIRETA de livro
• Use frase marcante de literatura clássica ou moderna
• OBRIGATÓRIO: Mencione livro e autor entre parênteses`,

// Em colorPalettes  
• Livros/Literatura: #8b4513 + #f5f5dc + Crimson Text

// Em examples
📚 Para "Livros" - CITAÇÕES DIRETAS:
• "Ser ou não ser, eis a questão" (Hamlet - Shakespeare)
• "O importante é lutar sempre" (Autor - Livro)
```

### **2. Modificar Filmes para Apenas Brasileiros**

```typescript
filme: `🇧🇷 FONTE OBRIGATÓRIA: Citação de filme BRASILEIRO
• FOQUE APENAS em cinema nacional
• Exemplos: "Vai dar namoro" (Minha Mãe é uma Peça)
• OBRIGATÓRIO: Mencione filme brasileiro entre parênteses`,
```

### **3. Criar Prompt Mais Poético**

```typescript
basePrompt: `✨ CATEGORIA: "{theme}" - SEJA POÉTICO!

🎭 MISSÃO: Crie uma citação que TOQUE A ALMA sobre "{theme}".

{sourceInstruction}

🌟 REGRAS POÉTICAS:
• Use linguagem EMOTIVA e INSPIRADORA
• CONECTE com sentimentos profundos
• Máximo 60 caracteres (mais conciso)
{emojiInstruction}
{hashtagInstruction}
• Português brasileiro POÉTICO`
```

## 🚀 **Funcionalidades Avançadas**

### **Prompts Condicionais**
Você pode criar lógica condicional no `buildPrompt()`:

```typescript
// Exemplo: Prompts diferentes por horário
const hour = new Date().getHours();
let timeInstruction = '';

if (hour < 12) {
  timeInstruction = '• Crie algo ENERGIZANTE para começar o dia';
} else if (hour < 18) {
  timeInstruction = '• Gere algo MOTIVADOR para o meio do dia';
} else {
  timeInstruction = '• Desenvolva algo REFLEXIVO para a noite';
}
```

### **Variações por Usuário**
```typescript
// Salvar preferências do usuário
const userPrefs = localStorage.getItem('user_prompt_style');
const styleInstruction = userPrefs === 'formal' ? 
  '• Use linguagem formal e elegante' : 
  '• Use linguagem casual e descontraída';
```

## 📊 **Testando Mudanças**

1. **Faça uma mudança pequena primeiro**
2. **Teste com um tema específico**
3. **Verifique se a resposta está no formato esperado**
4. **Ajuste conforme necessário**

## 🔄 **Aplicar Mudanças**

### **Via Interface:**
1. Edite no editor web
2. Clique "Salvar"
3. Reinicie a aplicação

### **Via Arquivos:**
1. Edite `src/config/prompts.ts`
2. Salve o arquivo
3. A aplicação recarrega automaticamente

## 💡 **Dicas Importantes**

- **Mantenha as variáveis**: `{theme}`, `{sourceInstruction}`, etc.
- **Teste gradualmente**: Uma mudança por vez
- **Backup**: Mantenha cópia dos prompts originais
- **Formato**: Mantenha estrutura de resposta esperada
- **Variação**: Use IDs únicos para evitar repetições

## 🎯 **Próximos Passos**

1. **Experimente** com os temas existentes
2. **Adicione** seus próprios temas específicos
3. **Personalize** as cores e fontes
4. **Crie** prompts únicos para seu uso

---

**Divirta-se personalizando! 🎨✨**