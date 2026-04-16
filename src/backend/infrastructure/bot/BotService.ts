import { OpenAI } from 'openai';
import { GoogleGenAI } from '@google/genai';
import Anthropic from '@anthropic-ai/sdk';
import { GetAnalyticsUseCase } from '../../application/useCases/GetAnalyticsUseCase';

export class BotService {
  private anthropic: Anthropic | null = null;
  private openai: OpenAI | null = null;
  private gemini: GoogleGenAI | null = null;
  private groq: OpenAI | null = null;

  constructor(private getAnalyticsUseCase: GetAnalyticsUseCase) {
    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    }
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    if (process.env.GEMINI_API_KEY) {
      this.gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
    if (process.env.GROQ_API_KEY) {
      // Groq usa a mesma biblioteca da OpenAI, só muda a URL base
      this.groq = new OpenAI({ 
        apiKey: process.env.GROQ_API_KEY,
        baseURL: "https://api.groq.com/openai/v1"
      });
    }
  }

  async ask(query: string, scheduleData: any = []): Promise<string> {
    const analyticsData = await this.getAnalyticsUseCase.execute();
    
    const systemPrompt = `Você é a Karen, a assistente virtual de Inteligência Operacional da KingStar.
    Sua função é auxiliar os gestores logísticos respondendo perguntas sobre a operação.

    DADOS EM TEMPO REAL DO WMS (Analytics):
    ${JSON.stringify(analyticsData, null, 2)}
    
    DADOS DE AGENDAMENTO (Agenda):
    ${JSON.stringify(scheduleData, null, 2)}
    
    REGRAS DE RESPOSTA:
    1. Seja direta, profissional e concisa. Aja como a Karen.
    2. Baseie suas respostas EXCLUSIVAMENTE nos dados fornecidos acima.
    3. Se a pergunta não for sobre logística ou sobre os dados fornecidos, diga educadamente que você é a Karen, uma assistente focada apenas na operação do WMS.
    4. O Score Operacional atual é ${analyticsData.score.total} (${analyticsData.score.classification}). Use isso se perguntarem sobre o desempenho geral.
    5. Formate a resposta em Markdown para facilitar a leitura.`;

    // 1. Tenta Anthropic (Claude 3 Haiku - Rápido e barato/gratuito)
    if (this.anthropic) {
      try {
        const response = await this.anthropic.messages.create({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1024,
          system: systemPrompt,
          messages: [
            { role: 'user', content: query }
          ],
          temperature: 0.3,
        });
        return (response.content[0] as any).text || 'Sem resposta do Claude.';
      } catch (error: any) {
        console.error('[BOT] Erro no Claude. Tentando fallback...', error.message);
      }
    }

    // 2. Tenta OpenAI (GPT-4o-mini)
    if (this.openai) {
      try {
        const response = await this.openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: query }
          ],
          temperature: 0.3,
        });
        return response.choices[0].message.content || 'Sem resposta do GPT.';
      } catch (error: any) {
        console.error('[BOT] Erro na OpenAI. Tentando fallback...', error.message);
      }
    }

    // 2. Fallback para Groq (Llama 3 - Gratuito e super rápido)
    if (this.groq) {
      try {
        const response = await this.groq.chat.completions.create({
          model: 'llama-3.1-8b-instant', // Modelo rápido e gratuito da Meta (substituto do llama3-8b-8192)
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: query }
          ],
          temperature: 0.3,
        });
        return response.choices[0].message.content || 'Sem resposta do Groq.';
      } catch (error: any) {
        console.error('[BOT] Erro no Groq. Tentando fallback para Gemini...', error.message);
      }
    }

    // 3. Fallback para Gemini (Gemini 3 Flash)
    if (this.gemini) {
      try {
        const response = await this.gemini.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: [
            { role: 'user', parts: [{ text: systemPrompt + '\n\nPergunta do usuário: ' + query }] }
          ]
        });
        return response.text || 'Sem resposta do Gemini.';
      } catch (error: any) {
        console.error('[BOT] Erro no Gemini.', error);
        return `Erro ao processar a requisição de IA (Gemini). Detalhe: ${error.message || 'Erro desconhecido'}`;
      }
    }

    return 'Nenhum provedor de IA configurado. Por favor, defina a variável de ambiente ANTHROPIC_API_KEY, OPENAI_API_KEY, GROQ_API_KEY ou GEMINI_API_KEY no arquivo .env.';
  }
}
