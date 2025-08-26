# StatusAI Creator 🚀

Uma aplicação moderna e inteligente para criar status profissionais para redes sociais usando Inteligência Artificial.

## ✨ Características

- **IA Avançada**: Utiliza Google Gemini AI para gerar conteúdo único e inspirador
- **Design Responsivo**: Interface moderna e adaptável para todos os dispositivos
- **Categorias Predefinidas**: Temas populares como motivação, amor, sucesso e mais
- **Múltiplos Estilos**: Escolha entre estilos moderno, elegante, minimalista, vibrante e escuro
- **Geração Instantânea**: Cria status profissionais em segundos
- **Download Direto**: Baixe suas imagens em alta qualidade
- **Interface Intuitiva**: Fácil de usar, mesmo para iniciantes

## 🚀 Tecnologias

- **Frontend**: Next.js 15, React 19, TypeScript
- **IA**: Google Gemini AI
- **Estilização**: Tailwind CSS 4
- **Animações**: Framer Motion
- **Ícones**: Lucide React

## 🛠️ Instalação

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
   
   Adicione sua chave da API do Gemini:
   ```env
   NEXT_PUBLIC_GEMINI_API_KEY=sua_chave_aqui
   ```

4. **Execute o projeto**
   ```bash
   npm run dev
   ```

5. **Acesse a aplicação**
   ```
   http://localhost:3000
   ```

## 🔑 Configuração da API

Para usar a funcionalidade de IA, você precisa de uma chave da API do Google Gemini:

1. Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crie uma nova chave de API
3. Adicione a chave no arquivo `.env.local`

## 📱 Como Usar

1. **Escolha um tema**: Digite seu próprio tema ou selecione uma categoria predefinida
2. **Selecione o estilo**: Escolha entre os estilos disponíveis
3. **Gere o status**: Clique em "Gerar Status" e aguarde a IA criar seu conteúdo
4. **Personalize**: O sistema gera automaticamente cores e formatação
5. **Download**: Baixe sua imagem em alta qualidade
6. **Compartilhe**: Use nas suas redes sociais

## 🎨 Estilos Disponíveis

- **Moderno** ✨: Design limpo e contemporâneo
- **Elegante** 👑: Visual sofisticado e refinado
- **Minimalista** ⚪: Simplicidade e foco no conteúdo
- **Vibrante** 🎨: Cores vivas e energéticas
- **Escuro** 🌙: Tema escuro para um visual dramático

## 📁 Estrutura do Projeto

```
src/
├── app/                 # Páginas e layout principal
├── components/          # Componentes React reutilizáveis
│   ├── ImprovedCreator.tsx    # Interface principal
│   ├── SimpleCreator.tsx      # Versão simplificada
│   ├── Header.tsx             # Cabeçalho
│   └── Footer.tsx             # Rodapé
├── services/            # Serviços e APIs
│   └── geminiService.ts       # Integração com Gemini AI
└── styles/              # Estilos globais
```

## 🔧 Scripts Disponíveis

- `npm run dev` - Executa o servidor de desenvolvimento
- `npm run build` - Constrói a aplicação para produção
- `npm run start` - Inicia o servidor de produção
- `npm run lint` - Executa o linter

## 🌟 Funcionalidades Futuras

- [ ] Histórico de status gerados
- [ ] Mais opções de personalização
- [ ] Integração com redes sociais
- [ ] Templates personalizáveis
- [ ] Sistema de usuários
- [ ] Galeria de status populares

## 🤝 Contribuição

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Se você tiver alguma dúvida ou problema:

- Abra uma [issue](https://github.com/seu-usuario/status-creator-ai/issues)
- Entre em contato: [seu-email@exemplo.com]

## 🙏 Agradecimentos

- Google Gemini AI pela tecnologia de IA
- Comunidade Next.js pelo framework incrível
- Tailwind CSS pela biblioteca de estilos

---

**StatusAI Creator** - Transformando ideias em status profissionais com IA 🚀
