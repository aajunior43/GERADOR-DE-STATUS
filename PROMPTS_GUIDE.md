# 📝 Guia de Personalização de Prompts - Status AI

## 🎯 **Visão Geral**

O sistema de prompts foi modularizado para facilitar a personalização. Você pode editar os prompts diretamente nos arquivos do projeto:

### **Via Arquivos (Única forma)**
- Edite os arquivos em `src/config/`
- Mudanças são permanentes no código
- Recarregamento automático da aplicação

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

## �  **Testando Mudanças**

1. **Faça uma mudança pequena primeiro**
2. **Teste com um tema específico**
3. **Verifique se a resposta está no formato esperado**
4. **Ajuste conforme necessário**

## 🔄 **Aplicar Mudanças**

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