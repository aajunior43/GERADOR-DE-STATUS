# StatusAI Creator 🚀

> **Transforme suas ideias em status profissionais para redes sociais com IA avançada**

[![Next.js](https://img.shields.io/badge/Next.js-15.5.0-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini-AI-4285F4?style=flat-square&logo=google)](https://ai.google.dev/)

## ✨ Características

- 🤖 **IA Inteligente**: Tecnologia Gemini avançada para conteúdo único
- ⚡ **Rápido e Fácil**: Gere status em segundos
- 🎨 **Design Profissional**: Múltiplos estilos e formatos
- 📱 **Responsivo**: Funciona perfeitamente em todos os dispositivos
- 🔧 **Altamente Customizável**: Controle total sobre cores, fontes e estilos
- 🚀 **Performance Otimizada**: Carregamento rápido e experiência fluida
- ♿ **Acessível**: Design inclusivo seguindo padrões WCAG
- 🔒 **Seguro**: Validação robusta e tratamento de erros

## 🛠️ Tecnologias

- **Framework**: Next.js 15.5.0 com App Router
- **Linguagem**: TypeScript 5.0
- **Estilização**: Tailwind CSS 4.0
- **IA**: Google Gemini AI
- **Animações**: Framer Motion
- **Ícones**: Lucide React
- **Canvas**: Fabric.js
- **Notificações**: React Hot Toast
- **Formulários**: React Hook Form + Zod
- **Testes**: Jest + Testing Library

## 🚀 Começando

### Pré-requisitos

- Node.js 18.0.0 ou superior
- npm 9.0.0 ou superior
- Chave da API do Google Gemini

### Instalação

1. **Clone o repositório**
   ```bash
   git clone https://github.com/seu-usuario/status-creator-ai.git
   cd status-creator-ai
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   cp .env.example .env.local
   ```
   
   Edite o arquivo `.env.local` e adicione sua chave da API:
   ```env
   NEXT_PUBLIC_GEMINI_API_KEY=sua_chave_da_api_aqui
   ```

4. **Execute o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```

5. **Abra [http://localhost:3000](http://localhost:3000) no seu navegador**

## 📁 Estrutura do Projeto

```
src/
├── app/                    # App Router (Next.js 13+)
│   ├── globals.css        # Estilos globais
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página inicial
├── components/            # Componentes React
│   ├── ui/               # Componentes base (Button, Input, etc.)
│   ├── ImprovedCreator.tsx
│   ├── SimpleFooter.tsx
│   └── ...
├── lib/                  # Utilitários e helpers
│   └── utils.ts
├── services/             # Serviços externos
│   └── geminiService.ts
├── types/                # Definições de tipos TypeScript
│   └── index.ts
└── hooks/                # Custom hooks (futuro)
```

## 🎯 Como Usar

### 1. Escolha um Tema
Digite um tema ou selecione uma categoria predefinida:
- 💪 Motivação
- ❤️ Amor
- 🏆 Sucesso
- 🎯 Foco
- 🙏 Gratidão
- 🕊️ Paz
- ⚡ Força
- 🌟 Esperança

### 2. Personalize o Estilo
Escolha entre diferentes estilos:
- **Modern**: Design limpo e contemporâneo
- **Elegant**: Estilo sofisticado e refinado
- **Minimalist**: Design simples e essencial
- **Vibrant**: Cores vivas e energéticas
- **Dark**: Tema escuro e misterioso
- **Gradient**: Gradientes coloridos
- **Neon**: Efeito neon e brilhante

### 3. Configure o Formato
Selecione a proporção ideal:
- **9:16** - Stories e posts verticais
- **1:1** - Posts quadrados
- **16:9** - Posts horizontais

### 4. Gere e Baixe
Clique em "Gerar Status" e aguarde a IA criar seu conteúdo personalizado. Depois, baixe a imagem ou compartilhe diretamente.

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia o servidor de desenvolvimento
npm run build        # Constrói para produção
npm run start        # Inicia o servidor de produção

# Qualidade de Código
npm run lint         # Executa o ESLint
npm run lint:fix     # Corrige problemas do ESLint
npm run format       # Formata o código com Prettier
npm run type-check   # Verifica tipos TypeScript

# Testes
npm run test         # Executa os testes
npm run test:watch   # Executa testes em modo watch

# Utilitários
npm run clean        # Limpa arquivos de build
npm run analyze      # Analisa o bundle
```

## 🧪 Testes

O projeto inclui uma configuração completa de testes:

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch
npm run test:watch

# Verificar cobertura
npm run test -- --coverage
```

## 📦 Deploy

### Vercel (Recomendado)

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Outras Plataformas

O projeto é compatível com qualquer plataforma que suporte Next.js:
- Netlify
- Railway
- Heroku
- AWS Amplify

## 🔒 Variáveis de Ambiente

| Variável | Descrição | Obrigatória |
|----------|-----------|-------------|
| `NEXT_PUBLIC_GEMINI_API_KEY` | Chave da API do Google Gemini | ✅ |

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Padrões de Código

- Use TypeScript para todo novo código
- Siga as regras do ESLint e Prettier
- Escreva testes para novas funcionalidades
- Mantenha a cobertura de testes acima de 70%
- Use commits semânticos

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🙏 Agradecimentos

- [Google Gemini AI](https://ai.google.dev/) pela tecnologia de IA
- [Next.js](https://nextjs.org/) pelo framework incrível
- [Tailwind CSS](https://tailwindcss.com/) pelos estilos
- [Vercel](https://vercel.com/) pela hospedagem

## 📞 Suporte

- 📧 Email: suporte@statusai.com.br
- 🐛 Issues: [GitHub Issues](https://github.com/seu-usuario/status-creator-ai/issues)
- 📖 Documentação: [Wiki](https://github.com/seu-usuario/status-creator-ai/wiki)

## 🚀 Roadmap

- [ ] Suporte a múltiplos idiomas
- [ ] Templates personalizados
- [ ] Integração com redes sociais
- [ ] Histórico de criações
- [ ] Colaboração em tempo real
- [ ] API pública
- [ ] Aplicativo mobile

---

**Feito com ❤️ pela equipe StatusAI**
