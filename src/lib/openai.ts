import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
})

export interface TransactionAnalysis {
  type: 'income' | 'expense'
  amount: number
  category: string
  description: string
  confidence: number
}

export async function analyzeText(text: string): Promise<TransactionAnalysis> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Você é um assistente especializado em análise de transações financeiras. 
          Analise o texto fornecido e extraia informações sobre uma transação financeira.
          
          Responda APENAS com um JSON válido no formato:
          {
            "type": "income" ou "expense",
            "amount": número (apenas o valor numérico),
            "category": "categoria apropriada",
            "description": "descrição clara da transação",
            "confidence": número entre 0 e 1
          }
          
          Categorias possíveis:
          - Para despesas: Alimentação, Transporte, Saúde, Educação, Lazer, Casa, Roupas, Outros
          - Para receitas: Salário, Freelance, Investimentos, Vendas, Outros`
        },
        {
          role: 'user',
          content: text
        }
      ],
      temperature: 0.1
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('Resposta vazia da OpenAI')

    return JSON.parse(content)
  } catch (error) {
    console.error('Erro ao analisar texto:', error)
    throw new Error('Falha na análise do texto')
  }
}

export async function analyzeAudio(audioBlob: Blob): Promise<TransactionAnalysis> {
  try {
    // Primeiro, transcrever o áudio
    const formData = new FormData()
    formData.append('file', audioBlob, 'audio.webm')
    formData.append('model', 'whisper-1')

    const transcription = await openai.audio.transcriptions.create({
      file: audioBlob,
      model: 'whisper-1',
      language: 'pt'
    })

    // Depois, analisar o texto transcrito
    return await analyzeText(transcription.text)
  } catch (error) {
    console.error('Erro ao analisar áudio:', error)
    throw new Error('Falha na análise do áudio')
  }
}

export async function analyzeImage(imageFile: File): Promise<TransactionAnalysis> {
  try {
    // Converter imagem para base64
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.readAsDataURL(imageFile)
    })

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Você é um assistente especializado em análise de recibos e comprovantes financeiros.
          Analise a imagem fornecida e extraia informações sobre a transação financeira.
          
          Responda APENAS com um JSON válido no formato:
          {
            "type": "income" ou "expense",
            "amount": número (apenas o valor numérico),
            "category": "categoria apropriada",
            "description": "descrição clara da transação",
            "confidence": número entre 0 e 1
          }
          
          Categorias possíveis:
          - Para despesas: Alimentação, Transporte, Saúde, Educação, Lazer, Casa, Roupas, Outros
          - Para receitas: Salário, Freelance, Investimentos, Vendas, Outros`
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analise esta imagem e extraia as informações da transação financeira:'
            },
            {
              type: 'image_url',
              image_url: {
                url: base64
              }
            }
          ]
        }
      ],
      temperature: 0.1
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('Resposta vazia da OpenAI')

    return JSON.parse(content)
  } catch (error) {
    console.error('Erro ao analisar imagem:', error)
    throw new Error('Falha na análise da imagem')
  }
}