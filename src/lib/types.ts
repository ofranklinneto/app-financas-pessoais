export interface Transaction {
  id: string
  user_id?: string
  type: 'income' | 'expense'
  amount: number
  category: string
  description: string
  date: string
  input_method: 'text' | 'audio' | 'photo'
  ai_analysis?: any
  created_at?: string
  updated_at?: string
}

export interface Goal {
  id: string
  user_id?: string
  title: string
  target_amount: number
  current_amount: number
  deadline: string
  status: 'active' | 'completed' | 'paused'
  created_at?: string
  updated_at?: string
}

export interface Reminder {
  id: string
  user_id?: string
  title: string
  description: string
  due_date: string
  amount: number
  category: string
  is_completed: boolean
  created_at?: string
  updated_at?: string
}

export interface Profile {
  id: string
  email: string
  full_name?: string
  created_at: string
  updated_at: string
}

export interface TransactionAnalysis {
  type: 'income' | 'expense'
  amount: number
  category: string
  description: string
  confidence: number
}