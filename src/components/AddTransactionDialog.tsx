'use client'

import { useState, useRef } from 'react'
import { Plus, FileText, Mic, Camera, Loader2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { analyzeText, analyzeAudio, analyzeImage, TransactionAnalysis } from '@/lib/openai'
import { createTransaction } from '@/lib/database'
import { useAuth } from '@/hooks/useAuth'

interface AddTransactionDialogProps {
  onTransactionAdded: () => void
}

export default function AddTransactionDialog({ onTransactionAdded }: AddTransactionDialogProps) {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [inputMethod, setInputMethod] = useState<'text' | 'audio' | 'photo'>('text')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [analysis, setAnalysis] = useState<TransactionAnalysis | null>(null)
  const [textInput, setTextInput] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Formulário manual
  const [manualData, setManualData] = useState({
    type: '' as 'income' | 'expense' | '',
    amount: '',
    category: '',
    description: ''
  })

  const resetForm = () => {
    setInputMethod('text')
    setAnalysis(null)
    setTextInput('')
    setSelectedFile(null)
    setManualData({
      type: '',
      amount: '',
      category: '',
      description: ''
    })
  }

  const handleAnalyzeText = async () => {
    if (!textInput.trim()) return

    setIsAnalyzing(true)
    try {
      const result = await analyzeText(textInput)
      setAnalysis(result)
    } catch (error) {
      console.error('Erro na análise:', error)
      alert('Erro ao analisar o texto. Tente novamente.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setIsAnalyzing(true)
        
        try {
          const result = await analyzeAudio(audioBlob)
          setAnalysis(result)
        } catch (error) {
          console.error('Erro na análise do áudio:', error)
          alert('Erro ao analisar o áudio. Tente novamente.')
        } finally {
          setIsAnalyzing(false)
        }

        // Parar todas as tracks do stream
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Erro ao acessar microfone:', error)
      alert('Erro ao acessar o microfone. Verifique as permissões.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem.')
      return
    }

    setSelectedFile(file)
    setIsAnalyzing(true)

    try {
      const result = await analyzeImage(file)
      setAnalysis(result)
    } catch (error) {
      console.error('Erro na análise da imagem:', error)
      alert('Erro ao analisar a imagem. Tente novamente.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSaveTransaction = async () => {
    if (!user) return

    const transactionData = analysis ? {
      type: analysis.type,
      amount: analysis.amount,
      category: analysis.category,
      description: analysis.description,
      date: new Date().toISOString().split('T')[0],
      input_method: inputMethod,
      ai_analysis: analysis,
      user_id: user.id
    } : {
      type: manualData.type as 'income' | 'expense',
      amount: parseFloat(manualData.amount),
      category: manualData.category,
      description: manualData.description,
      date: new Date().toISOString().split('T')[0],
      input_method: 'text' as const,
      user_id: user.id
    }

    if (!transactionData.type || !transactionData.amount || !transactionData.category) {
      alert('Por favor, preencha todos os campos obrigatórios.')
      return
    }

    setIsSaving(true)
    try {
      await createTransaction(transactionData)
      onTransactionAdded()
      setIsOpen(false)
      resetForm()
    } catch (error) {
      console.error('Erro ao salvar transação:', error)
      alert('Erro ao salvar a transação. Tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open)
      if (!open) resetForm()
    }}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
          <Plus className="w-4 h-4 mr-2" />
          Nova Transação
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Adicionar Transação
          </DialogTitle>
          <DialogDescription>
            Registre uma nova receita ou despesa usando texto, áudio ou foto com análise de IA
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Seletor de método de entrada */}
          <div className="flex gap-2">
            <Button 
              variant={inputMethod === 'text' ? 'default' : 'outline'} 
              className="flex-1"
              onClick={() => setInputMethod('text')}
            >
              <FileText className="w-4 h-4 mr-2" />
              Texto
            </Button>
            <Button 
              variant={inputMethod === 'audio' ? 'default' : 'outline'} 
              className="flex-1"
              onClick={() => setInputMethod('audio')}
            >
              <Mic className="w-4 h-4 mr-2" />
              Áudio
            </Button>
            <Button 
              variant={inputMethod === 'photo' ? 'default' : 'outline'} 
              className="flex-1"
              onClick={() => setInputMethod('photo')}
            >
              <Camera className="w-4 h-4 mr-2" />
              Foto
            </Button>
          </div>

          {/* Interface baseada no método selecionado */}
          {inputMethod === 'text' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="textInput">Descreva sua transação</Label>
                <Textarea
                  id="textInput"
                  placeholder="Ex: Paguei R$ 45,90 no almoço no restaurante italiano"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <Button 
                onClick={handleAnalyzeText} 
                disabled={!textInput.trim() || isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  'Analisar com IA'
                )}
              </Button>
            </div>
          )}

          {inputMethod === 'audio' && (
            <div className="space-y-4">
              <Card className="p-6 text-center">
                <div className="space-y-4">
                  <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
                    isRecording ? 'bg-red-100 animate-pulse' : 'bg-blue-100'
                  }`}>
                    <Mic className={`w-8 h-8 ${isRecording ? 'text-red-600' : 'text-blue-600'}`} />
                  </div>
                  <div>
                    <p className="font-medium">
                      {isRecording ? 'Gravando...' : 'Pronto para gravar'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {isRecording ? 'Fale sobre sua transação' : 'Clique para começar a gravar'}
                    </p>
                  </div>
                  <Button
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isAnalyzing}
                    variant={isRecording ? 'destructive' : 'default'}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analisando...
                      </>
                    ) : isRecording ? (
                      'Parar Gravação'
                    ) : (
                      'Iniciar Gravação'
                    )}
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {inputMethod === 'photo' && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Card className="p-6 text-center">
                <div className="space-y-4">
                  {selectedFile ? (
                    <div className="space-y-2">
                      <img
                        src={URL.createObjectURL(selectedFile)}
                        alt="Preview"
                        className="max-w-full max-h-48 mx-auto rounded-lg"
                      />
                      <p className="text-sm text-gray-600">{selectedFile.name}</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                        <Upload className="w-8 h-8 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Selecione uma imagem</p>
                        <p className="text-sm text-gray-600">
                          Foto de recibo, comprovante ou nota fiscal
                        </p>
                      </div>
                    </>
                  )}
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isAnalyzing}
                    variant="outline"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analisando...
                      </>
                    ) : (
                      <>
                        <Camera className="w-4 h-4 mr-2" />
                        {selectedFile ? 'Trocar Imagem' : 'Selecionar Imagem'}
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* Resultado da análise de IA */}
          {analysis && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-green-800">Análise da IA</h4>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {(analysis.confidence * 100).toFixed(0)}% confiança
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Tipo:</span>
                      <p className="font-medium">{analysis.type === 'income' ? 'Receita' : 'Despesa'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Valor:</span>
                      <p className="font-medium">R$ {analysis.amount.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Categoria:</span>
                      <p className="font-medium">{analysis.category}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Descrição:</span>
                      <p className="font-medium">{analysis.description}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Formulário manual (quando não há análise) */}
          {!analysis && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Tipo</Label>
                  <Select value={manualData.type} onValueChange={(value: 'income' | 'expense') => 
                    setManualData(prev => ({ ...prev, type: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Receita</SelectItem>
                      <SelectItem value="expense">Despesa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amount">Valor</Label>
                  <Input 
                    type="number" 
                    placeholder="0,00" 
                    value={manualData.amount}
                    onChange={(e) => setManualData(prev => ({ ...prev, amount: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="category">Categoria</Label>
                <Select value={manualData.category} onValueChange={(value) => 
                  setManualData(prev => ({ ...prev, category: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Alimentação">Alimentação</SelectItem>
                    <SelectItem value="Transporte">Transporte</SelectItem>
                    <SelectItem value="Saúde">Saúde</SelectItem>
                    <SelectItem value="Educação">Educação</SelectItem>
                    <SelectItem value="Lazer">Lazer</SelectItem>
                    <SelectItem value="Casa">Casa</SelectItem>
                    <SelectItem value="Roupas">Roupas</SelectItem>
                    <SelectItem value="Salário">Salário</SelectItem>
                    <SelectItem value="Freelance">Freelance</SelectItem>
                    <SelectItem value="Investimentos">Investimentos</SelectItem>
                    <SelectItem value="Vendas">Vendas</SelectItem>
                    <SelectItem value="Outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea 
                  placeholder="Descreva a transação..." 
                  value={manualData.description}
                  onChange={(e) => setManualData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </div>
          )}

          {/* Botão de salvar */}
          <Button 
            onClick={handleSaveTransaction}
            disabled={isSaving || (!analysis && (!manualData.type || !manualData.amount || !manualData.category))}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar Transação'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}