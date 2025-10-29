'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Target, Bell, Download, Calendar, DollarSign, PieChart, BarChart3, AlertTriangle, LogOut, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/hooks/useAuth'
import AuthComponent from '@/components/AuthComponent'
import AddTransactionDialog from '@/components/AddTransactionDialog'
import { Transaction, Goal, Reminder } from '@/lib/types'
import { getTransactions, getGoals, getReminders, createGoal, createReminder, updateReminder, createProfile } from '@/lib/database'

export default function FluxApp() {
  const { user, loading, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false)
  const [isAddReminderOpen, setIsAddReminderOpen] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(false)

  // Estados para formulários
  const [goalForm, setGoalForm] = useState({
    title: '',
    target_amount: '',
    deadline: ''
  })

  const [reminderForm, setReminderForm] = useState({
    title: '',
    description: '',
    amount: '',
    due_date: '',
    category: ''
  })

  // Carregar dados do usuário
  const loadUserData = async () => {
    if (!user) return

    setIsLoadingData(true)
    try {
      const [transactionsData, goalsData, remindersData] = await Promise.all([
        getTransactions(user.id),
        getGoals(user.id),
        getReminders(user.id)
      ])

      setTransactions(transactionsData)
      setGoals(goalsData)
      setReminders(remindersData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setIsLoadingData(false)
    }
  }

  // Criar perfil do usuário se não existir
  useEffect(() => {
    if (user) {
      createProfile(user.id, user.email || '', user.user_metadata?.full_name)
        .catch(() => {}) // Ignora erro se perfil já existe
      loadUserData()
    }
  }, [user])

  // Cálculos financeiros
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpenses

  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount
      return acc
    }, {} as Record<string, number>)

  const categories = Object.keys(expensesByCategory)

  // Handlers
  const handleTransactionAdded = () => {
    loadUserData()
  }

  const handleCreateGoal = async () => {
    if (!user || !goalForm.title || !goalForm.target_amount || !goalForm.deadline) return

    try {
      await createGoal({
        title: goalForm.title,
        target_amount: parseFloat(goalForm.target_amount),
        current_amount: 0,
        deadline: goalForm.deadline,
        status: 'active',
        user_id: user.id
      })

      setGoalForm({ title: '', target_amount: '', deadline: '' })
      setIsAddGoalOpen(false)
      loadUserData()
    } catch (error) {
      console.error('Erro ao criar meta:', error)
      alert('Erro ao criar meta. Tente novamente.')
    }
  }

  const handleCreateReminder = async () => {
    if (!user || !reminderForm.title || !reminderForm.due_date || !reminderForm.category) return

    try {
      await createReminder({
        title: reminderForm.title,
        description: reminderForm.description,
        amount: parseFloat(reminderForm.amount) || 0,
        due_date: reminderForm.due_date,
        category: reminderForm.category,
        is_completed: false,
        user_id: user.id
      })

      setReminderForm({ title: '', description: '', amount: '', due_date: '', category: '' })
      setIsAddReminderOpen(false)
      loadUserData()
    } catch (error) {
      console.error('Erro ao criar lembrete:', error)
      alert('Erro ao criar lembrete. Tente novamente.')
    }
  }

  const handleMarkReminderAsPaid = async (reminderId: string) => {
    try {
      await updateReminder(reminderId, { is_completed: true })
      loadUserData()
    } catch (error) {
      console.error('Erro ao marcar lembrete como pago:', error)
      alert('Erro ao atualizar lembrete. Tente novamente.')
    }
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      minimumFractionDigits: 2 
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  // Auth state
  if (!user) {
    return <AuthComponent />
  }

  const AddGoalDialog = () => (
    <Dialog open={isAddGoalOpen} onOpenChange={setIsAddGoalOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-50">
          <Target className="w-4 h-4 mr-2" />
          Nova Meta
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-green-700">
            Criar Meta Financeira
          </DialogTitle>
          <DialogDescription>
            Defina uma meta financeira com prazo para alcançar seus objetivos
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Título da Meta</Label>
            <Input 
              placeholder="Ex: Viagem para Europa" 
              value={goalForm.title}
              onChange={(e) => setGoalForm(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="target">Valor Alvo</Label>
            <Input 
              type="number" 
              placeholder="0,00" 
              value={goalForm.target_amount}
              onChange={(e) => setGoalForm(prev => ({ ...prev, target_amount: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="deadline">Prazo</Label>
            <Input 
              type="date" 
              value={goalForm.deadline}
              onChange={(e) => setGoalForm(prev => ({ ...prev, deadline: e.target.value }))}
            />
          </div>
          <Button 
            onClick={handleCreateGoal}
            disabled={!goalForm.title || !goalForm.target_amount || !goalForm.deadline}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            Criar Meta
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )

  const AddReminderDialog = () => (
    <Dialog open={isAddReminderOpen} onOpenChange={setIsAddReminderOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-orange-200 text-orange-700 hover:bg-orange-50">
          <Bell className="w-4 h-4 mr-2" />
          Novo Lembrete
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-orange-700">
            Criar Lembrete
          </DialogTitle>
          <DialogDescription>
            Configure um lembrete para vencimentos de contas e faturas
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Título</Label>
            <Input 
              placeholder="Ex: Cartão de Crédito" 
              value={reminderForm.title}
              onChange={(e) => setReminderForm(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea 
              placeholder="Detalhes do lembrete..." 
              value={reminderForm.description}
              onChange={(e) => setReminderForm(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="amount">Valor</Label>
            <Input 
              type="number" 
              placeholder="0,00" 
              value={reminderForm.amount}
              onChange={(e) => setReminderForm(prev => ({ ...prev, amount: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="dueDate">Data de Vencimento</Label>
            <Input 
              type="date" 
              value={reminderForm.due_date}
              onChange={(e) => setReminderForm(prev => ({ ...prev, due_date: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="category">Categoria</Label>
            <Select 
              value={reminderForm.category} 
              onValueChange={(value) => setReminderForm(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cartão">Cartão de Crédito</SelectItem>
                <SelectItem value="Utilidades">Utilidades</SelectItem>
                <SelectItem value="Financiamento">Financiamento</SelectItem>
                <SelectItem value="Seguro">Seguro</SelectItem>
                <SelectItem value="Outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={handleCreateReminder}
            disabled={!reminderForm.title || !reminderForm.due_date || !reminderForm.category}
            className="w-full bg-orange-600 hover:bg-orange-700"
          >
            Criar Lembrete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Flux
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600 hidden sm:block">
                Olá, {user.email}
              </span>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Exportar PDF</span>
              </Button>
              <AddTransactionDialog onTransactionAdded={handleTransactionAdded} />
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoadingData ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-4" />
            <p className="text-gray-600">Carregando seus dados...</p>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full grid-cols-4 bg-white/50 backdrop-blur-sm">
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <BarChart3 className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="transactions" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <DollarSign className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Transações</span>
              </TabsTrigger>
              <TabsTrigger value="goals" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Target className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Metas</span>
              </TabsTrigger>
              <TabsTrigger value="reminders" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Bell className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Lembretes</span>
              </TabsTrigger>
            </TabsList>

            {/* Dashboard */}
            <TabsContent value="dashboard" className="space-y-6">
              {/* Cards de Resumo */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-green-700">Receitas</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-800">
                      {formatCurrency(totalIncome)}
                    </div>
                    <p className="text-xs text-green-600 mt-1">
                      Total de receitas
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-red-700">Despesas</CardTitle>
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-800">
                      {formatCurrency(totalExpenses)}
                    </div>
                    <p className="text-xs text-red-600 mt-1">
                      Total de despesas
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-blue-700">Saldo</CardTitle>
                    <DollarSign className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-800' : 'text-red-800'}`}>
                      {formatCurrency(balance)}
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                      {totalIncome > 0 ? `${((balance / totalIncome) * 100).toFixed(1)}% da receita` : 'Saldo atual'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Gráfico de Gastos por Categoria */}
              {categories.length > 0 && (
                <Card className="bg-white/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <PieChart className="w-5 h-5 mr-2" />
                      Gastos por Categoria
                    </CardTitle>
                    <CardDescription>
                      Distribuição percentual dos seus gastos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {categories.map((category, index) => {
                        const amount = expensesByCategory[category]
                        const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
                        
                        return (
                          <div key={category} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">{category}</span>
                              <span className="text-sm text-gray-600">
                                {formatCurrency(amount)} ({percentage.toFixed(1)}%)
                              </span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Alertas Importantes */}
              {reminders.filter(r => !r.is_completed).length > 0 && (
                <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
                  <CardHeader>
                    <CardTitle className="flex items-center text-orange-800">
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      Alertas Importantes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {reminders.filter(r => !r.is_completed).slice(0, 3).map(reminder => {
                        const daysUntilDue = Math.ceil((new Date(reminder.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                        const isOverdue = daysUntilDue < 0
                        
                        return (
                          <div key={reminder.id} className="flex items-center justify-between p-3 bg-white/70 rounded-lg">
                            <div>
                              <p className="font-medium text-orange-800">{reminder.title}</p>
                              <p className="text-sm text-orange-600">
                                {isOverdue ? `Venceu há ${Math.abs(daysUntilDue)} dias` : `Vence em ${daysUntilDue} dias`}
                              </p>
                            </div>
                            <Badge variant={isOverdue ? "destructive" : "secondary"}>
                              {formatCurrency(reminder.amount)}
                            </Badge>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Transações */}
            <TabsContent value="transactions" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Transações</h2>
                <AddTransactionDialog onTransactionAdded={handleTransactionAdded} />
              </div>
              
              <Card className="bg-white/50 backdrop-blur-sm">
                <CardContent className="p-0">
                  {transactions.length === 0 ? (
                    <div className="text-center py-12">
                      <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Nenhuma transação encontrada</p>
                      <p className="text-sm text-gray-500">Adicione sua primeira transação para começar</p>
                    </div>
                  ) : (
                    <div className="space-y-0">
                      {transactions.map(transaction => (
                        <div key={transaction.id} className="flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0">
                          <div className="flex items-center space-x-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                            }`}>
                              {transaction.type === 'income' ? (
                                <TrendingUp className="w-5 h-5 text-green-600" />
                              ) : (
                                <TrendingDown className="w-5 h-5 text-red-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{transaction.description}</p>
                              <p className="text-sm text-gray-600">{transaction.category} • {formatDate(transaction.date)}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold ${
                              transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {transaction.input_method}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Metas */}
            <TabsContent value="goals" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Metas Financeiras</h2>
                <AddGoalDialog />
              </div>

              {goals.length === 0 ? (
                <Card className="bg-white/50 backdrop-blur-sm">
                  <CardContent className="text-center py-12">
                    <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhuma meta encontrada</p>
                    <p className="text-sm text-gray-500">Crie sua primeira meta financeira</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {goals.map(goal => {
                    const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0
                    const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                    
                    return (
                      <Card key={goal.id} className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <span className="text-green-800">{goal.title}</span>
                            <Badge variant={goal.status === 'active' ? 'default' : 'secondary'}>
                              {goal.status === 'active' ? 'Ativa' : goal.status === 'completed' ? 'Concluída' : 'Pausada'}
                            </Badge>
                          </CardTitle>
                          <CardDescription>
                            {daysLeft > 0 ? `${daysLeft} dias restantes` : 'Prazo vencido'}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span>Progresso</span>
                              <span>{progress.toFixed(1)}%</span>
                            </div>
                            <Progress value={progress} className="h-3" />
                          </div>
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm text-gray-600">Atual</p>
                              <p className="font-bold text-green-700">
                                {formatCurrency(goal.current_amount)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">Meta</p>
                              <p className="font-bold text-green-800">
                                {formatCurrency(goal.target_amount)}
                              </p>
                            </div>
                          </div>
                          {progress < 100 && daysLeft > 0 && (
                            <div className="p-3 bg-blue-50 rounded-lg">
                              <p className="text-sm text-blue-700">
                                💡 Para atingir sua meta, economize {formatCurrency((goal.target_amount - goal.current_amount) / daysLeft)} por dia
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </TabsContent>

            {/* Lembretes */}
            <TabsContent value="reminders" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Lembretes</h2>
                <AddReminderDialog />
              </div>

              {reminders.length === 0 ? (
                <Card className="bg-white/50 backdrop-blur-sm">
                  <CardContent className="text-center py-12">
                    <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhum lembrete encontrado</p>
                    <p className="text-sm text-gray-500">Crie seu primeiro lembrete de vencimento</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {reminders.map(reminder => {
                    const daysUntilDue = Math.ceil((new Date(reminder.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                    const isOverdue = daysUntilDue < 0
                    const isDueSoon = daysUntilDue <= 3 && daysUntilDue >= 0
                    
                    return (
                      <Card key={reminder.id} className={`${
                        reminder.is_completed ? 'bg-gray-50 opacity-75' :
                        isOverdue ? 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200' :
                        isDueSoon ? 'bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200' :
                        'bg-white/50 backdrop-blur-sm'
                      }`}>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <span className={
                              reminder.is_completed ? 'text-gray-600 line-through' :
                              isOverdue ? 'text-red-800' : 
                              isDueSoon ? 'text-orange-800' : 
                              'text-gray-800'
                            }>
                              {reminder.title}
                            </span>
                            {reminder.is_completed && <Badge variant="secondary">Pago</Badge>}
                            {!reminder.is_completed && isOverdue && <Badge variant="destructive">Vencido</Badge>}
                            {!reminder.is_completed && isDueSoon && <Badge variant="secondary" className="bg-orange-100 text-orange-800">Urgente</Badge>}
                          </CardTitle>
                          <CardDescription>
                            {reminder.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Valor</span>
                            <span className="font-bold">
                              {formatCurrency(reminder.amount)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Vencimento</span>
                            <span className={`font-medium ${
                              reminder.is_completed ? 'text-gray-600' :
                              isOverdue ? 'text-red-600' : 
                              isDueSoon ? 'text-orange-600' : 
                              'text-gray-800'
                            }`}>
                              {formatDate(reminder.due_date)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Categoria</span>
                            <Badge variant="outline">{reminder.category}</Badge>
                          </div>
                          {!reminder.is_completed && (
                            <Button 
                              size="sm" 
                              className="w-full mt-3"
                              variant={isOverdue ? "destructive" : isDueSoon ? "default" : "outline"}
                              onClick={() => handleMarkReminderAsPaid(reminder.id)}
                            >
                              Marcar como Pago
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}