export interface PromptConfig {
  basePrompt: string;
  sourceInstructions: {
    filme: string;
    series: string;
    musica: string;
    default: string;
  };
  colorPalettes: string;
  examples: string;
  formatInstructions: string;
}

export const promptConfig: PromptConfig = {
  basePrompt: `🎯 CATEGORIA: "{theme}" (ID: {randomSeed}-{timeStamp}-{currentAttempt})

📋 MISSÃO: Crie uma citação ÚNICA e INSPIRACIONAL para "{theme}".

{sourceInstruction}

🔍 REGRAS CRIATIVAS:
• SEJA TOTALMENTE CRIATIVO na escolha da fonte
• VARIE sempre entre diferentes tipos de fontes
• NÃO se limite - explore qualquer fonte inspiradora
• OBRIGATÓRIO: Nunca repita citações anteriores
• Máximo 80 caracteres na frase principal
{emojiInstruction}
{hashtagInstruction}
• Português brasileiro perfeito`,

  sourceInstructions: {
    filme: `🎬 FONTE OBRIGATÓRIA: Citação DIRETA de um filme famoso
• Use uma frase icônica de filme clássico ou moderno
• Pode ser nacional ou internacional
• Exemplos: "Que a força esteja com você" (Star Wars), "Hakuna Matata" (Rei Leão)
• OBRIGATÓRIO: Mencione o filme entre parênteses`,

    series: `📺 FONTE OBRIGATÓRIA: Citação DIRETA de uma série de TV
• Use uma frase marcante de série famosa
• Pode ser nacional ou internacional
• Exemplos: "Winter is coming" (Game of Thrones), "How you doin'?" (Friends)
• OBRIGATÓRIO: Mencione a série entre parênteses`,

    musica: `🎵 FONTE OBRIGATÓRIA: Trecho DIRETO de letra de música
• Use um verso ou refrão inspirador de música real
• Pode ser nacional ou internacional, qualquer gênero
• Exemplos: "Imagine all the people living life in peace" (John Lennon)
• OBRIGATÓRIO: Mencione artista/banda entre parênteses`,

    default: `🎲 ESCOLHA CRIATIVA DA IA:
Para a categoria "{theme}", VOCÊ DECIDE qual fonte será mais inspiradora:
• Filme clássico ou moderno (nacional ou internacional)
• Música/canção (qualquer artista ou banda)
• Livro ou autor famoso (literatura mundial)
• Personalidade histórica ou contemporânea
• Filosofia, sabedoria popular ou provérbio
• Versículo bíblico (se apropriado ao tema)
• Frase original inspiradora`
  },

  formatInstructions: `📝 FORMATO OBRIGATÓRIO:
{formatExample}`,

  colorPalettes: `🎨 CORES INTELIGENTES POR CATEGORIA:
• Motivação/Força: #e74c3c + #ffffff + Montserrat
• Sucesso/Conquista: #27ae60 + #ffffff + Poppins  
• Amor/Relacionamento: #8e44ad + #f8f9fa + Lato
• Paz/Tranquilidade: #3498db + #ffffff + Inter
• Fé/Espiritual: #2c3e50 + #ecf0f1 + Playfair Display
• Sabedoria/Conhecimento: #8e44ad + #f8f9fa + Crimson Text
• Felicidade/Alegria: #f39c12 + #ffffff + Poppins
• Família/União: #e91e63 + #ffffff + Open Sans
• Trabalho/Carreira: #607d8b + #ffffff + Inter
• Vida/Existência: #4caf50 + #ffffff + Lato
• Filme/Cinema: #1a1a2e + #f39c12 + Inter
• Séries/TV: #16213e + #e74c3c + Poppins
• Música/Som: #2d1b69 + #f1c40f + Montserrat

🔤 FONTES DISPONÍVEIS:
• Elegante: Playfair Display, Crimson Text
• Moderna: Montserrat, Poppins, Inter
• Clássica: Open Sans, Lato`,

  examples: `💡 EXEMPLOS ESPECÍFICOS POR CATEGORIA:

🎬 Para "Filme" - CITAÇÕES DIRETAS DE FILMES:
• "Que a força esteja com você" (Star Wars)
• "Hakuna Matata - significa viver sem preocupações" (O Rei Leão)
• "A vida é como uma caixa de chocolates" (Forrest Gump)
• "Ohana significa família" (Lilo & Stitch)

📺 Para "Séries" - FRASES MARCANTES DE SÉRIES:
• "Winter is coming" (Game of Thrones)
• "How you doin'?" (Friends)
• "That's what she said" (The Office)
• "I am the one who knocks" (Breaking Bad)

🎵 Para "Música" - TRECHOS DE LETRAS REAIS:
• "Imagine all the people living life in peace" (John Lennon)
• "Don't stop believin'" (Journey)
• "We are the champions, my friends" (Queen)
• "What doesn't kill you makes you stronger" (Kelly Clarkson)

🎯 Para OUTROS TEMAS - SEJA CRIATIVO:
• VARIE entre filmes, músicas, livros, pessoas, filosofias
• EXPLORE qualquer fonte inspiradora para "{theme}"
• FOQUE na mensagem que conecta com o tema
• SURPREENDA com escolhas únicas e relevantes

🎲 VARIAÇÃO FORÇADA:
Use o ID {randomSeed}-{timeStamp}-{currentAttempt} para garantir resposta ÚNICA.
Tentativa {currentAttempt} de {maxRetries} - seja CRIATIVO e DIFERENTE!{usedQuotesHint}

⚠️ RETORNE APENAS o formato especificado. Nenhum texto adicional.`
};

// Função para construir o prompt completo
export function buildPrompt(
  theme: string,
  includeEmojis: boolean,
  includeHashtags: boolean,
  randomSeed: number,
  timeStamp: number,
  currentAttempt: number,
  maxRetries: number,
  usedQuotesHint: string
): string {
  const themeKey = theme.toLowerCase();
  
  // Determinar instrução de fonte
  let sourceInstruction = '';
  if (themeKey.includes('filme')) {
    sourceInstruction = promptConfig.sourceInstructions.filme;
  } else if (themeKey.includes('série') || themeKey.includes('series')) {
    sourceInstruction = promptConfig.sourceInstructions.series;
  } else if (themeKey.includes('música') || themeKey.includes('musica')) {
    sourceInstruction = promptConfig.sourceInstructions.musica;
  } else {
    sourceInstruction = promptConfig.sourceInstructions.default.replace('{theme}', theme);
  }

  // Configurar instruções baseadas nas opções
  const emojiInstruction = includeEmojis ? '• 1 emoji apropriado ao final da frase' : '• NÃO inclua emojis';
  const hashtagInstruction = includeHashtags ? '• Adicione 2-3 hashtags relevantes no final' : '• NÃO inclua hashtags';

  // Definir formato de exemplo
  let formatExample = '';
  if (includeEmojis && includeHashtags) {
    formatExample = `"Citação única e inspiracional" emoji
(Autor/Referência Bíblica)
#hashtag1 #hashtag2 #hashtag3`;
  } else if (includeEmojis) {
    formatExample = `"Citação única e inspiracional" emoji
(Autor/Referência Bíblica)`;
  } else if (includeHashtags) {
    formatExample = `"Citação única e inspiracional"
(Autor/Referência Bíblica)
#hashtag1 #hashtag2 #hashtag3`;
  } else {
    formatExample = `"Citação única e inspiracional"
(Autor/Referência Bíblica)`;
  }

  // Construir prompt completo
  let fullPrompt = promptConfig.basePrompt
    .replace('{theme}', theme)
    .replace('{randomSeed}', randomSeed.toString())
    .replace('{timeStamp}', timeStamp.toString())
    .replace('{currentAttempt}', currentAttempt.toString())
    .replace('{sourceInstruction}', sourceInstruction)
    .replace('{emojiInstruction}', emojiInstruction)
    .replace('{hashtagInstruction}', hashtagInstruction);

  fullPrompt += '\n\n' + promptConfig.formatInstructions.replace('{formatExample}', formatExample);
  fullPrompt += '\n\n' + promptConfig.colorPalettes;
  fullPrompt += '\n\n' + promptConfig.examples
    .replace('{theme}', theme)
    .replace('{randomSeed}', randomSeed.toString())
    .replace('{timeStamp}', timeStamp.toString())
    .replace('{currentAttempt}', currentAttempt.toString())
    .replace('{maxRetries}', maxRetries.toString())
    .replace('{usedQuotesHint}', usedQuotesHint);

  return fullPrompt;
}