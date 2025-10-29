import { supabase } from './supabase'
import { Transaction, Goal, Reminder } from './types'

// Transações
export async function getTransactions(userId: string): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })

  if (error) throw error
  return data || []
}

export async function createTransaction(transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'> & { user_id: string }) {
  const { data, error } = await supabase
    .from('transactions')
    .insert([{
      ...transaction,
      date: transaction.date
    }])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateTransaction(id: string, updates: Partial<Transaction>) {
  const { data, error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteTransaction(id: string) {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Metas
export async function getGoals(userId: string): Promise<Goal[]> {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function createGoal(goal: Omit<Goal, 'id' | 'created_at' | 'updated_at'> & { user_id: string }) {
  const { data, error } = await supabase
    .from('goals')
    .insert([goal])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateGoal(id: string, updates: Partial<Goal>) {
  const { data, error } = await supabase
    .from('goals')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteGoal(id: string) {
  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Lembretes
export async function getReminders(userId: string): Promise<Reminder[]> {
  const { data, error } = await supabase
    .from('reminders')
    .select('*')
    .eq('user_id', userId)
    .order('due_date', { ascending: true })

  if (error) throw error
  return data || []
}

export async function createReminder(reminder: Omit<Reminder, 'id' | 'created_at' | 'updated_at'> & { user_id: string }) {
  const { data, error } = await supabase
    .from('reminders')
    .insert([reminder])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateReminder(id: string, updates: Partial<Reminder>) {
  const { data, error } = await supabase
    .from('reminders')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteReminder(id: string) {
  const { error } = await supabase
    .from('reminders')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Perfil do usuário
export async function createProfile(userId: string, email: string, fullName?: string) {
  const { data, error } = await supabase
    .from('profiles')
    .insert([{
      id: userId,
      email,
      full_name: fullName
    }])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}