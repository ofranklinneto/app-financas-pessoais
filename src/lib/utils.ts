import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const EXPENSE_CATEGORIES = [
  'Alimentação',
  'Transporte',
  'Moradia',
  'Saúde',
  'Educação',
  'Entretenimento',
  'Compras',
  'Serviços',
  'Investimentos',
  'Outros'
]

export const INCOME_CATEGORIES = [
  'Salário',
  'Freelance',
  'Investimentos',
  'Vendas',
  'Outros'
]

export const REMINDER_CATEGORIES = [
  'Cartão de Crédito',
  'Financiamento',
  'Conta de Luz',
  'Conta de Água',
  'Internet',
  'Telefone',
  'Aluguel',
  'Seguro',
  'Outros'
]

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('pt-BR')
}

export const calculateDaysUntil = (date: string): number => {
  const today = new Date()
  const targetDate = new Date(date)
  const diffTime = targetDate.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export const getProgressColor = (percentage: number): string => {
  if (percentage >= 100) return 'from-green-500 to-emerald-500'
  if (percentage >= 75) return 'from-blue-500 to-cyan-500'
  if (percentage >= 50) return 'from-yellow-500 to-orange-500'
  return 'from-red-500 to-pink-500'
}

export const analyzeSpendingPattern = (transactions: any[]) => {
  const last30Days = transactions.filter(t => {
    const transactionDate = new Date(t.date)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return transactionDate >= thirtyDaysAgo
  })

  const totalExpenses = last30Days
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalIncome = last30Days
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0

  return {
    totalExpenses,
    totalIncome,
    savingsRate,
    period: '30 dias'
  }
}

// Função segura para copiar texto (sem usar Clipboard API)
export const copyToClipboard = (text: string): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      // Método alternativo que funciona no sandbox
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      const result = document.execCommand('copy')
      document.body.removeChild(textArea)
      resolve(result)
    } catch (err) {
      resolve(false)
    }
  })
}