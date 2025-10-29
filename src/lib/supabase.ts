import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      transactions: {
        Row: {
          id: string
          user_id: string
          type: 'income' | 'expense'
          amount: number
          category: string
          description: string
          date: string
          created_at: string
          ai_analyzed: boolean
          original_input: string
          input_method: 'text' | 'audio' | 'photo'
        }
        Insert: {
          id?: string
          user_id: string
          type: 'income' | 'expense'
          amount: number
          category: string
          description: string
          date: string
          created_at?: string
          ai_analyzed?: boolean
          original_input: string
          input_method: 'text' | 'audio' | 'photo'
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'income' | 'expense'
          amount?: number
          category?: string
          description?: string
          date?: string
          created_at?: string
          ai_analyzed?: boolean
          original_input?: string
          input_method?: 'text' | 'audio' | 'photo'
        }
      }
      goals: {
        Row: {
          id: string
          user_id: string
          title: string
          target_amount: number
          current_amount: number
          deadline: string
          created_at: string
          status: 'active' | 'completed' | 'paused'
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          target_amount: number
          current_amount?: number
          deadline: string
          created_at?: string
          status?: 'active' | 'completed' | 'paused'
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          target_amount?: number
          current_amount?: number
          deadline?: string
          created_at?: string
          status?: 'active' | 'completed' | 'paused'
        }
      }
      reminders: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          due_date: string
          amount: number
          category: string
          is_completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          due_date: string
          amount: number
          category: string
          is_completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          due_date?: string
          amount?: number
          category?: string
          is_completed?: boolean
          created_at?: string
        }
      }
    }
  }
}